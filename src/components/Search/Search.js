import React, { Component } from "react";
import "./Search.css";
import { List, Input, Select } from "antd";
import Axios from "axios";
import Title from "antd/lib/typography/Title";
import { isEmpty } from "lodash";


class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchText: "",
            suggestions: [],
            selectedShow: {}
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
            {this.searchSuggestions()}
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
       * @description Asynchronously request data from TheMovieDB api
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

      searchSuggestions = () => {
        return (
          <div className="search-suggestions-div">
            {this.state.suggestions.length > 0 && (
              <List
                itemLayout="vertical"
                dataSource={this.state.suggestions}
                className="suggestion-list"
                renderItem={item => ( //renderItem uses objects from the dataSource
                  <List.Item
                    className="suggest-item"
                    onClick={() => this.getShowData(item.id, item.title)}
                  >
                    {item.title}
                  </List.Item>
                )}
              />
            )}
          </div>
        );
      }

      /**
       * @author eoin.reilly
       * @description Gets the data for the selected show
       * @param {*} id 
       * @param {*} name 
       * @returns {Object} which returns detail of tv show then getting id,name,image,number of episodes.
       */
      getShowData = (id, name) => {
        this.setState({
          searchText: name,
          suggestions: []
        });
        const apiPath = `https://api.themoviedb.org/3/tv/${id}?api_key=de810845bc016371c4822a8a9550270d&language=en-US`;
        Axios
          .get(apiPath)
          .then(response => {
            this.setState({
              selectedShow: {
                id: response.data.id,
                name: response.data.name,
                numberOfSeasons: response.data.number_of_seasons,
                poster:
                  "https://image.tmdb.org/t/p/w780/" + response.data.poster_path,
                backdrop:
                  "https://image.tmdb.org/t/p/w780/" + response.data.backdrop_path,
                runtime: !isEmpty(response.data.episode_run_time)
                  ? response.data.episode_run_time
                  : [0],
                season: response.data.seasons.map(season => {
                  return {
                    seasonNumber: season.season_number,
                    numberOfEpisodes: season.episode_count
                  };
                })
              }
            });
          })
          .catch(function(error) {
            console.log(error);
          });
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