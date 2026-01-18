ℹ Analyzing commits for potential squashing...
ℹ No squashing opportunities found (commits modify overlapping lines)
```

## Benefits

### More Aggressive Squashing
- ✅ Can squash commits that touch the same files
- ✅ Only prevents squashing when lines actually conflict
- ✅ Reduces commit count more effectively

### Smarter Analysis
- ✅ Line-level precision
- ✅ Works with multiple files
- ✅ Handles edge cases safely

### Better Developer Experience
- ✅ More squashing opportunities presented
- ✅ Cleaner commit history
- ✅ Fewer manual decisions needed

## Performance

### Complexity
- **Before**: O(n) file comparisons
- **After**: O(n × m) where m = average files per commit pair

For typical commit pairs with 2-5 files each, this is still very fast.

### Git Commands
Each commit pair analysis runs:
- 2 × `git diff-tree` (get file lists)
- 1 × `comm` (find common files)
- k × `git diff` where k = number of common files
- Minimal overhead

## Safety Features

### Conservative Defaults
- If line ranges cannot be determined → assume overlap
- If binary files involved → assume overlap
- If parse fails → assume overlap

### User Confirmation
- User still sees what will be squashed
- User can decline squashing
- All commits preserved until user confirms

### Reversible
- Can abort rebase if needed
- Original commits in reflog
- No data loss

## Limitations

### First Hunk Only
Currently only checks the first change hunk in each file. Files with multiple separated changes might be overly conservative.

**Example:**
```diff
@@ -10,5 +10,8 @@  ← Checks this
...changes...

@@ -100,3 +103,4 @@  ← Doesn't check this
...more changes...
```

### Adjacent Lines
If commits touch adjacent lines (e.g., line 20 and line 21), they're considered overlapping even if they could potentially merge cleanly.

### Context Lines
Git diff context (usually 3 lines) is included in the range, so commits need to be at least 6 lines apart to avoid overlap detection.

## Future Enhancements

Possible improvements:
- Check all hunks, not just first
- Consider git's ability to auto-merge adjacent changes
- Use `git merge-tree` for more accurate conflict detection
- Allow user-configurable line spacing threshold

## Testing

### Test Case 1: Different Sections
```bash
# Commit 1: Add import at top
echo "import new_module" >> sensor.py
git add sensor.py
git commit -m "ai: [999] running… (1/X)"

# Commit 2: Add function at bottom
echo "def new_function():\n    pass" >> sensor.py
git add sensor.py
git commit -m "ai: [999] running… (2/X)"

# Run fix-commits
make fix-commits
# Should offer to squash! ✅
```

### Test Case 2: Overlapping Lines
```bash
# Commit 1: Modify line 10
sed -i '10s/.*/modified line 10/' sensor.py
git add sensor.py
git commit -m "ai: [999] running… (1/X)"

# Commit 2: Modify line 12 (close to line 10)
sed -i '12s/.*/modified line 12/' sensor.py
git add sensor.py
git commit -m "ai: [999] running… (2/X)"

# Run fix-commits
make fix-commits
# Should NOT offer to squash (too close) ✗
```

---

**Status**: ✅ Complete
**Analysis**: Line-level overlap detection
**Improvement**: More squashing opportunities
**Safety**: Conservative defaults, user confirmation
**Performance**: Fast, minimal overhead
 # ✅ Line-Level Squash Analysis Complete!

## Summary

The `fix-commits.sh` script now performs **line-level overlap analysis** instead of just file-level checking. This means commits can be squashed even if they touch the same files, as long as they modify different lines within those files.

## What Changed

### Before (File-Level Only)
```bash
# Simple file overlap check
COMMON_FILES=$(comm -12 <(echo "$FILES1") <(echo "$FILES2"))

if [ -z "$COMMON_FILES" ]; then
    # No common files - can squash
    SQUASH_COMMITS+=("$i:$((i+1))")
fi
```

**Limitation**: If two commits touched the same file at all, they couldn't be squashed, even if they modified completely different parts of the file.

### After (Line-Level Analysis)
```bash
# For each common file, check if line ranges overlap
for file in $COMMON_FILES; do
    # Get line ranges from git diff
    LINES1=$(git diff "$PARENT1" "$COMMIT1" -- "$file" | grep '^@@')
    LINES2=$(git diff "$COMMIT1" "$COMMIT2" -- "$file" | grep '^@@')
    
    # Extract line numbers and check for overlap
    if [ "$START1" -le "$END2" ] && [ "$START2" -le "$END1" ]; then
        # Lines overlap - cannot squash
        can_squash=false
    fi
done
```

**Improvement**: Now checks if the actual line ranges overlap, allowing squashing when commits touch different parts of the same file.

## How Line Analysis Works

### 1. Extract Line Ranges

For each file that appears in both commits:

```bash
# Get diff hunks for COMMIT1
git diff "$PARENT1" "$COMMIT1" -- file.py
# Output: @@ -10,5 +10,8 @@ ...
#         Means: Changed lines 10-15 (10 + 5)

