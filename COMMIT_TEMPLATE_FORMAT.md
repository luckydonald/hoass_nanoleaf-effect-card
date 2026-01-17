# Template Repository Commit Format

## Overview

The `commit.sh` script now automatically detects if it's running in the template repository and uses a special commit message format.

## Detection

The script detects the template repository by checking if the repository directory name matches:
```
hoass_template
hoass_plugin-template
hoass_plugin_template
```

Pattern: `^hoass_(plugin[-_])?template`

## Commit Message Formats

### Regular Repository Format
```
✨ ai: running... (7-2)
```
- Step: 7
- Substep: 2
- Format: `(step-substep)`

### Template Repository Format
```
📄TEMPLATE | ✨ ai: [007] running... (2/X)
```
- Prefix: `📄TEMPLATE | `
- Step: 007 (zero-padded to 3 digits)
- Message: "running..."
- Substep: 2
- Total substeps: X (unknown)
- Format: `[padded_step] msg (substep/total)`

## Examples

### Regular Repository

```bash
# History:
ai: running... (3-2)
ai: running... (3-1)
ai: updated query
ai: running... (2-5)

# Next commit:
ai: running... (3-3)
```

### Template Repository

```bash
# History:
📄TEMPLATE | ✨ ai: [003] running... (2/X)
📄TEMPLATE | ✨ ai: [003] running... (1/X)
📄TEMPLATE | 🤌 ai: updated query
📄TEMPLATE | ✨ ai: [002] running... (5/X)

# Next commit:
📄TEMPLATE | ✨ ai: [003] running... (3/X)
```

## Pattern Matching

### Regular Format
```bash
# Match pattern
ai: running\.\.\. ([0-9]*-[0-9]*)

# Extract step
sed 's/.*ai: running\.\.\. (\([0-9]*\)-.*/\1/'

# Extract substep
sed 's/.*ai: running\.\.\. ([0-9]*-\([0-9]*\)).*/\1/'
```

### Template Format
```bash
# Match pattern
TEMPLATE.*ai: \[[0-9]{3}\].*\([0-9]+/

# Extract step (with zero-padding removal)
sed 's/.*ai: \[\([0-9]*\)\].*/\1/' | sed 's/^0*//'

# Extract substep
sed 's/.*(\([0-9]*\)\/.*/\1/'
```

## Implementation Details

### Variables Used

**Regular Format:**
```bash
COMMIT_MSG_STEP="✨ ai: running... ({step}-{substep})"

# Variables:
step=7
substep=2
```

**Template Format:**
```bash
COMMIT_MSG_STEP_TEMPLATE="${COMMIT_PREFIX_TEMPLATE}✨ ai: [{padded_step}] {msg} ({substep}/{total_substeps})"
COMMIT_PREFIX_TEMPLATE="📄TEMPLATE | "

# Variables:
padded_step=$(printf "%03d" "$step")  # "007"
msg="running..."
substep=2
total_substeps="X"
```

### Zero-Padding Logic

```bash
# Convert step to zero-padded format
padded_step=$(printf "%03d" "$step")

# Examples:
1   → 001
7   → 007
42  → 042
123 → 123
```

### Extracting Unpadded Step

```bash
# Remove leading zeros
last_step=$(echo "$commit_msg" | sed 's/.*ai: \[\([0-9]*\)\].*/\1/' | sed 's/^0*//')

# Examples:
[001] → 1
[007] → 7
[042] → 42
[123] → 123
```

## Behavior

### Sequential Commits (Template Repo)

```bash
make commit  # 📄TEMPLATE | ✨ ai: [001] running... (1/X)
make commit  # 📄TEMPLATE | ✨ ai: [001] running... (2/X)
make commit  # 📄TEMPLATE | ✨ ai: [001] running... (3/X)
```

### After Query Update (Template Repo)

```bash
# Edit ai/plugin_template/query.md
make commit  # 📄TEMPLATE | 🤌 ai: updated query

# Make changes
make commit  # 📄TEMPLATE | ✨ ai: [002] running... (1/X)
```

### After Error Update (Template Repo)

```bash
# Edit ai/plugin_template/errors.md
make commit  # 📄TEMPLATE | 🐞 ai: updated errors

# Make fixes
make commit  # 📄TEMPLATE | ✨ ai: [003] running... (1/X)
```

## Query/Error Files

The script handles both regular and template-specific files:

### Regular Files
- `ai/query.md` → `🤌 ai: updated query`
- `ai/errors.md` → `🐞 ai: updated errors`

### Template Files
- `ai/plugin_template/query.md` → `📄TEMPLATE | 🤌 ai: updated query`
- `ai/plugin_template/errors.md` → `📄TEMPLATE | 🐞 ai: updated errors`

## Total Substeps

The `total_substeps` field is set to "X" because:
1. Unknown at commit time
2. Can't predict how many more iterations will occur
3. Updated manually if needed later

Future enhancement could calculate total by counting commits with same step number.

## Benefits of Template Format

### Clear Identification
- `📄TEMPLATE |` prefix instantly identifies template commits
- Separate from regular plugin development

### Better Organization
- Zero-padded steps sort correctly
- Easy to see which step (task) is being worked on
- Clear substep progression

### Searchability
```bash
# Find all template commits
git log --oneline | grep "TEMPLATE"

# Find specific step
git log --oneline | grep "ai: \[007\]"

# Count substeps in step 3
git log --oneline | grep "ai: \[003\]" | wc -l
```

## Viewing History

### All Template Commits
```bash
git log --oneline --all --grep="TEMPLATE"
```

### Specific Step
```bash
git log --oneline --all --grep="ai: \[005\]"
```

### Latest Template Commit
```bash
git log --format=%s | grep "TEMPLATE" | head -1
```

### Compare Template Formats
```bash
# Regular repo
git log --oneline | grep "ai: running"

# Template repo
git log --oneline | grep "TEMPLATE.*ai: \["
```

## Edge Cases

### Mixed History
If repository was renamed or has commits from before detection:
- Script looks at repository name NOW
- Old commits might use different format
- New commits use detected format

### Manual Commits
If you manually commit without the script:
- Use the appropriate format for the repository
- Script will parse and continue correctly

### Repository Rename
If you rename repository:
- Detection happens on each run
- Format switches automatically
- No manual configuration needed

## Troubleshooting

### Wrong Format Detected
**Issue**: Script uses template format when it shouldn't (or vice versa)

**Check**: Repository directory name
```bash
basename "$(pwd)"
# Should match: hoass_(plugin[-_])?template
```

**Fix**: Rename directory or adjust detection regex

### Can't Parse Old Commits
**Issue**: Old commits use different format

**Solution**: Script starts fresh with (1-1) or (001-1)
- Continue from there
- Old history preserved but not parsed

### Step Numbers Don't Match
**Issue**: Mixed format in history

**Solution**: Script only looks at last 20 commits
- Uses appropriate pattern for current format
- Ignores commits in other format

## Usage

### Automatic (Template Repo)
```bash
make commit
# Script detects: hoass_template
# Uses: 📄TEMPLATE | ✨ ai: [001] running... (1/X)
```

### Automatic (Regular Repo)
```bash
make commit
# Script detects: hoass_my-plugin
# Uses: ✨ ai: running... (1-1)
```

### No Configuration Needed
- Detection is automatic
- Format chosen automatically
- Just run `make commit`

---

**Status**: ✅ Implemented
**Detection**: Automatic by directory name
**Template Format**: `📄TEMPLATE | ✨ ai: [XXX] msg (Y/X)`
**Regular Format**: `✨ ai: running... (X-Y)`
**Configuration**: None required

