#!/usr/bin/env bash
# ============================================================================
# Fix AI Commit Messages
# ============================================================================
#
# This script rebases the last batch of AI commits to:
#   1. Replace X with the actual total count in template format
#   2. Allow editing default "running…" messages to meaningful descriptions
#
# Supports both formats:
#   - Template: 📄TEMPLATE | ✨ ai: [013] running… (2/X)
#   - Regular: ✨ ai: running… (2-3)
#
# Usage:
#   ./scripts/fix-commits.sh
#   make fix-commits
#
# ============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

print_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_header "Fix AI Commit Messages"

# Get the repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository!"
    exit 1
fi

# Check if HEAD is detached
if ! git symbolic-ref -q HEAD > /dev/null; then
    print_error "HEAD is in a detached state!"
    print_info "Please checkout a branch first: git checkout <branch>"
    exit 1
fi

# Check for ongoing git operations
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
    print_error "A rebase is already in progress!"
    print_info "Continue with: git rebase --continue"
    print_info "Or abort with: git rebase --abort"
    exit 1
fi

if [ -f ".git/MERGE_HEAD" ]; then
    print_error "A merge is in progress!"
    print_info "Complete the merge first or abort with: git merge --abort"
    exit 1
fi

if [ -f ".git/CHERRY_PICK_HEAD" ]; then
    print_error "A cherry-pick is in progress!"
    print_info "Complete it or abort with: git cherry-pick --abort"
    exit 1
fi

if [ -f ".git/REVERT_HEAD" ]; then
    print_error "A revert is in progress!"
    print_info "Complete it or abort with: git revert --abort"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_error "You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Detect if this is a template repository
REPO_DIR=$(basename "$PWD")
IS_TEMPLATE_REPO=false
if echo "$REPO_DIR" | grep -qE "^hoass_(plugin[-_])?template"; then
    IS_TEMPLATE_REPO=true
    print_info "Template repository detected"
fi

# Find the last batch of AI commits
print_info "Scanning for AI commit batches..."

if [ "$IS_TEMPLATE_REPO" = true ]; then
    # Template format: look for commits with same step number
    # Get the most recent AI commit
    LAST_AI=$(git log --format=%s -1 --grep="ai: \[[0-9]\{3\}\]")

    if [ -z "$LAST_AI" ]; then
        print_error "No AI commits found in template format"
        exit 1
    fi

    # Extract the step number
    STEP=$(echo "$LAST_AI" | sed 's/.*ai: \[\([0-9]*\)\].*/\1/' | sed 's/^0*//')
    PADDED_STEP=$(printf "%03d" "$STEP")

    print_info "Found AI commits for step [$PADDED_STEP]"

    # Count commits in this batch
    COMMIT_COUNT=$(git log --format=%s --grep="ai: \[$PADDED_STEP\]" | wc -l | tr -d ' ')

    if [ "$COMMIT_COUNT" -eq 0 ]; then
        print_error "No commits found for step [$PADDED_STEP]"
        exit 1
    fi

    print_success "Found $COMMIT_COUNT commit(s) in this batch"

    # Show the commits
    echo ""
    echo "Commits to fix:"
    git log --oneline --grep="ai: \[$PADDED_STEP\]" --reverse
    echo ""

    # Check if this batch was preceded by a query/error update
    FIRST_COMMIT=$(git log --format=%H --grep="ai: \[$PADDED_STEP\]" --reverse | head -1)
    PARENT_COMMIT=$(git rev-parse "$FIRST_COMMIT^")
    PARENT_MSG=$(git log --format=%s -1 "$PARENT_COMMIT")

    QUERY_ERROR_COMMIT=""
    if echo "$PARENT_MSG" | grep -qE "(ai: updated query|ai: updated errors)"; then
        QUERY_ERROR_COMMIT="$PARENT_COMMIT"
        print_info "This batch was preceded by: $PARENT_MSG"
        echo ""
        print_info "Changes in that commit:"
        echo ""

        # Disable pager unless USE_PAGER is set
        if [ -z "$USE_PAGER" ]; then
            export GIT_PAGER=cat
        fi

        # Try to use bat for colorized output, fall back to plain git show
        if command -v bat &> /dev/null; then
            git show "$PARENT_COMMIT" | bat --style=plain --color=always --language=diff --paging=never
        else
            git show "$PARENT_COMMIT"
        fi
        echo ""
    fi

