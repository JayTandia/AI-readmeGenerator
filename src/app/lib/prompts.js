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
- **Technology stack** with version information (NO badges)

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

## FORMATTING REQUIREMENTS:
- Use proper markdown syntax throughout
- Include relevant emojis for visual appeal
- Use code blocks with appropriate language tags
- Create clear section hierarchies with proper headings
- Use tables for structured information
- Make it scannable with clear headings and bullet points

## CRITICAL EXCLUSIONS - DO NOT INCLUDE:
- **NO badges of any kind** (no GitHub stars, forks, license, language, framework badges)
- **NO trust signals section** (no build status, code coverage, dependencies status, security badges)
- **NO metadata sections** (no version badges, release badges, CI/CD badges)
- **NO external badge links** (no shields.io, libraries.io, or other badge services)
- **NO social proof elements** (no star counts, fork counts, contributor counts)
- **NO external service integrations** that aren't part of the core project

## ARCHITECTURE DIAGRAM REQUIREMENTS:
- Use Mermaid syntax for the architecture diagram
- Show the main components and their relationships
- Include data flow arrows
- Highlight the technology stack
- Make it clear and easy to understand
- Use appropriate shapes for different component types

Generate ONLY the README.md content in proper markdown format. Focus on the core project information, setup instructions, and usage guides. Do not include any badges, trust signals, or external metadata elements. Make it comprehensive, professional, and immediately useful for developers.`;
} 