'use client';
import { useState } from 'react';
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { RetroGrid } from "@/components/magicui/retro-grid";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [streamingStatus, setStreamingStatus] = useState('');

  const isValidGitHubUrl = (url) => {
    return url.includes('github.com') && url.includes('/');
  };

  const handleGenerate = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }
    
    if (!isValidGitHubUrl(repoUrl)) {
      setError('Please enter a valid GitHub URL (e.g., https://github.com/user/repo)');
      return;
    }
    
    setLoading(true);
    setError('');
    setStreamingStatus('');
    
    try {
      try {
        await handleStreamingGeneration();
      } catch (streamError) {
        console.warn('Streaming failed, falling back to regular generation:', streamError);
        setStreamingStatus('⚠️ Streaming failed, using standard mode...');
        await handleRegularGeneration();
      }
    } catch (err) {
      setError(err.message);
      console.error('Generation error:', err);
    }
    
    setLoading(false);
  };

  const handleRegularGeneration = async () => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl: repoUrl.trim() })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }

    setReadme(data.readme);
  };

  const handleStreamingGeneration = async () => {
    try {
      const response = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start streaming');
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                if (jsonStr.trim()) {
                  const data = JSON.parse(jsonStr);
                  
                  switch (data.status) {
                    case 'analyzing':
                      setStreamingStatus('🔍 Analyzing repository...');
                      break;
                    case 'processing':
                      setStreamingStatus(`⚡ ${data.message}`);
                      break;
                    case 'complete':
                      if (data.readme) {
                        setReadme(data.readme);
                        setStreamingStatus('✅ README generated successfully!');
                      } else {
                        throw new Error('No README content received');
                      }
                      break;
                                       case 'error':
                     const errorMsg = data.error || 'Unknown error occurred';
                     if (errorMsg.includes('rate limit')) {
                       setStreamingStatus('⚠️ GitHub rate limit exceeded. Please wait a few minutes or add a GitHub token.');
                       setError(errorMsg);
                     } else {
                       throw new Error(errorMsg);
                     }
                     break;
                  }
                }
              } catch (parseError) {
                console.error('Error parsing streaming data:', parseError);
                // Don't throw here, just log and continue
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming generation error:', error);
      throw new Error(`Streaming failed: ${error.message}`);
    }
  };

  const downloadReadme = () => {
    const blob = new Blob([readme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(readme);
      alert('README copied to clipboard! 📋');
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Copy failed. Please select and copy manually.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-hidden overflow-x-hidden">
    <RetroGrid />
      <div className="max-w-6xl mx-auto px-4 mt-30">
        <div className="text-center mb-12">
          <TypingAnimation className={'text-6xl font-bold text-gray-900 mb-4'}>AI Readme Generator 🤖</TypingAnimation>
          <p className="text-xl text-gray-600 mb-2">
            AI-powered README generator for GitHub repositories
          </p>
          <p className="text-gray-500 text-sm">
            Just paste your GitHub repo URL and get a professional README in seconds
          </p>
        </div>

        <div className="bg-white rounded-lg left-1.5 -translate-x-1.5 shadow-md p-8 mb-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div>
              <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository URL
              </label>
              <input
                id="repo-url"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://github.com/username/repository"
                className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {streamingStatus && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700">{streamingStatus}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !repoUrl.trim()}
              className="w-full px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating README...
                </span>
              ) : (
                '🚀 Generate README (Streaming)'
              )}
            </button>
          </div>
        </div>

        {readme && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden z-10 relative mb-10">
            <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center max-h-72">
              <h2 className="text-xl font-semibold text-gray-800">📝 Generated README.md</h2>
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  📋 Copy
                </button>
                <button
                  onClick={downloadReadme}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{readme}</pre>
              </div>
            </div>
          </div>
        )}
        <div className="text-center absolute left-1/2 -translate-x-1/2 text-sm text-black-500 bottom-10">Made by <a href="https://github.com/JayTandia" className="underline">Jay Tandia</a></div>
      </div>
    </div>
  );
}