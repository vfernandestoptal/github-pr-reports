import moment from 'moment';

import RepositoryDatePeriod from './RepositoryDatePeriod';

export default interface PullRequestsData extends RepositoryDatePeriod {
    generatedOn: moment.Moment;
    pullRequests: any[];
}
