const core = require("@actions/core");
const github = require("@actions/github");

async function updateLabelInPR() {
  try {
    const eventName = github.context.eventName;
    if (eventName !== "pull_request")
      throw new Error(
        `This action is intended to run only on pull_request events, not on ${eventName} events.`
      );

      console.log(core.getInput("LABELS_TO_ADD"));
      console.log(core.getInput("LABELS_TO_REMOVE"));
    const labelsToAdd = core.getInput("LABELS_TO_ADD").split(',');
    const labelsToRemove = core.getInput("LABELS_TO_REMOVE").split(',');
    // const labelsToAdd = [...new Set(core.getInput("LABELS_TO_ADD").split(","))];
    // const labelsToRemove = [
    //   ...new Set(core.getInput("LABELS_TO_REMOVE").split(",")),
    // ];
    console.log(labelsToAdd);
    console.log(labelsToRemove);
    if (!labelsToAdd.length && !labelsToRemove.length)
      throw new Error(
        "labelsToAdd, labelsToRemove atleast either one is required!"
      );

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
    if (labelsToAdd.length === 1 || labelsToRemove.length === 1) {
      if (labelsToAdd.length)
        response = await octokit.rest.issues.addLabels({
          ...parameters,
          name: labelsToAdd[0],
        });
      else
        response = await octokit.rest.issues.removeLabels({
          ...parameters,
          name: labelsToRemove[0],
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
    core.info(response);
  } catch (e) {
    core.setFailed(e.message);
  }
}

updateLabelInPR();
