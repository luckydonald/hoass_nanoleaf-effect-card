# Nanoleaf Effect Card

A custom Home Assistant card for controlling Nanoleaf light effects with style.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎨 **Visual Effect Selection**: Choose from your configured Nanoleaf effects
- 🔘 **Two Display Modes**: Dropdown or button grid layout
- 🌈 **Color Animation**: Effects can cycle through multiple colors
- 🎭 **Custom Icons**: Assign unique icons to each effect
- ⚡ **Quick Access**: Turn lights on/off with effect selection
- 📱 **Responsive Design**: Works in Entities cards and Tile card features
- 🖊️ **Visual Editor**: Built-in UI editor

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click on "Frontend"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL: `https://github.com/luckydonald/hoass_nanoleaf-effect-card`
6. Select category: "Dashboard"
7. Click "ADD"
8. Find "Nanoleaf Effect Card" and click "Install"
9. Restart Home Assistant

### Manual Installation

1. Download the `card.js` file from this repository
2. Copy it to your `config/www/` directory
3. Add the following to your Lovelace resources:
    ```yaml
    resources:
        - url: /local/card.js
          type: module
    ```
4. Restart Home Assistant

## Configuration

### Basic Configuration (Buttons Display)

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
          - name: 'Sunrise'
            icon: 'mdi:weather-sunset-up'
            colors:
                - '#FFA500'
                - '#FFFF00'
                - '#FF4500'
          - name: 'Party'
            icon: 'mdi:party-popper'
            colors:
                - '#FF0000'
                - '#00FF00'
                - '#0000FF'
```

### Dropdown Display

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: dropdown
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

### Advanced Configuration

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: buttons
button_style:
    inactive_color: '#CCCCCC' # Default color for inactive buttons
    icon: true # Show icons (default: true)
    name: true # Show effect names (default: true)
effects:
    - name: 'Rainbow'
      icon: 'mdi:looks'
      color: '#FF00FF'
      button_style: # Override button style for this effect
          inactive_color: '#AAAAAA'
    - name: 'Sunrise'
      icon: 'mdi:weather-sunset-up'
      colors:
          - '#FFA500'
          - '#FFFF00'
          - '#FF4500'
    - name: 'Party'
      icon: 'mdi:party-popper'
      colors:
          - '#FF0000'
          - '#00FF00'
          - '#0000FF'
    - name: 'Relax'
      icon: 'mdi:spa'
      colors:
          - '#ADD8E6'
          - '#90EE90'
          - '#FFB6C1'
    - name: 'Nightlight'
      icon: 'mdi:weather-night'
      colors:
          - '#00008B'
          - '#4B0082'
          - '#2F4F4F'
```

## Configuration Options

| Option                        | Type    | Required | Default   | Description                           |
| ----------------------------- | ------- | -------- | --------- | ------------------------------------- |
| `entity`                      | string  | Yes      | -         | The entity ID of your Nanoleaf light  |
| `display`                     | string  | No       | `buttons` | Display mode: `buttons` or `dropdown` |
| `button_style`                | object  | No       | -         | Global button style configuration     |
| `button_style.inactive_color` | string  | No       | `#CCCCCC` | Color for inactive buttons            |
| `button_style.icon`           | boolean | No       | `true`    | Show icons on buttons                 |
| `button_style.name`           | boolean | No       | `true`    | Show effect names on buttons          |
| `effects`                     | array   | Yes      | -         | List of effects to display            |

### Effect Configuration

Each effect in the `effects` array can have:

| Option         | Type   | Required | Description                                                           |
| -------------- | ------ | -------- | --------------------------------------------------------------------- |
| `name`         | string | Yes      | The effect name (must match an effect from the light's `effect_list`) |
| `icon`         | string | No       | MDI icon name (e.g., `mdi:looks`)                                     |
| `color`        | string | No       | Single color for the effect (hex format)                              |
| `colors`       | array  | No       | Multiple colors for gradient/animation (hex format)                   |
| `button_style` | object | No       | Override global button style for this effect                          |

## How It Works

1. **Effect Selection**: When you click a button or select from the dropdown, the card calls the `light.turn_on` service with the selected effect
2. **Turn Off**: The "Off" option calls the `light.turn_off` service
3. **Visual Feedback**: Active effects are highlighted and can show color animations
4. **Validation**: The card checks if the selected effect exists in the light's `effect_list` attribute

## Compatibility

-   Tested with Nanoleaf Shapes, Canvas, and Light Panels
-   Works with any Home Assistant light entity that has an `effect_list` attribute
-   Compatible with Home Assistant 2023.1 and later

## Finding Effect Names

To find the available effects for your Nanoleaf device:

1. Go to Developer Tools → States in Home Assistant
2. Find your Nanoleaf light entity (e.g., `light.nanoleaf_shapes`)
3. Look at the `effect_list` attribute - these are the effect names you can use

## Troubleshooting

### Card doesn't appear

-   Make sure the card is properly installed and the resource is added to Lovelace
-   Check the browser console for errors
-   Clear your browser cache

### Effects don't work

-   Verify the effect names match exactly with those in the `effect_list` attribute
-   Check that your Nanoleaf device is online and responding
-   Ensure your Home Assistant Nanoleaf integration is working properly

### Colors don't display correctly

-   Use hex color format (e.g., `#FF0000` for red)
-   Ensure the hex values are valid

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/luckydonald/hoass_nanoleaf-effect-card/issues) on GitHub.

## License

MIT License - see LICENSE file for details

## Credits

Inspired by the excellent `rgb-light-card` and other Home Assistant custom cards.
