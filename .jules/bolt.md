## 2023-10-25 - Scroll Event Layout Thrashing
**Learning:** Calling `getBoundingClientRect()` inside an unthrottled `scroll` event listener causes synchronous layout recalculation (layout thrashing) leading to severe scroll jank. This is especially bad when iterating over multiple sections and triggering DOM class updates on every single scroll tick.
**Action:** Always throttle or debounce high-frequency events like `scroll`. Use `requestAnimationFrame` to limit execution to the screen refresh rate, and only update the DOM when the state actually changes.
