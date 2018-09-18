import React from 'react';
import { View, Button, Text, InteractionManager, Platform } from 'react-native';
import { MapView } from 'expo';

import Event from './Event';
import * as location_utils from '../utils/location';
import * as utils from '../utils/utils';

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

            // filter options - the filters the user chose (could be another component, and sit in its state)
            // if filter options will be a component, than this class is stateless //
        }


    }

    render(){
        console.log(utils.string_format('chosed event - {0}', this.state.chosed_event))
        var events = this._generate_events(this.state.events)
        return (
            <View>
                {events}
            </View>
        )
    }

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