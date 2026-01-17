#!/usr/bin/env bash
# ============================================================================
# Home Assistant Plugin Template Initializer
# ============================================================================
#
# This script initializes a new Home Assistant plugin from this template.
# It will:
#   1. Ask for your plugin name (display name for UI)
#   2. Calculate and confirm lowercase-dash version (for filenames)
#   3. Calculate and confirm snake_case version (for Python modules)
#   4. Generate GitHub repository URL
#   5. Optionally remove Python backend files
#   6. Choose frontend framework (vue or plain)
#   7. Replace all template strings with your plugin names
#   8. Rename directories appropriately
#
# Usage:
#   cd /path/to/hoass_template
#   ./scripts/init.sh
#
# Example:
#   Plugin Display Name: Calendar Alarm Clock
#   Lowercase-dash:      calendar-alarm-clock
#   Snake_case:          calendar_alarm_clock
#
# ============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

print_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to convert string to lowercase-dash format
to_lowercase_dash() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//'
}

# Function to convert string to snake_case format
to_snake_case() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_]/_/g' | sed 's/__*/_/g' | sed 's/^_//' | sed 's/_$//'
}

# Function to convert string to PascalCase format
to_pascal_case() {
    echo "$1" | sed -E 's/[^a-zA-Z0-9]+/ /g' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) tolower(substr($i,2))}}1' | sed 's/ //g'
}

print_header "Home Assistant Plugin Template Initializer"

# Get the repository root (parent of scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

# Safety check: ensure this is the template repository
if [ ! -d "custom_components/template" ] && [ ! -d "frontend_vue" ] && [ ! -d "frontend_plain" ]; then
    print_error "This doesn't appear to be the template repository!"
    print_error "Expected to find custom_components/template/ or frontend_vue/ or frontend_plain/"
    exit 1
fi

print_info "Working directory: $REPO_ROOT"

# Step 1: Get the display name (UI name)
print_info "Step 1: Plugin Display Name"
echo "This is the name that will be shown in the Home Assistant UI."
echo "Example: 'Calendar Alarm Clock'"
echo ""
read -p "Enter plugin display name: " DISPLAY_NAME

if [ -z "$DISPLAY_NAME" ]; then
    print_error "Display name cannot be empty!"
    exit 1
fi

print_success "Display name: $DISPLAY_NAME"

# Step 2: Get the lowercase-dash name
print_info "\nStep 2: Lowercase-Dash Name"
echo "This is used for custom component names and filenames."
echo "Example: 'calendar-alarm-clock' (for <calendar-alarm-clock-card>, calendar-alarm-clock-card.js, etc.)"
DEFAULT_DASH=$(to_lowercase_dash "$DISPLAY_NAME")
echo ""
read -p "Enter lowercase-dash name [$DEFAULT_DASH]: " DASH_NAME
DASH_NAME=${DASH_NAME:-$DEFAULT_DASH}

print_success "Lowercase-dash name: $DASH_NAME"

# Step 3: Get the snake_case name
print_info "\nStep 3: Snake_Case Name"
echo "This is used for Python module names, integration domain, sensor names, etc."
echo "Example: 'calendar_alarm_clock'"
DEFAULT_SNAKE=$(to_snake_case "$DASH_NAME")
echo ""
read -p "Enter snake_case name [$DEFAULT_SNAKE]: " SNAKE_NAME
SNAKE_NAME=${SNAKE_NAME:-$DEFAULT_SNAKE}

print_success "Snake_case name: $SNAKE_NAME"

# Step 4: Construct GitHub URL
GITHUB_URL="https://github.com/luckydonald/hoass_${DASH_NAME}.git"
print_info "\nStep 4: GitHub Repository"
print_success "GitHub URL: $GITHUB_URL"

# Step 5: Ask about Python backend
print_info "\nStep 5: Python Backend"
read -p "Do you need a Python backend? (y/n) [y]: " NEED_BACKEND
NEED_BACKEND=${NEED_BACKEND:-y}

