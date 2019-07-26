const mm = require("micromatch");
const yaml = require("yaml");

const noopConfig = index => `kind: pipeline
  name: default_${index}
  trigger:
    event:
      exclude: [ "*" ]
`;

const hasChangesetTrigger = changeset =>
    changeset && (changeset.include || changeset.exclude);

const isMatchingEvent = (eventTrigger, event) =>
    eventTrigger.include && eventTrigger.include.indexOf(event) > -1;

const matchChanges = (triggerConfig, changedFiles) => {
    if (triggerConfig.include) {
        return mm(changedFiles, triggerConfig.include).length > 0;
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

module.exports = getMatchingConfig;
