import React, {Component} from 'react';
import { View, Alert, Text } from 'react-native';

import Loading from '../Loading';
import * as utils from '../../utils/utils';
import * as storage_utils from '../../utils/DataStorage';
import * as styles from '../../utils/styles';
import { users as user_api } from '../../utils/Server_api';

// Facebook api refrence - https://github.com/facebook/react-native-fbsdk
//                         https://docs.expo.io/versions/latest/sdk/facebook
import * as facebook_api from '../../utils/Apps_login_api/Facebook_api';

// Google api ref - https://docs.expo.io/versions/latest/sdk/google
import * as google_api from '../../utils/Apps_login_api/Google_api';

// Text/RaisedButton ref - https://github.com/n4kz/react-native-material-buttons
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';
// TextField ref - https://github.com/n4kz/react-native-material-textfield#properties
import { TextField } from 'react-native-material-textfield';

var nav; // contains the global navigation object		
export { nav };

export default class Login extends Component{
    constructor(props){
        super(props);
        console.log(props);
        this.state = {
            navigation: props.navigation,
            navigation_cb: props.navigation_cb,
            user_name: '',
            user_email: '',
            user_id: null,
            is_loading: true
        }
    }

    render(){
        console.log(this.state)
        return(
            <View style={styles.wholeApp}>
                <Loading loading={this.state.is_loading} />
                <Text style={{marginTop: 15, fontSize: 24, textAlign: 'center', color: '#77c8ce'}}>
                    Welcome to Evee!
                </Text>
                <View style={{flex:1, width:'100%' }}>                
                    <View style={styles.loginPage}>
                        <TextButton onPress={this.facebook_login}
                            title='Login with Facebook'
                            titleColor='white'
                            color='blue'
                            style={{height:'20%', padding: 10, margin: 10, borderRadius: 10}}
                        />
                        <TextButton onPress={this.google_login}
                            title='Login with Google'
                            titleColor='white'
                            color='red'
                            style={{height:'20%', padding: 10, margin: 10, borderRadius: 10}}
                        />
                         {/* <TextButton onPress={this._delete_user}
                            title='Logout'
                            titleColor='white'
                            color='green'
                            style={{height:'20%', padding: 10, margin: 10}}                            
                        /> */}
                    </View>
                </View>
            </View>
        )
    }

    // over-riding this function to fetch user details from the device.
    componentDidMount = async () => {
        const user = await this.fetch_user_from_device()

        if(!user){
            this.setState(prev_state => {
                return {
                    navigation: prev_state.navigation,
                    navigation_cb: prev_state.navigation_cb,
                    user_name: prev_state.user_name,
                    user_id: prev_state.user_id,
                    user_email: prev_state.user_email,
                    is_loading: false
                }
            })

            return;
        }
        // user details were saved
        this.setState(prev_state => {
            return {
                navigation: prev_state.navigation,
                navigation_cb: prev_state.navigation_cb,
                user_name: user.name,
                user_id: user.id,
                user_email: user.email,
                is_loading: false
            }
        })
        
        // navigate to main page
        this._init_app(user.name, user.email, user.id);
    }

    fetch_user_from_device = async () => {
        let tries = 0;
        let fetched_data = false;
      
        while(!fetched_data && tries < 5){
            user_id = await storage_utils.getData('user_id', tries);
            user_name = await storage_utils.getData('user_name', tries);
            user_email = await storage_utils.getData('user_email', tries);
            fetched_data = Boolean(user_id) && Boolean(user_name) && Boolean(user_email);
            tries = tries + 1;
        }
        
        if(!fetched_data){
            return false;
        }
            
        return {name: user_name, id: user_id, email: user_email};
    }

    facebook_login = async () => {
        var details = await facebook_api.logIn()
        var token = details.token;
        var user_facebook_id = details.id;

        var deleted_user = await facebook_api.logOut(token, user_facebook_id);
        console.log(utils.string_format('managed to delete user facebook auth - {0}', deleted_user));

        if(details.cancel){
            Alert.alert('Canceled connection with facebook account')
            return
        }
        else if(details.error){
            Alert.alert('Connection with facebook account failed')
            return
        }

        // login succeeded and load details into the machine
        this.setState(prev_state => {
            return {
                navigation: prev_state.navigation,
                navigation_cb: prev_state.navigation_cb,
                user_name: prev_state.user_name,
                user_email: prev_state.user_email,
                user_id: prev_state.user_id,
                is_loading: true
            }
        })
        
        var user = {username: details.name, email: details.email}

        //fetch id from our server
        var id = await this._pull_user_from_server(user)
        if(!id){
            console.log('user connection failed');
            return
        }
        user['id'] = String(id);

        //save the data on the device
        saving_result = await this._save_user(user);
        console.log(saving_result)

        this.setState(prev_state => {
            return {
                navigation: prev_state.navigation,
                navigation_cb: prev_state.navigation_cb,
                user_name: details.name,
                user_id: id,
                user_email: details.email,
                is_loading: false
            }
        })

        // navigate to main page
        this._init_app(user.name, user.email, user.id);
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
                navigation: prev_state.navigation,
                navigation_cb: prev_state.navigation_cb,
                user_name: prev_state.user_name,
                user_email: prev_state.user_email,
                user_id: prev_state.user_id,
                is_loading: true
            }
        })

        var user = {username: String(details.name), email: String(details.email)}

        //fetch id from our server
        var id = await this._pull_user_from_server(user)
        if(!id){
            console.log('user connection failed');
            return
        }
        user['id'] = String(id);

        //save the data on the device
        saving_result = await this._save_user(user);
        console.log(saving_result)

        this.setState(prev_state => {
            return {
                navigation: prev_state.navigation,
                navigation_cb: prev_state.navigation_cb,
                user_name: details.name,
                user_email: details.email,
                user_id: id,
                is_loading: false
            }
        })
        
        // navigate to main page
        this._init_app(user.name, user.email, user.id);
    }

    logout = async () => {
        this.setState(prev_state => {
            return {
                navigation: prev_state.navigation,
                navigation_cb: prev_state.navigation_cb,
                user_name: "",
                user_email: "",
                user_id: null,
                is_loading: false
            }
        })
        await this._delete_user()
    }

    _pull_user_from_server = async (user) => {
        let tries = 0
        var id = false
        while(!id && tries < 5){
            id = await fetch(user_api,
                        {
                            method: 'POST',
                            headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(user)
                        })
                 .then(response => response.json())
                 .then(server_response => {
                        console.log(server_response)
                        if(server_response.status=='success'){
                            return String(server_response.user.id);
                        }
                        else{
                            tries = 5
                            Alert.alert(server_response.error);
                            return null;
                        }
                 })
                 .catch(error => {
                    console.log(error)
                    if(tries >= 4){
                        Alert.alert('Could not connect with the server, please try agin')
                    }
                    return null;
                 });
            tries = tries + 1;    
        }
        return id;
    }

    _save_user = async (user) => {
        let tries = 0;
        let result = false;
        while(!result && tries < 5){
            console.log(utils.string_format('try #{0}',tries))
            set_id = await storage_utils.setData('user_id', user.id, tries)
            set_name = await storage_utils.setData('user_name', user.username, tries)
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
        console.log('deleted all user data')
    }

    _init_app = (user_name, user_email, user_id) => {
        var user = {};
        user['name'] = user_name;
        user['email'] = user_email;
        user['id'] = user_id;

        nav = this.state.navigation;
        nav.navigate('Board', {
            id: user_id,
            username: user_name,
        });
    }

    
}