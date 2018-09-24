import React from 'react';
import { View } from 'react-native';

export function collect_categories(form_objects){
    let categories = {'Default': ['Default']};

    if(form_objects==undefined)
        return

    form_objects.forEach(form_obj => {
        let category = form_obj.category;
        let sub_category = form_obj.subCategory;
        if(!categories.hasOwnProperty(category)){
            categories[category] = []
        }

        categories[category].push(sub_category)
    })

    return categories;
}

export function render_separator(){
    return (
        <View
          style={{
            height: 1,
            width: "86%",
            backgroundColor: "#CED0CE",
            marginLeft: "14%"
          }}
        />
      );
}

// string format ref - https://www.npmjs.com/package/string-format
export const string_format = require('string-format');
