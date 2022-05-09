#!/usr/bin/env node
/* eslint-disable node/shebang */
/* eslint-disable node/no-extraneous-require */

// This is a NodeJS script for executing the PowerTune process using a specific JSON config file.
// This script expects that you have deployed the PowerTune stack already (POWER_TUNE_STACK_NAME).
//
// The benefit of this script over the Bash script at https://github.com/alexcasalboni/aws-lambda-power-tuning/tree/master/scripts/execute.sh
// is the ability to
//
// PowerTune: https://github.com/alexcasalboni/aws-lambda-power-tuning
// Configuration: https://github.com/alexcasalboni/aws-lambda-power-tuning/blob/master/README-INPUT-OUTPUT.md

const CloudFormationClient = require('aws-sdk/clients/cloudformation');
const StepFunctionClient = require('aws-sdk/clients/stepfunctions');
const path = require('path');
const pipe = require('p-pipe');
const ora = require('ora');

const POWER_TUNE_STACK_NAME = 'serverlessrepo-aws-lambda-power-tuning';
const MIN_ARGS = 3;
const stepFunction = new StepFunctionClient();

const tuneSuite = pipe(
  getStateMachineArnFromStack,
  processTuneConfig,
  tune,
  checkProgress,
  report
);

const context = {
  powerTuneStackName: POWER_TUNE_STACK_NAME,
  configFile: '',
  tuneConfig: '',
  stateMachineArn: '',
  executionArn: '',
  output: '',
};

(async function main() {
  if (process.argv.length < MIN_ARGS) {
    return showHelp();
  }

  const [configFile] = process.argv.slice(2);
  context.configFile = configFile;

  try {
    await tuneSuite(context);
  } catch (err) {
    console.error(err);
    console.log('😵  PowerTune failed!');
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }

  console.log('✨  PowerTune complete!');
  // eslint-disable-next-line no-process-exit
  process.exit(0);
})();

function showHelp() {
  console.log('PowerTune');
  console.log('Usage:');
  console.log('  ./scripts/powertune.js <tuneConfigFile>');
  console.log('\nwhere:');
  console.log('  tuneConfigFile    Path to the tune config file, relative to the script');
  console.log('\nExample: ./scripts/powertune.js powerTune/publishPlanStream.json');
  console.log('\nNote: The AWS_PROFILE environment variable must be set.');
  console.log(
    '\nReference: https://github.com/alexcasalboni/aws-lambda-power-tuning/blob/master/README-INPUT-OUTPUT.md'
  );
  console.log('');
}

async function getStateMachineArnFromStack(context) {
  const cf = new CloudFormationClient();
  const params = {
    StackName: context.powerTuneStackName,
  };

  const promise = cf
    .describeStacks(params)
    .promise()
    .then(result => result.Stacks[0].Outputs.filter(o => o.OutputKey === 'StateMachineARN')[0].OutputValue)
    .then(stateMachineArn => ({ ...context, stateMachineArn }));

  ora.promise(promise, { text: 'Getting a reference to the PowerTune step function' });
  return promise;
}

function processTuneConfig(context) {
  const configFilePath = path.resolve(process.cwd(), context.configFile);
  const configFileDir = path.dirname(configFilePath);
  const config = require(configFilePath);

  // Check if config.payload is an object or an array. This supports single or multi-payload tuning configs
  const payloadIsArray = Array.isArray(config.payload);

  if (payloadIsArray) {
    config.payload.forEach(payload => {
      Object.entries(payload.payload)
        .filter(([key]) => key.indexOf('$$include') === 0)
        .forEach(([key, pathValue]) => {
          const includeData = require(path.resolve(configFileDir, pathValue));

          if (typeof includeData === 'function') {
            // Look for the corresponding $$args<n> key
            const keyNum = key.match(/\d+/);
            const args = payload.payload['$$args' + keyNum];

            payload.payload = { ...payload.payload, ...includeData(...args) };

            // Delete the $$args<n>... key
            delete payload.payload['$$args' + keyNum];
          } else {
            // Assume includeData is an object
            payload.payload = { ...payload.payload, ...includeData };
          }

          // Delete the $$include... key
          delete payload.payload[key];
        });
    });
  } else {
    Object.entries(config.payload)
      .filter(([key]) => key.indexOf('$$include') === 0)
      .map(([key, pathValue]) => {
        // Include the content
        config.payload = { ...config.payload, ...require(path.resolve(configFileDir, pathValue)) };

        // Delete the $$include... key
        delete config.payload[key];
      });
  }

  return { ...context, tuneConfig: config };
}

async function tune(context) {
  const params = {
    stateMachineArn: context.stateMachineArn,
    input: JSON.stringify(context.tuneConfig),
  };

  const promise = stepFunction
    .startExecution(params) // Limit of 262144 bytes
    .promise()
    .then(result => {
      return { ...context, executionArn: result.executionArn };
    });

  ora.promise(promise, { text: 'Start PowerTune' });
  return promise;
}

async function checkProgress(context) {
  const params = { executionArn: context.executionArn };
  let isRunning = true;

  const progressPromise = new Promise(async (resolve, reject) => {
    do {
      await sleep(1000);

      const { status, output } = await stepFunction
        .describeExecution(params)
        .promise()
        .then(data => {
          return { status: data.status, output: data.output };
        })
        .catch(err => {
          isRunning = false;
          throw err;
        });

      if (['FAILED', 'TIMED_OUT', 'ABORTED'].includes(status)) {
        reject({
          ...context,
          output: `The execution failed, you can check the execution logs with the following script:\naws stepfunctions get-execution-history --execution-arn ${
            context.executionArn
          }`,
        });
        isRunning = false;
      } else if (status === 'SUCCEEDED') {
        resolve({ ...context, output });
        isRunning = false;
      }
    } while (isRunning);
  });

  ora.promise(progressPromise, { text: 'Running...' });
  return progressPromise;
}

function report(context) {
  let output = context.output;

  try {
    output = JSON.parse(context.output).stateMachine.visualization;
  } catch (err) {
    // do nothing
  }
  const promise = Promise.resolve(output);

  ora.promise(promise, 'Visualization: ' + output);
  return promise;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
