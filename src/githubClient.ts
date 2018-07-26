import GithubGraphQLApi from 'node-github-graphql';
import GithubClient from './types/GithubClient';

const githubClient = {
    get(token: string): GithubClient {
        return new GithubGraphQLApi({
            token: token,
        });
    },
};

export = githubClient;
