Markup_fmt Plugin

Adapter plugin that formats HTML, Vue, Svelte, Astro, Angular, Jinja, Twig, Nunjucks, Vento, Mustache, and XML files via markup_fmt.

Install and Setup

In your project's directory with a dprint.json file, run:

dprint config add g-plane/markup_fmt
This will update your config file to have an entry for the plugin. Then optionally specify a "markup" property (not "markup_fmt") to add configuration:

{
"markup": { // not "markup_fmt"
// markup_fmt config goes here
},
"plugins": [
"https://plugins.dprint.dev/g-plane/markup_fmt-v0.25.3.wasm"
]
}

Markup_fmt - Configuration

This information was auto generated from https://plugins.dprint.dev/g-plane/markup_fmt/latest/schema.json, which is available locally as `ai/references/dprint-markup_fmt/config-schema.json`.
