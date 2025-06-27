# AlfieAI Changelog

## v1.0.0 - 4/23/25

* Initial release of the AlfieAI Chat

## v1.1.0 - 4/29/25

* Sessions now incorporate chat history and context, meaning AlfieAI can remember what you talked
  about and continue a conversation with you
* Responses now sound more human-like and accessible
  * AlfieAI now prefers using bulleted lists to paragraphs
  * Markdown rendering is now supported
* The model's context window has been adjusted to provide more targeted responses
* Fixed the corrupted favicon

## v1.2.0 - 5/2/25

* Responses now render in chunks directly from the server as they're received rather than displaying all at once
  after they're fully received after the fact
* Content "generates in" with a typewriter effect rather than just appearing
* Chat response time has been reduced

## v2.0.0 - 6/9/25

* The AlfieAI People semantic search tool is now live! Check it out at [https://alfieai.fyi/people](https://alfieai.fyi/people).
* Fixed an issue with scroll bars showing on the chat page
* Added individual page titles and metadata
* Added customized metadata for search result pages

## v2.0.1 - 6/10/25

* Fixed a bug causing generation to stop partway through
* Added some minor speedups to the chat response time
* Increased the `/api/query` route timeout to 15 seconds

## v3.0.0 - 6/14/25

* AlfieAI has a new UI!
  * The entire website has been overhauled, and I think it finally feels "legit" now
  * Users can switch between AI tools in the top left on the navbar dropdown
  * The logo in the top right links back to the chat
  * The navbar also contains a link to the AlfieAI GitHub repo
  * The invisible barrier that hides scrolling chats behind the prompt box now has a glassmorphic
    blur effect on it, just for fun
  * Message bubbles have become cleaner, rounder, and more abstract
  * Dividers are displayed between message exchanges
* AlfieAI Chat
  * While there was never really a formal name for AlfieAI's "home" page, it's effectively going
    to be called "AlfieAI Chat" and will be denoted as such through the UI. Generally though,
    AlfieAI refers to the chat. It can also be used to describe the AlfieAI _platform_, including
    the additional tools.
  * I continue to try to make the chat responses faster, but we largely run into bottlenecks from the
    Gemini API itself (it's not fast, and raw responses from Google can take upwards of 8 seconds alone)
    and the Vercel server (I have 1 GB of RAM for the server, but having more would allow for potentially
    faster response times).
  * The send button now mirrors that of the people search
  * The chat UI has transitioned from a text-message style to a more professional style
  * Model responses now take up the full chat container and have more advanced Markdown styling. AlfieAI can now
    render:
    * Numbered lists (via `tailwind-topography`)
    * Tables (via `remark-gfm`)
    * Links (via `remark-gfm`)
    * Code (via `tailwind-topography`; not thoroughly tested, but it _is_ possible and I _have_ seen AlfieAI do it)
    * Footnotes (via `remark-gfm`)
    * Strikethrough (via `remark-gfm`)
    * Tables (via `remark-gfm`; when it tries to generate larger ones it struggles)
    * Checklists (via `remark-gfm`)
  * Increased the `/api/query` route timeout to 30 seconds, just to be safe
  * Users can now follow external links from the chat. They are prompted to confirm before following the link in a new tab
  * The chat container now auto-scrolls new prompts to the top of the screen and leaves space as AlfieAI generates content
  * When scrolling through conversation history, a "jump to bottom" button appears
  * The send button now correctly disables when the prompt box is empty
* AlfieAI People
  * The search button is now easier to click and the icon shouldn't prevent clicks anymore
  * Larger textareas now make it easier to focus them by clicking anywhere. This is helpful expecially
    on mobile
  * The search box no longer clears immediately after entering the search. Depending on the internet
    speed, the search box could clear before the results page loaded.
  * The search results no longer randomly fail to load
  * The acknowledgement is now displayed under the logo instead of on the search box
  * The logo styling is now more consistent between the search page and the results page
  * The logo shows up larger on mobile
* Models
  * I continue to tweak the parameters of the AlfieAI model to give users the best possible experience. The
    provided context has been tweaked slightly and the model temperature has been raised, making AlfieAI think
    deeper and respond more creatively. Accuracy is of course always a goal, but factual responses presented in
    a more human-like way is the dream.
  * The embedding microservice is now kept alive with a Google Cloud Scheduler `cron` job that pings the server
    every 10 minutes. I could configure the microservice to never scale down during downtime, but that would increase
    my server costs tremendously. Cloud Scheduler is bascially always free as ling as you're below the job threshold.
  * The semantic search index has been redesigned to be smaller, more accurate, and not return duplicates

## v3.0.1 - 6/14/25

* Fixed an issue where the input bar got hidden behind the bottom search bar on mobile Safari
* Replaced `role` with `data-role` on message `div`s to avoid confusing screen readers

## v3.0.2 - 6/26/25

* Updated some Tailwind Topography styles
  * Fixed link formatting in chat responses and updated colors to match appearance
  * Added formatting for blockquotes
  * Removed default quotes for blockquotes
* Sending a prompt now automatically collapses the keyboard on mobile
* Updated the site description
* Added Google Analytics
* Added and linked to legal policies
  * [Policy landing page](https://alfieai.fyi/policies)
  * [Privacy Policy](https://alfieai.fyi/policies/privacy)
  * [Terms of Service](https://alfieai.fyi/policies/terms)
  * [Cookie Policy](https://alfieai.fyi/policies/cookies)
  * [Disclaimers](https://alfieai.fyi/policies/disclaimers)
* Added a cookie consent banner
* Disabled the slow animation on the navigation dropdown
* Decreased the opacity of the navbar in dark mode
