import React from "react";
import "./Result.css";

export const Result = props => {
  return (
    <div className="result-div">
      <div>
        <img src={props.src} alt="result" width="100%" height="485px" />
      </div>
      <div className="result-cancel">
        <i className="fas fa-window-close" onClick={props.removeItem} />
      </div>

      <div className="result-info">
        <div>{props.title}</div>
        <div>{props.seasonsNumber}</div>
      </div>
    </div>
  );
};




