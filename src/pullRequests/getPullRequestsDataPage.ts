import async from 'async';
import moment from 'moment';

import logger from '../logger';
import getPullRequestsQuery from './getPullRequestsQuery';
import parsePullRequestReviews from './parsePullRequestReviews';
import PullRequestEvent, { PullRequestMergedEvent } from './PullRequestEvent';
import PullRequest from '../types/PullRequest';
import GithubClient from '../types/GithubClient';
import RepositoryDatePeriod from '../types/RepositoryDatePeriod';
import PullRequestTimelineEventType from '../types/github/PullRequestTimelineEventType';

export default async function getPullRequestsDataPage(
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
        async.map(data, parsePullRequest, (err, pullRequests) => {
            if (err) {
                return reject(new Error('Error parsing data'));
            }

            resolve({
                data: pullRequests as PullRequest[],
                next: nextPageCursor,
            });
        });
    });
}

function parsePullRequest(pr: PullRequestNode, callback) {
    logger.debug(
        `Parsing Pull Request ${pr.number} from ${pr.author.login} created at ${
            pr.createdAt
        }`
    );

    async.setImmediate(() =>
        callback(void 0, {
            url: pr.url,
            author: pr.author.login,
            createdAt: moment.utc(pr.createdAt),
            baseRefName: pr.baseRefName,
            headRefName: pr.headRefName,
            state: pr.state,
            ...getMergeActionDetails(pr),
            totalReviews: getTotalReviews(pr),
            reviews: parsePullRequestReviews(pr.timeline.nodes, pr.createdAt),
        })
    );
}

function getMergeActionDetails(pr) {
    const mergeAction = pr.timeline.nodes.find(
        event => event.__typename === PullRequestTimelineEventType.MergedEvent
    ) as PullRequestMergedEvent;

    return {
        mergedAt: (mergeAction && moment.utc(pr.mergedAt)) || undefined,
        mergedBy: (mergeAction && mergeAction.actor.login) || undefined,
    };
}

function getTotalReviews(pr) {
    return pr.timeline.nodes.filter(
        event =>
            event.__typename === PullRequestTimelineEventType.PullRequestReview
    ).length;
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

interface PullRequestsPage {
    data: PullRequest[];
    next?: string;
}
