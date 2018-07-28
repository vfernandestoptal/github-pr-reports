import PullRequestTimelineEventType from '../types/PullRequestTimelineEventType';

export interface GithubUser {
    login: string;
}

export interface PullRequestReviewRequestedEvent {
    __typename: PullRequestTimelineEventType.ReviewRequestedEvent;
    requestedReviewer: GithubUser;
    createdAt: string;
}

export interface PullRequestReviewEvent {
    __typename: PullRequestTimelineEventType.PullRequestReview;
    state: string;
    author: GithubUser;
    submittedAt: string;
}

export interface PullRequestMergedEvent {
    __typename: PullRequestTimelineEventType.MergedEvent;
    actor: GithubUser;
}

type PullRequestEvent =
    | PullRequestReviewRequestedEvent
    | PullRequestReviewEvent
    | PullRequestMergedEvent;

export default PullRequestEvent;
