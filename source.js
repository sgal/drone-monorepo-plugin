const yaml = require("yaml");

const INITIAL_COMMIT_SHA = "0000000000000000000000000000000000000000";

const fetchConfigData = async ({octokit, owner, repo, path, ref}) => {
    try {
        const {data} = await octokit.repos.getContents({
            owner,
            repo,
            path,
            ref
        });
        return Buffer.from(data.content, "base64").toString();
    } catch (e) {
        console.error("fetchConfigData", e);
        return null;
    }
};

const getConfig = async options => {
    const rawConfig = await fetchConfigData(options);
    if (!rawConfig) return {rawConfig: null, parsedConfig: null};

    try {
        const parsedConfig = rawConfig.split("\n---\n").map(yaml.parse);
        return {rawConfig, parsedConfig};
    } catch (e) {
        console.error("getConfig", e);
        return {rawConfig, parsedConfig: null};
    }
};

const getBranchHead = async ({octokit, owner, repo, branch}) => {
    try {
        const {data} = await octokit.repos.getBranch({
            owner,
            repo,
            branch
        });
        return data.commit.sha;
    } catch (e) {
        console.error("getBranchHead", e);
        return null;
    }
};

const getFilesDiff = async apiCallPromise => {
    try {
        const {data} = await apiCallPromise;
        return data.files.map(file => file.filename);
    } catch (e) {
        console.error("getFilesDiff", e);
        return [];
    }
};

const getDiffWithBase = ({octokit, owner, repo, base, head}) =>
    getFilesDiff(
        octokit.repos.compareCommits({
            owner,
            repo,
            base,
            head
        })
    );

const getDiffForCommit = ({octokit, owner, repo, ref}) =>
    getFilesDiff(
        octokit.repos.getCommit({
            owner,
            repo,
            ref
        })
    );

const getChangesForPullRequest = async ({octokit, owner, repo, buildData}) => {
    const baseBranchHead = await getBranchHead({
        octokit,
        owner,
        repo,
        branch: buildData.target
    });

    if (!baseBranchHead) return [];

    return getDiffWithBase({
        octokit,
        owner,
        repo,
        base: baseBranchHead,
        head: buildData.after
    });
};

const getChangesForBranch = ({octokit, owner, repo, buildData}) => {
    if (!buildData.before || buildData.before === INITIAL_COMMIT_SHA) {
        return getDiffForCommit({octokit, owner, repo, ref: buildData.after});
    }

    return getDiffWithBase({
        octokit,
        owner,
        repo,
        base: buildData.before,
        head: buildData.after
    });
};

const getChangedFiles = async options => {
    const isPullRequest = options.buildData.source !== options.buildData.target;
    if (isPullRequest) {
        return getChangesForPullRequest(options);
    }

    return getChangesForBranch(options);
};

module.exports = {
    getConfig,
    getChangedFiles
};
