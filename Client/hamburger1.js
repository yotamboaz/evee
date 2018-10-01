import React, {Component} from 'react';
import { View } from 'react-native';

// react native hamburger ref - https://www.npmjs.com/package/react-native-hamburger
import Hamburger from 'react-native-hamburger';

export default class Hamburger1 extends Hamburger {
	constructor(props){
		super(props);
		this.state={
			active: false
		}
	}
	render(){
		return (
			<View>
				<Hamburger active={this.state.active}
					type="spinCross"
					color="#77c8ce"
					onPress={()=> this.setState({active: !this.state.active})}
				/>
			</View>
		);
    }
}