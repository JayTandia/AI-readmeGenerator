import { GoogleGenerativeAI } from '@google/generative-ai';
import { createReadmePrompt } from './prompts.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function generateReadmeWithLLM(repoInfo, files) {
  const repoContext = prepareRepoContext(repoInfo, files);
  
  const prompt = createReadmePrompt(repoContext);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Pass only the prompt string as required by Gemini
  const result = await model.generateContent([prompt]);
  const response = await result.response;
  return response.text() || "Error generating README";
}

function prepareRepoContext(repoInfo, files) {
  let context = `
Repository: ${repoInfo.name}
Description: ${repoInfo.description || 'No description provided'}
Language: ${repoInfo.language}
Stars: ${repoInfo.stargazers_count}
Forks: ${repoInfo.forks_count}
Homepage: ${repoInfo.homepage || 'None'}
Topics: ${repoInfo.topics?.join(', ') || 'None'}
License: ${repoInfo.license?.name || 'Not specified'}

File Structure and Key Contents:
`;

  // Add important files first
  const importantFiles = files.filter(f => 
    f.path.match(/^(package\.json|requirements\.txt|Dockerfile|docker-compose\.yml|\.env\.example|config\.|setup\.py|Cargo\.toml|go\.mod)$/i) ||
    f.path.match(/\.(md|txt)$/i) ||
    f.path.includes('main.') ||
    f.path.includes('index.') ||
    f.path.includes('app.')
  ).slice(0, 10);

  importantFiles.forEach(file => {
    context += `\n--- ${file.path} ---\n`;
    context += file.content.slice(0, 2000);
    context += file.content.length > 2000 ? '\n... (truncated)' : '';
  });

  // Add directory structure
  context += '\n\nDirectory Structure:\n';
  const dirs = [...new Set(files.map(f => f.path.split('/')[0]))].slice(0, 20);
  dirs.forEach(dir => {
    context += `- ${dir}\n`;
  });

  return context;
}