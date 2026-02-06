

# Redesign Brand Registration Prompt

## Changes

### `src/components/BrandRegistrationPrompt.tsx`

**1. Remove Cancel button** -- Prevent dismissal by removing the Cancel button and disabling closing via overlay click or Escape key (`onOpenChange` will be blocked).

**2. Upgrade visual design** to a more premium, professional look:
- Larger icon area with a gradient background and subtle shadow
- Bolder typography with a compelling subtitle
- Styled benefit items with rounded pill backgrounds instead of plain text
- A full-width, larger "Register Now" CTA button with an arrow icon
- Subtle gradient accent line at the top of the card
- Update copy from "creators" to "influencers" to match recent renaming

### Technical Details

- Replace `AlertDialog` with a standard `Dialog` (since AlertDialog semantically implies a dismissible alert with cancel)
- Set `onOpenChange` to a no-op so clicking the overlay or pressing Escape does nothing -- user must register or refresh
- Remove the close (X) button by not rendering `DialogClose`
- Add `onPointerDownOutside` and `onEscapeKeyDown` with `preventDefault` on `DialogContent` to block dismissal

### Visual Structure

```
+---------------------------------------+
|  ~~~ gradient accent line ~~~         |
|                                       |
|         [gradient icon circle]        |
|                                       |
|      Register Your Brand              |
|  Connect with top influencers         |
|                                       |
|  [pill] Free registration             |
|  [pill] Takes less than 2 minutes     |
|  [pill] Direct access to influencers  |
|                                       |
|  [====== Register Now  ->  ========]  |
|                                       |
+---------------------------------------+
```

No Cancel button, no X button, no overlay dismiss.

