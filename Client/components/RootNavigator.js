import React, {Component} from 'react';
import { ActivityIndicator, ListView, Alert, Button, StyleSheet, TextInput, Text, View, ScrollView, Image } from 'react-native';

// react-native navigation ref - https://reactnavigation.org/docs/en/getting-started.html
import { StackNavigator, createStackNavigator } from 'react-navigation';
// react-native fontawsome ref - https://www.npmjs.com/package/react-native-fontawesome
import FontAwesome, { Icons } from 'react-native-fontawesome';

import Login from './navigation_pages/Login';
import Hamburger1 from '../hamburger1';
import EventsBoard from '../eventsBoard';

export { nav };

// Global Variables
//var ipAddress = 'http://192.168.1.16:8080/firstwebapp/webapi/events';
//var ipAddress = 'http://vmedu158.mtacloud.co.il:8080/firstwebapp/webapi/events';
var ipAddress = 'http://vmedu158.mtacloud.co.il:8080/firstwebapp_19-8-18/webapi/events';
var username = " ";
var passwrd = " ";
var eventDetails = " ";
var nav; // contains the navigation object
global.id = 0;

const LoginScreen = ({navigation}) => (<Login navigation={navigation} navigation_cb={initApp} />);

const NewEventScreen = ({ navigation }) => (<UserForm />);


const EventDetails = ({ nav }) => (
	<View style={{backgroundColor: '#E2FCFF', flex: 1}}>
		<Text>{global.id}</Text>
	</View>
);

// class EventDetails extends Component {
//   render() {
//     /* 2. Get the param, provide a fallback value if not available */
//     const  nav  = this.props;
//     const id = nav.getParam('currentEventID', 'NO-ID');

//     return (
// 			<View style={{backgroundColor: '#E2FCFF', flex: 1}}>
// 		<Text>id: {JSON.stringify(id)}</Text>
// 	</View>
// 		);
// 	}
//}

function initApp(navigator){
    nav = navigator;
    nav.navigate('EventsBoard');
}

function eventPost(navigation) {
	if (eventDetails === " ") { // Event is empty - alert
		Alert.alert(
			'Empty event',
			'Event must contain at least 1 character!',
			[
				{text: 'Try Again'},
				{text: 'Back To Events Screen', onPress: () => nav.navigate('EventsBoard')},
			],
			{ cancelable: false }
		)
	}
	else { // Event is NOT empty - post new event
		fetch(ipAddress,
		{
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: eventDetails,
			}),
		});
		eventDetails = " ";
		nav.navigate('EventsBoard'); // Back to main events screen
	}
}

const RootNavigator = StackNavigator({
  LoginScreen: {
    screen: LoginScreen,
    navigationOptions: {
		headerTitle: 'Login',
    },
  },
  NewEventScreen: {
	screen: NewEventScreen,
    navigationOptions: {
		headerTitle: 'New Event',
    },
  },
  EventsBoard: {
	screen: EventsBoard,
    navigationOptions: {
		headerTitle: 'Events Board',
    },
	},
	EventDetails: {
		screen: EventDetails,
			navigationOptions: {
			headerTitle: 'Events Details',
			},
		},
});

export default RootNavigator;