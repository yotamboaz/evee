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
            events: props.events,

            // event kind is board/map according to user page. board = map, than kind='map'...
            event_kind: props.event_kind,

            // the event user chosed (relevant only for map view)
            chosed_event: null,

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

    _generate_events = (events) => {
        var chosed_event = this.state.chosed_event
        var able_to_register;

        if(chosed_event == null)
            able_to_register = false;
        else{
            var chosed_event_ref;
            events.forEach(event => {
                if(event.id == chosed_event.id)
                    chosed_event_ref = event;
                
                return;
            })
            able_to_register = this.validate_registration_conditions(chosed_event_ref);
        }

        if(this.state.event_kind == 'map'){
            var event_objects = events.map(event => {
                var show_data = (chosed_event!=null && chosed_event.id == event.id)
        
                    return <Event   key={event.id}
                                    event={event} 
                                    show_data={show_data}
                                    able_to_register={this.validate_registration_conditions}
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
                    {Platform.OS == 'android' ? <Button title='register' onPress={this.register_to_event} disabled={!able_to_register} /> : null}
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
                                                    able_to_register={this.validate_registration_conditions}
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

    validate_registration_conditions = (event) => {
        var can_register = true;

        if(event.hasOwnProperty('subscribed_users_ids') && event.subscribed_users_ids.length){
            for(idx in event.subscribed_users_ids){
                if(event.subscribed_users_ids[idx] == this.state.id)
                {
                    can_register = false;
                    break;
                }
            }
        }

        if(event.owner_id == this.state.id)
            can_register = false;

        return can_register;
    }

    register_to_event = async (event_id) => {
        if(Platform.OS == 'android'){
            // chosed_event is the one to register to.
            // no user_id recieved
            event_to_register = this.state.chosed_event.id
        }
        else{
            event_to_register = event_id;
        }
        
        // connect to the server, and upload event_id and the user_id
        user_id = this.state.id;
        console.log(utils.string_format("registering user - {0} to event - {1}",user_id, event_to_register));

        let response = await this.subscribe_to_event(event_to_register);
        if(!response){
            return;
        }

        this.add_me_as_subscriber_to_event(event_to_register);
    }

    subscribe_to_event = async (event_id) => {
        let tries = 0;
        var result = false;

        let api = events_server_api;
        api = utils.string_format('{0}/subscribe?event_id={1}&user_id={2}', api, event_id, this.state.id);
        console.log(api);

        while(!result && tries < 3){
            result = await fetch(api, {method: 'PUT'})
                           .then(response => response.json())
                           .then(server_response => {
                               if(server_response.response == "success"){
                                   return true;
                               }
                               else{
                                   console.log('server error')
                                   tries = 3;
                                   Alert.alert(server_response.error);
                                   return false;
                               }
                           })
                           .catch(error => {
                               if(tries >=2 ){
                                   Alert.alert('Could not register to the event. please try again')
                               }
                               console.log(error);
                               tries = tries + 1;
                               return false;
                           })
        }
        console.log(result);
        return result;
    }


    add_me_as_subscriber_to_event = (event_id) => {
        var events = [];
        this.state.events.forEach(event => {
            if(event.id == event_id){
                event.subscribed_users_ids.push(this.state.id);
            }
            events.push(event);
            
            return event;
        })
        this.setState(prev_state => {
            return {
                id: prev_state.id,
                events: events,
                event_kind: prev_state.event_kind,
                chosed_event: prev_state.chosed_event,
                load_events: prev_state.load_events,
            }
        })
        console.log(this.state.events);
    }
}
