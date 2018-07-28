import RepositoryDatePeriod from './RepositoryDatePeriod';

export default interface PullRequestOptions extends RepositoryDatePeriod {
    token: string;
    maxRetryCount?: number;
    pageSize?: number;
}
