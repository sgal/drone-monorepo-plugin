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
});
