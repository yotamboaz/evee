package com.webapp.firstwebapp.resources;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.webapp.firstwebapp.model.OperationResult;
import com.webapp.firstwebapp.model.User;
import com.webapp.firstwebapp.services.UserService;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;
import com.webapp.firstwebapp.services.Resource;

@Path("/users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class UserResource extends Resource
{
	private static String logPath = "/root/ServerLogFiles/ServerLog.log";
	private UserService userService = new UserService(logPath);
	
	public UserResource()
	{
		super(logPath);
	}
	
	// Methods below are self explanatory
	// ==================================
	
	@GET
	public String getAllUsers()
	{
		String methodName = "getAllUsers";
		log(methodName, "Getting all users", LogType.INFO);
		OperationResult<List<User>> result = userService.getAllUsers();
		return operationResultToJson(methodName, result, "users");
	}
	
	@GET
	@Path("/{userId}")
	public String getUserById(@PathParam("userId") int userId)
	{
		String methodName = "getUserById"; 
		log(methodName, "Getting uesr #" + userId, LogType.INFO);
		OperationResult<User> result = userService.getUserById(userId);
		return operationResultToJson(methodName, result, "user");
	}
	
	@POST
	public String addUser(User newUser)
	{
		String methodName = "addUser";
		OperationResult<User> result = userService.addUser(newUser);
		return operationResultToJson(methodName, result, "user");
	}
	
	@DELETE
	@Path("/{userId}")
	public void deleteUser(@PathParam("userId") int userId)
	{
		userService.deleteUser(userId);
	}
	
	@DELETE
	@Path("/all")
	public void deleteAllUsers()
	{
		userService.deleteAllUsers();
	}	
}