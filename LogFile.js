const fs = require('fs');
const LogEvent = require('./LogEvent');
const logEventClassification = require('./logEventClassification');

/**
 * A log file is created by opening a path, and parsing its contents into a stream
 * of devents.
 * 
 * Log files can be turned into ClusterMembers.
 */
module.exports = class LogFile {
    constructor(path) {
        this.path = path;

        this.events = this.parseLogEvents(this.load());
    }

    load() {
        return fs.readFileSync(this.path).toString('utf8');
    }

    asJSON() {
        return {
            path: this.path,
            events: this.events,
        };
    }

    parseLogEvents(data) {
        const events = LogEvent.parseData(data);

        // Run every log event through every classification function, to mark them up/annotate
        // as appropriate.  If the function doesn't apply it will do nothing.
        events.forEach(e => {
            Object.keys(logEventClassification).forEach(cfKey => {
                const f = logEventClassification[cfKey];

                f(e);
            });
        });

        this.logEvents = events;
        return this.logEvents;
    }
};

