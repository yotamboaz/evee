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

// Global Variables
var ipAddress = 'http://vmedu158.mtacloud.co.il:8080/evee/webapi/events/';
global.id = 0;
global.username = "";

const LoginScreen = ({navigation}) => (<Login navigation={navigation} />);

const NewEventScreen = ({ navigation }) => (
	<View style={{backgroundColor: '#E2FCFF', flex: 1}}>
		<UserForm id={global.id} username={global.username} />
	</View>
);

export class ManageEventsScreen extends React.Component{
	constructor(props){
		super(props);
		const { navigation } = this.props;
		const userID = navigation.getParam('id', '0');
		const _kind = navigation.getParam('kind', '');
		this.state = {
			id: userID,
			kind: _kind
		}
	}

	render(){
		return(
			<View>
					<ManageEvents id={this.state.id} kind={this.state.kind}/>
			</View>
		);
	}
}

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
	ManageEventsScreen: {
		screen: ManageEventsScreen,
			navigationOptions: {
			headerTitle: 'Manage Events',
			},
		},
});

export default RootNavigator;
