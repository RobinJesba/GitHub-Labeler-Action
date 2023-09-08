const core = require("@actions/core");
const github = require("@actions/github");

async function updateLabelInPR() {
  try {
    const eventName = github.context.eventName;
    if (eventName !== "pull_request")
      throw new Error(
        `This action is intended to run only on pull_request events, not on ${eventName} events.`
      );

    let labelsToAdd = getInput("LABELS_TO_ADD");
    let labelsToRemove = getInput("LABELS_TO_REMOVE");

    if (!labelsToAdd.length && !labelsToRemove.length)
      throw new Error(
        "LABELS_TO_ADD, LABELS_TO_REMOVE atleast either one is required!"
      );

    [ labelsToAdd, labelsToRemove ] = removeCommonValues(labelsToAdd, labelsToRemove);
    
    if (labelsToAdd.length) console.log(`Labels To Add => ${labelsToAdd}`);
    if (labelsToRemove.length)
      console.log(`Labels To Remove => ${labelsToRemove}`);

    if (!labelsToAdd.length && !labelsToRemove.length) return;

    const octokit = github.getOctokit(core.getInput("GITHUB_TOKEN"));
    const owner = github.context.payload.repository.owner.login;
    const repo = github.context.payload.pull_request.base.repo.name;
    const pullRequestNumber = github.context.payload.pull_request.number;

    const parameters = {
      owner,
      repo,
      issue_number: pullRequestNumber,
    };

    let response;
    if (
      (labelsToAdd.length && !labelsToRemove.length) ||
      (labelsToRemove.length === 1 && !labelsToAdd.length)
    ) {
      if (labelsToAdd.length)
        response = await octokit.rest.issues.addLabels({
          ...parameters,
          labels: labelsToAdd,
        });
      else
        response = await octokit.rest.issues.removeLabel({
          ...parameters,
          name: labelsToRemove,
        });
    } else {
      const listAllLabelsResponse = await octokit.rest.issues.listLabelsOnIssue(
        {
          ...parameters,
        }
      );
      if (shouldUpdateLabelsInPR(listAllLabelsResponse.data, labelsToAdd, labelsToRemove)) {
        const updatedLabels = listAllLabelsResponse.data
          .map((label) => label.name)
          .filter((label) => !labelsToRemove.includes(label))
          .concat(labelsToAdd);
        response = await octokit.rest.issues.setLabels({
          ...parameters,
          labels: updatedLabels,
        });
      }
    }
    if (response) core.info(`Response => ${JSON.stringify(response)}`);
  } catch (e) {
    core.setFailed(e.message);
  }
}

function getInput(name) {
  return [
    ...new Set(
      core
        .getInput(name)
        .split(",")
        .filter((value) => value)
    ),
  ];
}

function removeCommonValues(labelsToAdd, labelsToRemove) {
  console.log(labelsToAdd.filter(label => !labelsToRemove.includes(label)));
  console.log(labelsToRemove.filter(label => !labelsToAdd.includes(label)));
  return [
    labelsToAdd.filter(label => !labelsToRemove.includes(label)),
    labelsToRemove.filter(label => !labelsToAdd.includes(label)),
  ];
}

function shouldUpdateLabelsInPR(existingLabels, labelsToAdd, labelsToRemove) {
  if (!existingLabels.length && labelsToAdd.length) return true;
  if (!existingLabels.length && labelsToRemove.length) return false;
  if (!existingLabels.length && !labelsToAdd.length && labelsToRemove.length)
    return false;
  if (existingLabels.length && labelsToAdd.length)
    return !labelsToAdd.every((label) => existingLabels.includes(label));
  if (existingLabels.length && labelsToRemove.length)
    return labelsToRemove.some((label) => existingLabels.includes(label));
}

updateLabelInPR();
