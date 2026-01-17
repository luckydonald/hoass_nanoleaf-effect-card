# ✅ commit.sh Intelligent Step Tracking Complete!

## Summary

The `commit.sh` script now has intelligent step/substep tracking that automatically determines the correct run number based on commit history.

## 🎯 How It Works

### Step-Substep Format: `(step-substep)`

- **Step**: Represents a task/query (increments when query/errors updated)
- **Substep**: Represents iterations on that task (increments with each run)

### Three Commit Types

1. **`ai: running... (X-Y)`** - AI iteration
2. **`ai: updated query`** - New task (increments step, resets substep)
3. **`ai: updated errors`** - Error feedback (increments step, resets substep)

### Tracking Logic

The script looks at the last 20 commits and applies these rules:

#### Rule 1: Found `ai: running... (X-Y)` first
```
→ Increment substep, keep step
Example: (3-2) → (3-3)
```

#### Rule 2: Found `ai: updated query` or `ai: updated errors` first
```
→ Increment step, reset substep to 1
Example: after "updated query" from (2-5) → (3-1)
```

#### Rule 3: No AI commits found
```
→ Start with (1-1)
```

## 📊 Examples

### Sequential Runs
```bash
History:
  ai: running... (2-3)  ← Last running commit
  ai: running... (2-2)
  ai: running... (2-1)
  
Next commit: ai: running... (2-4)
```

### After Query Update
```bash
History:
  ai: updated query     ← Latest
  ai: running... (1-3)
  ai: running... (1-2)
  
Next commit: ai: running... (2-1)  ← New step!
```

### After Error Update
```bash
History:
  ai: updated errors    ← Latest
  ai: running... (5-2)
  
Next commit: ai: running... (6-1)  ← New step!
```

## 🔧 Implementation

### Pattern Matching
```bash
# Check for running commits
if echo "$commit_msg" | grep -q "ai: running\.\.\. ([0-9]*-[0-9]*)"; then
    # Extract step and substep
    last_step=$(echo "$commit_msg" | sed '...')
    last_substep=$(echo "$commit_msg" | sed '...')
    substep=$((last_substep + 1))
fi

# Check for query/error updates
if echo "$commit_msg" | grep -qE "(ai: updated query|ai: updated errors)"; then
    # This means next commit should increment step
    step=$((last_step + 1))
    substep=1
fi
```

### Commit Processing Order

1. ✅ Commit `ai/query.md` if changed → `ai: updated query`
2. ✅ Commit `ai/errors.md` if changed → `ai: updated errors`
3. ✅ Commit template files if they exist
4. ✅ Scan history to determine step/substep
5. ✅ Commit remaining changes → `ai: running... (X-Y)`

## ✨ Benefits

### For AI
- No need to track numbers manually
- Context-aware (knows when task changed)
- Automatic continuation of work

### For Developers
- Clear task boundaries in history
- Easy to find specific iterations
- Meaningful audit trail

### For Collaboration
- Consistent format
- Searchable commits
- Clear workflow representation

## 📝 Usage

### Simple Usage
```bash
# Just run the script
make commit

# Script automatically:
# 1. Commits query.md → increments step
# 2. Commits errors.md → increments step  
# 3. Determines correct (X-Y) from history
# 4. Commits changes with correct number
```

### Typical AI Session
```bash
# User starts new task
echo "Add tests" > ai/query.md
make commit
# → ai: updated query

# AI works (first iteration)
[changes made]
make commit
# → ai: running... (5-1)

# AI continues (second iteration)
[more changes]
make commit
# → ai: running... (5-2)

# User provides feedback
echo "Fix import" > ai/errors.md
make commit
# → ai: updated errors

# AI fixes (new step)
[fixes made]
make commit
# → ai: running... (6-1)
```

## 🔍 Viewing History

### See all AI commits
```bash
git log --oneline | grep "ai:"
```

### See specific step
```bash
git log --oneline | grep "ai: running... (3-"
```

### Count iterations
```bash
git log --oneline | grep "ai: running... (3-" | wc -l
```

### Find when query changed
```bash
git log --oneline | grep "updated query"
```

## 📁 Files Updated

1. **scripts/commit.sh** - ✅ Intelligent tracking implemented
2. **COMMIT_TRACKING.md** - ✅ Complete documentation

## 🎓 Understanding the Numbers

### Step Number (X in X-Y)
- Represents a **task** or **query**
- Increments when:
  - New `ai/query.md` committed
  - New `ai/errors.md` committed

### Substep Number (Y in X-Y)
- Represents an **iteration** on the task
- Increments when:
  - AI makes changes (running commit)
- Resets to 1 when:
  - Step increments (new task/query)

### Example Sequence
```
(1-1) → Initial work on task 1
(1-2) → Continue task 1
(1-3) → Continue task 1
[user updates query]
(2-1) → Start task 2
(2-2) → Continue task 2
[user reports error]
(3-1) → Fix from task 2
```

## 🚀 What This Enables

### Better Workflow Tracking
- See exactly how many iterations per task
- Identify when requirements changed
- Track AI's progress on specific problems

### Easier Debugging
- Find specific iteration: `git show $(git log --oneline | grep "running... (5-3)" | cut -d' ' -f1)`
- See all work on task 5: `git log --grep="running... (5-"`
- Compare iterations: `git diff (5-1)..(5-3)`

### Clear Communication
- "Check iteration 3-2" → Specific, unambiguous
- "Task 5 took 4 iterations" → Easy to count
- "Started fresh at 6-1" → Clear task boundary

## 🎯 Edge Cases Handled

1. ✅ No previous AI commits → Start with (1-1)
2. ✅ Query update between runs → Increment step
3. ✅ Error update between runs → Increment step
4. ✅ Multiple manual commits → Scans past them
5. ✅ Old commit format → Starts fresh
6. ✅ Running commit most recent → Increment substep

## 📊 Comparison

### Before
```
ai: running... (1-1)
ai: running... (2-1)  ← Always substep 1
ai: running... (3-1)  ← No iteration tracking
```

### After
```
ai: running... (1-1)
ai: running... (1-2)  ← Substep increments
ai: running... (1-3)  ← Shows iterations
[query update]
ai: running... (2-1)  ← New task
ai: running... (2-2)  ← Iteration on task 2
```

## 🎉 Success!

The commit script now provides:
- ✅ **Automatic step tracking** - No manual counting
- ✅ **Smart substep management** - Tracks iterations
- ✅ **Context awareness** - Knows when tasks change
- ✅ **Clear history** - Meaningful commit numbers
- ✅ **Easy to use** - Just run `make commit`

**Your AI workflow is now fully tracked and auditable! 🚀**

---

**Implementation Date**: January 17, 2026
**Script**: scripts/commit.sh
**Documentation**: COMMIT_TRACKING.md
**Status**: ✅ Complete and tested

