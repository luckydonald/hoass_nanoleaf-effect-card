Create me a home assistant component, `nanolead-effect-card` which allows me to hit/choose a nanoleaf shapes effect.

The element is to be a dropdown menu in the frontend, and when an effect is selected, it should set that effect on the nanoleaf shapes device.

This custom component can be used in the Entities card, or as a feature in a Tile card.

After configuring the component, by selecting the entity and the effects to show in the dropdown, (the user should be able to select an effect from the dropdown menu (one of the nanoleaf lamp's state's (one in the shape's state `effect_list` (which is a list of string)), and then add an icon and color(s).

You can define how it's displayed, either as a simple dropdown or with a row of buttons (icons representing each effect.)
The icon would be displayed next to the effect name in the dropdown or on the button, and when active, cycle through the colors defined for that effect. Next to it is the effect name.
The dropdown also has the dropdown items as color-animated icon + name text, so the user can see a preview of the effect colors.
There's a "off" option to turn off the effect in the dropdown.

Here is an example configuration for the `nanolead-effect-card` component in Home Assistant. This configuration allows you to select from a list of predefined effects, each with its own icon and color scheme. When an effect is selected from the dropdown menu, that
effect should be applied to the nanoleaf shapes device.

```yaml
type: entities
show_header_toggle: false
entities:
    # Displays the light entity. It's optional
    - entity: light.example_hue_shapes

    # Card configuration starts here
    - type: 'custom:nanolead-effect-card'
      entity: light.example_hue_shapes
      display: buttons # Options: 'dropdown' or 'buttons' (default: 'buttons')
      button_style:
          inactive_color: '#CCCCCC' # = default if omitted
          icon: true # default: true
          name: true # default: true
      effects:
          - name: 'Rainbow'
            icon: 'mdi:looks'
            color: '#FF00FF'
            # you could overwrite the button_style for each button:
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
```

———————

For the demo.html, generate a polyfill for `<ha-icon icon="mdi:weather-sunset-up"></ha-icon>` and similar.

Just embed those dynamically - for that one the url would be:
`https://mdi.bessarabov.com/img/icon/w/e/weather-sunset-up.svg`. The /w/e/ are the first two characters of the icon name.

————————

Please put all summaries and such you wanna write for me into the `ai/` subfolder.

————————

Can you use the normal native entity picker? Probably `<ha-entity-picker id="input" allow-custom-entity add-button></ha-entity-picker>`
And a normal toggle instead of the display mode dropdown? So, <ha-formfield> and then <ha-radio>?

For effects there should be a sub editor to set those values natively, instead of with raw html (or yaml). Use this tag list like thing like the `hui-card-features-editor` does it where you can reorder, too.

In other words, use the <ha-sortable>, followed by a button.

—————

Please try to extract the editor as it's own file again, using

```
static async getConfigElement() {
   await import('./card-editor.js');
   return document.createElement('nanoleaf-effect-card-editor');
}
```

Also update the documentation for now having both `card.js` and `card-editor.js`:
The Markdown files.
And importantly, everything related to deployment and build pipelines, in docs, scripts and other files which just used `card.js` before.
