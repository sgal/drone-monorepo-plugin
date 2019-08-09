describe("changes", () => {
    describe("hasChangesetTrigger", () => {
        it("should return false if changeset param is null", () => {
            const changes = require("../changes");
            const result = changes.hasChangesetTrigger(null);

            expect(result).toBe(false);
        });

        it("should return false if changeset param is an empty array", () => {
            const changes = require("../changes");
            const result = changes.hasChangesetTrigger([]);

            expect(result).toBe(false);
        });

        it("should return true if changeset param is non-empty array", () => {
            const changes = require("../changes");
            const result = changes.hasChangesetTrigger([1]);

            expect(result).toBe(true);
        });

        it("should return false if changeset param is an object with no 'include' or 'exclude' keys", () => {
            const changes = require("../changes");
            const result = changes.hasChangesetTrigger({});

            expect(result).toBe(false);
        });

        it("should return false if changeset's 'include' value is empty", () => {
            const changes = require("../changes");
            const result = changes.hasChangesetTrigger({include: []});

            expect(result).toBe(false);
        });

        it("should return false if changeset's 'exclude' value is empty", () => {
            const changes = require("../changes");
            const result = changes.hasChangesetTrigger({exclude: []});

            expect(result).toBe(false);
        });

        it("should return true if changeset's 'include' value is non-empty", () => {
            const changes = require("../changes");
            const result = changes.hasChangesetTrigger({include: [1]});

            expect(result).toBe(true);
        });

        it("should return true if changeset's 'exclude' value is non-empty", () => {
            const changes = require("../changes");
            const result = changes.hasChangesetTrigger({exclude: [1]});

            expect(result).toBe(true);
        });

        it("should ignore 'exclude' value if 'include' is present", () => {
            const changes = require("../changes");
            const result = changes.hasChangesetTrigger({include: [], exclude: [1]});

            expect(result).toBe(false);
        });
    });

    describe("getIncludeTriggers", () => {
        it("should return triggerConfig param if it is an array", () => {
            const changes = require("../changes");
            const trigger = [];
            const result = changes.getIncludeTriggers(trigger);

            expect(result).toBe(trigger);
        });

        it("should return triggerConfig's 'include' value if trigger is an object", () => {
            const changes = require("../changes");
            const trigger = {include: []};
            const result = changes.getIncludeTriggers(trigger);

            expect(result).toBe(trigger.include);
        });
    });

    describe("isMatchingEvent", () => {
        it("should return false if there are no include triggers in the triggerConfig", () => {
            const changes = require("../changes");
            const trigger = {};
            const result = changes.isMatchingEvent(trigger, "push");

            expect(result).toBe(false);
        });

        it("should return false if event does not match any of the include triggers", () => {
            const changes = require("../changes");
            const trigger = {include: ["push"]};
            const result = changes.isMatchingEvent(trigger, "pull_request");

            expect(result).toBe(false);
        });

        it("should return true if event matches some of the include triggers", () => {
            const changes = require("../changes");
            const trigger = {include: ["push"]};
            const result = changes.isMatchingEvent(trigger, "push");

            expect(result).toBe(true);
        });
    });

    describe("matchChanges", () => {
        it("should return false if neither include nor exclude filters are set", () => {
            const changes = require("../changes");
            const changedFiles = ["package.json", "index.js"];
            const trigger = {};
            const result = changes.matchChanges(trigger, changedFiles);

            expect(result).toBe(false);
        });

        it("should return false if changed files do not match the include trigger", () => {
            const changes = require("../changes");
            const changedFiles = ["package.json", "index.js"];
            const trigger = {include: ["*.md"]};
            const result = changes.matchChanges(trigger, changedFiles);

            expect(result).toBe(false);
        });

        it("should return true if changed files match the include trigger", () => {
            const changes = require("../changes");
            const changedFiles = ["package.json", "index.js"];
            const trigger = {include: ["*.js"]};
            const result = changes.matchChanges(trigger, changedFiles);

            expect(result).toBe(true);
        });

        it("should return false if changed files match the exclude trigger", () => {
            const changes = require("../changes");
            const changedFiles = ["cli.js", "index.js"];
            const trigger = {exclude: ["*.js"]};
            const result = changes.matchChanges(trigger, changedFiles);

            expect(result).toBe(false);
        });

        it("should return true if changed files do not match the exclude trigger", () => {
            const changes = require("../changes");
            const changedFiles = ["cli.js", "index.js"];
            const trigger = {exclude: ["*.md"]};
            const result = changes.matchChanges(trigger, changedFiles);

            expect(result).toBe(true);
        });
    });

    describe("filterSteps", () => {
        it("should return original steps if none of them have changeset triggers", () => {
            const changes = require("../changes");
            const steps = [{}, {}];
            const changedFiles = ["cli.js", "index.js"];
            const result = changes.filterSteps(steps, changedFiles);

            expect(result).toEqual(steps);
        });

        it("should filter out steps that do not match the changeset triggers", () => {
            const changes = require("../changes");
            const steps = [
                {
                    when: {
                        changeset: ["*.md"]
                    }
                },
                {}
            ];
            const changedFiles = ["cli.js", "index.js"];
            const result = changes.filterSteps(steps, changedFiles);

            expect(result).toEqual([steps[1]]);
        });
    });
});
