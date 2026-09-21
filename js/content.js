// Everything the page says lives here. Each entry is one column, left to right.
//
//   { "label": ..., "blocks": [...] }  an opening tab
//   { "format": ... }                  a decorative column showing a live moment.js value
//
// A block is { "text": ... } for a paragraph, or { "heading": ..., "text": ... } for a
// titled one. Add, remove or reorder entries freely - the layout follows the list.

var siteContent = {
    "tabs": [
        {
            "format": "DD.MM.YYYY"
        },
        {
            "label": "About Me",
            "blocks": [
                { "text": "I build things for the web. Mostly front-end work, and mostly the kind where how a thing feels to use matters as much as whether it works." },
                { "text": "This page is a small canvas experiment: twelve stars on a European blue, three labels falling between a date and a clock, and no framework anywhere in sight." }
            ]
        },
        {
            "label": "Projects",
            "blocks": [
                { "heading": "Nordklang", "text": "Describe Nordklang here - what it is, what you built, which year." },
                { "heading": "zerreisprobe.ch", "text": "Describe zerreisprobe.ch here - what it is, what you built, which year." }
            ]
        },
        {
            "label": "Contact",
            "blocks": [
                { "heading": "Email", "text": "amir@begic.eu" },
                { "heading": "Elsewhere", "text": "Add the profiles you want linked here - GitHub, LinkedIn, anything else." }
            ]
        },
        {
            "format": "HH:mm:ss"
        }
    ]
};
