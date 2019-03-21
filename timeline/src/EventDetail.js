import React, { Component } from 'react';

export default class EventDetail extends Component {
    render() {
        return (
            <div className='EventDetail'>
                <pre>{JSON.stringify(this.props.item, null, 2)}</pre>
            </div>
        );
    }
}