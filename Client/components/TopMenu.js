import React from 'react';
import { View, Text, Alert, Image, TouchableHighlight, BackHandler, ToastAndroid} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../utils/styles';
import { nav } from './navigation_pages/Login';

// Text/RaisedButton ref - https://github.com/n4kz/react-native-material-buttons
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';

export default class TopMenu extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            board: props.board,
        }
    }

    render() {
        return (
            <View style={styles.topContent}>
                <View style={{flex: 0.1, padding: 8}}>
                    <TouchableHighlight onPress={() => this.state.board.menuButton()} underlayColor={'transparent'}>
                        <Text style={{opacity: this.state.board.state.menuOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
                        <FontAwesome name="user" size={24} />
                        </Text>
                    </TouchableHighlight>
                </View>
                <View style={{flex: 0.4, padding: 8}}>
                    <TouchableHighlight onPress={() => this.state.board.boardButton()} underlayColor={'transparent'}
                    style={{opacity: this.state.board.state.boardButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
                        <Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
                        Events List
                        </Text>
                    </TouchableHighlight>
                </View>
                <View style={{flex: 0.4, padding: 8}}>
                    <TouchableHighlight onPress={() => this.state.board.aroundMeButton()} underlayColor={'transparent'}
                    style={{opacity: this.state.board.state.aroundMeButtonOpacity, borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
                        <Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
                        Events Map
                        </Text>
                    </TouchableHighlight>
                </View>
                <View style={{flex: 0.1, padding: 8}}>
                    <TouchableHighlight onPress={() => this.state.board.filtersButton()} underlayColor={'transparent'}>
                        <Text style={{opacity: this.state.board.state.filterOpacity, margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
                        <FontAwesome name="filter" size={24} />
                        </Text>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}