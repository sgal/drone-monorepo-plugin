const secretValueConfig = {
    kind: "secret",
    name: "access_id",
    get: {
        path: "prod/aws",
        name: "access_key_id"
    }
};

const noChangesetConfig = [
    {
        kind: "pipeline",
        name: "build",

        steps: [
            {
                name: "build",
                image: "node:10.15.3",
                commands: [
                    "export TZ=Europe/Stockholm",
                    "curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 1.16.0",
                    'export PATH="$HOME/.yarn/bin:$PATH"',
                    "yarn install --ignore-optional --frozen-lockfile",
                    "yarn build"
                ]
            }
        ],

        trigger: {
            branch: ["master"],
            event: ["push"]
        }
    },
    secretValueConfig
];

const getPipelineChangesetConfig = changeset => [
    {
        kind: "pipeline",
        name: "build",

        steps: [
            {
                name: "build",
                image: "node:10.15.3",
                commands: [
                    "export TZ=Europe/Stockholm",
                    "curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 1.16.0",
                    'export PATH="$HOME/.yarn/bin:$PATH"',
                    "yarn install --ignore-optional --frozen-lockfile",
                    "yarn build"
                ]
            }
        ],

        trigger: {
            changeset,
            event: ["push"]
        }
    },
    secretValueConfig
];

const stepsChangesetConfig = [
    {
        kind: "pipeline",
        name: "build",

        steps: [
            {
                name: "test",
                image: "node:10.15.3",
                commands: ["npm run test"],
                when: {
                    changeset: ["*.test.js"]
                }
            },
            {
                name: "build",
                image: "node:10.15.3",
                commands: ["npm run build"],
                when: {
                    changeset: ["*.js"]
                }
            }
        ],

        trigger: {
            branch: ["master"],
            event: ["push"]
        }
    }
];

const getConfigWithStepsChangeset = stepChangesetConfig => [
    {
        kind: "pipeline",
        name: "build",

        steps: [
            {
                name: "test",
                image: "node:10.15.3",
                commands: ["npm run test"],
                when: {
                    changeset: stepChangesetConfig
                }
            },
            {
                name: "build",
                image: "node:10.15.3",
                commands: ["npm run build"],
                when: {
                    changeset: stepChangesetConfig
                }
            }
        ],

        trigger: {
            branch: ["master"],
            event: ["push"]
        }
    }
];

module.exports = {
    noChangesetConfig,
    stepsChangesetConfig,
    getPipelineChangesetConfig,
    getConfigWithStepsChangeset
};
