git rebase --abort

# Or continue if you fixed an issue
git rebase --continue

# Recovery from reflog
git reflog
git reset --hard HEAD@{n}  # where n is the commit before rebase
```

## Use Cases

### Use Case 1: After AI Session
```bash
# AI made several commits with "running…"
# Clean them up with meaningful messages
make fix-commits
```

### Use Case 2: Before Pull Request
```bash
# Make commit history readable
make fix-commits
# Then push
```

### Use Case 3: Partial Updates
```bash
# Some commits already have good messages
# Script only prompts for "running…" ones
make fix-commits
```

### Use Case 4: Template Development
```bash
# Fix totals and messages for template work
cd hoass_template
make fix-commits
# Automatically uses template format
```

## Technical Details

### Pattern Matching

**Template Format:**
```bash
# Match commits with [XXX] step number
git log --grep="ai: \[[0-9]\{3\}\]"

# Extract step number (with zero-padding removed)
sed 's/.*ai: \[\([0-9]*\)\].*/\1/' | sed 's/^0*//'
```

**Regular Format:**
```bash
# Match commits with (X-Y) pattern
git log --grep="ai: .*[.…].* ([0-9]+-"

# Extract step number
sed -E 's/.*ai: .+[.…]+ \(([0-9]+)-[0-9]+\).*/\1/'
```

### Rebase Process
```bash
# 1. Find parent commit (before first in batch)
PARENT=$(git rev-parse "$FIRST_COMMIT^")

# 2. Generate rebase todo with exec commands
exec script.sh 'commit message' > /tmp/new_msg.txt
pick <hash>
exec git commit --amend -m "$(cat /tmp/new_msg.txt)"

# 3. Run interactive rebase
git rebase -i "$PARENT"
```

### Message Extraction
```bash
# Template format - extract message between ] and (
sed 's/.*\] \(.*\) (.*/\1/'

# Regular format - extract message between : and (
sed -E 's/.*ai: (.+)[.…]+ \([0-9]+-[0-9]+\).*/\1/'
```

## Troubleshooting

### "No AI commits found"
**Cause**: No commits matching the pattern

**Solution**: Check recent commits
```bash
git log --oneline -10
```

### "You have uncommitted changes"
**Cause**: Working directory not clean

**Solution**: Commit or stash changes
```bash
git stash
make fix-commits
git stash pop
```

### "Rebase failed"
**Cause**: Conflict during rebase

**Solution**: Resolve and continue
```bash
# Fix conflicts
git add <files>
git rebase --continue

# Or abort
git rebase --abort
```

### Wrong Batch Selected
**Cause**: Script picks most recent batch

**Solution**: Manually rebase older batch
```bash
# Find the batch
git log --oneline --grep="ai: \[005\]"

# Manual rebase
git rebase -i <parent-commit>
```

## Best Practices

1. **Run after completing a task** - Clean up before moving to next task
2. **Meaningful messages** - Be descriptive but concise
3. **Check before pushing** - Review with `git log`
4. **Consistent style** - Use similar message format throughout
5. **Keep ellipsis** - Use `…` for consistency with commit.sh

## Limitations

### Does Not Handle
- ❌ Mixed batches (different step numbers)
- ❌ Non-consecutive commits
- ❌ Commits with merge conflicts
- ❌ Branches other than current

### Only Processes
- ✅ Most recent batch only
- ✅ Commits on current branch
- ✅ Commits with AI format

## Example Workflow

### Full AI Development Cycle
```bash
# 1. Start new task
echo "Add feature X" > ai/query.md
make commit
# → ✨ ai: updated query

# 2. AI works on task
[AI makes changes]
make commit
# → ✨ ai: running… (5-1)

[AI makes more changes]
make commit
# → ✨ ai: running… (5-2)

[AI makes final changes]
make commit
# → ✨ ai: running… (5-3)

# 3. Clean up commit messages
make fix-commits
# Enter meaningful messages for each commit

# 4. Review
git log --oneline -5

# 5. Push
git push
```

## Output Reference

### Success Output
```
==================================================
Fix AI Commit Messages
==================================================

ℹ Scanning for AI commit batches...
ℹ Found AI commits for step [007]
✓ Found 3 commit(s) in this batch

Commits to fix:
abc123 📄TEMPLATE | ✨ ai: [007] running… (1/X)
def456 📄TEMPLATE | ✨ ai: [007] running… (2/X)
ghi789 📄TEMPLATE | ✨ ai: [007] running… (3/X)

Proceed with fixing these commits? (y/n) [y]: y

ℹ Starting interactive rebase...
⚠ You'll be prompted for each commit with a default message

[... interactive prompts ...]

✓ Rebase completed successfully!

ℹ Updated commits:
abc123 📄TEMPLATE | ✨ ai: [007] Set up tests… (1/3)
def456 📄TEMPLATE | ✨ ai: [007] Added backend… (2/3)
ghi789 📄TEMPLATE | ✨ ai: [007] Added frontend… (3/3)

✓ All done! Commits have been fixed.
```

---

**Status**: ✅ Implemented
**Command**: `make fix-commits`
**Format**: Template & Regular
**Features**: Total count + Message editing
**Safety**: Clean working directory required
# Fix Commits Script

## Overview

The `fix-commits.sh` script helps you clean up AI commit messages by:
1. **Replacing X with actual total** in template format `(2/X)` → `(2/5)`
2. **Editing default messages** from "running…" to meaningful descriptions

## Usage

```bash
# Via make (recommended)
make fix-commits

