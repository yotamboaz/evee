package com.webapp.firstwebapp.resources;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.webapp.firstwebapp.model.Format;
import com.webapp.firstwebapp.model.OperationResult;
import com.webapp.firstwebapp.services.FormatService;
import com.webapp.firstwebapp.services.LoggerWrapper.LogType;
import com.webapp.firstwebapp.services.Resource;

@Path("/formats")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class FormatResource extends Resource
{
	private static String logPath = "/root/ServerLogFiles/ServerLog.log";
	private static FormatService formatService = new FormatService(logPath);
	
	public FormatResource()
	{
		super(logPath);
	}
	
	// Methods below are self explanatory
	// ==================================
	
	@GET
	@Path("/categories")
	public String getCategories()
	{
		HashMap<String, LinkedList<String>> categories = formatService.getCategories();
		return formatService.hashMapToJson(categories);
	}
	
	@GET
	public String getAllFormats()
	{
		String methodName = "getAllFormats";
		log(methodName, "Getting all formats", LogType.INFO);
		OperationResult<List<Format>> result = formatService.getAllFormats();
		return operationResultToJson(methodName, result, "formats");
	}
	
	@GET
	@Path("/{formatId}")
	public OperationResult<Format> getFormatById(@PathParam("formatId") int formatId)
	{
		return formatService.getFormatById(formatId);
	}
	
	@GET
	@Path("/subcategory/{formatSubCategory}")
	public OperationResult<Format> getFormatBySubCategory(@PathParam("formatSubCategory") String formatSubCategory)
	{
		return formatService.getFormatBySubCategory(formatSubCategory);
	}
	
	@POST
	public String addFormat(Format newFormat)
	{
		String methodName = "addFormat";
		OperationResult<Format> result = formatService.addFormat(newFormat);
		return operationResultToJson(methodName, result, "format");
	}
	
	@DELETE
	@Path("/{formatId}")
	public void deleteFormat(@PathParam("formatId") int formatId)
	{
		formatService.deleteFormat(formatId);
	}
	
	@DELETE
	@Path("/all")
	public void deleteAllFormats()
	{
		formatService.deleteAllFormats();
	}
}
