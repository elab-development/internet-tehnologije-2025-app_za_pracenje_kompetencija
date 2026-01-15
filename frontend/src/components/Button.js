import React from 'react';

const Button = ({ onClick, text, className = '', type='button'})=>{
    return(
        <button type={type} onClick={onClick} className={`px-4 py-2 bg-blue-500 text-white rounded ${className}`}>
            {text}</button>
    );
};

export default Button;