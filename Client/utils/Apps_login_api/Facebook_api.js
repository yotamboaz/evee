import React from 'react';
import { Alert } from 'react-native';

import * as utils from '../utils';

// make token expiration longer - https://developers.facebook.com/docs/facebook-login/access-tokens/refreshing/#generate-long-lived-token
const facebook_app_id = '300664490665920'

export async function logIn() {
    try{
        const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(facebook_app_id, {
            permissions: ['public_profile', 'email']
        });
        if (type === 'success') {
            return  fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email`)
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

export async function logOut(token, user_id){
    // delete the user details so when loggin-out details are not saved.
    // in other words, prevant saving user details.

    var url = utils.string_format('https://graph.facebook.com/{0}/permissions?access_token={1}', user_id, token)
    return await fetch(url, {method: 'DELETE'})
                .then(response => response.json())
                .then(response => {
                    if(!response.success){
                        console.log('did not delete user details from facebook auth');
                    }
                    return response.success;
                })
                .catch(error => console.log(error));
}