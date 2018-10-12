import React from 'react';
import { Modal, Text, View, Alert, Button } from 'react-native';

import * as utils from '../utils/utils';

const ClosedEvent = (props) => {
    var event_details = get_event_details(props.event);
    var details = event_details.map(detail => {return <Text style={{fontWeight: 'bold'}} key={detail} >{detail}</Text>})

    return (
            <View   style={{
                    flex: 1,
                    alignItems: 'center',
                    flexDirection: 'column',
                    backgroundColor: 'azure'
                }} >
                <Text style={{fontWeight: 'bold', color: 'red', textDecorationLine: 'underline'}}>Removed</Text>
                {utils.render_separator()}
                {details}
            </View>
    )
}

const get_event_details = (event) => {
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
    details.push(utils.string_format('Event Subscribers: {0}', event.current_num_of_participants))

    return details
}

export default ClosedEvent;