# ✅ fix-commits.sh Backtick Escaping Fixed!

## Problem

When entering a commit message with backticks (e.g., "Have `init.sh` work with git…"), the backticks were being interpreted as command substitution by the shell, causing the text inside to be executed as a command.

### Example Issue
```bash
# User enters:
Message for step [017]: Have `init.sh` work with git…

# Result:
📄TEMPLATE | ✨ ai: [017] Have  work with git… (2/2)
#                              ^^^ empty - init.sh was executed!
```

## Root Cause

The script was using simple string substitution without proper escaping:
```bash
# Before (BROKEN):
sed -i.bak "s/BATCH_MESSAGE_PLACEHOLDER/$BATCH_MESSAGE/g" "$REBASE_SCRIPT"
```

When `$BATCH_MESSAGE` contained backticks, they were interpreted by the shell:
- `` `init.sh` `` → Tried to execute `init.sh` command
- Command failed or returned empty
- Result: "Have  work with git" (missing the backticked part)

## Solution

Added proper escaping before substitution:
```bash
# After (FIXED):
ESCAPED_BATCH_MESSAGE=$(echo "$BATCH_MESSAGE" | sed 's/[\/&]/\\&/g' | sed "s/'/\\\\'/g" | sed 's/`/\\`/g' | sed 's/\$/\\$/g')
sed -i.bak "s/BATCH_MESSAGE_PLACEHOLDER/$ESCAPED_BATCH_MESSAGE/g" "$REBASE_SCRIPT"
```

### Escaping Applied

1. **Forward slashes and ampersands**: `\/` → `\\/`, `&` → `\\&`
   - Needed for sed pattern safety
   
2. **Single quotes**: `'` → `\\'`
   - Prevents string termination issues
   
3. **Backticks**: `` ` `` → `` \` ``
   - Prevents command substitution
   
4. **Dollar signs**: `$` → `\$`
   - Prevents variable expansion

## Test Cases

### Test 1: Backticks
```bash
Message: Have `init.sh` work with git…
Result: 📄TEMPLATE | ✨ ai: [017] Have `init.sh` work with git… (1/2)
✅ PASS - Backticks preserved
```

### Test 2: Dollar Signs
```bash
Message: Add $VARIABLE support…
Result: 📄TEMPLATE | ✨ ai: [017] Add $VARIABLE support… (1/2)
✅ PASS - Dollar signs preserved
```

### Test 3: Quotes
```bash
Message: Fix "broken" feature…
Result: 📄TEMPLATE | ✨ ai: [017] Fix "broken" feature… (1/2)
✅ PASS - Quotes preserved
```

### Test 4: Complex Message
```bash
Message: Refactor `get_data()` & add $config support…
Result: 📄TEMPLATE | ✨ ai: [017] Refactor `get_data()` & add $config support… (1/2)
✅ PASS - All special chars preserved
```

### Test 5: Forward Slashes
```bash
Message: Update path/to/file…
Result: 📄TEMPLATE | ✨ ai: [017] Update path/to/file… (1/2)
✅ PASS - Slashes preserved
```

## Characters Now Handled

| Character | Issue | Escape | Status |
|-----------|-------|--------|--------|
| `` ` `` | Command substitution | `` \` `` | ✅ Fixed |
| `$` | Variable expansion | `\$` | ✅ Fixed |
| `'` | String termination | `\\'` | ✅ Fixed |
| `/` | Sed pattern delimiter | `\\/` | ✅ Fixed |
| `&` | Sed replacement special | `\\&` | ✅ Fixed |

## Verification

To test the fix:

```bash
# 1. Make some test commits
echo "test" >> file.txt
git add . && git commit -m "📄TEMPLATE | ✨ ai: [999] running… (1/X)"
echo "test" >> file.txt
git add . && git commit -m "📄TEMPLATE | ✨ ai: [999] running… (2/X)"

# 2. Run fix-commits with backticks
make fix-commits

# 3. Enter message with special characters
Message for step [999]: Fix `method()` & add $var support…

# 4. Check result
git log --oneline -2
# Should show:
# xxx 📄TEMPLATE | ✨ ai: [999] Fix `method()` & add $var support… (2/2)
# xxx 📄TEMPLATE | ✨ ai: [999] Fix `method()` & add $var support… (1/2)
```

## Why This Matters

### Common Use Cases
1. **Code references**: `` `function()` ``, `` `class_name` ``
2. **File paths**: `path/to/file`, `./script.sh`
3. **Variables**: `$VARIABLE`, `${PARAM}`
4. **Shell commands**: `` `command` ``, `$(command)`
5. **Quotes**: `"text"`, `'text'`

All of these are now properly handled!

## Edge Cases

### Empty Message
```bash
Message for step [017]: 
# Result: Keeps "running…"
✅ Works
```

### Only Special Characters
```bash
Message for step [017]: `$`/&'…
Result: 📄TEMPLATE | ✨ ai: [017] `$`/&'… (1/1)
✅ Works
```

### Very Long Message
```bash
Message: This is a very long message with `backticks`, $variables, and/paths...
✅ Works - No length limit issues
```

---

**Status**: ✅ Fixed
**Issue**: Backticks and special characters causing command substitution
**Solution**: Proper escaping before sed substitution
**Test**: All special characters now preserved correctly

