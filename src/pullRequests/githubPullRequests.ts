import config from 'config';
import moment from 'moment';

import logger from '../logger';
import GithubClientFactory from '../githubClient';
import PullRequestOptions from '../types/PullRequestOptions';
import PullRequestsData from '../types/PullRequestsData';
import { getPullRequestsDataPage } from './getPullRequestsDataPage';

const MaxRetryCount = config.get<number>('github.api.retries');
const QUERY_PAGE_SIZE = 50;

/**
 * Gets data for pull requests created between the specified start/end date
 */
export async function getPullRequestsData(
    options: PullRequestOptions
): Promise<PullRequestsData> {
    const { token, organization, repository, startDate, endDate } = options;

    logger.info(`Getting Pull Requests Data for ${organization}/${repository}`);

    const githubClient = GithubClientFactory.get(token);

    const pullRequests = await getPullRequestsDataPage({
        githubClient,
        organization,
        repository,
        startDate,
        endDate,
        nextPageCursor: '',
        maxRetryCount: MaxRetryCount,
        pageSize: QUERY_PAGE_SIZE,
        results: [],
    });

    logger.info(`Got ${pullRequests.length} Pull Requests Data`);

    return {
        organization,
        repository,
        startDate,
        endDate,
        generatedOn: moment.utc(),
        pullRequests,
    };
}
