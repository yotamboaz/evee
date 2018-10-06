import React from 'react';
import { View, Button, TextButton } from 'react-native';
import styles from '../utils/styles';

// DateTimePicker ref - https://github.com/mmazzarolo/react-native-modal-datetime-picker
import DateTimePicker from 'react-native-modal-datetime-picker';

const DatePicker = (props) => {
    console.log(props)
    let is_visible = props.show_date.show_date
    return(
        <View>
            <Button onPress={props.on_date_pick} color='#77c8ce' title='Choose date' />
            {/* <TextButton 
                title='Choose Date'
                onPress={props.on_date_pick}
                titleColor='white'
                style={styles.userMenuButton}						
            /> */}
            <DateTimePicker
            mode='datetime'
            isVisible={is_visible}
            onConfirm={props.confirm_date}
            onCancel={props.cancel_date} />
        </View>
    )
}

export default DatePicker