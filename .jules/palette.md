## 2023-10-27 - Dynamically Generated Form Labels and Inputs

**Learning:** When injecting form HTML dynamically via JavaScript (e.g., in `js/form-asset.js`), developers often omit `id` and `for` attributes on inputs and labels for simplicity. However, screen readers absolutely rely on the explicit linkage between a `<label>` and its corresponding `<input>`/`<select>`/`<textarea>`. Without it, the form is entirely inaccessible. Furthermore, explicitly linking labels and inputs increases the click target area, improving the experience for all users, particularly those with motor control issues or on mobile devices.

**Action:** Whenever reviewing or creating dynamically injected form components, always verify that `for` attributes on labels match the `id` attributes on their corresponding inputs.
