// import React, {Component} from 'react';
// import { View } from 'react-native';

// import RootNavigator from './components/RootNavigator';

// class App extends Component{
// 	constructor(props){
// 		super(props);
// 		var user = {};
// 		user['name'] = '';
// 		user['email'] = '';
// 		user['id'] = null;

// 		this.state = {
// 			user: user,
// 			events: [],
// 			my_events: [],
// 			registered_events: []
// 		}
// 	}

// 	render(){
// 		return (<RootNavigator />)
// 	}
// }

import React, {Component} from 'react';
import { ActivityIndicator, ListView, Alert, Button, StyleSheet, TextInput, Text, View, ScrollView, Image } from 'react-native';

// react-native navigation ref - https://reactnavigation.org/docs/en/getting-started.html
import { StackNavigator, createStackNavigator } from 'react-navigation';
// react-native fontawsome ref - https://www.npmjs.com/package/react-native-fontawesome
import FontAwesome, { Icons } from 'react-native-fontawesome';

import Login from './components/navigation_pages/Login';
import Hamburger1 from './hamburger1';
//import EventsBoard from './eventsBoard';
import EventsBoard from './components/EventsBoard';

// export { nav };

// Global Variables
//var ipAddress = 'http://192.168.1.16:8080/firstwebapp/webapi/events';
//var ipAddress = 'http://vmedu158.mtacloud.co.il:8080/firstwebapp/webapi/events';
var ipAddress = 'http://vmedu158.mtacloud.co.il:8080/evee/webapi/events';
var username = " ";
var passwrd = " ";
var eventDetails = " ";
var nav; // local variable
global.id = 0;
var eventJson;
var _this;

const LoginScreen = ({navigation}) => (<Login navigation={navigation} />);

const NewEventScreen = ({ navigation }) => (
	<View style={{backgroundColor: '#E2FCFF', flex: 1}}>
		<View style={{flex: 0.8}}>
			<TextInput
				maxLength = {20}
				autoCapitalize='words'
				placeholder="Event Details"
				onChangeText={(text) => eventDetails = text}
			/>
		</View>
		<View style={{flex: 0.2, alignItems: 'center', justifyContent: 'center'}}>
			<Button
				onPress={() => eventPost(navigation)}
				title="Submit"
				color="#77c8ce"
			/>
		</View>
	</View>
);

// const EventDetails = ({ nav }) => (
// 	<View style={{backgroundColor: '#E2FCFF', flex: 1}}>
// 		<Text>{global.id}</Text>
// 	</View>
// );

export class EventDetails extends Component{
    constructor(props){
        super(props);
        console.log("================== EventDetails ctor ===================== :: " + props);
        this.state = {
			id: global.id,
			isLoading: true
		}
	}

	componentWillMount() {
		console.log("================== EventDetails comonentwillmount() =====================");
		_this = this;	
		// GET request		
		fetch(ipAddress+'/'+id)
			.then(function(response) {
				console.log(ipAddress+'/'+id);
				return response.json();
			})
			.then(function(myJson) {
				console.log(JSON.stringify(myJson));
				eventJson = myJson;
				_this.setState({ isLoading: false });				
			});
	}

	render(){
		console.log("================== EventDetails render() =====================");
		if (this.state.isLoading) {
			try {
				return (
					<View style={{backgroundColor: '#E2FCFF', flex: 1, paddingTop: 20}}>
						<ActivityIndicator size="large" color="#77c8ce"/>
					</View>
				);
			}
			catch (Exception) {
				nav.navigate('EventsBoard');
			}
		}
		return(
			<View style={{backgroundColor: '#E2FCFF', flex: 1}}>
				<Text>{eventJson.id}</Text>
				<Text>{eventJson.owner_id}</Text>
				<Text>{eventJson.name}</Text>
				<Text>{eventJson.category}</Text>
				<Text>{eventJson.sub_category}</Text>
				<Text>{eventJson.raw_date}</Text>
				<Text>{eventJson.numOfParticipants}</Text>
				<Text>{eventJson.isActive}</Text>
 			</View>
		);
	}

	// checkServerConncection() {
	// 	serverConnection = setTimeout(
	// 	function(){
	// 		Alert.alert(
	// 		'Error',
	// 		'No Connection With The Server',
	// 		)
	// 		nav.navigate('LoginScreen');
	// 	},
	// 	7000);
	// }

	// stopCheckServerConncection() {
	// 	clearTimeout(serverConnection);
	// }
}

// 	renderEventDetails(eventText, eventID){
//         console.log("================== EventDetails renderEventDetails() =====================");				
// 		return (
// 			<View style={{padding: 5}}>
// 				<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>{eventText}</Text>
// 				<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>{eventID}</Text>		
// 			</View>
// 		);
// 	}

// 	componentDidMount() {
//         console.log("================== EventDetails componentDidMount() =====================");				
// 		return fetch(ipAddress+'/'+this.state.id)
// 			.then((response) => response.json())
// 			.then((responseJson) => {
// 				let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
// 				this.setState({
// 					isLoading: false,
// 					dataSource: ds.cloneWithRows(responseJson),
// 				},
// 				function() {
// 					this.stopCheckServerConncection();
// 				});
// 			})
// 			.catch((error) => {
// 				console.error(error);
// 			});
// 	}
	

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
