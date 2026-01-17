It is missing the prefix, and also the detection of the query part (and hence the first number incrementing) failed.

➜ git log --pretty=format:"%s" -12
📄TEMPLATE | Did some cleanup and minor fixes.
✨ ai: [007] running... (3/X)
✨ ai: [007] running... (3/X)
✨ ai: [007] running... (3/X)
✨ ai: [007] running... (3/X)
📄TEMPLATE | 🤌 ai: updated query
📄TEMPLATE | Manually changed stuff after AI messed it up, lol.
📄TEMPLATE | ✨ ai: [007] Add `make init`… (2/2)
📄TEMPLATE | ✨ ai: [007] Add `make init`… (1/2)
📄TEMPLATE | 🤌 ai: updated query
📄TEMPLATE | ✨ ai: [006] Add `make init`… (6/6)
📄TEMPLATE | ✨ ai: [006] Add `make init`… (5/6)
…

——————

./scripts/commit.sh: line 192: syntax error near unexpected token `elif' 
