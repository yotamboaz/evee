import React from 'react';
import { View, Button, Text, TouchableHighlight } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import styles from '../utils/styles';

export default class MapDisplay extends React.Component{

    constructor(props){
        super(props);
        console.log(props.events);
        console.log('MapDisplay ctor');
        this.state = {
            events: props.events,
            //_this: props._this,
        }
        console.log('================== '+this.state.events);
    }

    render(){
        return(
            <View style={styles.wholeApp}>
                <View style={styles.topContent}>
                    <View style={{flex: 0.1, padding: 8}}>
                        <TouchableHighlight underlayColor={'transparent'}>
                            <Text style={{margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
                                <FontAwesome name="user" size={24} />
                            </Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{flex: 0.4, padding: 8}}>
                        <TouchableHighlight underlayColor={'transparent'}
                        style={{borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
                            <Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
                            Board
                            </Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{flex: 0.4, padding: 8}}>
                        <TouchableHighlight underlayColor={'transparent'}
                        style={{borderRadius:10, borderWidth: 1, borderColor: '#77c8ce'}}>
                            <Text style={{margin: 5, fontSize: 16, textAlign: 'center', color: '#77c8ce'}}>
                            Around Me
                            </Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{flex: 0.1, padding: 8}}>
                        <TouchableHighlight  underlayColor={'transparent'}>
                            <Text style={{margin: 5, fontSize: 24, textAlign: 'left', color: '#77c8ce'}}>
                                <FontAwesome name="filter" size={24} />
                            </Text>
                        </TouchableHighlight>
                    </View>
                </View>
                <View style={styles.mainContent}>
                    {this.state.events}
                </View>
            </View>
        )
    }
}