import React from "react";

const Card = ({title, description})=>{
    return(
        <div className="border p-4 rounded shadow mb-2">
            <h3 className="font-bold">title</h3>
            <p>{description}</p>
        </div>
    );
};



export default Card;