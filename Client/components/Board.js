import React from 'react';
import { View, Text, Alert, TouchableHighlight, BackHandler, ToastAndroid} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import styles from '../utils/styles';
import EventsBoard from './EventsBoard';
import Categories from './Categories';
import AppTitle from './AppTitle';
import ClosedEvents from './ClosedEvents';

import { events as events_server_api } from '../utils/Server_api';
import { formats as formats_api, events as events_api } from '../utils/Server_api';
import * as utils from '../utils/utils';
import * as storage_utils from '../utils/DataStorage';
import { nav } from './navigation_pages/Login';

// Text/RaisedButton ref - https://github.com/n4kz/react-native-material-buttons
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';

export default class Board extends React.Component{

    constructor(props){
        super(props);
        console.log('Board ctor');
        const { navigation } = this.props;
        const userID = navigation.getParam('id', '0');
        const userName = navigation.getParam('username', '');
        this.state = {
            id: userID,
            username: userName,
            isLoading: true,
			aroundMeButtonOpacity: 0.5,
			boardButtonOpacity: 1,
			menuActive: false,
			filterScreenActive: false,
			menuOpacity: 0.5,
			filterOpacity: 0.5,
			event_kind: 'board',
			// flag to indicate if should fetch events again from the server
			load_events: true,
			// the public events
			events: [],
			filteredEvents: [],
			filterSettings: {active: false, category: 'Default', sub_category: 'Default'},
			//////
            form_objects: [],
            categories: {},
            selected_category: 'Default',
            selected_sub_category: 'Default',
            location: {},
            current_form: {category: null, sub_category: null},
            field_values: {},
            invalid_fields: {},
            registered_fields: ['Event Name'],
			closed_events: null,
		}
		global.id = userID;
		global.username = userName;
	}



	async componentDidUpdate(prev_props){

		if(!this.state.load_events)
			return;
		
		events = await this.fetch_events();
		filteredEvents = await this.filter_events(events);
		// console.log('==== ==== update ==== ====');
		// console.log(events);
		// console.log('--------------------')
		// console.log(filteredEvents); 
		if(!events){
			return;
		}
	
			// filter the events \\
			//============================= READ THIS BEFORE WORKING ON FILTER ==========================\\
			// need to think if filttering process should be here,                                       \\
			// because user might change filter options, and refetching                                  \\
			// events each time user change filter is not scalable, and not officiant.                   \\
			// maybe add filtered_events to state, and present them if user chosed filter options.       \\
			//===========================================================================================\\
			//																							 \\
			//  filtered_events = this.filter_events(events)											 \\
			//===========================================================================================\\

		this.setState(prev_state => {
			return {
				id: prev_state.id,
				username: prev_state.username,
				isLoading: false,
				aroundMeButtonOpacity: prev_state.aroundMeButtonOpacity,
				boardButtonOpacity: prev_state.boardButtonOpacity,
				menuActive: prev_state.menuActive,
				menuOpacity: prev_state.menuOpacity,
				event_kind: prev_state.event_kind,
				load_events: false,
				events: events,
				filteredEvents: filteredEvents
			}
		});
	}
	
	async componentDidMount(){

		BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

		if(!this.state.load_events){
			return;
		}
		
		events = await this.fetch_events();
		filteredEvents = await this.filter_events(events);
		// console.log('==== ==== mount ==== ====');
		// console.log(events);
		// console.log('--------------------')
		// console.log(filteredEvents); 
		if(!events){
			return;
		}

		//?

		var form_objects = null;
		form_objects = await this._pull_forms();
        if(!form_objects){
            return;
        }
        var categories = utils.collect_categories(form_objects);
		console.log('--------------------- categories --------------------');
        console.log(categories);

        this.setState(prev_state => {
            return {
                categories: categories,
            }
        })
        
	   events = await this.fetch_events()
	   if(!events){
		   events = [];
	   }

	   // informing the user about subscribed events that got closed
		var closed_events = this.fetch_closed_events();
		if(!closed_events){
			closed_events = null;
		}
			
        this.setState(prev_state => {
            return {
                id: prev_state.id,
				username: prev_state.username,
				isLoading: false,
				aroundMeButtonOpacity: prev_state.aroundMeButtonOpacity,
				boardButtonOpacity: prev_state.boardButtonOpacity,
				menuActive: prev_state.menuActive,
				menuOpacity: prev_state.menuOpacity,
				event_kind: prev_state.event_kind,
				load_events: false,
				events: events,
				filteredEvents: filteredEvents,
				closed_events: closed_events
            }
        });
	}
	