if [[ "$NEED_BACKEND" =~ ^[Yy]$ ]]; then
    print_success "Keeping Python backend files"
    KEEP_BACKEND=true
else
    print_warning "Python backend files will be removed"
    KEEP_BACKEND=false
fi

# Step 6: Ask about frontend choice
print_info "\nStep 6: Frontend Framework"
echo "Choose your frontend framework:"

# Check which frontend directories exist
HAS_VUE=false
HAS_PLAIN=false
[ -d "frontend_vue" ] && HAS_VUE=true
[ -d "frontend_plain" ] && HAS_PLAIN=true

if [ "$HAS_VUE" = true ]; then
    echo "  vue   - Vue.js framework (from frontend_vue/)"
fi
if [ "$HAS_PLAIN" = true ]; then
    echo "  plain - Plain HTML/JS/CSS (from frontend_plain/)"
fi

# Determine default based on what exists
if [ "$HAS_VUE" = true ]; then
    DEFAULT_FRONTEND="vue"
elif [ "$HAS_PLAIN" = true ]; then
    DEFAULT_FRONTEND="plain"
else
    print_error "No frontend directories found (frontend_vue/ or frontend_plain/)"
    exit 1
fi

echo ""
read -p "Enter frontend choice ($([ "$HAS_VUE" = true ] && echo -n "vue")$([ "$HAS_VUE" = true ] && [ "$HAS_PLAIN" = true ] && echo -n "/")$([ "$HAS_PLAIN" = true ] && echo -n "plain")) [$DEFAULT_FRONTEND]: " FRONTEND_CHOICE
FRONTEND_CHOICE=${FRONTEND_CHOICE:-$DEFAULT_FRONTEND}

# Validate choice
if [[ "$FRONTEND_CHOICE" == "vue" && "$HAS_VUE" = false ]]; then
    print_error "frontend_vue/ directory does not exist"
    exit 1
elif [[ "$FRONTEND_CHOICE" == "plain" && "$HAS_PLAIN" = false ]]; then
    print_error "frontend_plain/ directory does not exist"
    exit 1
elif [[ "$FRONTEND_CHOICE" != "vue" && "$FRONTEND_CHOICE" != "plain" ]]; then
    print_error "Invalid frontend choice. Must be 'vue' or 'plain'"
    exit 1
fi

print_success "Frontend choice: $FRONTEND_CHOICE"

# Summary
print_header "Configuration Summary"
echo "Display Name:     $DISPLAY_NAME"
echo "Lowercase-Dash:   $DASH_NAME"
echo "Snake_Case:       $SNAKE_NAME"
echo "GitHub URL:       $GITHUB_URL"
echo "Python Backend:   $KEEP_BACKEND"
echo "Frontend:         $FRONTEND_CHOICE"
echo ""
read -p "Proceed with initialization? (y/n) [y]: " CONFIRM
CONFIRM=${CONFIRM:-y}

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    print_warning "Initialization cancelled"
    exit 0
fi

print_header "Starting Initialization"


# Step 7: Remove Python backend if not needed
if [ "$KEEP_BACKEND" = false ]; then
    print_info "Removing Python backend files..."

    # Remove Python component files
    if [ -d "custom_components/template" ]; then
        rm -rf "custom_components/template"
        print_success "Removed custom_components/template/"
    fi

    # Remove pyproject.toml if it exists
    if [ -f "pyproject.toml" ]; then
        rm -f "pyproject.toml"
        print_success "Removed pyproject.toml"
    fi
fi

# Step 8: Handle frontend choice
print_info "Setting up frontend..."

if [ "$FRONTEND_CHOICE" = "vue" ]; then
    if [ -d "frontend_vue" ]; then
        # Remove frontend_plain if it exists
        [ -d "frontend_plain" ] && rm -rf "frontend_plain" && print_success "Removed frontend_plain/"

        # Rename frontend_vue to frontend
        mv "frontend_vue" "frontend"
        print_success "Renamed frontend_vue/ to frontend/"
    else
        print_error "frontend_vue/ directory not found!"
        exit 1
    fi
