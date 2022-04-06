import React, { Component, useEffect } from "react";

const rideType = null;

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
      stationCode: null,
      picURL: null,
      nearestRides: [],
      upcomingRides: [],
      pastRides: [],
    };
  }

  componentDidMount() {
    fetch("https://assessment.api.vweb.app/rides", {
      method: "GET",
      headers: { "Content-Type": "application-json" },
      mode: "cors",
    })
      .then((res) => res.json())
      .then((data) => {
        let nearestRides = [];
        let upcomingRides = [];
        let pastRides = [];

        data.map((ride) => {
          let todayDate = new Date().getTime();
          let rideDate = new Date(ride.date).getTime();

          if (rideDate > todayDate) {
            upcomingRides.push(ride);
          } else if (rideDate < todayDate) {
            pastRides.push(ride);
          } else {
            nearestRides.push(ride);
          }
        });
        this.setState({
          nearestRides: nearestRides,
          upcomingRides: upcomingRides,
          pastRides: pastRides,
        });
      });

    fetch("https://assessment.api.vweb.app/user", {
      mode: "cors",
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          stationCode: data.station_code,
          name: data.name,
          picURL: data.url,
        });
      });
  }

  render() {
    return (
      <>
        <TopBar name={this.state.name} picURL={this.state.picURL} />
        <RidesOptions
          upcoming={this.state.upcomingRides.length}
          past={this.state.pastRides.length}
          upcomingRides={this.state.upcomingRides}
          pastRides={this.state.pastRides}
          nearestRides={this.state.nearestRides}
          userStation={this.state.stationCode}
        />
      </>
    );
  }
}

class TopBar extends Component {
  render() {
    return (
      <div className="topBar">
        <div className="topBar-edvora">Edvora</div>
        <div className="profileInfo">
          {this.props.name}
          <img className="profileImg" src={this.props.picURL} />
        </div>
      </div>
    );
  }
}

class RidesOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rideType: null,
    };
  }
  render() {
    return (
      <>
        <div className="rides-filter-div">
          <div className="rides">
            <button
              onClick={() =>
                this.setState({ rideType: this.props.nearestRides })
              }
            >
              Nearest Rides
            </button>
            <button
              onClick={() =>
                this.setState({ rideType: this.props.upcomingRides })
              }
            >
              Upcoming Rides {" (" + this.props.upcoming + ")"}
            </button>
            <button
              onClick={() => this.setState({ rideType: this.props.pastRides })}
            >
              Past Rides {" (" + this.props.past + ")"}
            </button>
          </div>
          <a className="filter">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              fill="currentColor"
              class="bi bi-filter-left"
              viewBox="0 0 16 16"
            >
              <path d="M2 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
            </svg>
            &nbsp;Filter
            <FilterBox className="filterBox" rideType={this.state.rideType} />
          </a>
        </div>
        <RidesList
          rides={this.state.rideType}
          userStation={this.props.userStation}
        />
      </>
    );
  }
}

class FilterBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      city: null,
      theState: null,
    };
  }
  filterArray(index) {
    let newArray = [];
    this.props.rideType.map((ride) => {
      newArray.push(ride.state);
    });
    return newArray.filter(this.onlyUnique);
  }
  filterCity(index) {
    let newArray = [];
    this.props.rideType.map((ride) => {
      newArray.push(ride.city);
    });
    return newArray.filter(this.onlyUnique);
  }
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  render() {
    if (this.props.rideType == null) {
      return <div className="filterDropDown">Please choose a rideType</div>;
    } else {
      return (
        <>
          <div className="filterDropDown">
            <div className="filterBox">
              <span>Filters</span>
              <hr />
              <button className="statebtn">
                State
                <div className="stateDropDown">
                  {this.filterArray(this.props.rideType).map((state) => (
                    <>
                      <a onClick={() => this.setState({ theState: state })}>
                        {state}
                      </a>{" "}
                      <br />
                    </>
                  ))}
                </div>
              </button>

              <button className="citybtn">
                City
                <div className="cityDropDown">
                  {this.filterCity(this.props.rideType).map((city) => (
                    <>
                      <a onClick={() => this.setState({ city: city })}>
                        {city}
                      </a>{" "}
                      <br />
                    </>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </>
      );
    }
  }
}

class RidesDiv extends Component {
  render() {
    if (this.props.rides == null) {
      return;
    }
    let dataSet = this.props.rides;
    if (dataSet.length == 0) {
      return (
        <div className="emptyRides">
          <span>No Rides at the Moment</span>
        </div>
      );
    } else {
      return dataSet.map((ride) => (
        <>
          <div key={ride.id} className="ridesDiv">
            <img src={ride.map_url} alt="" />
            <div className="rideInfo">
              <span>Ride Id : {ride.id}</span>
              <span>Origin Station: {ride.origin_station_code}</span>
              <span>
                station_path :{" [ " + ride.station_path.toString() + " ]"}
              </span>
              <span>Date: {ride.date}</span>
              <span>
                Distance :{" "}
                {this.getDistance(ride.station_path, this.props.userStation)}
              </span>
            </div>
            <div className="city-state-name">
              <span>{ride.city}</span>
              <span>{ride.state}</span>
            </div>
          </div>
        </>
      ));
    }
  }
  getDistance(ridePath, userStation) {
    let array = [];
    ridePath.map((i) => {
      array.push(Math.abs(i - userStation));
    });
    return array.sort()[0];
  }
}

class RidesList extends Component {
  render() {
    return (
      <div className="availableRides">
        <RidesDiv
          rides={this.props.rides}
          userStation={this.props.userStation}
        />
      </div>
    );
  }
}

export default HomePage;
