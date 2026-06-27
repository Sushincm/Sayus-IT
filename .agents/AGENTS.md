# SAYUS Workspace Rules

## Bootstrap Utility Classes & CMS Compatibility

- **Rule**: If you need to add any Bootstrap styling classes (e.g. alignment, spacing, responsive utilities) to text elements (like `<p>`, `<h1>`, `<span>`, etc.) or other content containers, **do not** add them directly to the element itself.
- **Reasoning**: In the future, these content elements will be populated dynamically from a Content Management System (CMS). If styling classes are on the direct content tags, it can cause issues or duplicates when generating the markup dynamically.
- **Pattern**: Always wrap the content element in an outer `<div>` and apply the Bootstrap utility classes to that outer wrapper instead.
  
  *Incorrect*:
  ```html
  <p class="text-center fs-5 text-muted">Some CMS text</p>
  ```

  *Correct*:
  ```html
  <div class="text-center fs-5 text-muted">
    <p>Some CMS text</p>
  </div>
  ```