elif [ "$FRONTEND_CHOICE" = "plain" ]; then
    if [ -d "frontend_plain" ]; then
        # Remove frontend_vue if it exists
        [ -d "frontend_vue" ] && rm -rf "frontend_vue" && print_success "Removed frontend_vue/"

        # Rename frontend_plain to frontend
        mv "frontend_plain" "frontend"
        print_success "Renamed frontend_plain/ to frontend/"
    else
        print_error "frontend_plain/ directory not found!"
        exit 1
    fi
fi

# Generate PascalCase version for class names
PASCAL_NAME=$(to_pascal_case "$DISPLAY_NAME")

print_header "File Replacement Configuration"
print_info "The following replacements will be made:"
echo "  'template'        → '$SNAKE_NAME'"
echo "  'Template'        → '$PASCAL_NAME'"
echo "  'TEMPLATE'        → '$(echo $SNAKE_NAME | tr '[:lower:]' '[:upper:]')'"
echo "  'plugin-template' → '$DASH_NAME'"
echo "  'Plugin template' → '$DISPLAY_NAME'"
echo ""
print_warning "Ready to perform replacements in all files."
print_warning "This operation will modify files in place!"
echo ""
read -p "Continue with file replacements? (y/n) [y]: " CONTINUE
CONTINUE=${CONTINUE:-y}

if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
    print_warning "File replacements skipped. You can run them manually later."
    print_success "\nInitialization partially complete!"
    exit 0
fi

print_header "Performing File Replacements"

# Define the list of files to process
# Note: This is a hardcoded list to avoid replacing "template" in unintended places
FILES_TO_PROCESS=()

# Add root level files
[ -f "hacs.json" ] && FILES_TO_PROCESS+=("hacs.json")
[ -f "pyproject.toml" ] && FILES_TO_PROCESS+=("pyproject.toml")
[ -f "Makefile" ] && FILES_TO_PROCESS+=("Makefile")
[ -f "README.md" ] && FILES_TO_PROCESS+=("README.md")

# Add all files in custom_components/template/ (if backend is kept)
if [ "$KEEP_BACKEND" = true ] && [ -d "custom_components/template" ]; then
    # Add Python files
    while IFS= read -r -d '' file; do
        FILES_TO_PROCESS+=("$file")
    done < <(find custom_components/template -type f \( -name "*.py" -o -name "*.yaml" -o -name "*.json" \) -print0)
fi

# Add all relevant frontend files
if [ -d "frontend" ]; then
    # Add frontend files that typically contain plugin names
    [ -f "frontend/package.json" ] && FILES_TO_PROCESS+=("frontend/package.json")
    [ -f "frontend/index.html" ] && FILES_TO_PROCESS+=("frontend/index.html")
    [ -f "frontend/vite.config.ts" ] && FILES_TO_PROCESS+=("frontend/vite.config.ts")
    [ -f "frontend/README.md" ] && FILES_TO_PROCESS+=("frontend/README.md")

    # Add source files
    while IFS= read -r -d '' file; do
        FILES_TO_PROCESS+=("$file")
    done < <(find frontend/src -type f \( -name "*.ts" -o -name "*.vue" -o -name "*.js" \) 2>/dev/null -print0)
fi

