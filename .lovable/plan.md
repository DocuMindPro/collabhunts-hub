

# Remove Event Type Buttons, Keep Stats & Trust Banners

## What Changes

Remove the "Quick Event Types" row of buttons (Unbox & Review, Social Boost, Meet & Greet, Brand Activation, Custom Experience) from the hero section. The animated stats (100% Vetted Creators, $0 Transaction Fees, VIP Creator Options) and trust banners will move up into that space, reducing clutter.

## Details

**`src/pages/Index.tsx`**:
- Delete lines 196-215 (the entire "Quick Event Types" `AnimatedSection` block)
- Update the delay on "Animated Stats" from 400 to 300 (taking the slot of the removed section)
- Update the delay on "Trust Banner" from 500 to 400
- The `eventTypes` array (line 130-132) can also be removed as it's no longer used

No other files affected. The stats and trust banners remain exactly as they are, just appearing higher up after the search bar.

