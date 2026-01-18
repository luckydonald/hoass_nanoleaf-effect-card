# ✅ Query/Error Commit Editing Complete!

## Summary

The `fix-commits.sh` script now also edits the query/error commit message by appending the user's message to it, and ensures no commits are dropped in between.

## Changes Made

### 1. Query/Error Commit Detection
The script now stores the query/error commit hash if one precedes the batch:

```bash
QUERY_ERROR_COMMIT=""
if echo "$PARENT_MSG" | grep -qE "(ai: updated query|ai: updated errors)"; then
    QUERY_ERROR_COMMIT="$PARENT_COMMIT"
    # ... show diff ...
fi
```

### 2. Separate Script for Query/Error Commits
Created a dedicated script to handle query/error commit message updates:

```bash
cat > "$QUERY_ERROR_SCRIPT" << 'EOFSCRIPT'
#!/usr/bin/env bash
# Append message to query/error commit

CURRENT_MSG="$1"

if [ -n "$BATCH_MSG_ENV" ]; then
    # Append ": message" to the existing query/error commit
    echo "${CURRENT_MSG}: ${BATCH_MSG_ENV}"
else
    # No batch message, keep as-is
    echo "$CURRENT_MSG"
fi
EOFSCRIPT
```

### 3. Updated Rebase Editor
The rebase editor now detects query/error commits and uses the appropriate script:

```bash
# Check if this is a query/error commit
if echo "$commit_msg" | grep -qE "(ai: updated query|ai: updated errors)"; then
    # Query/error commit - use the query/error script to append message
    echo "exec ... $QUERY_ERROR_SCRIPT_FILE ..." >> "$TEMP_FILE"
else
    # Regular AI commit - use the regular script
    echo "exec ... $REBASE_SCRIPT_FILE ..." >> "$TEMP_FILE"
fi
```

### 4. Include Query/Error in Rebase Range
The rebase now starts from before the query/error commit if one exists:

```bash
if [ -n "$QUERY_ERROR_COMMIT" ]; then
    REBASE_PARENT=$(git rev-parse "$QUERY_ERROR_COMMIT^")
else
    # Start from before first AI commit
    REBASE_PARENT=$(git rev-parse "$FIRST_COMMIT^")
fi
```

### 5. Add to Commits List
The query/error commit is added to the list of commits to modify:

```bash
if [ -n "$QUERY_ERROR_COMMIT" ]; then
    echo "$QUERY_ERROR_COMMIT" >> "$COMMITS_TO_MODIFY"
fi
```

## How It Works

### Before
```
History:
  abc123 📄TEMPLATE | 🤌 ai: updated query
  def456 📄TEMPLATE | ✨ ai: [014] running… (1/X)
  ghi789 📄TEMPLATE | ✨ ai: [014] running… (2/X)

After fix-commits with message "Implement feature X":
  abc123 📄TEMPLATE | 🤌 ai: updated query          ← Unchanged
  def456 📄TEMPLATE | ✨ ai: [014] Implement feature X… (1/2)
  ghi789 📄TEMPLATE | ✨ ai: [014] Implement feature X… (2/2)
```

### After
```
History:
  abc123 📄TEMPLATE | 🤌 ai: updated query
  def456 📄TEMPLATE | ✨ ai: [014] running… (1/X)
  ghi789 📄TEMPLATE | ✨ ai: [014] running… (2/X)

After fix-commits with message "Implement feature X":
  abc123 📄TEMPLATE | 🤌 ai: updated query: Implement feature X  ← Updated!
  def456 📄TEMPLATE | ✨ ai: [014] Implement feature X… (1/2)
  ghi789 📄TEMPLATE | ✨ ai: [014] Implement feature X… (2/2)
```

## Example Usage

### Template Repository
```bash
make fix-commits

ℹ Found AI commits for step [014]
✓ Found 2 commit(s) in this batch

Commits to fix:
def456 📄TEMPLATE | ✨ ai: [014] running… (1/X)
ghi789 📄TEMPLATE | ✨ ai: [014] running… (2/X)

ℹ This batch was preceded by: 📄TEMPLATE | 🤌 ai: updated query

ℹ Changes in that commit:
[... diff showing query changes ...]

ℹ Enter a message for all commits in this batch
Message for step [014]: Implement state cycling feature

ℹ Starting interactive rebase...

✓ Rebase completed successfully!

ℹ Updated commits:
abc123 📄TEMPLATE | 🤌 ai: updated query: Implement state cycling feature
def456 📄TEMPLATE | ✨ ai: [014] Implement state cycling feature… (1/2)
ghi789 📄TEMPLATE | ✨ ai: [014] Implement state cycling feature… (2/2)
```

