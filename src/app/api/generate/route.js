import { NextResponse } from 'next/server';
import { getRepoContents } from '@/app/lib/github.js';
import { generateReadmeWithLLM } from '@/app/lib/llm.js';

export async function POST(request) {
  try {
    const { repoUrl } = await request.json();

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    // Validate GitHub URL
    if (!repoUrl.includes('github.com')) {
      return NextResponse.json({ error: 'Please provide a valid GitHub URL' }, { status: 400 });
    }

    console.log('Fetching repository contents for:', repoUrl);
    const { repoInfo, files } = await getRepoContents(repoUrl);
    
    console.log(`Found ${files.length} files, generating README...`);
    const readme = await generateReadmeWithLLM(repoInfo, files);

    return NextResponse.json({ 
      readme,
      repoName: repoInfo.name 
    });

  } catch (error) {
    console.error('Error generating README:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate README' }, 
      { status: 500 }
    );
  }
}