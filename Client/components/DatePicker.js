import React from 'react';
import { View, Button } from 'react-native';

// DateTimePicker ref - https://github.com/mmazzarolo/react-native-modal-datetime-picker
import DateTimePicker from 'react-native-modal-datetime-picker';

const DatePicker = (props) => {
    console.log(props)
    let is_visible = props.show_date.show_date
    return(
        <View>
            <Button onPress={props.on_date_pick} title='Choose date' />

            <DateTimePicker
            mode='datetime'
            isVisible={is_visible}
            onConfirm={props.confirm_date}
            onCancel={props.cancel_date} />
        </View>
    )
}

export default DatePicker