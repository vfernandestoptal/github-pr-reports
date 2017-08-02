import test from 'ava';

import sut from '../src/githubClient';

test('has a get method', t => {
    t.is(typeof sut.get, 'function');
});

test('get returns an initialized GitHub GraphQL client', t => {
    const testToken = 'test-token';
    const client = sut.get(testToken);

    t.truthy(client);
    t.is(client.url, 'https://api.github.com/graphql');
    t.is(client.token, testToken);
    t.is(typeof client.query, 'function');
});
