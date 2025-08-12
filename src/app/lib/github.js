import { Octokit } from '@octokit/rest';

export async function getRepoContents(repoUrl) {
  const [owner, repo] = parseGitHubUrl(repoUrl);
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // Get repo info
  const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });

  // Get all files recursively
  const files = await getAllFiles(octokit, owner, repo);

  return { repoInfo, files };
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