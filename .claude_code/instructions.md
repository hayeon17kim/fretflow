# FretFlow Project Guidelines

## GitHub Issue Creation

**When to create issues:**
- When discovering bugs, refactoring opportunities, or new tasks during conversations
- ALWAYS ask the user first: "Should I create a GitHub issue for this?" before creating issues
- Wait for user confirmation before running `gh issue create`

When creating GitHub issues for this project:

**Language & Format:**
- Write all issue titles and descriptions in English
- Do not use emojis in titles or labels
- Use clear, professional language

**Labels:**
- Use existing repository labels when possible
- Priority labels: `priority: high`, `priority: medium`, `priority: low`
- Type labels: `enhancement`, `bug`, `documentation`, etc.
- Add `good first issue` for beginner-friendly tasks

**Assignment:**
- Always assign issues to @hayeon17kim by default
- Use `--add-assignee hayeon17kim` when creating issues

**Structure:**
Issues should include:
1. **Problem statement** - What needs to be fixed/improved
2. **Current code examples** - Show the problematic code with file paths and line numbers
3. **Proposed solution** - Specific implementation approach with code examples
4. **Tasks/Checklist** - Break down the work into actionable items
5. **Expected impact** - Benefits of the change

**Example command:**
```bash
gh issue create \
  --title "Refactor: Extract shared logic into custom hook" \
  --add-label "enhancement,priority: high" \
  --add-assignee hayeon17kim \
  --body "..."
```

## Code Style

- Use TypeScript strict mode
- Prefer functional components and hooks
- Keep components under 300 lines
- Extract reusable logic into custom hooks
- Write comments in English

## Internationalization

- All user-facing strings must use i18n (`useTranslation` hook)
- Do not hardcode Korean or any language strings
- Translation keys should be descriptive and nested (e.g., `home.title`, `quiz.correct`)
