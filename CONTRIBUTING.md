# Contributing to ghl-elements

Thank you for your interest in contributing to `@mdcline/ghl-elements`. This document outlines everything you need to know before contributing.

---

## Code of Conduct

All contributors are expected to engage respectfully and professionally. This means:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Accepting constructive criticism gracefully
- Focusing on what is best for the project and its users

Harassment, personal attacks, and disrespectful behavior of any kind will not be tolerated. Violations may result in removal from the project.

---

## Bug Reporting

Before opening a bug report, please check the [issue tracker](https://github.com/mdeancline/ghl-elements/issues) to see if the bug has already been reported.

When opening a new issue, include the following:

- A clear and descriptive title
- The version of `@mdcline/ghl-elements` you are using
- A minimal reproduction of the bug (ideally a code snippet or console output)
- The expected behavior and what actually happened
- The browser and GoHighLevel page type where the bug occurred

The more detail you provide, the faster the issue can be investigated.

---

## Feature Requests

Before writing any code for a new feature, open an issue on the [issue tracker](https://github.com/mdeancline/ghl-elements/issues) describing:

- The problem you are trying to solve
- The proposed solution or behavior
- Any alternatives you considered

This gives the maintainer a chance to weigh in before effort is spent on implementation. Pull requests for features that have not been discussed may be closed without review.

---

## Environment Setup

### Prerequisites

- Node.js 18+
- npm 11+
- A GoHighLevel page to test against

### Installation

```bash
git clone https://github.com/mdeancline/ghl-elements.git
cd ghl-elements
npm install
```

### Running the build

```bash
npm run build        # Full build (clean + JS + types)
npm run rebuild      # Rebuild without cleaning first
npm run lint         # Lint
npm run lint:fix     # Lint and auto-fix
```

### Project Structure

```
src/
  api/          # Public-facing abstract classes and interfaces
  internal/     # Concrete implementations (not part of public API)
    dom/        # DOM observation utilities
    stripe/     # Stripe Elements integration
    utils/      # Internal utilities
```

---

## Style Guides

### Code Style

- TypeScript is required for all source files
- Use class-based OOP patterns consistent with the existing codebase
- Keep method names concise and descriptive
- Avoid internal documentation comments inside method bodies
- Do not use em dashes in any written content

Linting is enforced via ESLint. Run `npm run lint` before submitting a pull request.

### Public API Rules

The public API lives in `src/api/`. Changes here directly affect consumers. Follow these rules:

- Never remove or rename public members without first marking them as `@deprecated` in a minor or patch release. The `@deprecated` tag must include either an alternative to use in its place or a clear explanation of why the member is being deprecated. Removal happens in a subsequent major version bump.
- Always mark new public members with `@public` in JSDoc
- Keep JSDoc comments up to date as they are the primary documentation for consumers
- Internal implementations in `src/internal/` are not part of the public API and can change freely between versions

### Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/). All commit messages must follow the format:

```
type: description
```

Common types:
- `feat` for new features
- `fix` for bug fixes
- `chore` for maintenance, tooling, and dependencies
- `refactor` for code changes that are not features or fixes
- `docs` for documentation only

The version bump on release is determined automatically from commit types. `fix` triggers a patch bump, `feat` triggers a minor bump, and a breaking change triggers a major bump.

---

## Submission Process

### Forking and Branching

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a branch from `dev` for your changes

```bash
git checkout dev
git pull origin dev
git checkout -b your-branch-name
```

Use a descriptive branch name that reflects the change, such as `fix/order-bump-selection` or `feat/coupon-clear-event`.

### Making Changes

- Keep changes focused and scoped to a single concern per pull request
- Follow the style guide above
- Test your changes against a live GoHighLevel page before submitting

### Opening a Pull Request

1. Push your branch to your fork
2. Open a pull request against the `dev` branch of the main repository, not `main`
3. Include a clear description of what was changed and why
4. Reference any related issues using `Closes #issue-number` if applicable

Pull requests that do not target `dev`, lack a description, or introduce breaking changes without prior discussion may be closed without review.

---

## License

By contributing, you agree that your contributions will be licensed under the [Apache 2.0 License](LICENSE).
