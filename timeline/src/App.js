import React, { Component } from 'react';
import Timeline from 'react-visjs-timeline';
import data from './parsed.json';
import _ from 'lodash';
import moment from 'moment';
import './App.css';

// Assign IDs
data.forEach((i, idx) => {
  i.id = idx;
});

// https://github.com/Lighthouse-io/react-visjs-timeline#readme
// http://visjs.org/docs/timeline/#Configuration_Options
const options = {
  width: '100%',
  height: '600px',
  stack: true,
  align: 'left',
  margin: {
    axis: 2,
    item: 2,
  },
  format: {
    minorLabels: {
      minute: 'h:mma',
      hour: 'ha'
    }
  }
};

const labelAddress = addr => {
  if (addr && addr.match(/[^0-9\\.]/)) {
    return addr.substring(0, addr.indexOf('.'));
  }

  return addr;
};

const assignClass = e => {
  return e.logLevel;
};

const generateContent = e => {
  const t = e.eventType;

  return t;
};

class App extends Component {
  state = {
    eventLimit: 300,
    selected: null,
  };

  componentWillMount() {
    this.palette = [
      'one', 'two', 'three', 'four', 'five',
    ];

    this.buildFilters();
  }

  assignColor(i) {
    if (!this.legend) {
      this.legend = {};
    }

    var bolt = i.member.raft;
    if (this.legend[bolt]) {
      i.className = this.legend[bolt];
      return i;
    }

    i.className = this.palette.pop();
    this.legend[bolt] = i.className;
    return i;
  }

  buildFilters() {
    const members = _.uniq(data.map(i => _.get(i, 'member.raft')).filter(x => x)).sort();
    const logLevels = _.uniq(data.map(i => i.logLevel).filter(x => x)).sort();
    const eventTypes = _.uniq(data.map(i => i.eventType).filter(x => x)).sort();
    const designators = _.uniq(data.map(i => i.classDesignator).filter(x => x)).sort();

    const filters = {
      members, logLevels, eventTypes, designators,
    };

    console.log('Filters', filters);
    this.setState({ filters });
  }

  getGroups() {
    const allBolt = _.uniq(data.map(d => _.get(d.member, 'raft')).filter(x => x)).sort();

    return allBolt.map((boltAddr, idx) => ({ 
      id: labelAddress(boltAddr), 
      content: labelAddress(boltAddr), 
    }));
  }

  clickHandler = (e) => {
    console.log('Click', e);
    const idx = e.item;
    const fullItem = data[idx];
    console.log(fullItem);

    this.setState({
      selected: fullItem,
    });
  };

  getItems() {
    // return [{
    //   start: new Date(2010, 7, 15),
    //   end: new Date(2010, 8, 2),  // end is optional
    //   content: 'Trajectory A',
    // }];
    const finished = data
      .filter(d => (
        // d.eventType !== 'unknown' &&
        d.eventType !== 'PROCEDURE' && 
        d.eventType !== 'STOP_THE_WORLD' && 
        d.eventType !== 'CONFIGURATION'))
      .slice(0, this.state.eventLimit)
      .map((e, idx) => { 
        const item = {
          id: e.id,
          start: moment.utc(e.timestamp).toDate(),
          // end: moment.utc(e.timestamp).add(10, 'seconds').toDate(),
          content: generateContent(e),
          group: labelAddress(_.get(e.member, 'raft')),
          editable: false,
          className: assignClass(e),
        };
        return item;
      });

    console.log(finished);
    return finished;
  }

  legend() {
    return (
      <div style={{textAlign: 'left'}}>
        Selected: 
        <pre>{ this.state.selected ? JSON.stringify(this.state.selected, null, 2) : '' }</pre>
      </div>
    );
  }

  timeline() {
    return (
      // <div style={{paddingTop: '200px'}}>
        <Timeline 
            options={options} 
            clickHandler={this.clickHandler}
            groups={this.getGroups()} 
            items={this.getItems()}/>
      // </div>
    );
  }

  render() {
    return (
      <div className="App">
        { this.timeline() }
        {/* { this.legend() } */}
      </div>
    );
  }
}

export default App;
