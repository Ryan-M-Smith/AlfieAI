# AlfieAI Changelog

## v1.0.0 - 4/23/25

* Initial release of AlfieAI

## v1.1.0 - 4/29/25

* Chat sessions now incorporate chat history and context

* Responses now sound more human-like and accessible
  * AlfieAI now prefers using bulleted lists to paragraphs
  * Markdown editing is now preferred

* Adjusted the model's context window to give more targeted responses
* Fixed the corrupted favicon

## v1.2.0 - 5/2/25

* Responses now stream directly from the server rather than displaying them after the fact
* Content "generates in" rather than appearing
* Chat response time reduced

## v2.0.0 - 6/9/25

* The AlfieAI People semantic search tool is now live! Check it out at [https://alfieai.fyi/people](https://alfieai.fyi/people).
* Fixed an issue with scroll bars showing on the chat page
* Added individual page titles and metadata
* Added customized metadata for search result pages

## v2.0.1 - 6/10/25

* Fixed a bug causing generation to stop partway through
* Added some minor speedups to the chat response time

## v3.0.0 - 6/14/25

* AlfieAI has a new UI!
  * The chat page has been overhauled. Answers are now front and center, as well as a bigger
    prompt box
  * There's now a navbar that allows you to switch between site features
  * The logo in the top right links back to the chat

* AlfieAI Chat
  * While there was never really a formal name for AlfieAI's "home" page, it's effectively going
    to be called "AlfieAI Chat" and will be denoted as such through the UI. Generally though,
    AlfieAI refers to the chat. It can also be used to describe the AlfieAI _platform_, including
    the additional tools.
  * I continue to try to make the chat responses faster, but we largely run into bottlenecks from the
    Gemini API itself (it's not fast, and raw responses from Google can take upwards of 8 seconds alone)
    and the Vercel server (I have 1 GB of RAM for the server, but having more would allow for potentially
    faster response times).
  * The chat UI has transitioned from a text-message style to a more professional style
  * Model responses now take up the full chat container and have more advanced Markdown styling. AlfieAI can now
    render:
    * Numbered lists
    * Tables (via `remark-gfm`)
    * Links (via `remark-gfm`)
    * Code (not thoroughly tested, but it _is_ possible and I _have_ seen AlfieAI do it)
    * Footnotes (via `remark-gfm`)
    * Strikethrough (via `remark-gfm`)
    * Tables (via `remark-gfm`)
    * Tasklists (via `remark-gfm`)

* AlfieAI People
  * The search button is now easier to click and the icon shouldn't prevent clicks anymore
  * Larger textareas now make it easier to focus them by clicking anywhere. This is helpful expecially
    on mobile
  * The search box no longer clears immediately after entering the search. Depending on the internet
    speed, the search box could clear before the results page loaded.
  * The search results no longer randomly fail to load
  * The embedding microservice is now kept alive with a Google Cloud Scheduler `cron` job that pings the server
    every 10 minutes. I could configure the microservice to never scale down during downtime, but that would increase
    my server costs tremendously. Cloud Scheduler is bascially always free as ling as you're below the job threshold.
  * The acknowledgement is now displayed under the logo instead of on the search box
  * The logo styling is now more consistent between the search page and the results page
  * The logo shows up larger on mobile
