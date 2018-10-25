package com.webapp.firstwebapp.model;

import com.webapp.firstwebapp.services.LoggerWrapper;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;

public abstract class Logger
{
	private String logPath;
	
	protected Logger(String path)
	{
		logPath = path;
	}
	
	protected void log(String callingMethodName, String msg, LogType type)
	{
		LoggerWrapper.getInstance(logPath).log(this.getClass().getSimpleName() + "::" + callingMethodName + " -> " + msg, type);
	}
}
