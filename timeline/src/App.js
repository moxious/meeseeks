import React, { Component } from 'react';
import Timeline from 'react-visjs-timeline';
import data from './parsed.json';
import _ from 'lodash';
import moment from 'moment';
import './App.css';
import LogEventFilter from './LogEventFilter';
import EventDetail from './EventDetail';
import { Modal, Button, Icon } from 'semantic-ui-react';

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

class App extends Component {
  state = {
    eventLimit: 300,
    selected: null,
    detailOpen: false,
    timelineSelection: data.slice(0, 200),
  };

  chooseItem = idx => {
    const selected = data[idx] || data[0];
    this.setState({ selected });
  };

  closeDetail = () => this.setState({ detailOpen: false });

  getGroups() {
    const allBolt = _.uniq(data.map(d => _.get(d.member, 'raft')).filter(x => x)).sort();

    return allBolt.map((boltAddr, idx) => ({
      id: labelAddress(boltAddr),
      content: labelAddress(boltAddr),
    }));
  }

  filterHandler = (filter, filteredSet) => {
    console.log('Got filtered set', filteredSet);
    this.setState({ timelineSelection: filteredSet });
  };

  clickHandler = (e) => {
    console.log('Click', e);
    const idx = e.item;
    const fullItem = data[idx];

    if (fullItem) {
      console.log(fullItem);
      this.setState({
        selected: fullItem,
        detailOpen: true,
      });
    }
  };

  // Transforms timeline selection into a set of items for the timeline.
  getItems() {
    const selected = this.state.timelineSelection;

    return selected.map(e => ({
      id: e.id,
      start: moment.utc(e.timestamp).toDate(),
      content: e.eventType,
      group: labelAddress(_.get(e.member, 'raft')),
      editable: false,
      className: e.logLevel,
    }));
    /*
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
          content: e.eventType,
          group: labelAddress(_.get(e.member, 'raft')),
          editable: false,
          className: e.logLevel,
        };
        return item;
      });

    console.log(finished);
    return finished;
    */
  }

  legend() {
    return (
      <div style={{ textAlign: 'left' }}>
        Selected:
        <pre>{this.state.selected ? JSON.stringify(this.state.selected, null, 2) : ''}</pre>
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
        items={this.getItems()} />
      // </div>
    );
  }

  render() {
    return (
      <div className="App">
        <LogEventFilter onChange={this.filterHandler} data={data} />

        {this.timeline()}

        <Modal closeIcon centered={false} onClose={this.closeDetail} open={this.state.detailOpen}>
          <Modal.Content>
            <EventDetail item={this.state.selected} />
          </Modal.Content>
          <Modal.Actions>
            <Button color='green' onClick={() => this.chooseItem(this.state.selected.id - 1)}>
              <Icon name='fast backward' /> Previous
            </Button>
            <Button color='green' onClick={() => this.chooseItem(this.state.selected.id + 1)}>
              <Icon name='fast forward' /> Next
            </Button>
          </Modal.Actions>
        </Modal>

        {/* { this.legend() } */}
      </div>
    );
  }
}

export default App;
