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
module.exports = {
    topologyChange: e => {
        const re = new RegExp('topology changed');

        if (e.classDesignator !== 'c.n.c.d.SslHazelcastCoreTopologyService' ||
            e.logLevel !== 'INFO' || 
            !e.text.match(re)) { 
                return null; 
        }
        

        e.eventType = 'TOPOLOGY_CHANGE';
        return e;  
    },

    identity: e => {
        if (e.classDesignator !== 'o.n.c.c.IdentityModule' || e.logLevel !== 'INFO' || 
            !e.text.match('id:')) {
                return null;
        }

        const m = e.data[0].match(/MemberId\\{(.*?)\\} \\((.*?)\\)/);
        if (m) {
            e.eventType = 'MEMBER_ID';
            e.extracted = {
                memberId: m[1],
                uuid: m[2],
            };
        }

        return e;
    },

    raftIdentity: e => {
        if (e.classDesignator !== 'c.n.c.d.SslHazelcastCoreTopologyService' || e.logLevel !== 'INFO' || !e.text.match('My connection info')) {
            return null;
        }

        const t = e.text.replace(/\n/g, ' ');
        const m = t.match(/Raft:.*?advertised=(.*?),/);
        if (m) {
            e.eventType = 'RAFT_IDENTITY';
            e.extracted = { 
                advertised: m[1],
            };
        } else {
            console.error('Failed match on ', t);
        }

        return e;
    },

    raftState: e => {
        if (e.classDesignator !== 'o.n.c.c.c.s.RaftState' || e.logLevel !== 'INFO') {
            return null;
        }

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
    },

    slowGC: e => {
        if (e.classDesignator !== 'o.n.k.i.c.VmPauseMonitorComponent' ||
            e.logLevel !== 'WARN' || 
            !e.text.match('Detected VM stop-the-world pause')) {
                return null;
        }

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
    },

    configuration: e => {
        if (e.classDesignator !== 'o.n.i.d.DiagnosticsManager' ||
            e.logLevel !== 'INFO') {
                return null;
        }

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
    },


};