// The purpose of this script is to load a fixture file (specified as an argument) and create the event for the lambda
// within the context of the Powertune process.
// For Powertune, you need to use a smaller (< 250kB)  PDF so that the data doesn't exceed the stepFunction.startExecution(params) size limit.
// If the PDF is larger you can upload it to S3 and use the PowerTune S3 config
const fs = require('fs');
const path = require('path');

/**
 *
 * @param fixtureName {string}
 * @returns {{isBase64Encoded: boolean, body: string}}
 */
module.exports = function payloadAdaptor(fixtureName) {
  console.log('fixtureName', fixtureName);

  const data = fs.readFileSync(path.join(__dirname, '/../../', fixtureName));

  return {
    isBase64Encoded: true,
    body: data.toString('base64'),
  };
};
