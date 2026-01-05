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
          color_display:
              full_background:
                  active: true
                  inactive: false
              small_bar:
                  active: false
                  inactive: true
              text:
                  active: false
                  inactive: false
              border:
                  active: false
                  inactive: false
              animated_icon:
                  active: true
                  inactive: false
      effects:
          - name: 'Rainbow'
            icon: 'mdi:looks'
            colors: ['#FF0000', '#FF7F00', '#FFFF00']
            button_style:
                color_display:
                    full_background:
                        active: true
                        inactive: false
                    small_bar:
                        active: false
                        inactive: true
                    text:
                        active: false
                        inactive: false
                    border:
                        active: false
                        inactive: false
                    animated_icon:
                        active: true
                        inactive: false
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

Prefer `yarn` commands for local development and testing over `npm`.

———————

For the demo.html, generate a polyfill for `<ha-icon icon="mdi:weather-sunset-up"></ha-icon>` and similar.

Just embed those dynamically - for that one the url would be:
`https://mdi.bessarabov.com/img/icon/w/e/weather-sunset-up.svg`. The /w/e/ are the first two characters of the icon name.

————————

Please put all summaries and such you wanna write for me into the `ai/` subfolder.

When starting to work, always as first step overwrite/update `ai/TODO.md` as follows:
Start with the `# IN PROGRESS` headline.
In line two of that, write a very short single line git-commit-ready summary of what you are doing, in a markdown quote beginning with the sparkle emoji (`> ✨ Update something`).
Below, a propper description of your current task in details, your thoughts and planning, and any necessary next steps.
That way continuation of the current objective in case of interruptions is possible.
Automatically edit that first line to `# DONE` once finished with the task, without asking for further confirmation.

For a new task, if the old task is marked done, you shall replace the `ai/TODO.md` with the new task following that template.

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
Make sure `card-editor.js` can be served by the webserver after installing. Check that it is in the release, build steps, hacs defintion, web server config or whatever needed. The previous `card.js` works fine.

—————

Somewhere in the file split to `card-editor.js`, the `card.js` element broke, it is no longer displaying anything.

—————

Fix the editor input not loading the existing config when editing an existing card.
(Only the Effects are loaded, the entity, display mode, and button style are not.)
Additionally, when typing in the effect-name-input it seems to reset the other fields, also it unfocuses the text input.
Probably because of re-rendering the whole input section on every change.
The icon also needs to be set twice to show up.

The "Add Effect" is not showing any label.

—————

Make the way the color(s) are displayed in the button configurable:

There should be the following styles:

-   "Full Background" (the whole button background shows the gradient)
-   "Small Bar" (a small color bar below the icon and name shows the gradient instead of the whole button background, like a rounded progress bar)
-   "Text" (Icon and text are in the gradient colors)
-   "Border" (The button border is in the gradient colors)
-   "Animated Icon" (have the icon cycles through colors instead of the whole button background)

For each of those styles, you can toggle "Active", "Inactive" and "Hover" (config: 3 booleans).
That'd be a component and file on it's own, i.e. `<nanoleaf-effect-button-style>` which toggles those booleans - having "Active", "Inactive" and "Hover" buttons,
styled similarly to a bootstrap button group, with the options next to each other, and toggling them on/off by clicking.

That way you can e.g. have the "Full Background" style only for the active effect, while inactive effects get the bar, border on hover and always the animated icon.
(add that to the example config yaml in `/README.md`, too)

Once I have the entity selected, please get the available status names from the light's state, where the `.effect_list` are the available choices (`string[]`). Autocomplete the effect names, but still allow "invalid" inputs. Mark those not in the list as invalid (yet you can save them - they can be edited in the nanoleaf app and change after all)

———————

Add a good unittest for the components, checking that the data flow works (init data is selected, clicking changes, data changes are reflected, etc.)
Add keyboard navigation tests, too.

————————

Don't forget to update the changelog, readme or whatever needed documentations when doing changes.
