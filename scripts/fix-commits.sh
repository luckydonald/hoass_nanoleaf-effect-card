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
fi

# Ask for confirmation
read -p "Proceed with fixing these commits? (y/n) [y]: " CONFIRM
CONFIRM=${CONFIRM:-y}

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    print_warning "Operation cancelled"
    exit 0
fi

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

# Check if message is still default
if echo "$CURRENT_MSG" | grep -qE "^running[.…]+$"; then
    echo ""
    echo "Current commit: $1"
    echo ""
    read -p "Enter new message (or press Enter to keep 'running…'): " NEW_MSG
    if [ -z "$NEW_MSG" ]; then
        NEW_MSG="running…"
    fi
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

# Check if message is still default
if echo "$CURRENT_MSG" | grep -qE "^running[.…]*$"; then
    echo ""
    echo "Current commit: $1"
    echo ""
    read -p "Enter new message (or press Enter to keep 'running…'): " NEW_MSG
    if [ -z "$NEW_MSG" ]; then
        NEW_MSG="running…"
    fi
else
    # Keep existing non-default message
    NEW_MSG="$CURRENT_MSG"
fi

# Reconstruct the commit message
echo "✨ ai: $NEW_MSG ($STEP-$SUBSTEP)"
EOFSCRIPT
fi

# Replace TOTAL_PLACEHOLDER with actual count
sed -i.bak "s/TOTAL_PLACEHOLDER/$COMMIT_COUNT/g" "$REBASE_SCRIPT"
rm -f "$REBASE_SCRIPT.bak"

chmod +x "$REBASE_SCRIPT"

# Create the git rebase sequence
REBASE_TODO=$(mktemp)
trap "rm -f $REBASE_TODO $REBASE_SCRIPT" EXIT

if [ "$IS_TEMPLATE_REPO" = true ]; then
    # Get commits for this step (oldest first)
    git log --format="%H" --grep="ai: \[$PADDED_STEP\]" --reverse > /tmp/commit_hashes.txt
else
    # Get commits for this step (oldest first)
    git log --format="%H" --grep="ai: .*[.…].* ($STEP-" --reverse > /tmp/commit_hashes.txt
fi

# Build rebase todo list
echo "# Rebase AI commits - fixing messages" > "$REBASE_TODO"
while IFS= read -r commit_hash; do
    COMMIT_MSG=$(git log --format=%s -1 "$commit_hash")
    echo "exec $REBASE_SCRIPT '$COMMIT_MSG' > /tmp/new_msg_$$.txt" >> "$REBASE_TODO"
    echo "pick $commit_hash" >> "$REBASE_TODO"
    echo "exec git commit --amend -m \"\$(cat /tmp/new_msg_$$.txt)\" && rm /tmp/new_msg_$$.txt" >> "$REBASE_TODO"
done < /tmp/commit_hashes.txt

rm /tmp/commit_hashes.txt

# Find the parent commit (the commit before the first AI commit in this batch)
if [ "$IS_TEMPLATE_REPO" = true ]; then
    FIRST_COMMIT=$(git log --format=%H --grep="ai: \[$PADDED_STEP\]" --reverse | head -1)
else
    FIRST_COMMIT=$(git log --format=%H --grep="ai: .*[.…].* ($STEP-" --reverse | head -1)
fi

PARENT_COMMIT=$(git rev-parse "$FIRST_COMMIT^")

print_info "Starting interactive rebase..."
print_warning "You'll be prompted for each commit with a default message"
echo ""

# Set up environment for the rebase
export GIT_SEQUENCE_EDITOR="cat $REBASE_TODO >"

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

