package com.webapp.firstwebapp.services;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Formatter;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

// This class is a wrapper of the java.util.logging.Logger class, to allow more configuration flexibility
// Implemented as singleton
public class LoggerWrapper
{
	private static LoggerWrapper instance;
	
	private static String logPath;
	
	private Logger actuallLogger;

	private class LoggerFormatter extends Formatter
	{
		private static final String format = "%s - %s | %s%n";

		@Override
		public synchronized String format(LogRecord record)
		{
			String date = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss").format(new Date(record.getMillis()));
			String formatted = String.format(format, date,
													record.getLevel().getName(),
													record.getMessage());
			return formatted;
		}
	}

	public enum LogType
	{
		INFO, SEVERE
	}
	
	private LoggerWrapper(String logPath)
	{
		try
		{
			FileHandler fileHandler = new FileHandler(logPath, 0, 1, true);
			ConsoleHandler consoleHandler = new ConsoleHandler();
			consoleHandler.setFormatter(new LoggerFormatter());
			fileHandler.setFormatter(new LoggerFormatter());
			actuallLogger = Logger.getLogger(this.getClass().getSimpleName());
			actuallLogger.addHandler(fileHandler);
			actuallLogger.addHandler(consoleHandler);
			actuallLogger.setUseParentHandlers(false);
		}
		catch (Exception e)
		{
			System.err.println("Failed initiating LoggerWrapper\n" + e.getMessage());
		}
	}
	
	public static LoggerWrapper getInstance(String logPath)
	{
		if(instance == null)
		{
			LoggerWrapper.logPath = logPath;
			instance = new LoggerWrapper(logPath);
		}
		
		return instance;
	}
	
	public void log(String msg, LogType type)
	{
		switch (type)
		{
			case INFO:
				actuallLogger.info(msg);
				break;
			case SEVERE:
				actuallLogger.severe(msg);
				break;
		}
	}

	public static String getLogPath()
	{
		return logPath;
	}

	/*
	private void printStackTrace()
	{
		System.out.println("Printing stack trace:");
		StackTraceElement[] elements = Thread.currentThread().getStackTrace();
		for (int i = 1; i < elements.length; i++) {
			StackTraceElement s = elements[i];
			System.out.println("\tat " + s.getClassName() + "." + s.getMethodName()
		        + "(" + s.getFileName() + ":" + s.getLineNumber() + ")");
		  }
	}
	*/
}
