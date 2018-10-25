package com.webapp.firstwebapp.services;

import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.BiFunction;
import java.util.function.Function;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;
import javax.persistence.NoResultException;
import javax.persistence.NonUniqueResultException;
import javax.persistence.Persistence;
import javax.persistence.TypedQuery;

import com.webapp.firstwebapp.interfaces.HasId;
import com.webapp.firstwebapp.interfaces.Terminatable;
import com.webapp.firstwebapp.model.Event;
import com.webapp.firstwebapp.model.Format;
import com.webapp.firstwebapp.model.OperationResult;
import com.webapp.firstwebapp.model.OperationResult.ResultState;
import com.webapp.firstwebapp.model.User;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;

public class DatabaseService extends Resource implements AutoCloseable
{
	private EntityManagerFactory emf;
    private String rangeVariable = "i";
	
	public DatabaseService(String logPath)
	{
		super(logPath);
		emf = Persistence.createEntityManagerFactory("/root/evee-database.odb");
	}
	
	public void testFunc(Function<Event,Event> func, Event input)
	{
		System.out.println(func.apply(input).toString());
	}
	
	@Override
	public void close() throws Exception
	{
		emf.close();
	}

	public enum KeyType
	{
		NUMBER, STRING
	}
	
	// Fetches all the entities of a given type from the database
	public <T> OperationResult<List<T>> getAllItems(Class<T> itemType)
	{
		String methodName = "getAllItems";
		OperationResult<List<T>> result = new OperationResult<List<T>>();
		String itemTypeName = itemType.getSimpleName();
		EntityManager em = null;
		List<T> items;
		try
		{
			em = emf.createEntityManager();
			log(methodName, "Fetching all " + itemTypeName + "s", LogType.INFO);
			TypedQuery<T> query = em.createQuery("SELECT i FROM " + itemTypeName + " i", itemType);
			items = query.getResultList();
		    log(methodName, items.size() + " " + itemTypeName + "s were fetched", LogType.INFO);
		    result.setObjectToReturn(items);
		    result.setResultState(ResultState.SUCCESS);
		    return result;
		}
		catch(Exception e)
		{
			String errorMessage = "Fetching all items failed:\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setErrorMessage(errorMessage);
			result.setResultState(ResultState.FAILIURE);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	// Fetches a certain entity object from the database, by a given primary key
	public <T extends HasId> OperationResult<T> getItem(Class<T> itemType, KeyType itemKeyType, String itemKeyName, Object itemKeyValue)
	{
		String methodName = "getItem";
		OperationResult<T> result = new OperationResult<T>();
		String itemTypeName = itemType.getSimpleName();
		String errorMessage;
		EntityManager em = null;
		try
		{
			em = emf.createEntityManager();
			String queryAsString = createFetchQuery(itemTypeName, itemKeyType, itemKeyName, itemKeyValue);
//			log(methodName, "running query: " + queryAsString, LogType.INFO);
			TypedQuery<T> query = em.createQuery(queryAsString, itemType);
			T item = query.getSingleResult();
			log(methodName, itemTypeName + " #" + item.getId() + " was fetched", LogType.INFO);
			result.setResultState(ResultState.SUCCESS);
			result.setObjectToReturn(item);
			return result;
		}
		catch (NoResultException nre)
		{
			errorMessage = "No result was found in the database for " + itemTypeName + " #" + itemKeyValue;
			log(methodName, errorMessage, LogType.INFO);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		catch (NonUniqueResultException nue)
		{
			errorMessage = "Multiple results returned in the query for " + itemTypeName + " #" + itemKeyValue;
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		catch (Exception e)
		{
			errorMessage = "Fetching " + itemTypeName + " with " + itemKeyName + '=' + itemKeyValue + " has failed:\n" + e.getMessage();
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	// Stores a new entity object of a given type to the database
	public <T extends HasId> OperationResult<T> addItem(Class<T> itemType, T newItem)
	{
		String methodName = "addItem";
		OperationResult<T> result = new OperationResult<T>();
		String itemTypeName = itemType.getSimpleName();
		EntityManager em = null;
		try
		{
			int newItemId;
			em = emf.createEntityManager();
			if(!em.contains(newItem))
			{
				// Store the item
				EntityTransaction transaction = em.getTransaction();
				transaction.begin();
				em.persist(newItem);
				transaction.commit();
				
				// Get its new auto-generated id
				transaction.begin();
				newItemId = em.find(itemType, newItem).getId();
				transaction.rollback();
				
				log(methodName, itemTypeName + " #" + newItemId + " was added to the database", LogType.INFO);
				result.setResultState(ResultState.SUCCESS);
				result.setObjectToReturn(newItem);
				return result;
			}
			else
			{
				result.setResultState(ResultState.FAILIURE);
				result.setErrorMessage(itemTypeName + " #" + newItem.getId() + " already exists in the database");
				return result;
			}
		} 
		catch (Exception e)
		{
			String errorMessage = "Add " + itemTypeName + " was failed:\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	// Removes an entity object of a from the database 
	public <T extends Terminatable> void deleteItem(Class<T> itemType, int itemId)
	{
		String methodName = "deleteItem";
		String itemTypeName = itemType.getSimpleName();
		EntityManager em = null;
		try
		{
			em = emf.createEntityManager();
			EntityTransaction transaction = em.getTransaction();
			String queryResult;
			transaction.begin();
			
			// Fetch relevant entity
			T item = em.find(itemType, itemId);
			if(item == null)
			{
				queryResult = " was not found";
				transaction.rollback();
			}
			else
			{
				// Delete the entity
				item.terminate();
				em.remove(item);
				queryResult = " was removed from the database";
				transaction.commit();
			}
			log(methodName, itemTypeName + " #" + itemId + queryResult, LogType.INFO);	
		}
		catch(Exception e)
		{
			log(methodName, "Delete item failed:\n" + e.getMessage(), LogType.SEVERE);
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	// Removes all the entities of a given type from the database
	public <T extends Terminatable> void deleteAllItems(Class<T> itemsType)
	{
		deleteItems(itemsType, false, null);
	}
	
	// Removes all the inactive events
	public OperationResult<Integer> deleteInactiveEvents()
	{
		String whereClause = rangeVariable + ".isActive = false";
		return deleteItems(Event.class, true, whereClause);
	}
	
	// Removes all past events
	public OperationResult<Integer> deletePastEvents()
	{
		String whereClause = rangeVariable + ".date < CURRENT_TIMESTAMP";
		return deleteItems(Event.class, true, whereClause);
	}
	
	// Removes all entities of a given type, according to some conditions (if included)
	private <T extends Terminatable> OperationResult<Integer> deleteItems(Class<T> itemsType, boolean hasWhereClause, String whereClause)
	{
		String methodName = "deleteAllItems";
		OperationResult<Integer> result = new OperationResult<Integer>();
		String itemTypeName = itemsType.getSimpleName();
		EntityManager em = null;
		try
		{
			String queryExceptFirstClause = "from " + itemTypeName;
			if(hasWhereClause)
			{
				queryExceptFirstClause = queryExceptFirstClause + " " + rangeVariable + " WHERE " + whereClause;
			}
			
			em = emf.createEntityManager();
			EntityTransaction trans = em.getTransaction();
			trans.begin();
			
			// Fetch all relevant entities
			TypedQuery<T> query = em.createQuery("SELECT " + queryExceptFirstClause, itemsType);
			List<T> items = query.getResultList();
			
			// Prepare each one for deletion
			for(T item : items)
			{
				item.terminate();
			}
			trans.commit();

			// Delete the entities			
			trans.begin();
			em.createQuery("DELETE " + queryExceptFirstClause).executeUpdate();
			trans.commit();
			result.setResultState(ResultState.SUCCESS);
			result.setObjectToReturn(items.size()); // Using size property because orphan removal does not affect the value returning from executeUpdate
			return result;
		}
		catch(Exception e)
		{
			String errorMessage = "Deleting items failed:\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	// Stores a new event to the database
	public OperationResult<Event> addEvent(int owner_id, Event newEvent, BiConsumer<Event, User> eventMethod, BiConsumer<User, Event> userMethod)
	{
		String methodName = "addEvent";
		OperationResult<Event> result = new OperationResult<Event>();
		EntityManager em = null;
		try
		{
			int newEventId;
			em = emf.createEntityManager();
			EntityTransaction transaction = em.getTransaction();
			transaction.begin();
			User eventOwner = em.find(User.class, owner_id);
			eventMethod.accept(newEvent, eventOwner);
			userMethod.accept(eventOwner, newEvent);
			transaction.commit();
			
			transaction.begin();
			eventOwner = em.find(User.class, owner_id);
			List<Event> ownedEvents = eventOwner.getOwnedEvents(); 
			newEventId = ownedEvents.get(ownedEvents.size() - 1).getId();
			transaction.rollback();
			log(methodName, "Event #" + newEventId + " was added to the database", LogType.INFO);
			result.setResultState(ResultState.SUCCESS);
			return result;
		} 
		catch (Exception e)
		{
			String errorMessage = "Add event named " + newEvent.getName() + " was failed:\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	public OperationResult<Event> closeEvent(int eventId, int ownerId)
	{
		String errorMessage = "Close event #" + eventId + " was failed";
		return changeEvent(eventId, ownerId, (Event event, User owner) -> event.close(owner), errorMessage);
	}
	
	public OperationResult<Event> subscribeUserToEvent(int eventId, int userId)
	{
		String errorMessage = "Failed subscribing user #" + userId + "to event #" + eventId;
		return changeEvent(eventId, userId, (Event event, User userToSubscribe) -> event.subscribeUser(userToSubscribe), errorMessage);
	}
	
	public OperationResult<Event> unSubscribeUserToEvent(int eventId, int userId)
	{
		String errorMessage = "Failed unsubscribing user #" + userId + "from event #" + eventId;
		return changeEvent(eventId, userId, (Event event, User userToUnsubscribe) -> event.unSubscribeUser(userToUnsubscribe), errorMessage);
	}
	
	// Changes the state of a certain event by a given method
	private <T> OperationResult<Event> changeEvent(int eventId, int userId, BiFunction<Event, User, OperationResult<Event>> eventMethod, String errorMessage)
	{
		String methodName = "changeEvent";
		OperationResult<Event> result = new OperationResult<Event>();
		EntityManager em = null;
		try
		{
			em = emf.createEntityManager();
			EntityTransaction transaction = em.getTransaction();
			transaction.begin();
			OperationResult<Boolean> validateResult = validateUserAndEvent(em, eventId, userId);
			boolean validDetails = validateResult.getObjectToReturn(); 
			if(validDetails)
			{
				Event event = em.find(Event.class, eventId);
				User user = em.find(User.class, userId);
				result = eventMethod.apply(event, user);
				transaction.commit();
			}
			else
			{
				result.setResultState(ResultState.FAILIURE);
				result.setErrorMessage(validateResult.getErrorMessage());
				transaction.rollback();
			}
			return result;
		} 
		catch (Exception e)
		{
			errorMessage = errorMessage + "\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	// Fetches the events that a user has been subscribed to but were closed by their owners
	public OperationResult<List<Event>> getClosedSubscribedEvents(int userId)
	{
		String methodName = "getClosedSubscribedEvents";
		OperationResult<List<Event>> result = new OperationResult<List<Event>>();
		EntityManager em = null;
		try
		{
			em = emf.createEntityManager();
			EntityTransaction transaction = em.getTransaction();
			transaction.begin();
			OperationResult<User> userResult = findUser(em, userId); 
			User existingUser = userResult.getObjectToReturn();
			if(existingUser != null)
			{
				result.setResultState(ResultState.SUCCESS);
				result.setObjectToReturn(existingUser.getClosedSubscribedEvents());
				transaction.commit();
			}
			else
			{
				result.setResultState(ResultState.FAILIURE);
				result.setErrorMessage(userResult.getErrorMessage());				
				transaction.rollback();
			}
			return result;
		}
		catch (Exception e)
		{
			String errorMessage = "Failed getting closed subscribed events of user #" + userId + " :\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	public Format getFormatBySubCategory(String formatSubCategory)
	{
		String methodName = "getFormatBySubCategory";
		EntityManager em = null;
		try
		{
			em = emf.createEntityManager();
			TypedQuery<Format> query = em.createQuery("SELECT i FROM Format i WHERE i.subCategory = :subCategory", Format.class);
			query.setParameter("subCategory", formatSubCategory);
			Format format = query.getSingleResult();
			log(methodName, "Format #" + format.getId() + " was fetched", LogType.INFO);
			return format;
		}
		catch (Exception e)
		{
			log(methodName, "Format of " + formatSubCategory + " was not found:\n" + e.getMessage(), LogType.INFO);
			return null;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	public OperationResult<User> getUser(String username, String email)
	{
		String methodName = "getUser";
		OperationResult<User> result = new OperationResult<User>();
		EntityManager em = null;
		User fechedUser = null;
		try
		{
			em = emf.createEntityManager();
			TypedQuery<User> query = em.createQuery("SELECT i FROM User i WHERE i.username = '" + username + "' AND i.email = '" + email + "'", User.class);
			fechedUser = query.getSingleResult();
			log(methodName, "User #" + fechedUser.getId() + " was fetched", LogType.INFO);
			result.setResultState(ResultState.SUCCESS);
			result.setObjectToReturn(fechedUser);
			return result;
		}
		catch(NonUniqueResultException nure)
		{
			String errorMessage = "There's more than one user with username = " + username + " and email = "+ email; 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		catch(Exception e)
		{
			String errorMessage = "Failed getting user with username = " + username + " and email = "+ email + '\n' + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	public OperationResult<User> doesUserExists(User user)
	{
		String methodName = "doesUserExists";
		OperationResult<User> result = new OperationResult<User>();
		EntityManager em = null;
		try
		{
			em = emf.createEntityManager();
			String queryAsString = createFindUserQueryAsString(user.getUsername(),user.getEmail());
			TypedQuery<User> query = em.createQuery(queryAsString, User.class);
			List<User> queryResult = query.getResultList();
			if(queryResult.size() == 0)
			{
				result.setResultState(ResultState.SUCCESS);
				result.setObjectToReturn(null);
			}
			else
			{
				result.setResultState(ResultState.SUCCESS);
				result.setObjectToReturn(queryResult.get(0));
			}
			return result;
		}
		catch(Exception e)
		{
			String errorMessage = "Checking if user exists failed:\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	public OperationResult<User> doesUserExists(int userId)
	{
		String methodName = "doesUserExists";
		OperationResult<User> result = new OperationResult<User>();
		EntityManager em = null;
		try
		{
			em = emf.createEntityManager();			
			return findUser(em, userId);
		}
		catch(Exception e)
		{
			String errorMessage = "Checking if user exists failed:\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	private OperationResult<User> findUser(EntityManager em, int userId)
	{
		String methodName = "doesUserExists";
		OperationResult<User> result = new OperationResult<User>();
		try
		{
			User user = em.find(User.class, userId);
			if(user != null)
			{
				result.setResultState(ResultState.SUCCESS);
				result.setObjectToReturn(user);
			}
			else
			{
				result.setResultState(ResultState.FAILIURE);
				result.setObjectToReturn(null);
				result.setErrorMessage("User #" + userId + " does not exist in the database");
			}
			return result;
		}
		catch(Exception e)
		{
			String errorMessage = "Checking if user exists failed:\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			return result;
		}
	}
	
	// Fetches all the events that are active and haven't occured yed 
	public OperationResult<List<Event>> getAllActiveEvents()
	{
		String methodName = "getAllActiveEvents";
		OperationResult<List<Event>> result = new OperationResult<List<Event>>();
		EntityManager em = null;
		List<Event> events;
		try
		{
			em = emf.createEntityManager();
			log(methodName, "Fetching all active events", LogType.INFO);
			TypedQuery<Event> query = em.createQuery(
					  "SELECT i FROM Event i "
					+ "WHERE i.isActive = true AND i.isFull = false AND i.date >= CURRENT_TIMESTAMP", Event.class);
			events = query.getResultList();
		    log(methodName, events.size() + " active events were fetched", LogType.INFO);
		    result.setObjectToReturn(events);
		    result.setResultState(ResultState.SUCCESS);
		    return result;
		}
		catch(Exception e)
		{
			String errorMessage = "Fetching all active events failed:\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			result.setErrorMessage(errorMessage);
			result.setResultState(ResultState.FAILIURE);
			return result;
		}
		finally
		{
			closeEntityManager(em);
		}
	}
	
	// Returns true if both user and event exists in the database
	private OperationResult<Boolean> validateUserAndEvent(EntityManager em, int eventId, int userId)
	{
		String methodName = "validateUserAndEvent";
		OperationResult<Boolean> result = new OperationResult<Boolean>();
		result.setObjectToReturn(true);
		Event event = em.find(Event.class, eventId);
		User user = em.find(User.class, userId);
		String errorMessage;
		if(event == null)
		{
			errorMessage = "Event #" + eventId + " does not exist in the database";
			log(methodName, errorMessage, LogType.INFO);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			result.setObjectToReturn(false);
		}
		if(user == null)
		{
			errorMessage = "User #" + userId + " does not exist in the database";
			log(methodName, errorMessage, LogType.INFO);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
			result.setObjectToReturn(false);
		}
		return result;
	}
	
	private String createFetchQuery(String itemType, KeyType itemKeyType, String itemKeyName, Object itemKeyValue)
	{
		String query = "SELECT i FROM " + itemType + " i WHERE i." + itemKeyName + " = ";
		String ending = null;
		switch (itemKeyType)
		{
			case NUMBER:
				ending = itemKeyValue.toString();
				break;
			case STRING:
				ending = "'" + itemKeyValue + "'";
				break;
		}
		query = query.concat(ending);
		
		return query;
	}
	
	private String createFindUserQueryAsString(String username, String email)
	{
		return "SELECT i FROM User i WHERE i.username LIKE '" + username + "' AND i.email LIKE '" + email + "'";
	}
	
	private void closeEntityManager(EntityManager manager) {
		if(manager != null)
		{
			manager.close();	
		}
	}
	
	@SuppressWarnings("unused")
	private void printStackTrace()
	{
		System.out.println("Printing stack trace:");
		StackTraceElement[] elements = Thread.currentThread().getStackTrace();
		for (int i = 1; i < elements.length; i++) {
			StackTraceElement s = elements[i];
			System.out.println("\tat " + s.getClassName() + "." + s.getMethodName()
		        + "(" + s.getFileName() + ":" + s.getLineNumber() + ")");
		}
	}	
}
