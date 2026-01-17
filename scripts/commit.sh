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

# -------------------------------------------------
# tmpl  –  expand a template using environment variables
# Usage:  tmpl "<template>"
# Example call:
#   step=4 substep=1 tmpl "$GIT_MSG_TEMPLATE"
# -------------------------------------------------
. "${SCRIPT_DIR}/tmpl.sh"

echo -e "${GREEN}📝 Calendar Alarm Clock - Commit Script${NC}"
echo ""

# Check we're in the right directory
if \
  [ ! -f "custom_components/plugin_template/manifest.json" ] \
  [ ! -f "frontend{,_vue,_plain}/{package.json,src/main.ts}" ] \
  [ ! -f "frontend{,_vue,_plain}/package.json" ] \
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
    # Find the last "ai: running..." commit and extract the step number
    # macOS-compatible: use sed instead of grep -P
    LAST_STEP=$(git log --oneline | grep "ai: running\.\.\. (" | head -1 | sed 's/.*ai: running\.\.\. (\([0-9]*\).*/\1/')

    if [ -z "$LAST_STEP" ]; then
        NEW_STEP=1
    else
        NEW_STEP=$((LAST_STEP + 1))
    fi

    echo -e "${GREEN}Committing remaining changes as step ${NEW_STEP}...${NC}"
    git add -u
    git add .  # Also add new files that aren't ignored
    # shellcheck disable=SC2034

    git commit -m "$(step="$NEW_STEP" substep="1" tmpl "${COMMIT_MSG_STEP}")"
    echo "  Done"
else
    echo -e "${YELLOW}No other changes to commit${NC}"
fi

echo ""
echo -e "${GREEN}✅ Commits complete!${NC}"

