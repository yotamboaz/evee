import React from 'react';
import { View, FlatList, Button, Text, Platform, Alert } from 'react-native';
import { MapView } from 'expo';

import Event from './Event';
import * as location_utils from '../utils/location';
import * as utils from '../utils/utils';
import { events as events_server_api } from '../utils/Server_api';


export default class EventsBoard extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            // user id
            id: props.id,

            // public events
            events: [],

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

    fetch_events = async () => {
        let tries = 0;
        var events = null;
        while(!events && tries < 3){
            events = await fetch(events_server_api)
                 .then(response => response.json())
                 .then(server_response => {
                     if(server_response.status == 'success' || true){
                         return server_response;
                         //should be:
                         // return server_response.events
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
        console.log(events)
        return events
    }

    async componentDidMount(){
        if(!this.state.load_events){
            return
        }
        
       events = await this.fetch_events()

        // filter the events \\
        //============================= READ THIS BEFORE WORKING ON FILTER ==========================\\
        // need to think if filttering process should be here,                                       \\
        // because user might change filter options, and refetching                                  \\
        // events each time user change filter is not scalable, and not officiant.                   \\
        // maybe add filtered_events to state, and present them if user chosed filter options.       \\
        //===========================================================================================\\
        // events = this.filter_events(events)

        this.setState(prev_state => {
            return {
                id: prev_state.id,
                events: events,
                event_kind: prev_state.event_kind,
                chosed_event: null,
                load_events: false,
            }
        })
        
    }

    render(){
        console.log(this.state)
        var events = this._generate_events(this.state.events)
        return (
            <View>
                {events}
            </View>
        )
    }

    _generate_events = (events) => {
        var chosed_event = this.state.chosed_event
        
        if(this.state.event_kind == 'map'){
            var event_objects = events.map(event => {
                var show_data = (chosed_event!=null && chosed_event.id == event.id)
        
                    return <Event   key={event.id}
                                    event={event} 
                                    show_data={show_data}
                                    event_kind={this.state.event_kind}
                                    chosed_event_cb={this.chosed_event_cb}
                                    register_to_event_cb={this.register_to_event} />
            })
            
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
            if(this.state.events.length == 0) 
                return null
            
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
        console.log(utils.string_format('user chosed event - {0}', event_name))

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
                    load_events: prev_state.load_events,
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
        // connect to the server, and upoad event_id and the user_id
        event_to_register = event_id;
        user_id = this.state.id;
        var register_msg_body = {event_id: event_to_register, user_id: user_id};
        console.log(utils.string_format("registering user - {0} to event - {1}",user_id, event_to_register));
    }
}