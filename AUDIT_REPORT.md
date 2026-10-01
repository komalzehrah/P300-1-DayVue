# DayVue Frontend Audit

**Date:** 2026-09-30  
**Scope:** Accessibility, performance, theming, responsive behavior, and visual-design anti-patterns. This is an audit only; no application code was changed.

**Method:** Reviewed the project brief and source, ran `npm run type-check` and `npm run build-only`, checked the four main routes at a 390px viewport, and calculated contrast for the actual light-theme chart colors. No project-local `frontend-design` skill/reference files or automated accessibility tool were available, so the supplied audit criteria were applied manually. Findings are verified to the level stated; keyboard and assistive-technology behavior still needs dedicated testing.

## Anti-Patterns Verdict

**Partial pass — 7/10 (heuristic, not a user study).** The product has a recognizable purpose, distinctive Syne/Outfit typography, responsive layouts, and a restrained teal/peach/pale-yellow interface. It avoids gradients, glassmorphism, decorative blur, and generic system typography. The Recap still uses a conventional row of KPI cards followed by similarly framed chart panels; that pattern is understandable for dense progress data but is the most template-like area. The light chart palette is vivid and recognizable, though two colors need more contrast against the chart surface.

## Executive Summary

- **Critical:** 0
- **High:** 5
- **Medium:** 7
- **Low:** 4
- **Total:** 16

The most important risks are inaccessible overlay and schedule-event interactions, the unlabeled Settings toggle, Recap metrics that do not respond to live entries, and user data disappearing on refresh. The app builds and type-checks successfully. All four main routes had no horizontal overflow at 390px in the browser check.

## High-Severity Findings

### H1. Overlay interactions lack dialog/focus behavior
**Location:** [AddItemModal.vue](src/components/AddItemModal.vue), [DatePickerHeader.vue](src/components/DatePickerHeader.vue), [DashboardDateRangePicker.vue](src/components/DashboardDateRangePicker.vue), [SettingsDrawer.vue](src/components/SettingsDrawer.vue)  
**Category:** Accessibility  
**Description:** The add/edit modal, custom date picker popovers, and Settings drawer are visually overlaid but are not exposed as dialogs. They do not move or contain focus, restore focus on close, or close on Escape. The backdrop blocks pointer interaction but does not make background content inert.  
**Impact:** Keyboard and screen-reader users can lose context or continue tabbing through obscured content.  
**Standard:** WCAG 2.1.1, 2.4.3, 4.1.2; modal dialog pattern.  
**Recommendation:** Use dialog semantics (`role="dialog"`, `aria-modal="true"` where appropriate), manage initial/return focus, support Escape, and prevent background interaction while truly modal. Treat date pickers as non-modal popovers only if the background remains intentionally usable.  
**Suggested follow-up:** `/harden`

### H2. Schedule event blocks are not keyboard-operable buttons
**Location:** [SchedulePage.vue](src/views/SchedulePage.vue), daily `.schedule-item` element  
**Category:** Accessibility  
**Description:** The event block is a `div` with `role="button"` and `tabindex="0"`, but only has a click handler; Enter and Space do not open the editor.  
**Impact:** Keyboard users can focus an event but cannot activate it.  
**Standard:** WCAG 2.1.1 Keyboard; 4.1.2 Name, Role, Value.  
**Recommendation:** Render a native button with the existing event layout, or implement Enter/Space activation and prevent Space scrolling.

### H3. Dark Mode toggle has no accessible name or visible keyboard focus
**Location:** [SettingsDrawer.vue](src/components/SettingsDrawer.vue), `.setting-item` and `.toggle-switch`  
**Category:** Accessibility  
**Description:** “Dark Mode” is a sibling of the `<label>` that contains the checkbox, rather than being associated with the input. The checkbox is visually hidden at zero width/height and no focus-visible treatment is applied to the switch. The browser accessibility snapshot exposed it as an unnamed checked checkbox.  
**Impact:** Screen-reader users may hear only “checkbox, checked,” and keyboard users may not see which control has focus.  
**Standard:** WCAG 1.3.1, 2.4.7, 4.1.2.  
**Recommendation:** Associate the text with the input via `id`/`for` or `aria-labelledby`; provide a visible `:focus-visible` style on the slider/label.

### H4. Recap’s core metrics and charts ignore live entries
**Location:** [DashboardPage.vue](src/views/DashboardPage.vue) and [MainLayout.vue](src/layouts/MainLayout.vue)  
**Category:** Functionality / data integrity  
**Description:** The Recap imports `metrics.json` and derives its summary cards and chart datasets from that static data. MainLayout separately owns reactive `scheduleItems`, `tasks`, and `habits`; only the Highlights pattern calculations inject those live arrays.  
**Impact:** Adding, editing, completing, or logging items does not update the main Recap metrics/charts, so the dashboard can disagree with the user’s current data.  
**Recommendation:** Build the Recap aggregates from the shared live collections, or clearly distinguish historical seeded metrics from live entries and merge both sources consistently.  
**Suggested follow-up:** `/normalize`

