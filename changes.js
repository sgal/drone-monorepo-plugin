const mm = require("micromatch");
const yaml = require("yaml");

const noopConfig = index => `kind: pipeline
  name: default_${index}
  trigger:
    event:
      exclude: [ "*" ]
`;

const hasChangesetTrigger = changeset => {
    if (!changeset) return false;
    if (Array.isArray(changeset)) return changeset.length > 0;

    const changesetConfig = changeset.include || changeset.exclude || [];
    return changesetConfig.length > 0;
};

const getIncludeTriggers = triggerConfig =>
    Array.isArray(triggerConfig) ? triggerConfig : triggerConfig.include;

const isMatchingEvent = (eventTrigger, event) => {
    const includeTriggers = getIncludeTriggers(eventTrigger);
    if (!includeTriggers) return false;

    return includeTriggers.indexOf(event) > -1;
};

const matchChanges = (triggerConfig, changedFiles) => {
    const includeTriggers = getIncludeTriggers(triggerConfig);
    if (includeTrigger) {
        return mm(changedFiles, includeTriggers).length > 0;
    }

    if (triggerConfig.exclude) {
        return mm.not(changedFiles, triggerConfig.exclude).length > 0;
    }

    return false;
};

const filterSteps = (steps, changedFiles) =>
    steps.filter(step => {
        const trigger = step.when || {};
        if (!hasChangesetTrigger(trigger)) return true;

        return matchChanges(trigger.changeset, changedFiles);
    }, []);

const getMatchingConfig = ({parsedConfig, changedFiles, droneEvent}) => {
    const filteredConfig = parsedConfig.map((configObj, index) => {
        if (configObj.kind !== "pipeline") return yaml.stringify(configObj);

        const trigger = configObj.trigger || {};
        if (!isMatchingEvent(trigger.event, droneEvent)) {
            return yaml.stringify(configObj);
        }

        if (!hasChangesetTrigger(trigger.changeset)) {
            return yaml.stringify(configObj);
        }

        const hasMatchingChanges = matchChanges(
            configObj.trigger.changeset,
            changedFiles
        );
        if (!hasMatchingChanges) {
            configObj.trigger = {event: {exclude: ["*"]}};
            return yaml.stringify(configObj);
        }

        const matchingSteps = filterSteps(configObj.steps, changedFiles);
        return matchingSteps.length
            ? yaml.stringify({...configObj, steps: matchingSteps})
            : noopConfig(index);
    });

    return filteredConfig.join("\n---\n");
};

module.exports = {
    hasChangesetTrigger,
    getIncludeTriggers,
    isMatchingEvent,
    matchChanges,
    filterSteps,
    getMatchingConfig
};
