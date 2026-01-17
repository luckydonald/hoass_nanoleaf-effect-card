# Intelligent Commit Step Tracking

## Overview

The `commit.sh` script now intelligently tracks AI run numbers using a step-substep format: `(step-substep)`.

## How It Works

### Commit Message Patterns

The script recognizes three types of AI commits:

1. **Running commits**: `ai: running... (X-Y)`
   - Represents an AI iteration
   - Format: `(step-substep)`

2. **Query updates**: `ai: updated query`
   - Marks a new question/task
   - Resets substep to 1, increments step

3. **Error updates**: `ai: updated errors`
   - Marks error feedback
   - Resets substep to 1, increments step

### Tracking Logic

The script scans recent commits (last 20) and applies these rules:

#### Rule 1: Found `ai: running... (X-Y)`
```
Current substep = Last substep + 1
Current step = Last step (unchanged)

Example:
Last commit: ai: running... (3-2)
Next commit: ai: running... (3-3)
```

#### Rule 2: Found `ai: updated query` or `ai: updated errors` BEFORE any `running` commit
```
Current substep = 1 (reset)
Current step = Last step + 1 (increment)

Example:
Last commits:
  - ai: updated query         ← Found first
  - ai: running... (2-5)      ← Previous step
Next commit: ai: running... (3-1)
```

#### Rule 3: No AI commits found
```
Start with (1-1)

Example:
First AI commit: ai: running... (1-1)
```

## Examples

### Example 1: Sequential Runs

```bash
# Commit history (newest first):
ai: running... (2-3)
ai: running... (2-2)
ai: running... (2-1)
ai: updated query
ai: running... (1-2)
ai: running... (1-1)

# Next commit will be:
ai: running... (2-4)
```

### Example 2: After Query Update

```bash
# Commit history:
ai: updated query           ← Latest
ai: running... (1-3)
ai: running... (1-2)
ai: running... (1-1)

# Next commit will be:
ai: running... (2-1)        ← New step, reset substep
```

### Example 3: After Error Update

```bash
# Commit history:
ai: updated errors          ← Latest
ai: running... (5-2)
ai: running... (5-1)

# Next commit will be:
ai: running... (6-1)        ← New step, reset substep
```

### Example 4: Mixed Updates

```bash
# Commit history:
ai: running... (3-2)        ← Most recent running
ai: updated query           ← Query update before it
ai: running... (2-4)
ai: running... (2-3)

# Next commit will be:
ai: running... (3-3)        ← Continue from most recent running
```

## Implementation Details

### Pattern Matching

```bash
# Match running commits
if echo "$commit_msg" | grep -q "ai: running\.\.\. ([0-9]*-[0-9]*)"; then
    # Extract numbers
    last_step=$(echo "$commit_msg" | sed 's/.*ai: running\.\.\. (\([0-9]*\)-.*/\1/')
    last_substep=$(echo "$commit_msg" | sed 's/.*ai: running\.\.\. ([0-9]*-\([0-9]*\)).*/\1/')
fi

# Match query/error updates
if echo "$commit_msg" | grep -qE "(ai: updated query|ai: updated errors)"; then
    # Handle step increment
fi
```

### Commit Processing Order

1. **Commit `ai/query.md`** (if changed) → `ai: updated query`
2. **Commit `ai/errors.md`** (if changed) → `ai: updated errors`
3. **Commit template-specific files** (if they exist)
4. **Determine step/substep** from history
5. **Commit remaining changes** → `ai: running... (X-Y)`

## Usage

### Automatic (Recommended)

```bash
# Just run the script
./scripts/commit.sh

# Or via make
make commit

# Script automatically:
# 1. Commits query.md if changed (increments step)
# 2. Commits errors.md if changed (increments step)
# 3. Determines correct (step-substep) from history
# 4. Commits remaining changes with correct number
```

### Manual Override

If you need to manually set the step/substep:

```bash
# The script doesn't support manual override
# But you can commit manually:
git add .
git commit -m "ai: running... (5-3)"
```

## Benefits

### For AI Assistants
- ✅ **Automatic tracking** - No need to remember numbers
- ✅ **Context awareness** - Knows when new task started
- ✅ **Substep continuation** - Continues work on same task
- ✅ **Step increment** - New query = new step

