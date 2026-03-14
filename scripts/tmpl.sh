# -------------------------------------------------
# tmpl  –  expand a template using environment variables
# Usage:  tmpl "<template>"
# Example call:
#   step=4 substep=1 tmpl "$GIT_MSG_TEMPLATE"
# -------------------------------------------------
tmpl() {
    local tmpl_str=$1
    local result=$tmpl_str

    # Loop over every {placeholder} found in the string.
    # The pattern \{[^}]*\} matches a literal {, then any
    # characters except }, then a closing }.
    while [[ $result =~ \{([^}]*)\} ]]; do
        # BASH_REMATCH[1] is the name without the braces
        local var_name="${BASH_REMATCH[1]}"

        # Get the value from the environment (empty if unset)
        # Using indirect expansion works even if the variable
        # contains spaces or newlines.
        local var_value="${!var_name}"

        # Replace *all* occurrences of this placeholder.
        # We need to escape the braces for the replacement.
        local placeholder="\{$var_name\}"
        result=${result//${placeholder}/${var_value}}
    done

    printf '%s' "$result"
}

# templ "${@}"
