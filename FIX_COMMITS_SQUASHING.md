
```bash
# In rebase todo editor
pick abc123 commit message 1
squash def456 commit message 2  ← Changed from "pick" to "squash"
pick ghi789 commit message 3
squash jkl012 commit message 4  ← Changed from "pick" to "squash"
pick mno345 commit message 5
```

## Technical Details

### Squash Map File

```bash
# Temporary file containing hashes of commits to squash
SQUASH_MAP=$(mktemp)

# Populated with second commit of each squashable pair
for pair in "${SQUASH_COMMITS[@]}"; do
    idx2=$(echo "$pair" | cut -d: -f2)
    echo "${COMMIT_HASHES[$idx2]}" >> "$SQUASH_MAP"
done
```

### Rebase Editor Changes

```bash
# Check if commit should be squashed
if grep -q "^$commit_hash" "$SQUASH_MAP_FILE"; then
    should_squash=true
fi

# Change action
if [ "$should_squash" = true ]; then
    echo "squash $commit_hash ..." >> "$TEMP_FILE"
else
    echo "pick $commit_hash ..." >> "$TEMP_FILE"
fi
```

### Substep Override

```bash
# In rebase script
if [ -n "$SUBSTEP_OVERRIDE" ]; then
    SUBSTEP="$SUBSTEP_OVERRIDE"
fi
```

Passed from rebase editor:
```bash
echo "exec ... SUBSTEP_OVERRIDE=$current_substep ..." >> "$TEMP_FILE"
```

## Benefits

### Code Organization
- ✅ Groups related changes that touch different areas
- ✅ Reduces commit clutter
- ✅ Creates logical units of work

### Git History
- ✅ Cleaner history with fewer commits
- ✅ Proper numbering (no gaps)
- ✅ Easier to review

### Flexibility
- ✅ Optional - user can decline
- ✅ Shows what will be squashed
- ✅ Safe - only suggests non-overlapping commits

## Edge Cases Handled

### 1. No Squashing Opportunities
```
ℹ Analyzing commits for potential squashing...
ℹ No obvious squashing opportunities found (all commits touch overlapping files)
```

### 2. User Declines
```
Would you like to squash these commits? (y/n) [n]: n
ℹ Keeping all commits separate
```

### 3. Single Commit
```
# Only 1 commit in batch
# No pairs to analyze
# Skips squashing logic
```

### 4. All Commits Touch Same File
```
# All commits modify README.md
# No squashing suggested
# Keeps all commits separate
```

### 5. Complex Dependencies
```
# Script only checks file overlap
# If commits have logical dependencies
# User can decline squashing
```

## Example Scenarios

### Scenario 1: Frontend + Backend Changes

```
Before:
  [1] Added frontend Card component (1/4)
  [2] Added backend sensor (2/4)
  [3] Added frontend tests (3/4)
  [4] Added backend tests (4/4)

Analysis:
  → Can squash [1] and [2] (different areas)
  → Can squash [3] and [4] (different areas)

After squash:
  [1+2] Frontend and backend implementation (1/2)
  [3+4] Frontend and backend tests (2/2)
```

### Scenario 2: Sequential File Changes

```
Before:
  [1] Updated sensor.py lines 10-20 (1/3)
  [2] Updated sensor.py lines 50-60 (2/3)
  [3] Updated manifest.json (3/3)

Analysis:
  → Cannot squash [1] and [2] (same file: sensor.py)
  → Can squash [2] and [3] (different files)

After squash:
  [1] Updated sensor.py lines 10-20 (1/2)
  [2+3] Updated sensor.py and manifest (2/2)
```

### Scenario 3: Documentation Only

```
Before:
  [1] Updated README.md (1/3)
  [2] Updated TESTING.md (2/3)
  [3] Updated CHANGELOG.md (3/3)

Analysis:
  → Can squash all (different files)

After squash:
  [1+2+3] Updated documentation (1/1)
```

## Safety Features

### File Analysis
- ✅ Only suggests squashing for non-overlapping files
- ✅ Conservative approach (file-level, not line-level)
- ✅ User has final say

### Manual Commits Preserved
- ✅ Only analyzes AI commits in the batch
- ✅ Manual commits between AI commits are kept
- ✅ No risk of losing work

### Reversible
- ✅ User can decline squashing
- ✅ Can abort rebase if needed
- ✅ Original commits in reflog

## Limitations

### File-Level Only
- Doesn't analyze line-level conflicts
- May suggest squashing commits that logically depend on each other
- User should review suggestions

### Consecutive Pairs Only
- Only checks adjacent commits
- Doesn't find optimal squashing across entire batch
- Could miss opportunities with non-adjacent commits

### User Decision Required
- Not fully automatic
- User must understand implications
- Requires manual confirmation

## Future Enhancements

Possible improvements:
- Line-level conflict detection
- Optimal squashing algorithm (not just pairs)
- Smart grouping by file type or directory
- Automatic squashing for certain patterns

---

**Status**: ✅ Complete
**Feature**: Commit squashing with analysis
**Detection**: File-overlap based
**Renumbering**: Automatic substep adjustment
**Safety**: User confirmation required
**Integration**: Seamless with existing flow
# ✅ Commit Squashing Feature Complete!

