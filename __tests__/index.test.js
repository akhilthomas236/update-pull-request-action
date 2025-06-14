jest.mock('@actions/core');
jest.mock('@actions/github');

const core = require('@actions/core');
const github = require('@actions/github');

// Mock implementation
const mockOctokit = {
  rest: {
    issues: {
      createComment: jest.fn().mockResolvedValue({
        data: {
          id: 123456,
          html_url: 'https://github.com/owner/repo/pull/1#issuecomment-123456'
        }
      })
    }
  }
};

// Mock the GitHub context
github.context = {
  payload: {
    pull_request: {
      number: 1
    }
  },
  repo: {
    owner: 'owner',
    repo: 'repo'
  }
};

github.getOctokit.mockReturnValue(mockOctokit);

// Mock the core.getInput function
core.getInput = jest.fn().mockImplementation((name) => {
  switch (name) {
    case 'github-token':
      return 'fake-token';
    case 'comment-message':
      return 'Test comment message';
    case 'include-timestamp':
      return 'true';
    default:
      return '';
  }
});

describe('PR Comment Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should add a comment to the PR', async () => {
    // Load and execute the index.js file
    require('../src/index');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Check if the token was used correctly
    expect(github.getOctokit).toHaveBeenCalledWith('fake-token');
    
    // Check if the createComment function was called with the right parameters
    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 1,
      body: expect.stringMatching(/^Test comment message\n\n_Timestamp:/)
    });
    
    // Check if core.setOutput was called with the right values
    expect(core.setOutput).toHaveBeenCalledWith('comment-url', 'https://github.com/owner/repo/pull/1#issuecomment-123456');
    expect(core.setOutput).toHaveBeenCalledWith('comment-id', '123456');
  });
});