else
    # Regular format: look for commits with same step number (X-Y)
    # Get the most recent AI commit
    LAST_AI=$(git log --format=%s -1 --grep="ai: .*[.…]")

    if [ -z "$LAST_AI" ]; then
        print_error "No AI commits found in regular format"
        exit 1
    fi

    # Extract the step number
    STEP=$(echo "$LAST_AI" | sed -E 's/.*ai: .+[.…]+ \(([0-9]+)-[0-9]+\).*/\1/')

    if [ -z "$STEP" ]; then
        print_error "Could not extract step number from: $LAST_AI"
        exit 1
    fi

    print_info "Found AI commits for step ($STEP-X)"

    # Count commits in this batch
    COMMIT_COUNT=$(git log --format=%s --grep="ai: .*[.…].* ($STEP-" | wc -l | tr -d ' ')

    if [ "$COMMIT_COUNT" -eq 0 ]; then
        print_error "No commits found for step ($STEP-X)"
        exit 1
    fi

    print_success "Found $COMMIT_COUNT commit(s) in this batch"

    # Show the commits
    echo ""
    echo "Commits to fix:"
    git log --oneline --grep="ai: .*[.…].* ($STEP-" --reverse
    echo ""

    # Check if this batch was preceded by a query/error update
    FIRST_COMMIT=$(git log --format=%H --grep="ai: .*[.…].* ($STEP-" --reverse | head -1)
    PARENT_COMMIT=$(git rev-parse "$FIRST_COMMIT^")
    PARENT_MSG=$(git log --format=%s -1 "$PARENT_COMMIT")

    QUERY_ERROR_COMMIT=""
    if echo "$PARENT_MSG" | grep -qE "(ai: updated query|ai: updated errors)"; then
        QUERY_ERROR_COMMIT="$PARENT_COMMIT"
        print_info "This batch was preceded by: $PARENT_MSG"
        echo ""
        print_info "Changes in that commit:"
        echo ""

        # Disable pager unless USE_PAGER is set
        if [ -z "$USE_PAGER" ]; then
            export GIT_PAGER=cat
        fi

        # Try to use bat for colorized output, fall back to plain git show
        if command -v bat &> /dev/null; then
            git show "$PARENT_COMMIT" | bat --style=plain --color=always --language=diff --paging=never
        else
            git show "$PARENT_COMMIT"
        fi
        echo ""
    fi
fi

# Ask for the message once for all commits in this batch
echo ""
print_info "Enter a message for all commits in this batch"
print_warning "Leave empty to keep individual 'running…' messages"
print_warning "Press Ctrl+C to cancel"
echo ""
if [ "$IS_TEMPLATE_REPO" = true ]; then
    read -p "Message for step [$PADDED_STEP]: " BATCH_MESSAGE
else
    read -p "Message for step [$STEP]: " BATCH_MESSAGE
fi
echo ""

# Create a temporary script for the rebase
REBASE_SCRIPT=$(mktemp)
trap "rm -f $REBASE_SCRIPT" EXIT

# Generate the rebase script
if [ "$IS_TEMPLATE_REPO" = true ]; then
    # Template format
    cat > "$REBASE_SCRIPT" << 'EOFSCRIPT'
#!/usr/bin/env bash
# Extract step and substep
STEP=$(echo "$1" | sed 's/.*ai: \[\([0-9]*\)\].*/\1/' | sed 's/^0*//')
SUBSTEP=$(echo "$1" | sed 's/.*(\([0-9]*\)\/.*/\1/')
TOTAL="TOTAL_PLACEHOLDER"

# Extract current message (everything between ] and ()
CURRENT_MSG=$(echo "$1" | sed 's/.*\] \(.*\) (.*/\1/')

