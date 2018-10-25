package com.webapp.firstwebapp.model;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.webapp.firstwebapp.interfaces.HasId;
import com.webapp.firstwebapp.interfaces.Terminatable;

@Entity
public class User implements HasId, Terminatable
{
	@Id
	@GeneratedValue
	private int id;
	
	private String username;
	private String email;
	
	// A list of the events the user has created
	@JsonIgnore
	@OneToMany(mappedBy="owner", orphanRemoval=true, cascade=CascadeType.ALL, fetch=FetchType.EAGER)
	private List<Event> ownedEvents = new LinkedList<Event>();
	
	// A list of the events the user has subscribed himself to
	@JsonIgnore
	@OneToMany(cascade=CascadeType.PERSIST, fetch=FetchType.EAGER)
	private List<Event> subscribedToEvents = new LinkedList<Event>();
	
	// A list of events the user was subscribed to but were closed by their owners
	// This list is used to notify the user about irrelevant events when he connects to the application
	@JsonIgnore
	@OneToMany(cascade=CascadeType.PERSIST, fetch=FetchType.EAGER)
	private List<Event> closedSubscribedEvents = new LinkedList<Event>();
	
	public User() {}
	
	// When deleting a user, these are the required operations need to be done
//	@PreRemove
	@Override
	public void terminate()
	{
//		System.out.println("User #" + id + " is terminating");
		unsubscribeUserFromEventCollection(subscribedToEvents);
		unsubscribeUserFromEventCollection(closedSubscribedEvents);
		for(Event ownedEvent : ownedEvents)
		{
			ownedEvent.detachEventFromAllUsers();
		}
		ownedEvents.clear();
		subscribedToEvents.clear();
		closedSubscribedEvents.clear();
	}
	
	private void unsubscribeUserFromEventCollection(List<Event> events)
	{
		for(Event event : events)
		{
			event.unSubscribeUser(this);
		}
	}
	
	// This method is used when an event is about to be erased from the database,
	// as it's a bidirectional relationship
	public void removeEvent(Event eventToRemove)
	{
		// The event to remove is either in this collection
		ownedEvents.remove(eventToRemove);
		// or in those collections
		subscribedToEvents.remove(eventToRemove);
		closedSubscribedEvents.remove(eventToRemove);
	}
	
	// Operation to do when an owned event of this user gets deleted from the database 
	public void notifyOwnedEventDeletion(Event ownedEvent)
	{
		ownedEvents.remove(ownedEvent);
	}
	
	// Operation to do when an event this user has subscribed to gets deleted from the database
	public void notifySubscribedEventDeletion(Event subscribedEvent)
	{
		subscribedToEvents.remove(subscribedEvent);
	}
	
	// Operation to do when an event this user has subscribed to and was closed gets deleted from the database
	public void notifyClosedEventDeletion(Event closedEvent)
	{
		closedSubscribedEvents.remove(closedEvent);
	}
	
	// When closing an event with subscribed users, this method is used to update the relevant events collections
	public void notifySubscribedEventClosure(Event closedEvent)
	{
		subscribedToEvents.remove(closedEvent);
		closedSubscribedEvents.add(closedEvent);
	}
	
	// After showing a notification to the user about the events that were closed (using this events collection),
	// the list should be cleared so the message about those events won't show up more than once
	public List<Event> getClosedSubscribedEvents()
	{
		List<Event> closedSubscribedEventsCopy = new ArrayList<>(closedSubscribedEvents);
		unsubscribeUserFromEventCollection(closedSubscribedEvents);
		closedSubscribedEvents.clear();
		return closedSubscribedEventsCopy;
	}
	
	@Override
	public String toString() {
		return "User [id=" + id + ", username=" + username + ", email=" + email + "]";
	}
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String mail) {
		this.email = mail;
	}

	public List<Event> getOwnedEvents()
	{
		return ownedEvents;
	}
	
	@JsonIgnore
	public List<Event> getOwnedActiveEvents()
	{
		List<Event> ownedActiveEvents = new ArrayList<>();
		for(Event ownedEvent : ownedEvents)
		{
			if(ownedEvent.getIsActive())
			{
				ownedActiveEvents.add(ownedEvent);
			}
		}
		return ownedActiveEvents;
	}

	public void setOwnedEvents(List<Event> ownedEvents) {
		this.ownedEvents = ownedEvents;
	}

	public List<Event> getSubscribedToEvents() {
		return subscribedToEvents;
	}

	public void setSubscribedToEvents(List<Event> signedEvents) {
		this.subscribedToEvents = signedEvents;
	}
}
