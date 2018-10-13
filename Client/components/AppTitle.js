import React from 'react';
import { Text, View, Image } from 'react-native';

class AppTitle extends React.Component {

    render(){
        return (
            <View style={{backgroundColor: '#77c8ce'}}>
                <Text style={{marginTop: 15, marginBottom: 10, fontSize: 24, textAlign: 'center', color: '#E2FCFF'}}>
                    <Image style={{width: 140, height: 105}} source={require('../logo.png')} />
                </Text>
		    </View>
        )
    }
}

export default AppTitle;