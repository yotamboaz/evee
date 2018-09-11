import React from 'react';
import { Picker, Text, View } from 'react-native';

// Dropdown ref - https://www.npmjs.com/package/react-native-material-dropdown
import { Dropdown } from 'react-native-material-dropdown';
// TextField ref - https://github.com/n4kz/react-native-material-textfield#properties
import { TextField } from 'react-native-material-textfield';

import DataMark from './DataMark';
import * as utils from '../utils/utils';


const FormField = (props) => {
    console.log(props)
    var field = null;
    var _on_value_changed = null
    
    if(props.type == 'combo-box'){
        var sub_fields = props.box_strings.map(item => {
            return {value: item};
        })
        field = <Dropdown label={props.name}
                          data={sub_fields}
                          onChangeText={(value) => props.on_value_changed(props.name, value)} />
    }
    else if(props.type == 'string'){
        field =  <TextField label={props.name}
                            value={props.current_value}
                            onSubmitEditing={(value_event) => props.on_value_changed(props.name, value_event.nativeEvent.text)} />
    }
    else if(props.type == 'integer' || props.type == 'double'){
        var min_validation = props.min_value!=undefined ? (value) => {return value > props.min_value} : (value) => {return true}
        var max_validation = props.max_value!=undefined ? (value) => {return value < props.min_value} : (value) => {return true}

        const field_changed = (value_event) => {
            var value = value_event.nativeEvent.text
            if(!min_validation(value) || !max_validation(value)){
                props.invalid_value_cb(props.name,
                                       utils.string_format("'{0}' has to be in restriction of: {1} - {2}", props.name,
                                                                                                            props.min_value,
                                                                                                            props.max_value));
            }

            props.clean_invalid_value_cb(props.name)
            props.on_value_changed(props.name, value);
        }

        field = <TextField label={props.name}
                            value={props.current_value}
                            onSubmitEditing={field_changed} />
    }
    return (
        <View>
            {field}
            {props.description==undefined ? null : <DataMark mark='?' data={props.description} is_visible={props == null} />}
        </View>
    )
}

export default FormField;