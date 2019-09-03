import React, { Component } from "react";
import "./Search.css";
import { List, Input, Select } from "antd";

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchText: ""
        }
    }

    /**
     * Div that returns the page structure jsx
     */
    searchTv() {
        return (
          <div>
            {this.calculatedDays()}
          </div>
        );
      }

      calculatedDays() {
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
      
    render() {
        return (
          <div>
              {this.searchTv()}
          </div>
        );
      }
}

export default Search;