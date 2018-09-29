import React from 'react';
import { ScrollView, View, Button, Text, Alert } from 'react-native';

// MapView ref - https://github.com/react-community/react-native-maps
//import MapView from 'react-native-maps';
// expo map-view ref - https://github.com/react-community/react-native-maps/blob/master/docs/mapview.md
import { MapView } from 'expo';
// TextField ref - https://github.com/n4kz/react-native-material-textfield#properties
import { TextField } from 'react-native-material-textfield';

import Categories from './Categories';
import DataMark from './DataMark';
import FormField from './FormField';
import DatePicker from './DatePicker';
import * as utils from '../utils/utils';
import * as location_utils from '../utils/location';
import { formats as formats_api, events as events_api } from '../utils/Server_api';

export default class UserForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user_id: props.id,
            form_objects: [],
            categories: {},
            selected_category: 'Default',
            selected_sub_category: 'Default',
            event_name: null,
            show_date: false,
            date: null,
            location: {},
            additional_data: null,
            max_num_of_participants: null,
            current_form: {category: null, sub_category: null},
            field_values: {},
            invalid_fields: {},
            registered_fields: ['Event Name'],
            pull_forms: true
        }
    }

    async componentDidMount(){
        var form_objects = null;
        if(this.state.pull_forms){
            form_objects = await this._pull_forms();
        }
        else{
            form_objects = this.state.form_objects;
        }

        if(!form_objects){
            return;
        }
        var categories = utils.collect_categories(form_objects);
        console.log(categories)

        this.setState(prev_state => {
            return {
                user_id: prev_state.user_id,
                form_objects: form_objects,
                categories: categories,
                selected_category: prev_state.selected_category,
                selected_sub_category: prev_state.selected_sub_category,
                event_name: prev_state.event_name,
                show_date: prev_state.show_date,
                date: prev_state.date,
                location: prev_state.location,
                additional_data: prev_state.additional_data,
                max_num_of_participants: prev_state.max_num_of_participants,
                current_form: prev_state.current_form,
                field_values: prev_state.field_values,
                invalid_fields: prev_state.invalid_fields,
                registered_fields: prev_state.registered_fields,
                pull_forms: false
            }
        })
    }

    _pull_forms = async () => {
        let tries = 0;
        var forms = null;
        while(!forms && tries < 5){
            forms = await fetch(formats_api)
                    .then(response => response.json())
                    .then(server_response => {
                        if(server_response.status == 'success'){
                            return server_response.formats;
                        }
                        else{
                            tries = 5;
                            Alert.alert(server_Response.error);
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        if(tries >= 4){
                            Alert.alert('could not fetch specific events forms from the server. please try again later...');
                        }
                    })
            tries = tries + 1;
        }
        return forms;
    }

    render() {
        var form_fields = null

        var form_fields = this._get_form_fields()
        var marker = this._get_marker(this.state.location)

        return(
            //contentContainerStyle={{flex: 1}}
            <View style={{flexDirection: 'column'}}>
                <MapView
                    style={{ flex: 1, width: 300 }}
                    initialRegion={location_utils.get_current_location()}
                    showsUserLocation={true}
                    followUserLocation={true}
                    onLongPress={e => {
                                        this.on_location_pick(e.nativeEvent)
                                       }} >
                {marker}
                </MapView>
                <ScrollView>
                    <TextField label='Address'
                                value={this.state.location['address']} 
                                onSubmitEditing={address_event => this.on_address_picked(address_event.nativeEvent.text)} />

                    <Categories selected_category={this.state.selected_category}
                                selected_sub_category={this.state.selected_sub_category}
                                categories={this.state.categories}
                                on_category_changed={this.on_category_changed}
                                on_sub_category_changed={this.on_sub_category_changed} /> 

                    <TextField label='Event Name'
                                value={this.state.field_values['event_name']}
                                onChangeText={name => {this.on_form_field_changed('Event Name', name)}} />

                    {form_fields}
                    
                    <TextField label='Restrict Participants' 
                                value={this.state.max_num_of_participants ? this.state.max_num_of_participants : ''}
                                onSubmitEditing={user_restriction => this.on_participants_restriction(user_restriction.nativeEvent.text)} />
                    <DataMark mark='?' data='optional field, to restrict the event group size' />

                    <TextField label='info'
                            multiline={true}
                            value={this.state.field_values['info']}
                            onSubmitEditing={info_event => {this.on_form_field_changed('info', info_event.nativeEvent.text)}} />

                    <DatePicker on_date_pick={this.on_date_pick}
                                show_date={this.state.show_date}
                                confirm_date={this.confirm_date}
                                cancel_date={this.cancel_date} />
                    {this.state.date!=null && (<View>
                                            <Text>{this.state.date.toDateString()}</Text>
                                            <Text>{utils.string_format('{0}:{1}', this.state.date.getHours(), this.state.date.getMinutes())}</Text>
                                            </View>)}

                    <Button title='Submit' onPress={this.submit_form} />
                </ScrollView>
            </View>
        );
    }

    _get_form_fields = () => {
        var form_fields
        
        this.state.form_objects.forEach(form_obj => {
            if(form_obj.category != this.state.current_form.category || form_obj.subCategory != this.state.current_form.sub_category){
                return;
            }
            let registered_fields = this.state.registered_fields
            registering_fields = []
            form_fields = form_obj.fields.map(field => {
                if(!registered_fields.indexOf(field.name)){
                    registering_fields.push(field_name)
                    console.log('registered field')
                }

                return <FormField   key={field.name}
                                    name={field.name}
                                    description={field.description}
                                    type={field.type}
                                    max_value={field.maxValue}
                                    min_value={field.minValue}
                                    box_strings={field.comboboxOptions}
                                    default_value={field.defaultValue}
                                    on_value_changed={this.on_form_field_changed}
                                    invalid_value_cb={this.invalid_value_cb}
                                    clean_invalid_value_cb={this.clean_invalid_value_cb} />
            })
        })
        return form_fields
    }

    _get_marker = (location) => {
        if(Object.keys(this.state.location).length){
            latlng = {};
            latlng['latitude'] = location.latitude;
            latlng['longitude'] = location.longitude;
            return <MapView.Marker coordinate={latlng} /> 
        } 
        return null;
    }

    on_category_changed = (category) => {
        this.setState(prev_state => {
            return {
            user_id: prev_state.user_id,
            form_objects: prev_state.form_objects,
            categories: prev_state.categories,
            selected_category: category,
            selected_sub_category: null,
            event_name: prev_state.event_name,
            show_date: prev_state.show_date,
            date: prev_state.date,
            location: prev_state.location,
            additional_data: prev_state.additional_data,
            max_num_of_participants: prev_state.max_num_of_participants,
            current_form: {category: null, sub_category: null},
            field_values: {},
            invalid_fields: prev_state.invalid_fields,
            registered_fields: prev_state.registered_fields,
            pull_forms: prev_state.pull_forms
            }
        })
    }

    on_sub_category_changed = (category, sub_category) => {
        current_category = this.state.category;
        current_sub_category = this.state.sub_category;
        if(category==current_category && sub_category==current_sub_category)
            // categories were not changed, thus no need to re-render
            return

        console.log(utils.string_format('changed categories to {0}\\{1}', category, sub_category))
        let forms = this.state.form_objects;
        var registered_fields = this.state.registered_fields.indexOf('Event Name') ? [] : ['Event Name']
        forms.forEach(form_item => {
            if(!(form_item.category == category && form_item.subCategory==sub_category))
                return

            form_item.fields.forEach(field => {
                registered_fields.push(field.name)
            })
        })
        this.setState(prev_state => {
            return {
                user_id: prev_state.user_id,
                form_objects: prev_state.form_objects,
                categories: prev_state.categories,
                selected_category: category,
                selected_sub_category: sub_category,
                event_name: prev_state.event_name,
                show_date: prev_state.show_date,
                date: prev_state.date,
                location: prev_state.location,
                additional_data: prev_state.additional_data,
                max_num_of_participants: prev_state.max_num_of_participants,
                current_form: {category: category, sub_category: sub_category},
                // Changed dynamic form, thus emptying the current one
                field_values: {},
                invalid_fields: prev_state.invalid_fields,
                registered_fields: registered_fields,
                pull_forms: prev_state.pull_forms
                }
        })
    }

    on_form_field_changed = (field_name, field_value) =>{
        var field_values = this.state.field_values;
        field_values[field_name] = field_value;

        var registered_fields = this.state.registered_fields;
        registered_fields.filter(name => name!=field_name)

        this.setState(prev_state => {
            return {
                user_id: prev_state.user_id,
                form_objects: prev_state.form_objects,
                categories: prev_state.categories,
                selected_category: prev_state.selected_category,
                selected_sub_category: prev_state.selected_sub_category,
                event_name: prev_state.event_name,
                show_date: prev_state.show_date,
                date: prev_state.date,
                location: prev_state.location,
                additional_data: prev_state.additional_data,
                max_num_of_participants: prev_state.max_num_of_participants,
                current_form: prev_state.current_form,
                field_values: field_values,
                invalid_fields: prev_state.invalid_fields,
                // Value was picked for a field, thus change required.
                registered_fields: registered_fields,
                pull_forms: prev_state.pull_forms
            }
        })
    }

    confirm_date = (date_value) => {
        // var date = {}
        // date['date'] = date_value.toDateString();
        // date['time'] = utils.string_format('{0}:{1}', date_value.getHours(), date_value.getMinutes());

        this.setState(prev_state => {
            return {
                user_id: prev_state.user_id,
                form_objects: prev_state.form_objects,
                categories: prev_state.categories,
                selected_category: prev_state.selected_category,
                selected_sub_category: prev_state.selected_sub_category,
                event_name: prev_state.event_name,
                show_date: false,
                date: date_value,
                location: prev_state.location,
                additional_data: prev_state.additional_data,
                max_num_of_participants: prev_state.max_num_of_participants,
                current_form: prev_state.current_form,
                field_values: prev_state.field_values,
                invalid_fields: prev_state.invalid_fields,
                registered_fields: prev_state.registered_fields,
                pull_forms: prev_state.pull_forms
            }
        })
    }

    cancel_date = (_) => {
        this.setState(prev_state => {
            return {
                user_id: prev_state.user_id,
                form_objects: prev_state.form_objects,
                categories: prev_state.categories,
                selected_category: prev_state.selected_category,
                selected_sub_category: prev_state.selected_sub_category,
                event_name: prev_state.event_name,
                show_date: false,
                date: prev_state.date,
                location: prev_state.location,
                additional_data: prev_state.additional_data,
                max_num_of_participants: prev_state.max_num_of_participants,
                current_form: prev_state.current_form,
                field_values: prev_state.field_values,
                invalid_fields: prev_state.invalid_fields,
                registered_fields: prev_state.registered_fields,
                pull_forms: prev_state.pull_forms
            }
        })
    }

    on_date_pick = () => {
        this.setState(prev_state => {
            let show_date = !prev_state.show_date;
            return {
                user_id: prev_state.user_id,
                form_objects: prev_state.form_objects,
                categories: prev_state.categories,
                selected_category: prev_state.selected_category,
                selected_sub_category: prev_state.selected_sub_category,
                event_name: prev_state.event_name,
                show_date: {show_date},
                date: prev_state.date,
                location: prev_state.location,
                additional_data: prev_state.additional_data,
                max_num_of_participants: prev_state.max_num_of_participants,
                current_form: prev_state.current_form,
                field_values: prev_state.field_values,
                invalid_fields: prev_state.invalid_fields,
                registered_fields: prev_state.registered_fields,
                pull_forms: prev_state.pull_forms
            }
        })
    }

    on_location_pick = (location) => {
        // updating the location selected
        // update location parameter, and form_fields[address]

        var latitude = location.coordinate.latitude
        var longitude = location.coordinate.longitude
        location_utils.get_address_by_location(latitude, longitude)
                        .then(address => {
                            console.log(address)

                            var field_values = this.state.field_values;
                            field_values['address'] = address

                            this.setState(prev_state => {
                                return {
                                    user_id: prev_state.user_id,
                                    form_objects: prev_state.form_objects,
                                    categories: prev_state.categories,
                                    selected_category: prev_state.selected_category,
                                    selected_sub_category: prev_state.selected_sub_category,
                                    event_name: prev_state.event_name,
                                    show_date: prev_state.show_date,
                                    date: prev_state.date,
                                    location: {latitude: latitude,
                                               longitude: longitude,
                                                address: address,
                                              },
                                    additional_data: prev_state.additional_data,
                                    current_form: prev_state.current_form,
                                    field_values: field_values,
                                    invalid_fields: prev_state.invalid_fields,
                                    registered_fields: prev_state.registered_fields,
                                    pull_forms: prev_state.pull_forms
                                }
                            })
                        })
                        .catch(error => console.log(error))
    }

    on_participants_restriction = (restriction) => {
            var invalid_fields = this.state.invalid_fields
            var regex = /^\d+$/;
            if(!regex.test(restriction) || restriction < 0){
                invalid_fields['restrict participants'] = 'Restrict Participants value must be a positive number.'
                this.setState(prev_state => {
                    return {
                        user_id: prev_state.user_id,
                        form_objects: prev_state.form_objects,
                        categories: prev_state.categories,
                        selected_category: prev_state.selected_category,
                        selected_sub_category: prev_state.selected_sub_category,
                        event_name: prev_state.event_name,
                        show_date: prev_state.show_date,
                        date: prev_state.date,
                        location: prev_state.location,
                        additional_data: prev_state.additional_data,
                        max_num_of_participants: restriction,
                        current_form: prev_state.current_form,
                        field_values: prev_state.field_values,
                        invalid_fields: invalid_fields,
                        registered_fields: prev_state.registered_fields,
                        pull_forms: prev_state.pull_forms
                    }
                })
                return
            }
            if(invalid_fields.hasOwnProperty('restrict participants')){
                delete invalid_fields['restrict participants'];
            }
            this.setState(prev_state => {
                return {
                    user_id: prev_state.user_id,
                    form_objects: prev_state.form_objects,
                    categories: prev_state.categories,
                    selected_category: prev_state.selected_category,
                    selected_sub_category: prev_state.selected_sub_category,
                    event_name: prev_state.event_name,
                    show_date: prev_state.show_date,
                    date: prev_state.date,
                    location: prev_state.location,
                    additional_data: prev_state.additional_data,
                    max_num_of_participants: restriction,
                    current_form: prev_state.current_form,
                    field_values: prev_state.field_values,
                    invalid_fields: prev_state.invalid_fields,
                    registered_fields: prev_state.registered_fields,
                    pull_forms: prev_state.pull_forms
                }
            })
    }

    on_address_picked = (address) => {    
        // updating the location selected
        // update location parameter, and form_fields[address]

       location_utils.get_location_by_address(address)
                    .then(geometry => {
                        console.log(utils.string_format("geometry - {0}", geometry))
                        if(geometry == undefined){
                            Alert.alert('Could not connect to google maps and fetch the address')
                            return
                        }

                        var field_values = this.state.field_values;
                        field_values['address'] = address

                        this.setState(prev_state => {
                            return {
                                user_id: prev_state.user_id,
                                form_objects: prev_state.form_objects,
                                categories: prev_state.categories,
                                selected_category: prev_state.selected_category,
                                selected_sub_category: prev_state.selected_sub_category,
                                event_name: prev_state.event_name,
                                show_date: prev_state.show_date,
                                date: prev_state.date,
                                location: {latitude: geometry.latitude,
                                            longitude: geometry.longitude,
                                            address: address},
                                additional_data: prev_state.additional_data,
                                max_num_of_participants: prev_state.max_num_of_participants,
                                current_form: prev_state.current_form,
                                field_values: prev_state.field_values,
                                invalid_fields: prev_state.invalid_fields,
                                registered_fields: prev_state.registered_fields,
                                pull_forms: prev_state.pull_forms
                            }
                        })
                    })
    }

    invalid_value_cb = (field_name, error_msg) => {
        this.setState(prev_state => {
            var invalid_fields = prev_state.invalid_fields
            invalid_fields[field_name] = error_msg
            return {
                user_id: prev_state.user_id,
                form_objects: prev_state.form_objects,
                categories: prev_state.categories,
                selected_category: prev_state.selected_category,
                selected_sub_category: prev_state.selected_sub_category,
                event_name: prev_state.event_name,
                show_date: prev_state.show_date,
                date: prev_state.date,
                location: prev_state.location,
                additional_data: prev_state.additional_data,
                max_num_of_participants: prev_state.max_num_of_participants,
                current_form: prev_state.current_form,
                invalid_fields: prev_state.invalid_fields,
                registered_fields: prev_state.registered_fields,
                pull_forms: prev_state.pull_forms
            }
        })
    }

    clean_invalid_value_cb = (field_name) => {
        var invalid_fields = this.state.invalid_fields;
        if(!invalid_fields.hasOwnProperty(field_name))
            return;

        delete invalid_fields[field_name];
        this.setState(prev_state => {
            // let invalid_fields = prev_state.invalid_fields
            // delete invalid_fields[field_name]
            return {
                user_id: prev_state.user_id,
                form_objects: prev_state.form_objects,
                categories: prev_state.categories,
                selected_category: prev_state.selected_category,
                selected_sub_category: prev_state.selected_sub_category,
                event_name: prev_state.event_name,
                show_date: prev_state.show_date,
                date: prev_state.date,
                location: prev_state.location,
                additional_data: prev_state.additional_data,
                max_num_of_participants: prev_state.max_num_of_participants,
                current_form: prev_state.current_form,
                field_values: prev_state.field_values,
                invalid_fields: prev_state.invalid_fields,
                registered_fields: prev_state.registered_fields,
                pull_forms: prev_state.pull_forms
            }
        })
    }

    register_as_field = (field_name) => {
        var registered_fields = this.state.registered_fields;
        registered_fields.push(field_name);

        this.setState(prev_state => {
            return {
                user_id: prev_state.user_id,
                form_objects: prev_state.form_objects,
                categories: prev_state.categories,
                selected_category: prev_state.selected_category,
                selected_sub_category: prev_state.selected_sub_category,
                event_name: prev_state.event_name,
                show_date: prev_state.show_date,
                date: prev_state.date,
                location: prev_state.location,
                additional_data: prev_state.additional_data,
                max_num_of_participants: prev_state.max_num_of_participants,
                current_form: prev_state.current_form,
                field_values: prev_state.field_values,
                invalid_fields: prev_state.invalid_fields,
                registered_fields: registered_fields,
                pull_forms: prev_state.pull_forms
            }
        })
    }

    _validate_registered_fields = () => {
        var alerts = []
        if(!Object.keys(this.state.location).length){
            alerts.push('Location was not picked')
        }

        if(!this.state.date){
            alerts.push('Date was not picked')
        }

        var registered_fields = this.state.registered_fields;
        registered_fields.forEach(field_name => {
            if(!this.state.field_values.hasOwnProperty(field_name)){
                alerts.push(utils.string_format('{0} was not picked', field_name))
            }
        })
        if(alerts.length)
            return [false, alerts];
        
        return [true, alerts];
    }

    _validate_values = () => {
        let invalid_fields = this.state.invalid_fields;
        var alerts = []
        if(!Object.keys(invalid_fields).length)
            return [true, alerts];

        for(key in invalid_fields){
            alerts.push(invalid_fields[key])
        }

        return [false, alerts]
    }

    submit_form = async () => {
        // Submit the form.
        // submitting all form fields, and adding to the form:
        // categories, location, date(to help access in filter methods)

        let validation_result = 0;
        let alerts_result = 1;
        var alerts = []

        results = this._validate_registered_fields()
        if(!results[validation_result]){
            results[alerts_result].forEach(alert_message => {alerts.push(alert_message)})
            console.log(alerts)
        }

        results = this._validate_values()
        if(!results[validation_result]){
            results[alerts_result].forEach(alert_message => {alerts.push(alert_message)})
            console.log(alerts)
        }
                
        if(alerts.length){
            alert_msg = ''
            alerts.forEach(alert => {
                alert_msg = utils.string_format('{0}{1}\n\n', alert_msg, alert);
            })
            correction_error_message = 'Please fix the corrections above.\nThe form will be delivered only after it is fixed'
            alert_msg = utils.string_format('{0}{1}', alert_msg, correction_error_message)
            alert_title = 'Event was not delivered'
            Alert.alert(alert_title, alert_msg)
            return
        }

        // passed validations
        var fields = this.state.field_values;
        var form = {};
        form['owner_id'] = this.state.user_id
        form['category'] = this.state.selected_category ? this.state.selected_category : 'Default'
        form['sub_category'] = this.state.selected_sub_category ? this.state.selected_sub_category : 'Default'
        form['location'] = this.state.location;
        form['raw_date'] = this.state.date.getTime();
        form['name'] = this.state.field_values['Event Name'];
        form['max_num_of_participants'] = this.state.max_num_of_participants ? this.state.max_num_of_participants : 0;
        form['fields'] = {}
        for(var key in fields){
            form['fields'][key]=fields[key];
        }
        
        // send the form to the server
        sent_form = await this._send_form(form);
        if(sent_form){
            Alert.alert('Created the event!');
        }
        else{
            return;
        }
    }

    _send_form = async (form) => {
        console.log(form)
        let tries = 0;
        let result = false;

        while(!result && tries < 3){
            result = await fetch(events_api,
                                {
                                    method: 'POST',
                                    headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(form)
                                })
                            .then(response =>  response.json()) 
                            .then(server_response => {
                                if(server_response.status == 'success'){
                                    return true
                                }
                                else{
                                    console.log('server failed')
                                    tries = 3;
                                    Alert.alert(server_response.error);
                                    return false
                                }
                            })
                            .catch(error => {
                                console.log('app failed')
                                console.log(error);
                                if(tries >= 2){
                                    Alert.alert(error);
                                }
                                return false
                            })
            tries = tries + 1;
        }
        return result;
    }
}