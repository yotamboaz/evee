import React from 'react';
import { Alert } from 'react-native';
import Expo from 'expo';

import * as api_keys from '../API_key/Google_api'

export async function logIn() {
    try {
      const result = await Expo.Google.logInAsync({
        androidClientId: api_keys.android_client_id,
        iosClientId: api_keys.ios_client_id,
        scopes: ['profile', 'email'],
      });

      if (result.type === 'success') {
        console.log(result.accessToken);
        var user = result.user
        return {name: user.name, email: user.email}
      } else {
        return {cancel: true};
      }
    } catch(e) {
        console.log(e)
      return {error: true};
    }
}