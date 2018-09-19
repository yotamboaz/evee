import React, {Component} from 'react';
import { StyleSheet } from 'react-native';

export { styles };

'use strict';

const styles = StyleSheet.create({
    wholeApp: {
        flexDirection: 'column', //default
        flex: 1,
        backgroundColor: '#E2FCFF',
    },
    loginPage: {
        flexDirection: 'column',
        padding: 10,
        justifyContent: 'space-between'
    },
    insertNameLine: {
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'space-between'
    },
    textInputView: {
        flex: 1
    },
    eventButton: {
        backgroundColor: "#b3dde0"
    },
    eventButtonPressed: {
        backgroundColor: "#000000"
    },
    // textInput: {
    //     maxLength = "20",
    //     autoCapitalize='words'
    // },
    topContent: {
        flexDirection: 'row',
        flex: 0.1,
        backgroundColor: '#E2FCFF'
    },
    mainContent: {
        flex: 0.75,
        //justifyContent: 'space-around',
        //alignItems: 'center',
    },
    bottomContent: {
        flex: 0.15,
        padding: 5,
        justifyContent: 'flex-end',
    },
    allRightsReserved: {
        color: 'black',
        fontSize: 10,
        textAlign: 'right',
        paddingTop: 20,
    },
    CategoryPicker: {
        alignSelf: 'stretch',
    },
});

module.exports = styles;