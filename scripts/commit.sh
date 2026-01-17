#!/usr/bin/env bash
set -e

# Resolve the full path of the script, even if it was called via a symlink
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do   # resolve $SOURCE until the file is no longer a symlink
  DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  # If $SOURCE was a relative symlink, prepend the directory where the symlink resides
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done

# Directory containing the script
SCRIPT_DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"

echo "Script directory: ${SCRIPT_DIR}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

COMMIT_MSG_ERRORS="🐞 ai: updated errors"
COMMIT_MSG_QUERY="🤌 ai: updated query"
COMMIT_MSG_STEP="✨ ai: running... ({step}-{substep})"
COMMIT_MSG_FIX="🫥 own: {msg}"
COMMIT_MSG_OWN="👩‍💻 own: {msg}"
COMMIT_PREFIX_TEMPLATE="📄TEMPLATE | "

# -------------------------------------------------
# tmpl  –  expand a template using environment variables
# Usage:  tmpl "<template>"
# Example call:
#   step=4 substep=1 tmpl "$GIT_MSG_TEMPLATE"
# -------------------------------------------------
. "${SCRIPT_DIR}/tmpl.sh"

echo -e "${GREEN}📝 Plugin Template - Commit Script${NC}"
echo ""

# Check we're in the right directory
if \
  [ ! -f "custom_components/plugin_template/manifest.json" ] \
  && [ ! -f "frontend{,_vue,_plain}/src/main.ts" ] \
  && [ ! -f "frontend{,_vue,_plain}/package.json" ] \
; then
    echo -e "${RED}Error: Must be run from the repository root${NC}"
    exit 1
fi

# Save any currently staged changes
STASH_STAGED=false
STAGED_FILES=""
if [ -n "$(git diff --cached --name-only)" ]; then
    echo -e "${YELLOW}Saving staged changes...${NC}"
    # Store the list of staged files
    STAGED_FILES=$(git diff --cached --name-only)
    echo "  Files to restore later:"
    echo "$STAGED_FILES" | sed 's/^/    - /'

    # Unstage them (this does NOT delete anything, just moves from staging to working directory)
    git reset HEAD --quiet
    echo "  Unstaged files (they remain in your working directory)"
    STASH_STAGED=true
fi

# Commit ai/query.md if it has changes
if git diff --name-only | grep -q "^ai/query.md$"; then
    echo -e "${GREEN}Committing ai/query.md...${NC}"
    git add ai/query.md
    git commit -m "${COMMIT_MSG_QUERY}"
    echo "  Done"
elif [ -f "ai/query.md" ] && git ls-files --others --exclude-standard | grep -q "^ai/query.md$"; then
    echo -e "${GREEN}Committing ai/query.md (new file)...${NC}"
    git add ai/query.md
    git commit -m "${COMMIT_MSG_QUERY}"
    echo "  Done"
else
    echo -e "${YELLOW}No changes to ai/query.md${NC}"
fi

# Commit ai/errors.md if it has changes
if git diff --name-only | grep -q "^ai/errors.md$"; then
    echo -e "${GREEN}Committing ai/errors.md...${NC}"
    git add ai/errors.md
    git commit -m "${COMMIT_MSG_ERRORS}"
    echo "  Done"
elif [ -f "ai/errors.md" ] && git ls-files --others --exclude-standard | grep -q "^ai/errors.md$"; then
    echo -e "${GREEN}Committing ai/errors.md (new file)...${NC}"
    git add ai/errors.md
    git commit -m "${COMMIT_MSG_ERRORS}"
    echo "  Done"
else
    echo -e "${YELLOW}No changes to ai/errors.md${NC}"
fi

# Commit ai/plugin_template/query.md if it has changes
if git diff --name-only | grep -q "^ai/plugin_template/query.md$"; then
    echo -e "${GREEN}Committing ai/plugin_template/query.md...${NC}"
    git add ai/plugin_template/query.md
    git commit -m "${COMMIT_PREFIX_TEMPLATE}${COMMIT_MSG_QUERY}"
    echo "  Done"
elif [ -f "ai/plugin_template/query.md" ] && git ls-files --others --exclude-standard | grep -q "^ai/plugin_template/query.md$"; then
    echo -e "${GREEN}Committing ai/plugin_template/query.md (new file)...${NC}"
    git add ai/plugin_template/query.md
    git commit -m "${COMMIT_PREFIX_TEMPLATE}${COMMIT_MSG_QUERY}"
    echo "  Done"