# Use batch message from environment variable if provided, otherwise check individual message
if [ -n "$BATCH_MSG_ENV" ]; then
    NEW_MSG="$BATCH_MSG_ENV"
elif echo "$CURRENT_MSG" | grep -qE "^running[.…]+$"; then
    # Still default, keep it
    NEW_MSG="running…"
else
    # Keep existing non-default message
    NEW_MSG="$CURRENT_MSG"
fi

# Reconstruct the commit message with total
PADDED_STEP=$(printf "%03d" "$STEP")
echo "📄TEMPLATE | ✨ ai: [$PADDED_STEP] $NEW_MSG ($SUBSTEP/$TOTAL)"
EOFSCRIPT
else
    # Regular format - no total to fix, just allow message editing
    cat > "$REBASE_SCRIPT" << 'EOFSCRIPT'
#!/usr/bin/env bash
# Extract step and substep
STEP=$(echo "$1" | sed -E 's/.*ai: .+[.…]+ \(([0-9]+)-[0-9]+\).*/\1/')
SUBSTEP=$(echo "$1" | sed -E 's/.*ai: .+[.…]+ \([0-9]+-([0-9]+)\).*/\1/')

# Extract current message (everything between : and ()
CURRENT_MSG=$(echo "$1" | sed -E 's/.*ai: (.+)[.…]+ \([0-9]+-[0-9]+\).*/\1/')

# Use batch message from environment variable if provided, otherwise check individual message
if [ -n "$BATCH_MSG_ENV" ]; then
    NEW_MSG="$BATCH_MSG_ENV"
elif echo "$CURRENT_MSG" | grep -qE "^running[.…]*$"; then
    # Still default, keep it
    NEW_MSG="running…"
else
    # Keep existing non-default message
    NEW_MSG="$CURRENT_MSG"
fi

# Reconstruct the commit message
echo "✨ ai: $NEW_MSG ($STEP-$SUBSTEP)"
EOFSCRIPT
fi

# Replace TOTAL_PLACEHOLDER only (message will be passed via environment)
sed -i.bak "s/TOTAL_PLACEHOLDER/$COMMIT_COUNT/g" "$REBASE_SCRIPT"
rm -f "$REBASE_SCRIPT.bak"

chmod +x "$REBASE_SCRIPT"

# Create a script for updating query/error commits
QUERY_ERROR_SCRIPT=$(mktemp)
trap "rm -f $COMMITS_TO_MODIFY $REBASE_SCRIPT $QUERY_ERROR_SCRIPT" EXIT

cat > "$QUERY_ERROR_SCRIPT" << 'EOFSCRIPT'
#!/usr/bin/env bash
# Append message to query/error commit

# Get the current commit message
CURRENT_MSG="$1"

# Check if batch message is provided
if [ -n "$BATCH_MSG_ENV" ]; then
    # Append ": message" to the existing query/error commit
    echo "${CURRENT_MSG}: ${BATCH_MSG_ENV}"
else
    # No batch message, keep as-is
    echo "$CURRENT_MSG"
fi
EOFSCRIPT

chmod +x "$QUERY_ERROR_SCRIPT"

# Find the parent commit (the commit before the first AI commit in this batch)
if [ "$IS_TEMPLATE_REPO" = true ]; then
    FIRST_COMMIT=$(git log --format=%H --grep="ai: \[$PADDED_STEP\]" --reverse | head -1)
else
    FIRST_COMMIT=$(git log --format=%H --grep="ai: .*[.…].* ($STEP-" --reverse | head -1)
fi

PARENT_COMMIT=$(git rev-parse "$FIRST_COMMIT^")

# Create a set of commits to modify (for fast lookup)
COMMITS_TO_MODIFY=$(mktemp)
trap "rm -f $COMMITS_TO_MODIFY $REBASE_SCRIPT" EXIT

if [ "$IS_TEMPLATE_REPO" = true ]; then
    git log --format="%H" --grep="ai: \[$PADDED_STEP\]" > "$COMMITS_TO_MODIFY"
else
    git log --format="%H" --grep="ai: .*[.…].* ($STEP-" > "$COMMITS_TO_MODIFY"
