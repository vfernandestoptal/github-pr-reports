'use strict';

const bluebird = require('bluebird');
const moment = require('moment');
const logger = require('./logger');
const GithubClient = require('./githubClient');
const PullRequestTimelineEventType = require('./githubEnums').PullRequestTimelineEventType;

function getPullRequestsQuery(organization, repository, after, count) {
    return `
        query {
            repository(owner: "${organization}", name: "${repository}") {
                pullRequests(${after ? `after: "${after}",` : ''} first: ${count}, orderBy: {field: CREATED_AT, direction: DESC} ) {
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                    nodes {
                        number
                        state
                        createdAt
                        mergedAt
                        headRefName
                        baseRefName
                        author {
                            login
                        }
                        timeline(first:100) {
                            nodes {
                                __typename
                                ... on ReviewRequestedEvent {
                                    subject {
                                        login
                                    }
                                    createdAt
                                }
                                ... on PullRequestReview {
                                    author {
                                        login
                                    }
                                    createdAt
                                    submittedAt
                                    state
                                }
                                ... on MergedEvent {
                                    actor {
                                        login
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
}

/**
 * Gets data for pull requests created between the specified start/end date
 * @param {object} options
 * @returns {Promise}
 */
function getPullRequestsData(options) {
    const token = options.token;
    const organization = options.organization;
    const repository = options.repository;
    const startDate = options.startDate;
    const endDate = options.endDate;

    logger.info(`Getting Pull Requests Data for ${organization}/${repository}`);

    const githubClient = GithubClient.get(token);

    return getPullRequestsDataPage({
        githubClient,
        organization,
        repository,
        startDate,
        endDate,
        nextPageCursor: '',
        results: [],
    })
        .then(pullRequests => {
            logger.info(`Got ${pullRequests.length} Pull Requests Data`);
            return {
                organization,
                repository,
                startDate,
                endDate,
                pullRequests,
            };
        })
        .then(data => {
            require('fs').writeFileSync(`pullRequestsData.json`, JSON.stringify(data, null, 4));
            return data;
        });
}

function getPullRequestsDataPage(options) {
    const githubClient = options.githubClient;
    const organization = options.organization;
    const repository = options.repository;
    const startDate = options.startDate;
    const endDate = options.endDate;
    const nextPageCursor = options.nextPageCursor;
    const results = options.results;

    logger.info(`Getting more Pull Requests`);

    const query = getPullRequestsQuery(organization, repository, nextPageCursor, 100);

    return githubClient.query(query)
        .then(response => {
            require('fs').writeFileSync(`githubPullRequests_${nextPageCursor}.json`, JSON.stringify(response, null, 4));
            return response;
        })
        .then(response => parsePullRequestsResponse(response))
        .then(response => filterPullRequestsByDate(response, startDate, endDate))
        .then(response => {
            if (response.next) {
                return getPullRequestsDataPage({
                    githubClient,
                    organization,
                    repository,
                    startDate,
                    endDate,
                    nextPageCursor: response.next,
                    results: results.concat(response.data),
                });
            }
            else {
                return results.concat(response.data);
            }
        })
        .catch(error => {
            logger.error(error);
            return bluebird.reject(new Error('Error getting pull requests data'));
        });
}

function filterPullRequestsByDate(response, startDate, endDate) {
    const pullRequests = response.data
        .filter(pr => pr.createdAt.isBetween(startDate, endDate));

    const hasMoreData = response.next && pullRequests.length > 0 && response.data[response.data.length - 1].createdAt.isAfter(startDate);

    return bluebird.resolve({
        data: pullRequests,
        next: hasMoreData ? response.next : '',
    });
}

function parsePullRequestsResponse(response) {
    const hasData = !!(response && response.data && response.data.repository && response.data.repository.pullRequests);
    if (!hasData) {
        return bluebird.reject(new Error('Invalid response contents'));
    }

    const nextPageCursor = response.data.repository.pullRequests.pageInfo.endCursor;
    const data = response.data.repository.pullRequests.nodes;

    logger.info(`Parsing another ${data.length} Pull Requests`);

    const pullRequests = data.map(pr => {
        logger.debug(`Parsing Pull Request ${pr.number} from ${pr.author.login} created at ${pr.createdAt}`);

        const mergeAction = pr.timeline.nodes.find(event => event.__typename === PullRequestTimelineEventType.MergedEvent);

        return {
            author: pr.author.login,
            createdAt: moment.utc(pr.createdAt),
            mergedAt: mergeAction && moment.utc(pr.mergedAt) || undefined,
            mergedBy: mergeAction && mergeAction.actor.login || undefined,
            baseRefName: pr.baseRefName,
            headRefName: pr.headRefName,
            state: pr.state,
            reviews: parsePullRequestReviews(pr.timeline.nodes).map(review => {
                if (!review.createdAt) {
                    review.createdAt = moment.utc(pr.createdAt);
                }
                return review;
            }),
        };
    });

    return bluebird.resolve({ data: pullRequests, next: nextPageCursor });
}

function parsePullRequestReviews(events) {
    const reviews = events
        .reduce((reviews, event) => {
            if (event.__typename === PullRequestTimelineEventType.ReviewRequestedEvent) {
                reviews = addReviewRequestEvent(event, reviews);
            }
            else if (event.__typename === PullRequestTimelineEventType.PullRequestReview) {
                reviews = addReviewDoneEvent(event, reviews);
            }

            return reviews;
        }, {});

    return Object.keys(reviews)
        .map(user => reviews[user]);
}

function addReviewRequestEvent(event, reviews) {
    const user = event.subject.login;
    const review = reviews[user] || { user };

    if (!review.assignedAt) {
        review.assignedAt = moment.utc(event.createdAt);
    }
    reviews[user] = review;

    return reviews;
}

function addReviewDoneEvent(event, reviews) {
    const user = event.author.login;
    const review = reviews[user] || { user };

    if (!review.state) {
        review.submittedAt = moment.utc(event.submittedAt);
        review.state = event.state;
    }

    reviews[user] = review;

    return reviews;
}

module.exports = {
    getPullRequestsData: getPullRequestsData,
};
