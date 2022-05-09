# AWS Lambda Power Tuning UI
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/digio/aws-lambda-power-tuning-ui/graphs/commit-activity)
[![GitHub license](https://img.shields.io/github/license/digio/aws-lambda-power-tuning-ui.svg)](https://github.com/digio/aws-lambda-power-tuning-ui/blob/master/LICENSE)
[![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

This project provides a simple UI to visualize the results of [AWS Lambda Power Tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning).
The UI is a static HTML page that reads data from URL hash.

**Why the fork?**

We've added the ability to persist comparison-graphs, which is not implemented in the original repo. This is a useful feature
so that before-after comparisons can be shared.


# Usage

- [Basic Demo](https://digio.github.io/aws-lambda-power-tuning-ui/#gAEAAgAEAAYACA==;Go9qRqDLVUbymEpGgC0jRn/iMkY=;41bGOHAK8Th8bWQ5mvyJObyvyTk=;)
- [Comparison Demo](https://digio.github.io/aws-lambda-power-tuning-ui/#gAEAAgAEAAYACA==;Go9qRqDLVUbymEpGgC0jRn/iMkY=;41bGOHAK8Th8bWQ5mvyJObyvyTk=;gAEAAgAEAAYACA==;0+hrRh7TR0YDoxBG/mQCRjclCkY=;sX2hOBZhtji8AgQ5ZIcyOV8vfDk=;JS%20x86;JS%20ARM64)

The website is deployed to the `gh-pages` branch of this repo, which is hosted at [https://digio.github.io/aws-lambda-power-tuning-ui/](https://digio.github.io/aws-lambda-power-tuning-ui/)

![Sample Screenshot](docs/sample-screenshot.png?raw=true)

# Updating the visualisation URL

See the [docs](https://github.com/alexcasalboni/aws-lambda-power-tuning/blob/fd72b92ad8e1288da6f580bad1d4b24ff603a0f8/README-INPUT-OUTPUT.md#state-machine-configuration-at-deployment-time)
for how to set the `visualisationURL` when **deploying** the PowerTune Lambda.

Alternatively, an **existing** deployment's `visualisationURL` value can also be changed:

1. Open AWS Console
2. Goto Lambda > Applications > *your powertune application*
3. In the resources section, select the `analyzer` Lambda to open it in the Lambda console.
   ![](docs/lambda-analyzer.png?raw=true)
4. Select the Configuration tab > Environment variables
5. Press the Edit button
6. Change the value of the `visualizationURL` to `https://digio.github.io/aws-lambda-power-tuning-ui/` then press Save.


## Local building and execution

First you need to clone the source and then install the bundler
```bash
# Clone
git clone https://github.com/digio/aws-lambda-power-tuning-ui.git
cd aws-lambda-power-tuning-ui

# install build dependencies
npm install 

# build
npm run build

# serve
node run serve

# or Build + serve (best option when developing)
node start
```

to build and serve at [localhost:8000](http://localhost:8000/).

## URL format
The URL hash is formatted as `<lambda_size>;<execution_time>;<execution_cost>`
where each parameter `<x>` is a list encoded in base64 with proper data type
(int16 for size, float32 for time and cost).

This can be achieved using the `encode` function defined [here](https://github.com/digio/aws-lambda-power-tuning-ui/blob/master/src/js/app.js#L336):

```javascript
let sizes = [128, 256, 512, 1024, 1536];
let times = [16.0, 8.0, 4.0, 2.8, 2.1];
let costs = [0.01, 0.008, 0.005, 0.009, 0.012];

window.location.hash = encode(sizes, Int16Array) + ";" + encode(times) + ";" + encode(costs)
```

### Comparison URL format

This implementation of the UI also adds support for comparison URLs. Comparison URLs
are formatted & encoded as above, but have an extra set of data (for the comparison-data)
plus two legend fields:  `<lambda_size1>;<execution_time1>;<execution_cost1>;<lambda_size2>;<execution_time2>;<execution_cost2>;<legend1>;<legend2>`

---
[repo]: https://github.com/digio/aws-lambda-power-tuning-ui

# Node Execution script

[scripts/powertune.js](scripts/powertune.cjs) is a script which calls the [PowerTune](https://github.com/alexcasalboni/aws-lambda-power-tuning) stack to allow tuning of the AWS Lambdas.
It is designed to replace the [execute.sh](https://github.com/alexcasalboni/aws-lambda-power-tuning/tree/master/scripts/execute.sh) that is provided by PowerTune.

This script can be executed from the command line:

``` bash
# The config-file argument is relative to the current directory
$ ./scripts/powertune.js path/to/powertuneConfig.json

```

See [configuration information](https://github.com/alexcasalboni/aws-lambda-power-tuning/blob/master/README-INPUT-OUTPUT.md) for the basics, but note that this Node script adds the following capabilities:
- Reference one external JSON or JS files when defining the payload (see `scripts/examples/basic.json`)
- Reference multiple external JSON or JS files when defining the payload (see `scripts/examples/multiInclude.json`)
- Pass arguments to included JS files (see `scripts/examples/includeFunctionWithArgs.json`)

## DNPM ependencies

This script requires the following NodeJS packages (which are in this repo's `package.json`):
- `aws-sdk`
- `ora`
- `p-pipe`
