/**
 * Create a cluster member from a log file object.
 * 
 * This class handles pulling out the cluster member specific bits.
 */
const _ = require('lodash');

const onlyClass = c => e => e.classDesignator === c;
const onlyLevel = l => e => e.logLevel === l;
const logDataMatching = re = e => e.text.match(re);

module.exports = class ClusterMember {
    constructor(logFile) {
        this.log = logFile;

        this.identity = {};

        this.extractMemberConfiguration();
        this.extractIdentity();
    }

    getEvents() { return this.log.events; }

    /**
     * Return a small object that identifies the "identity" of this cluster member, for example its
     * member ID, network endpoint, etc.  This later gets tacked on to log events
     */
    getIdentity() {
        return this.identity;
    }

    asJSON() {
        return {
            raftIdentity: this.raftIdentity,
            log: this.log.asJSON(),
        };
    }

    extractIdentity() {
        const ri = this.getEvents().filter(e => e.eventType === 'RAFT_IDENTITY')[0];

        this.raftIdentity = 'UNKNOWN';

        if (ri) {
            _.set(this.identity, 'raft', ri.extracted.advertised);
        }

        const event = this.getEvents().filter(e => e.eventType === 'MEMBER_ID');
        if (event) {
            this.identity = _.merge(this.identity, event.extracted);
        }

        return this.raftIdentity;
    }

    /**
     * From looking at certain log lines we can infer the cluster member's configuration.
     */
    extractMemberConfiguration() {
        this.config = {};

        // Filter only to config events.
        this.getEvents()
            .filter(onlyClass('o.n.i.d.DiagnosticsManager'))
            .filter(onlyLevel('INFO'))
            // Pull out first log line for that event. Multi-line events don't 
            // qualify.
            .map(e => e.data[0])
            // Apply regex to get key/value
            .map(logLine => logLine.match(/^([^ ]+)=(.*)$/))
            .filter(x => x) // only matching lines.
            .forEach(match => {
                this.config[match[1]] = match[2];
            });
        
        return this.config;
    }
}