### For Developers
- ✅ **Clear history** - Can see task boundaries
- ✅ **Easy to follow** - Step = task, substep = iteration
- ✅ **Audit trail** - Trace back to original query

### For Collaboration
- ✅ **Consistent** - Same format for all AI commits
- ✅ **Searchable** - Easy to find specific iterations
- ✅ **Meaningful** - Numbers represent actual workflow

## Commit Message Format

### AI Running
```
✨ ai: running... (2-3)
```
- Step 2 (second task/query)
- Substep 3 (third iteration on this task)

### Query Update
```
🤌 ai: updated query
```
- Marks start of new task
- Next running commit will be (N+1-1)

### Error Update
```
🐞 ai: updated errors
```
- Marks error feedback
- Next running commit will be (N+1-1)

### Template-Specific
```
📄TEMPLATE | 🤌 ai: updated query
📄TEMPLATE | 🐞 ai: updated errors
```
- For template-related files
- Same tracking rules apply

## Edge Cases

### Case 1: Interrupted Sequence
```
ai: running... (2-3)
[manual commits]
ai: updated query
```
**Result**: Next AI commit is `(3-1)` (continues from last step)

### Case 2: Multiple Query Updates
```
ai: updated query
ai: updated query
ai: running... (5-1)
```
**Result**: Next AI commit is `(6-1)` (only looks at most recent)

### Case 3: Very Old Running Commit
```
ai: updated query        ← Recent
[100 commits]
ai: running... (1-5)     ← Old
```
**Result**: Next AI commit is `(2-1)` (increments from old step)

### Case 4: No History
```
[repository just initialized]
```
**Result**: First AI commit is `(1-1)` (starts fresh)

## Viewing Commit History

### See AI Commits Only
```bash
git log --oneline | grep "ai:"
```

### See Specific Step
```bash
git log --oneline | grep "ai: running... (3-"
```

### Count Substeps
```bash
git log --oneline | grep "ai: running... (3-" | wc -l
```

### Last AI Commit
```bash
git log --format=%s | grep "ai:" | head -1
```

## Troubleshooting

### Wrong Step Number
**Issue**: Script uses wrong step number

**Solution**: Check commit history
```bash
git log --oneline | grep "ai:" | head -10
```

**Fix**: The logic looks at last 20 commits. If older, manually commit:
```bash
git commit -m "ai: running... (X-Y)"
```

### Substep Not Incrementing
**Issue**: Substep stays at 1

**Solution**: Check if there's a query/error update between commits
```bash
git log --format=%s | grep -E "ai: (running|updated)" | head -5
```

### Missing Pattern
**Issue**: Script doesn't recognize old format

**Solution**: Old commits with different format won't be recognized. Start fresh:
- First new commit will be `(1-1)`
- Continue from there

## Best Practices

1. **Let the script handle it** - Don't manually set numbers
2. **Use make commit** - Simplest interface
3. **Update query.md** - When starting new task
4. **Update errors.md** - When providing feedback
5. **Let AI run** - Substeps track iterations automatically

## Examples in Practice

### Typical AI Session
```bash
# 1. User updates query
echo "New task: Add tests" > ai/query.md
./scripts/commit.sh
# Commits: ai: updated query

# 2. AI works
[AI makes changes]
./scripts/commit.sh
# Commits: ai: running... (5-1)

# 3. AI continues
[AI makes more changes]
./scripts/commit.sh
# Commits: ai: running... (5-2)

# 4. User provides errors
echo "Fix the import" > ai/errors.md
./scripts/commit.sh
# Commits: ai: updated errors

# 5. AI fixes
[AI makes fixes]
./scripts/commit.sh
# Commits: ai: running... (6-1)
```

### Finding Specific Work
```bash
# Find when tests were added
git log --all --grep="running... (5-"

# See what changed in step 5
git log --oneline --all --grep="running... (5-" | cut -d' ' -f1 | xargs git show

# Count iterations in step 5
git log --oneline | grep "running... (5-" | wc -l
```

---

**Status**: ✅ Implemented
**Complexity**: Smart history tracking
**Default**: (1-1) if no history
**Updates**: Query/errors reset substep, increment step
**Continuation**: Running commits increment substep

