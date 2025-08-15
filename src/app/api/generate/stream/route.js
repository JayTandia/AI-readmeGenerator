import { NextResponse } from 'next/server';
import { getRepoContents } from '@/app/lib/github.js';
import { generateReadmeWithLLM } from '@/app/lib/llm.js';

// Simple in-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // Lower limit for streaming

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
  rateLimitMap.set(ip, requests);
  
  if (requests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  requests.push(now);
  return true;
}

function validateGitHubUrl(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') {
      return false;
    }
    
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      return false;
    }
    
    const ownerRepoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
    const ownerRepo = pathParts.slice(0, 2).join('/');
    
    return ownerRepoPattern.test(ownerRepo);
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }
    
    const body = await request.json();
    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== 'string') {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    if (!validateGitHubUrl(repoUrl)) {
      return NextResponse.json({ error: 'Please provide a valid GitHub URL' }, { status: 400 });
    }

    // Create a readable stream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(`data: ${JSON.stringify({ status: 'analyzing', message: 'Analyzing repository...' })}\n\n`);
          
          console.log('Fetching repository contents for:', repoUrl);
          const { repoInfo, files } = await getRepoContents(repoUrl);
          
          controller.enqueue(`data: ${JSON.stringify({ status: 'processing', message: `Found ${files.length} files, generating README...` })}\n\n`);
          
          console.log(`Found ${files.length} files, generating README...`);
          
          // Use the existing generateReadmeWithLLM function
          const readme = await generateReadmeWithLLM(repoInfo, files);
          
          if (!readme || readme.trim() === '') {
            throw new Error('Generated README is empty');
          }
          
          // Send the complete README
          controller.enqueue(`data: ${JSON.stringify({ 
            status: 'complete', 
            readme,
            repoName: repoInfo.name 
          })}\n\n`);
          
                 } catch (error) {
           console.error('Error generating README:', error);
           let errorMessage = 'Failed to generate README';
           
           // Handle specific GitHub API errors
           if (error.message.includes('rate limit')) {
             errorMessage = 'GitHub API rate limit exceeded. Please try again in a few minutes or use a GitHub token for higher limits.';
           } else if (error.message.includes('not found')) {
             errorMessage = 'Repository not found. Please check the URL and ensure the repository is public.';
           } else if (error.message.includes('authentication failed')) {
             errorMessage = 'GitHub authentication failed. Please check your GitHub token.';
           } else if (error.message) {
             errorMessage = error.message;
           }
           
           controller.enqueue(`data: ${JSON.stringify({ 
             status: 'error', 
             error: errorMessage
           })}\n\n`);
         } finally {
           controller.close();
         }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error in streaming endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}
