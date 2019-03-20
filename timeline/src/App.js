import React, { Component } from 'react';
import './App.css';
import Timeline from 'react-visjs-timeline';
import data from './parsed.json';
import _ from 'lodash';
import moment from 'moment';

// https://github.com/Lighthouse-io/react-visjs-timeline#readme
const options = {
  width: '100%',
  height: '450px',
  stack: false,
  showMajorLabels: true,
  // showCurrentTime: true,
  zoomMin: 1000000,
  type: 'background',
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

const generateContent = e => {
  const t = e.eventType;

  return t;
};

class App extends Component {
  state = {
    eventLimit: 100,
  };

  componentWillMount() {
    this.palette = [
      'one', 'two', 'three', 'four', 'five',
    ];
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

  getGroups() {
    const allBolt = _.uniq(data.map(d => _.get(d.member, 'raft')).filter(x => x)).sort();

    return allBolt.map((boltAddr, idx) => ({ 
      id: idx, 
      content: labelAddress(boltAddr), 
    }));
  }

  clickHandler = (...e) => {
    console.log('Click', e);
  };

  getItems() {
    // return [{
    //   start: new Date(2010, 7, 15),
    //   end: new Date(2010, 8, 2),  // end is optional
    //   content: 'Trajectory A',
    // }];
    const finished = data
      .filter(d => (
        d.eventType !== 'unknown' &&
        d.eventType !== 'PROCEDURE' && 
        d.eventType !== 'CONFIGURATION'))
      .slice(0, this.state.eventLimit)
      .map((e, idx) => { 
        e.id = idx;
        e.start = moment.utc(e.start).toDate();
        e.end = moment.utc(e.start).add(5, 'minutes').toDate();
        e.content = generateContent(e);
        e.group = labelAddress(_.get(e.member, 'raft'));
        this.assignColor(e);
        return e;
      });

    console.log(finished);
    return finished;
  }

  render() {
    return (
      <div className="App">
        <Timeline 
            options={options} 
            clickHandler={this.clickHandler}
            groups={this.getGroups()} 
            items={this.getItems()}/>
      </div>
    );
  }
}

export default App;