# else
#     echo -e "${YELLOW}No changes to ai/plugin_template/query.md${NC}"
fi

# Commit ai/plugin_template/errors.md if it has changes
if git diff --name-only | grep -q "^ai/plugin_template/errors.md$"; then
    echo -e "${GREEN}Committing ai/plugin_template/errors.md...${NC}"
    git add ai/plugin_template/errors.md
    git commit -m "${COMMIT_PREFIX_TEMPLATE}${COMMIT_MSG_ERRORS}"
    echo "  Done"
elif [ -f "ai/plugin_template/errors.md" ] && git ls-files --others --exclude-standard | grep -q "^ai/plugin_template/errors.md$"; then
    echo -e "${GREEN}Committing ai/plugin_template/errors.md (new file)...${NC}"
    git add ai/plugin_template/errors.md
    git commit -m "${COMMIT_PREFIX_TEMPLATE}${COMMIT_MSG_ERRORS}"
    echo "  Done"
# else
#     echo -e "${YELLOW}No changes to ai/plugin_template/errors.md${NC}"
fi

# Restore staged changes before the final commit
if [ "$STASH_STAGED" = true ]; then
    echo -e "${YELLOW}Restoring staged changes...${NC}"
    # Re-stage the files that were originally staged
    # (They've been in the working directory this whole time, unchanged)
    RESTORED_COUNT=0
    echo "$STAGED_FILES" | while IFS= read -r file; do
        if [ -n "$file" ] && ([ -f "$file" ] || [ -d "$file" ]); then
            git add "$file"
            RESTORED_COUNT=$((RESTORED_COUNT + 1))
        fi
    done
    echo "  Re-staged files"
fi

# Check if there are any other changes to commit
if [ -n "$(git status --porcelain)" ]; then
    # Intelligently determine step and substep numbers from commit history
    # Look through recent commits to find the last relevant AI commit

    step=1
    substep=1
    found_running=false

    # Read commit messages one by one
    while IFS= read -r commit_msg; do
        # Check for "ai: running... (X-Y)" pattern
        if echo "$commit_msg" | grep -q "ai: running\.\.\. ([0-9]*-[0-9]*)"; then
            # Extract step and substep
            last_step=$(echo "$commit_msg" | sed 's/.*ai: running\.\.\. (\([0-9]*\)-.*/\1/')
            last_substep=$(echo "$commit_msg" | sed 's/.*ai: running\.\.\. ([0-9]*-\([0-9]*\)).*/\1/')

            if [ -n "$last_step" ] && [ -n "$last_substep" ]; then
                # Found a running commit - increment substep
                step=$last_step
                substep=$((last_substep + 1))
                found_running=true
                break
            fi
        fi

        # Check for "ai: updated query" or "ai: updated errors" (with or without emoji/prefix)
        if echo "$commit_msg" | grep -qE "(ai: updated query|ai: updated errors)"; then
            # Found a query/errors update - this means we should increment step and reset substep
            # But first, check if there was a running commit before this
            if [ "$found_running" = true ]; then
                # We already found a running commit, so use that
                break
            else
                # Extract the step from the most recent running commit before this query/errors update
                # Continue looking...
                continue
            fi
        fi
    done < <(git log --format=%s -20)  # Look at last 20 commits

    # If we found a query/errors update before any running commit, increment step
    if [ "$found_running" = false ]; then
        # Look for the last running commit to get the base step number
        last_running=$(git log --format=%s | grep "ai: running\.\.\. ([0-9]*-[0-9]*)" | head -1)
        if [ -n "$last_running" ]; then
            last_step=$(echo "$last_running" | sed 's/.*ai: running\.\.\. (\([0-9]*\)-.*/\1/')
            if [ -n "$last_step" ]; then
                step=$((last_step + 1))
            fi
        fi
        substep=1
    fi

    echo -e "${GREEN}Committing remaining changes as step ${step}-${substep}...${NC}"
    git add -u
    git add .  # Also add new files that aren't ignored
    # shellcheck disable=SC2034

    git commit -m "$(step="$step" substep="$substep" tmpl "${COMMIT_MSG_STEP}")"
    echo "  Done"
else
    echo -e "${YELLOW}No other changes to commit${NC}"
fi

echo ""
echo -e "${GREEN}✅ Commits complete!${NC}"

