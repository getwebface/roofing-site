## 2026-05-15 - FAQ Accordion Accessibility
**Learning:** The FAQ accordion components lacked the `aria-controls` attribute, which is critical for screen readers to understand the relationship between the trigger button and the expanding content.
**Action:** Always ensure that when using `aria-expanded` on a button, it is paired with an `aria-controls` attribute pointing to the ID of the collapsible content element to provide full context for screen reader users.
