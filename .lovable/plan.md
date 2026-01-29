
# Revert Terminology: "Venue" → "Brand"

## Overview
You want to keep the original "Brand" terminology instead of "Venue" that was introduced during the platform transformation. This makes sense as "Brand" is a broader term that can encompass venues, businesses, restaurants, cafes, etc., while still fitting the new event-based model.

## Files to Update

### 1. Navigation & Footer
**src/components/Navbar.tsx**
- "For Venues" → "For Brands"
- "List Your Venue" → "List Your Brand"
- "Venue Dashboard" → "Brand Dashboard"

**src/components/Footer.tsx**
- "For Venues" → "For Brands"
- "List Your Venue" → "List Your Brand"

### 2. Dashboard
**src/pages/BrandDashboard.tsx**
- "Venue Dashboard" → "Brand Dashboard"
- "Manage your venue and creator events" → "Manage your brand and creator events"
- "Venue Profile" tab → "Brand Profile" tab

### 3. Brand Landing Page
**src/pages/Brand.tsx**
- "For Venues & Businesses" → "For Brands"
- "at Your Venue" → "at Your Location"
- "List Your Venue" → "Register Your Brand"
- "Turn your venue into a destination" → "Turn your brand into a destination"
- "Choose the right experience for your venue" → "Choose the right experience for your brand"
- "Perfect for Any Venue" → "Perfect for Any Business"
- "List your venue for free" → "Register your brand for free"
- Button: "List Your Venue" → "Register Your Brand"

### 4. Signup & Onboarding
**src/pages/BrandSignup.tsx**
- "Register Your Venue" → "Register Your Brand"
- "Create Your Venue Account" → "Create Your Brand Account"
- "Fill in your venue details" → "Fill in your brand details"
- "Venue / Business Name" label → "Brand / Business Name"
- "Venue Information" → "Brand Information"

**src/pages/BrandWelcome.tsx**
- "Venue Registered!" → "Brand Registered!"
- "venue's vibe" → "brand's vibe"

### 5. Login Page
**src/pages/Login.tsx**
- "Register a Venue" → "Register a Brand"

### 6. About & Contact
**src/pages/AboutUs.tsx**
- "Register Your Venue" → "Register Your Brand"

**src/pages/Contact.tsx**
- "registering your venue" → "registering your brand"

### 7. Other Pages
**src/pages/Index.tsx**
- "For Venues" → "For Brands"
- "List Your Venue" → "Register Your Brand"
- "list your venue" → "list your brand"

**src/pages/Influencers.tsx**
- "List your venue to book creators" → "Register your brand to book creators"
- "List Your Venue" → "Register Your Brand"

**src/pages/Events.tsx**
- References to venue → brand where applicable in user-facing text

**src/components/EventBookingDialog.tsx**
- "Your Venue" label → "Your Location" (keeping location context for event)

### 8. Config (No Change Needed)
**src/config/packages.ts**
- Keep `VENUE_TYPES` as internal technical name (it refers to physical location types like cafe, restaurant, etc.)
- This is technical configuration, not user-facing text

## Summary of Changes
| Current Text | New Text |
|-------------|----------|
| "For Venues" | "For Brands" |
| "List Your Venue" | "Register Your Brand" |
| "Venue Dashboard" | "Brand Dashboard" |
| "Register Your Venue" | "Register Your Brand" |
| "Register a Venue" | "Register a Brand" |
| "Your venue" | "Your brand" / "Your location" |
| "venue's vibe" | "brand's vibe" |

## Files Affected: 11 files total
- src/components/Navbar.tsx
- src/components/Footer.tsx
- src/pages/BrandDashboard.tsx
- src/pages/Brand.tsx
- src/pages/BrandSignup.tsx
- src/pages/BrandWelcome.tsx
- src/pages/Login.tsx
- src/pages/AboutUs.tsx
- src/pages/Contact.tsx
- src/pages/Index.tsx
- src/pages/Influencers.tsx
