import React from 'react';
import { Alert } from 'react-native';

// make token expiration longer - https://developers.facebook.com/docs/facebook-login/access-tokens/refreshing/#generate-long-lived-token
const facebook_app_id = '300664490665920'

export async function logIn() {
    try{
        const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(facebook_app_id, {
            permissions: ['public_profile', 'email'],
        });
        if (type === 'success') {
            return fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email`)
                    .then(response => response.json())
                    .then(details => {return {name: details.name, id: details.id, email: details.email, token: token}})
                    .catch(errors => console.log(errors))
        }
        else {
            return {cancel: true};
        }
    } 
    catch(e) {
      console.log(e)
      return {error: true};
    }
  }