import React, {Component} from 'react';
import { ActivityIndicator, ListView, Alert, Button, StyleSheet, TextInput, Text, View, ScrollView, Image } from 'react-native';

// react-native navigation ref - https://reactnavigation.org/docs/en/getting-started.html
import { StackNavigator, createStackNavigator } from 'react-navigation';
// react-native fontawsome ref - https://www.npmjs.com/package/react-native-fontawesome
import FontAwesome, { Icons } from 'react-native-fontawesome';

import Login from './components/navigation_pages/Login';
import Hamburger1 from './hamburger1';
import Board from './components/Board';
import UserForm from './components/UserForm';

// Global Variables
var ipAddress = 'http://vmedu158.mtacloud.co.il:8080/evee/webapi/events/';
var username = " ";
var passwrd = " ";
var eventDetails = " ";
global.id = 0;

const LoginScreen = ({navigation}) => (<Login navigation={navigation} />);

const NewEventScreen = ({ navigation }) => (
	<View style={{backgroundColor: '#E2FCFF', flex: 1}}>
		<View style={{flex: 0.9}}>
			<UserForm user_id={global.id}/>
			{/* <TextInput
				maxLength = {20}
				autoCapitalize='words'
				placeholder="Event Details"
				onChangeText={(text) => eventDetails = text}
			/> */}
		</View>
		<View style={{flex: 0.1, alignItems: 'center', justifyContent: 'center'}}>
			<Button
				onPress={() => navigation.navigate('Board')}
				title="Cancel"
				color="#FF0000"
			/>
		</View>
	</View>
);

const EventDetails = ({ navigation }) => (
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

// function eventPost(navigation) {
// 	if (eventDetails === " ") { // Event is empty - alert
// 		Alert.alert(
// 			'Empty event',
// 			'Event must contain at least 1 character!',
// 			[
// 				{text: 'Try Again'},
// 				{text: 'Back To Events Screen', onPress: () => navigation.navigate('Board')},
// 			],
// 			{ cancelable: false }
// 		)
// 	}
// 	else { // Event is NOT empty - post new event
// 		fetch(ipAddress,
// 		{
// 			method: 'POST',
// 			headers: {
// 				Accept: 'application/json',
// 				'Content-Type': 'application/json',
// 			},
// 			body: JSON.stringify({
// 				content: eventDetails,
// 			}),
// 		});
// 		eventDetails = " ";
// 		navigation.navigate('Board'); // Back to main events screen
// 	}
// }

const RootNavigator = createStackNavigator({
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
  Board: {
	screen: Board,
    navigationOptions: {
		headerTitle: 'Board',
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
