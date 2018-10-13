import React from 'react';
import { View, Text, Alert, Image, TouchableHighlight, BackHandler, ToastAndroid} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import styles from '../utils/styles';
import EventsBoard from './EventsBoard';
import Categories from './Categories';
import AppTitle from './AppTitle';
import ClosedEvents from './ClosedEvents';
import DatePicker from './DatePicker';
import TopMenu from './TopMenu';

import { events as events_server_api } from '../utils/Server_api';
import { formats as formats_api, events as events_api } from '../utils/Server_api';
import * as utils from '../utils/utils';
import * as storage_utils from '../utils/DataStorage';
import { nav } from './navigation_pages/Login';

// Text/RaisedButton ref - https://github.com/n4kz/react-native-material-buttons
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';

TIMEOUT_INTERVAL = 60000; // 1 minute

export default class Board extends React.Component{

    constructor(props){
        super(props);
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
			filterSettings: {active: false, category: 'Default', sub_category: 'Default', show_date: true, date: null},
			//////
            form_objects: [],
            categories: {},
            selected_category: 'Default',
            selected_sub_category: 'Default',
            registered_fields: ['Event Name'],
			closed_events: [],
			refresh_enabled: true
		}
		global.id = userID;
		global.username = userName;
	}



	async componentDidUpdate(prev_props){
		if(!this.state.load_events){
			return;
		}
		
		events = await this.fetch_events();
		if(!events){
			events = [];
		}
		else{
			 filteredEvents = this.filter_events(events);
			 var reset_categories = false;
			 if(filteredEvents.length == 0){
				 filteredEvents = events;
				 Alert.alert('No events in selected filter', 'showing all events');
				 reset_categories = true;
			 }
		}

		this.setState(prev_state => {
			selected_category = reset_categories ? null : this.state.selected_category;
			selected_sub_category = reset_categories ? null : this.state.selected_sub_category;
			filterSettings = reset_categories ? {category: 'Default', sub_category: 'Default', active: false, show_date: true, date: null} : this.state.filterSettings;

			return {
				id: prev_state.id,
				username: prev_state.username,
				isLoading: false,
				selected_category: selected_category,
				selected_sub_category: selected_sub_category,
				filterSettings: filterSettings,
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

		var form_objects = null;
		form_objects = await this._pull_forms();
		var categories;
        if(form_objects){
			var categories = utils.collect_categories(form_objects);
			console.log('--------- fetched categories ----------');
			console.log(categories)
		}
		else{
			categories = null;
		}
		
	   events = await this.fetch_events()
	   if(!events){
		   events = [];
	   }
	   
	   //initialising filtered_events to events
	   var filteredEvents = events;

	   // informing the user about subscribed events that got closed
		var closed_events = await this.fetch_closed_events();
		if(!closed_events){
			closed_events = [];
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
				categories: categories,
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
				<TopMenu board={this} />
                <View style={styles.mainContent}>
					{/* Closed events */}
					{this.state.closed_events.length > 0 ? <ClosedEvents events={this.state.closed_events}
															  close_modal={() => this.setState({closed_events: []})} />:null}
					{/* Events Board */}
                    <EventsBoard id={this.state.id} events={this.state.filteredEvents} event_kind={this.state.event_kind}/>
                </View>
				<View style={styles.bottomContent}>
					<TouchableHighlight onPress={() => {
															setTimeout(() => {this.setState({refresh_enabled: true})}, TIMEOUT_INTERVAL);
															this.setState({load_events: true, refresh_enabled: false});
														}}
										underlayColor={'transparent'}
										disabled={!this.state.refresh_enabled} >
						<Text style={{margin: 5, fontSize: 24, textAlign: 'center', color: this.state.refresh_enabled ? '#77c8ce' : 'gray'}}>
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
				<TopMenu board={this} />
                <View style={{ flex: 0.6 }}>
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
				<View style={{ flex: 0.2 }}>
					<Text style={{marginTop: 15, marginBottom: 10, fontSize: 24, textAlign: 'center', color: '#E2FCFF'}}>
						<Image style={{width: 280, height: 210}} source={require('../logo.png')} />
					</Text>
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
				<TopMenu board={this} />
				<View style={{flex:0.6, margin:10, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
					<View style={{margin: 5}}>
						<Categories
							selected_category={this.state.selected_category}
							selected_sub_category={this.state.selected_sub_category}
							categories={this.state.categories}
							on_category_changed={this.on_category_changed}
							on_sub_category_changed={this.on_sub_category_changed}
						/>
					</View>
					<View style={{flexDirection: 'row', margin: 5}}>
						{
							this.state.filterSettings.date!=null &&
								(<View style={{flexDirection: 'row'}}>
								<Text style={{textAlign: 'left', fontSize: 12, color: '#969696'}}>
									{utils.string_format(': ')}
									{this.state.filterSettings.date.toDateString()}
									{utils.string_format(' ')}									
									{utils.string_format('{0}:{1}', this.state.filterSettings.date.getHours(), this.state.filterSettings.date.getMinutes())}
								</Text>
								</View>)
						}
						<Text style={{textAlign: 'left', fontSize: 12, color: '#969696'}}>Show events until</Text>						
					</View>
					<View style={{margin: 5}}>
						<DatePicker on_date_pick={this.on_date_pick}
										show_date={this.state.filterSettings.show_date}
										confirm_date={this.confirm_date}
										cancel_date={this.cancel_date}
						/>
					</View>
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
		_this.setState({
			filterSettings: {active: true, category: _this.state.selected_category, sub_category: _this.state.selected_sub_category, show_date: true, date: _this.state.filterSettings.date},
		});
		_this.boardButton();
	}

	removeFilters(_this) {
		_this.setState({
			filteredEvents: _this.state.events,
			filterSettings: {active: false, category: 'Default', sub_category: 'Default', show_date: true, date: null},
		})
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
	
	filter_events = (events) => {
		console.log('=========== filter_events ============');
		var filteredEvents = [];

		if (!this.state.filterSettings.active){
			return events;
		}
		var category = this.state.filterSettings.category;
		var sub_category = this.state.filterSettings.sub_category;
		var requestedDate = this.state.filterSettings.date == null ? null : this.state.filterSettings.date.getTime();		

		if(category != null && category != 'Default'){
			console.log('filtering category: ' + category);
			events.forEach(function(event){			
				if(event.category == category && (requestedDate == null || requestedDate > event.raw_date)){
					filteredEvents.push(event);
				}
			});
		}
		if(sub_category != null && sub_category != 'Default'){
			console.log('filtering sub-category: ' + sub_category);
			var temp_filteredEvents = filteredEvents.slice();
			temp_filteredEvents.forEach(function(event){			
				if (event.sub_category != sub_category){
					var index = 0;
					for(index in filteredEvents){
						if(filteredEvents[index].id == event.id){
							break;
						}
					}
					filteredEvents.splice(index, 1);
				}
			});
		}
		if (category == null || category == 'Default'){
			if (requestedDate == null) {
				return events;
			}
			else {
				events.forEach(function(event){			
					if(requestedDate > event.raw_date){
						filteredEvents.push(event);
					}
				});
			}
		}	
		return filteredEvents;
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
		console.log(category);
		if(this.state.filterSettings.category == category)
			return;

        this.setState(prev_state => {
            return {
				form_objects: prev_state.form_objects,
				categories: prev_state.categories,
				selected_category: category,
				selected_sub_category: null
            }
        })
    }

    on_sub_category_changed = (category, sub_category) => {
        current_category = this.state.selected_category;
        current_sub_category = this.state.selected_sub_category;
        if(category==current_category && sub_category==current_sub_category)
            // categories were not changed, thus no need to re-render
            return

        console.log(utils.string_format('changed filter categories to {0}\\{1}', category, sub_category))

        this.setState(prev_state => {
            return {
					form_objects: prev_state.form_objects,
					categories: prev_state.categories,
					selected_category: category,
					selected_sub_category: sub_category,
                }
		})
    }

	fetch_closed_events = async () => {
		//pull closed events that the user subscribed to.
		var api = utils.string_format('{0}/closed?user_id={1}', events_api, this.state.id);

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
		if(closed_events && closed_events.length > 0){
			console.log('-------- fetceed closed events ---------');
			console.log(closed_events);
			return closed_events;
		}
		else{
			return [];
		}
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

	on_date_pick = () => {
        this.setState(prev_state => {
            let show_date = this.state.filterSettings.show_date;
            return {
				filterSettings: {
					active: this.state.filterSettings.active,
					category: this.state.filterSettings.category,
					sub_category: this.state.filterSettings.sub_category,
					show_date: {show_date},
					date: this.state.filterSettings.date
				}
            }
        })
	}
	
	confirm_date = (date_value) => {
        this.setState(prev_state => {
            return {
				filterSettings: {
					active: this.state.filterSettings.active,
					category: this.state.filterSettings.category,
					sub_category: this.state.filterSettings.sub_category,
					show_date: false,
					date: date_value
				}
            }
        })
	}
	
	cancel_date = () => {
        this.setState(prev_state => {
            return {
				filterSettings: {
					active: this.state.filterSettings.active,
					category: this.state.filterSettings.category,
					sub_category: this.state.filterSettings.sub_category,
					show_date: false,
					date: this.state.filterSettings.date
				}				
            }
        })
    }
}