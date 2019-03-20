# Meeseeks

> Meeseeks are not born into this world fumbling for meaning, Jerry! We are created to serve a singular purpose for which we will go to any lengths to fulfill! Existence is pain to a Meeseeks, Jerry. And we will do anything to alleviate that pain.

[Mr. Meeseeks](https://www.youtube.com/watch?v=qUYvIAP3qQk)

A quick tool for extracting useful stuff out of multiple debug.log files from Neo4j.

# Usage

```
yarn install
node index.js /path/to/files
```

# Key Assumptions

- You have a directory with multiple debug.log files.  The script will locate all
*.log file and process them.
- One log file = one cluster member.  Log file identity and cluster member identity should be the same.


