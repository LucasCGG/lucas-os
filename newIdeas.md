# Custom CMS for Quick text changes

---

**NOTE**
Perhaps also change content like color etc but this will be much more in future.

---

## Phase 0: Design your data shape

- [x] Decide on flat keys (`"about.name"`) vs nested (`about: { name }`) — pick one and commit
- [x] Decide whether fields carry metadata (`type`, `label`) or are just raw values
- [x] Hand-write a sample `en.json` for one section of your site
- [x] Sanity-check that the shape isn't annoying to type by hand

## Phase 1: Render from the file (no editing yet)

- [x] Put `en.json` in `public/` so it's served as a static asset, not bundled
- [x] `fetch()` the file when the app loads
- [ ] Render one part of your site from the fetched data instead of hardcoded text
- [ ] Decide what shows during the load gap (fallback text, spinner, or defaults)
- [ ] Prove the model: build → change `en.json` on disk → reload without rebuilding → confirm it changed

## Phase 2: Global state for content

- [x] Pick your state tool (Context = zero deps, Zustand = scales better and matches your stack)
- [x] Store the fetched content plus a loading flag
- [x] Expose a `useContent(id)` hook so components read one field cleanly

## Phase 3: Edit-mode toggle + selection

- [x] Add an `editing` boolean to your store
- [x] Add a button that toggles edit mode
- [x] Build a wrapper component that outlines + adds a click handler only when editing
- [ ] Confirm the wrapper renders children with zero visual change when editing is off
- [x] On click, set a `selectedId` in your store
- [x] Display `selectedId` somewhere to prove selection works before building the panel

## Phase 4: The edit panel

- [x] Build a panel that reads `selectedId` and looks up that field
- [x] Support text fields first — one input, updates the store on change
- [ ] Verify the full loop: click → edit → see it change on screen
- [x] Add number fields
- [x] Add list fields (add / remove / reorder)
- [ ] Add any custom types you need (timeline, image, etc.), one at a time

## Phase 5: Persistence + publish loop

- [ ] Write edits to `localStorage` so they survive refresh
- [ ] Internalize that localStorage is your local draft only — visitors never see it
- [x] Add an Export button that downloads the current content as `en.json`
- [ ] Establish your loop: edit visually → export → replace file on server → live
- [x] Add an Import button to load an `en.json` back in and preview before publishing

## Phase 6: Hardening (only once it works)

- [ ] Validate the fetched JSON (Zod) so a typo gives a clear error, not a broken section
- [ ] Hide the edit UI from visitors (dev-only gate is the simplest honest option)
- [ ] Handle host caching (short cache header or cache-busting query param) so changes don't look stale

## Cross-cutting habits

- [ ] Build strictly in phase order — don't build the panel before selection works
- [ ] Keep the app running and commit after every phase so you can pinpoint any break
- [ ] Design the data shape first, editor last — not the other way around
- [ ] Decide honestly: if you care more about _having_ a CMS than _building_ one, evaluate TinaCMS / Sanity / Payload instead

# Login Page

Not sure for what, tough it would look pretty cool if on starting the app we can decide to go to for example a /login page or so, and there enter usrname and pw to allow some kind of "admin" acces, for example this **CMS EDITING** tool.
