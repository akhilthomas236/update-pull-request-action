const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    // Get inputs from workflow
    const githubToken = core.getInput('github-token', { required: true });
    const commentMessage = core.getInput('comment-message', { required: true });
    const includeTimestamp = core.getInput('include-timestamp') === 'true';
    
    // Initialize octokit
    const octokit = github.getOctokit(githubToken);
    
    // Get context
    const context = github.context;
    
    // Debug event context
    core.info(`Event name: ${context.eventName}`);
    core.info(`Event action: ${context.payload.action}`);
    
    // Handle both pull_request events and issue_comment events on PRs
    let prNumber;
    if (context.payload.pull_request) {
      prNumber = context.payload.pull_request.number;
      core.info(`PR number found in pull_request payload: ${prNumber}`);
    } else if (context.payload.issue && context.payload.issue.pull_request) {
      prNumber = context.payload.issue.number;
      core.info(`PR number found in issue payload: ${prNumber}`);
    } else {
      throw new Error('This action only works on pull request or issue_comment events on PRs');
    }
    
    // Format comment
    let comment = commentMessage;
    if (includeTimestamp) {
      const date = new Date().toISOString();
      comment += `\n\n_Timestamp: ${date}_`;
    }
    
    // Add comment to PR
    const { owner, repo } = context.repo;
    
    const response = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: comment
    });
    
    core.info(`Comment added to PR #${prNumber}`);
    core.setOutput('comment-url', response.data.html_url);
    core.setOutput('comment-id', response.data.id.toString());
    
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
