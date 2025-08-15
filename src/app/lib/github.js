import { Octokit } from '@octokit/rest';

export async function getRepoContents(repoUrl) {
  const [owner, repo] = parseGitHubUrl(repoUrl);
  
  // Debug logging to check token loading
  console.log('GitHub Token available:', !!process.env.GITHUB_TOKEN);
  console.log('GitHub Token length:', process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.length : 0);
  console.log('GitHub Token starts with:', process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.substring(0, 10) + '...' : 'undefined');
  
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    // Get repo info
    const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });

    // Get all files recursively
    const files = await getAllFiles(octokit, owner, repo);

    return { repoInfo, files };
  } catch (error) {
    if (error.status === 403 && error.message.includes('rate limit')) {
      throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes or use a GitHub token for higher limits.');
    } else if (error.status === 404) {
      throw new Error('Repository not found. Please check the URL and ensure the repository is public.');
    } else if (error.status === 401) {
      throw new Error('GitHub authentication failed. Please check your GitHub token.');
    } else {
      throw new Error(`GitHub API error: ${error.message}`);
    }
  }
}

async function getAllFiles(octokit, owner, repo, path = '') {
  const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
  const files = [];

  for (const item of Array.isArray(data) ? data : [data]) {
    if (item.type === 'file' && item.size < 100000) { // Skip large files
      try {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner, repo, path: item.path
        });
        
        if (fileData.content) {
          files.push({
            path: item.path,
            content: Buffer.from(fileData.content, 'base64').toString('utf-8'),
            size: item.size
          });
        }
      } catch (error) {
        // Skip files that can't be read
        console.log(`Skipping file: ${item.path}`);
      }
    } else if (item.type === 'dir' && 
               !item.path.includes('node_modules') && 
               !item.path.includes('.git') &&
               !item.path.includes('dist') &&
               !item.path.includes('build')) {
      // Recursively get directory contents
      const subFiles = await getAllFiles(octokit, owner, repo, item.path);
      files.push(...subFiles);
    }
  }

  return files;
}

function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  return [match[1], match[2].replace('.git', '')];
}