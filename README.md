# Github Pull Request Reports

## Overview

This project implements a CLI application that will fetch pull request information from a GitHub repository, for a given time period, and then generate statistical reports per user.

Currently, it generates the following reports:

-   Pull request counts
-   Time to merge
-   Time to review
-   Time to review time bucket distribution

## Running

To execute, you will need to obtain a GitHub Api Token first.

> _TODO:_ add steps to generate GitHub Api Token

To fetch the latest data from GitHub, run:

```
$ LIVE=true npm start
```

To generate the reports based on local data copy, run:

```
$ npm start
```

## Unit tests

To run the unit tests:

```
$ npm test
```

## Main technologies and libraries used

-   Node.js (https://nodejs.org)
-   TypeScript (http://www.typescriptlang.org)
-   ESLint (https://eslint.org)
-   Prettier (https://prettier.io)
-   AVA (https://github.com/avajs/ava)
-   Winston (https://github.com/winstonjs/winston)
-   Async (https://caolan.github.io/async)
-   Moment (http://momentjs.com)
-   Bluebird (http://momentjs.com)
-   GitHub OAuth (https://github.com/maxogden/github-oauth)
-   GitHub GraphQL (https://github.com/wilsonchingg/node-github-graphql)
