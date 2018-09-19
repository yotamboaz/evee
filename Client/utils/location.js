import React from 'react';
import { Alert, Platform } from 'react-native';

import * as utils from './utils';
import * as google_api_keys from './API_key/Google_api';

export function get_current_location(){
    return navigator.geolocation.getCurrentPosition((location)=>{
                                                            console.log(location)
                                                            return location
                                                         },
                                            (error)=>{
                                                      Alert.Alert('Could not load you location. please verify this app location sharing.');
                                                      console.log(error)
                                                    });
}


export async function get_address_by_location(latitude, longitude){
    let api_key = Platform.OS == 'ios' ? google_api_keys.ios_api : google_api_keys.android_api;
    fetch_req = utils.string_format('https://maps.googleapis.com/maps/api/geocode/json?latlng={0},{1}&key={2}', latitude, longitude, api_key)

    const _get_address_by_location = (address_object) => {
        console.log(address_object)
        if (address_object.status=='OK')
            return address_object.results[0].formatted_address;
        
        console.log(utils.string_format('google api status - {0}]\nStatus message - {1}\nby map location setting', response.status, response.statusText));
        Alert.Alert('Could not retrieve the address of selected location.');
    }
    
    return fetch(fetch_req)
            .then(response => response.json())
            .then(json_response => _get_address_by_location(json_response))
            .catch(error => console.log(utils.string_format('while using fetch error accured - {0}', error)));
}

export function get_location_by_address(address){
    let api_key = Platform.OS == 'ios' ? google_api_keys.ios_api : google_api_keys.android_api;
    address = address.replace(/ /gi, '+')
    fetch_req = utils.string_format('https://maps.googleapis.com/maps/api/geocode/json?address={0}&key={1}', address, api_key)
    
    const _get_location_by_address = (location_object) => {
        console.log(location_object)
        if(location_object.status == 'OK'){
            var geometry = location_object.results[0].geometry.location;
            if(geometry)
                return  {latitude: geometry.lat, longitude: geometry.lng}
            
            return {}
        }

        console.log(utils.string_format('google api status - {0}]\nStatus message - {1}\nby address setting', response.status, response.statusText));
        Alert.Alert('Could not retrieve the address of selected location.');
    }

    return fetch(fetch_req)
            .then(response => response.json())
            .then(json_response => _get_location_by_address(json_response))
            .catch(error => console.log(utils.string_format('while using fetch error accured - {0}', error)));
}