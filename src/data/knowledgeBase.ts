import { 
  BookOpen, 
  Users, 
  Building2, 
  CreditCard, 
  Shield,
  Briefcase,
  MessageSquare,
  FolderOpen,
  Star,
  AlertTriangle,
  Settings,
  Wallet,
  Camera,
  TrendingUp,
  LucideIcon
} from "lucide-react";

export type UserRole = 'creator' | 'brand' | 'all';

export interface KBArticle {
  slug: string;
  title: string;
  content: string;
  subcategory?: string;
  roles: UserRole[];
  order: number;
}

export interface KBCategory {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  roles: UserRole[];
  order: number;
  articles: KBArticle[];
}

export const knowledgeBaseCategories: KBCategory[] = [
  // CREATOR CATEGORIES
  {
    slug: "getting-started-creators",
    title: "Getting Started",
    description: "Learn how to set up your creator profile and start receiving bookings",
    icon: BookOpen,
    roles: ['creator'],
    order: 1,
    articles: [
      {
        slug: "how-collabhunts-works",
        title: "How CollabHunts Works for Creators",
        content: `
          <h2>Welcome to CollabHunts!</h2>
          <p>CollabHunts is a marketplace connecting content creators like you with brands looking for authentic collaborations. Here's how it works:</p>
          
          <h3>Step-by-Step Process</h3>
          <ol>
            <li><strong>Create your profile</strong> - Add your social accounts, bio, and portfolio</li>
            <li><strong>Set up service packages</strong> - Define what you offer and your pricing</li>
            <li><strong>Wait for approval</strong> - Our team reviews profiles within 1-2 business days</li>
            <li><strong>Receive booking requests</strong> - Brands will find and book your services</li>
            <li><strong>Deliver content</strong> - Complete the work within the agreed timeframe</li>
            <li><strong>Get paid!</strong> - Payment is released after brand approval or 72-hour auto-release</li>
          </ol>
          
          <div class="alert alert-info">
            <strong>Pro Tip:</strong> Complete your profile with high-quality portfolio items and accurate social metrics to increase your chances of approval and bookings.
          </div>
        `,
        roles: ['creator'],
        order: 1
      },
      {
        slug: "profile-approval-process",
        title: "Profile Approval Process",
        content: `
          <h2>Why Profile Approval?</h2>
          <p>All creator profiles are reviewed by our team to ensure quality and authenticity. This protects brands and maintains our marketplace standards.</p>
          
          <h3>What We Look For</h3>
          <ul>
            <li>Complete profile information (bio, location, categories)</li>
            <li>Verified social media accounts with accurate follower counts</li>
            <li>Professional portfolio items showcasing your work</li>
            <li>Appropriate pricing for your audience size and engagement</li>
          </ul>
          
          <h3>Approval Timeline</h3>
          <p>Most profiles are reviewed within <strong>1-2 business days</strong>. You'll receive a notification when your profile is approved or if we need additional information.</p>
          
          <h3>If Your Profile is Rejected</h3>
          <p>Don't worry! We'll provide feedback on what needs improvement. Update your profile and it will be reviewed again.</p>
        `,
        roles: ['creator'],
        order: 2
      },
      {
        slug: "setting-up-services",
        title: "Setting Up Your Services",
        content: `
          <h2>Creating Service Packages</h2>
          <p>Your services define what you offer to brands and at what price. Well-structured services lead to more bookings.</p>
          
          <h3>Service Types Available</h3>
          <ul>
            <li><strong>Instagram Post</strong> - Feed posts on Instagram</li>
            <li><strong>Instagram Story</strong> - 24-hour story content</li>
            <li><strong>Instagram Reel</strong> - Short-form video content</li>
            <li><strong>TikTok Video</strong> - TikTok content creation</li>
            <li><strong>YouTube Video</strong> - Long-form YouTube content</li>
            <li><strong>UGC Content</strong> - User-generated content for brand use</li>
          </ul>
          
          <h3>Pricing Tips</h3>
          <ul>
            <li>Research what creators with similar audience sizes charge</li>
            <li>Factor in your engagement rate, not just follower count</li>
            <li>Include time for revisions in your pricing</li>
            <li>Start competitive and adjust based on demand</li>
          </ul>
          
          <h3>Delivery Timeframes</h3>
          <p>Set realistic delivery days. The countdown begins when you accept a booking, so make sure you can deliver within the promised timeframe.</p>
        `,
        roles: ['creator'],
        order: 3
      }
    ]
  },
  {
    slug: "managing-bookings-creators",
    title: "Managing Bookings",
    description: "How to handle booking requests, deliveries, and revisions",
    icon: Briefcase,
    roles: ['creator'],
    order: 2,
    articles: [
      {
        slug: "accepting-bookings",
        title: "Accepting & Declining Bookings",
        content: `
          <h2>When You Receive a Booking</h2>
          <p>When a brand books your service, you'll receive a notification. Review the booking details carefully before accepting.</p>
          
          <h3>Before Accepting, Check:</h3>
          <ul>
            <li>The brand's requirements and message</li>
            <li>Your availability within the delivery timeframe</li>
            <li>Any special requests or content needs</li>
          </ul>
          
          <h3>Declining Bookings</h3>
          <p>It's okay to decline bookings that don't fit your brand or schedule. Declining before acceptance has no penalty. However, once accepted, you're committed to delivery.</p>
        `,
        roles: ['creator'],
        order: 1
      },
      {
        slug: "delivering-content",
        title: "Delivering Your Content",
        content: `
          <h2>The Delivery Process</h2>
          <p>Once you've completed the content, upload your deliverables through the Bookings tab in your dashboard.</p>
          
          <h3>What Happens After Delivery</h3>
          <ol>
            <li>Brand receives notification of your delivery</li>
            <li>72-hour review window begins</li>
            <li>Brand can: Approve, Request Revisions, or Open Dispute</li>
            <li>If no action within 72 hours, payment auto-releases to you</li>
          </ol>
          
          <div class="alert alert-warning">
            <strong>Important:</strong> Make sure your deliverables match what was agreed upon. Clear communication prevents disputes.
          </div>
        `,
        roles: ['creator'],
        order: 2
      },
      {
        slug: "handling-revisions",
        title: "Handling Revision Requests",
        content: `
          <h2>Revisions Are Normal</h2>
          <p>Brands may request changes before approving your delivery. This is a normal part of the creative process.</p>
          
          <h3>Best Practices</h3>
          <ul>
            <li>Clarify revision limits in your service descriptions</li>
            <li>Respond to revision requests promptly</li>
            <li>Ask for specific feedback if the request is unclear</li>
            <li>Document all communication through the platform</li>
          </ul>
          
          <h3>Excessive Revisions</h3>
          <p>If a brand is requesting unreasonable revisions outside the original scope, you can open a dispute for our team to review.</p>
        `,
        roles: ['creator'],
        order: 3
      }
    ]
  },
  {
    slug: "payments-creators",
    title: "Payments & Payouts",
    description: "Everything about getting paid for your work",
    icon: Wallet,
    roles: ['creator'],
    order: 3,
    articles: [
      {
        slug: "how-payments-work",
        title: "How Payments Work",
        content: `
          <h2>Escrow Payment System</h2>
          <p>When a brand books you, their payment is held securely in escrow. This guarantees you'll be paid for your work.</p>
          
          <h3>Payment Release Triggers</h3>
          <ul>
            <li><strong>Brand Approval:</strong> Brand reviews and approves your deliverables</li>
            <li><strong>Auto-Release:</strong> No action from brand within 72 hours of delivery</li>
            <li><strong>Dispute Resolution:</strong> Admin decides in your favor</li>
          </ul>
          
          <h3>Your Earnings</h3>
          <p>You receive the <strong>full price</strong> you set for your services. Platform fees are charged to brands, not creators.</p>
        `,
        roles: ['creator'],
        order: 1
      },
      {
        slug: "payout-settings",
        title: "Payout Settings & Timing",
        content: `
          <h2>Setting Up Payouts</h2>
          <p>Connect your payout account in the Payouts tab of your dashboard to receive payments.</p>
          
          <h3>Payout Timing</h3>
          <ul>
            <li>Earnings are released immediately after approval</li>
            <li>Funds arrive within 2-5 business days depending on your bank</li>
            <li>You can track all payouts in your Payouts tab</li>
          </ul>
        `,
        roles: ['creator'],
        order: 2
      }
    ]
  },
  {
    slug: "disputes-creators",
    title: "Disputes & Support",
    description: "How to handle disputes and get help when needed",
    icon: AlertTriangle,
    roles: ['creator'],
    order: 4,
    articles: [
      {
        slug: "dispute-process-creators",
        title: "Understanding the Dispute Process",
        content: `
          <h2>When Disputes Happen</h2>
          <p>Sometimes brands may open a dispute if they're unsatisfied with deliverables. Here's how the process works:</p>
          
          <h3>Dispute Timeline</h3>
          <ol>
            <li><strong>Dispute Opened:</strong> Brand explains their concern</li>
            <li><strong>Your Response (3 days):</strong> Provide your side with evidence</li>
            <li><strong>Negotiation Period:</strong> Try to resolve with the brand</li>
            <li><strong>Admin Review:</strong> If unresolved, our team decides</li>
          </ol>
          
          <h3>Possible Outcomes</h3>
          <ul>
            <li><strong>Full payment to you:</strong> Work meets requirements</li>
            <li><strong>Full refund to brand:</strong> Significant issues with delivery</li>
            <li><strong>Split payment:</strong> Partial compensation to each party</li>
          </ul>
          
          <div class="alert alert-info">
            <strong>Tip:</strong> Always keep records and communicate through the platform. This creates evidence if disputes arise.
          </div>
        `,
        roles: ['creator'],
        order: 1
      }
    ]
  },
  {
    slug: "content-guidelines-creators",
    title: "Content Guidelines",
    description: "What content is allowed and FTC disclosure requirements",
    icon: Camera,
    roles: ['creator'],
    order: 5,
    articles: [
      {
        slug: "allowed-content",
        title: "Allowed & Prohibited Content",
        content: `
          <h2>Content Standards</h2>
          <p>All content created through CollabHunts must comply with our community guidelines and legal requirements.</p>
          
          <h3>Prohibited Content</h3>
          <ul>
            <li>Illegal material of any kind</li>
            <li>Explicit adult content</li>
            <li>Hate speech or discrimination</li>
            <li>Violence promotion or threats</li>
            <li>Misleading or deceptive information</li>
            <li>Copyright-infringing material</li>
          </ul>
          
          <h3>FTC Disclosure Requirements</h3>
          <p>Sponsored content must include clear disclosures like #ad or #sponsored. This is a legal requirement in most jurisdictions.</p>
        `,
        roles: ['creator'],
        order: 1
      }
    ]
  },

  // BRAND CATEGORIES
  {
    slug: "getting-started-brands",
    title: "Getting Started",
    description: "Learn how to find creators and launch your first campaign",
    icon: BookOpen,
    roles: ['brand'],
    order: 1,
    articles: [
      {
        slug: "how-collabhunts-works-brands",
        title: "How CollabHunts Works for Brands",
        content: `
          <h2>Welcome to CollabHunts!</h2>
          <p>CollabHunts connects your brand with authentic content creators. Here's how to get started:</p>
          
          <h3>Step-by-Step Process</h3>
          <ol>
            <li><strong>Create your brand account</strong> - Set up your company profile</li>
            <li><strong>Browse creators</strong> - Use filters to find the perfect match</li>
            <li><strong>Book services</strong> - Select a creator's service and pay (held in escrow)</li>
            <li><strong>Receive content</strong> - Creator delivers within the agreed timeframe</li>
            <li><strong>Approve & release payment</strong> - Review deliverables and approve</li>
          </ol>
          
          <div class="alert alert-warning">
            <strong>Important:</strong> You have 72 hours to review deliverables. After that, payment is automatically released to the creator.
          </div>
        `,
        roles: ['brand'],
        order: 1
      },
      {
        slug: "finding-creators",
        title: "Finding the Right Creators",
        content: `
          <h2>Discovering Creators</h2>
          <p>Use our powerful search and filtering tools to find creators that match your brand.</p>
          
          <h3>Available Filters</h3>
          <ul>
            <li><strong>Category:</strong> Lifestyle, Fashion, Tech, Food, etc.</li>
            <li><strong>Location:</strong> Country, state, city</li>
            <li><strong>Platform:</strong> Instagram, TikTok, YouTube</li>
            <li><strong>Follower count:</strong> Range of audience size</li>
          </ul>
          
          <h3>Advanced Filters (Pro/Premium)</h3>
          <ul>
            <li>Age range demographics</li>
            <li>Gender filtering</li>
            <li>Language preferences</li>
            <li>Ethnicity targeting</li>
          </ul>
          
          <h3>Tips for Finding Great Creators</h3>
          <ul>
            <li>Look at engagement rates, not just follower counts</li>
            <li>Review their portfolio for content quality</li>
            <li>Check their ratings from other brands</li>
            <li>Read their bio to ensure brand alignment</li>
          </ul>
        `,
        roles: ['brand'],
        order: 2
      }
    ]
  },
  {
    slug: "booking-creators",
    title: "Booking Creators",
    description: "How to book services and work with creators",
    icon: Briefcase,
    roles: ['brand'],
    order: 2,
    articles: [
      {
        slug: "booking-process",
        title: "The Booking Process",
        content: `
          <h2>How to Book a Creator</h2>
          <ol>
            <li>Find a creator you like</li>
            <li>Click on their profile to view services</li>
            <li>Select the service package you want</li>
            <li>Write a message explaining your requirements</li>
            <li>Complete payment (held in escrow)</li>
            <li>Wait for creator to accept</li>
          </ol>
          
          <h3>Escrow Protection</h3>
          <p>Your payment is held securely until you approve the deliverables. This protects both you and the creator.</p>
        `,
        roles: ['brand'],
        order: 1
      },
      {
        slug: "reviewing-deliverables",
        title: "Reviewing Deliverables",
        content: `
          <h2>The 72-Hour Review Window</h2>
          <p>When a creator delivers their work, you have <strong>72 hours</strong> to review and take action.</p>
          
          <h3>Your Options</h3>
          <ul>
            <li><strong>Approve:</strong> Release payment to the creator</li>
            <li><strong>Request Revisions:</strong> Ask for specific changes</li>
            <li><strong>Open Dispute:</strong> Escalate significant issues</li>
          </ul>
          
          <div class="alert alert-danger">
            <strong>Warning:</strong> If you don't take action within 72 hours, payment is <strong>automatically released</strong> to the creator. We send reminders at 48 hours and 24 hours before auto-release.
          </div>
        `,
        roles: ['brand'],
        order: 2
      }
    ]
  },
  {
    slug: "subscriptions-brands",
    title: "Subscriptions & Pricing",
    description: "Understanding subscription tiers and marketplace fees",
    icon: Star,
    roles: ['brand'],
    order: 3,
    articles: [
      {
        slug: "subscription-tiers",
        title: "Subscription Tiers Explained",
        content: `
          <h2>Choose the Right Plan</h2>
          
          <h3>Basic (Free)</h3>
          <ul>
            <li>20% marketplace fee on bookings</li>
            <li>Browse creators only</li>
            <li>Cannot contact or book creators</li>
            <li>No advanced filters</li>
          </ul>
          
          <h3>Pro ($99/month)</h3>
          <ul>
            <li>15% marketplace fee on bookings</li>
            <li>Contact and book creators</li>
            <li>Creator CRM (save, notes, folders)</li>
            <li>10 GB Content Library</li>
            <li>Advanced demographic filters</li>
            <li>1 active campaign per month</li>
          </ul>
          
          <h3>Premium ($299/month)</h3>
          <ul>
            <li>15% marketplace fee on bookings</li>
            <li>All Pro features</li>
            <li>50 GB Content Library</li>
            <li>Unlimited campaigns</li>
            <li>Priority support</li>
          </ul>
        `,
        roles: ['brand'],
        order: 1
      },
      {
        slug: "marketplace-fees",
        title: "Understanding Marketplace Fees",
        content: `
          <h2>How Fees Work</h2>
          <p>CollabHunts charges a marketplace fee on each booking to support platform operations.</p>
          
          <h3>Fee by Subscription Tier</h3>
          <ul>
            <li><strong>Basic:</strong> 20% of booking total</li>
            <li><strong>Pro:</strong> 15% of booking total</li>
            <li><strong>Premium:</strong> 15% of booking total</li>
          </ul>
          
          <h3>Example</h3>
          <p>If a creator charges $500 for a service:</p>
          <ul>
            <li>Basic: You pay $600 ($500 + $100 fee)</li>
            <li>Pro/Premium: You pay $575 ($500 + $75 fee)</li>
          </ul>
          
          <p>Pro and Premium subscriptions pay for themselves with just a few bookings!</p>
        `,
        roles: ['brand'],
        order: 2
      }
    ]
  },
  {
    slug: "content-library-brands",
    title: "Content Library",
    description: "Organizing and managing your UGC content",
    icon: FolderOpen,
    roles: ['brand'],
    order: 4,
    articles: [
      {
        slug: "content-library-overview",
        title: "Using the Content Library",
        content: `
          <h2>Your Content Hub</h2>
          <p>The Content Library is your central repository for all UGC and content from creator collaborations.</p>
          
          <h3>Features</h3>
          <ul>
            <li><strong>File Storage:</strong> Upload and store all your content</li>
            <li><strong>Folder Organization:</strong> Create nested folders to organize</li>
            <li><strong>Tagging:</strong> Add tags for easy searching</li>
            <li><strong>Usage Rights Tracking:</strong> Track content licensing periods</li>
            <li><strong>Creator Attribution:</strong> Link content to creators</li>
          </ul>
          
          <h3>Storage Limits</h3>
          <ul>
            <li><strong>Basic:</strong> No access</li>
            <li><strong>Pro:</strong> 10 GB included</li>
            <li><strong>Premium:</strong> 50 GB included</li>
            <li><strong>Additional:</strong> $10 per 100 GB</li>
          </ul>
        `,
        roles: ['brand'],
        order: 1
      },
      {
        slug: "usage-rights",
        title: "Managing Usage Rights",
        content: `
          <h2>Content Usage Rights</h2>
          <p>Track when your content licenses expire to stay compliant.</p>
          
          <h3>Rights Types</h3>
          <ul>
            <li><strong>Standard:</strong> Marketing use for a specified period</li>
            <li><strong>Exclusive:</strong> Only your brand can use the content</li>
            <li><strong>Perpetual:</strong> Unlimited use forever</li>
          </ul>
          
          <h3>Expiration Notifications</h3>
          <p>We'll email you reminders when content rights are expiring:</p>
          <ul>
            <li>7 days before expiration</li>
            <li>3 days before expiration</li>
            <li>1 day before expiration</li>
            <li>After expiration</li>
          </ul>
        `,
        roles: ['brand'],
        order: 2
      }
    ]
  },
  {
    slug: "campaigns-brands",
    title: "Campaign Management",
    description: "Creating and managing influencer campaigns",
    icon: TrendingUp,
    roles: ['brand'],
    order: 5,
    articles: [
      {
        slug: "creating-campaigns",
        title: "Creating Campaigns",
        content: `
          <h2>Post Campaign Opportunities</h2>
          <p>Campaigns let creators come to you! Post what you're looking for and receive applications.</p>
          
          <h3>Creating a Campaign</h3>
          <ol>
            <li>Go to your Brand Dashboard</li>
            <li>Click "Create Campaign"</li>
            <li>Add title, description, and requirements</li>
            <li>Set budget and available spots</li>
            <li>Set a deadline</li>
            <li>Submit for approval</li>
          </ol>
          
          <h3>Campaign Approval</h3>
          <p>All campaigns are reviewed by our team before going live. This typically takes 1-2 business days.</p>
          
          <h3>Campaign Limits by Tier</h3>
          <ul>
            <li><strong>Basic:</strong> No campaigns</li>
            <li><strong>Pro:</strong> 1 active campaign per month</li>
            <li><strong>Premium:</strong> Unlimited campaigns</li>
          </ul>
        `,
        roles: ['brand'],
        order: 1
      }
    ]
  },
  {
    slug: "disputes-brands",
    title: "Disputes & Support",
    description: "How to open disputes and get resolution",
    icon: AlertTriangle,
    roles: ['brand'],
    order: 6,
    articles: [
      {
        slug: "opening-disputes",
        title: "Opening a Dispute",
        content: `
          <h2>When to Open a Dispute</h2>
          <p>Disputes should be a last resort when you can't resolve issues directly with the creator.</p>
          
          <h3>Valid Dispute Reasons</h3>
          <ul>
            <li>Deliverables don't match the booking requirements</li>
            <li>Quality significantly below expectations</li>
            <li>Content not delivered by deadline</li>
            <li>Creator is unresponsive</li>
          </ul>
          
          <h3>How to Open a Dispute</h3>
          <ol>
            <li>Go to your Bookings tab</li>
            <li>Find the relevant booking</li>
            <li>Click "Open Dispute"</li>
            <li>Explain the issue with evidence</li>
            <li>Wait for creator response (3 days)</li>
          </ol>
        `,
        roles: ['brand'],
        order: 1
      },
      {
        slug: "dispute-resolution",
        title: "Dispute Resolution Process",
        content: `
          <h2>How Disputes Are Resolved</h2>
          
          <h3>Timeline</h3>
          <ol>
            <li><strong>Day 0:</strong> You open dispute with explanation</li>
            <li><strong>Days 1-3:</strong> Creator responds</li>
            <li><strong>Days 4-6:</strong> Negotiation period</li>
            <li><strong>Day 7+:</strong> Admin review if unresolved</li>
          </ol>
          
          <h3>Possible Outcomes</h3>
          <ul>
            <li><strong>Full refund:</strong> Major issues with delivery</li>
            <li><strong>Partial refund:</strong> Some work was acceptable</li>
            <li><strong>No refund:</strong> Delivery met requirements</li>
          </ul>
        `,
        roles: ['brand'],
        order: 2
      }
    ]
  },

  // SHARED CATEGORIES (both creators and brands)
  {
    slug: "platform-policies",
    title: "Platform Policies",
    description: "Terms of service, privacy policy, and community guidelines",
    icon: Shield,
    roles: ['all'],
    order: 10,
    articles: [
      {
        slug: "terms-overview",
        title: "Terms of Service Overview",
        content: `
          <h2>Our Terms</h2>
          <p>By using CollabHunts, you agree to our Terms of Service. Here are the key points:</p>
          
          <h3>Account Responsibilities</h3>
          <ul>
            <li>You must be 18+ to use the platform</li>
            <li>You're responsible for maintaining account security</li>
            <li>All information must be accurate and up-to-date</li>
          </ul>
          
          <h3>Prohibited Activities</h3>
          <ul>
            <li>Circumventing the platform for payments</li>
            <li>Creating fake reviews or engagement</li>
            <li>Misrepresenting audience or metrics</li>
            <li>Harassment or abuse of other users</li>
          </ul>
          
          <p><a href="/terms">Read the full Terms of Service</a></p>
        `,
        roles: ['all'],
        order: 1
      },
      {
        slug: "privacy-overview",
        title: "Privacy Policy Overview",
        content: `
          <h2>Your Privacy Matters</h2>
          <p>We take your privacy seriously. Here's how we handle your data:</p>
          
          <h3>What We Collect</h3>
          <ul>
            <li>Account information (name, email, phone)</li>
            <li>Profile data you provide</li>
            <li>Transaction records</li>
            <li>Usage analytics</li>
          </ul>
          
          <h3>How We Use It</h3>
          <ul>
            <li>Providing our services</li>
            <li>Processing payments</li>
            <li>Improving the platform</li>
            <li>Communicating with you</li>
          </ul>
          
          <p><a href="/privacy">Read the full Privacy Policy</a></p>
        `,
        roles: ['all'],
        order: 2
      }
    ]
  }
];

// Helper functions
export function getCategoriesForRole(role: 'creator' | 'brand' | null): KBCategory[] {
  if (!role) return knowledgeBaseCategories.filter(c => c.roles.includes('all'));
  return knowledgeBaseCategories.filter(c => 
    c.roles.includes(role) || c.roles.includes('all')
  ).sort((a, b) => a.order - b.order);
}

export function getCategoryBySlug(slug: string): KBCategory | undefined {
  return knowledgeBaseCategories.find(c => c.slug === slug);
}

export function getArticleBySlug(categorySlug: string, articleSlug: string): { category: KBCategory; article: KBArticle } | undefined {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return undefined;
  const article = category.articles.find(a => a.slug === articleSlug);
  if (!article) return undefined;
  return { category, article };
}

export function searchArticles(query: string, role: 'creator' | 'brand' | null): Array<{ category: KBCategory; article: KBArticle }> {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  const categories = getCategoriesForRole(role);
  const results: Array<{ category: KBCategory; article: KBArticle }> = [];
  
  for (const category of categories) {
    for (const article of category.articles) {
      if (
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.content.toLowerCase().includes(normalizedQuery)
      ) {
        results.push({ category, article });
      }
    }
  }
  
  return results;
}
