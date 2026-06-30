# Agent guide

## Style and conventions
- Repo and file layout: docs/REPO_STYLE.md
- TypeScript code: docs/TYPESCRIPT_STYLE.md
- Python scripts: docs/PYTHON_STYLE.md
- Markdown: docs/MARKDOWN_STYLE.md
- Pytest: docs/PYTEST_STYLE.md
- Document every edit in docs/CHANGELOG.md.

## Runtime
- Run repo Python via `source source_me.sh && python3` (Python 3.12 only).
- Homebrew Python 3.12 modules: /opt/homebrew/lib/python3.12/site-packages/
- Front-door scripts: ./check_codebase.sh, ./build_github_pages.sh, ./run_web_server.sh

## Workflow
- Only humans run `git commit`; agents stage changes and update docs/CHANGELOG.md.
- Use `git mv` for renames and moves.
