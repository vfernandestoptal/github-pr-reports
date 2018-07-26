export function getPullRequestsQuery(
    organization: string,
    repository: string,
    after: string | null | undefined,
    count: number
): string {
    return `
        query {
            repository(owner: "${organization}", name: "${repository}") {
                pullRequests(${
                    after ? `after: "${after}",` : ''
                } first: ${count}, orderBy: {field: CREATED_AT, direction: DESC} ) {
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                    nodes {
                        number
                        url
                        state
                        createdAt
                        mergedAt
                        headRefName
                        baseRefName
                        author {
                            login
                        }
                        timeline(first:100) {
                            nodes {
                                __typename
                                ... on ReviewRequestedEvent {
                                    requestedReviewer {
                                        __typename
                                        ... on User {
                                            login
                                        }
                                    }
                                    createdAt
                                }
                                ... on PullRequestReview {
                                    author {
                                        login
                                    }
                                    createdAt
                                    submittedAt
                                    state
                                }
                                ... on MergedEvent {
                                    actor {
                                        login
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
}
