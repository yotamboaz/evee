package com.webapp.firstwebapp.model;

// This class is used when there's a need for returning an object from some method,
// along with a flag stating if the operation succeeded and an error message in case it didn't    
public class OperationResult<T>
{
	public enum ResultState
	{
		SUCCESS, FAILIURE
	}
	
	private ResultState resultState = ResultState.FAILIURE; 
	private String errorMessage = "";
	private T objectToReturn;
	
	@Override
	public String toString() {
		return "OperationResult [resultState=" + resultState + ", objectToReturn=" + objectToReturn + ", errorMessage="
				+ errorMessage + "]";
	}

	public ResultState getResultState() {
		return resultState;
	}

	public void setResultState(ResultState resultState) {
		if(resultState != null)
		{
			this.resultState = resultState;		
		}
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public T getObjectToReturn() {
		return objectToReturn;
	}

	public void setObjectToReturn(T objectToReturn) {
		this.objectToReturn = objectToReturn;
	}	
}