fi

# Add query/error commit to the list if it exists
if [ -n "$QUERY_ERROR_COMMIT" ]; then
    echo "$QUERY_ERROR_COMMIT" >> "$COMMITS_TO_MODIFY"
fi

# Create rebase editor script that modifies only our AI commits
REBASE_EDITOR=$(mktemp)
trap "rm -f $COMMITS_TO_MODIFY $REBASE_SCRIPT $QUERY_ERROR_SCRIPT $REBASE_EDITOR" EXIT

cat > "$REBASE_EDITOR" << 'EOF'
#!/usr/bin/env bash
# This script modifies the git rebase todo list
# It adds exec commands only for the AI commits we want to fix

TODO_FILE="$1"
TEMP_FILE="${TODO_FILE}.tmp"

> "$TEMP_FILE"

while IFS= read -r line; do
    # Extract commit hash from the line (format: "pick abc123 commit message")
    if [[ "$line" =~ ^pick[[:space:]]+([a-f0-9]+) ]]; then
        commit_hash="${BASH_REMATCH[1]}"

        # Check if this commit is in our list to modify
        if grep -q "^$commit_hash" "$COMMITS_TO_MODIFY_FILE"; then
            # This is an AI commit we want to fix
            commit_msg=$(git log --format=%s -1 "$commit_hash")

            # Use a unique temp file based on commit hash (not $$)
            temp_msg_file="/tmp/new_msg_${commit_hash}.txt"

            # Check if this is a query/error commit
            if echo "$commit_msg" | grep -qE "(ai: updated query|ai: updated errors)"; then
                # Query/error commit - use the query/error script to append message
                echo "exec BATCH_MSG_ENV=\"\$BATCH_MSG_ENV\" $QUERY_ERROR_SCRIPT_FILE '$commit_msg' > $temp_msg_file" >> "$TEMP_FILE"
            else
                # Regular AI commit - use the regular script
                echo "exec BATCH_MSG_ENV=\"\$BATCH_MSG_ENV\" $REBASE_SCRIPT_FILE '$commit_msg' > $temp_msg_file" >> "$TEMP_FILE"
            fi
            # Keep the pick
            echo "$line" >> "$TEMP_FILE"
            # Add exec to amend with new message
            echo "exec git commit --amend -m \"\$(cat $temp_msg_file)\" && rm -f $temp_msg_file" >> "$TEMP_FILE"
        else
            # Not an AI commit, keep as-is
            echo "$line" >> "$TEMP_FILE"
        fi
    else
        # Not a pick line (comment, etc), keep as-is
        echo "$line" >> "$TEMP_FILE"
    fi
done < "$TODO_FILE"

mv "$TEMP_FILE" "$TODO_FILE"
EOF

chmod +x "$REBASE_EDITOR"

# Export variables needed by the rebase editor
export COMMITS_TO_MODIFY_FILE="$COMMITS_TO_MODIFY"
export REBASE_SCRIPT_FILE="$REBASE_SCRIPT"
export QUERY_ERROR_SCRIPT_FILE="$QUERY_ERROR_SCRIPT"

print_info "Starting interactive rebase..."
echo ""

# Export the batch message as an environment variable (preserves all special characters)
export BATCH_MSG_ENV="$BATCH_MESSAGE"

# Set up environment for the rebase
export GIT_SEQUENCE_EDITOR="$REBASE_EDITOR"

# Run the rebase
if git rebase -i "$PARENT_COMMIT"; then
    print_success "Rebase completed successfully!"
    echo ""
    print_info "Updated commits:"
    if [ "$IS_TEMPLATE_REPO" = true ]; then
        git log --oneline --grep="ai: \[$PADDED_STEP\]" --reverse
    else
        git log --oneline --grep="ai: .*[.…].* ($STEP-" --reverse
    fi
    echo ""
    print_success "All done! Commits have been fixed."
else
    print_error "Rebase failed or was aborted"
    print_info "You can continue with: git rebase --continue"
    print_info "Or abort with: git rebase --abort"
    exit 1
fi

