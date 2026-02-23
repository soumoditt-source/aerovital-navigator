# Contributing to AeroVital Navigator

Welcome, and thank you for your interest in contributing to the AeroVital Navigator! We appreciate all community contributions that help advance atmospheric health protection.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Pull Request Process](#pull-request-process)
5. [Reporting Bugs](#reporting-bugs)
6. [Feature Requests](#feature-requests)

## Code of Conduct

Please review our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating in this community. We are committed to a welcoming and inclusive environment.

## Getting Started

1. **Fork the Repository**: Start by forking the `soumoditt-source/aerovital-navigator` repository.
2. **Clone Locally**: Clone your fork to your local machine.
   ```bash
   git clone https://github.com/YOUR_USERNAME/aerovital-navigator.git
   cd aerovital-navigator
   ```
3. **Install Dependencies**: We use `npm` for dependency management.
   ```bash
   npm install
   ```
4. **Environment Variables**: Copy `.env.example` to `.env.local` and configure the necessary API keys (Gemini, Groq, Pathway, etc.).

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/your-bugfix-name
   ```
2. Make your changes in the `src/` directory.
3. Ensure your code follows the existing style and architectural patterns (Next.js App Router, Tailwind CSS, Zustand).
4. Run the linter and test the build locally before committing:
   ```bash
   npm run lint
   npm run build
   ```

## Pull Request Process

1. Provide a clear and descriptive PR title.
2. Update the `README.md` with details of changes to the interface, new environment variables, or other structural modifications.
3. Ensure your code passes all CI/CD checks.
4. Obtain approval from at least one core maintainer before merging.

## Reporting Bugs

Please use the GitHub Issue Tracker to report bugs. Include:
- A clear descriptive title.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Environment details (Browser, OS, Node version).

## Feature Requests

We welcome feature requests! Please open an issue outlining:
- The problem you are trying to solve.
- Your proposed solution.
- The potential impact on the overall architecture.

Thank you for making AeroVital Navigator better!
