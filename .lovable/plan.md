

## Strengthen Terms of Service with Anti-Fraud, Scam & Verification Disclaimers

### What's Missing

The current Terms have good foundations but lack explicit protections for:
- **Scams and fraud between users** -- no clause saying CollabHunts is not liable if one party scams the other
- **Fake followers / purchased engagement** -- Section 9 bans it but doesn't disclaim CollabHunts' liability for failing to catch it
- **Vetting limitations** -- no disclaimer that our vetting process is best-effort and not a guarantee of authenticity
- **Accuracy of Creator stats** -- no explicit disclaimer that we don't verify or guarantee follower counts, engagement rates, or any metrics
- **User-to-user conflicts** -- needs stronger "at your own risk" language for all interactions

### Changes to `src/pages/TermsOfService.tsx`

#### 1. Expand Section 5 (User Accounts & Verification) -- Add Vetting Disclaimer

After the existing account termination paragraph, add a new subsection:

**"5.1 Vetting & Verification Limitations"**
- CollabHunts may conduct voluntary vetting of Creator profiles as a courtesy. This vetting is performed on a best-effort basis and does NOT constitute a guarantee, endorsement, or certification of any Creator's identity, credentials, social media metrics, follower authenticity, engagement rates, or professional conduct.
- CollabHunts does not and cannot verify the authenticity of followers, engagement, or audience demographics. Creators may have purchased followers, inflated metrics, or misrepresented their reach. CollabHunts bears no responsibility for inaccurate or misleading Creator profiles.
- A "Vetted" badge or any other status indicator on the Platform is NOT a warranty of reliability, honesty, or quality. It indicates only that the Creator has passed our basic review process at the time of vetting.
- Brands are solely responsible for conducting their own due diligence before entering into any arrangement with a Creator.

#### 2. Add New Section (after Section 12) -- "Fraud, Scams & User Conduct Disclaimer"

New **Section 13: Fraud, Scams & User Conduct Disclaimer** (existing sections 13-18 shift to 14-19):

- CollabHunts is a technology platform only. We do NOT police, monitor, or guarantee the conduct, honesty, or intentions of any user.
- CollabHunts is NOT responsible for any scam, fraud, misrepresentation, theft, or deception committed by any user against another user, including but not limited to:
  - Creators who accept payment and fail to perform
  - Creators who misrepresent their identity, metrics, reach, or capabilities
  - Brands who fail to pay Creators as agreed
  - Brands who misrepresent event details, conditions, or compensation
  - Any party who provides false or misleading information
- All interactions, negotiations, and transactions between users are conducted at the users' own risk.
- CollabHunts has no obligation to investigate, mediate, or resolve any allegations of fraud or misconduct between users.
- Users are encouraged to verify identities, check references, and use our AI-assisted agreement tools before committing to any collaboration.
- BY USING THE PLATFORM, YOU ACKNOWLEDGE THAT COLLABHUNTS CANNOT PREVENT ALL FRAUDULENT ACTIVITY AND YOU AGREE NOT TO HOLD COLLABHUNTS LIABLE FOR ANY LOSSES RESULTING FROM THE ACTIONS OF OTHER USERS.

#### 3. Expand Section 14 (Limitation of Liability, currently Section 13)

Add these items to the existing bullet list:
- Fraud, scams, or deception committed by any user
- Inaccuracy of Creator profile information, follower counts, or engagement metrics
- Purchased or fake followers on any Creator's social media accounts
- Any losses arising from reliance on information provided by other users on the Platform
- Physical harm, property damage, or personal injury at events

Add new paragraph:
- COLLABHUNTS' VETTING PROCESS IS NOT A GUARANTEE OF AUTHENTICITY. EVEN VETTED CREATORS MAY ENGAGE IN FRAUDULENT BEHAVIOR. COLLABHUNTS SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM A VETTED CREATOR'S MISCONDUCT.

#### 4. Expand Section 16 (Indemnification, currently Section 16)

Add to the indemnification list:
- Any fraud, scam, or misrepresentation you commit against another user
- Any claims by third parties arising from your conduct on or off the Platform
- Any inaccuracy in information you provide on the Platform, including social media metrics

#### Summary of Section Numbering After Changes

| # | Section |
|---|---------|
| 1-12 | Unchanged |
| 13 | **NEW: Fraud, Scams & User Conduct Disclaimer** |
| 14 | Limitation of Liability (expanded, was 13) |
| 15 | No Warranty / As-Is Disclaimer (expanded, was 14) |
| 16 | No Agency Relationship (was 15) |
| 17 | Indemnification (expanded, was 16) |
| 18 | Changes to Terms (was 17) |
| 19 | Contact Us (was 18) |

