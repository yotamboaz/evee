package com.webapp.firstwebapp.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import com.webapp.firstwebapp.interfaces.UsesDB;
import com.webapp.firstwebapp.model.Format;
import com.webapp.firstwebapp.model.HasClosableResource;
import com.webapp.firstwebapp.model.Logger;
import com.webapp.firstwebapp.model.OperationResult;
import com.webapp.firstwebapp.model.User;
import com.webapp.firstwebapp.services.DatabaseService.KeyType;

public class FormatService extends HasClosableResource
{
	private String logPath;
	
	public FormatService(String logPath)
	{
		super(logPath, "DatabaseService");
		this.logPath = logPath;
	}
	
	public HashMap<String, LinkedList<String>> getCategories()
	{
		HashMap<String, LinkedList<String>> categories = new HashMap<>();
		List<Format> formats = getAllFormats().getObjectToReturn();
		for (Format format : formats)
		{
			if(!categories.containsKey(format.getCategory()))
			{
				LinkedList<String> newList = new LinkedList<String>();
				newList.add(format.getSub_category());
				categories.put(format.getCategory(), newList);				
			}
			else
			{
				categories.get(format.getCategory()).add(format.getSub_category());
			}
		}
		return categories;
	}
	
	public OperationResult<List<Format>> getAllFormats()
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.getAllItems(Format.class);
		}
		catch(Exception e)
		{
			return handleCloseFail("getAllFormats", e.getMessage());
		}
	}
	
	public OperationResult<Format> getFormatById(int formatId)
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.getItem(Format.class, KeyType.NUMBER, "id", String.valueOf(formatId));
		}
		catch(Exception e)
		{
			return handleCloseFail("getAllFormats", e.getMessage());
		}
	}
	
	public OperationResult<Format> getFormatBySubCategory(String formatSubCategory)
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.getItem(Format.class, KeyType.STRING, "subCategory", formatSubCategory);
		}
		catch(Exception e)
		{
			return handleCloseFail("getFormatBySubCategory", e.getMessage());
		}
	}
	
	public OperationResult<Format> addFormat(Format newFormat)
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			return databaseService.addItem(Format.class, newFormat);
		}
		catch(Exception e)
		{
			return handleCloseFail("addFormat", e.getMessage());
		}
	}
	
	public void deleteFormat(int formatId)
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			databaseService.deleteItem(Format.class, formatId);
		}
		catch(Exception e)
		{
			handleCloseFail("deleteFormat", e.getMessage());
		}
	}
	
	public void deleteAllFormats()
	{
		try(DatabaseService databaseService = new DatabaseService(logPath))
		{
			databaseService.deleteAllItems(Format.class);
		}
		catch(Exception e)
		{
			handleCloseFail("deleteAllFormats", e.getMessage());
		}
	}
	
	public String hashMapToJson(HashMap<String, LinkedList<String>> map)
	{
		Iterator<String> keysItr = map.keySet().iterator();
		StringBuilder sb = new StringBuilder();
		
		int mapSize = map.size();
		sb.append('{');
		for(int i = 0; i < mapSize; i++)
		{
			String currentKey = keysItr.next();
			sb.append('"').append(currentKey).append('"').append(':');
			
			int currentListSize = map.get(currentKey).size();
			sb.append('[');
			for(int j = 0; j < currentListSize; j++)
			{
				String currentListItem = map.get(currentKey).get(j);
				sb.append('"').append(currentListItem).append('"');
				if(j != currentListSize - 1)
					sb.append(','); 
				else
					sb.append(']');
			}
			if(i == mapSize - 1)
				sb.append('}');
			else
				sb.append(',');
		}
		return sb.toString();
	}
}