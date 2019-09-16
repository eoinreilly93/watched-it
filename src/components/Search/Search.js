import React, { Component } from "react";
import "./Search.css";
import { List, Input, Select, Button } from "antd";
import Axios from "axios";
import { isEmpty } from "lodash";
import Days from "../Days/Days";
import { Result } from "../Result/Result";



class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchText: "",
            suggestions: [],
            selectedShow: {},
            selectedSeason: null,
            showsData:
              localStorage.getItem("showsData") !== null
                ? JSON.parse(localStorage.getItem("showsData"))
                : [],
            totalTime:
              localStorage.getItem("totalShowsTime") !== null
                ? JSON.parse(localStorage.getItem("totalShowsTime"))
                : []
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
            {this.searchResults()}
          </div>
        );
      }

      calculatedDays() {
        return (
            <Days />
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
            {/* Display the drop down and button only when
                the user has selected a show */}
            {!isEmpty(this.state.selectedShow) ? (
              this.state.selectedShow.numberOfSeasons > 0 ? (
                <>
                  <Select
                    defaultValue={this.state.selectedShow.numberOfSeasons}
                    size="large"
                    onChange={this.selectSeason}
                  >
                    {[...Array(this.state.selectedShow.numberOfSeasons).keys()].map(
                      val => (
                        <Select.Option key={val} value={val + 1}>
                          {val + 1}
                        </Select.Option>
                      )
                    )}

                  </Select>
                  <Button
                    type="default"
                    shape="circle"
                    icon="right"
                    size="large"
                    style={{marginLeft: 10 + 'px'}} //Could not style in the css file
                    onClick={() => this.calculateWatchTime()}
                  />
                </>
              ) : (
                <Button
                  type="default"
                  shape="circle"
                  icon="right"
                  size="large"
                  style={{marginLeft: 10 + 'px'}} //Could not style in the css file
                  onClick={() => this.calculateWatchTime()}
                />
              )
            ) : (
              ""
            )}
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
        } else {
          this.setState({ suggestions: [], selectedShow: {} })
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
                selectedSeason: response.data.number_of_seasons, //Default selected season is the total number of seasons. This can be overriden in selectSeason()
                poster:
                  "https://image.tmdb.org/t/p/w780/" + response.data.poster_path,
                backdrop:
                  "https://image.tmdb.org/t/p/w780/" + response.data.backdrop_path,
                runtime: !isEmpty(response.data.episode_run_time)
                  ? response.data.episode_run_time
                  : [0],
                seasons: response.data.seasons
                  .filter(season => season.season_number !== 0) //Some seasons have a season 0, if this exists, remove it
                  .map(season => {
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

      //Add selected season to the selectedShow state object as well as to the state
      selectSeason = (value) => {
        this.setState({ 
          selectedSeason: value,
          selectedShow: { 
            ...this.state.selectedShow, //Passes current object so it retains all existing properties
            selectedSeason : value
          }
        });
      }

      /**
       * Calculate the total nubmer of days, hours and minutes spent watching
       * the selected tv show 
       */
      calculateWatchTime() {
        let shows = this.state.showsData; // All the data on all shows currently calculated
        let totalShowsTime = this.state.totalTime; // Current total watch time
        let totalEpisodes = 0;

        if(this.state.selectedSeason === null) {
          this.state.selectedShow.seasons.map( 
            result => (totalEpisodes += result.numberOfEpisodes)
          );
        } else {
          this.state.selectedShow.seasons.map((result, i) => {
            if (i < this.state.selectedSeason) {
              totalEpisodes += result.numberOfEpisodes;
            }
          });
        }

        //Calculate the total watchtime for the selected show and seasons
        const totalShowWatchTime = (this.state.selectedShow.runtime.reduce((totalRuntime, singleRuntime) => totalRuntime + singleRuntime))/this.state.selectedShow.runtime.length;
        const show = {
          id: this.state.selectedShow.id,
          name: this.state.selectedShow.name,
          totalShowWatchTime: totalShowWatchTime
        };

        shows.unshift(this.state.selectedShow); //unshift inserts object at start of the array
        localStorage.setItem("showsData", JSON.stringify(shows));
        totalShowsTime.unshift(show);
        localStorage.setItem("totalShowsTime", JSON.stringify(totalShowsTime));
        this.setState({
          showsData: shows,
          totalTime: totalShowsTime,
          searchText: "",
          selectedShow: {},
          selectedSeason: null
        });
      }

      searchResults() {
        return (
          <div className="search-results-div">
            {this.state.showsData.length > 0 && (
              <List
                itemLayout="horizontal"
                className="search-results-list"
                grid={{ xxl: 6, xl: 5, lg: 4, md: 2, sm: 2, xs: 1 }}
                dataSource={this.state.showsData}
                renderItem={(item, i) => (
                  <List.Item className="search-results-item">
                    <Result
                      src={item.poster}
                      seasonsNumber={item.selectedSeason} //Fix incorrect season value
                      title={item.name}
                      removeItem={() => this.removeItem(i)}
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        );
      }

      /**
       * @author Eoin
       * @desc Removes selected shows from local state and as well from local storage.
       */
      removeItem = (index) => {
        /* val = the current element, i = current index (starts at 0)
         * If you remove val, i becomes the current element, so the filter will not work
         */
        let shows = this.state.showsData.filter((val, i) => i !== index);
        localStorage.setItem("showsData", JSON.stringify(shows));
        let totalShowsTime = this.state.totalTime.filter((val, i) => i !== index);
        localStorage.setItem("totalShowsTime", JSON.stringify(totalShowsTime));
        this.setState({ showsData: shows, totalTime: totalShowsTime });
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