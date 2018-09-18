import React from 'react';
import { AsyncStorage, ActivityIndicator, View, Text, Alert, Modal } from 'react-native';

import Loading from '../components/Loading';
import * as utils from '../utils/utils';
import * as storage_utils from '../utils/DataStorage';

// Facebook api refrence - https://github.com/facebook/react-native-fbsdk
//                         https://docs.expo.io/versions/latest/sdk/facebook
import * as facebook_api from '../utils/Apps_login_api/Facebook_api';

// Google api ref - https://docs.expo.io/versions/latest/sdk/google
import * as google_api from '../utils/Apps_login_api/Google_api';

// Text/RaisedButton ref - https://github.com/n4kz/react-native-material-buttons
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';
// TextField ref - https://github.com/n4kz/react-native-material-textfield#properties
import { TextField } from 'react-native-material-textfield';

export default class LoginPage extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            user_name: '',
            user_email: '',
            user_id: null,
            is_loading: true,
        }
    }

    render(){
        console.log(this.state)
        return(
            <View style={{flexDirection: 'column', justifyContent: 'space-between', flex: 1, width:'80%'}}>
                <Loading loading={this.state.is_loading} />

                <TextField label=''
                           title='Login Page'
                           editable={false}
                           labelFontSize={30}
                           titleFontSize={30} />
                <TextButton onPress={this.facebook_login}
                            title='Facebook'
                            titleColor='white'
                            color='blue'
                            style={{height:'10%'}} />
                <TextButton onPress={this.google_login}
                                    title='Google'
                                    titleColor='white'
                                    color='red'
                                    style={{height:'10%'}} />
                <TextButton title='Logout'
                            onPress={this._delete_user}
                            titleColor='white'
                            color='green'
                            style={{height:'10%'}} />
            </View>
        )
    }

    componentDidMount = async () => {
        const user = await this.fetch_user_from_device()

        console.log(user)
        if(!user){
            this.setState(prev_state => {
                return {
                    user_name: prev_state.user_name,
                    user_id: prev_state.user_id,
                    user_email: prev_state.user_email,
                    is_loading: false
                }
            })
        }
        else{
            this.setState(prev_state => {
                return {
                    user_name: user.name,
                    user_id: user.id,
                    user_email: user.email,
                    is_loading: false
                }
            })
        }
    }

    fetch_user_from_device = async () => {
        let tries = 0;
        let result = false;
      
        while(!result && tries < 5){
            user_id = await storage_utils.getData('user_id', tries);
            user_name = await storage_utils.getData('user_name', tries);
            user_email = await storage_utils.getData('user_email', tries);
            result = Boolean(user_id) && Boolean(user_name) && Boolean(user_email);
            tries = tries + 1;
        }
        
        if(!result){
            return false;
        }
            
        return {name: user_name, id: user_id, email: user_email};
    }

    facebook_login = async () => {
        details = await facebook_api.logIn()
        if(details.cancel){
            Alert.alert('Canceled connection with facebook account')
            return
        }
        else if(details.error){
            Alert.alert('Connection with google account failed')
            return
        }

        // login succeeded and load details into the machine
        this.setState(prev_state => {
            return {
                user_name: prev_state.user_name,
                user_email: prev_state.user_email,
                user_id: prev_state.user_id,
                is_loading: true
            }
        })
        
        //fetch id from our server
        var id = 1;

        //save the data on the device
        var user = {name: String(details.name), id: String(id), email: String(details.email)}
        saving_result = await this._save_user(user);
        console.log(saving_result)

        this.setState(prev_state => {
            return {
                user_name: details.name,
                user_id: id,
                user_email: details.email,
                is_loading: false
            }
        })
    }

    google_login = async () => {
        details = await google_api.logIn()
        if(details.cancel){
            Alert.alert('Canceled connection with google account')
            return
        }
        else if(details.error){
            Alert.alert('Connection with google account failed')
            return
        }
        console.log(details)

        this.setState(prev_state => {
            return {
                user_name: prev_state.user_name,
                user_email: prev_state.user_email,
                user_id: prev_state.user_id,
                is_loading: true
            }
        })

        //fetch id from our server
        var id = 1;

        //save the data on the device
        var user = await {name: String(details.name), id: String(id), email: String(details.email)}
        saving_result = await this._save_user(user);
        console.log(saving_result)

        this.setState(prev_state => {
            return {
                user_name: details.name,
                user_email: details.email,
                user_id: id,
                is_loading: false
            }
        })
    }

    logout = async () => {
        this.setState(prev_state => {
            return {
                user_name: "",
                user_email: "",
                user_id: null,
                is_loading: false
            }
        })
        await this._delete_user()
    }

    _save_user = async (user) => {
        let tries = 0;
        let result = false;
        while(!result && tries < 5){
            console.log(utils.string_format('try #{0}',tries))
            set_id = await storage_utils.setData('user_id', user.id, tries)
            set_name = await storage_utils.setData('user_name', user.name, tries)
            set_email = await storage_utils.setData('user_email', user.email, tries)
            result = set_id && set_name && set_email;
            tries = tries + 1;
        }
        return result
    }

    _delete_user = async () => {
        await storage_utils.removeData('user_id');
        await storage_utils.removeData('user_name');
        await storage_utils.removeData('user_id');
        console.log('deleting all user data')
    }
}