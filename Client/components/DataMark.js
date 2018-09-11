import React from 'react';
import { StyleSheet, Text, View, TextInput, Picker } from 'react-native';

class DataMark extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            is_visible: props.is_visible,
            show_details: false,
            data: props.data,
            mark: props.mark
        }
    }

    pressed_for_details = () => {
        let show_details = !this.state.show_details
        this.setState(prev_state => {
            return {
                is_visible: prev_state.is_visible,
                show_details: show_details,
                date: prev_state.data,
                mark: prev_state.mark
            }
        })
    }

    render(){
        return (
            <View isVisible={this.state.is_visible}>
            <Text onPress={this.pressed_for_details}>{this.state.mark}</Text>
            {this.state.show_details && <Text>{this.state.data}</Text>}
            </View>
        )
    }
}

export default DataMark;
