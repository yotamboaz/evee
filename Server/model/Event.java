package com.webapp.firstwebapp.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Column;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.webapp.firstwebapp.interfaces.HasId;
import com.webapp.firstwebapp.interfaces.Terminatable;
import com.webapp.firstwebapp.model.OperationResult.ResultState;

@Entity
public class Event implements HasId, Terminatable
{
	@Id
	@GeneratedValue
	private int id;
	
	// The user that created this event (no event exists without an owner)
	@JsonIgnore
	@ManyToOne(cascade=CascadeType.PERSIST)
	private User owner;
	
	private int ownerId;
	private String name;
	private String category;
	private String subCategory;
	private long rawDate;
	@JsonIgnore private Date date;
	private Integer maxNumOfParticipants = 0;	// Remains 0 if user decides not to limit the number of participants
	private Integer currentNumOfParticipants = 0;
	
	@OneToOne(cascade=CascadeType.ALL)
	private Location location;

	// Indicates whether the event is active or closed
	@Column
	private Boolean isActive = true;
	
	// Indicates whether the maximum amount of participants has reached
	private Boolean isFull = false;
	
	@JsonIgnore
	@OneToMany(cascade=CascadeType.PERSIST, fetch=FetchType.EAGER)
	private List<User> subscribedUsers = new LinkedList<User>();
	
	@OneToMany(cascade=CascadeType.PERSIST, fetch=FetchType.EAGER) // try without this annotation
	private List<Integer> subscribedUsersIDs = new LinkedList<Integer>();
	
	@JsonIgnore
	@OneToMany(cascade=CascadeType.PERSIST, fetch=FetchType.EAGER)
	private List<User> subscribedUsersBeforeClosure = new LinkedList<User>();
	
	// Additional properties that varies depending on the event type (category)
	@OneToOne(cascade=CascadeType.PERSIST)
	private HashMap<String, Object> fields = new HashMap<>();
	
	public Event(){}
	
	public void initializeDate()
	{
		date = new Date(rawDate);
	}
	
	// When deleting an event, these are the required operations need to be done
//	@PreRemove
	@Override
	public void terminate()
	{
//		System.out.println("Event #" + id + " is terminating");
		owner.notifyOwnedEventDeletion(this);
		detachEventFromAllUsers();
	}
	
	// Unsubscribe all relevant users and detach from owner
	public void detachEventFromAllUsers()
	{
		for(User user : subscribedUsers)
		{
			user.notifySubscribedEventDeletion(this);
		}
		subscribedUsers.clear();
		subscribedUsersIDs.clear();
		for(User user : subscribedUsersBeforeClosure)
		{
			user.notifyClosedEventDeletion(this);
		}
		subscribedUsersBeforeClosure.clear();
		owner = null;
	}
	
	// An event owner can choose to close (cancel) the event he had created 
	public OperationResult<Event> close(int ownerId)
	{
		OperationResult<Event> result = new OperationResult<Event>();
		if(ownerId == this.ownerId)
		{
			result.setResultState(ResultState.SUCCESS);
			isActive = false;
			
			// A new list and two loops are used to prevent the ConcurrentModificationException
			List<User> subscribedUsersCopy = new ArrayList<User>(subscribedUsers.size());
			for(User user : subscribedUsers)
			{
				subscribedUsersCopy.add(user);
			}
			for(User user : subscribedUsersCopy)
			{
				this.subscribedUsersBeforeClosure.add(user);
				this.unSubscribeUser(user);
				user.notifySubscribedEventClosure(this);
			}
		}
		else
		{
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage("User #" + ownerId + " is not the owner of this event");
		}
		return result;
	}
	
	public OperationResult<Event> close(User owner)
	{
		return this.close(owner.getId());
	}
	
	// Subscribe a user to this event
	public <T> OperationResult<T> subscribeUser(User userToRegister)
	{
		OperationResult<T> result = new OperationResult<T>();
		if(userToRegister.getId() == ownerId)
		{
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage("The user " + userToRegister.getUsername() + " is the owner of the event");
		}
		else if(subscribedUsers.contains(userToRegister))
		{
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage("The user " + userToRegister.getUsername() + " is already subscribed to the event");
		}
		else
		{
			if(maxNumOfParticipants == 0 || currentNumOfParticipants < maxNumOfParticipants)
			{
				subscribedUsers.add(userToRegister);
				subscribedUsersIDs.add(userToRegister.getId());
				userToRegister.getSubscribedToEvents().add(this);
				currentNumOfParticipants++;
				if(currentNumOfParticipants == maxNumOfParticipants)
				{
					isFull = true;
				}
				result.setResultState(ResultState.SUCCESS);
			}
			else
			{
				result.setResultState(ResultState.FAILIURE);
				result.setErrorMessage("This event has maximum amount of participants already");
			}
		}
		return result;
	}
	