	async componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
	}
	
	handleBackButton() {
        ToastAndroid.show('Back button is disabled', ToastAndroid.SHORT);
        return true;
    }

    boardButton() {
		this.setState({aroundMeButtonOpacity: 0.5});
		this.setState({boardButtonOpacity: 1});
		this.setState({menuOpacity: 0.5});
		this.setState({filterOpacity: 0.5});				
        this.setState({event_kind: 'board'});
		this.setState({menuActive: false});
		this.setState({filterScreenActive: false});
		this.setState({load_events: true});
		this.render();
	}

	aroundMeButton() {
		this.setState({aroundMeButtonOpacity: 1});
		this.setState({boardButtonOpacity: 0.5});
		this.setState({menuOpacity: 0.5});
		this.setState({filterOpacity: 0.5});
        this.setState({event_kind: 'map'});
		this.setState({menuActive: false});
		this.setState({filterScreenActive: false});
		this.setState({load_events: true});		
		this.render();		
	}

	menuButton() {
		this.setState({aroundMeButtonOpacity: 0.5});
		this.setState({boardButtonOpacity: 0.5});
		this.setState({menuOpacity: 1});
		this.setState({filterOpacity: 0.5});
		this.setState({menuActive: true});
		this.setState({filterScreenActive: false});
		this.render();
    }
	
	filtersButton() {
		this.setState({aroundMeButtonOpacity: 0.5});
		this.setState({boardButtonOpacity: 0.5});
		this.setState({menuOpacity: 0.5});
		this.setState({filterOpacity: 1});
		this.setState({menuActive: false});		
		this.setState({filterScreenActive: true});		
		this.render();
	}
    
    render(){
        if (this.state.menuActive){
			return this.menuMode();
		}
		else if (this.state.filterScreenActive){
			return this.renderFilterOptions();
		}
		else {
            return this.renderEvents();
		}
    }

    renderEvents(){
        return(
            <View style={styles.wholeApp}>
				<AppTitle/>
				<View style={styles.topContent}>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.menuButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.menuOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome name="user" size={24} />
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.boardButton()} underlayColor={'transparent'}
						style={{opacity: this.state.boardButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Events List
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.aroundMeButton()} underlayColor={'transparent'}
						style={{opacity: this.state.aroundMeButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Events Map
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.filtersButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.filterOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome name="filter" size={24} />
							</Text>
						</TouchableHighlight>
					</View>
				</View>
                <View style={styles.mainContent}>
					{/* Closed events */}
					{this.state.closed_events ? <ClosedEvents events={this.state.closed_events}
															  close_modal={() => this.setState({closed_events: null})} />:null}
					{/* Events Board */}
                    <EventsBoard id={this.state.id} events={this.state.filteredEvents} event_kind={this.state.event_kind}/>
                </View>
				<View style={styles.bottomContent}>
					<TouchableHighlight onPress={() => {this.setState({load_events: true})}} underlayColor={'transparent'}>
						<Text style={{margin: 5, fontSize: 24, textAlign: 'center', color: '#77c8ce'}}>
						<FontAwesome name="refresh" size={24} />
						</Text>
					</TouchableHighlight>
					<TextButton 
						title='New Event'
						onPress={() => nav.navigate('NewEventScreen')}
						titleColor='white'
						style={styles.newEventButton}						
					/>
                </View>
			</View>
        )
    }

    menuMode(){
		return(
			<View style={styles.wholeApp}>
				<AppTitle/>
				<View style={styles.topContent}>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.menuButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.menuOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome name="user" size={24} />
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.boardButton()} underlayColor={'transparent'}
						style={{opacity: this.state.boardButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Events List
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.aroundMeButton()} underlayColor={'transparent'}
						style={{opacity: this.state.aroundMeButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Events Map
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.filtersButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.filterOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome name="filter" size={24} />
							</Text>
						</TouchableHighlight>
					</View>
				</View>
                <View style={{ flex: 0.8 }}>
					<Text style={{margin: 5, fontSize: 24, textAlign: 'center', color: '#77c8ce'}}>
						{this.state.username}
					</Text>
					<TextButton 
						title='My Events'
						onPress={() => this.display_owned_events(this.state.id)}
						titleColor='white'
						style={styles.userMenuButton}
					/>
					<TextButton 
						title='Subscribed Events'
						onPress={() => this.display_subscribed_events(this.state.id)}
						titleColor='white'
						style={styles.userMenuButton}
					/>
					<TextButton 
						title='Logout'
						onPress={this._delete_user}
						titleColor='white'
						style={styles.userMenuLogoutButton}						
					/>
				</View>
				<View style={{ flex: 0.1 }}>
					<Text style={{margin: 5, fontSize: 10, textAlign: 'center', color: '#77c8ce'}}>
						All rights reserved to Yotam Boaz, Gal Rotenberg & Roy Koren, 2018
					</Text>
				</View>
			</View>
		);
	}

	renderFilterOptions(){
		return(
			<View style={styles.wholeApp}>
				<AppTitle/>
				<View style={styles.topContent}>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.menuButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.menuOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome name="user" size={24} />
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.boardButton()} underlayColor={'transparent'}
						style={{opacity: this.state.boardButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Events List
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.aroundMeButton()} underlayColor={'transparent'}
						style={{opacity: this.state.aroundMeButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Events Map
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.filtersButton()} underlayColor={'transparent'}>
							<Text style={{opacity: this.state.filterOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome name="filter" size={24} />
							</Text>
						</TouchableHighlight>
					</View>
				</View>
				<View style={{flex:0.6}}>
					<Categories
						selected_category={this.state.filterSettings.category}
						selected_sub_category={this.state.filterSettings.sub_category}
						categories={this.state.categories}
						on_category_changed={this.on_category_changed}
						on_sub_category_changed={this.on_sub_category_changed}
					/> 
				</View>
				<View style={{flex:0.3}}>				
					<TextButton 
						title='Activate Filters'
						onPress={() => this.activateFilters(this)}
						titleColor='white'
						style={styles.filterMenuButton1}
					/>
					<TextButton 
						title='Display All Events'
						onPress={() => this.removeFilters(this)}
						titleColor='white'
						style={styles.filterMenuButton2}						
					/>
				</View>
			</View>
		);
	}

	activateFilters(_this) {
		if (_this.state.current_form.category == null && _this.state.current_form.sub_category == null){
			Alert.alert('Error', 'You must choose category and sub-category!');
			_this.boardButton();
			return;
		}	
		_this.setState({
			filterSettings: {active: true, category: _this.state.current_form.category, sub_category: _this.state.current_form.sub_category},
			// load_events: true
		});
		//Alert.alert('Success', 'Filter was activated!');
		_this.boardButton();
	}

	removeFilters(_this) {
		_this.setState({
			filteredEvents: _this.state.events,
			filterSettings: {active: false, category: 'Default', sub_category: 'Default'},
			// load_events: true		
		})
		//Alert.alert('Success', 'Filter was removed!');		
		_this.boardButton();
	}
	
	fetch_events = async () => {
        let tries = 0;
        var events = null;
        while(!events && tries < 3){
            events = await fetch(events_server_api)
                 .then(response => response.json())
                 .then(server_response => {
                     if(server_response.status == 'success'){
                         return server_response.events;
                     }
                     else{
                        Alert.alert(error);
                        tries = 3;
                     }
                 })
                 .catch(error => {
                     console.log(error);
                     if(tries >= 2){
                         Alert.alert('Could not fetch events from the server, pleae try again');
                     }
                 })
            tries = tries + 1;
        }
        return events
	}
	
	filter_events = async (events) => {
		console.log('=========== filter_events ============');
		var filteredEvents = [];
		if (this.state.filterSettings.active){
			var category = this.state.filterSettings.category;
			var sub_category = this.state.filterSettings.sub_category;
			console.log('category::::'+category);
			console.log('sub_category::::'+sub_category);				
			if (category == null && sub_category == null){
				return events;
			}
			else if (sub_category == null) {
				events.forEach(function(event){			
					if (event.category == category){
						filteredEvents.push(event);
						console.log('event was added to filteredEvents');
					}
				});
			}
			else {
				events.forEach(function(event){			
					if (event.category == category && event.sub_category == sub_category){
						filteredEvents.push(event);
						console.log('event was added to filteredEvents');
					}
				});
			}
			console.log(filteredEvents);
			return filteredEvents;
		}
		console.log(events);
		return events;		
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
	
	on_category_changed = (category) => {
        this.setState(prev_state => {
            return {
				form_objects: prev_state.form_objects,
				categories: prev_state.categories,
				selected_category: category,
				selected_sub_category: null,
				location: prev_state.location,
				current_form: {category: null, sub_category: null},
				field_values: {},
				invalid_fields: prev_state.invalid_fields,
				registered_fields: prev_state.registered_fields,
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
					form_objects: prev_state.form_objects,
					categories: prev_state.categories,
					selected_category: category,
					selected_sub_category: sub_category,
					location: prev_state.location,
					current_form: {category: category, sub_category: sub_category},
					// Changed dynamic form, thus emptying the current one
					field_values: {},
					invalid_fields: prev_state.invalid_fields,
					registered_fields: registered_fields
                }
		})
    }

	fetch_closed_events = async () => {
		//pull closed events that the user subscribed to.
		let api = utils.string_format('{0}/closed?user_id={1}', events_api, this.state.id);

		closed_events = await fetch(api)
							  .then(response => response.json())
							  .then(server_response => {
								  if(server_response.status == 'success'){
									  return server_response.events;
								  }
								  else{
									  console.log('error accured while fetching closed_Events from server');
									  console.log(server_response.error);
									  return null;
								  }
							  })
							  .catch(error => {
								  console.log('internal error');
								  console.log(error);
								  return null;
							  })
		if(closed_events && closed_events.length > 0)
			return closed_events;

		events = [
			{
				id: 112,
				name: "Tennis",
				category: "Sports & Fitness",
				location: {
					address: "Yoav 20 ramat gan",
					latitude: 32.068424,
					longitude: 34.824785
				},
				isActive: true,
				fields: {
					'Required accessories/equipment': "None",
					'address': "Yoav 20 ramat gan",
					'Event Name': "Tennis",
					'Type of field': "Outdoor, asphalt"
				},
				owner_id: 111,
				sub_category: "Ball Games",
				raw_date: 1537684156244,
				max_num_of_participants: 3,
				current_num_of_participants: 2,
				subscribed_users: [
					{
						id: 116,
						username: "user3",
						email: "user3@gmail.com"
					},
					{
						id: 144,
						username: null,
						email: "galrotenberg3@gmail.com"
					}
				],
				subscribed_users_ids: [
					116,
					144
				]
			},
			{
				id: 145,
				name: "אירוע בדיקה 2",
				category: "Default",
				location: {
					address: "הפודים 11 רמת גן",
					latitude: 32.0916274,
					longitude: 34.8176193
				},
				isActive: true,
				fields: {
					"Event Name": "אירוע בדיקה 2",
					"address": "הפודים 11 רמת גן"
				},
				owner_id: 143,
				sub_category: "Default",
				raw_date: 1538232240000,
				max_num_of_participants: 4,
				current_num_of_participants: 1,
				subscribed_users: [
					{
						id: 144,
						username: null,
						email: "galrotenberg3@gmail.com"
					}
				],
				subscribed_users_ids: [
					144
				]
			},
		]
		return events;
	}
	
	inform_with_closed_events = (closed_events) => {
		var event_references = closed_events.forEach(event => {
			return {text: event.name, onPress: () => this.setState({closed_event: event})}
		})

		return event_references;
	}

    _delete_user = async () => {
        await storage_utils.removeData('user_id');
        await storage_utils.removeData('user_name');
        await storage_utils.removeData('user_id');
        console.log('deleted all user data');
        nav.navigate('LoginScreen');
	}
	
	display_owned_events = async () => {
		nav.navigate('ManageEventsContainer', {
			id: this.state.id,
			kind: 'owned_events'
		});
	}

	display_subscribed_events = async () => {
		nav.navigate('ManageEventsContainer', {
			id: this.state.id,
			kind: 'subscribed_events'
		});
	}
}