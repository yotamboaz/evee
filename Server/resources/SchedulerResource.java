package com.webapp.firstwebapp.resources;

import java.util.Timer;
import java.util.concurrent.TimeUnit;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

import com.webapp.firstwebapp.services.EventsCleaningTask;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;
import com.webapp.firstwebapp.services.Resource;

// This class is used by the developers as a maintenance service
// Its purpose is to prevent from the database to get full with irrelevant events
@Singleton
@Path("/scheduler")
public class SchedulerResource extends Resource
{
	private static String logPath = "/root/ServerLogFiles/ServerLog.log";
	private boolean isRunning = false;
	private Timer timer;
	private EventsCleaningTask eventsCleaningTask;
	
	public SchedulerResource()
	{
		super(logPath);
	}
	
	@GET
	public boolean isSchedulerRunning()
	{
		return isRunning;
	}
	
	@PUT
	@Path("/start")
	public void startScheduler(@QueryParam("seconds") int seconds)
	{
		if(!isRunning)
		{
			isRunning = true;
			log("startScheduler", "Initiating scheduler with period of " + seconds + " seconds", LogType.INFO);
			runEventsCleaner(seconds);	
		}		
	}
	
	@PUT
	@Path("/stop")
	public void stopScheduler()
	{
		if(isRunning)
		{
			isRunning = false;
			log("stopScheduler", "Terminating scheduler", LogType.INFO);
			stopEventsCleaner();	
		}
	}
	
	public void runEventsCleaner(int duration)
	{
		log("runEventsCleaner", "Initiating events cleaner", LogType.INFO);
		long period = TimeUnit.MILLISECONDS.convert(duration, TimeUnit.SECONDS);
		timer = new Timer();
		eventsCleaningTask = new EventsCleaningTask();
		timer.schedule(eventsCleaningTask, 0, period);
	}
	
	public void stopEventsCleaner()
	{
		log("stopEventsCleaner", "Terminating events cleaner", LogType.INFO);
		timer.cancel();
	}
}