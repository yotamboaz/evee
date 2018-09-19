import React from 'react';
import { View, ActivityIndicator, Button, ListView, Text, Alert, StyleSheet, TouchableHighlight, InteractionManager, Platform } from 'react-native';
import { MapView } from 'expo';

import Event from './Event';
import * as location_utils from '../utils/location';
import * as utils from '../utils/utils';

import { StackNavigator, DrawerNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { nav } from './navigation_pages/Login';
import styles from '../utils/styles';

var serverConnection;
var ipAddress = 'http://vmedu158.mtacloud.co.il:8080/evee/webapi/events';

export default class EventsBoard extends React.Component{
    constructor(props){
        super(props);
        const { navigation } = this.props;
        const userID = navigation.getParam('id', '0');
        const userName = navigation.getParam('username', '');
        this.state = {
            // user id + name
            id: userID,
            name: userName,

            // public events
            events: [
                {
                  name: 'Event1',
                  id: 1,
                  date: 'date',
                  location: {latitude: 32.0916274, longitude: 34.8176193, address: 'ha podim 11 ramat gan'},
                  fields: {
                    specific_field1: 'bla',
                    specific_field2: 'bla'
                  }
                },
                {
                  name: 'Event2',
                  id: 2,
                  date: 'date',
                  location: {latitude: 32.068424, longitude: 34.824785, address: 'yoav 20 ramat gan'},
                  fields: {
                    specific_field1: 'bla',
                    specific_field2: 'bla'
                  }
                }
            ],

            // event kind is board/map according to user page. board = map, than kind='map'...
            event_kind: 'map',

            // the event user chosed (relevant only for map view)
            chosed_event: null,

            // filter options - the filters the user chose (could be another component, and sit in its state)
            // if filter options will be a component, than this class is stateless //
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
        console.log(utils.string_format('board state - {0}', this.state));
        var events = this._generate_events(this.state.events);
        return (
            <View>
                {events}
            </View>
        );
		// if (this.state.isLoading) {
		// 	try {
		// 		this.checkServerConncection();
		// 		return (
		// 			<View style={{backgroundColor: '#E2FCFF', flex: 1, paddingTop: 20}}>
		// 				<ActivityIndicator size="large" color="#77c8ce"/>
		// 			</View>
		// 		);
		// 	}
		// 	catch (Exception) {
		// 		nav.navigate('LoginScreen');
		// 	}
		// }
		// if (this.state.menuActive){
		// 	return this.menuMode();
		// }
		// if (this.state.disableEvents){
		// 	return this.aroundMeMode();
		// }
		// else {
		// 	return this.boardMode();
		// }
	}

	// ----------------------------------------------- render options -----------------------------------------------

	aroundMeMode() {
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
				<ListView style={styles.mainContent} enableEmptySections={true} emptyView={this._renderEmptyView}
					dataSource={this.state.dataSource}
					renderRow={(rowData) => this.renderEventButton(rowData.name, rowData.id)}
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


    // render(){
    //     console.log(utils.string_format('chosed event - {0}', this.state.chosed_event));
    //     console.log(utils.string_format('chosed event - {0}', this.state.id));
    //     console.log(utils.string_format('chosed event - {0}', this.state.events));
    //     var events = this._generate_events(this.state.events)
    //     return (
    //         <View>
    //             {events}
    //         </View>
    //     )
    // }

    _generate_events = (events) => {
        var chosed_event = this.state.chosed_event
        var event_objects = events.map(event => {
            var show_data = (chosed_event!=null && chosed_event.name == event.name && chosed_event.id == event.id)

            return <Event   key={event.id}
                            event={event} 
                            show_data={show_data}
                            event_kind={this.state.event_kind}
                            chosed_event_cb={this.chosed_event_cb}
                            register_to_event_cb={this.register_to_event} />
    })
        if(this.state.event_kind == 'map'){
            event_board = 
                <View>
                    <MapView
                    style={{ flex: 1, width: 300 }}
                    initialRegion={location_utils.get_current_location()}
                    showsUserLocation={true}
                    followUserLocation={true} >

                        {event_objects}
                    </MapView>
                    {Platform.OS == 'android' ? <Button title='register' onPress={this.register_to_event} disabled={this.state.chosed_event==null} /> : null}
                </View>
        }
        else{
            event_board = 
                <View>
                    {event_objects}
                </View>
        }

        return event_board
    }

    chosed_event_cb = (event_name, event_id) => {
        current_chosed_event = this.state.chosed_event;

        var chosed_event = {};
        chosed_event['name'] = event_name;
        chosed_event['id'] = event_id

        if (current_chosed_event == null || current_chosed_event.id != chosed_event.id){
            this.setState(prev_state => {
                return {
                    id: prev_state.id,
                    events: prev_state.events,
                    event_kind: prev_state.event_kind,
                    chosed_event: chosed_event,
                    //filter
                }
            })
        }
        // if user press same event on android, equals that he doesnt want this event
        // if it is ios, than he must see the info to register to the event
        else if(Platform.OS=='android'){
            this.setState(prev_state => {
                return {
                    id: prev_state.id,
                    events: prev_state.events,
                    event_kind: prev_state.event_kind,
                    chosed_event: null,
                    //filter
                }
            })
        }
    }

    register_to_event = () => {
        // connect to the server, and upoad event_id and the user_id
        event_to_register = this.state.chosed_event.id;
        user_id = this.state.id;
        var register_msg_body = {event_id: event_to_register, user_id: user_id};
        console.log(utils.string_format("registering user - {0} to event - {1}",user_id, event_to_register));
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

const MyApp = createDrawerNavigator({
	Home: {
	  screen: EventsBoard,
	},
	Notifications: {
	  screen: MyNotificationsScreen,
	},
  });