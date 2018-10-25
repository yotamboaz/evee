package com.webapp.firstwebapp.services;

import java.util.TimerTask;

public class EventsCleaningTask extends TimerTask
{
	private EventsCleaningService cleaner = new EventsCleaningService();

	@Override
	public void run()
	{
		cleaner.removeInactiveEvents();
		cleaner.removePastEvents();
	}
}
