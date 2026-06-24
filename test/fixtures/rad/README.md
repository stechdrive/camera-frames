# RAD streaming smoke fixture

This directory is a test-only fixture for embedded RAD streaming smoke tests.
It is intentionally small and is not a visual quality or performance benchmark.

Current RAD behavior is specified in `docs/camera_frames_requirements.md` and
covered by project/RAD tests. This README only identifies the checked-in smoke
fixture files.

## Files

- `tiny-splats.ply`
  - 64 synthetic 3DGS splats in binary little-endian PLY format.
  - SHA-256: `193d4f4ba1af12663827f644f7d0a7102bc5393e9925534febd91e4558e7acf9`
- `tiny-splats-lod.rad`
  - Generated from `tiny-splats.ply` with Spark `build-lod`.
  - SHA-256: `671af024c971e6d6080875651cc21f79b63d6c7a6efd7a6a1b53dcbc6bf00267`

## Spark Version

- current repo dependency baseline: `@sparkjsdev/spark@2.1.0`
- source tag used for this fixture generation: `v2.0.0`
- source commit observed at generation time: `ea56ee73f1ec015deac852998870e1dc80f21a7f`

The fixture exists to verify:

- `blob:` URL Range requests are partial reads in the browser.
- A stored-entry-equivalent Blob can be registered behind the app Service
  Worker and served with partial `Range` responses.
- Spark can read the RAD header when `fileType: SplatFileType.RAD` is explicit.
- `PagedSplats` can back a `SplatMesh` without materializing the whole file as
  `fileBytes`.
- Rendering can start and RAD chunk fetches can be observed from a stored ZIP
  entry equivalent Blob.
