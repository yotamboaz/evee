import React from 'react';
import { AsyncStorage } from "react-native";

import * as utils from './utils';

export const  setData = async (key, value, try_number) => {
    console.log(utils.string_format('setting {0} with {1}', key, value))
    var result = false;
    try {
        await AsyncStorage.setItem(key, value);
        console.log(utils.string_format('registered {0} to device', key))
        result = true
      } catch (error) {
        // Error saving data
        console.log(utils.string_format('Could not save {0} on the device, try-{1}', key, try_number))
        console.log(error)
      }
    return result
}

export const getData = async (key, try_number) => {
    var result = false
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            console.log(utils.string_format('fetched {0} from device with value {1}', key, value))
          result = value
        }
        else{
            console.log(utils.string_format('key {0} was not set',key))
        }
       } catch (error) {
        console.log(utils.string_format('Could not fetch {0} from the device, try-{1}', key, try_number))
        console.log(error)
       }
    return result
}

export const removeData = async (key, try_number) => {
    var result = false
    try {
        await AsyncStorage.removeItem(key);
        console.log(utils.string_format('removed {0} from device', key))
        result = true
       } catch (error) {
        console.log(utils.string_format('Could not remove {0} from the device, try-{1}', key, try_number))
        console.log(error)
       }
    return result
}