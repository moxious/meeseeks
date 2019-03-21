import React, { Component } from 'react';
import { Dropdown, Input, Grid } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import _ from 'lodash';

export default class LogEventFilter extends Component {
    state = {
        filterState: {},
        maxItems: 200,
    };

    componentDidMount() {
        this.buildFilters();
    }

    doFilter() {
        const onlyMembers = this.state.members.filter(m => this.state.filterState[m]);
        const onlyEventTypes = this.state.eventTypes.filter(et => this.state.filterState[et]);
        const onlyDesignators = this.state.designators.filter(d => this.state.filterState[d]);
        const onlyLogLevels = this.state.logLevels.filter(ll => this.state.filterState[ll]);

        return this.props.data
            .filter(e => onlyLogLevels.indexOf(e.logLevel) > -1)
            .filter(e => onlyMembers.indexOf(_.get(e, 'member.raft')) > -1)
            .filter(e => onlyDesignators.indexOf(e.classDesignator) > -1)
            .filter(e => onlyEventTypes.indexOf(e.eventType) > -1)
            .slice(0, this.state.maxItems);
    }

    buildFilters() {
        const data = this.props.data;
        const members = _.uniq(data.map(i => _.get(i, 'member.raft')).filter(x => x)).sort();
        const logLevels = _.uniq(data.map(i => i.logLevel).filter(x => x)).sort();
        const eventTypes = _.uniq(data.map(i => i.eventType).filter(x => x)).sort();
        const designators = _.uniq(data.map(i => i.classDesignator).filter(x => x)).sort();

        const filterState = this.state.filterState;

        const everything = [
            ...members,
            ...logLevels,
            ...eventTypes,
            ...designators,
        ];

        everything.forEach(possibility => {
            // Show everything by default if it's not toggled.
            if (_.isNil(filterState[possibility])) {
                filterState[possibility] = true;
            }
        });

        const filters = {
            members, logLevels, eventTypes, designators, filterState,
        };

        console.log('Filters', filters);
        this.setState(filters);
    }

    getSelectionsFor = key => {
        const possibilities = this.state[key];

        const selected = [];
        possibilities.forEach(p => {
            if (this.state.filterState[p]) { selected.push(p); }
        });

        // console.log('Selections for ',key,selected);
        return selected;
    };

    change = key => (emitter, e) => {
        const selected = e.value;
        // console.log('Selections for ', key, selected);
        const allPossibilities = this.state[key];
        
        const partialFilterState = {};

        allPossibilities.forEach(key => {
            if (selected.indexOf(key) > -1) {
                partialFilterState[key] = true;
            } else {
                partialFilterState[key] = false;
            }
        });

        const newFilterState = _.merge(this.state.filterState, partialFilterState);

        this.setState({ filterState: newFilterState });
        
        if (this.props.onChange) {
            const filteredSet = this.doFilter();
            this.props.onChange(this, filteredSet);
        }
    };

    renderFilter(key, placeholder) {
        // console.log('render filter', key, this.state);
        const optionNames = this.state[key];

        const options = optionNames.map(name => ({
            key: name, 
            text: name, 
            value: name,
        }));

        return (
            <Dropdown onChange={this.change(key)}
                fluid multiple search selection
                placeholder={placeholder}
                closeOnChange={false}
                allowAdditions={false}
                style={{ height: '180px', maxHeight: '180px', overflowY: 'scroll' }}
                defaultValue={this.getSelectionsFor(key)}
                options={options} />
        );
        /*
        return (
            <Dropdown
                text={placeholder}
                icon='filter'
                floating
                labeled
                button
                className='icon'
            >
                <Dropdown.Menu>
                    <Input icon='search' iconPosition='left' className='search' onClick={e => e.stopPropagation()} />
                    <Dropdown.Divider />
                    <Dropdown.Menu scrolling>
                        {options.map(option => (
                            <Dropdown.Item key={option.value} {...option} />
                        ))}
                    </Dropdown.Menu>
                </Dropdown.Menu>
            </Dropdown>
        );*/
    }

    render() {
        return this.state.members ?
            (
                <div className='LogEventFilter'>
                    <Grid>
                        <Grid.Row columns={4}>
                            <Grid.Column>
                                {this.renderFilter('members', 'Cluster Members')}
                            </Grid.Column>

                            <Grid.Column>
                                {this.renderFilter('logLevels', 'Log Levels')}
                            </Grid.Column>

                            <Grid.Column>
                                {this.renderFilter('designators', 'Emitting Classes')}
                            </Grid.Column>

                            <Grid.Column>
                                {this.renderFilter('eventTypes', 'Event Types')}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>
            ) : '';
    }
}