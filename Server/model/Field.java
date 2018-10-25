package com.webapp.firstwebapp.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Embeddable;
import javax.persistence.FetchType;
import javax.persistence.OneToMany;

@Embeddable
public class Field
{	
	private String name;
	private String description;
	private String type;
	private String minValue;
	private String maxValue;
	private String defaultValue;
	private boolean is_required;
	
	@OneToMany(cascade=CascadeType.PERSIST, fetch=FetchType.EAGER)
	private List<String> comboboxOptions = new ArrayList<>(); 
	
	public Field() {}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getMinValue() {
		return minValue;
	}

	public void setMinValue(String minValue) {
		this.minValue = minValue;
	}

	public String getMaxValue() {
		return maxValue;
	}

	public void setMaxValue(String maxValue) {
		this.maxValue = maxValue;
	}

	public String getDefaultValue() {
		return defaultValue;
	}

	public void setDefaultValue(String defaultValue) {
		this.defaultValue = defaultValue;
	}

	public List<String> getComboboxOptions() {
		return comboboxOptions;
	}

	public void setComboboxOptions(List<String> comboboxOptions) {
		this.comboboxOptions = comboboxOptions;
	}

	public boolean isIs_required() {
		return is_required;
	}

	public void setIs_required(boolean is_required) {
		this.is_required = is_required;
	}

	@Override
	public String toString() {
		return "Field [name=" + name + ", description=" + description + ", type=" + type + ", minValue=" + minValue
				+ ", maxValue=" + maxValue + ", defaultValue=" + defaultValue + ", comboboxOptions=" + comboboxOptions
				+ "]";
	}
}