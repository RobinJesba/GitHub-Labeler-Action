const core = require("@actions/core");
const github = require("@actions/github");

async function updateLabelInPR() {
  try {
    const eventName = github.context.eventName;
    if (eventName !== "pull_request")
      throw new Error(
        `This action is intended to run only on pull_request events, not on ${eventName} events.`
      );

    const labelsToAdd = getInput("LABELS_TO_ADD");
    const labelsToRemove = getInput("LABELS_TO_REMOVE");

    if (!labelsToAdd.length && !labelsToRemove.length)
      throw new Error(
        "labelsToAdd, labelsToRemove atleast either one is required!"
      );

    console.log(`Labels To Add => ${labelsToAdd}`);
    console.log(`Labels To Remove => ${labelsToRemove}`);

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
      (labelsToAdd.length === 1 && !labelsToRemove.length) ||
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
      const updatedLabels = listAllLabelsResponse.data
        .map((label) => label.name)
        .filter((label) => !labelsToRemove.includes(label))
        .concat(labelsToAdd);
      response = await octokit.rest.issues.setLabels({
        ...parameters,
        labels: updatedLabels,
      });
    }
    core.info(`Response => ${JSON.stringify(response)}`);
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

updateLabelInPR();
