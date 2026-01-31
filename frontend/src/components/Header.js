import React from "react";
import favicon from "../favicon-32x32.png"; // putanja do tvoje ikone

const Header = () => {
  return (
    <header style={{ 
      display: "flex", 
      alignItems: "center", 
      padding: "10px", 
      backgroundColor: "#f5f5f5",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <img 
        src={favicon} 
        alt="Skill Up Logo" 
        style={{ width: "40px", height: "40px", marginRight: "10px" }}
      />
      <h1 className="text-red-500">Skill Up</h1>
    </header>
  );
};

export default Header;
