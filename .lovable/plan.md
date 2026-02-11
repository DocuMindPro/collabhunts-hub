

## Add "Open to Free Invites" Policy Section

### What We're Adding

A new subsection under Section 10 (Brand & Venue Terms) in the Terms of Service that clarifies CollabHunts' position on free invite collaborations. The language will make clear that:

- "Open to Free Invites" is a voluntary signal -- creators opt in to show availability for complimentary/barter collaborations
- Brands may request specific content but **cannot demand or force** any particular deliverables since no payment is involved
- At minimum, a creator is expected to visit, experience, and share at their own discretion (a post, story, tag, photo -- whatever form they choose)
- The content format, style, and timing are entirely at the creator's discretion
- Any specific content requirements should be discussed and mutually agreed upon beforehand
- CollabHunts is not a party to these arrangements and bears no responsibility for the outcome
- Disputes arising from free invite collaborations are between the brand and creator

We'll also add a brief matching note under Section 9 (Creator Terms) so creators understand their side.

### Files to Change

**`src/pages/TermsOfService.tsx`**

1. **Section 9 (Creator Terms)** -- Add a subsection "9.1 Open to Free Invites" with a brief note that opting in signals willingness to consider complimentary invitations, not an obligation to accept or produce specific content.

2. **Section 10 (Brand & Venue Terms)** -- Add a subsection "10.1 Free Invite Collaborations Policy" with the full policy language covering:
   - Definition: complimentary invitations where no monetary payment is exchanged
   - Creator autonomy: creators choose what, how, and when to post
   - No forced deliverables: brands cannot mandate specific content types, quantities, or timelines
   - Minimum expectation: visiting and sharing in their own way
   - Mutual agreement: any specific requirements must be discussed and agreed upon
   - Platform disclaimer: CollabHunts facilitates the connection only and is not liable for disputes

Both subsections will use the amber highlight box style (consistent with existing warnings in the Terms page) to draw attention.

### Why This Matters

This protects the platform legally while setting the right tone -- free invites are a goodwill gesture, not a contract for specific deliverables. It also educates brands that if they want guaranteed content, they should use a paid collaboration instead.

