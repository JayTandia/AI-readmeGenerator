'use client';
import { useState } from 'react';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    
    try {
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
    } catch (err) {
      setError(err.message);
      console.error('Generation error:', err);
    }
    
    setLoading(false);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AutoReadmeGen
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            AI-powered README generator for GitHub repositories
          </p>
          <p className="text-gray-500">
            Just paste your GitHub repo URL and get a professional README in seconds
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
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

            <button
              onClick={handleGenerate}
              disabled={loading || !repoUrl.trim()}
              className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                '🚀 Generate README'
              )}
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="text-lg font-medium text-gray-700">Analyzing your repository...</div>
                <div className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</div>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="bg-blue-500 h-2 w-2 rounded-full animate-bounce"></div>
                <div className="bg-blue-500 h-2 w-2 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="bg-blue-500 h-2 w-2 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        {readme && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
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
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{readme}</pre>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>✨ Powered by AI • Built with Next.js • GitHub API</p>
        </div>
      </div>
    </div>
  );
}