# Function to replace text in a file
replace_in_file() {
    local file=$1

    if [ ! -f "$file" ]; then
        print_warning "File not found: $file (skipping)"
        return
    fi

    # Backup the file
    cp "$file" "$file.bak"

    # Perform replacements using sed
    # macOS sed requires '' after -i, Linux doesn't
    # IMPORTANT: Order matters! Replace more specific patterns first
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' \
            -e "s|https://github.com/luckydonald/hoass_template|${GITHUB_URL%.git}|g" \
            -e "s/hoass_calendar-alarm-clock/hoass_${DASH_NAME}/g" \
            -e "s/hoass_calendar_alarm_clock/hoass_${SNAKE_NAME}/g" \
            -e "s/hoass_template/hoass_${SNAKE_NAME}/g" \
            -e "s/calendar-alarm-clock-card/${DASH_NAME}-card/g" \
            -e "s/alarm-clock-card/${DASH_NAME}-card/g" \
            -e "s/calendar_alarm_clock/$SNAKE_NAME/g" \
            -e "s/calender-alarm-clock-card/${DASH_NAME}-card/g" \
            -e "s/plugin-template\.zip/${DASH_NAME}.zip/g" \
            -e "s/plugin-template/$DASH_NAME/g" \
            -e "s/Plugin template/$DISPLAY_NAME/g" \
            -e "s/AlarmClockCard/${PASCAL_NAME}Card/g" \
            -e "s/Alarm Clock Card/${DISPLAY_NAME} Card/g" \
            -e "s/Calendar Alarm Clock/$DISPLAY_NAME/g" \
            -e "s/TEMPLATE/$(echo $SNAKE_NAME | tr '[:lower:]' '[:upper:]')/g" \
            -e "s/Template/$PASCAL_NAME/g" \
            -e "s/\btemplate\b/$SNAKE_NAME/g" \
            "$file"
    else
        # Linux
        sed -i \
            -e "s|https://github.com/luckydonald/hoass_template|${GITHUB_URL%.git}|g" \
            -e "s/hoass_calendar-alarm-clock/hoass_${DASH_NAME}/g" \
            -e "s/hoass_calendar_alarm_clock/hoass_${SNAKE_NAME}/g" \
            -e "s/hoass_template/hoass_${SNAKE_NAME}/g" \
            -e "s/calendar-alarm-clock-card/${DASH_NAME}-card/g" \
            -e "s/alarm-clock-card/${DASH_NAME}-card/g" \
            -e "s/calendar_alarm_clock/$SNAKE_NAME/g" \
            -e "s/calender-alarm-clock-card/${DASH_NAME}-card/g" \
            -e "s/plugin-template\.zip/${DASH_NAME}.zip/g" \
            -e "s/plugin-template/$DASH_NAME/g" \
            -e "s/Plugin template/$DISPLAY_NAME/g" \
            -e "s/AlarmClockCard/${PASCAL_NAME}Card/g" \
            -e "s/Alarm Clock Card/${DISPLAY_NAME} Card/g" \
            -e "s/Calendar Alarm Clock/$DISPLAY_NAME/g" \
            -e "s/TEMPLATE/$(echo $SNAKE_NAME | tr '[:lower:]' '[:upper:]')/g" \
            -e "s/Template/$PASCAL_NAME/g" \
            -e "s/\btemplate\b/$SNAKE_NAME/g" \
            "$file"
    fi

    print_success "Processed: $file"
}

# Process each file
for file in "${FILES_TO_PROCESS[@]}"; do
    replace_in_file "$file"
done

# Rename the custom_components/template directory
if [ -d "custom_components/template" ]; then
    print_info "Renaming custom_components/template/ to custom_components/$SNAKE_NAME/"
    mv "custom_components/template" "custom_components/$SNAKE_NAME"
    print_success "Renamed directory"
fi

# Clean up backup files
print_info "Cleaning up backup files..."
find "$REPO_ROOT" -name "*.bak" -delete
print_success "Backup files removed"

print_header "Initialization Complete!"
echo ""
print_success "Your new Home Assistant plugin has been initialized!"
echo ""
echo "Summary:"
echo "  • Display Name: $DISPLAY_NAME"
echo "  • Domain: $SNAKE_NAME"
echo "  • Component: custom_components/$SNAKE_NAME/"
echo "  • Frontend: frontend/"
echo ""
print_info "Next steps:"
echo "  1. Review the changes made to the files"
echo "  2. Update README.md with your plugin details"
echo "  3. Update LICENSE if needed"
echo "  4. Start developing your plugin!"
echo ""
print_warning "Note: You may need to restart Home Assistant and clear browser cache"
echo ""

