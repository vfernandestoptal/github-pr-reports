import async from 'async';
import moment from 'moment';

import logger from '../logger';
import { getPullRequestsQuery } from './getPullRequestsQuery';

import PullRequest from '../types/PullRequest';
import PullRequestReview from '../types/PullRequestReview';
import GithubClient from '../types/GithubClient';
import RepositoryDatePeriod from '../types/RepositoryDatePeriod';
import PullRequestTimelineEventType from '../types/PullRequestTimelineEventType';
import PullRequestReviewState from '../types/PullRequestReviewState';

export async function getPullRequestsDataPage(
    options: PullRequestPageOptions
): Promise<PullRequest[]> {
    const {
        githubClient,
        organization,
        repository,
        startDate,
        endDate,
        nextPageCursor,
        results,
        attemptsCount = 0,
    } = options;

    logger.info(`Getting more Pull Requests`);

    const query = getPullRequestsQuery(
        organization,
        repository,
        nextPageCursor,
        options.pageSize
    );

    try {
        const queryResponse = await githubClient.query(query);

        const pullRequests = await parsePullRequestsResponse(queryResponse);
        const pullRequestsPage = await filterPullRequestsByDate(
            pullRequests,
            startDate,
            endDate
        );

        if (pullRequestsPage.next) {
            return await getPullRequestsDataPage({
                ...options,
                nextPageCursor: pullRequestsPage.next,
                results: results.concat(pullRequestsPage.data),
                attemptsCount: 0,
            });
        } else {
            return results.concat(pullRequestsPage.data);
        }
    } catch (error) {
        if (attemptsCount < options.maxRetryCount) {
            logger.warn('Error getting data, retrying...');
            return await getPullRequestsDataPage({
                ...options,
                attemptsCount: attemptsCount + 1,
            });
        }
        logger.error(error);
        throw new Error('Error getting pull requests data');
    }
}

function filterPullRequestsByDate(
    response: PullRequestsPage,
    startDate: string,
    endDate: string
): PullRequestsPage {
    const pullRequests = response.data.filter(pr =>
        pr.createdAt.isBetween(startDate, endDate)
    );

    const hasMoreData =
        response.next &&
        response.data.length > 0 &&
        response.data[response.data.length - 1].createdAt.isAfter(startDate);

    return {
        data: pullRequests,
        next: hasMoreData ? response.next : '',
    };
}

function parsePullRequestsResponse(
    response: PullRequestResponse
): Promise<PullRequestsPage> {
    if (
        response == null ||
        response.data == null ||
        response.data.repository == null ||
        response.data.repository.pullRequests == null
    ) {
        return Promise.reject(new Error('Invalid response contents'));
    }

    const nextPageCursor =
        response.data.repository.pullRequests.pageInfo.endCursor;
    const data: Array<PullRequestNode> =
        response.data.repository.pullRequests.nodes;

    logger.info(`Parsing another ${data.length} Pull Requests`);

    return new Promise((resolve, reject) => {
        async.map(
            data,
            (pr: PullRequestNode, callback) => {
                logger.debug(
                    `Parsing Pull Request ${pr.number} from ${
                        pr.author.login
                    } created at ${pr.createdAt}`
                );

                const mergeAction: PullRequestMergedEvent | null = pr.timeline.nodes.find(
                    event =>
                        event.__typename ===
                        PullRequestTimelineEventType.MergedEvent
                ) as PullRequestMergedEvent;
                const totalReviews = pr.timeline.nodes.filter(
                    event =>
                        event.__typename ===
                        PullRequestTimelineEventType.PullRequestReview
                ).length;

                async.setImmediate(() =>
                    callback(void 0, {
                        url: pr.url,
                        author: pr.author.login,
                        createdAt: moment.utc(pr.createdAt),
                        mergedAt:
                            (mergeAction && moment.utc(pr.mergedAt)) ||
                            undefined,
                        mergedBy:
                            (mergeAction && mergeAction.actor.login) ||
                            undefined,
                        baseRefName: pr.baseRefName,
                        headRefName: pr.headRefName,
                        state: pr.state,
                        totalReviews: totalReviews,
                        reviews: parsePullRequestReviews(pr.timeline.nodes).map(
                            review => {
                                if (
                                    !review.assignedAt ||
                                    (review.submittedAt &&
                                        review.submittedAt < review.assignedAt)
                                ) {
                                    review.assignedAt = moment.utc(
                                        pr.createdAt
                                    );
                                }
                                return review;
                            }
                        ),
                    })
                );
            },
            (err, pullRequests) => {
                if (err) {
                    return reject(new Error('Error parsing data'));
                }

                resolve({
                    data: pullRequests as PullRequest[],
                    next: nextPageCursor,
                });
            }
        );
    });
}

