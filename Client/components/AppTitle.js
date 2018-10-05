import React from 'react';
import { Text, View } from 'react-native';

class AppTitle extends React.Component {

    render(){
        return (
            <View style={{backgroundColor: '#77c8ce'}}>
                <Text style={{marginTop: 15, marginBottom: 10, fontSize: 24, textAlign: 'center', color: '#E2FCFF'}}>
                    Evee
                </Text>
		    </View>
        )
    }
}

export default AppTitle;