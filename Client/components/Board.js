import React from 'react';
import { View, ActivityIndicator, Button, ListView, FlatList, Text, Alert, StyleSheet, TouchableHighlight, InteractionManager, Platform } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { StackNavigator, DrawerNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation';
import styles from '../utils/styles';
import EventsBoard from './EventsBoard';
import ManageEvents from './ManageEvents';

import { events as events_server_api } from '../utils/Server_api';
import * as utils from '../utils/utils';
import * as storage_utils from '../utils/DataStorage';
import { nav } from './navigation_pages/Login';

// Text/RaisedButton ref - https://github.com/n4kz/react-native-material-buttons
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';

export default class Board extends React.Component{

    constructor(props){
        super(props);
        console.log('Board ctor');
        const { navigation } = this.props;
        const userID = navigation.getParam('id', '0');
        const userName = navigation.getParam('username', '');
        this.state = {
            id: userID,
            username: userName,
            isLoading: true,
			aroundMeButtonOpacity: 0.5,
			boardButtonOpacity: 1,
			menuActive: false,
            menuOpacity: 0.5,
			event_kind: 'board',
			// flag to indicate if should fetch events again from the server
			load_events: true,
			// the public events
			events: []
		}
		global.id = userID;
		global.username = userName;
	}

	async componentDidUpdate(prev_props){
		if(!this.state.load_events)
			return;
		
			events = await this.fetch_events();
			if(!events){
				return;
			}
	 
			 // filter the events \\
			 //============================= READ THIS BEFORE WORKING ON FILTER ==========================\\
			 // need to think if filttering process should be here,                                       \\
			 // because user might change filter options, and refetching                                  \\
			 // events each time user change filter is not scalable, and not officiant.                   \\
			 // maybe add filtered_events to state, and present them if user chosed filter options.       \\
			 //===========================================================================================\\
			 //																							 \\
			 //  filtered_events = this.filter_events(events)											 \\
			 //===========================================================================================\\

			 this.setState(prev_state => {
				return {
					id: prev_state.id,
					username: prev_state.username,
					isLoading: false,
					aroundMeButtonOpacity: prev_state.aroundMeButtonOpacity,
					boardButtonOpacity: prev_state.boardButtonOpacity,
					menuActive: prev_state.menuActive,
					menuOpacity: prev_state.menuOpacity,
					event_kind: prev_state.event_kind,
					load_events: false,
					events: events
				}
			})
	}
	
	async componentDidMount(){
        if(!this.state.load_events){
            return
        }
        
	   events = await this.fetch_events()
	   if(!events){
		   return;
	   }

        // filter the events \\
        //============================= READ THIS BEFORE WORKING ON FILTER ==========================\\
        // need to think if filttering process should be here,                                       \\
        // because user might change filter options, and refetching                                  \\
        // events each time user change filter is not scalable, and not officiant.                   \\
        // maybe add filtered_events to state, and present them if user chosed filter options.       \\
        //===========================================================================================\\
		//																							 \\
		//  filtered_events = this.filter_events(events)											 \\
		//===========================================================================================\\

        this.setState(prev_state => {
            return {
                id: prev_state.id,
				username: prev_state.username,
				isLoading: false,
				aroundMeButtonOpacity: prev_state.aroundMeButtonOpacity,
				boardButtonOpacity: prev_state.boardButtonOpacity,
				menuActive: prev_state.menuActive,
				menuOpacity: prev_state.menuOpacity,
				event_kind: prev_state.event_kind,
				load_events: false,
				events: events
            }
        })
        
    }

    boardButton() {
		this.setState({aroundMeButtonOpacity: 0.5});
		this.setState({boardButtonOpacity: 1});
        this.setState({event_kind: 'board'});
		this.setState({menuActive: false});
		this.render();
	}

	aroundMeButton() {
		this.setState({aroundMeButtonOpacity: 1});
		this.setState({boardButtonOpacity: 0.5});
        this.setState({event_kind: 'map'});
		this.setState({menuActive: false});		
		this.render();		
	}
	
	filtersButton() {
		Alert.alert("filters");
	}

	menuButton() {
		this.setState({menuActive: !this.state.menuActive});
		this.setState({menuOpacity: 1});
		//this.props.navigation.openDrawer();
		this.render();
    }
    
    render(){
        if (this.state.menuActive){
			return this.menuMode();
		}
		else {
            return this.renderEvents();
		}
    }

    renderEvents(){
        return(
            <View style={styles.wholeApp}>
				<View style={styles.topContent}>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.menuButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.menuOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome name="user" size={24} />
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
							<FontAwesome name="filter" size={24} />
							</Text>
						</TouchableHighlight>
					</View>
				</View>
                <View style={styles.mainContent}>
                    <EventsBoard id={this.state.id} events={this.state.events} event_kind={this.state.event_kind}/>
                </View>
				<View style={styles.bottomContent}>
					<TouchableHighlight onPress={() => {this.setState({load_events: true})}}>
						<Text style={{margin: 5, fontSize: 24, textAlign: 'center', color: '#77c8ce'}}>
							Refresh Board
						</Text>
					</TouchableHighlight>
					{utils.render_separator()}
					<TouchableHighlight onPress={() => nav.navigate('NewEventScreen')}>
						<Text style={{margin: 5, fontSize: 24, textAlign: 'center', color: '#77c8ce'}}>
							New Event
						</Text>
					</TouchableHighlight>
                </View>
			</View>
        )
    }

    menuMode(){
		return(
			<View style={styles.wholeApp}>
				<View style={styles.topContent}>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.menuButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.menuOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome name="user" size={24} />
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
							<FontAwesome name="filter" size={24} />
							</Text>
						</TouchableHighlight>
					</View>
				</View>
                <Text style={{margin: 5, fontSize: 24, textAlign: 'center', color: '#77c8ce'}}>
                    {this.state.username}
                </Text>
                <TextButton 
                    title='Logout'
                    onPress={this._delete_user}
                    titleColor='white'
                    color='green'
                    style={{height:'10%'}}
                />
				<TextButton 
					title='My Events'
                    onPress={() => this.display_owned_events(this.state.id)}
                    titleColor='white'
                    color='red'
                    style={{height:'10%'}}
                />
				<TextButton 
                    title='Subscribed Events'
                    onPress={() => this.display_subscribed_events(this.state.id)}
                    titleColor='white'
                    color='blue'
                    style={{height:'10%'}}
                />
			</View>
		);
	}
	
	fetch_events = async () => {
        let tries = 0;
        var events = null;
        while(!events && tries < 3){
            events = await fetch(events_server_api)
                 .then(response => response.json())
                 .then(server_response => {
                     if(server_response.status == 'success'){
                         return server_response.events;
                     }
                     else{
                        Alert.alert(error);
                        tries = 3;
                     }
                 })
                 .catch(error => {
                     console.log(error);
                     if(tries >= 2){
                         Alert.alert('Could not fetch events from the server, pleae try again');
                     }
                 })
            tries = tries + 1;
        }
        return events
    }

    _delete_user = async () => {
        await storage_utils.removeData('user_id');
        await storage_utils.removeData('user_name');
        await storage_utils.removeData('user_id');
        console.log('deleted all user data');
        nav.navigate('LoginScreen');
	}
	
	display_owned_events = async () => {
		nav.navigate('ManageEventsContainer', {
			id: this.state.id,
			kind: 'owned_events'
		});
	}

	display_subscribed_events = async () => {
		nav.navigate('ManageEventsContainer', {
			id: this.state.id,
			kind: 'subscribed_events'
		});
	}
}