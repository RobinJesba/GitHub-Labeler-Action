# GitHub Labeler Action

This GitHub Action allows you to automate the process of assigning labels to pull requests and issues in your repository.

## Supported Actions

- Assigning labels to **Pull Requests** is currently supported.

  _Note: We are actively working on extending support to **Issues** in future releases._

## Usage

### Workflow Configuration

To use this action in your workflow, you can add a step like this:

```yaml
- name: Assign Labels
  uses: RobinJesba/GitHub-Labeler-Action@v0.1.0
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    LABELS_TO_ADD: enhancement
    LABELS_TO_REMOVE: bug,invalid
```
## Inputs
- `GITHUB_TOKEN` (required): A GitHub token to authenticate and authorize API requests to modify labels.

- `LABELS_TO_ADD` (optional): A comma-separated list of labels to add to the pull request.

- `LABELS_TO_REMOVE` (optional): A comma-separated list of labels to remove from the pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or encounter issues, please [open an issue](https://github.com/RobinJesba/GitHub-Labeler-Action/issues).
