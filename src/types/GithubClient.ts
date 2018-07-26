export default interface GithubClient {
    url: string;
    token: string;
    query(query: string): any;
}
