package com.webapp.firstwebapp.model;

import com.webapp.firstwebapp.model.OperationResult.ResultState;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;

public abstract class HasClosableResource extends Logger
{	
	private String resourceName;
	
	protected HasClosableResource(String logPath, String resourceName)
	{
		super(logPath);
		this.resourceName = resourceName;
	}

	protected <T> OperationResult<T> handleCloseFail(String methodName, String exceptionMessage)
	{
		String errorMessage = "Failed auto-closing the resource " + resourceName + "\n" + exceptionMessage; 
		log(methodName, errorMessage, LogType.SEVERE);
		OperationResult<T> result = new OperationResult<T>();
		result.setErrorMessage(errorMessage);
		result.setResultState(ResultState.FAILIURE);
		return result;
	}
}