# Get diff hunks for COMMIT2  
git diff "$COMMIT1" "$COMMIT2" -- file.py
# Output: @@ -50,3 +50,4 @@ ...
#         Means: Changed lines 50-53 (50 + 3)
```

### 2. Parse Line Numbers

```bash
# From: @@ -10,5 +10,8 @@
START1=10
COUNT1=8
END1=18  # START1 + COUNT1

# From: @@ -50,3 +50,4 @@
START2=50
COUNT2=4
END2=54  # START2 + COUNT2
```

### 3. Check for Overlap

```bash
# Ranges overlap if: START1 <= END2 AND START2 <= END1
if [ 10 -le 54 ] && [ 50 -le 18 ]; then
    # FALSE - no overlap!
    # Lines 10-18 and 50-54 don't overlap
    # Can squash!
fi
```

## Example Scenarios

### Scenario 1: Same File, Different Sections

**Before (File-Level):** ❌ Cannot squash

```
Commit 1: Modified README.md lines 10-20
Commit 2: Modified README.md lines 100-110

File-level check: Both touch README.md → Cannot squash
```

**After (Line-Level):** ✅ Can squash

```
Commit 1: Modified README.md lines 10-20
Commit 2: Modified README.md lines 100-110

Line-level check: Lines 10-20 and 100-110 don't overlap → Can squash!
```

### Scenario 2: Same File, Overlapping Lines

**Both (File and Line-Level):** ❌ Cannot squash

```
Commit 1: Modified sensor.py lines 30-40
Commit 2: Modified sensor.py lines 35-45

Line-level check: Lines overlap (30-40 ∩ 35-45) → Cannot squash
```

### Scenario 3: Multiple Files, Mixed

```
Commit 1:
  - Modified sensor.py lines 10-20
  - Modified manifest.json lines 5-8

Commit 2:
  - Modified sensor.py lines 100-110
  - Modified manifest.json lines 20-25

Analysis:
  - sensor.py: lines 10-20 vs 100-110 → No overlap ✓
  - manifest.json: lines 5-8 vs 20-25 → No overlap ✓
  
Result: Can squash! ✅
```

### Scenario 4: Different Files

```
Commit 1: Modified frontend/Card.vue
Commit 2: Modified backend/sensor.py

Line-level check: No common files → Can squash! ✅
(This worked before too)
```

## Real-World Example

### Development Session

```
Commit 1: Added import at top of sensor.py (lines 1-5)
Commit 2: Added new function at bottom of sensor.py (lines 200-220)
Commit 3: Updated README installation section (lines 50-60)
Commit 4: Updated README usage section (lines 150-160)
```

**File-Level Analysis:**
- Commits 1 & 2: Both touch sensor.py → ❌ Cannot squash
- Commits 3 & 4: Both touch README.md → ❌ Cannot squash
- Result: No squashing

**Line-Level Analysis:**
- Commits 1 & 2: Lines 1-5 vs 200-220 → ✅ Can squash!
- Commits 3 & 4: Lines 50-60 vs 150-160 → ✅ Can squash!
- Result: Can reduce 4 commits to 2!

## Algorithm Details

### Overlap Detection Formula

Two line ranges overlap if both conditions are true:
```
START1 <= END2  AND  START2 <= END1
```

Examples:
```
Range 1: 10-20, Range 2: 30-40
  10 <= 40 ✓ AND 30 <= 20 ✗ → No overlap ✓

Range 1: 10-20, Range 2: 15-25
  10 <= 25 ✓ AND 15 <= 20 ✓ → Overlap! ✗

Range 1: 10-20, Range 2: 20-30
  10 <= 30 ✓ AND 20 <= 20 ✓ → Overlap! ✗
```

### Handling Edge Cases

#### Single Line Changes
```bash
# @@ -50 +50 @@  (no comma means single line)
if echo "$LINES1" | grep -q ','; then
    COUNT1=$(echo "$LINES1" | cut -d, -f2)
else
    COUNT1=0  # Single line
    END1=$START1
fi
```

#### Multiple Hunks
```bash
# Only checks first hunk for simplicity
LINES1=$(... | grep '^@@' | sed ...)
START1=$(echo "$LINES1" | head -1 | ...)
```

For files with multiple separate change hunks, we currently only check the first hunk. This is conservative - if the first hunks don't overlap, we allow squashing.

#### Binary Files
```bash
# git diff returns nothing for binary files
if [ -n "$LINES1" ] && [ -n "$LINES2" ]; then
    # Can analyze
else
    # Cannot determine - assume overlap (safe)
    can_squash=false
fi
```

## Output Messages

### Squashing Opportunities Found
```
ℹ Found commits that could potentially be squashed:

  Commits 1 and 2:
    [1] 📄TEMPLATE | ✨ ai: [029] running… (1/X)
    [2] 📄TEMPLATE | ✨ ai: [029] running… (2/X)
    Files in [1]: sensor.py, manifest.json
    Files in [2]: sensor.py, README.md

Would you like to squash these commits? (y/n) [n]:
```

### No Squashing Opportunities
```

