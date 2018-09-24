import React from 'react';
import { View, ActivityIndicator, Button, ListView, FlatList, Text, Alert, StyleSheet, TouchableHighlight, InteractionManager, Platform } from 'react-native';
import { MapView } from 'expo';

import Event from './Event';
import MapDisplay from './MapDisplay';
import * as location_utils from '../utils/location';
import * as utils from '../utils/utils';
import { events as events_server_api } from '../utils/Server_api';

import { StackNavigator, DrawerNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { nav } from './navigation_pages/Login';
import styles from '../utils/styles';
import * as storage_utils from '../utils/DataStorage';
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';

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
            events: props.events,

            // event kind is board/map according to user page. board = map, than kind='map'...
            event_kind: props.event_kind,
            // the event user chosed (relevant only for map view)
            chosed_event: {},
            // flag to indicate if should fetch events again from the server
            load_events: true,
            // filter options - the filters the user chose (could be another component, and sit in its state)
            // if filter options will be a component, than this class is stateless //
        }   
    }

    componentWillReceiveProps(props){
        this.setState(prev_state => {
            return {
                id: prev_state.id,
                events: props.events,
                event_kind: props.event_kind,
                chosed_event: prev_state.chosed_event,
                load_events: prev_state.load_events,
            }
        })
    }

    render(){
        var events = this._generate_events(this.state.events);
        return (
            <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                {events}
            </View>
        )
    }

    menuMode(events){
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
                    {this.state.name}
                </Text>
                <TextButton 
                    title='Logout'
                    onPress={this._delete_user}
                    titleColor='white'
                    color='green'
                    style={{height:'10%'}}
                />
			</View>
		);
    }
    
    _delete_user = async () => {
        await storage_utils.removeData('user_id');
        await storage_utils.removeData('user_name');
        await storage_utils.removeData('user_id');
        console.log('deleted all user data');
        nav.navigate('LoginScreen');
    }

    _generate_events = (events) => {
        var chosed_event = this.state.chosed_event;
        if(this.state.event_kind == 'map'){
            var event_objects = events.map(event => {
                var show_data = (chosed_event!=null && chosed_event.id == event.id)
        
                    return <Event   key={event.id}
                                    event={event} 
                                    show_data={show_data}
                                    event_kind={this.state.event_kind}
                                    chosed_event_cb={this.chosed_event_cb}
                                    register_to_event_cb={this.register_to_event} />
            });
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
            if(this.state.events.length == 0){
                return null
            }
            
            event_board = 
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", width: '150%' }}>
                    <FlatList   data={this.state.events}
                                renderItem={({item}) => {
                                    var show_data = (chosed_event!=null && chosed_event.id == item.id)
                                    return  <Event  key={item.id}
                                                    event={item} 
                                                    show_data={show_data}
                                                    event_kind={this.state.event_kind}
                                                    chosed_event_cb={this.chosed_event_cb}
                                                    register_to_event_cb={this.register_to_event} />
                                    }}
                                keyExtractor={item=>String(item.id)}
                                ItemSeparatorComponent={utils.render_separator}
                                showsVerticalScrollIndicator={false}
                                extraData={this.state.chosed_event} />
                </View>
        }
        return event_board
    }

    chosed_event_cb = (event_name, event_id) => {
        current_chosed_event = this.state.chosed_event;
        console.log(utils.string_format('user chosed event - {0}', event_name));
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
                    load_events: prev_state.load_events
                }
            })
        }
        // if user press same event on android, equals that he doesnt want this event
        // if it is ios, or both platforms on board than he must see the info in order to register to the event
        else if(Platform.OS=='android' || this.state.event_kind=='board'){
            this.setState(prev_state => {
                return {
                    id: prev_state.id,
                    events: prev_state.events,
                    event_kind: prev_state.event_kind,
                    chosed_event: null,
                    load_events: prev_state.load_events
                    //filter
                }
            })
        }
    }

    register_to_event = (event_id) => {
        if(Platform.OS == 'android'){
            // chosed_event is the one to register to.
            // no user_id recieved
            event_to_register = this.state.chosed_event.id
        }
        else{
            event_to_register = event_id;
        }
        
        // connect to the server, and upoad event_id and the user_id
        user_id = this.state.id;
        var register_msg_body = {event_id: event_to_register, user_id: user_id};
        console.log(utils.string_format("registering user - {0} to event - {1}",user_id, event_to_register));
    }
}