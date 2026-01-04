# Quick Start Guide

Get your Nanoleaf Effect Card up and running in minutes!

## Installation

### Via HACS (Recommended)

1. Open HACS in Home Assistant
2. Click on "Frontend"
3. Click the menu (⋮) in the top right
4. Select "Custom repositories"
5. Add: `https://github.com/luckydonald/hoass_nanoleaf-effect-card`
6. Category: "Dashboard"
7. Click "Install"
8. Restart Home Assistant

### Manual Installation

1. Download `card.js` and `card-editor.js` from the [latest release](https://github.com/luckydonald/hoass_nanoleaf-effect-card/releases)
2. Copy both files to `config/www/nanoleaf-effect-card.js` and `config/www/nanoleaf-effect-card-editor.js`
3. Add to Lovelace resources:
    ```yaml
    resources:
        - url: /local/nanoleaf-effect-card.js
          type: module
    ```
    Note: Only add `card.js` to resources. The editor is loaded automatically.
4. Restart Home Assistant

## Basic Setup

### Step 1: Find Your Effects

1. Go to **Developer Tools** → **States**
2. Search for your Nanoleaf entity (e.g., `light.nanoleaf_shapes`)
3. Look at the `effect_list` attribute
4. Note down the effect names you want to use

### Step 2: Add the Card

1. Edit your dashboard
2. Add a new card (manual YAML mode)
3. Paste this configuration:

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.YOUR_NANOLEAF_ENTITY
display: buttons
effects:
    - name: 'Rainbow'
      icon: 'mdi:looks'
      color: '#FF00FF'
    - name: 'Sunrise'
      icon: 'mdi:weather-sunset-up'
      colors:
          - '#FFA500'
          - '#FFFF00'
```

4. Replace:
    - `YOUR_NANOLEAF_ENTITY` with your actual entity ID
    - Effect names with your actual effect names from Step 1
5. Save the card

### Step 3: Customize (Optional)

Choose icons from [Material Design Icons](https://pictogrammers.com/library/mdi/):

```yaml
effects:
    - name: 'Your Effect Name'
      icon: 'mdi:icon-name'
      colors:
          - '#COLOR1'
          - '#COLOR2'
          - '#COLOR3'
```

## Common Configurations

### Simple 3-Effect Setup

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: buttons
effects:
    - name: 'Rainbow'
      icon: 'mdi:looks'
      color: '#FF00FF'
    - name: 'Party'
      icon: 'mdi:party-popper'
      colors: ['#FF0000', '#00FF00', '#0000FF']
    - name: 'Relax'
      icon: 'mdi:spa'
      colors: ['#ADD8E6', '#90EE90']
```

### Dropdown Mode (Space Saving)

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: dropdown
effects:
    - name: 'Rainbow'
    - name: 'Party'
    - name: 'Relax'
```

### Inside an Entities Card

```yaml
type: entities
entities:
    - entity: light.nanoleaf_shapes
    - type: 'custom:nanoleaf-effect-card'
      entity: light.nanoleaf_shapes
      display: buttons
      effects:
          - name: 'Rainbow'
            icon: 'mdi:looks'
            color: '#FF00FF'
```

## Troubleshooting

### Card doesn't show up

1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console for errors (F12)
3. Verify both `card.js` and `card-editor.js` were copied correctly
4. Verify the resource was added correctly (only `card.js` in resources)
5. Make sure you restarted Home Assistant
6. Check that card.js contains both the card code and the dynamic import

### Effects don't activate

1. Verify effect names **exactly match** your device's `effect_list`
2. Check your Nanoleaf integration is working
3. Try controlling the light manually first
4. Check Home Assistant logs

### Colors look wrong

-   Use hex format: `#RRGGBB` (6 characters)
-   Colors are for visual representation only
-   Actual effect colors come from your Nanoleaf device

## Next Steps

-   [View more examples](examples.md)
-   [Read full documentation](README.md)
-   [Customize button styles](README.md#advanced-configuration)
-   [Report issues](https://github.com/luckydonald/hoass_nanoleaf-effect-card/issues)

## Getting Help

If you run into issues:

1. Check the [README](README.md) for detailed documentation
2. Search [existing issues](https://github.com/luckydonald/hoass_nanoleaf-effect-card/issues)
3. Create a [new issue](https://github.com/luckydonald/hoass_nanoleaf-effect-card/issues/new) with:
    - Your configuration
    - Console errors
    - Home Assistant version
    - Screenshots

Enjoy! 🎨
