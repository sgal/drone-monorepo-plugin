const Octokit = require("@octokit/rest");
const logger = require("./log");
const source = require("./source");
const getSecrets = require("./env");
const changes = require("./changes");

const respondSuccess = (callback, body) =>
    callback(null, {
        statusCode: 200,
        body
    });

const respondError = callback =>
    callback("Error", {
        statusCode: 500
    });

const respondNoContent = callback =>
    callback(null, {
        statusCode: 204
    });

const parseBody = body => {
    try {
        return JSON.parse(body);
    } catch (e) {
        logger.error(e);
        return null;
    }
};

module.exports.handler = async (event, context, callback) => {
    logger.log("New Drone event", event);
    logger.log("Event body", event.body);

    const {GITHUB_TOKEN, DRONE_PLUGIN_SECRET} = await getSecrets();
    if (!GITHUB_TOKEN || !DRONE_PLUGIN_SECRET) {
        logger.error("Cannot read secrets");
        return respondNoContent(callback);
    }

    const body = parseBody(event.body);
    if (!body) return respondNoContent(callback);

    const octokit = new Octokit({
        auth: `token ${GITHUB_TOKEN}`
    });

    const {rawConfig, parsedConfig} = await source.getConfig({
        octokit,
        owner: body.repo.namespace,
        repo: body.repo.name,
        path: body.repo.config_path,
        ref: body.build.ref
    });

    if (!parsedConfig) {
        logger.log("No config found");
        return respondSuccess(callback, rawConfig);
    }

    const changedFiles = await source.getChangedFiles({
        octokit,
        owner: body.repo.namespace,
        repo: body.repo.name,
        buildData: body.build
    });

    logger.log("Changed files", changedFiles);

    const finalConfig = changes.getMatchingConfig({
        parsedConfig,
        changedFiles,
        droneEvent: body.build.event
    });

    logger.log("Final config");
    logger.log(finalConfig);

    return respondSuccess(callback, JSON.stringify({Data: finalConfig}));
};
