import React, {Component} from 'react';
import { ActivityIndicator, ListView, Alert, Button, StyleSheet, TextInput, Text, TextButton, View, ScrollView, Image } from 'react-native';

// react-native navigation ref - https://reactnavigation.org/docs/en/getting-started.html
import { StackNavigator, createStackNavigator } from 'react-navigation';
// react-native fontawsome ref - https://www.npmjs.com/package/react-native-fontawesome
import FontAwesome, { Icons } from 'react-native-fontawesome';

import Login from './components/navigation_pages/Login';
import UserForm from './components/UserForm';
import Board from './components/Board';
import ManageEvents from './components/ManageEvents';
import ManageEventsContainer from './components/ManageEventsContainer';
import AppTitle from './components/AppTitle';

// Global Variables
var ipAddress = 'http://vmedu158.mtacloud.co.il:8080/evee/webapi/events/';
global.id = 0;
global.username = "";

const LoginScreen = ({navigation}) => (<Login navigation={navigation} />);

const NewEventScreen = ({ navigation }) => (
	<View style={{backgroundColor: '#E2FCFF', flex: 1}}>
		<AppTitle/>
		<UserForm id={global.id} username={global.username} />
	</View>
);


const RootNavigator = createStackNavigator({
	LoginScreen: {
		screen: LoginScreen,
		navigationOptions: { header: null }
  },
  NewEventScreen: {
		screen: NewEventScreen,
		navigationOptions: { header: null }
  },
  Board: {
		screen: Board,
		navigationOptions: { header: null }
	},
	ManageEventsContainer: {
		screen: ManageEventsContainer,
		navigationOptions: { header: null }
	},
});

export default RootNavigator;