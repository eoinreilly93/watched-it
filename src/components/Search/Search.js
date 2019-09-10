import React, { Component } from "react";
import "./Search.css";
import { List, Input, Select } from "antd";
import Axios from "axios";
import Title from "antd/lib/typography/Title";
import { async } from "q";

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchText: "",
            suggestions: []
        }
    }

    /**
     * Div that returns the page structure jsx
     */
    searchTv() {
        return (
          <div>
            {this.calculatedDays()}
            {this.searchBar()}
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

      /**
       * Return the JSX for the search bar
       */
      searchBar() {
        return (
          <div className="search-fields-div">
            <Input
              placeholder="Type in a Tv show"
              size="large"
              className="search-input transparent-fields"
              value={this.state.searchText}
              onChange={e => this.handleSearchText(e)}
            />
          </div>
        );
      }

      /**
       * Asynchronously request data from TheMovieDB api
       * @author eoin.reilly
       */
      handleSearchText = (e) => {
        this.setState({
          searchText: e.target.value
        });
        let words = e.target.value;
        let suggestions = [];
        const apiPath = `https://api.themoviedb.org/3/search/tv?api_key=de810845bc016371c4822a8a9550270d&language=en-US&query=${e.target.value}`;

        if(words.length > 1) {
          Axios.get(apiPath)
            .then(response => {
              response.data.results.map(
                async result => {
                  await suggestions.push({
                    title: result.name,
                    id: result.id
                  })
                }
              );
              this.setState({ suggestions })
            })
            .catch(function(error) {
              //TODO: Error handling
            })
            .finally(function() {});
        }
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