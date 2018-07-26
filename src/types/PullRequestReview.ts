import moment from 'moment';

export default interface PullRequestReview {
    user: string;
    state?: string;
    assignedAt?: moment.Moment;
    submittedAt?: moment.Moment | null;
}
