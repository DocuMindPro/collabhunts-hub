

## Add AI Description Improvement + Make Description Required

Two changes to the **ServiceEditDialog** component:

### 1. Make Description Required (not optional)

- Change the label from "Description (optional)" to "Description"
- Add validation in `handleSave` to require a non-empty description before saving
- Show an error toast if description is empty: "Please add a description for your package"

### 2. Add "Improve with AI" Button

- Import and add the existing `AiBioSuggestions` component below the description textarea
- Pass `type="description"` and `label="description"` so the AI prompt is contextualized for package descriptions
- Wire `onSelect` to update the description state
- Pass the current description text so AI can improve it
- Set `minLength={10}` (lower threshold since package descriptions can be short)

### Technical Details

**File: `src/components/creator-dashboard/ServiceEditDialog.tsx`**

- Import `AiBioSuggestions` from `@/components/AiBioSuggestions`
- In the Description section (~line 282-293):
  - Change label text from `"Description (optional)"` to `"Description"`
  - Add `<AiBioSuggestions text={description} onSelect={setDescription} type="description" label="package description" minLength={10} />` after the Textarea
- In `handleSave` (~line 108), add validation:
  ```
  if (!description.trim()) {
    toast.error("Please add a description for your package");
    return;
  }
  ```
- Update the save data to use `description` directly instead of `description || null` (line 138)

No new components or dependencies needed -- this reuses the existing `AiBioSuggestions` component which already calls the `improve-bio` edge function.

