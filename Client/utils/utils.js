import React from 'react';

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


// string format ref - https://www.npmjs.com/package/string-format
export const string_format = require('string-format');

