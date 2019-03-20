# Meeseeks

> Meeseeks are not born into this world fumbling for meaning, Jerry! We are created to serve a singular purpose for which we will go to any lengths to fulfill! Existence is pain to a Meeseeks, Jerry. And we will do anything to alleviate that pain.

[Mr. Meeseeks](https://www.youtube.com/watch?v=qUYvIAP3qQk)

A quick tool for extracting useful stuff out of multiple debug.log files from Neo4j.

# Usage

```
yarn install
node index.js logs/gke-onprem-healthy-4gb-json-load/
```

# WTF does this do right now?

- Parse all logs into a stream of events (log events may be multi-line)
- Associate each stream of log events with a "Cluster Member" that has an identity.  Typically the
identity is a combination of a raft advertised address, and a Member ID.
- Merge all event streams into a single unified timeline, sorted by timestamp, where each event
is marked up with the identity of the member it belongs to.

Right now, this just gets dumped as a huge marked up JSON file.  Later it would be loaded into Neo4j,
or other filtering tools built on top of it.

# TODO

Everything.

- Get more log examples
- Get better at annotating specific log events with extracted metadata that's useful to filter on.

# Key Assumptions

- You have a directory with multiple debug.log files.  The script will locate all
*.log file and process them.
- One log file = one cluster member.  Log file identity and cluster member identity should be the same.


