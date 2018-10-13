import React from 'react';
import { Text, View, Button, Modal, StyleSheet, Platform } from 'react-native';

import * as utils from '../utils/utils';

// expo map-view ref - https://github.com/react-community/react-native-maps/blob/master/docs/mapview.md
import { MapView } from 'expo';

// Text/RaisedButton ref - https://github.com/n4kz/react-native-material-buttons
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';

export default class Event extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            event: props.event,
            show_data: props.show_data,
            able_to_register: props.able_to_register,
            event_kind: props.event_kind,
            chosed_event_cb: props.chosed_event_cb,
            time_stamp: null,
            register_to_event_cb: props.register_to_event_cb
        }
    }

    componentDidUpdate(next_props, next_state){
        if(this.state.event_kind=='map'){
            if(this.state.show_data != next_props.show_data){
                this.setState(prev_state => {
                    return {
                        event: prev_state.event,
                        show_data: next_props.show_data,
                        able_to_register: prev_state.able_to_register,
                        event_kind: prev_state.event_kind,
                        chosed_event_cb: prev_state.chosed_event_cb,
                        time_stamp: Date.now(),
                        register_to_event_cb: prev_state.register_to_event_cb
                    }
                })
                return true;
            }
            return false;
        }
        return true;
    }

    render(){
        var able_to_register = this.state.able_to_register(this.state.event);
        var details = this.get_event_details(this.state.event)
        var event_details = details.map(detail =>   (<Text  key={detail}
                                                            style={{fontWeight: 'bold', padding: 3}}>
                                                        {detail}
                                                    </Text>));
        if(this.state.event_kind == 'map'){
            var latlng = {};
            latlng['latitude'] = this.state.event.location['latitude'];
            latlng['longitude'] = this.state.event.location['longitude'];

            key = Platform.OS == 'ios' ? this.state.event.id : utils.string_format('{0}{1}', this.state.event.id, this.state.time_stamp);
            return (
                <MapView.Marker coordinate={latlng}
                                onPress={this.chosed_event}
                                key={key}
                                ref={marker => {this.marker = marker}}> 
                                <MapView.Callout tooltip={true}
                                                 onPress={this.hide_event_data}>
                                    <View style={{backgroundColor: '#E2FCFF', borderRadius:10, borderWidth: 1, borderColor: 'black'}}>
                                        {event_details}
                                        {Platform.OS == 'ios' && <Button onPress={this.register_to_event} title='register' disabled={!able_to_register} />}
                                    </View>
                                </MapView.Callout>
                </MapView.Marker>
                )
        }
        else{
            return (
                <View key={this.state.event.id}>
                    <TextButton 
						title={this.state.event.name}
						onPress={this.chosed_event}
						titleColor='white'
						style={{backgroundColor: '#77c8ce', borderRadius: 10, margin: 5}}						
					/>
                    {this.state.show_data ? event_details : null}
                    {this.state.show_data ? <TextButton  title='register'
                                                         style={{margin:10, backgroundColor: '#4d8c91'}}
                                                         onPress={this.register_to_event}
                                                         disabled={!able_to_register}
                                                         key='register_button'
                                                         titleColor='black' /> : null}
                </View>
            )
        }
        
    }

    componentDidMount(){
        setTimeout(() => {
            if(this.state.show_data && this.state.event_kind == 'map'){
                this.marker.showCallout();
            }
        }, 500);
    }

    get_event_details = (event) => {
        var details = [];
        var date = event.raw_date;
        
        if(date == undefined){
            date = Date.now();
        }
        else{
            date = new Date(date);
        }

        details.push(utils.string_format('Event name: {0}', event.name));
        details.push(utils.string_format('Date: {0}', utils.string_format('{0}/{1}/{2}', date.getDate(), date.getMonth()+1, date.getFullYear())));
        details.push(utils.string_format('Time: {0}:{1}', date.getHours(), date.getMinutes()));
        Object.keys(event.fields).forEach(key => {details.push(utils.string_format('{0}: {1}', key, event.fields[key]))})
        details.push(utils.string_format('Event Subscribers: {0}', event.subscribed_users_ids==undefined ? 0 : event.subscribed_users_ids.length))

        return details
    }

    chosed_event = () => {
        if(this.state.event_kind == 'board'){
            this.setState(prev_state => {
                return {
                    event: prev_state.event,
                    show_data: !prev_state.show_data,
                    able_to_register: prev_state.able_to_register,
                    event_kind: prev_state.event_kind,
                    chosed_event_cb: prev_state.chosed_event_cb,
                    register_to_event_cb: prev_state.register_to_event_cb
                }
            })
        }
        this.state.chosed_event_cb(this.state.event.name, this.state.event.id);
    }

    hide_event_data = () => {
        if(Platform.OS == 'ios'){
            this.setState(prev_state => {
                return {
                    event: prev_state.event,
                    show_data: !prev_state.show_data,
                    able_to_register: prev_state.able_to_register,
                    event_kind: prev_state.event_kind,
                    chosed_event_cb: prev_state.chosed_event_cb,
                    register_to_event_cb: prev_state.register_to_event_cb
                }
            })
        }
        else{
            // if it is an android than dismissing info equals to unchoose the event
            this.chosed_event()
        }
    }


    register_to_event = () => {
        this.state.register_to_event_cb(this.state.event.id);
    }
}

const styles = StyleSheet.create({
    modalBackground: {
      flex: 1,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'space-around',
      backgroundColor: '#00000040'
    },
    activityIndicatorWrapper: {
      backgroundColor: '#FFFFFF',
      height: 100,
      width: 100,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around'
    }
  });