# Nanoleaf Effect Card

Control your Nanoleaf lights with style using this custom Home Assistant card!

## Quick Start

After installation, add the card to your Lovelace dashboard:

```yaml
type: 'custom:nanoleaf-effect-card'
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
```

## Key Features

### 🎨 Two Display Modes

-   **Buttons**: Visual grid of effect buttons with icons and colors
-   **Dropdown**: Compact dropdown menu for space-saving

### 🌈 Rich Visual Feedback

-   Single or multi-color gradients per effect
-   Active effects show color cycling animation
-   Custom icons for each effect (MDI icons)
-   Automatic text contrast for readability

### ⚙️ Highly Customizable

-   Global button styling
-   Per-effect styling overrides
-   Show/hide icons and names
-   Custom inactive button colors

### 📱 Flexible Integration

-   Works in Entities cards
-   Works as Tile card features
-   Responsive grid layout
-   Works with any light entity that has `effect_list`

## Finding Your Effect Names

1. Go to **Developer Tools** → **States** in Home Assistant
2. Find your Nanoleaf light entity
3. Look at the `effect_list` attribute
4. Use those exact names in your configuration

## Example: Full Configuration

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: buttons
button_style:
    inactive_color: '#CCCCCC'
    icon: true
    name: true
effects:
    - name: 'Rainbow'
      icon: 'mdi:looks'
      colors:
          - '#FF0000'
          - '#FF7F00'
          - '#FFFF00'
          - '#00FF00'
          - '#0000FF'
          - '#4B0082'
          - '#9400D3'
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
```

## Tips & Tricks

### Icon Selection

Browse available icons at [Material Design Icons](https://pictogrammers.com/library/mdi/)

### Color Schemes

-   Use single `color` for solid effects
-   Use `colors` array for gradients and animations
-   Colors cycle when effect is active
-   Hex format required: `#RRGGBB`

### Layout Options

-   Button mode: Grid layout, ~3 buttons per row
-   Dropdown mode: Single row, minimal space
-   Icons and names can be toggled independently

### Performance

-   Animations use CSS, very lightweight
-   No polling, updates on state changes
-   Efficient rendering

## Troubleshooting

**Card doesn't appear?**

-   Clear browser cache
-   Check browser console for errors
-   Verify resource is added to Lovelace

**Effects don't work?**

-   Verify effect names match exactly
-   Check Nanoleaf integration is working
-   Check `effect_list` attribute

**Colors look wrong?**

-   Use hex format: `#RRGGBB`
-   Check contrast on your theme
-   Try adjusting `inactive_color`

## Support

-   [Report Issues](https://github.com/luckydonald/hoass_nanoleaf-effect-card/issues)
-   [Request Features](https://github.com/luckydonald/hoass_nanoleaf-effect-card/issues/new?template=feature_request.md)
-   [View Examples](https://github.com/luckydonald/hoass_nanoleaf-effect-card/blob/main/examples.md)

## Compatibility

-   Home Assistant 2023.1+
-   All modern browsers
-   Nanoleaf Shapes, Canvas, Light Panels
-   Any light with `effect_list` attribute

Enjoy your Nanoleaf lights! 🎨✨
