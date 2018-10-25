package com.webapp.firstwebapp.services;

import javax.persistence.*;
import javax.servlet.*;

import com.webapp.firstwebapp.services.LoggerWrapper.LogType;
 
public class WebappListener implements ServletContextListener
{	
	// Prepare the EntityManagerFactory
    public void contextInitialized(ServletContextEvent e)
    {
        // com.objectdb.Enhancer.enhance("guest.*");
//    	log("contextInitialized", "server started", LogType.INFO);
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("/root/evee-database.odb");
        e.getServletContext().setAttribute("emf", emf);
    }
 
    // Release the EntityManagerFactory:
    public void contextDestroyed(ServletContextEvent e)
    {
//    	log("contextDestroyed", "server stopped", LogType.INFO);
        EntityManagerFactory emf = (EntityManagerFactory)e.getServletContext().getAttribute("emf");
        emf.close();
    }
}