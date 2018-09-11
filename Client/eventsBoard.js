import React, {Component} from 'react';
import { StackNavigator, DrawerNavigator } from 'react-navigation';
import { View, ActivityIndicator, Button, ListView, Text, Alert, StyleSheet, TouchableHighlight } from 'react-native';
import FontAwesome, { Icons } from 'react-native-fontawesome';
import Hamburger1 from './hamburger1';
//import EventDetails from './eventDetails';
import { nav } from './App';
import styles from './utils/styles';
import'./App';

var serverConnection;
//var ipAddress = 'http://192.168.1.16:8080/firstwebapp/webapi/events';
//var ipAddress = 'http://vmedu158.mtacloud.co.il:8080/firstwebapp/webapi/events';
var ipAddress = 'http://vmedu158.mtacloud.co.il:8080/firstwebapp_19-8-18/webapi/events';

export default class EventsBoard extends Component {

	static navigationOptions = {
		drawerLabel: 'Home',
	  };

	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			aroundMeButtonOpacity: 0.5,
			boardButtonOpacity: 1,
			disableEvents: false,
			menuActive: false,
			menuOpacity: 0.5
		}
	}

	boardButton() {
		this.setState({aroundMeButtonOpacity: 0.5});
		this.setState({boardButtonOpacity: 1});
		this.setState({disableEvents: false});
		this.setState({menuActive: false});
		this.render();
	}

	aroundMeButton() {
		this.setState({aroundMeButtonOpacity: 1});
		this.setState({boardButtonOpacity: 0.5});
		this.setState({disableEvents: true});
		this.setState({menuActive: false});		
		this.render();		
	}
	
	filtersButton() {
		Alert.alert("filters");
	}

	menuButton() {
		this.setState({menuActive: !this.state.menuActive});
		this.setState({menuOpacity: 1});
		this.props.navigation.openDrawer();
		this.render();
	}

	renderEventButton(eventText, eventID){
		return (
			<View style={{padding: 5}}>
				<TouchableHighlight onPress={() => foo(eventID.toString())} disabled={this.state.disableEvents} id={"event-" + eventID} opacity={this.state.eventsOpacity}
				style={{opacity: this.state.boardButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}} underlayColor={'transparent'}>
					<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
					{eventText}
					</Text>
				</TouchableHighlight>
			</View>
		);
	}

	componentDidMount() {
		return fetch(ipAddress)
			.then((response) => response.json())
			.then((responseJson) => {
				let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
				this.setState({
					isLoading: false,
					dataSource: ds.cloneWithRows(responseJson),
				},
				function() {
					this.stopCheckServerConncection();
				});
			})
			.catch((error) => {
				console.error(error);
			});
	}
	
	checkServerConncection() {
		serverConnection = setTimeout(
		function(){
			Alert.alert(
			'Error',
			'No Connection With The Server',
			)
			nav.navigate('LoginScreen');
		},
		7000);
	}

	stopCheckServerConncection() {
		clearTimeout(serverConnection);
	}

	render() {
		if (this.state.isLoading) {
			try {
				this.checkServerConncection();
				return (
					<View style={{backgroundColor: '#E2FCFF', flex: 1, paddingTop: 20}}>
						<ActivityIndicator size="large" color="#77c8ce"/>
					</View>
				);
			}
			catch (Exception) {
				nav.navigate('LoginScreen');
			}
		}
		if (this.state.menuActive){
			return this.menuMode();
		}
		if (this.state.disableEvents){
			return this.aroundMeMode();
		}
		else {
			return this.boardMode();
		}
	}

	// ----------------------------------------------- render options -----------------------------------------------

	aroundMeMode() {
		return(
			<View style={styles.wholeApp}>
				<View style={styles.topContent}>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.menuButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.menuOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome>{Icons.user}</FontAwesome>
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.boardButton()} underlayColor={'transparent'}
						style={{opacity: this.state.boardButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Board
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.aroundMeButton()} underlayColor={'transparent'}
						style={{opacity: this.state.aroundMeButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Around Me
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.filtersButton()} underlayColor={'transparent'}>
							<Text style={{margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome>{Icons.filter}</FontAwesome>
							</Text>
						</TouchableHighlight>
					</View>
				</View>
			</View>
		);
	}

	boardMode() {
		return(
			<View style={styles.wholeApp}>
				<View style={styles.topContent}>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.menuButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.menuOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome>{Icons.user}</FontAwesome>
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.boardButton()} underlayColor={'transparent'}
						style={{opacity: this.state.boardButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Board
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.aroundMeButton()} underlayColor={'transparent'}
						style={{opacity: this.state.aroundMeButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Around Me
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.filtersButton()} underlayColor={'transparent'}>
							<Text style={{margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome>{Icons.filter}</FontAwesome>
							</Text>
						</TouchableHighlight>
					</View>
				</View>
				<ListView style={styles.mainContent} enableEmptySections={true} emptyView={this._renderEmptyView}
					dataSource={this.state.dataSource}
					renderRow={(rowData) => this.renderEventButton(rowData.content, rowData.id)}
				/>
				<View style={styles.bottomContent}>
					<Button
						onPress={() => nav.navigate('NewEventScreen')}
						title="New Event"
						color="#77c8ce"
					/>
					<Text style={styles.allRightsReserved}> © Roy Koren, Gal Rotenberg, Yotam Boaz 2018</Text>
				</View>
			</View>
		);
	}

	menuMode(){
		return(
			<View style={styles.wholeApp}>
				<View style={styles.topContent}>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.menuButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.menuOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome>{Icons.user}</FontAwesome>
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.boardButton()} underlayColor={'transparent'}
						style={{opacity: this.state.boardButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Board
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.aroundMeButton()} underlayColor={'transparent'}
						style={{opacity: this.state.aroundMeButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Around Me
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.filtersButton()} underlayColor={'transparent'}>
							<Text style={{margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome>{Icons.filter}</FontAwesome>
							</Text>
						</TouchableHighlight>
					</View>
				</View>
				<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
					user name
					options
					log out
					...
				</Text>
				<Button
					onPress={() => this.props.navigation.navigate('Notifications')}
					title="Go to notifications"
				/>
			</View>
		);
	}
}

function foo(id){
	global.id = id;
	nav.navigate('EventDetails');
}

//----------------------screens------------------------

class MyNotificationsScreen extends React.Component {
	static navigationOptions = {
	  drawerLabel: 'Notifications',
	};
  
	render() {
	  return (
		<Button
		  onPress={() => this.props.navigation.goBack()}
		  title="Go back home"
		/>
	  );
	}
}

const MyApp = DrawerNavigator({
	Home: {
	  screen: EventsBoard,
	},
	Notifications: {
	  screen: MyNotificationsScreen,
	},
  });