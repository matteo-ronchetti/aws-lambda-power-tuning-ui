# AWS Lambda Power Tuning UI
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/matteo-ronchetti/aws-lambda-power-tuning-ui/graphs/commit-activity)
[![GitHub license](https://img.shields.io/github/license/matteo-ronchetti/aws-lambda-power-tuning-ui.svg)](https://github.com/matteo-ronchetti/aws-lambda-power-tuning-ui/blob/master/LICENSE)
[![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

This project provides a simple UI to visualize the results of [AWS Lambda Power Tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning).
The UI is a static HTML page that reads data from URL hash.

![Sample Screenshot](docs/sample-screenshot.png?raw=true)

- [Basic Demo](https://lambda-power-tuning.show/#gAEAAgAEAAYACA==;Go9qRqDLVUbymEpGgC0jRn/iMkY=;41bGOHAK8Th8bWQ5mvyJObyvyTk=;)
- [Comparison Demo](https://lambda-power-tuning.show/#gAEAAgAEAAYACA==;Go9qRqDLVUbymEpGgC0jRn/iMkY=;41bGOHAK8Th8bWQ5mvyJObyvyTk=;gAEAAgAEAAYACA==;0+hrRh7TR0YDoxBG/mQCRjclCkY=;sX2hOBZhtji8AgQ5ZIcyOV8vfDk=;JS%20x86;JS%20ARM64)

## Local building and execution
First you need to clone the source and install the [bundler](https://gitlab.com/matteo-ronchetti/rosh-bundler)
by running
```bash
git clone https://github.com/matteo-ronchetti/aws-lambda-power-tuning-ui.git
cd aws-lambda-power-tuning-ui
npm install
```
Then run
```bash
npm start
```
to build and serve at [localhost:3000](http://localhost:3000/).

## URL format
The URL hash is formatted as `<lambda_size>;<execution_time>;<execution_cost>`
where each parameter `<x>` is a list encoded in base64 with proper data type
(int16 for size, float32 for time and cost).

This can be achieved using the `encode` function defined [here](https://github.com/matteo-ronchetti/aws-lambda-power-tuning-ui/blob/master/src/encode.js#L1):
```javascript
let sizes = [128, 256, 512, 1024, 1536];
let times = [16.0, 8.0, 4.0, 2.8, 2.1];
let costs = [0.01, 0.008, 0.005, 0.009, 0.012];

window.location.hash = encode(sizes, Int16Array) + ";" + encode(times) + ";" + encode(costs)
```

# Contributing

```bash
# Lint the code
npm run lint

# Build the website
npm run build

# Serve the built-website in a standalone server on port 4000
npm run serve
```