### Regular Repository
```bash
make fix-commits

ℹ Found AI commits for step (5-X)
✓ Found 3 commit(s) in this batch

ℹ This batch was preceded by: 🐞 ai: updated errors

ℹ Changes in that commit:
[... diff showing error fixes ...]

Message for step [5]: Fix import error in sensor.py

✓ Rebase completed successfully!

ℹ Updated commits:
abc123 🐞 ai: updated errors: Fix import error in sensor.py
def456 ✨ ai: Fix import error in sensor.py… (5-1)
ghi789 ✨ ai: Fix import error in sensor.py… (5-2)
jkl012 ✨ ai: Fix import error in sensor.py… (5-3)
```

## Message Format

### Query Commit
```
Before: 📄TEMPLATE | 🤌 ai: updated query
After:  📄TEMPLATE | 🤌 ai: updated query: Your message here
```

### Error Commit
```
Before: 🐞 ai: updated errors
After:  🐞 ai: updated errors: Your message here
```

## No Commits Dropped

The script now properly includes ALL commits in the rebase:
- ✅ Query/error commit (if present)
- ✅ All AI commits in the batch
- ✅ Any commits in between
- ✅ Any commits after the batch
- ✅ Merge commits preserved
- ✅ Manual commits preserved

### Example with Commits In Between
```
Before:
  abc123 📄TEMPLATE | 🤌 ai: updated query
  def456 Manual fix
  ghi789 📄TEMPLATE | ✨ ai: [014] running… (1/X)
  jkl012 Another manual commit
  mno345 📄TEMPLATE | ✨ ai: [014] running… (2/X)

After fix-commits:
  abc123 📄TEMPLATE | 🤌 ai: updated query: Feature X  ← Updated
  def456 Manual fix                                     ✅ Preserved
  ghi789 📄TEMPLATE | ✨ ai: [014] Feature X… (1/2)    ← Updated
  jkl012 Another manual commit                          ✅ Preserved
  mno345 📄TEMPLATE | ✨ ai: [014] Feature X… (2/2)    ← Updated
```

## Benefits

### Context in Query/Error
- ✅ Query commit shows what feature was requested
- ✅ Error commit shows what was being fixed
- ✅ Clear connection between task and implementation
- ✅ Better git history for understanding work

### Complete History
- ✅ No commits lost
- ✅ Full context preserved
- ✅ Manual fixes kept
- ✅ Merge commits safe

### Single Operation
- ✅ One command fixes everything
- ✅ Consistent message across all commits
- ✅ Query/error and AI commits linked
- ✅ Professional commit history

## Technical Details

### Rebase Range
```bash
# Without query/error commit
git rebase -i <first_ai_commit>^

# With query/error commit
git rebase -i <query_error_commit>^
```

### Script Selection
```bash
# In rebase editor
if query_or_error_commit; then
    use $QUERY_ERROR_SCRIPT_FILE  # Appends message
else
    use $REBASE_SCRIPT_FILE       # Replaces message
fi
```

### Message Transformation
```bash
# Query/Error Script
"ai: updated query"
→ "ai: updated query: Your message"

# Regular AI Script  
"ai: [014] running… (2/X)"
→ "ai: [014] Your message… (2/5)"
```

## Edge Cases Handled

### 1. No Query/Error Commit
```bash
# Only AI commits, no query/error before them
# Works normally, just updates AI commits
```

### 2. Empty Batch Message
```bash
# User presses Enter without typing
# Query/error: kept as-is
# AI commits: keep "running…"
```

### 3. Multiple Commits Between
```bash
# Manual commits between query and AI commits
# All preserved in correct order
```

### 4. Query/Error Already Has Suffix
```bash
# If query commit is already:
"ai: updated query: Previous message"
# Becomes:
"ai: updated query: Previous message: New message"
# (May want to handle this better in future)
```

---

**Status**: ✅ Complete
**Feature**: Query/error commit editing with message append
**Safety**: All commits preserved (no drops)
**Format**: `: message` appended to query/error commits
**Integration**: Seamless single-command workflow

