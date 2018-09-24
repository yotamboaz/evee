import React from 'react';
import { View, ActivityIndicator, Button, ListView, FlatList, Text, Alert, StyleSheet, TouchableHighlight, InteractionManager, Platform, TextButton } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { StackNavigator, DrawerNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation';
import styles from '../utils/styles';
import EventsBoard from './EventsBoard';

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
            menuOpacity: 0.5,
            event_kind: 'board'
        }
        console.log('================== '+this.state.id + " :: " + this.state.username);
    }

    boardButton() {
		this.setState({aroundMeButtonOpacity: 0.5});
		this.setState({boardButtonOpacity: 1});
        this.setState({event_kind: 'board'});
		this.setState({menuActive: false});
		this.render();
	}

	aroundMeButton() {
		this.setState({aroundMeButtonOpacity: 1});
		this.setState({boardButtonOpacity: 0.5});
        this.setState({event_kind: 'map'});
		this.setState({menuActive: false});		
		this.render();		
	}
	
	filtersButton() {
		Alert.alert("filters");
	}

	menuButton() {
		this.setState({menuActive: !this.state.menuActive});
		this.setState({menuOpacity: 1});
		//this.props.navigation.openDrawer();
		this.render();
    }
    
    render(){
        if (this.state.menuActive){
			return this.menuMode();
		}
		else {
            console.log("going to render menu + events");
            return this.renderEvents();
		}
    }

    renderEvents(){
        return(
            <View style={styles.wholeApp}>
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
							Board
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.aroundMeButton()} underlayColor={'transparent'}
						style={{opacity: this.state.aroundMeButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Around Me
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.filtersButton()} underlayColor={'transparent'}>
							<Text style={{margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome name="filter" size={24} />
							</Text>
						</TouchableHighlight>
					</View>
				</View>
                <View style={styles.mainContent}>
                    <EventsBoard id={this.state.id} event_kind={this.state.event_kind}/>
                </View>
			</View>
        )
    }

    menuMode(){
		return(
			<View style={styles.wholeApp}>
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
							Board
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.4, padding: 8}}>
						<TouchableHighlight onPress={() => this.aroundMeButton()} underlayColor={'transparent'}
						style={{opacity: this.state.aroundMeButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
							<Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
							Around Me
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{flex: 0.1, padding: 8}}>
						<TouchableHighlight onPress={() => this.filtersButton()} underlayColor={'transparent'}>
							<Text style={{margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
							<FontAwesome name="filter" size={24} />
							</Text>
						</TouchableHighlight>
					</View>
				</View>
                <Text style={{margin: 5, fontSize: 24, textAlign: 'center', color: '#77c8ce'}}>
                    {this.state.name}
                </Text>
                <TextButton 
                    title='Logout'
                    onPress={this._delete_user}
                    titleColor='white'
                    color='green'
                    style={{height:'10%'}}
                />
			</View>
		);
    }

    _delete_user = async () => {
        await storage_utils.removeData('user_id');
        await storage_utils.removeData('user_name');
        await storage_utils.removeData('user_id');
        console.log('deleted all user data');
        nav.navigate('LoginScreen');
    }
}