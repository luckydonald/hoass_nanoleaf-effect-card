in the scripts/ folder, write me a script which would replace this template with a homeassistant plugin name.
Ask for a plugin name (e.g. "Calendar Alarm Clock") as input.
This is for names displayed in the UI.

calculate a lowercase-dash version, (i.e. "calendar-alarm-clock") which would be the default, but again ask the user.
This is for custom component names and filenames (i.e. `<calendar-alarm-clock-card>`, `calendar-alarm-clock-card.js` and `calendar-alarm-clock-editor.css`)

Then also convert that to real snake_case ("calendar_alarm_clock"); again as default and the possibility to change it for the user.
This will be for module names on the python side, integration domain and sensor names, etc.

Using the dashed-lowercase, construct the github repo `https://github.com/luckydonald/hoass_calendar-alarm-clock.git`, to input in plenty of files.

Then ask if we need a python backend, if not, remove the related files.

After that, ask for a frontend choice, either `vue` or `plain`, for which either the `frontend_vue` or `frontend_plain` folder is kept, and renamed as `frontend`.

Finally, (but do not add that yet!): 
the script shall replace all `template`, `Template` etc. with the given strings.
For that it shall go through a hardcoded list of files and replace the relevant parts. (this is because `template` might be a too common word in homeassistant.)

—————

please - in my local files - rename "template" to "plugin_template" (in all the cases needed. Also rename calendar_alarm_clock to plugin_template and all the other caseings similarly in the files directly, and adapt the script for that, so it's uniformly something which is easier to recognize.

Please additionally also remove code which might have been specific to the one I compied from - I only want a good starting point, so remove everything alarm-clock or calendar specific.

———————

Set up tests for the frontend and backend, with a few example tests.
