import React from 'react';
import { Picker, Text, View } from 'react-native';

// Dropdown ref - https://www.npmjs.com/package/react-native-material-dropdown
import { Dropdown } from 'react-native-material-dropdown';

import styles from '../utils/styles';

export default class Categories extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            selected_category: props.selected_category,
            selected_sub_category: props.selected_sub_category,
            categories: props.categories,
            on_category_changed: props.on_category_changed,
            on_sub_category_changed: props.on_sub_category_changed,
        }
    }

    componentDidUpdate(prev_props){
        if(prev_props.categories != this.props.categories){
            this.setState(prev_state => {
                return {
                    selected_category: this.props.selected_category,
                    selected_sub_category: this.props.selected_sub_category,
                    categories: this.props.categories,
                    on_category_changed: prev_props.on_category_changed,
                    on_sub_category_changed: prev_props.on_sub_category_changed
                }
            })
        }
    }
    
    render() {
        let categories= Object.keys(this.state.categories).map(item => {
            return {value: item}
        })
        let sub_categories = this.state.selected_category == null || this.state.selected_sub_category == 'Default' ? [] : this.state.categories[this.state.selected_category].map(item => {
            return {value: item}
        })

        return (
            <View style={{justifyContent:'flex-start',}}>
                <Dropdown label='Category'
                          data={categories}
                          onChangeText={this._on_category_changed}
                          containerStyle={styles.CategoryPicker}
                          value={this.state.selected_category ? this.state.selected_category : 'Default'} />

                <Dropdown label='Sub-category'
                          data={sub_categories}
                          onChangeText={this._on_sub_category_changed}
                          containerStyle={styles.CategoryPicker}
                          value={this.state.selected_sub_category ? this.state.selected_sub_category : 'Default'} />
            </View>
        )
    }

    _on_category_changed = (category) => {
        if (category == this.state.selected_category)
            return;

        this.setState(prev_state => {
            return {
                selected_category: category,
                selected_sub_category: null,
                categories: prev_state.categories,
                on_category_changed: prev_state.on_category_changed,
                on_sub_category_changed: prev_state.on_sub_category_changed,
            }
        })
        this.state.on_category_changed(category);
    }

    _on_sub_category_changed = (sub_category) => {
        var category = this.state.selected_category;
        var sub_category = sub_category;
        this.setState(prev_state => {
            return {
                selected_category: category,
                selected_sub_category: sub_category,
                categories: prev_state.categories,
                on_category_changed: prev_state.on_category_changed,
                on_sub_category_changed: prev_state.on_sub_category_changed,
            }
        })

        this.state.on_sub_category_changed(category, sub_category);
    }
}