	// Unsubscribe a user from this event
	public <T> OperationResult<T> unSubscribeUser(User userToUnsubscribe)
	{
		OperationResult<T> result = new OperationResult<T>();
		if(subscribedUsers.contains(userToUnsubscribe))
		{
			subscribedUsers.remove(userToUnsubscribe);
			subscribedUsersIDs.remove((Integer)userToUnsubscribe.getId()); // The cast is necessary to get to the right remove overload (that accepts Object, and not index) 
			userToUnsubscribe.getSubscribedToEvents().remove(this);
			currentNumOfParticipants--;
			if(currentNumOfParticipants < maxNumOfParticipants)
			{
				isFull = false;
			}
			result.setResultState(ResultState.SUCCESS);
		}
		else
		{
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage("The user " + userToUnsubscribe.getUsername() + " was not subscribed to the event");
		}
		return result;
	}
	
	@Override
    public String toString()
	{
		StringBuilder sb = new StringBuilder();
		sb.append("Name: ").append(name).append('\n');
		sb.append("Category: ").append(category).append('\n');
		sb.append("Sub-category: ").append(subCategory).append('\n');
		sb.append("Date: ").append(date).append('\n');
		sb.append("Maximum number of participants: ").append(maxNumOfParticipants).append('\n');
		sb.append("Current number of participants: ").append(currentNumOfParticipants).append('\n');
		sb.append("Location: ").append(location).append('\n');
		sb.append("Active: ").append(isActive).append('\n');
		sb.append("Full: ").append(isFull).append('\n');
		if(fields != null)
		{
			sb.append("fields:\n");
			for (String field : fields.keySet())
			{
				Object value = fields.get(field);
				sb.append(field).append(": ").append(value).append('\n');
			}	
		}				
        return String.format("Event #%d:\n%s", this.id, sb.toString());
    }
	
	public int getId() 
	{
		return id;
	}
	
	public void setId(int id) 
	{
		this.id = id;
	}
	
	public User getOwner() {
		return owner;
	}

	public void setOwner(User owner) {
		this.owner = owner;
	}

	public HashMap<String, Object> getFields() {
		return fields;
	}

	public void setFields(HashMap<String, Object> information) {
		this.fields = information;
	}
	
	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}
	
	public Boolean getIsFull() {
		return isFull;
	}

	public void setIsFull(Boolean isFull) {
		this.isFull = isFull;
	}
	
	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	@JsonProperty("sub_category")
	public String getSubCategory() {
		return subCategory;
	}

	public void setSubCategory(String subCategory) {
		this.subCategory = subCategory;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public Location getLocation() {
		return location;
	}

	public void setLocation(Location location) {
		this.location = location;
	}

	@JsonProperty("max_num_of_participants")
	public Integer getMaxNumOfParticipants() {
		return maxNumOfParticipants;
	}

	public void setMaxNumOfParticipants(Integer maxNumOfParticipants) {
		this.maxNumOfParticipants = maxNumOfParticipants;
	}

	@JsonProperty("raw_date")
	public long getRawDate() {
		return rawDate;
	}

	public void setRawDate(long rawDate) {
		this.rawDate = rawDate;
	}
	
	@JsonProperty("owner_id")
	public int getOwnerId() {
		return ownerId;
	}

	public void setOwnerId(int ownerId) {
		this.ownerId = ownerId;
	}

	@JsonProperty("subscribed_users")
	public List<User> getSubscribedUsers() {
		return subscribedUsers;
	}

	public void setSubscribedUsers(List<User> subscribedUsers) {
		this.subscribedUsers = subscribedUsers;
	}

	@JsonProperty("current_num_of_participants")
	public Integer getCurrentNumOfParticipants() {
		return currentNumOfParticipants;
	}

	public void setCurrentNumOfParticipants(Integer currentNumOfParticipants) {
		this.currentNumOfParticipants = currentNumOfParticipants;
	}

	@JsonProperty("subscribed_users_ids")
	public List<Integer> getSubscribedUsersIDs() {
		return subscribedUsersIDs;
	}

	public void setSubscribedUsersIDs(List<Integer> subscribedUsersIDs) {
		this.subscribedUsersIDs = subscribedUsersIDs;
	}	
}