### H5. User-created data is memory-only
**Location:** [MainLayout.vue](src/layouts/MainLayout.vue), reactive collection initialization  
**Category:** Functionality / data integrity  
**Description:** Tasks, habits, and schedule entries initialize from sample arrays in memory; no local storage, IndexedDB, or backend persistence was found.  
**Impact:** User additions, edits, completions, and logs are lost when the page reloads.  
**Recommendation:** Add a persistence layer before treating this as a usable personal planner. Define versioning/migration and handle storage errors.  
**Suggested follow-up:** `/harden`

## Medium-Severity Findings

### M1. Some light-theme chart categories fail non-text contrast
**Location:** [DashboardPage.vue](src/views/DashboardPage.vue), `categoryColors`; [theme.css](src/assets/theme.css), light panel surface  
**Category:** Accessibility / theming  
**Description:** Against the actual light chart panel background (`#f5f5f5`), the Health orange (`#f17418`) measures **2.66:1**, and the Family yellow (`#c6d608`) measures **1.48:1**. The blue, purple, and pink palette entries measure 3.20:1 or better.  
**Impact:** The orange/yellow segments can blend into the panel, making category proportions difficult to distinguish.  
**Standard:** WCAG 1.4.11 Non-text Contrast (3:1 for meaningful graphical objects).  
**Recommendation:** Darken those two light-theme series or add a sufficiently contrasting outline/pattern; retain text labels so color is not the only key.

### M2. Canvas charts lack equivalent data descriptions
**Location:** [DashboardPage.vue](src/views/DashboardPage.vue), `<Bar>` and `<Line>` canvases  
**Category:** Accessibility  
**Description:** The charts render as unnamed images in the accessibility tree. The visual legends identify series but do not expose the plotted values or trends to assistive technology.  
**Impact:** Screen-reader users cannot access the principal chart data.  
**Recommendation:** Provide concise chart summaries and an accessible data table or equivalent textual representation, synchronized with date range and view.

### M3. Recap date range is fixed to the seeded period
**Location:** [DashboardDateRangePicker.vue](src/components/DashboardDateRangePicker.vue), `minDate`/`maxDate` and quick ranges  
**Category:** Functionality / responsive data model  
**Description:** Selection is hard-limited to 2026-03-01 through 2026-07-31, while new schedule/task/habit inputs can use other dates. “Last 12 months” is silently clipped to the five-month sample range.  
**Impact:** Users cannot inspect newly entered periods or get the time span named by a preset.  
**Recommendation:** Derive limits from available live and historical data, or label unavailable ranges and explain that the dataset is limited.

### M4. Several frequent controls are smaller than the recommended 44px target
**Location:** [TasksPage.vue](src/views/TasksPage.vue), `.task-toggle`/`.task-chip`; [DashboardPage.vue](src/views/DashboardPage.vue), `.view-switch`; [SchedulePage.vue](src/views/SchedulePage.vue), calendar controls; [DatePickerHeader.vue](src/components/DatePickerHeader.vue)  
**Category:** Accessibility / responsive interaction  
**Description:** Task completion is 24×24px, chips are 24px high, chart view buttons are 26px high, and calendar dates are about 30px. These are below the supplied 44px touch-target guideline. Most meet WCAG 2.5.8’s 24px minimum, so this is a usability recommendation rather than a confirmed AA failure.  
**Impact:** Repeated taps are harder for users with motor or attention constraints, especially on small screens.  
**Recommendation:** Enlarge the hit area without enlarging the visual mark; preserve spacing between adjacent controls.

### M5. Reduced-motion support is incomplete
**Location:** [AddItemModal.vue](src/components/AddItemModal.vue), [SettingsDrawer.vue](src/components/SettingsDrawer.vue), [TabNavigation.vue](src/components/TabNavigation.vue), [Toolbar.vue](src/components/Toolbar.vue)  
**Category:** Accessibility / motion  
**Description:** Task/habit check feedback honors `prefers-reduced-motion`, but the modal and drawer entrance animations and several button/tab transitions do not.  
**Impact:** Users requesting reduced motion still receive nonessential movement.  
**Recommendation:** Add a shared reduced-motion override for nonessential transforms and entrance animations while preserving state feedback.

### M6. Date inputs force dark native controls in light mode
**Location:** [DashboardDateRangePicker.vue](src/components/DashboardDateRangePicker.vue), `.date-fields input`  
**Category:** Theming  
**Description:** `color-scheme: dark` is unconditional on the range’s native date inputs.  
**Impact:** Browser-provided date controls may retain dark styling against the light theme.  
**Recommendation:** Use `color-scheme: light dark` or a theme-specific rule and verify in Safari/Firefox as well as Chromium.

