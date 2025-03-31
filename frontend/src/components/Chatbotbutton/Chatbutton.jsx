    // FloatingButton.jsx
    import React from "react";
    import "./Chatbutton.css";
    import { useNavigate } from "react-router-dom";

const FloatingButton = ({ onClick }) => {

        const Navigate=useNavigate()
         const handleNavigate=()=>{   Navigate("/chatbot")}
        
    return (
        <button className="floating-button" onClick={handleNavigate}>
            Ai<br />
        </button>
    );
 } ;

    export default FloatingButton;
