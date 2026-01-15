import React from 'react';

const InputField = ({value, onchange, placeHolder="", type = 'text'})=>{
    return(
        <input type={type} value={value} placeholder={'placeHolder'} className="border px-2 py-1 rounded w-full"></input>
    );
};

export default InputField;