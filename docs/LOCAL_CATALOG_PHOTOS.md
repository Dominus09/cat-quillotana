# Local photo integration (disabled by default)

The build may index existing public/products/{barcode}.webp and generate a short content version for cache invalidation. Enable NEXT_PUBLIC_CATALOG_LOCAL_PHOTOS_ENABLED=1 only after QA. With the flag off the catalog remains unchanged.

- Use a verified file only when the API image is empty, a known placeholder, or the exact matching cat.quillotana.cl product path.
- Never replace a non-placeholder image for another path or barcode. Do not use fallback for a barcode shared by multiple visible variant IDs.
- No per-product network probing or download of the complete product image folder at runtime. The small filename/hash map is compiled into the frontend.
- After a confirmed ERP GitHub upload, the catalog must be rebuilt from the commit containing the photo. Check the actual variant and image URL after deployment. No automatic deployment triggered by this PR.
- Existing server-side catalog health endpoints still use database image_url; local UI missing-photo detection understands the local source. Do not change DB counts without a separate decision.
- QA: npm test; npm run build both with flag off and on; check a known existing file, a missing photo, a duplicate barcode, a non-placeholder external URL, and a replaced photo's cache version.
