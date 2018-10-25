package com.webapp.firstwebapp.services;

import java.util.HashMap;
import java.util.Iterator;

import javax.json.Json;
import javax.json.JsonObjectBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.webapp.firstwebapp.model.Logger;
import com.webapp.firstwebapp.model.OperationResult;
import com.webapp.firstwebapp.model.OperationResult.ResultState;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;

// This class is a super class of all controllers
public abstract class Resource extends Logger
{
	protected JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
	protected String statusLabel = "status";
	protected String errorLabel = "error";
	
	protected ObjectMapper mapper;
	
	protected String logPath = "/root/ServerLogFiles/ServerLog.log";

	public Resource(String logPath)
	{
		super(logPath);
		initiateMapper();
	}	
	
	private void initiateMapper()
	{
		mapper = new ObjectMapper();
		mapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, true);
		mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
		mapper.configure(SerializationFeature.WRITE_EMPTY_JSON_ARRAYS, false);
	}
	
	protected <T> String operationResultToJson(String methodName, OperationResult<T> result, String objectLabel)
	{
		String asJson = null;
		HashMap<String, String> map = new HashMap<>();
		switch (result.getResultState())
		{
			case SUCCESS:
				T object = result.getObjectToReturn();
				String objectAsJson = objectToJson(methodName, object);
				map.put(statusLabel, ResultState.SUCCESS.name().toLowerCase());
				if(objectLabel != null)
				{
					map.put(objectLabel, objectAsJson);					
				}
				asJson = hashMapToJson(map, objectLabel);
				break;
				
			case FAILIURE:
				jsonBuilder.add(statusLabel, ResultState.FAILIURE.name().toLowerCase());
				jsonBuilder.add(errorLabel, result.getErrorMessage());
				asJson = jsonBuilder.build().toString();
				break;
		}
		
		return asJson;
	}
	
	protected String hashMapToJson(HashMap<String, String> map, String keyWithoutQuotesAroundValue)
	{
		Iterator<String> keysItr = map.keySet().iterator();
		StringBuilder sb = new StringBuilder();
		
		int mapSize = map.size();
		sb.append('{');
		for(int i = 0; i < mapSize; i++)
		{
			String currentKey = keysItr.next();
			sb.append('"').append(currentKey).append('"').append(':');
			
			String currentValue = map.get(currentKey);
			if(currentKey.equals(keyWithoutQuotesAroundValue))
			{
				sb.append(currentValue);
			}
			else
			{
				sb.append('"').append(currentValue).append('"');				
			}
			
			if(i == mapSize - 1)
				sb.append('}');
			else
				sb.append(',');
		}
		return sb.toString();
	}
	
	protected String objectToJson(String methodName, Object obj)
	{
		String asJson = null;
		try
		{
			asJson = mapper.writeValueAsString(obj);

		}
		catch (Exception e)
		{
			log(methodName, "Failed writing object as Json\n" + e.getMessage(), LogType.SEVERE);
		}
		return asJson;
	}
}
