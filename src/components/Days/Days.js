
import React from "react";
import "./Days.css";

export const Days = props => {
    return (
        <div className="days-div">
            <div className="days">
                <div className="numbers">1</div>
                <div className="day-words">Days</div>
            </div>
            <span className="colon-span">:</span>
            <div className="days">
                <div className="numbers">30</div>
                <div className="day-words">HOURS</div>
            </div>
            <span className="colon-span">:</span>
            <div className="days">
                <div className="numbers">50</div>
                <div className="day-words">MINUTES</div>
            </div>
        </div>
    );
}

export default Days;

