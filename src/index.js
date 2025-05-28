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
    if (!context.payload.pull_request) {
      throw new Error('This action only works on pull request events');
    }
    
    // Format comment
    let comment = commentMessage;
    if (includeTimestamp) {
      const date = new Date().toISOString();
      comment += `\n\n_Timestamp: ${date}_`;
    }
    
    // Add comment to PR
    const prNumber = context.payload.pull_request.number;
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
