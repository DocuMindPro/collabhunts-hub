

# Remove Fixed Counts from Package Includes

## Problem
The "What's Included (Standard Package)" section in the Post Opportunity dialog shows deliverables with specific counts (e.g., "1 Instagram Reel", "1-2 hour venue visit", "3 hours at venue"). This contradicts the flexible deliverables policy where exact quantities are finalized in agreements.

## Change: Update `includes` arrays in `src/config/packages.ts`

The `phases` sections were already updated to be count-free, but the `includes` arrays (which the opportunity dialog reads) were not. Here are the updates:

### Unbox and Review
| Before | After |
|--------|-------|
| Product shipped to creator | Product shipped to creator |
| 1 Instagram Reel or TikTok video | Social content (Reel, TikTok, or both) |
| Honest review with product highlights | Honest review with product highlights |
| Brand tagged in all posts | Brand tagged in all posts |

### Social Boost
| Before | After |
|--------|-------|
| 1-2 hour venue visit | Venue visit |
| 1 Instagram Reel (permanent) | Social content (Reels, TikToks, or both) |
| 1 TikTok video | Tag and location in all posts |
| Tag and location in all posts | Honest review with CTA |
| Honest review with CTA | *(remove duplicate line)* |

### Meet and Greet
| Before | After |
|--------|-------|
| 1-week pre-event promotion | Pre-event promotion |
| 3 hours at venue | Creator appearance at venue |
| Live fan interaction and photos | Live fan interaction and photos |
| Recap video | Recap content (Reels, TikToks, or both) |

## File to Modify
| File | Change |
|------|--------|
| `src/config/packages.ts` | Update `includes` arrays for unbox_review, social_boost, and meet_greet |

No UI component changes needed -- the dialog already reads from these arrays.

