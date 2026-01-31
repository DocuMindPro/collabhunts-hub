

# Add Entry-Level "Product Review" Package

## Overview
Create a new first-tier package for brands who want to send products to creators for at-home reviews. This is the simplest, most accessible package - no venue visit required, just ship the product and get authentic social media content.

## Package Name Options

| Name | Why It Works |
|------|--------------|
| **Unbox & Review** | Clear action words - creator unboxes and reviews the product |
| **Product Spotlight** | Emphasizes the product is the star of the content |
| **Send & Share** | Simple - brand sends, creator shares |
| **Home Review** | Direct - review happens at creator's home |

**Recommendation: "Unbox & Review"** - It's catchy, describes the action, and feels approachable for an entry-level package.

## Package Details

### Description
*"Send your product to a creator for an authentic unboxing and review from the comfort of their home"*

### What's Included
- Product shipped to creator
- 1 Instagram Reel or TikTok video (unboxing/review)
- 2-3 Instagram Stories showing the product
- Honest review with product highlights
- Tag brand account in all posts
- Link in bio (if applicable)

### Phases Structure

| Phase | Items |
|-------|-------|
| **Product Delivery** | Brand ships product to creator, Creator confirms receipt |
| **Content Creation** | Unboxing video recorded at home, Product review/demonstration, Highlights key features |
| **Content Posted** | 1 Reel/TikTok (permanent), 2-3 Stories, Brand tagged in all posts |

### Ideal For
- E-commerce brands
- New product launches
- Small businesses
- Beauty & skincare products
- Tech gadgets
- Fashion items

### Pricing
Custom pricing (like other packages) - depends on creator rates

### Duration
No fixed duration (null) - content delivery typically within 3-7 days after receiving product

## Technical Implementation

### File: `src/config/packages.ts`

| Change | Details |
|--------|---------|
| Update `PackageType` | Add `'unbox_review'` to the union type |
| Add new package entry | Insert `unbox_review` object before `social_boost` in `EVENT_PACKAGES` |
| Update `PACKAGE_ORDER` | Add `'unbox_review'` as first item in the array |

### Package Configuration

```text
unbox_review: {
  name: 'Unbox & Review',
  description: 'Send your product to a creator for an authentic unboxing and review from home',
  priceRange: null,
  durationRange: null,  // Flexible - typically 3-7 days after product receipt
  includes: [
    'Product shipped to creator',
    '1 Instagram Reel or TikTok video',
    '2-3 Instagram Stories',
    'Honest review with product highlights',
    'Brand tagged in all posts',
  ],
  phases: [
    {
      title: 'Product Delivery',
      items: [
        'Brand ships product to creator',
        'Creator confirms receipt',
      ],
    },
    {
      title: 'Content Creation',
      items: [
        'Unboxing video recorded at home',
        'Product review/demonstration',
        'Highlights key features & benefits',
      ],
    },
    {
      title: 'Content Posted',
      items: [
        '1 Reel/TikTok (permanent post)',
        '2-3 Stories showcasing product',
        'Brand tagged in all posts',
      ],
    },
  ],
  idealFor: ['E-commerce', 'Product launches', 'Beauty brands', 'Tech gadgets', 'Fashion'],
}
```

### Updated Package Order

```text
PACKAGE_ORDER: ['unbox_review', 'social_boost', 'meet_greet', 'competition', 'custom']
```

## Result

The packages will now display in this order:

1. **Unbox & Review** - Entry-level, no venue visit, product shipped to creator
2. **Social Boost** - Creator visits venue for content
3. **Meet & Greet** - Full appearance with fan interaction
4. **Live PK Battle** - Large-scale live streaming event
5. **Custom Experience** - Tailored solutions

This creates a clear progression from simple (send product) to complex (full event management).

