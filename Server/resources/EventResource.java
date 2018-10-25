package com.webapp.firstwebapp.resources;

import com.fasterxml.jackson.core.Version;
import com.webapp.firstwebapp.model.Event;
import com.webapp.firstwebapp.model.OperationResult;
import com.webapp.firstwebapp.model.OperationResult.ResultState;
import com.webapp.firstwebapp.services.EventService;
import com.webapp.firstwebapp.services.EventService.EventsRequestOption;
import com.webapp.firstwebapp.services.Resource;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


@Path("/events")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class EventResource extends Resource
{
	private static String logPath = "/root/ServerLogFiles/ServerLog.log";
	private EventService eventService;
	
	public EventResource()
	{
		super(logPath);
		eventService = new EventService(logPath);
	}

		
	// Methods below are self explanatory
	// ==================================
	
	@GET
	public String getAllActiveEvents()
	{
		String methodName = "getAllActiveEvents";
		log(methodName, "Getting all active events", LogType.INFO);
		OperationResult<List<Event>> result = eventService.getAllEvents(EventsRequestOption.OPEN_EVENTS_ONLY); 
		return operationResultToJson(methodName, result, "events");
	}
	
	@GET
	@Path("/all")
	public String getAllEvents()
	{
		String methodName = "getAllEvents";
		log(methodName, "Getting all events", LogType.INFO);
		OperationResult<List<Event>> result = eventService.getAllEvents(EventsRequestOption.ALL_EVENTS);
		return operationResultToJson(methodName, result, "events");
	}
	
	@POST
	public String addEvent(String newEventAsJson)
	{
		String methodName = "addEvent";
		log(methodName, "Adding a new event", LogType.INFO);
		OperationResult<Event> result = eventService.addEvent(newEventAsJson);
		return operationResultToJson(methodName, result, null);
	}
	
	@GET
	@Path("/{eventId}")
	public String getEventById(@PathParam("eventId") int requestedEventId)
	{
		String methodName = "getEventById"; 
		log(methodName, "Getting event #" + requestedEventId, LogType.INFO);
		OperationResult<Event> result = eventService.getEventById(requestedEventId); 
		return operationResultToJson(methodName, result, "event");
	}
	
	@GET
	@Path("/owned_by")
	public String getOwnersEvents(@QueryParam("owner_id") int owner_id)
	{
		String methodName = "getOwnerEvents";
		log(methodName, "Getting all owner's events", LogType.INFO);
		OperationResult<List<Event>> result = eventService.getOwnersEvents(owner_id);
		return operationResultToJson(methodName, result, "events");
	}
	
	@GET
	@Path("/subscribed_to")
	public String getSubscribedEvents(@QueryParam("owner_id") int owner_id)
	{
		String methodName = "getSubscribedEvents"; 
		log(methodName, "Getting all the events user #" + owner_id + " is subscribed to", LogType.INFO);
		OperationResult<List<Event>> result = eventService.getSubscribedEvents(owner_id);
		return operationResultToJson(methodName, result, "events");
	}
	
	@GET
	@Path("/closed")
	public String getClosedSubscribedEvents(@QueryParam("user_id") int userId)
	{
		String methodName = "getClosedSubscribedEvents";
		log(methodName, "Getting all the events user #" + userId + " was subscribed to and were closed", LogType.INFO);
		OperationResult<List<Event>> result = eventService.getClosedSubscribedEvents(userId);
		return operationResultToJson(methodName, result, "events");
	}
	
	@PUT
	@Path("/close")
	public String closeEvent(@QueryParam("event_id") int eventId, @QueryParam("owner_id") int ownerId)
	{
		String methodName = "closeEvent";
		log(methodName, "Closing event #" + eventId + " owned by user #" + ownerId, LogType.INFO);
		OperationResult<Event> result = eventService.closeEvent(eventId, ownerId);
		return operationResultToJson(methodName, result, null);
	}
	
	@PUT
	@Path("/subscribe")
	public String subscribeUserToEvent(@QueryParam("event_id") int eventId, @QueryParam("user_id") int userId)
	{
		String methodName = "subscribeUserToEvent";
		log(methodName, "Subscribing user #" + userId + " to event #" + eventId, LogType.INFO);
		OperationResult<Event> result = eventService.subscribeUser(eventId, userId);
		return operationResultToJson(methodName, result, null);
	}
	
	@PUT
	@Path("/unsubscribe")
	public String unSubscribeUserFromEvent(@QueryParam("event_id") int eventId, @QueryParam("user_id") int userId)
	{
		String methodName = "unSubscribeUserFromEvent";
		log(methodName, "Unsubscribing user #" + userId + " from event #" + eventId, LogType.INFO);
		OperationResult<Event> result = eventService.unSubscribeUser(eventId, userId);
		return operationResultToJson(methodName, result, null);
	}
	
	@DELETE
	@Path("/{eventId}")
	public void deleteEvent(@PathParam("eventId") int eventId)
	{
		eventService.deleteEvent(eventId);
	}
	
	@DELETE
	@Path("/all")
	public void deleteAllEvents()
	{
		eventService.deleteAllEvents();
	}
	
	@DELETE
	@Path("/closed")
	public void deleteClosedEvents()
	{
		eventService.deleteInactiveEvents();
	}
	
	@DELETE
	@Path("/past")
	public void deletePastEvents()
	{
		eventService.deletePastEvents();
	}
	
	@SuppressWarnings("unused")
	private void printJacksonVersion()
	{
		Version dataBindVersion = com.fasterxml.jackson.databind.cfg.PackageVersion.VERSION;
		System.out.println("databind version: " + dataBindVersion);
		Version coreVersion = com.fasterxml.jackson.core.json.PackageVersion.VERSION;
		System.out.println("core version: " + coreVersion);
	}	
}
