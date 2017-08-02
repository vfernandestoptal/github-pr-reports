'use strict';

const PullRequestState = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    MERGED: 'MERGED',
};

const PullRequestTimelineEventType = {
    ReviewRequestedEvent: 'ReviewRequestedEvent',
    PullRequestReview: 'PullRequestReview',
    MergedEvent: 'MergedEvent',
};

const PullRequestReviewState = {
    PENDING: 'PENDING',
    COMMENTED: 'COMMENTED',
    APPROVED: 'APPROVED',
    CHANGES_REQUESTED: 'CHANGES_REQUESTED',
    DISMISSED: 'DISMISSED',
};

module.exports = {
    PullRequestState: PullRequestState,
    PullRequestTimelineEventType: PullRequestTimelineEventType,
    PullRequestReviewState: PullRequestReviewState,
};
