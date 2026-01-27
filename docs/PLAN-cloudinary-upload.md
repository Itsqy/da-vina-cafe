# PLAN: Cloudinary Drag & Drop Integration

This plan outlines the implementation of a modern, drag-and-drop image upload system for the Cafe Da Vina Admin Dashboard.

## 🛠 Prerequisites
- [ ] **Cloudinary Upload Preset**: User must create an "Unsigned" upload preset in the Cloudinary Dashboard (Settings > Upload > Upload Presets).
    - *Default recommendation name: `ml_default` or `cafe_vina_unsigned`*

## 🏗 Phase 1: Configuration & Environment
- [ ] Move Cloudinary credentials from `src/cloudinary_set` to `.env.local`.
- [ ] Add `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` to `.env.local`.
- [ ] Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to `.env.local`.

## 🎨 Phase 2: Reusable `ImageUpload` Component
Create a new component `src/components/ImageUpload.js`.
- [ ] **Features**:
    - [ ] Drag & Drop zone with hover states.
    - [ ] Click-to-select fallback.
    - [ ] Thumbnail preview once an image is selected/uploaded.
    - [ ] Upload progress indicator.
    - [ ] Success/Error states.
- [ ] **Logic**:
    - [ ] Uses `fetch` to Cloudinary's Unsigned API endpoint.
    - [ ] No transformations/cropping (uploads image "as is").
    - [ ] Returns the `secure_url` to the parent component.

## 🔗 Phase 3: Integration - Menu Management
Update `src/app/admin/menu/page.js`.
- [ ] Replace the "Image Path" text input in the Modal with the new `ImageUpload` component.
- [ ] Bind the uploaded URL to the `formData.image` state.
- [ ] Ensure existing images show up in the preview when editing.

## 🔗 Phase 4: Integration - Global Settings
Update `src/app/admin/settings/page.js`.
- [ ] Replace the "Hero Background Image Link" text input with the `ImageUpload` component.
- [ ] Bind the uploaded URL to the `settings.heroImage` state.

## 🧪 Phase 5: Verification & Cleanup
- [ ] Test upload in Menu Management (Add & Edit).
- [ ] Test upload in Global Settings.
- [ ] Verify links are correctly saved in Firestore.
- [ ] Remove temporary file `src/cloudinary_set`.

## 🚀 Deployment Notes
- Ensure the Cloudinary Cloud Name and Upload Preset are added to Vercel/Environment variables.
