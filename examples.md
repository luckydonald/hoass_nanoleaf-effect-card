# Example configurations for Nanoleaf Effect Card

## Basic Button Layout

```yaml
type: entities
show_header_toggle: false
entities:
  - entity: light.nanoleaf_shapes
  - type: 'custom:nanoleaf-effect-card'
    entity: light.nanoleaf_shapes
    display: buttons
    effects:
      - name: 'Rainbow'
        icon: 'mdi:rainbow'
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

## Dropdown Layout

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: dropdown
effects:
  - name: 'Rainbow'
    icon: 'mdi:rainbow'
    color: '#FF00FF'
  - name: 'Sunrise'
    icon: 'mdi:weather-sunset-up'
    colors:
      - '#FFA500'
      - '#FFFF00'
  - name: 'Party'
    icon: 'mdi:party-popper'
    colors:
      - '#FF0000'
      - '#00FF00'
      - '#0000FF'
```

## Complete Example with All Options

```yaml
type: entities
show_header_toggle: false
entities:
  - entity: light.nanoleaf_shapes
  - type: 'custom:nanoleaf-effect-card'
    entity: light.nanoleaf_shapes
    display: buttons
    button_style:
      inactive_color: '#CCCCCC'
      icon: true
      name: true
    effects:
      - name: 'Rainbow'
        icon: 'mdi:rainbow'
        color: '#FF00FF'
        button_style:
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
      - name: 'Ocean'
        icon: 'mdi:waves'
        colors:
          - '#006994'
          - '#0099CC'
          - '#66CCFF'
      - name: 'Forest'
        icon: 'mdi:tree'
        colors:
          - '#228B22'
          - '#32CD32'
          - '#90EE90'
      - name: 'Fire'
        icon: 'mdi:fire'
        colors:
          - '#FF4500'
          - '#FF6347'
          - '#FF8C00'
```

## Icon-Only Buttons

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: buttons
button_style:
  icon: true
  name: false
effects:
  - name: 'Rainbow'
    icon: 'mdi:rainbow'
    color: '#FF00FF'
  - name: 'Sunrise'
    icon: 'mdi:weather-sunset-up'
    colors:
      - '#FFA500'
      - '#FFFF00'
  - name: 'Party'
    icon: 'mdi:party-popper'
    colors:
      - '#FF0000'
      - '#00FF00'
      - '#0000FF'
```

## Text-Only Buttons

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: buttons
button_style:
  icon: false
  name: true
effects:
  - name: 'Rainbow'
    color: '#FF00FF'
  - name: 'Sunrise'
    colors:
      - '#FFA500'
      - '#FFFF00'
  - name: 'Party'
    colors:
      - '#FF0000'
      - '#00FF00'
      - '#0000FF'
```

## In a Tile Card (Feature Mode)

```yaml
type: tile
entity: light.nanoleaf_shapes
features:
  - type: 'custom:nanoleaf-effect-card'
    entity: light.nanoleaf_shapes
    display: dropdown
    effects:
      - name: 'Rainbow'
        icon: 'mdi:rainbow'
        color: '#FF00FF'
      - name: 'Sunrise'
        icon: 'mdi:weather-sunset-up'
        colors:
          - '#FFA500'
          - '#FFFF00'
```

## Multiple Nanoleaf Devices

```yaml
type: vertical-stack
cards:
  - type: entities
    title: Living Room Nanoleaf
    entities:
      - type: 'custom:nanoleaf-effect-card'
        entity: light.living_room_nanoleaf
        display: buttons
        effects:
          - name: 'Rainbow'
            icon: 'mdi:rainbow'
            color: '#FF00FF'
          - name: 'Party'
            icon: 'mdi:party-popper'
            colors:
              - '#FF0000'
              - '#00FF00'
              - '#0000FF'
  
  - type: entities
    title: Bedroom Nanoleaf
    entities:
      - type: 'custom:nanoleaf-effect-card'
        entity: light.bedroom_nanoleaf
        display: buttons
        effects:
          - name: 'Relax'
            icon: 'mdi:spa'
            colors:
              - '#ADD8E6'
              - '#90EE90'
          - name: 'Nightlight'
            icon: 'mdi:weather-night'
            colors:
              - '#00008B'
              - '#4B0082'
```