# Or directly
./scripts/fix-commits.sh
```

## What It Does

### 1. Detects Repository Type
- **Template repo**: `hoass_(plugin[-_])?template`
- **Regular repo**: Everything else

### 2. Finds Last Batch
Scans recent commits to find the last batch of AI commits:

**Template format:**
```
📄TEMPLATE | ✨ ai: [013] running… (1/X)
📄TEMPLATE | ✨ ai: [013] running… (2/X)
📄TEMPLATE | ✨ ai: [013] running… (3/X)
```

**Regular format:**
```
✨ ai: running… (5-1)
✨ ai: running… (5-2)
✨ ai: running… (5-3)
```

### 3. Counts Total
Determines how many commits are in the batch.

### 4. Interactive Rebase
For each commit:
- Shows the current message
- If still "running…", asks for a meaningful message
- If already changed, keeps the existing message
- Updates the total (template format only)

## Examples

### Example 1: Template Repository

**Before:**
```
📄TEMPLATE | ✨ ai: [007] running… (1/X)
📄TEMPLATE | ✨ ai: [007] running… (2/X)
📄TEMPLATE | ✨ ai: [007] running… (3/X)
```

**Running the script:**
```bash
make fix-commits

Found AI commits for step [007]
✓ Found 3 commit(s) in this batch

Commits to fix:
abc123 📄TEMPLATE | ✨ ai: [007] running… (1/X)
def456 📄TEMPLATE | ✨ ai: [007] running… (2/X)
ghi789 📄TEMPLATE | ✨ ai: [007] running… (3/X)

Proceed with fixing these commits? (y/n) [y]: y

Current commit: 📄TEMPLATE | ✨ ai: [007] running… (1/X)
Enter new message (or press Enter to keep 'running…'): Set up test infrastructure

Current commit: 📄TEMPLATE | ✨ ai: [007] running… (2/X)
Enter new message (or press Enter to keep 'running…'): Added backend tests

Current commit: 📄TEMPLATE | ✨ ai: [007] running… (3/X)
Enter new message (or press Enter to keep 'running…'): Added frontend tests

✓ Rebase completed successfully!
```

**After:**
```
📄TEMPLATE | ✨ ai: [007] Set up test infrastructure… (1/3)
📄TEMPLATE | ✨ ai: [007] Added backend tests… (2/3)
📄TEMPLATE | ✨ ai: [007] Added frontend tests… (3/3)
```

### Example 2: Regular Repository

**Before:**
```
✨ ai: running… (3-1)
✨ ai: running… (3-2)
✨ ai: running… (3-3)
✨ ai: running… (3-4)
```

**Running the script:**
```bash
make fix-commits

Found AI commits for step (3-X)
✓ Found 4 commit(s) in this batch

Current commit: ✨ ai: running… (3-1)
Enter new message (or press Enter to keep 'running…'): Implemented database models

Current commit: ✨ ai: running… (3-2)
Enter new message (or press Enter to keep 'running…'): Added API endpoints

Current commit: ✨ ai: running… (3-3)
Enter new message (or press Enter to keep 'running…'): Wrote integration tests

Current commit: ✨ ai: running… (3-4)
Enter new message (or press Enter to keep 'running…'): Updated documentation
```

**After:**
```
✨ ai: Implemented database models… (3-1)
✨ ai: Added API endpoints… (3-2)
✨ ai: Wrote integration tests… (3-3)
✨ ai: Updated documentation… (3-4)
```

### Example 3: Already Meaningful Messages

**Before:**
```
📄TEMPLATE | ✨ ai: [008] Set up CI/CD… (1/X)
📄TEMPLATE | ✨ ai: [008] running… (2/X)
📄TEMPLATE | ✨ ai: [008] Fixed linting issues… (3/X)
```

**Running the script:**
```bash
make fix-commits

# Only prompts for commit 2 (still has "running…")
Current commit: 📄TEMPLATE | ✨ ai: [008] running… (2/X)
Enter new message: Added GitHub Actions workflow
```

**After:**
```
📄TEMPLATE | ✨ ai: [008] Set up CI/CD… (1/3)
📄TEMPLATE | ✨ ai: [008] Added GitHub Actions workflow… (2/3)
📄TEMPLATE | ✨ ai: [008] Fixed linting issues… (3/3)
```

## Features

### Automatic Detection
- ✅ Detects template vs regular repository
- ✅ Finds the most recent batch
- ✅ Counts commits automatically

### Smart Prompting
- ✅ Only prompts for "running…" messages
- ✅ Keeps existing meaningful messages
- ✅ Shows context for each commit

### Safe Operation
- ✅ Checks for uncommitted changes
- ✅ Shows commits before proceeding
- ✅ Asks for confirmation
- ✅ Preserves non-AI commits

### Format Support
- ✅ Template format: `📄TEMPLATE | ✨ ai: [XXX] msg… (Y/X)`
- ✅ Regular format: `✨ ai: msg… (X-Y)`
- ✅ Both `…` and `...` supported

## Safety Checks

### Before Starting
1. **Git repository check** - Must be in a git repo
2. **Clean working directory** - No uncommitted changes
3. **Batch detection** - Must find AI commits

### During Rebase
- Interactive rebase allows aborting at any time
- Original commits preserved in reflog
- Can recover with `git reflog` if needed

### If Something Goes Wrong
```bash
# Abort the rebase

