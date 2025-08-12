# Auto README Generator

A Next.js application that automatically generates professional README.md files for GitHub repositories using Google's Gemini AI.

## Features

- 🚀 Automatic README generation from GitHub repository analysis
- 🤖 Powered by Google Gemini AI for intelligent content creation
- 📝 Comprehensive README templates with proper structure
- 🔍 Analyzes repository structure, dependencies, and key files
- 🎨 Professional formatting with badges and proper markdown

## Prerequisites

- Node.js 18+ 
- Google AI API key (for Gemini)
- GitHub Personal Access Token (optional, for private repositories)

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd autoreadme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Google AI API Key for Gemini
   GOOGLE_API_KEY=your_google_api_key_here
   
   # GitHub Personal Access Token (optional, for private repos)
   GITHUB_TOKEN=your_github_token_here
   ```

   To get a Google AI API key:
   1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   2. Create a new API key
   3. Copy the key to your `.env.local` file

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter a GitHub repository URL in the input field
2. Click "Generate README"
3. The app will analyze the repository and generate a professional README
4. Copy the generated README content to your repository

## Tech Stack

- **Framework**: Next.js 15
- **AI**: Google Gemini 1.5 Flash
- **Styling**: Tailwind CSS
- **GitHub API**: Octokit

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google AI API key for Gemini | Yes |
| `GITHUB_TOKEN` | GitHub Personal Access Token | No (for private repos) |

## License

MIT