### M7. Current navigation page state is visual only
**Location:** [TabNavigation.vue](src/components/TabNavigation.vue), `.tab`  
**Category:** Accessibility  
**Description:** The selected route receives an `.active` class but no `aria-current` or pressed state.  
**Impact:** Screen-reader users can navigate pages without being told which page is current.  
**Recommendation:** Expose current-page state with `aria-current="page"` or an appropriate tab pattern and role/state.

## Low-Severity Findings

### L1. Potentially unnecessary UI dependencies/styles
**Location:** [main.ts](src/main.ts), [vite.config.ts](vite.config.ts), [package.json](package.json)  
**Category:** Performance / maintenance  
**Description:** Vuetify styles, plugin, and app instance are loaded, but source search found no Vuetify components. `@phosphor-icons/vue` is declared but has no source imports. The current production bundle is about **249KB CSS (37KB gzip)** and **408KB JavaScript (139KB gzip)**.  
**Impact:** Avoidable CSS, initialization, or dependency maintenance may be included.  
**Recommendation:** Confirm these packages are intentional, then remove unused integrations or adopt their components consistently. Profile after removal rather than assuming all bundle size comes from them.  
**Suggested follow-up:** `/optimize`

### L2. Dead imports/computed state
**Location:** [App.vue](src/App.vue), [TabNavigation.vue](src/components/TabNavigation.vue)  
**Category:** Maintainability  
**Description:** `ref`, `computed`, `useRouter`, and `currentRoute` are unused in App; `Squares2X2Icon` is unused in TabNavigation.  
**Impact:** Adds noise and can hide meaningful dependencies.  
**Recommendation:** Remove dead imports and state during a cleanup pass.

### L3. Remaining pure black/white and local color literals
**Location:** [theme.css](src/assets/theme.css), [DashboardPage.vue](src/views/DashboardPage.vue), component styles  
**Category:** Visual consistency  
**Description:** Theme tokens and selected states still use pure `#fff`/`#000`, while chart palettes and several component colors are maintained locally. Contrast is generally strong, but this diverges from the supplied tinted-neutral and token-first guidance.  
**Impact:** Future palette adjustments can drift between chart, component, and theme colors.  
**Recommendation:** Prefer tinted text/background tokens and centralize intentionally shared semantic chart colors; retain local colors only when they represent data categories.

### L4. No automated lint, unit, or accessibility scripts
**Location:** [package.json](package.json)  
**Category:** Quality process  
**Description:** Available checks are type-check and production build; no test, lint, or automated a11y script is configured.  
**Impact:** Semantic, keyboard, and data-aggregation regressions are not caught automatically.  
**Recommendation:** Add focused tests for Recap aggregation and keyboard activation, plus an automated accessibility scan to CI.

## Patterns & Systemic Issues

- Modal-like overlays are implemented independently and repeat missing dialog/focus behavior.
- Several interactive controls expose styling but not complete semantic state; schedule events are the clearest example.
- Recap mixes static historical JSON with reactive live state, so the same page has two sources of truth.
- Light mode has strong text contrast but some chart fills do not contrast sufficiently with their plot background.
- Mobile page widths are well-contained; all four routes measured 390px wide without horizontal document overflow.

## Positive Findings

- The Syne/Outfit pairing is distinctive and matches the brief; both fonts load in the browser.
- Theme tokens centralize the main palette, and dark/light body backgrounds switch correctly.
- Task/habit completion controls expose state and have visible focus styles; their short check animations respect reduced motion.
- Date inputs have labels, range endpoints have accessible date names, and chart view buttons expose `aria-pressed`.
- Type-check and production build both pass; mobile overflow checks pass on Schedule, Tasks, Habits, and Recap.
- Schedule and habit layouts adapt to mobile; habit logging has a 44px hit target.

## Recommendations by Priority

1. **Immediate:** Add names/states, keyboard activation, and dialog/focus behavior to the Settings toggle, schedule events, and overlay flows.
2. **Short-term:** Make Recap summaries/charts aggregate reactive live collections; add persistence for user-entered data.
3. **Short-term:** Improve light chart-segment contrast and provide accessible chart summaries/data tables.
4. **Medium-term:** Resolve date-range limits/preset semantics, increase frequently used mobile hit areas, and add reduced-motion handling to remaining overlays.
5. **Long-term:** Audit dependency usage, remove dead imports, and add lint/unit/a11y checks to the project scripts/CI.

## Suggested Follow-up Commands

These are conceptual follow-up labels from the supplied guidance; they are not scripts currently defined in `package.json`:

- `/harden` — dialogs, focus management, keyboard behavior, Settings toggle labeling, persistence.
- `/normalize` — live Recap data flow, date-range semantics, theme/chart contrast consistency.
- `/optimize` — inspect Vuetify/Phosphor usage and profile bundle impact.
