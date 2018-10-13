import React from 'react';
import { View, ScrollView, FlatList, Button, Text, Platform, Alert } from 'react-native';

import * as utils from '../utils/utils';

const ManagedEvent = (props) => {
    //generate the event_details
    details = get_event_details(props.event);

    event_details = details.map(detail => (<Text key={detail} style={{fontWeight: 'bold'}}>{detail}</Text>))
    button_kind_is_register = props.kind == 'owned_events' ? false : true;
    button_title = button_kind_is_register ? 'unsubscribe' : 'cancel event';

    return (
        <ScrollView style={{margin:10, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
            <View style={{margin: 10}}>
                {event_details}                            
            </View>
            <View style={{margin: 10}}>
                <Button title={button_title} color='#4d8c91' onPress={()=>props.remove_cb(props.event.name, props.event.id)} />                
            </View>
        </ScrollView>
    )
}

export const get_event_details = (event) => {
    var details = [];

    const date = new Date(event.raw_date);
    
    details.push(utils.string_format('Event name: {0}', event.name));

    // TODO: Should remove the condition.
    // bad version of the server saved wrong details that caused crush
    if(event.location){
        details.push(utils.string_format('Address: {0}', event.location.address));
    }
    details.push(utils.string_format('Time: {0}:{1}', date.getHours(), date.getMinutes()));
    details.push(utils.string_format('Date: {0}/{1}/{2}', date.getDate(), date.getMonth()+1, date.getFullYear()));
    Object.keys(event.fields).forEach(key => {details.push(utils.string_format('{0}: {1}', key, event.fields[key]))})

    return details
}

export default ManagedEvent;