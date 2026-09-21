// Everything the page says lives here. Each entry is one column, left to right.
//
//   { "label": ..., "blocks": [...] }  an opening tab
//   { "format": ... }                  a decorative column showing a live moment.js value
//
// Add "link" to a block to make it clickable - it marks the heading when the block has
// one, otherwise the text. Linked copy is underlined and shows a pointer cursor. HTML
// tags do nothing here: the copy is painted onto a canvas, not put into the page.
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
                { "text": "Hi, I am Amir, a software architect from St. Gallen, Switzerland. Most of my career has been spent in agencies, which teaches you quickly that the best architecture is the one a client can afford, a team can actually build, and a business can still live with once the project is over." },
                { "text": "Much of my work sits at the interface between technology, sales and team leadership: working out what is genuinely possible, making the case for it, and then making sure the people building it have what they need. Translating between those three is most of the job." },
                { "text": "Away from that I DJ as Bon Ajvar, which is either a complete change of pace or the same job with different tools, depending on the night." },
                { "text": "begic.ch was already taken, so .eu it was - and once you own a European domain, twelve stars more or less draw themselves. The rest is a small canvas experiment: three labels falling between a date and a clock, and no framework anywhere in sight." },
                { "text": "It does mean this is not the most machine-readable page on the internet. A crawler turns up, finds one empty canvas element and goes home. But I built it for humans, and they seem to manage." }
            ]
        },
        {
            "label": "Projects",
            "blocks": [
                { "heading": "Nordklang", "link": "https://nordklang.ch", "text": "Festival and association website, running since 2020. Craft/PHP/CS/JSS" },
                { "heading": "Zerreisprobe", "link": "https://zerreissprobe.ch", "text": "One-pager on the drama around the FCSG leadership after the 2026 cup win. Plain HTML/JS/Claude" },
                { "heading": "Bon Ajvar", "link": "https://bonajvar.eu", "text": "Site for my DJ project Bon Ajvar. React/Next.js/Vercel" }
            ]
        },
        {
            "label": "Contact",
            "blocks": [
                { "heading": "amir@begic.eu", "link": "mailto:amir@begic.eu" },
                { "heading": "Linkedin", "link": "https://www.linkedin.com/in/amir-begi%C4%87-7003751a3/"},
                { "heading": "GitHub", "link": "https://github.com/amir-begic/" }
             ]
        },
        {
            "format": "HH:mm:ss"
        }
    ]
};
