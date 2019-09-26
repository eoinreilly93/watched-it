
import React from "react";
import "./Days.css";
import { isEmpty } from "lodash";

export const Days = props => {
    return (
        <div className="days-div">
            {!isEmpty(props.calculatedTime) && (
                <>
                <div className="days">
                    <div className="numbers">{props.calculatedTime.days}</div>
                    <div className="day-words">DAYS</div>
                </div>
                <span className="colon-span">:</span>
                <div className="days">
                    <div className="numbers">{props.calculatedTime.hours}</div>
                    <div className="day-words">HOURS</div>
                </div>
                <span className="colon-span">:</span>
                <div className="days">
                    <div className="numbers">{props.calculatedTime.minutes}</div>
                    <div className="day-words">MINUTES</div>
                </div>
                </>
            )}            
        </div>
    );
}

export default Days;

