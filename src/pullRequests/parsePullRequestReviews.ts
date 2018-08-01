import moment from 'moment';

import PullRequestReview from '../types/PullRequestReview';
import PullRequestTimelineEventType from '../types/github/PullRequestTimelineEventType';
import PullRequestReviewState from '../types/github/PullRequestReviewState';
import PullRequestEvent from './PullRequestEvent';

interface PullRequestReviewsMap {
    [user: string]: PullRequestReview;
}

const PullRequestEventHandlers = {
    [PullRequestTimelineEventType.ReviewRequestedEvent]: addReviewRequestEvent,
    [PullRequestTimelineEventType.PullRequestReview]: addReviewDoneEvent,
};

export default function parsePullRequestReviews(
    events: PullRequestEvent[],
    prCreatedAt: string
): PullRequestReview[] {
    const reviews = events.reduce(
        (reviews: PullRequestReviewsMap, event: PullRequestEvent) => {
            return PullRequestEventHandlers[event.__typename]
                ? PullRequestEventHandlers[event.__typename](event, reviews)
                : reviews;
        },
        {}
    );
    return Object.keys(reviews)
        .map(user => reviews[user])
        .map(review => {
            if (
                !review.assignedAt ||
                (review.submittedAt && review.submittedAt < review.assignedAt)
            ) {
                review.assignedAt = moment.utc(prCreatedAt);
            }
            return review;
        });
}

export function addReviewRequestEvent(
    event: PullRequestEvent,
    reviews: PullRequestReviewsMap
): PullRequestReviewsMap {
    if (
        event.__typename === PullRequestTimelineEventType.ReviewRequestedEvent
    ) {
        const user = event.requestedReviewer.login;
        const review = reviews[user] || { user };

        if (!review.assignedAt) {
            review.assignedAt = moment.utc(event.createdAt);
        }
        reviews[user] = review;
    }

    return reviews;
}

export function addReviewDoneEvent(
    event: PullRequestEvent,
    reviews: PullRequestReviewsMap
): PullRequestReviewsMap {
    if (event.__typename === PullRequestTimelineEventType.PullRequestReview) {
        if (
            event.state === PullRequestReviewState.APPROVED ||
            event.state === PullRequestReviewState.CHANGES_REQUESTED ||
            event.state === PullRequestReviewState.COMMENTED
        ) {
            const user = event.author.login;
            const review = reviews[user] || { user };

            if (!review.state) {
                review.submittedAt =
                    (event.submittedAt && moment.utc(event.submittedAt)) ||
                    null;
                review.state = event.state;
            }

            reviews[user] = review;
        }
    }

    return reviews;
}
