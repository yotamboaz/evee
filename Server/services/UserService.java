package com.webapp.firstwebapp.services;

import java.util.List;

import com.webapp.firstwebapp.model.HasClosableResource;
import com.webapp.firstwebapp.model.OperationResult;
import com.webapp.firstwebapp.model.User;
import com.webapp.firstwebapp.model.OperationResult.ResultState;
import com.webapp.firstwebapp.services.DatabaseService.KeyType;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;

public class UserService extends HasClosableResource
{
	private static String logPath;
	
	public UserService(String logPath)
	{
		super(logPath, "DatabaseService");
		UserService.logPath = logPath;
	}
	
	public OperationResult<List<User>> getAllUsers()
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.getAllItems(User.class);
		}
		catch(Exception e)
		{
			return handleCloseFail("getAllUsers", e.getMessage());
		}
	}
	
	public OperationResult<User> getUserById(int userId)
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.getItem(User.class, KeyType.NUMBER, "id", String.valueOf(userId));			
		}
		catch(Exception e)
		{
			return handleCloseFail("getUserById", e.getMessage());
		}
	}
	
	public OperationResult<User> addUser(User newUser)
	{
		String methodName = "addUser";
		OperationResult<User> result = new OperationResult<User>();
		OperationResult<User> validateResult = validateUser(newUser);
		if(validateResult.getResultState() == ResultState.FAILIURE)
		{
			return validateResult;
		}
		else
		{
			try(DatabaseService databaseService = new DatabaseService(logPath))
			{
				User existingUser = databaseService.doesUserExists(newUser).getObjectToReturn(); 
				if(existingUser == null)
				{
					result = databaseService.addItem(User.class, newUser);
				}
				else
				{
					result = databaseService.getUser(newUser.getUsername(), newUser.getEmail());
					log(methodName, newUser.getUsername() + " was already registered", LogType.INFO);
				}
				return result;
			}
			catch(Exception e)
			{
				return handleCloseFail(methodName, e.getMessage());
			}	
		}
	}
	
	private OperationResult<User> validateUser(User user)
	{
		OperationResult<User> result = new OperationResult<User>();
		result.setResultState(ResultState.SUCCESS);
		StringBuilder sb = new StringBuilder();
		String errorMessage;
		if(user.getUsername() == null)
		{
			errorMessage = sb.append("null is not a valid username. ").toString();
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
		}
		if(user.getEmail() == null)
		{
			errorMessage = sb.append("null is not a valid email address. ").toString();
			result.setResultState(ResultState.FAILIURE);
			result.setErrorMessage(errorMessage);
		}
		return result;
	}
	
	public OperationResult<User> isRegisteredUser(User user)
	{
		String methodName = "isRegisteredUser";
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.doesUserExists(user);	
		}
		catch(Exception e)
		{
			String errorMessage = "Failed to determine if user #" + user.getId() + " is registered:\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			return handleCloseFail(methodName, errorMessage);
		}
	}
	
	public OperationResult<User> isRegisteredUser(int userId)
	{
		String methodName = "isRegisteredUser";
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.doesUserExists(userId);
		}
		catch(Exception e)
		{
			String errorMessage = "Failed to determine if user #" + userId + " is registered:\n" + e.getMessage(); 
			log(methodName, errorMessage, LogType.SEVERE);
			return handleCloseFail(methodName, errorMessage);
		}
	}
	
	public void deleteUser(int userId)
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			databaseService.deleteItem(User.class, userId);	
		}
		catch(Exception e)
		{
			log("deleteUser", "Failed delete user #" + userId + ": " + e.getMessage(), LogType.SEVERE);
//			return handleCloseFail("deleteUser", e.getMessage());
		}
	}
	
	public void deleteAllUsers()
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			databaseService.deleteAllItems(User.class);			
		}
		catch(Exception e)
		{
			log("deleteAllUsers", "Failed delete all users: " + e.getMessage(), LogType.SEVERE);
		}
	}	
}