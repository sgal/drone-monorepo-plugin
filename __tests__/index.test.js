const mockLog = () => {
    const logMock = jest.fn();
    const errorMock = jest.fn();
    jest.doMock("../log", () => ({
        log: logMock,
        error: errorMock
    }));

    return {logMock, errorMock};
};

const mockSecrets = ({github, plugin}) => {
    jest.doMock("../env", () =>
        jest.fn().mockResolvedValueOnce({
            GITHUB_TOKEN: github,
            DRONE_PLUGIN_SECRET: plugin
        })
    );
};

const mockOctokit = () => {
    jest.doMock("@octokit/rest", () => {
        return function Octokit() {
            return {};
        };
    });
};

const mockSource = ({rawConfig, parsedConfig, changedFiles}) => {
    jest.doMock("../source", () => ({
        getConfig: jest.fn().mockResolvedValueOnce({rawConfig, parsedConfig}),
        getChangedFiles: jest.fn().mockResolvedValueOnce(changedFiles)
    }));
};

describe("index.handler", () => {
    afterEach(() => {
        jest.resetModules();
    });

    it("should respond with 204 if cannot read secrets", async () => {
        mockSecrets({github: null, plugin: null});
        const {errorMock} = mockLog();

        const callback = jest.fn();
        const index = require("../index");
        const mockEvent = {
            body: "{}"
        };
        await index.handler(mockEvent, {}, callback);
        expect(callback).toBeCalledWith(null, {statusCode: 204});
        expect(errorMock).toBeCalledWith("Cannot read secrets");
    });

    it("should respond with 204 if cannot parse the event body", async () => {
        mockSecrets({github: "123", plugin: "123"});
        const {errorMock} = mockLog();
        const callback = jest.fn();
        const index = require("../index");

        const mockEvent = {
            body: "{123"
        };
        await index.handler(mockEvent, {}, callback);
        expect(callback).toBeCalledWith(null, {statusCode: 204});
        expect(errorMock).toBeCalled();
    });

    it("should respond with rawConfig if it cannot be parsed", async () => {
        const rawConfig = "123";
        mockSecrets({github: "123", plugin: "123"});
        mockOctokit();
        mockSource({rawConfig, parsedConfig: null});
        const {logMock} = mockLog();

        const callback = jest.fn();
        const index = require("../index");
        const mockEvent = {
            body: JSON.stringify({
                repo: {
                    namespace: "org",
                    name: "repo1",
                    config_path: ".drone.yml"
                },
                build: {
                    ref: "refs/heads/master"
                }
            })
        };
        await index.handler(mockEvent, {}, callback);
        expect(callback).toBeCalledWith(null, {
            statusCode: 200,
            body: rawConfig
        });
        expect(logMock).toBeCalledWith("No config found");
    });

    it("should respond with filteredConfig if config is valid", async () => {
        const rawConfig = "123";
        mockSecrets({github: "123", plugin: "123"});
        mockOctokit();
        mockSource({rawConfig, parsedConfig: [], changedFiles: []});
        mockLog();

        const callback = jest.fn();
        const index = require("../index");
        const mockEvent = {
            body: JSON.stringify({
                repo: {
                    namespace: "org",
                    name: "repo1",
                    config_path: ".drone.yml"
                },
                build: {
                    event: "push",
                    ref: "refs/heads/master"
                }
            })
        };
        await index.handler(mockEvent, {}, callback);
        expect(callback).toBeCalledWith(null, {
            statusCode: 200,
            body: JSON.stringify({Data: ""})
        });
    });
});
