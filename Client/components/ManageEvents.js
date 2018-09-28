import React from 'react';
import { View, FlatList, Button, Text, Platform, Alert } from 'react-native';

import * as utils from '../utils/utils';
import { events as events_api } from '../utils/Server_api';
import ManagedEvent from './ManagedEvent';

export default class ManageEvents extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            // user id
            id: props.id,

            // the opened events that the user registered to, or opened(depands on 'kind')
            events: [],

            // simillar to EventsBoard.
            // decide between 'subscribed_events' and 'owned_events'
            kind: props.kind,

            load_events: true
        }
    }

    fetch_events = async () => {
        let api = events_api;
        if(this.state.kind=='owned_events'){
            api = utils.string_format('{0}/owned_by?owner_id={1}', api, this.state.id);
        }
        else{
            api = utils.string_format('{0}/subscribe_to?owner_id={1}', api, this.state.id);
        }
        let tries = 0;
        var events = null;
        while(!events && tries < 3){
            events = await fetch(api)
                           .then(response => response.json())
                           .then(server_response => {
                               if(server_response.status == 'success'){
                                    return server_response.events;
                               }
                               tries = 3;
                               Alert.alert(server_response.error)
                               return null;
                           })
                           .catch(error => {
                               if(tries >= 2){
                                   Alert.alert('Could not fetch events from server. please try again later.');
                               }
                               console.log(error)
                               tries = tries + 1;
                               return null
                           })
        }
        return events;
    }

    async componentDidMount(){
        if(!this.state.load_events){
            return;
        }

        events = await this.fetch_events();

        // TODO: remove
        if(!events){
            events = [
                {
                    id: 1,
                    owner_id:59,
                    name: 'test1',
                    location: {address: 'test_address', latitude: 35.5, longitude: 35.5},
                    date: Date.now(),
                    fields: {

                    }
                },
                {
                    id: 2,
                    owner_id:59,
                    name: 'test2',
                    location: {address: 'test_address', latitude: 35.5, longitude: 35.5},
                    date: Date.now(),
                    fields: {

                    }
                }
            ]
        }

        this.setState(prev_state => {
            return {
                id: prev_state.id,
                events: events,
                kind: prev_state.kind,
                load_events: false
            }
        })
    }

    render(){
        return (
            <View style={{alignContent: 'center', flex:1,}}>
                <FlatList data={this.state.events}
                          ItemSeparatorComponent={utils.render_separator}
                          showsVerticalScrollIndicator={false}
                          keyExtractor={item=>String(item.id)}
                          renderItem={({item}) => {
                              return <ManagedEvent kind={this.state.kind}
                                                   remove_cb={this.remove_cb_warning}
                                                   event={item}
                                                   extraData={this.state.events} />
                          }} />
            </View>
        )
    }

    remove_cb_warning = (event_name, event_id) => {
        var option;
        if(this.state.kind == 'owned_events'){
            option = 'delete';
        }
        else{
            option = 'unsubscribe from';
        }

        Alert.alert(utils.string_format('You are about to {0} {1}', option, event_name),
        'Are you sure about that?',
        [
            {text: 'Yes', onPress: () => this.remove_cb(event_id)},
            {text: 'No', onPress: () => {return}}
        ])
    }

    remove_cb = async (event_id) => {
        var api = events_api;
        if(this.state.kind == 'subscribed_events'){
            api = utils.string_format('{0}/unsubscribe/?event_id={1}&owner_id={2}', api, event_id, this.state.id)
        }
        else{
            api = utils.string_format('{0}/close/?event_id={1}&owner_id={2}', api, event_id, this.state.id)
        }
        
       var response = await this.remove_event_from_server(api, event_id);

        if(response){         
            // remove the chosen event from the list
            var new_events = [];
            this.state.events.forEach(event_item => {
                if(event_item.id == event_id){
                    return;
                }
                
                new_events.push(event_item);
            })

            // inform the user that the event was removed
            var option;
            if(this.state.kind == 'owned_events'){
                option = 'delete'
            }
            else{
                option = 'unsubscribed from'
            }
            Alert.alert(utils.string_format('Succeded in {0} the event', option));

            this.setState(prev_state => {
                return {
                    id: prev_state.id,
                    events: new_events,
                    kind: prev_state.kind,
                    load_events: prev_state.load_events
                }
            })
        }
    }

    remove_event_from_server = async (api, event_id) =>{
        let tries = 0;
        response = false;
        while(!response && tries < 3){
            response = await fetch(api)
                             .then(response => response.json())
                             .then(server_response => {
                                 if(server_response.status == 'success'){
                                     return true;
                                 }
                                 else{
                                     tries = 3;
                                     Alert.alert(server_response.error);
                                     return false;
                                 }
                             })
                             .catch(error => {
                                if(tries >= 2){
                                    var option;
                                    if(this.state.kind == 'owned_events'){
                                        option = 'cancel'
                                    }
                                    else{
                                        option = 'unsubscribe to'
                                    }
                                    Alert.alert(utils.string_format('Could not {0} the event. please try again.', option))
                                }
                                console.log(error);
                                return false;
                             })
            tries = tries + 1;
        }
        return response;
    }

}