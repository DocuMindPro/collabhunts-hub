
## Update All Legal Pages for Full Protection + Creator Response Disclaimer

### Problems Found

**Contradictions with direct-payment model (must be fixed across all 3 pages):**
- Terms of Service Section 6: Still references "50% deposit", "balance payment", "funds released" (escrow language)
- Terms of Service Section 2: Mentions "Payment Processing: Secure escrow-based payment handling"
- Terms of Service Section 12: Says "Circumvent platform payments" (no platform payments exist)
- Privacy Policy Section 3.1: References "Process bookings and payments through our escrow system"
- Privacy Policy Section 6: References "Escrow Protection" and "PCI-DSS compliant payment processing"
- Refund Policy: The ENTIRE page is built around an escrow/managed-payment model (deposits, refund timelines, chargebacks, 15% platform fee, auto-approval, fund releases) -- none of this applies

**Missing legal protections:**
- No "Creator Response Not Guaranteed" disclaimer anywhere
- No "Platform as Facilitator Only" / "No Agency Relationship" clause
- No "As-Is / No Warranty" disclaimer in Terms of Service

### Changes by File

#### 1. `src/pages/TermsOfService.tsx`

| Section | Change |
|---------|--------|
| Section 2 (Service Description) | Remove "Payment Processing: Secure escrow-based payment handling". Replace with "Agreement Tools: AI-assisted agreement drafting for record-keeping" |
| Section 6 (Booking Process) | Rewrite to remove deposit/escrow steps. New flow: Discovery -> Inquiry -> Negotiation -> Agreement -> Direct Payment between parties -> Event |
| Section 9 (Creator Terms) | Add clear disclaimer: Creators are independent users. CollabHunts does not guarantee that any Creator will respond to messages, accept bookings, or be available. Response times vary and are outside our control. |
| Section 12 (Prohibited Activities) | Remove "Circumvent platform payments or arrange off-platform transactions" since all payments ARE off-platform |
| NEW Section (after 13) | Add "No Warranty / As-Is Disclaimer": THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE CREATOR AVAILABILITY, RESPONSE TIMES, OR QUALITY OF SERVICE. |
| NEW Section (after 13) | Add "No Agency Relationship": CollabHunts is not an agent, employer, or representative of any Creator or Brand. We are a facilitator only. |
| Version | Update to Version 4.0, date to February 11, 2026 |

#### 2. `src/pages/PrivacyPolicy.tsx`

| Section | Change |
|---------|--------|
| Section 3.1 | Change "Process bookings and payments through our escrow system" to "Facilitate connections and communication between parties" |
| Section 6 (Data Security) | Remove "PCI-DSS compliant payment processing" and "Escrow Protection: Secure fund holding until service delivery" |
| Version | Update to Version 4.0, date to February 11, 2026 |

#### 3. `src/pages/RefundPolicy.tsx`

**Complete rewrite required.** The entire page assumes escrow/managed payments. It will be rewritten to reflect the direct-payment model:

New structure:
1. **Overview** -- CollabHunts is a discovery and communication platform. All payments are handled directly between Brands and Creators. We do not process, hold, or manage any funds.
2. **Creator Response Disclaimer** (PROMINENT) -- CollabHunts does not guarantee that Creators will respond to inquiries, accept bookings, or be available. We may attempt to assist, but if a Creator does not respond to us or the Brand, this is not the responsibility of CollabHunts. Brands should not expect guaranteed responses from any Creator.
3. **Direct Payment Terms** -- All financial arrangements including deposits, payments, and refunds are negotiated and handled directly between Brands and Creators. CollabHunts has no involvement in these transactions.
4. **Platform Subscription Refunds** -- For paid Brand subscriptions (Basic/Pro plans), refund policy for those platform fees only.
5. **Cancellation Between Parties** -- Brands and Creators should agree on cancellation terms before confirming any collaboration. We recommend using our AI-assisted agreement tool. CollabHunts is not responsible for cancellation disputes.
6. **Dispute Assistance** -- While we may offer voluntary mediation assistance, CollabHunts is not obligated to resolve disputes between parties. Any mediation is provided as a courtesy and is non-binding.
7. **Limitation of Liability** -- CollabHunts is not liable for: Creator non-response, payment disputes, event cancellations, quality of service, or any losses arising from direct transactions between parties.
8. **Force Majeure** -- Keep existing
9. **Policy Changes** -- Keep existing
10. **Contact** -- Keep existing

### Key Disclaimers Added (appear in both Terms and Refund Policy)

The "Creator may not respond" language will appear in THREE places for maximum legal coverage:
1. Terms of Service Section 9 (Creator Terms)
2. Terms of Service new "No Warranty" section
3. Refund Policy Section 2 (prominent, highlighted box)

Sample language for the highlighted disclaimer:
> **IMPORTANT: NO GUARANTEE OF CREATOR RESPONSE OR AVAILABILITY.** CollabHunts is a discovery platform that connects Brands with Creators. We do not employ, manage, or control Creators. Creators are independent users who may or may not respond to inquiries at their sole discretion. While CollabHunts may attempt to facilitate communication, we cannot compel any Creator to respond, and we bear no responsibility if a Creator fails to reply to a Brand's message or booking inquiry. By using the Platform, you acknowledge and accept this limitation.
