# RAD streaming investigation fixture

This directory is a test-only fixture for the RAD streaming investigation branch.
It is intentionally small and is not a visual quality or performance benchmark.

## Files

- `tiny-splats.ply`
  - 64 synthetic 3DGS splats in binary little-endian PLY format.
  - SHA-256: `193d4f4ba1af12663827f644f7d0a7102bc5393e9925534febd91e4558e7acf9`
- `tiny-splats-lod.rad`
  - Generated from `tiny-splats.ply` with Spark `build-lod`.
  - SHA-256: `671af024c971e6d6080875651cc21f79b63d6c7a6efd7a6a1b53dcbc6bf00267`

## Spark Version

- npm package baseline: `@sparkjsdev/spark@2.0.0`
- source tag used for fixture generation: `v2.0.0`
- source commit observed at generation time: `ea56ee73f1ec015deac852998870e1dc80f21a7f`

## Regeneration

The RAD file should be regenerated from the checked-in PLY, not copied from an
external sample:

```powershell
git clone --depth 1 --branch v2.0.0 https://github.com/sparkjsdev/spark.git .local/spark-v2.0.0
Push-Location .local/spark-v2.0.0
cargo run --manifest-path rust/build-lod/Cargo.toml --release --no-default-features -- ..\..\test\fixtures\rad\tiny-splats.ply --quality --rad
Pop-Location
Get-FileHash -Algorithm SHA256 test\fixtures\rad\tiny-splats.ply, test\fixtures\rad\tiny-splats-lod.rad
```

`--no-default-features` only avoids compiling the optional GPU SH clustering
path. The fixture generation still uses Spark v2.0.0 `build-lod --quality
--rad`, producing a single-file RAD suitable for testing `blob:` URL Range
fetches.

The fixture exists to verify:

- `blob:` URL Range requests are partial reads in the browser.
- A stored-entry-equivalent Blob can be registered behind the app Service
  Worker and served with partial `Range` responses.
- Spark can read the RAD header when `fileType: SplatFileType.RAD` is explicit.
- `PagedSplats` can back a `SplatMesh` without materializing the whole file as
  `fileBytes`.
- Rendering can start and RAD chunk fetches can be observed from a stored ZIP
  entry equivalent Blob.
