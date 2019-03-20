const yargs = require('yargs');
const fs = require('fs');
const LogFile = require('./LogFile');
const ClusterMember = require('./ClusterMember');
const _ = require('lodash');

/**
 * High-level processing pipeline:
 * directory of files -> load
 *      list of text lines -> parse
 *      list of "LogEvents" -> gather
 *      list of LogFiles -> transform/inspect
 *      list of ClusterMembers.
 * 
 * Once you've got a list of ClusterMembers, it's up to you to dump the data and do whatever kind of
 * analysis is useful on the basis of that.
 * 
 * Strategy should probably be to extract key metadata about each cluster member, and then dump a timeline log
 * of what happened when, merged for the entire cluster.
 */

/** 
 * Takes a list of cluster members and returns a merged timeline of events, where each event is
 * labeled by member. 
 */
const mergeTimeline = clusterMembers => {
    const allEvents = _.concat(
        ...clusterMembers.map(c => 
            c.getEvents().map(e => {
                // Assign the cluster member identity to this event so we can keep them apart
                // by key.
                e.member = c.getIdentity();
                e.start = e.timestamp;
                
                // Remove the joined text from the final result.  User still gets array
                // of text strings from the log file back.
                delete(e.text);
                return e;
            })));
    
    return _.sortBy(allEvents, 'timestamp');
};

const main = dir => {
    const logPaths = fs.readdirSync(dir).filter(p => p.endsWith('.log')).map(file => `${dir}/${file}`);

    if (logPaths.length === 0) {
        throw new Error(`No logs found in ${dir}`);
    }

    const logFiles = logPaths.map(path => new LogFile(path));
    const members = logFiles.map(lf => new ClusterMember(lf));

    // console.log(JSON.stringify(members[0].asJSON(), null, 2));
    const timeline = mergeTimeline(members);
    console.log(JSON.stringify(timeline, null, 2));
};

main(yargs.argv._[0] || '.');