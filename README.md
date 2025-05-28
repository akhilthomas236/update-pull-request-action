# PR Comment Action

A GitHub Action that adds a comment to a Pull Request that triggered the workflow.

## Features

- Adds a comment to the pull request that triggered the workflow
- Option to include timestamp in the comment
- Uses a reliable composite action approach with bash scripting
- Can be used in any workflow triggered by a pull request event

## Usage

Add this action to your workflow file:

```yaml
name: PR Comment Workflow
on:
  pull_request:
    types: [opened, synchronize]

# Explicitly define permissions needed for the GitHub token
permissions:
  pull-requests: write
  contents: read

jobs:
  add-comment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Add comment to PR
        id: add-comment
        uses: akhilthomas236/update-pull-request-action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          comment-message: 'Thank you for submitting this PR!'
          include-timestamp: true
          
      - name: Show comment info
        run: |
          echo "Comment URL: ${{ steps.add-comment.outputs.comment-url }}"
          echo "Comment ID: ${{ steps.add-comment.outputs.comment-id }}"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github-token` | GitHub token for API access | Yes | N/A |
| `comment-message` | The message to add as a comment to the PR | Yes | N/A |
| `include-timestamp` | Whether to include a timestamp in the comment | No | true |

## Outputs

| Output | Description |
|--------|-------------|
| `comment-url` | The URL of the created comment |
| `comment-id` | The ID of the created comment |
| `include-timestamp` | Whether to include a timestamp in the comment | No | true |

## Example Workflows

### Basic Usage

```yaml
name: PR Feedback
on:
  pull_request:
    types: [opened]

jobs:
  add-welcome-comment:
    runs-on: ubuntu-latest
    steps:
      - name: Add welcome comment
        uses: your-username/pr-comment-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          comment-message: 'Thanks for your contribution! Your PR is being reviewed.'
```

### With Custom Comment Based on PR Content

```yaml
name: PR Size Feedback
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  comment-on-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - name: Count changes
        id: changes
        run: |
          CHANGED_FILES=$(git diff --name-only origin/${{ github.base_ref }}..HEAD | wc -l)
          echo "changed_files=$CHANGED_FILES" >> $GITHUB_OUTPUT
      
      - name: Comment on PR size
        uses: your-username/pr-comment-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          comment-message: |
            This PR changes ${{ steps.changes.outputs.changed_files }} files.
            ${{ steps.changes.outputs.changed_files >= 20 && 'Consider breaking this into smaller PRs.' || 'Good PR size!' }}
```

## License

MIT
