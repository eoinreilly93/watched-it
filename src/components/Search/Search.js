import React, { Component } from "react";
import "./Search.css";
import { List, AutoComplete, Select, Button } from "antd";
import Axios from "axios";
import { isEmpty } from "lodash";
import Days from "../Days/Days";
import { Result } from "../Result/Result";

const { Option } = AutoComplete;

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focus: false,
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

    componentDidMount() {
      this.nameInput.focus();
      window.onblur = () => {
        this.setState({
          suggestions: []
        });
      };
    }

    /**
   * toggleFocus Function is used to blur the images when the dropdown appears
   */
    toggleFocus = () => {
      this.setState({
        focus: !this.state.focus
      });
    };

    /**
     * Div that returns the page structure jsx
     */
    searchTv() {
        return (
          <div>
            {this.calculatedDays()}
            {this.searchBar()}
            {this.searchResults()}
          </div>
        );
      }

      calculatedDays() {
        return (
            <Days 
              calculatedTime={this.formatCalculatedTime()}
            />
        );
      }

      /**
       * Return the JSX for the search bar
       */
      searchBar() {
        return (
          <div className='search-fields-div'>
            {/* Input component is replaced with AutoComplete from Ant Design */}
    
            <AutoComplete
              ref={input => {
                this.nameInput = input;
              }}
              onBlur={() =>
                this.setState({
                  suggestions: [],
                  focus: !this.state.focus
                })
              }
              onFocus={this.toggleFocus}
              dropdownStyle={{ background: 'transparent' }}
              onChange={this.handleSearchText}
              onSelect={(value, option) => this.getShowData(value, option)}
              placeholder='Type in a tv show'
              style={{ width: 800, marginRight: '0.5em' }}
              value={this.state.searchText}
              className='auto-complete'
            >
              {this.state.suggestions.map(item =>
                this.state.suggestions.length > 0 &&
                this.state.searchText.length > 0 ? (
                  <Option key={item.id} className='suggest-item'>
                    {item.title}
                  </Option>
                ) : (
                  []
                )
              )}
            </AutoComplete>
    
            {/* Display the drop down and button only when the user has selected a show */}
    
            {!isEmpty(this.state.selectedShow) ? (
              this.state.selectedShow.numberOfSeasons > 0 ? (
                <>
                  <Select
                    className='number-of-seasons'
                    style={{ width: 60 }}
                    defaultValue={this.state.selectedShow.numberOfSeasons}
                    size='large'
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
                    type='default'
                    shape='circle'
                    icon='right'
                    size='large'
                    style={{ marginLeft: 10 + 'px', background: 'white' }}
                    onClick={() => {
                      this.calculateWatchTime();
                    }}
                  />
                </>
              ) : (
                <Button
                  type='default'
                  shape='circle'
                  icon='right'
                  size='large'
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    this.calculateWatchTime();
                  }}
                />
              )
            ) : (
              ''
            )}
          </div>
        );
      }

      /**
       * @description Asynchronously request data from TheMovieDB api
       * @author eoin.reilly
       */
      handleSearchText = e => {
        this.setState({
          searchText: e
        });
        let words = e;
    
        const apiPath = `https://api.themoviedb.org/3/search/tv?api_key=de810845bc016371c4822a8a9550270d&language=en-US&query=${e}`;
    
        if (words.length > 1) {
          Axios.get(apiPath)
            .then(response => {
              let suggestions = [];
    
              response.data.results.map(result => {
                // Limited the number of search results to first 5 results
    
                if (suggestions.length < 3) {
                  suggestions.push({
                    title: result.name,
                    id: result.id
                  });
                }
              });
              this.setState({ suggestions });
            })
            .catch(function(error) {
              //TODO: Error handling
            })
            .finally(function() {});
        } else {
          this.setState({ suggestions: [], selectedShow: {} });
        }
      };

      /**
       * @author eoin.reilly
       * @description Gets the data for the selected show
       * @param {*} id 
       * @param {*} name 
       * @returns {Object} which returns detail of tv show then getting id,name,image,number of episodes.
       */
      getShowData = (id, option) => {
        this.setState({
          searchText: option.props.children,
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
        this.nameInput.focus();
    
        let shows = this.state.showsData; // All the data on all shows currently calculated
        let totalShowsTime = this.state.totalTime; // Current total watch time
        let totalEpisodes = 0;
    
        if (this.state.selectedSeason === null) {
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
        //Reduce function reduces an array to a single value (in this case it sums all values)
        const totalShowWatchTime = totalEpisodes * ((this.state.selectedShow.runtime.reduce((totalRuntime, currentRuntime) => totalRuntime + currentRuntime))/this.state.selectedShow.runtime.length);
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
          <div className='search-results-div'>
            {this.state.showsData.length > 0 && (
              <List
                itemLayout='horizontal'
                className='search-results-list'
                grid={{ xxl: 6, xl: 5, lg: 4, md: 3, sm: 2, xs: 2 }}
                dataSource={this.state.showsData}
                renderItem={(item, i) => (
                  <List.Item
                    className={
                      this.state.suggestions.length > 0 && this.state.focus
                        ? 'search-results-item active'
                        : 'search-results-item'
                    }
                  >
                    <Result
                      className='result'
                      src={item.poster}
                      seasonsNumber={
                        <span className='season-number'>{item.selectedSeason}</span>
                      } // Fix incorrect season value
                      title={<span className='item-name'>{item.name}</span>}
                      removeItem={() => {
                        this.removeItem(i);
                      }}
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
        this.nameInput.focus();

        /* val = the current element, i = current index (starts at 0)
         * If you remove val, i becomes the current element, so the filter will not work
         */
        let shows = this.state.showsData.filter((val, i) => i !== index);
        localStorage.setItem("showsData", JSON.stringify(shows));
        let totalShowsTime = this.state.totalTime.filter((val, i) => i !== index);
        localStorage.setItem("totalShowsTime", JSON.stringify(totalShowsTime));
        this.setState({ showsData: shows, totalTime: totalShowsTime });
      }

      formatCalculatedTime = () => {
        if (!isEmpty(this.state.totalTime)) {
          let totalTime = 0;
          this.state.totalTime.map(time => (totalTime += time.totalShowWatchTime));
          var sec_num = totalTime * 60;
          var days = Math.floor(sec_num / (3600 * 24));
          var hours = Math.floor((sec_num - days * (3600 * 24)) / 3600);
          var minutes = Math.floor(
            (sec_num - days * (3600 * 24) - hours * 3600) / 60
          );
          if (hours < 10) {
            hours = "0" + hours;
          }
          if (minutes < 10) {
            minutes = "0" + minutes;
          }

          return { days: days, hours: hours, minutes: minutes };
        }
        else {
          return {};
        }
      }
      
      render() {
        return (
          <div>
              {this.searchTv()}
              <span
                style={{
                  backgroundImage: !isEmpty(this.state.selectedShow)
                    ? `url(${this.state.selectedShow.backdrop})`
                    : !isEmpty(this.state.showsData)
                    ? `url(${this.state.showsData[0].backdrop})`
                    : ``
                }}
                className="bg"
              />
          </div>
        );
      }
}

export default Search;