## Summary

The `fix-commits.sh` script now analyzes commits in a batch to detect which ones could be squashed together (those that don't touch the same files/lines), presents these opportunities to the user, and automatically adjusts sub-numbering when squashing.

## How It Works

### 1. Analysis Phase

After getting the batch message, the script analyzes consecutive commits:

```bash
# For each pair of consecutive commits
for ((i=0; i<${#COMMIT_HASHES[@]}-1; i++)); do
    COMMIT1="${COMMIT_HASHES[$i]}"
    COMMIT2="${COMMIT_HASHES[$((i+1))]}"
    
    # Get files changed in each
    FILES1=$(git diff-tree --no-commit-id --name-only -r "$COMMIT1")
    FILES2=$(git diff-tree --no-commit-id --name-only -r "$COMMIT2")
    
    # Check for overlap
    COMMON_FILES=$(comm -12 <(echo "$FILES1") <(echo "$FILES2"))
    
    # If no common files, they can be squashed
    if [ -z "$COMMON_FILES" ]; then
        SQUASH_COMMITS+=("$i:$((i+1))")
    fi
done
```

### 2. Presentation

If squashable commits are found, show them to the user:

```
ℹ Found commits that could potentially be squashed:

  Commits 2 and 3:
    [2] 📄TEMPLATE | ✨ ai: [014] running… (2/X)
    [3] 📄TEMPLATE | ✨ ai: [014] running… (3/X)
    Files in [2]: frontend/src/Card.vue
    Files in [3]: custom_components/sensor.py

Would you like to squash these commits? (y/n) [n]:
```

### 3. Sub-numbering Adjustment

When commits are squashed, the script renumbers:

```bash
# Before squash (5 commits):
[1] ... (1/5)
[2] ... (2/5)  ← Will be squashed into [1]
[3] ... (3/5)
[4] ... (4/5)  ← Will be squashed into [3]
[5] ... (5/5)

# After squash (3 commits):
[1+2] ... (1/3)  ← Combined
[3+4] ... (2/3)  ← Combined
[5]   ... (3/3)  ← Renumbered
```

## Example Usage

### Template Repository Example

```bash
make fix-commits

ℹ Found AI commits for step [014]
✓ Found 5 commit(s) in this batch

Commits to fix:
abc123 📄TEMPLATE | ✨ ai: [014] running… (1/X)
def456 📄TEMPLATE | ✨ ai: [014] running… (2/X)
ghi789 📄TEMPLATE | ✨ ai: [014] running… (3/X)
jkl012 📄TEMPLATE | ✨ ai: [014] running… (4/X)
mno345 📄TEMPLATE | ✨ ai: [014] running… (5/X)

ℹ Changes in that commit:
[... diff ...]

Message for step [014]: Implement state cycling feature

ℹ Analyzing commits for potential squashing...

ℹ Found commits that could potentially be squashed:

  Commits 1 and 2:
    [1] 📄TEMPLATE | ✨ ai: [014] running… (1/X)
    [2] 📄TEMPLATE | ✨ ai: [014] running… (2/X)
    Files in [1]: frontend/src/Card.vue, frontend/src/types.ts
    Files in [2]: custom_components/plugin_template/sensor.py

  Commits 3 and 4:
    [3] 📄TEMPLATE | ✨ ai: [014] running… (3/X)
    [4] 📄TEMPLATE | ✨ ai: [014] running… (4/X)
    Files in [3]: tests/test_frontend.ts
    Files in [4]: tests/test_backend.py

Would you like to squash these commits? (y/n) [n]: y

ℹ Will squash the identified commits and adjust sub-numbering

ℹ Starting interactive rebase...

✓ Rebase completed successfully!

ℹ Updated commits:
abc123 📄TEMPLATE | ✨ ai: [014] Implement state cycling feature… (1/3)
ghi789 📄TEMPLATE | ✨ ai: [014] Implement state cycling feature… (2/3)
mno345 📄TEMPLATE | ✨ ai: [014] Implement state cycling feature… (3/3)

✓ All done! Commits have been fixed.
```

## When Commits Can Be Squashed

### ✅ Can Squash (No File Overlap)

```
Commit 1: Modified frontend/src/Card.vue
Commit 2: Modified custom_components/sensor.py
→ Different files, can squash
```

### ❌ Cannot Squash (File Overlap)

```
Commit 1: Modified custom_components/sensor.py (lines 10-20)
Commit 2: Modified custom_components/sensor.py (lines 30-40)
→ Same file, might have dependencies, won't suggest squashing
```

## Squashing Algorithm

### Detection Logic

1. **Get commit pairs**: Check each consecutive pair of AI commits
2. **Extract file lists**: Get all files changed in each commit
3. **Find overlap**: Use `comm -12` to find common files
4. **Mark for squashing**: If no overlap, add to squash candidates

### Renumbering Logic

1. **Track substep**: Start at 1
2. **For each commit**:
   - If NOT being squashed: assign substep, increment counter
   - If being squashed: assign same substep as previous, don't increment
3. **Result**: Squashed commits share substeps, remaining ones renumber

### Git Operation

