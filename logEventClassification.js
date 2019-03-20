/**
 * Functions which match log events and bucket them into a "type" of event, and assign them further
 * relevant metadata.
 * 
 * All functions take a log event as an argument and produce an updated log event as a result, or null
 * if the function does not appply.
 * 
 * These are sort of annotation functions that can be used to mark up vanilla log events with extra context.
 * 
 * Functions may only set eventType, and create an "extracted" data structure.
 */

const onlyWhen = (e, matchCriteria, f) => {
    let misses = 0;

    Object.keys(matchCriteria).forEach(key => {
        const val = matchCriteria[key];

        if (val instanceof RegExp) {
            if (!e[key].match(val)) {
                misses++;
            }
        } else if (e[key] !== val) {
            misses++;
        }
    });

    if (misses > 0) {
        return null;
    }

    return f(e);
};

module.exports = {
    topologyChange: e => onlyWhen(e, {
        classDesignator: 'c.n.c.d.SslHazelcastCoreTopologyService',
        logLevel: 'INFO',
        text: new RegExp('topology changed'),
    }, e => {
        e.eventType = 'TOPOLOGY_CHANGE';
        return e;  
    }),

    identity: e => onlyWhen(e, {
        classDesignator: 'o.n.c.c.IdentityModule',
        logLevel: 'INFO',
        text: new RegExp('id:'),
    }, e => {
        const m = e.data[0].match(/MemberId\\{(.*?)\\} \\((.*?)\\)/);
        if (m) {
            e.eventType = 'MEMBER_ID';
            e.extracted = {
                memberId: m[1],
                uuid: m[2],
            };
        }

        return e;
    }),

    raftIdentity: e => onlyWhen(e, {
        classDesignator: 'c.n.c.d.SslHazelcastCoreTopologyService',
        logLevel: 'INFO'
    }, e => {
        const t = e.text.replace(/\n/g, ' ');
        const m = t.match(/Raft:.*?advertised=(.*?),/);
        if (m) {
            e.eventType = 'RAFT_IDENTITY';
            e.extracted = { 
                advertised: m[1],
            };
        } else {
            // console.error('Failed match on ', t);
        }

        return e;
    }),

    raftState: e => onlyWhen(e, {
        classDesignator: 'o.n.c.c.c.s.RaftState',
        logLevel: 'INFO',
    }, e => {
        e.eventType = 'RAFT_STATE';

        if (e.text.match('leader elected')) {
            const m = e.text.match(/MemberId\\{[^\\}]+\\}/);

            if (m) {
                e.extracted = {
                    role: 'LEADER',
                    memberId: m[1],
                };
            }
        }

        return e;
    }),

    slowGC: e => onlyWhen(e, {
        classDesignator: 'o.n.k.i.c.VmPauseMonitorComponent',
        logLevel: 'WARN',
        text: new RegExp('Detected VM stop-the-world pause'),
    }, e => {
        e.eventType = 'STOP_THE_WORLD';
        const m = e.text.match(/pauseTime=(\d+), gcTime=(\d+), gcCount=(\d+)/);
        if (m) {
            e.extracted = { 
                pauseTime: m[1],
                gcTime: m[2],
                gcCount: m[3],
            };
        }

        return e;
    }),

    configuration: e => onlyWhen(e, {
        classDesignator: 'o.n.i.d.DiagnosticsManager',
        logLevel: 'INFO',
    }, e => {
        e.eventType = 'CONFIGURATION';

        const line = e.data[0];
        const m = line.match(/^([^ ]+)=(.*)$/);
        if (m) {
            e.extracted = {
                key: m[1],
                value: m[2],
            };
        }

        return e;
    }),
};