function parsePullRequestReviews(
    events: PullRequestEvent[]
): PullRequestReview[] {
    const reviews = events.reduce(
        (reviews: PullRequestReviewsMap, event: PullRequestEvent) => {
            if (
                event.__typename ===
                PullRequestTimelineEventType.ReviewRequestedEvent
            ) {
                reviews = addReviewRequestEvent(
                    event as PullRequestReviewRequestedEvent,
                    reviews
                );
            } else if (
                event.__typename ===
                PullRequestTimelineEventType.PullRequestReview
            ) {
                reviews = addReviewDoneEvent(
                    event as PullRequestReviewEvent,
                    reviews
                );
            }

            return reviews;
        },
        {}
    );

    return Object.keys(reviews).map(user => reviews[user]);
}

function addReviewRequestEvent(
    event: PullRequestReviewRequestedEvent,
    reviews: PullRequestReviewsMap
): PullRequestReviewsMap {
    const user = event.requestedReviewer.login;
    const review = reviews[user] || { user };

    if (!review.assignedAt) {
        review.assignedAt = moment.utc(event.createdAt);
    }
    reviews[user] = review;

    return reviews;
}

function addReviewDoneEvent(
    event: PullRequestReviewEvent,
    reviews: PullRequestReviewsMap
): PullRequestReviewsMap {
    if (
        event.state === PullRequestReviewState.APPROVED ||
        event.state === PullRequestReviewState.CHANGES_REQUESTED ||
        event.state === PullRequestReviewState.COMMENTED
    ) {
        const user = event.author.login;
        const review = reviews[user] || { user };

        if (!review.state) {
            review.submittedAt =
                (event.submittedAt && moment.utc(event.submittedAt)) || null;
            review.state = event.state;
        }

        reviews[user] = review;
    }

    return reviews;
}

interface PullRequestPageOptions extends RepositoryDatePeriod {
    githubClient: GithubClient;
    nextPageCursor?: string;
    results: PullRequest[];
    attemptsCount?: number;
    maxRetryCount: number;
    pageSize: number;
}

interface PullRequestResponse {
    data?: {
        repository?: {
            pullRequests: {
                pageInfo: {
                    endCursor?: string;
                };
                nodes: PullRequestNode[];
            };
        };
    };
}

interface PullRequestNode {
    number: string;
    url: string;
    baseRefName: string;
    headRefName: string;
    state: string;
    author: {
        login: string;
    };
    createdAt: string;
    mergedAt: string;
    timeline: {
        nodes: PullRequestEvent[];
    };
}

type PullRequestEvent =
    | PullRequestReviewRequestedEvent
    | PullRequestReviewEvent
    | PullRequestMergedEvent;

interface PullRequestReviewRequestedEvent {
    __typename: PullRequestTimelineEventType.ReviewRequestedEvent;
    requestedReviewer: GithubUser;
    createdAt: string;
}

interface PullRequestReviewEvent {
    __typename: PullRequestTimelineEventType.PullRequestReview;
    state: string;
    author: GithubUser;
    submittedAt: string;
}

interface PullRequestMergedEvent {
    __typename: PullRequestTimelineEventType.MergedEvent;
    actor: GithubUser;
}

interface GithubUser {
    login: string;
}

interface PullRequestsPage {
    data: PullRequest[];
    next?: string;
}

interface PullRequestReviewsMap {
    [user: string]: PullRequestReview;
}
