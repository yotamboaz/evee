package com.webapp.firstwebapp.model;

import javax.persistence.Embeddable;

@Embeddable
public class Location
{
	public Location() {}
	
	@Override
	public String toString() {
		return "Address = " + address + ", Latitude = " + latitude + ", Longitude = " + longitude;
	}

	private String address;
	private Double latitude;
	private Double longitude;
	
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public Double getLatitude() {
		return latitude;
	}
	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}
	public Double getLongitude() {
		return longitude;
	}
	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}
}