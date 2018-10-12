import React from 'react';
import { Modal, Text, View, Alert, Button, FlatList } from 'react-native';

import ClosedEvent from './ClosedEvent';
import * as utils from '../utils/utils';

export default class ClosedEvents extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            event_to_present: null,
            closed_events: props.events,
            close_modal: props.close_modal
        }
    }

    render(){
        return (
            <Modal transparent={false}
                    animationType={'none'} 
                    visible={Boolean(this.state.closed_events)}
                    onRequestClose={() => this.state.close_modal()} >
            <View style={{
                        flex: 1,
                        alignItems: 'center',
                        flexDirection: 'column',
                        backgroundColor: 'azure'
                    }} >
                <FlatList data={this.state.closed_events}
                extraData={this.state.event_to_present}
                renderItem={({item}) => {
                    let is_visible = item.id == this.state.event_to_present;

                    return(
                        <View>
                            <Text title={item.name} style={{textDecorationLine: 'underline'}} onPress={() => this.picked_event(item.id)} />
                            <ClosedEvent event={item} />
                            {/* {is_visible ? <ClosedEvent event={item} />:null} */}
                        </View>
                    )
                }}
                ItemSeparatorComponent={utils.render_separator}
                keyExtractor={item=>String(item.id)} />
                {utils.render_separator()}
                <Button title='close' onPress={this.state.close_modal} />
            </View>
       
            </Modal>
        )
    }

    picked_event = (event_id) => {
        event_to_present = this.state.event_to_present;
        if(event_to_present == event_id)
            event_to_present = null;
        else
            event_to_present = event_id;
        
        this.setState({event_to_present: event_to_present});
    }
}