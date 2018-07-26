import moment from 'moment';

import PullRequestReview from './PullRequestReview';

export default interface PullRequest {
    url: string;
    author: string;
    createdAt: moment.Moment;
    mergedAt?: moment.Moment;
    mergedBy?: string;
    baseRefName: string;
    headRefName: string;
    state: string;
    totalReviews: number;
    reviews: PullRequestReview[];
}
