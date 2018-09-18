import React from 'react';
import { Text, View, Button, Modal, StyleSheet, Platform } from 'react-native';

import * as utils from '../utils/utils';

// expo map-view ref - https://github.com/react-community/react-native-maps/blob/master/docs/mapview.md
import { MapView } from 'expo';

export default class Event extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            event: props.event,
            show_data: props.show_data,
            event_kind: props.event_kind,
            chosed_event_cb: props.chosed_event_cb,
            register_to_event_cb: props.register_to_event_cb
        }
    }

    render(){
        var details = this.get_event_details(this.state.event)
        var event_details = details.map(detail =>   <Text  key={detail}
                                                            style={{fontWeight: 'bold'}}>
                                                        {detail}
                                                    </Text>);
        if(this.state.event_kind == 'map'){
            var latlng = {};
            latlng['latitude'] = this.state.event.location['latitude'];
            latlng['longitude'] = this.state.event.location['longitude'];

            key = Platform.OS == 'ios' ? this.state.event.id : utils.string_format('{0}{1}', this.state.event.id, Date.now());
            
            return (
                <MapView.Marker coordinate={latlng}
                                // title={this.state.event.name}
                                onPress={this.chosed_event}
                                key={key}
                                ref={marker => {this.marker = marker}}> 
                                <MapView.Callout tooltip={true}
                                                 onPress={this.hide_event_data}>
                                    <View style={{backgroundColor: 'white'}}>
                                        {event_details}
                                        {Platform.OS == 'ios' && <Button onPress={this.register_to_event} title='register' />}
                                    </View>
                                </MapView.Callout>
                                    {/* {this._generate_event_data(event_details, this.marker)}
                                    {this.state.show_data ? showCallout():null} */}
                </MapView.Marker>
                )
        }
        else{
            return (
                <View key={this.state.event.id} style={{borderColor: 'black',
                                                        backgroundColor: 'azure',
                                                        justifyContent:'space-between',
                                                        alignContent: 'stretch'}}>
                    <Button onPress={this.chosed_event} title={this.state.event.name} key='event_button' />
                    {event_details}
                    {this.state.show_data ? <Button title='register' onPress={this.register_to_event} key='register_button' /> : null}
                </View>
            )
        }
        
    }

    componentDidMount(){
        setTimeout(() => {
            if(this.state.show_data){
                this.marker.showCallout();
            }
        }, 500);
    }

    get_event_details = (event) => {
        const time = 0;
        const date = 1;

        var details = [];

        let result = this.get_date(event.date);
        var event_time = result[time];
        var event_date = result[date];
        
        details.push(utils.string_format('Event name: {0}', event.name));
        details.push(utils.string_format('Address: {0}', event.location.address));
        details.push(utils.string_format('Time: {0}', event_time));
        details.push(utils.string_format('Date: {0}', event_date))
        Object.keys(event.fields).forEach(key => {details.push(utils.string_format('{0}: {1}', key, event.fields[key]))})

        return details
    }

    get_date = (date) => {
        time = 'x:x'
        date = 'y.y.y'

        return [time, date];
    }

    chosed_event = () => {
        this.state.chosed_event_cb(this.state.event.name, this.state.event.id);
    }

    hide_event_data = () => {
        if(Platform.OS == 'ios'){
            this.setState(prev_state => {
                return {
                    event: prev_state.event,
                    show_data: !prev_state.show_data,
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