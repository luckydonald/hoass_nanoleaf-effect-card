# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   **Visual editor now uses native Home Assistant components**:
    -   `ha-entity-picker` for entity selection with autocomplete
    -   `ha-formfield` with `ha-radio` for display mode selection
    -   `ha-switch` for toggle options
    -   `ha-icon-picker` for effect icon selection
    -   **`ha-sortable` for drag-and-drop effect reordering** ✨
    -   `ha-button` with icon for adding effects
    -   Full GUI effects editor with add/remove/reorder functionality
    -   Structured effect items with handle, content, and actions sections
    -   No YAML editing required for basic configuration
-   **Comprehensive documentation**:
    -   JSDoc comments added to all classes and methods
    -   ARCHITECTURE.md documenting two-file structure
    -   Updated all markdown files for two-file architecture
    -   Build pipeline documentation verified
    -   No YAML editing required for basic configuration

### Fixed

-   **HACS deployment now includes card-editor.js** - Removed `filename` field from hacs.json to deploy all JS files
-   HACS installation instructions now use correct "Dashboard" category instead of "Lovelace"

### Changed

-   **Replaced custom drag-and-drop with native `ha-sortable` component** (50% code reduction, improved reliability)
-   Improved effect item layout with visual separation of handle, content, and actions
-   **Extracted editor to separate file** (card-editor.js) with async dynamic import
-   Cleaner code organization with card and editor in separate files

### Added

-   Initial release of Nanoleaf Effect Card
-   Button display mode with customizable grid layout
-   Dropdown display mode for compact view
-   Support for single and multiple colors per effect
-   Color animation for active effects with multiple colors
-   Custom icons for each effect using MDI icons
-   "Off" button/option to turn off the light
-   Global and per-effect button styling options
-   Visual editor for basic configuration
-   Automatic contrast color calculation for button text
-   Support for use in Entities cards
-   Support for use as feature in Tile cards
-   HACS integration support
-   Comprehensive documentation and examples

### Features

-   Two display modes: buttons (grid) and dropdown
-   Customizable icons per effect (MDI icons)
-   Single or multi-color gradients per effect
-   Color cycling animation for active effects
-   Inactive button color customization
-   Show/hide icons and effect names
-   Responsive grid layout
-   Entity validation
-   Effect list validation
-   Visual feedback for active effects

## [0.0.0] - 2026-01-04

### Added

-   Project initialization
-   Basic project structure
-   Package configuration
-   HACS configuration
