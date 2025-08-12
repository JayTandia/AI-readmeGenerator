export function createReadmePrompt(repoContext) {
  return `You are an expert technical writer and software architect. Generate a comprehensive, professional README.md file for this GitHub repository that follows industry best practices.

Repository Information:
${repoContext}

## REQUIREMENTS - Generate a README that includes:

### 1. PROJECT OVERVIEW & ARCHITECTURE
- **Compelling title** that clearly describes the project
- **Detailed description** explaining what the project does, why it exists, and who it's for
- **High-level architecture diagram** using Mermaid code blocks showing:
  - System components and their relationships
  - Data flow between components
  - Technology stack visualization
  - Key architectural decisions
- **Key features** with bullet points highlighting main capabilities
- **Technology stack** with version information and badges

### 2. GETTING STARTED
- **Prerequisites** - what needs to be installed first
- **Installation** - step-by-step installation instructions
- **Configuration** - how to set up environment variables, config files
- **Quick start** - minimal steps to get running
- **Usage examples** with code snippets showing:
  - Basic usage patterns
  - Common use cases
  - API examples (if applicable)
  - Command-line examples (if applicable)

### 3. DETAILED USAGE GUIDE
- **Core functionality** explanation with examples
- **Configuration options** and their meanings
- **API documentation** (if it's an API project)
- **CLI commands** (if it's a CLI tool)
- **Integration examples** with other tools/services
- **Troubleshooting** section for common issues

### 4. DEVELOPMENT & CONTRIBUTION
- **Development setup** - how to set up the development environment
- **Testing** - how to run tests and write new ones
- **Code style** and linting guidelines
- **Git workflow** and branching strategy
- **Pull request process** with detailed steps
- **Issue reporting** guidelines
- **Code of conduct** reference

### 5. TRUST SIGNALS & METADATA
- **License** information with proper badge
- **Version** badge and release information
- **Build status** badges (CI/CD)
- **Code coverage** badge
- **Dependencies** status badges
- **Security** badges and policies
- **Credits** and acknowledgments
- **Changelog** or release notes link

### 6. ADDITIONAL SECTIONS
- **Performance** considerations and benchmarks
- **Security** considerations and best practices
- **Deployment** instructions for different environments
- **Monitoring** and logging setup
- **FAQ** section addressing common questions
- **Roadmap** or future plans
- **Support** and community links

## FORMATTING REQUIREMENTS:
- Use proper markdown syntax throughout
- Include relevant emojis for visual appeal
- Use code blocks with appropriate language tags
- Create clear section hierarchies with proper headings
- Use tables for structured information
- Include badges at the top for immediate trust signals
- Make it scannable with clear headings and bullet points
- Ensure all links work and are properly formatted

## ARCHITECTURE DIAGRAM REQUIREMENTS:
- Use Mermaid syntax for the architecture diagram
- Show the main components and their relationships
- Include data flow arrows
- Highlight the technology stack
- Make it clear and easy to understand
- Use appropriate shapes for different component types

Generate ONLY the README.md content in proper markdown format. Do not include any explanations or comments outside the README content. Make it comprehensive, professional, and immediately useful for developers.`;
} 