package com.webapp.firstwebapp.services;

import java.util.function.Supplier;

import com.webapp.firstwebapp.model.HasClosableResource;
import com.webapp.firstwebapp.model.OperationResult;
import com.webapp.firstwebapp.model.OperationResult.ResultState;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;

public class EventsCleaningService extends HasClosableResource
{
	private static String logPath = "/root/ServerLogFiles/ServerLog.log";
	
	// This object is used only for method referencing purposes, in order to prevent code duplication 
	private DatabaseService databaseService = new DatabaseService(logPath);
	
	public EventsCleaningService()
	{
		super(logPath, "EventsCleaningService");
	}
	
	public void removeInactiveEvents()
	{
		removeEvents(databaseService::deleteInactiveEvents, "inactive");
	}
	
	public void removePastEvents()
	{
		removeEvents(databaseService::deletePastEvents, "past");
	}
	
	private void removeEvents(Supplier<OperationResult<Integer>> deleteMethod, String kindOfEvents)
	{
		String methodName = "removeEvents";
		log(methodName, "About to remove " + kindOfEvents + " events", LogType.INFO);
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			OperationResult<Integer> result = deleteMethod.get();
			if(result.getResultState() == ResultState.SUCCESS)
			{
				int numOfDeleted = result.getObjectToReturn();
				if(numOfDeleted > 0)
				{
					log(methodName, numOfDeleted + " " + kindOfEvents + " events were deleted", LogType.INFO);				
				}
				else if(numOfDeleted == 0)
				{
					log(methodName, "No " + kindOfEvents + " events were deleted", LogType.INFO);
				}	
			}
			else
			{
				log(methodName, "Failed removing " + kindOfEvents + " events:\n" + result.getErrorMessage(), LogType.SEVERE);
			}
		}
		catch(Exception e)
		{
			handleCloseFail(methodName, e.getMessage());		
		}
	}
}
