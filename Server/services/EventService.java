package com.webapp.firstwebapp.services;

import java.io.IOException;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.firstwebapp.model.Event;
import com.webapp.firstwebapp.model.HasClosableResource;
import com.webapp.firstwebapp.model.OperationResult;
import com.webapp.firstwebapp.model.OperationResult.ResultState;
import com.webapp.firstwebapp.model.User;
import com.webapp.firstwebapp.services.DatabaseService.KeyType;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;

public class EventService extends HasClosableResource
{
	private UserService userService = new UserService(logPath);
	private ObjectMapper mapper = new ObjectMapper();
	private static String logPath;
	
	public EventService(String logPath)
	{
		super(logPath, "DatabaseService");
		EventService.logPath = logPath;
	}
	
	public enum EventsRequestOption
	{
		ALL_EVENTS, OPEN_EVENTS_ONLY
	}
	
	public OperationResult<List<Event>> getAllEvents(EventsRequestOption eventsRequestOption)
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			switch (eventsRequestOption)
			{
				case ALL_EVENTS:
				{
					return databaseService.getAllItems(Event.class);
				}
				case OPEN_EVENTS_ONLY:
				{
					return databaseService.getAllActiveEvents();
				}
				default:
				{
					OperationResult<List<Event>> result = new OperationResult<List<Event>>();
					result.setResultState(ResultState.FAILIURE);
					result.setErrorMessage("Failed getting all events due to a bad parameter - " + eventsRequestOption.toString());
					return result;
				}
			}
		}
		catch(Exception e)
		{
			return handleCloseFail("getAllEvents", e.getMessage());		
		}
	}
	
	public OperationResult<Event> getEventById(int eventId)
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.<Event>getItem(Event.class, KeyType.NUMBER, "id", String.valueOf(eventId));	
		}
		catch(Exception e)
		{
			// log("Get event by id #" + eventId + " failed:\n" + e.getMessage(), LogType.SEVERE);
			return handleCloseFail("getEventById", e.getMessage());
		}		
	}
	
	public OperationResult<List<Event>> getOwnersEvents(int owner_id)
	{
		return getEvents(owner_id, (User owner) -> owner.getOwnedEvents());
	}
	
	public OperationResult<List<Event>> getSubscribedEvents(int user_id)
	{
		return getEvents(user_id, (User user) -> user.getSubscribedToEvents());
	}
	
	private OperationResult<List<Event>> getEvents(int user_id, Function<User, List<Event>> eventsMethod)
	{
		String methodName = "getEvents";
		OperationResult<List<Event>> result = new OperationResult<List<Event>>();
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			OperationResult<User> fetchResult = databaseService.getItem(User.class, KeyType.NUMBER, "id", user_id);
			if(fetchResult.getResultState() == ResultState.SUCCESS)
			{
				User user = fetchResult.getObjectToReturn(); 
				List<Event> ownerEvents = eventsMethod.apply(user);
				result.setResultState(ResultState.SUCCESS);
				result.setObjectToReturn(ownerEvents);
				return result;
			}
			else
			{
				String errorMessage = "Failed getting owned events of user #" + user_id;
				log(methodName, errorMessage, LogType.SEVERE);
				result.setResultState(ResultState.FAILIURE);
				result.setErrorMessage(errorMessage);
				return result;
			}
		}
		catch(Exception e)
		{
			return handleCloseFail(methodName, e.getMessage());
		}
	}
	
	public OperationResult<List<Event>> getClosedSubscribedEvents(int user_id)
	{
		String methodName = "getClosedSubscribedEvents";
//		OperationResult<List<Event>> result = new OperationResult<List<Event>>();
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.getClosedSubscribedEvents(user_id);
		}
		catch(Exception e)
		{
			return handleCloseFail(methodName, e.getMessage());
		}
	}
	
	public OperationResult<Event> addEvent(String newEventAsJson)
	{
		String methodName = "addEvent";
		OperationResult<Event> result = new OperationResult<Event>();
		Event eventToAdd = createEventFromJson(newEventAsJson);
		if(eventToAdd != null)
		{
			try(DatabaseService databaseService = new DatabaseService(logPath))
			{
				int ownerId = eventToAdd.getOwnerId();
				User existingUser = userService.isRegisteredUser(ownerId).getObjectToReturn(); 
				if(existingUser != null)
				{
					result = databaseService.addEvent(ownerId, eventToAdd,
													 (Event newEvent, User owner) -> newEvent.setOwner(owner),
													 (User owner, Event newEvent) -> owner.getOwnedEvents().add(newEvent));					
				}
				else
				{
					String errorMessage = "Event named " + eventToAdd.getName() + " was not added, user #" + ownerId + " is not registered"; 
					log(methodName, errorMessage, LogType.INFO);
					result.setResultState(ResultState.FAILIURE);
					result.setErrorMessage(errorMessage);
				}
			}
			catch(Exception e)
			{
				return handleCloseFail(methodName, e.getMessage());
			}	
		}
		else
		{
			String errorMessage = "Failed creating an Event object from this given Json:\n" + newEventAsJson;
			log(methodName, errorMessage, LogType.SEVERE);
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
		}
		return result;
	}
	
	public OperationResult<Event> closeEvent(int eventId, int ownerId)
	{
		String methodName = "closeEvent";
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.closeEvent(eventId, ownerId);
		}
		catch(Exception e)
		{
			String errorMessage = "Failed to close event #" + eventId + ":\n" + e.getMessage();
			log(methodName, errorMessage, LogType.SEVERE);
			return handleCloseFail(methodName, errorMessage);
		}
	}
	
	public OperationResult<Event> subscribeUser(int eventId, int userId)
	{
		String methodName = "subscribeUser";
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
//			databaseService.changeItem(Event.class, eventId, Event::subscribeUser)
			OperationResult<Event> result = databaseService.subscribeUserToEvent(eventId, userId); 
			if(result.getResultState() == ResultState.FAILIURE)
			{
				log(methodName, result.getErrorMessage(), LogType.INFO);
			}
			return result;
		}
		catch(Exception e)
		{
			String errorMessage = "Failed to subscribe user #" + userId + " to event #" + eventId + ":\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			return handleCloseFail(methodName, errorMessage);
		}
	}
	
	public OperationResult<Event> unSubscribeUser(int eventId, int userId)
	{
		String methodName = "unSubscribeUser";
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			OperationResult<Event> result = databaseService.unSubscribeUserToEvent(eventId, userId); 
			if(result.getResultState() == ResultState.FAILIURE)
			{
				log(methodName, result.getErrorMessage(), LogType.INFO);
			}
			return result;
		}
		catch(Exception e)
		{
			String errorMessage = "Failed to unsubscribe user #" + userId + " to event #" + eventId + ":\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			return handleCloseFail(methodName, errorMessage);
		}
	}
	
	public void deleteEvent(int eventId)
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			databaseService.deleteItem(Event.class, eventId);	
		}
		catch(Exception e)
		{
			handleCloseFail("deleteEvent", e.getMessage());
		}
	}
	
	public void deleteAllEvents()
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			databaseService.deleteAllItems(Event.class);	
		}
		catch(Exception e)
		{
			handleCloseFail("deleteAllEvents", e.getMessage());
		}
	}
	
	public void deleteInactiveEvents()
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			databaseService.deleteInactiveEvents();
		}
		catch(Exception e)
		{
			handleCloseFail("deleteClosedEvents", e.getMessage());
		}
	}
	
	public void deletePastEvents()
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			databaseService.deletePastEvents();
		}
		catch(Exception e)
		{
			handleCloseFail("deletePastEvents", e.getMessage());
		}
	}
	
	private Event createEventFromJson(String newEventAsJson)
	{
		String methodName = "createEventFromJson";
		try
		{
			Event newEvent = new Event();
			newEvent = mapper.readValue(newEventAsJson, Event.class);
			newEvent.initializeDate();
			return newEvent;			
		}
		catch (JsonParseException e)
		{
			log(methodName, "Parsing new event failed:\n" + e.getMessage(), LogType.SEVERE);
			return null;
		}
		catch (JsonMappingException e)
		{
			log(methodName, "Mapping new event failed:\n" + e.getMessage(), LogType.SEVERE);
			return null;
		}
		catch (IOException e)
		{
			log(methodName, "Creating new event failed:\n" + e.getMessage(), LogType.SEVERE);
			return null;
		}
	}	
}