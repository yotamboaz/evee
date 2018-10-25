package com.webapp.firstwebapp.model;

import java.util.ArrayList;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;

import com.webapp.firstwebapp.interfaces.HasId;
import com.webapp.firstwebapp.interfaces.Terminatable;

@Entity
public class Format implements HasId, Terminatable
{
	@Id
	@GeneratedValue
	private int id;
	
	private String category;
	
	private String sub_category;

	@OneToMany(cascade=CascadeType.PERSIST, fetch=FetchType.EAGER)
	private ArrayList<Field> fields = new ArrayList<>();
	
	public Format()	{}
	
	public int getId()
	{
		return id;
	}
	
	public void setId(int id)
	{
		this.id = id;
	}
	
	public String getCategory()
	{
		return category;
	}

	public void setCategory(String category)
	{
		this.category = category;
	}	

	public String getSub_category() {
		return sub_category;
	}

	public void setSub_category(String sub_category) {
		this.sub_category = sub_category;
	}
	
	public ArrayList<Field> getFields() {
		return fields;
	}

	public void setFields(ArrayList<Field> fields) {
		this.fields = fields;
	}
	
	@Override
	public String toString() {
		return "Format [id=" + id + ", category=" + category + ", subCategory=" + sub_category + ", fields=" + fields
				+ "]";
	}

	@Override
	public void terminate() {}
}
