# PowerTune Node Execution script

[![Build](https://github.com/digio/aws-lambda-power-tuning-ui/actions/workflows/gh-pages-deploy.yml/badge.svg)](https://github.com/digio/aws-lambda-power-tuning-ui/actions/workflows/gh-pages-deploy.yml)
[![NPM Version](https://img.shields.io/npm/v/ptx.svg?style=flat-square)](http://npm.im/ptx)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[scripts/ptx.js](scripts/ptx.js) is a script which calls the [PowerTune](https://github.com/alexcasalboni/aws-lambda-power-tuning) stack inside your current AWS account 
to allow tuning of the AWS Lambdas in that AWS account.
It is designed to replace the [execute.sh](https://github.com/alexcasalboni/aws-lambda-power-tuning/tree/master/scripts/execute.sh) that is provided by PowerTune.

**Note**: PTX will run using the AWS profile that is available in your shell/terminal. Set the `AWS_PROFILE` environment variable to point to the AWS profile that
you wish to use this tool in.

## Usage

``` bash
# Set your AWS Profile
$ export AWS_PROFILE=my-profile

# This might be required too
export AWS_SDK_LOAD_CONFIG=true

# Set an env-var that points to the name of the Power Tune Stack in your AWS Account
$ export PTX_STACK_NAME=serverlessrepo-aws-lambda-power-tuning

# The config-file argument is relative to the current directory
$ npm ptx path/to/powertuneConfig.json

```

See [configuration information](https://github.com/alexcasalboni/aws-lambda-power-tuning/blob/master/README-INPUT-OUTPUT.md) for the basics, **but note that this Node script adds the following capabilities**:
- Reference one external JSON or JS files when defining the payload (see `examples/configs/basic.json`)
- Reference multiple external JSON or JS files when defining the payload (see `examples/configs/multiInclude.json`)
- Pass arguments to included JS files (see `examples/configs/includeFunctionWithArgs.json`)

