import { expect } from 'chai';
import 'mocha';

import getPullRequestsQuery from './getPullRequestsQuery';

// const a = { a: 1, b: 2 };
// const b = { ...a, c: 3 };

it('should run', () => expect(true).to.be.true);

describe('getPullRequestsQuery', () => {
    it('should return GraphQL query to fetch first page of pull requests details for specified repository', () => {
        const expectedResult: string = `
        query {
            repository(owner: "org", name: "repo") {
                pullRequests( first: 10, orderBy: {field: CREATED_AT, direction: DESC} ) {
        `;

        const result = getPullRequestsQuery('org', 'repo', null, 10);

        expect(result).to.contains(expectedResult);
    });

    it('should use specified paging parameters', () => {
        const expectedResult = `
        query {
            repository(owner: "org", name: "repo") {
                pullRequests(after: "id-10", first: 10, orderBy: {field: CREATED_AT, direction: DESC} ) {
        `;

        const result = getPullRequestsQuery('org', 'repo', 'id-10', 10);

        expect(result).to.contains(expectedResult);
    });
});
