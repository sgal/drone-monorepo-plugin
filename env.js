const AWS = require("aws-sdk");
AWS.config = new AWS.Config({
    region: "eu-west-1"
});

const GITHUB_TOKEN_NAME = "GITHUB_TOKEN";
const PLUGIN_SECRET_NAME = "DRONE_PLUGIN_SECRET";

const getSecrets = async () => {
    const ssm = new AWS.SSM({apiVersion: "2014-11-06"});
    try {
        const data = await ssm
            .getParameters({
                Names: [GITHUB_TOKEN_NAME, PLUGIN_SECRET_NAME],
                WithDecryption: true
            })
            .promise();

        return data.Parameters.reduce((result, param) => {
            if (param.Name === GITHUB_TOKEN_NAME) {
                return {
                    ...result,
                    [GITHUB_TOKEN_NAME]: param.Value
                };
            }

            if (param.Name === PLUGIN_SECRET_NAME) {
                return {
                    ...result,
                    [PLUGIN_SECRET_NAME]: param.Value
                };
            }

            return result;
        }, {});
    } catch (e) {
        console.error("getSecrets", e);
        return {GITHUB_TOKEN: null, DRONE_PLUGIN_SECRET: null};
    }
};

module.exports = getSecrets;
