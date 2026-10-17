# Buzo reference reconstruction request — blocked by service GPU allowance

Source: public/landing/assets/projects/068-buzo-21-night-v2.png
Destination: Tencent's public Hunyuan3D-2.1 demo, https://tencent-hunyuan3d-2-1.hf.space
Operation: /generation_all (geometry plus textures)
Parameters: 30 steps, guidance 5, seed 68, octree resolution 384, background removal enabled.

The initial upload was blocked by automatic approval review. The user subsequently explicitly approved proceeding. The approved client submitted the artwork and generation request, but the service rejected the GPU allocation before producing a model:

> The requested GPU duration (270s) is larger than the maximum allowed.

The service suggests Hugging Face PRO for longer GPU tasks. No generated model or texture output was returned; the live exhibit remains unchanged by this attempt. The API client is installed only in /tmp/buzo-3d-client.

The public demo source was checked after the failure: textured generation uses a fixed GPU reservation (180 seconds in the published source), while shape-only generation reserves 60 seconds. Lowering inference steps does not change that reservation. Shape-only output would not address the reference's textured materials and lighting, so it has not been substituted for the requested textured reconstruction. The deployed service reported 270 seconds, which differs from the published source reservation.

Next requirement: access to an account/service with sufficient generation allowance, or a generated textured GLB to inspect and integrate. No subscription or paid credits have been purchased.

Acceptance criteria before changing the live exhibit:
- Reference composition preserved: music stage left, glazed gallery center, lounge right, concierge/phone foreground.
- PBR textures loaded; no missing materials, melted major structures or unreadable focal objects.
- Inspect front, side and rear views. A single-image reconstruction is not guaranteed to infer hidden geometry accurately.
- Keep the current model until the reconstruction is visually superior.
- Optimize size and verify mobile rendering, pause, reduced motion and artwork switching.

The user's approval covers submitting this artwork to the named Tencent demo. It does not authorize publishing the asset or purchasing credits.
