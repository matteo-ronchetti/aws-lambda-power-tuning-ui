# Building and Testing this project

This document describes how to set up your development environment to build and test this project.
It also explains the basic mechanics of using `git` and `node`

- [Prerequisite Software](#prerequisite-software)
- [Project Organisation](#project-organisation)
- [Installing NPM Modules](#installing)
- [Running Tests](#running-tests)
- [Formatting your Source Code](#formatting-your-source-code)
- [Linting/verifying your Source Code](#lintingverifying-your-source-code)
- [Semantic Release setup](#semantic-release-setup)

See the [contribution guidelines][contributing] if you'd like to contribute to this project.

## Prerequisite Software

Before you can build and test this project, you must install and configure the
following products on your development machine:

- [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

- [Node.js](http://nodejs.org), (version specified in the engines field of [`package.json`](package.json)) which is used to run tests.

## Project organisation

The project is organised into the following folder structure:

- `/` - Project-level configuration (linting rules, CI, docs, license)
- `public/` - Files that are deployed to GitHub pages (web-content). The generated JS & CSS files are copied here.
- `src/` - The source code and test specifications

## Installing

```shell
# Install the dependencies & devDependencies
npm install
```

## Running Tests

```shell
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run tests and see the coverage report
npm run test:reportlist
```

## Formatting your source code

This project uses [eslint](https://eslint.org) and [prettier](https://prettier.io/) to format the source code.
If the source code is not properly formatted, the CI will fail and the PR cannot be merged.

You can automatically format your code by running:

- `npm run lint`: format _all_ source code

A better way is to set up your IDE to format the changed file on each file save.

### WebStorm / IntelliJ

1. Open `Preferences > Languages & Frameworks > JavaScript > Prettier`
1. Find the field named "Prettier Package"
1. Add `<PATH_TO_YOUR_WORKSPACE>/<project-root>/packages/web-app/node_modules/prettier`

## Linting/Verifying your Source Code

You can check that your code is properly formatted and adheres to coding style:

```shell
# Check that the code is formatted and following the coding style:
npm run verify

# Fix any auto-fixable errors
npm run lint
```

## Semantic Release Setup

This section is include for informational purposes only.

This repo uses [semantic-release][semantic-release] to manage software versions and packaging.
**There is a one-time setup-step required - WHICH HAS ALREADY BEEN DONE**, which creates a GitHub
personal access token, an NPM token, and connects them to Travis CI.

One time setup:
```shell script
cd this-project-repo
npx semantic-release-cli setup

? What is your npm registry? https://registry.npmjs.org/
? What is your npm username? u_glow
? What is your npm password? [hidden]
? Provide a GitHub Personal Access Token (create a token at https://github.com/settings/tokens/new?scopes=repo) xxxxxxxxxxxxxxxxxxxxxxx
? What CI are you using? Github Actions

```

<hr>

[contributing]: CONTRIBUTING.md
[repo]: https://github.com/digio/aws-lambda-power-tuning-ui
[readme-usage]: README.md#usage
