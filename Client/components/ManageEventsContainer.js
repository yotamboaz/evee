import React from 'react';
import { View, ActivityIndicator, Button, ListView, FlatList, Text, Alert, StyleSheet, TouchableHighlight, InteractionManager, Platform } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { StackNavigator, DrawerNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation';
import styles from '../utils/styles';
import EventsBoard from './EventsBoard';
import ManageEvents from './ManageEvents';

import { events as events_server_api } from '../utils/Server_api';
import * as utils from '../utils/utils';
import * as storage_utils from '../utils/DataStorage';
import { nav } from './navigation_pages/Login';

// Text/RaisedButton ref - https://github.com/n4kz/react-native-material-buttons
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';

export default class ManageEventsContainer extends React.Component{

    constructor(props){
        super(props);
        const { navigation } = this.props;
        const userID = navigation.getParam('id', '0');
        const _kind = navigation.getParam('kind', '');
        this.state = {
            id: userID,
            kind: _kind
		}
    }

    render(){
		return(
			<View style={styles.wholeApp}>
				<View>
                    <TouchableHighlight onPress={() => nav.navigate("Board")} underlayColor={'transparent'}>
                        <Text style={{margin: 5, fontSize: 24, textAlign: 'center', color: '#77c8ce'}}>
                        Return
                        </Text>
                    </TouchableHighlight>
				</View>
                <View style={{flex: 0.9}}>
                    <ManageEvents id={this.state.id} kind={this.state.kind}/>
                </View>
			</View>
		);
	}
}