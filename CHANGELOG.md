# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

-   Visual editor now works correctly - bundled editor code directly into card.js to fix "setConfig is not a function" error
-   HACS installation instructions now use correct "Dashboard" category instead of "Lovelace"

### Changed

-   Editor code is now bundled in card.js instead of dynamically imported from card-editor.js
-   card-editor.js kept as reference file for development

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
