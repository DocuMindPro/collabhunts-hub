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
  LucideIcon,
  Sparkles,
  Zap,
  Wrench,
  Megaphone,
  Rocket,
  Target,
  Award,
  Clock,
  Heart,
  FileText,
  BadgeCheck
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

// Platform Updates System
export interface PlatformUpdate {
  id: string;
  title: string;
  description: string;
  content: string;
  publishedAt: Date;
  roles: UserRole[];
  category: 'feature' | 'improvement' | 'fix' | 'announcement';
  icon: LucideIcon;
}

export const platformUpdates: PlatformUpdate[] = [
  // Recent updates (add new ones at the top)
  {
    id: "zero-fee-marketplace",
    title: "Zero Transaction Fees Marketplace",
    description: "CollabHunts is now a zero-fee discovery platform - all payments happen directly between you and your collaborators",
    content: `
      <h2>A New Way to Collaborate</h2>
      <p>We've transformed CollabHunts into a true marketplace where creators and brands connect directly, with no transaction fees.</p>
      
      <h3>What's Changed</h3>
      <ul>
        <li><strong>No Platform Fees:</strong> Keep 100% of what you earn - all payments are arranged directly between parties</li>
        <li><strong>AI-Drafted Agreements:</strong> Professional agreements to document your collaboration terms</li>
        <li><strong>Direct Negotiation:</strong> Chat directly with brands/creators to finalize terms</li>
        <li><strong>"Starting from" Pricing:</strong> Base prices are displayed; final terms are negotiated</li>
      </ul>
      
      <h3>How It Works Now</h3>
      <ol>
        <li>Discover creators or get discovered by brands</li>
        <li>Chat and negotiate terms directly</li>
        <li>Send/receive AI-drafted agreements for record-keeping</li>
        <li>Arrange payment directly between parties</li>
        <li>Complete the collaboration</li>
      </ol>
    `,
    publishedAt: new Date("2025-02-01"),
    roles: ['all'],
    category: 'announcement',
    icon: Sparkles
  },
  {
    id: "ai-drafted-agreements",
    title: "AI-Drafted Collaboration Agreements",
    description: "Professional agreements generated automatically based on your negotiated terms",
    content: `
      <h2>Professional Agreements Made Easy</h2>
      <p>Once you've discussed terms in chat, creators can send AI-drafted agreements that document everything professionally.</p>
      
      <h3>What's Included</h3>
      <ul>
        <li>Deliverables and timelines</li>
        <li>Agreed pricing</li>
        <li>Content usage rights</li>
        <li>Revision expectations</li>
        <li>Both parties' details</li>
      </ul>
      
      <h3>Agreement Types</h3>
      <ul>
        <li><strong>Unbox & Review:</strong> Product content packages</li>
        <li><strong>Social Boost:</strong> Promotional content</li>
        <li><strong>Meet & Greet:</strong> Event appearances</li>
        <li><strong>Custom Experience:</strong> Tailored collaborations</li>
      </ul>
    `,
    publishedAt: new Date("2025-01-28"),
    roles: ['all'],
    category: 'feature',
    icon: FileText
  },
  {
    id: "creator-boost-packages",
    title: "Boost Your Profile Visibility",
    description: "New featuring options to stand out in search results and get more brand inquiries",
    content: `
      <h2>Get Discovered Faster</h2>
      <p>Creators can now purchase Boost packages to increase visibility and attract more brand collaborations.</p>
      
      <h3>Boost Options</h3>
      <ul>
        <li><strong>Featured Badge ($29/week):</strong> Stand out with a special badge in search results</li>
        <li><strong>Spotlight ($49/week):</strong> Featured in the spotlight section on the homepage</li>
        <li><strong>Category Boost ($79/week):</strong> Top visibility in your category searches</li>
      </ul>
      
      <h3>Benefits</h3>
      <ul>
        <li>Appear higher in search results</li>
        <li>Eye-catching featured badge</li>
        <li>More profile views from interested brands</li>
        <li>Increased booking opportunities</li>
      </ul>
    `,
    publishedAt: new Date("2025-01-25"),
    roles: ['creator'],
    category: 'feature',
    icon: Rocket
  },
  {
    id: "verified-business-badge",
    title: "Verified Business Badge for Brands",
    description: "Build trust with creators by getting your business verified",
    content: `
      <h2>Stand Out as a Verified Brand</h2>
      <p>Pro and Premium brands can now apply for a Verified Business Badge to build trust with creators.</p>
      
      <h3>What You Get</h3>
      <ul>
        <li>Verified checkmark on your profile</li>
        <li>Higher trust from creators</li>
        <li>Better response rates to inquiries</li>
        <li>Priority in creator searches</li>
      </ul>
      
      <h3>How to Get Verified</h3>
      <ol>
        <li>Subscribe to Pro or Premium plan</li>
        <li>Verify your phone number</li>
        <li>Pay the $99/year verification fee</li>
        <li>Our team reviews your business</li>
        <li>Badge activated upon approval</li>
      </ol>
    `,
    publishedAt: new Date("2025-01-20"),
    roles: ['brand'],
    category: 'feature',
    icon: BadgeCheck
  },
  {
    id: "knowledge-base-redesign",
    title: "Knowledge Base Redesign",
    description: "Our help center has been completely redesigned for easier navigation",
    content: `
      <h2>New Knowledge Base Experience</h2>
      <p>We've completely redesigned our Knowledge Base to help you find answers faster and easier than ever.</p>
      
      <h3>What's New</h3>
      <ul>
        <li><strong>Role-Based Content:</strong> Creators and brands now see articles relevant to their role only</li>
        <li><strong>Improved Search:</strong> Find articles instantly with our new search functionality</li>
        <li><strong>Better Organization:</strong> Articles are now organized into clear categories</li>
        <li><strong>Modern Design:</strong> Clean, easy-to-read layout optimized for all devices</li>
      </ul>
    `,
    publishedAt: new Date("2025-01-15"),
    roles: ['all'],
    category: 'feature',
    icon: Sparkles
  },
  {
    id: "content-library-folders",
    title: "Content Library Folder Organization",
    description: "Organize your UGC content with nested folders and color coding",
    content: `
      <h2>Better Content Organization</h2>
      <p>Pro and Premium brands can now organize their Content Library with nested folders.</p>
      
      <h3>New Features</h3>
      <ul>
        <li>Create custom folders with color coding</li>
        <li>Nest folders within folders for better hierarchy</li>
        <li>Drag and drop files between folders</li>
        <li>Quick search within folders</li>
      </ul>
    `,
    publishedAt: new Date("2025-01-10"),
    roles: ['brand'],
    category: 'feature',
    icon: FolderOpen
  },
  {
    id: "creator-crm-launch",
    title: "Creator CRM Now Available",
    description: "Save favorite creators, add notes, and track collaboration history",
    content: `
      <h2>Introducing Creator CRM</h2>
      <p>Pro and Premium brands can now save their favorite creators and track all collaboration history in one place.</p>
      
      <h3>CRM Features</h3>
      <ul>
        <li><strong>Save Creators:</strong> Bookmark creators you want to work with</li>
        <li><strong>Private Notes:</strong> Add notes only you can see</li>
        <li><strong>Folder Organization:</strong> Group creators into custom folders</li>
        <li><strong>Collaboration History:</strong> See all past bookings with each creator</li>
        <li><strong>Quick Re-booking:</strong> Book again with one click</li>
      </ul>
    `,
    publishedAt: new Date("2025-01-05"),
    roles: ['brand'],
    category: 'feature',
    icon: Heart
  },
  {
    id: "phone-verification",
    title: "Phone Verification for All Users",
    description: "Enhanced security with SMS verification during signup",
    content: `
      <h2>Phone Verification Now Required</h2>
      <p>To improve platform security and reduce fraud, all new users must now verify their phone number during signup.</p>
      
      <h3>How It Works</h3>
      <ul>
        <li>Enter your phone number during signup</li>
        <li>Receive an SMS verification code</li>
        <li>Enter the code to verify your account</li>
      </ul>
      
      <p>This helps us ensure all users are real people and makes our marketplace safer for everyone.</p>
    `,
    publishedAt: new Date("2024-12-20"),
    roles: ['all'],
    category: 'improvement',
    icon: Shield
  },
  {
    id: "real-time-messaging",
    title: "Real-Time Messaging",
    description: "Instant messaging between brands and creators",
    content: `
      <h2>Chat in Real-Time</h2>
      <p>Messages between brands and creators are now delivered instantly with our new real-time messaging system.</p>
      
      <h3>Features</h3>
      <ul>
        <li>Messages appear instantly without refreshing</li>
        <li>Unread message indicators</li>
        <li>Notification when new messages arrive</li>
        <li>Conversation history preserved</li>
      </ul>
    `,
    publishedAt: new Date("2024-12-15"),
    roles: ['all'],
    category: 'feature',
    icon: MessageSquare
  },
  {
    id: "advanced-creator-filters",
    title: "Advanced Creator Filters",
    description: "Filter creators by demographics for better targeting",
    content: `
      <h2>Find the Perfect Creator</h2>
      <p>Pro and Premium brands can now use advanced demographic filters to find creators that match their target audience.</p>
      
      <h3>New Filters</h3>
      <ul>
        <li>Age range</li>
        <li>Gender</li>
        <li>Primary language</li>
        <li>Location (country, state, city)</li>
        <li>Platform-specific follower counts</li>
      </ul>
    `,
    publishedAt: new Date("2024-12-10"),
    roles: ['brand'],
    category: 'feature',
    icon: Target
  },
  {
    id: "subscription-tiers-launch",
    title: "Brand Subscription Tiers",
    description: "New subscription plans with different features",
    content: `
      <h2>Choose Your Plan</h2>
      <p>We've launched three subscription tiers for brands with different features.</p>
      
      <h3>Available Plans</h3>
      <ul>
        <li><strong>Basic ($10/mo):</strong> Contact creators, view pricing, 10GB storage</li>
        <li><strong>Pro ($49/mo):</strong> All Basic + CRM, advanced filters, 1 campaign/month</li>
        <li><strong>Premium ($99/mo):</strong> All Pro + unlimited campaigns, 50GB storage</li>
      </ul>
      
      <p><strong>Note:</strong> CollabHunts is a discovery platform with zero transaction fees. All payments happen directly between you and creators.</p>
    `,
    publishedAt: new Date("2024-11-15"),
    roles: ['brand'],
    category: 'feature',
    icon: Star
  }
];

// Helper functions for platform updates
export function getRecentUpdates(role: 'creator' | 'brand' | null): PlatformUpdate[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return platformUpdates
    .filter(update => {
      const isRecent = update.publishedAt >= thirtyDaysAgo;
      const roleMatch = update.roles.includes('all') || (role && update.roles.includes(role));
      return isRecent && roleMatch;
    })
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function getArchivedUpdates(role: 'creator' | 'brand' | null): PlatformUpdate[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return platformUpdates
    .filter(update => {
      const isOld = update.publishedAt < thirtyDaysAgo;
      const roleMatch = update.roles.includes('all') || (role && update.roles.includes(role));
      return isOld && roleMatch;
    })
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function getUpdateById(id: string): PlatformUpdate | undefined {
  return platformUpdates.find(u => u.id === id);
}

export function formatUpdateDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getCategoryBadge(category: PlatformUpdate['category']): { label: string; color: string } {
  switch (category) {
    case 'feature':
      return { label: 'New Feature', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    case 'improvement':
      return { label: 'Improvement', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
    case 'fix':
      return { label: 'Bug Fix', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' };
    case 'announcement':
      return { label: 'Announcement', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' };
  }
}

export const knowledgeBaseCategories: KBCategory[] = [
  // CREATOR CATEGORIES
  {
    slug: "getting-started-creators",
    title: "Getting Started",
    description: "Learn how to set up your creator profile and start receiving collaboration requests",
    icon: BookOpen,
    roles: ['creator'],
    order: 1,
    articles: [
      {
        slug: "how-collabhunts-works",
        title: "How CollabHunts Works for Creators",
        content: `
          <h2>Welcome to CollabHunts!</h2>
          <p>CollabHunts is a <strong>marketplace</strong> connecting content creators like you with brands looking for authentic collaborations. Think of it like a classifieds platform for influencer partnerships.</p>
          
          <h3>The Marketplace Model</h3>
          <p>Unlike traditional influencer platforms, we don't handle payments or take transaction fees. You keep 100% of what you earn - all payments are arranged directly between you and the brand.</p>
          
          <h3>Step-by-Step Process</h3>
          <ol>
            <li><strong>Create your profile</strong> - Add your social accounts, bio, and portfolio</li>
            <li><strong>Set up service packages</strong> - Define what you offer with "Starting from" prices</li>
            <li><strong>Wait for approval</strong> - Our team reviews profiles within 1-2 business days</li>
            <li><strong>Get discovered</strong> - Brands find you via search and filters</li>
            <li><strong>Negotiate directly</strong> - Chat with brands to agree on terms and deliverables</li>
            <li><strong>Send an Agreement</strong> - Use our AI-drafted agreements for professional record-keeping</li>
            <li><strong>Deliver content & get paid</strong> - Arrange payment directly with the brand</li>
          </ol>
          
          <div class="alert alert-info">
            <strong>Pro Tip:</strong> Complete your profile with high-quality portfolio items and accurate social metrics to increase your chances of approval and collaboration requests.
          </div>
          
          <h3>What "Starting from" Pricing Means</h3>
          <p>Your package prices are displayed as "Starting from $X" to brands. This indicates your base rate - final pricing is always negotiated based on the specific requirements of each collaboration.</p>
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
          <p>Your services define what you offer to brands. Well-structured packages with clear pricing attract more collaboration requests.</p>
          
          <h3>Package Types Available</h3>
          <ul>
            <li><strong>Unbox & Review</strong> - Product unboxing and honest review content</li>
            <li><strong>Social Boost</strong> - Promotional posts, Reels, TikToks</li>
            <li><strong>Meet & Greet</strong> - In-person event appearances</li>
            <li><strong>Custom Experience</strong> - Tailored collaborations</li>
          </ul>
          
          <h3>Understanding "Starting from" Pricing</h3>
          <p>Your listed prices are shown as "Starting from $X" to brands. This is your base rate - think of it as the minimum you'd accept for a standard collaboration. Actual pricing is finalized during negotiation based on:</p>
          <ul>
            <li>Specific deliverables required</li>
            <li>Timeline and complexity</li>
            <li>Content usage rights</li>
            <li>Exclusivity requirements</li>
          </ul>
          
          <h3>Typical Deliverables</h3>
          <p>Package cards show "Typical deliverables may include:" followed by example items. This gives brands an idea of what to expect, but exact deliverables are always finalized in your agreement.</p>
          
          <h3>Pricing Tips</h3>
          <ul>
            <li>Research what creators with similar audience sizes charge</li>
            <li>Factor in your engagement rate, not just follower count</li>
            <li>Consider content production time and effort</li>
            <li>Start competitive and adjust based on demand</li>
          </ul>
        `,
        roles: ['creator'],
        order: 3
      },
      {
        slug: "understanding-agreements",
        title: "AI-Drafted Agreements",
        content: `
          <h2>Professional Agreements Made Easy</h2>
          <p>Once you've negotiated terms with a brand in chat, you can send an AI-drafted agreement that documents everything professionally.</p>
          
          <h3>What Agreements Include</h3>
          <ul>
            <li>Both parties' details (your profile, brand information)</li>
            <li>Agreed deliverables and specifications</li>
            <li>Timeline and deadlines</li>
            <li>Pricing and payment terms</li>
            <li>Content usage rights</li>
            <li>Revision expectations</li>
          </ul>
          
          <h3>How to Send an Agreement</h3>
          <ol>
            <li>Discuss terms with the brand in chat</li>
            <li>Click "Send Agreement" in the conversation</li>
            <li>Select the package type and fill in details</li>
            <li>Our AI helps draft professional language</li>
            <li>Review and send to the brand</li>
          </ol>
          
          <h3>When Brand Confirms</h3>
          <p>Once a brand confirms the agreement, it creates a documented record of your collaboration. The event automatically appears in your calendar for easy tracking.</p>
          
          <div class="alert alert-info">
            <strong>Note:</strong> Agreements are for record-keeping and mutual understanding. Payment arrangements are made directly between you and the brand.
          </div>
        `,
        roles: ['creator'],
        order: 4
      }
    ]
  },
  {
    slug: "grow-your-business",
    title: "Grow Your Business",
    description: "Tips and strategies to increase collaboration requests and maximize earnings",
    icon: Rocket,
    roles: ['creator'],
    order: 2,
    articles: [
      {
        slug: "increase-booking-rate",
        title: "How to Get More Collaboration Requests",
        content: `
          <h2>Get Discovered by More Brands</h2>
          <p>Your success on CollabHunts depends on multiple factors. Here's how to optimize each one to attract more brand inquiries.</p>
          
          <h3>1. Perfect Your Profile</h3>
          <ul>
            <li><strong>Professional Photos:</strong> Use high-quality cover images that showcase your best work</li>
            <li><strong>Compelling Bio:</strong> Write a bio that highlights your unique value and personality</li>
            <li><strong>Complete Information:</strong> Fill out every field - incomplete profiles get fewer views</li>
            <li><strong>Accurate Metrics:</strong> Keep your follower counts and engagement rates up-to-date</li>
          </ul>
          
          <h3>2. Optimize Your Pricing</h3>
          <ul>
            <li><strong>Research Competitors:</strong> See what creators with similar audiences charge</li>
            <li><strong>Start Competitive:</strong> Lower initial prices can help build your reputation</li>
            <li><strong>Offer Value:</strong> Clearly communicate what brands get for their investment</li>
            <li><strong>Be Flexible:</strong> Remember, prices are "Starting from" - you can negotiate up for complex projects</li>
          </ul>
          
          <h3>3. Respond Quickly</h3>
          <p>Brands often reach out to multiple creators. The first to respond often gets the collaboration.</p>
          <ul>
            <li>Enable notifications on your phone</li>
            <li>Respond within 2-4 hours during business hours</li>
            <li>Even if busy, acknowledge the message and give a timeline</li>
          </ul>
          
          <h3>4. Build Your Reputation</h3>
          <ul>
            <li><strong>Deliver Quality:</strong> Exceed expectations on every collaboration</li>
            <li><strong>Meet Deadlines:</strong> Late delivery kills repeat business</li>
            <li><strong>Request Reviews:</strong> Politely ask satisfied brands to leave reviews</li>
          </ul>
        `,
        roles: ['creator'],
        order: 1
      },
      {
        slug: "boost-your-profile",
        title: "Boost Your Profile Visibility",
        content: `
          <h2>Stand Out with Boost Packages</h2>
          <p>Want to get discovered faster? Our Boost packages increase your visibility in search results and attract more brand attention.</p>
          
          <h3>Available Boost Options</h3>
          <ul>
            <li><strong>Featured Badge ($29/week):</strong> Eye-catching badge that makes you stand out in search results</li>
            <li><strong>Spotlight ($49/week):</strong> Appear in the featured creators section on the homepage</li>
            <li><strong>Category Boost ($79/week):</strong> Top positioning when brands search your category</li>
          </ul>
          
          <h3>How Boost Works</h3>
          <ol>
            <li>Go to your Dashboard > Featuring tab</li>
            <li>Select the Boost package you want</li>
            <li>Complete payment</li>
            <li>Your boost activates immediately for the selected duration</li>
          </ol>
          
          <h3>What You'll See</h3>
          <ul>
            <li>Special amber gradient badge on your profile card</li>
            <li>Higher placement in search results</li>
            <li>Sparkle icon indicating featured status</li>
            <li>Increased visibility to browsing brands</li>
          </ul>
          
          <div class="alert alert-info">
            <strong>Tip:</strong> Boost works best when combined with a complete, high-quality profile. Make sure your portfolio and bio are polished before boosting!
          </div>
        `,
        roles: ['creator'],
        order: 2
      },
      {
        slug: "creator-badge-system",
        title: "Creator Badge System: Vetted & VIP",
        content: `
          <h2>Two-Tier Trust Badges for Creators</h2>
          <p>CollabHunts uses a two-tier badge system to help brands quickly identify trusted creators. Every approved creator receives badges that signal their trust level.</p>
          
          <h3>🛡️ Vetted Badge (Free)</h3>
          <p>The green shield badge appears on every approved creator profile.</p>
          <ul>
            <li><strong>What it means:</strong> CollabHunts has reviewed and approved this creator's profile</li>
            <li><strong>How to get it:</strong> Automatically applied when your profile is approved</li>
            <li><strong>Cost:</strong> Free - included with platform membership</li>
          </ul>
          
          <h3>👑 VIP Creator Badge ($99/year)</h3>
          <p>The gold crown badge signals premium, verified creators who have invested in their professional presence.</p>
          <ul>
            <li><strong>What it means:</strong> A premium creator committed to quality and professionalism</li>
            <li><strong>How to get it:</strong> Purchase from Dashboard > Profile tab</li>
            <li><strong>Cost:</strong> $99/year</li>
          </ul>
          
          <h3>VIP Creator Benefits</h3>
          <ul>
            <li>Gold crown badge displayed on your profile and in search results</li>
            <li>Higher visibility in brand searches</li>
            <li>Premium positioning in the marketplace</li>
            <li>Increased trust signal to potential brand partners</li>
          </ul>
          
          <h3>How Badges Appear</h3>
          <p>Badges appear next to your name throughout the platform:</p>
          <ul>
            <li>In marketplace search results</li>
            <li>On your profile page header</li>
            <li>In brand dashboards and conversations</li>
          </ul>
          
          <div class="alert alert-info">
            <strong>VIP Tip:</strong> Combine VIP Creator status with Boost packages for maximum visibility and the highest chance of landing premium collaborations!
          </div>
        `,
        roles: ['creator'],
        order: 3
      },
      {
        slug: "best-campaign-applications",
        title: "Applying to Brand Opportunities",
        content: `
          <h2>Stand Out in Opportunity Applications</h2>
          <p>Brands post opportunities looking for specific creators. Here's how to make your application stand out.</p>
          
          <h3>Before You Apply</h3>
          <ul>
            <li><strong>Read the Brief Carefully:</strong> Understand exactly what the brand wants</li>
            <li><strong>Check Brand Fit:</strong> Only apply to opportunities that align with your content style</li>
            <li><strong>Review Requirements:</strong> Make sure you can meet all requirements</li>
          </ul>
          
          <h3>Writing Your Application</h3>
          <ol>
            <li><strong>Personalize It:</strong> Reference the specific opportunity and brand by name</li>
            <li><strong>Show Understanding:</strong> Demonstrate you understand their goals</li>
            <li><strong>Highlight Relevance:</strong> Explain why YOU are perfect for this collaboration</li>
            <li><strong>Share Ideas:</strong> Briefly pitch 1-2 content concepts</li>
            <li><strong>Include Metrics:</strong> Mention relevant engagement rates or past results</li>
          </ol>
          
          <h3>Pricing Your Application</h3>
          <ul>
            <li>Stay within the opportunity's stated budget range</li>
            <li>Don't undervalue yourself just to win</li>
            <li>Consider the work involved vs. your normal rates</li>
            <li>Be prepared to negotiate slightly</li>
          </ul>
          
          <div class="alert alert-warning">
            <strong>Avoid:</strong> Generic copy-paste applications. Brands can tell immediately and will skip to the next applicant.
          </div>
        `,
        roles: ['creator'],
        order: 3
      },
      {
        slug: "maximizing-earnings",
        title: "Maximizing Your Earnings",
        content: `
          <h2>Earn More From Your Content</h2>
          <p>Strategic pricing and service structuring can significantly increase your income.</p>
          
          <h3>Negotiation Strategies</h3>
          <p>Since all pricing is negotiable, here's how to maximize each deal:</p>
          <ul>
            <li><strong>Understand Value:</strong> Know what your content is worth based on reach and engagement</li>
            <li><strong>Add Value First:</strong> Offer suggestions that benefit the brand before discussing price</li>
            <li><strong>Bundle Services:</strong> Propose packages that increase total value</li>
            <li><strong>Consider Exclusivity:</strong> Charge more for exclusive content or category exclusivity</li>
            <li><strong>Usage Rights Premium:</strong> Extended usage rights warrant higher pricing</li>
          </ul>
          
          <h3>Upselling Opportunities</h3>
          <ul>
            <li>Offer add-ons: extra revisions, faster delivery, raw footage</li>
            <li>Suggest complementary services: "Would you also like Stories for extra reach?"</li>
            <li>Create bundles: "3 posts for a better rate than individual posts"</li>
          </ul>
          
          <h3>Build Repeat Relationships</h3>
          <ul>
            <li>Over-deliver on first collaborations to earn repeat business</li>
            <li>Offer "returning client" considerations</li>
            <li>Stay in touch with past brands</li>
            <li>Suggest relevant opportunities when you see them</li>
          </ul>
          
          <h3>Increase Your Value Over Time</h3>
          <ul>
            <li>Grow your audience = higher rates</li>
            <li>Improve engagement = more valuable to brands</li>
            <li>Build case studies from successful campaigns</li>
            <li>Get testimonials and reviews</li>
          </ul>
        `,
        roles: ['creator'],
        order: 4
      },
      {
        slug: "response-time-importance",
        title: "Why Response Time Matters",
        content: `
          <h2>Speed Wins Collaborations</h2>
          <p>Response time is one of the biggest factors in converting inquiries to collaborations.</p>
          
          <h3>The Numbers</h3>
          <ul>
            <li>Creators who respond within 1 hour are <strong>7x more likely</strong> to secure the collaboration</li>
            <li>Response within 4 hours: <strong>4x more likely</strong></li>
            <li>Response after 24 hours: Brand has likely moved on</li>
          </ul>
          
          <h3>Why Speed Matters</h3>
          <ul>
            <li>Brands often contact multiple creators at once</li>
            <li>First responders get priority consideration</li>
            <li>Quick responses signal professionalism</li>
            <li>Momentum matters - excited brands cool off quickly</li>
          </ul>
          
          <h3>How to Respond Faster</h3>
          <ul>
            <li><strong>Enable Push Notifications:</strong> Know immediately when you get a message</li>
            <li><strong>Set Response Windows:</strong> Check messages at set times throughout the day</li>
            <li><strong>Acknowledge First:</strong> Even if you can't fully respond, say "Thanks! I'll review this and get back to you within [time]"</li>
          </ul>
        `,
        roles: ['creator'],
        order: 5
      }
    ]
  },
  {
    slug: "managing-collaborations",
    title: "Managing Collaborations",
    description: "How to handle collaboration requests, negotiations, and delivery",
    icon: Briefcase,
    roles: ['creator'],
    order: 3,
    articles: [
      {
        slug: "handling-inquiries",
        title: "Handling Brand Inquiries",
        content: `
          <h2>When a Brand Reaches Out</h2>
          <p>When a brand messages you, they're interested in working together. Here's how to handle inquiries professionally.</p>
          
          <h3>Initial Response</h3>
          <ul>
            <li>Thank them for reaching out</li>
            <li>Express genuine interest in their brand/product</li>
            <li>Ask clarifying questions about their needs</li>
            <li>Share relevant examples from your portfolio</li>
          </ul>
          
          <h3>Discussing Terms</h3>
          <p>Use the chat to discuss:</p>
          <ul>
            <li>Specific deliverables they need</li>
            <li>Timeline and deadlines</li>
            <li>Content usage rights</li>
            <li>Any special requirements</li>
            <li>Pricing based on scope</li>
          </ul>
          
          <h3>When to Send an Agreement</h3>
          <p>Once you've verbally agreed on terms in chat, send a formal Agreement to document everything. This creates a professional record and shows you're serious about the collaboration.</p>
        `,
        roles: ['creator'],
        order: 1
      },
      {
        slug: "negotiating-terms",
        title: "Negotiating Terms Effectively",
        content: `
          <h2>The Art of Negotiation</h2>
          <p>Good negotiation leads to fair deals for both parties. Here's how to negotiate effectively.</p>
          
          <h3>Know Your Worth</h3>
          <ul>
            <li>Understand your audience value (size, engagement, demographics)</li>
            <li>Research market rates for your niche</li>
            <li>Have a minimum rate you won't go below</li>
            <li>Factor in production costs and time</li>
          </ul>
          
          <h3>Understand Their Needs</h3>
          <ul>
            <li>What's their goal? (awareness, sales, content library)</li>
            <li>What's their budget range?</li>
            <li>What's their timeline?</li>
            <li>Are there exclusivity requirements?</li>
          </ul>
          
          <h3>Finding Middle Ground</h3>
          <ul>
            <li>Be flexible on terms while protecting your value</li>
            <li>Offer alternatives if budget is tight ("For that budget, I could do X instead of Y")</li>
            <li>Consider long-term relationship value</li>
            <li>Document everything in the agreement</li>
          </ul>
          
          <h3>When to Walk Away</h3>
          <p>Not every opportunity is right for you. It's okay to decline if:</p>
          <ul>
            <li>Budget is significantly below your minimum</li>
            <li>Requirements don't align with your values</li>
            <li>Timeline is unrealistic</li>
            <li>Something feels off</li>
          </ul>
        `,
        roles: ['creator'],
        order: 2
      },
      {
        slug: "delivering-content",
        title: "Delivering Your Content",
        content: `
          <h2>The Delivery Process</h2>
          <p>Once you've created the content, deliver it as specified in your agreement.</p>
          
          <h3>Before Delivery</h3>
          <ul>
            <li>Review the agreement requirements</li>
            <li>Double-check all deliverables are complete</li>
            <li>Ensure quality matches or exceeds expectations</li>
            <li>Prepare files in requested formats</li>
          </ul>
          
          <h3>Delivery Methods</h3>
          <p>Arrange delivery method with the brand - common options include:</p>
          <ul>
            <li>Direct file sharing (Google Drive, Dropbox)</li>
            <li>Sending via platform messaging</li>
            <li>Posting live and sharing links</li>
          </ul>
          
          <h3>After Delivery</h3>
          <ol>
            <li>Notify the brand that content is ready</li>
            <li>Be available for any quick clarifications</li>
            <li>Handle reasonable revision requests promptly</li>
            <li>Request payment as per your agreement</li>
          </ol>
          
          <div class="alert alert-info">
            <strong>Remember:</strong> Payment is arranged directly between you and the brand. Follow up on payment according to your agreed terms.
          </div>
        `,
        roles: ['creator'],
        order: 3
      },
      {
        slug: "handling-revisions",
        title: "Handling Revision Requests",
        content: `
          <h2>Revisions Are Normal</h2>
          <p>Brands may request changes to your content. This is a normal part of the creative process.</p>
          
          <h3>Best Practices</h3>
          <ul>
            <li>Clarify revision limits in your agreements</li>
            <li>Respond to revision requests promptly</li>
            <li>Ask for specific feedback if the request is unclear</li>
            <li>Document all communication in chat</li>
          </ul>
          
          <h3>Reasonable vs. Excessive Revisions</h3>
          <p><strong>Reasonable:</strong></p>
          <ul>
            <li>Minor tweaks to wording or timing</li>
            <li>Adjustments to match brand guidelines</li>
            <li>Fixes for things you missed in the brief</li>
          </ul>
          
          <p><strong>Excessive (consider extra charges):</strong></p>
          <ul>
            <li>Complete concept changes after approval</li>
            <li>Multiple rounds beyond agreed limit</li>
            <li>Requests outside original scope</li>
          </ul>
          
          <h3>Handling Disagreements</h3>
          <p>If there's a significant disagreement about deliverables, refer back to your agreement. If you can't resolve it, contact our support team for mediation.</p>
        `,
        roles: ['creator'],
        order: 4
      }
    ]
  },
  {
    slug: "payments-creators",
    title: "Payments & Earnings",
    description: "Understanding how payments work in the marketplace model",
    icon: Wallet,
    roles: ['creator'],
    order: 4,
    articles: [
      {
        slug: "how-payments-work",
        title: "How Payments Work",
        content: `
          <h2>Direct Payment Model</h2>
          <p>CollabHunts is a discovery marketplace with <strong>zero transaction fees</strong>. All payments are arranged directly between you and the brand.</p>
          
          <h3>What This Means for You</h3>
          <ul>
            <li><strong>Keep 100%:</strong> No platform fees on your earnings</li>
            <li><strong>Flexible Payment:</strong> Arrange payment terms that work for both parties</li>
            <li><strong>Direct Relationship:</strong> Build trust directly with brands</li>
          </ul>
          
          <h3>Typical Payment Arrangements</h3>
          <p>Common structures creators use:</p>
          <ul>
            <li><strong>Full upfront:</strong> Payment before work begins</li>
            <li><strong>50/50 split:</strong> Half upfront, half on delivery</li>
            <li><strong>On delivery:</strong> Payment upon content submission</li>
            <li><strong>Net terms:</strong> Payment within X days of delivery</li>
          </ul>
          
          <h3>Document Terms in Agreements</h3>
          <p>Always include payment terms in your AI-drafted agreement. This creates a clear record of what was agreed.</p>
          
          <div class="alert alert-info">
            <strong>Tip:</strong> For new brand relationships, consider requesting a deposit or full payment upfront until trust is established.
          </div>
        `,
        roles: ['creator'],
        order: 1
      },
      {
        slug: "payment-best-practices",
        title: "Payment Best Practices",
        content: `
          <h2>Protect Yourself</h2>
          <p>Since payments happen outside the platform, here are best practices to protect yourself.</p>
          
          <h3>Before Starting Work</h3>
          <ul>
            <li>Get a signed/confirmed agreement</li>
            <li>Research the brand (website, social presence, reviews)</li>
            <li>For larger projects, request a deposit</li>
            <li>Clarify exact payment method and timeline</li>
          </ul>
          
          <h3>Payment Methods</h3>
          <p>Common options include:</p>
          <ul>
            <li>Bank transfer</li>
            <li>PayPal</li>
            <li>Wise (for international)</li>
            <li>Venmo/Zelle (domestic)</li>
          </ul>
          
          <h3>Following Up on Payment</h3>
          <ul>
            <li>Send a polite reminder when payment is due</li>
            <li>Reference your agreement terms</li>
            <li>Document all communication</li>
            <li>Contact our support if you need mediation help</li>
          </ul>
          
          <h3>Red Flags</h3>
          <p>Be cautious if a brand:</p>
          <ul>
            <li>Refuses to sign an agreement</li>
            <li>Wants extensive work before any payment</li>
            <li>Is vague about payment terms</li>
            <li>Pressures you to work outside normal terms</li>
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
    order: 5,
    articles: [
      {
        slug: "dispute-process-creators",
        title: "Issue Resolution",
        content: `
          <h2>When Issues Happen</h2>
          <p>Sometimes there may be disagreements about deliverables or payments. CollabHunts can help mediate issues.</p>
          
          <h3>Steps to Resolve Issues</h3>
          <ol>
            <li><strong>Communicate First:</strong> Try to resolve directly with the brand through chat</li>
            <li><strong>Reference Agreement:</strong> Point to what was agreed in your documented agreement</li>
            <li><strong>Seek Mediation:</strong> If you can't resolve it, contact our support team</li>
          </ol>
          
          <h3>How Mediation Works</h3>
          <ul>
            <li>Submit your concern to care@collabhunts.com</li>
            <li>Provide the agreement and relevant chat history</li>
            <li>We'll review the situation with both parties</li>
            <li>We'll provide recommendations for resolution</li>
          </ul>
          
          <h3>Protecting Yourself</h3>
          <ul>
            <li>Always use AI-drafted agreements to document terms</li>
            <li>Keep all communication in the platform chat</li>
            <li>Don't delete messages or agreements</li>
            <li>Screenshot any external communications</li>
          </ul>
          
          <div class="alert alert-info">
            <strong>Note:</strong> While we can mediate and provide recommendations, payment enforcement may require additional steps since payments happen directly between parties.
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
    order: 6,
    articles: [
      {
        slug: "allowed-content",
        title: "Allowed & Prohibited Content",
        content: `
          <h2>Content Standards</h2>
          <p>All content created through CollabHunts collaborations must comply with our community guidelines and legal requirements.</p>
          
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
          
          <h3>Platform Authenticity</h3>
          <ul>
            <li>Don't misrepresent your follower counts</li>
            <li>Don't use fake engagement</li>
            <li>Be honest about past brand relationships</li>
            <li>Keep your profile information accurate</li>
          </ul>
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
    description: "Learn how to find creators and start collaborating",
    icon: BookOpen,
    roles: ['brand'],
    order: 1,
    articles: [
      {
        slug: "how-collabhunts-works-brands",
        title: "How CollabHunts Works for Brands",
        content: `
          <h2>Welcome to CollabHunts!</h2>
          <p>CollabHunts is a <strong>discovery marketplace</strong> connecting your brand with authentic content creators. Think of it like a classifieds platform for influencer partnerships.</p>
          
          <h3>The Marketplace Model</h3>
          <p>We're a connection platform with <strong>zero transaction fees</strong>. You find creators, negotiate terms directly, and arrange payment between yourselves. We facilitate the connection, not the transaction.</p>
          
          <h3>Step-by-Step Process</h3>
          <ol>
            <li><strong>Browse creators</strong> - Search and filter to find the perfect match</li>
            <li><strong>Subscribe to contact</strong> - Choose a plan to message creators</li>
            <li><strong>Message directly</strong> - Chat to discuss your needs and negotiate terms</li>
            <li><strong>Receive agreement</strong> - Creator sends a professional AI-drafted agreement</li>
            <li><strong>Confirm collaboration</strong> - Review and confirm the agreement terms</li>
            <li><strong>Arrange payment</strong> - Pay the creator directly as agreed</li>
            <li><strong>Receive content</strong> - Get your deliverables as specified</li>
          </ol>
          
          <h3>What "Starting from" Pricing Means</h3>
          <p>Creator packages show "Starting from $X" pricing. This is their base rate - final pricing is always negotiated based on your specific requirements, timeline, and content usage needs.</p>
          
          <div class="alert alert-info">
            <strong>Tip:</strong> Take time to browse creator portfolios and reviews before reaching out. The best collaborations happen when there's genuine brand-creator fit.
          </div>
        `,
        roles: ['brand'],
        order: 1
      },
      {
        slug: "finding-creators",
        title: "Finding the Right Creators",
        content: `
          <h2>Discover Your Perfect Creators</h2>
          <p>CollabHunts offers powerful tools to find creators that match your brand's needs.</p>
          
          <h3>Search Filters</h3>
          <ul>
            <li><strong>Category:</strong> Food, Fashion, Fitness, Tech, and more</li>
            <li><strong>Location:</strong> Country, state, city</li>
            <li><strong>Follower Range:</strong> Nano to mega-influencers</li>
            <li><strong>Platform:</strong> Instagram, TikTok, YouTube</li>
            <li><strong>Package Type:</strong> Unbox & Review, Social Boost, etc.</li>
          </ul>
          
          <h3>Advanced Filters (Pro & Premium)</h3>
          <ul>
            <li>Age range</li>
            <li>Gender</li>
            <li>Primary language</li>
            <li>Ethnicity (for diverse campaigns)</li>
          </ul>
          
          <h3>Evaluating Creators</h3>
          <p>When reviewing a creator's profile, consider:</p>
          <ul>
            <li>Content quality and style alignment</li>
            <li>Engagement rate vs. follower count</li>
            <li>Portfolio examples relevant to your needs</li>
            <li>Reviews from other brands</li>
            <li>Pricing relative to your budget</li>
          </ul>
        `,
        roles: ['brand'],
        order: 2
      },
      {
        slug: "contacting-creators",
        title: "Contacting & Negotiating with Creators",
        content: `
          <h2>Starting the Conversation</h2>
          <p>With an active subscription, you can message creators directly to discuss potential collaborations.</p>
          
          <h3>Your First Message</h3>
          <p>Make a good first impression by including:</p>
          <ul>
            <li>Brief introduction of your brand</li>
            <li>Why you're interested in working with them specifically</li>
            <li>What type of content you're looking for</li>
            <li>Your timeline and budget range</li>
          </ul>
          
          <h3>Negotiating Terms</h3>
          <p>Use the chat to discuss:</p>
          <ul>
            <li>Specific deliverables you need</li>
            <li>Timeline and deadlines</li>
            <li>Content usage rights</li>
            <li>Exclusivity requirements</li>
            <li>Final pricing</li>
          </ul>
          
          <h3>Receiving an Agreement</h3>
          <p>Once terms are agreed, the creator will send you an AI-drafted agreement documenting everything. Review it carefully and confirm to proceed.</p>
          
          <div class="alert alert-info">
            <strong>Tip:</strong> Be clear about your expectations upfront. This leads to better content and smoother collaborations.
          </div>
        `,
        roles: ['brand'],
        order: 3
      },
      {
        slug: "understanding-agreements-brands",
        title: "Understanding Agreements",
        content: `
          <h2>Professional Collaboration Agreements</h2>
          <p>Creators send AI-drafted agreements to document your collaboration terms professionally.</p>
          
          <h3>What's Included</h3>
          <ul>
            <li>Both parties' details</li>
            <li>Agreed deliverables and specifications</li>
            <li>Timeline and deadlines</li>
            <li>Pricing and payment terms</li>
            <li>Content usage rights</li>
            <li>Revision expectations</li>
          </ul>
          
          <h3>Reviewing an Agreement</h3>
          <p>Before confirming, make sure:</p>
          <ul>
            <li>All deliverables are clearly specified</li>
            <li>Timeline works for your needs</li>
            <li>Price matches what you discussed</li>
            <li>Usage rights meet your marketing needs</li>
          </ul>
          
          <h3>Confirming an Agreement</h3>
          <p>When you confirm, you're agreeing to the documented terms. The collaboration will appear in your calendar for easy tracking.</p>
          
          <h3>After Confirmation</h3>
          <ul>
            <li>Arrange payment with the creator as specified</li>
            <li>Provide any materials they need (product samples, brand guidelines)</li>
            <li>Be available to answer questions</li>
            <li>Review deliverables when ready</li>
          </ul>
        `,
        roles: ['brand'],
        order: 4
      }
    ]
  },
  {
    slug: "subscriptions-brands",
    title: "Subscriptions & Pricing",
    description: "Understanding subscription tiers and features",
    icon: Star,
    roles: ['brand'],
    order: 2,
    articles: [
      {
        slug: "subscription-tiers",
        title: "Subscription Tiers Explained",
        content: `
          <h2>Choose the Right Plan</h2>
          <p>CollabHunts is a discovery platform with <strong>zero transaction fees</strong>. Your subscription unlocks platform features - all payments to creators happen directly between you.</p>
          
          <h3>No Package (Free)</h3>
          <ul>
            <li>Browse and search creators</li>
            <li>View profiles and portfolios</li>
          </ul>
          
          <h3>Basic ($10/month)</h3>
          <ul>
            <li>Everything free users get</li>
            <li>Chat & negotiate with creators</li>
            <li>View all creator pricing</li>
            <li>10 GB Content Library</li>
          </ul>
          
          <h3>Pro ($49/month)</h3>
          <ul>
            <li>Everything in Basic</li>
            <li>Post 1 opportunity per month</li>
            <li>Advanced demographic filters (age, language, ethnicity)</li>
            <li>Creator CRM (save creators, add notes, organize folders)</li>
            <li>Mass messaging (up to 50 creators/day)</li>
            <li>Verified Business Badge eligibility</li>
          </ul>
          
          <h3>Premium ($99/month)</h3>
          <ul>
            <li>Everything in Pro</li>
            <li>Post unlimited opportunities</li>
            <li>50 GB Content Library</li>
            <li>Mass messaging (up to 100 creators/day)</li>
            <li>Priority customer support (Coming Soon)</li>
          </ul>
          
          <div class="alert alert-info">
            <strong>Note:</strong> Your subscription covers platform access only. Creator payments are arranged directly - we don't process transactions or charge fees on collaborations.
          </div>
        `,
        roles: ['brand'],
        order: 1
      },
      {
        slug: "verified-business-badge",
        title: "Verified Business Badge",
        content: `
          <h2>Build Trust with Creators</h2>
          <p>Pro and Premium brands can apply for a Verified Business Badge to stand out and build credibility.</p>
          
          <h3>What You Get</h3>
          <ul>
            <li><strong>Verified Checkmark:</strong> Displayed on your profile and in messages</li>
            <li><strong>Higher Trust:</strong> Creators are more likely to respond</li>
            <li><strong>Better Response Rates:</strong> Stand out from unverified brands</li>
            <li><strong>Professional Image:</strong> Show you're a legitimate business</li>
          </ul>
          
          <h3>Requirements</h3>
          <ul>
            <li>Pro or Premium subscription</li>
            <li>Verified phone number</li>
            <li>$99/year verification fee</li>
            <li>Pass our business verification review</li>
          </ul>
          
          <h3>How to Apply</h3>
          <ol>
            <li>Go to your Brand Dashboard</li>
            <li>Find the "Get Verified" card</li>
            <li>Complete the verification payment</li>
            <li>Our team reviews your application (1-3 business days)</li>
            <li>Badge activated upon approval</li>
          </ol>
        `,
        roles: ['brand'],
        order: 2
      }
    ]
  },
  {
    slug: "opportunities-brands",
    title: "Posting Opportunities",
    description: "Let creators come to you with opportunity listings",
    icon: Megaphone,
    roles: ['brand'],
    order: 3,
    articles: [
      {
        slug: "creating-opportunities",
        title: "Creating Opportunity Posts",
        content: `
          <h2>Let Creators Come to You</h2>
          <p>Instead of reaching out to individual creators, post an opportunity and receive applications from interested creators.</p>
          
          <h3>Opportunity Pricing</h3>
          <ul>
            <li><strong>Standard Listing:</strong> $40 per opportunity</li>
            <li><strong>Featured Upgrade:</strong> +$25 for prominent placement</li>
          </ul>
          
          <h3>Creating an Opportunity</h3>
          <ol>
            <li>Go to your Brand Dashboard > Opportunities</li>
            <li>Click "Create Opportunity"</li>
            <li>Select a package type (Unbox & Review, Social Boost, Meet & Greet, or Custom)</li>
            <li>Add title, description, and requirements</li>
            <li>Set budget, date, and available spots</li>
            <li>Submit for approval</li>
          </ol>
          
          <h3>Package Types</h3>
          <ul>
            <li><strong>Standard Packages:</strong> Have fixed deliverables (read-only)</li>
            <li><strong>Custom Experience:</strong> Allows you to specify unique requirements</li>
          </ul>
          
          <h3>Approval Process</h3>
          <p>All opportunities are reviewed before going live. This typically takes 1-2 business days.</p>
        `,
        roles: ['brand'],
        order: 1
      },
      {
        slug: "reviewing-applications",
        title: "Reviewing Creator Applications",
        content: `
          <h2>Managing Applications</h2>
          <p>Once your opportunity is live, creators can apply. Here's how to review and select the best fits.</p>
          
          <h3>What Applications Include</h3>
          <ul>
            <li>Creator's message explaining their interest</li>
            <li>Their proposed rate</li>
            <li>Link to their full profile</li>
          </ul>
          
          <h3>Evaluating Applicants</h3>
          <p>Consider:</p>
          <ul>
            <li>Portfolio quality and relevance</li>
            <li>Audience demographics and engagement</li>
            <li>Past collaboration reviews</li>
            <li>Price vs. your budget</li>
            <li>Quality of their application message</li>
          </ul>
          
          <h3>Accepting Applicants</h3>
          <ol>
            <li>Review the application</li>
            <li>Click to accept or decline</li>
            <li>Accepted creators can message you to finalize details</li>
            <li>Negotiate final terms in chat</li>
            <li>Creator sends agreement to document terms</li>
          </ol>
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
            <li><strong>Basic:</strong> 10 GB included</li>
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
    slug: "disputes-brands",
    title: "Disputes & Support",
    description: "How to handle issues and get resolution",
    icon: AlertTriangle,
    roles: ['brand'],
    order: 5,
    articles: [
      {
        slug: "handling-issues",
        title: "Handling Collaboration Issues",
        content: `
          <h2>When Things Don't Go as Planned</h2>
          <p>Most collaborations go smoothly, but if issues arise, here's how to address them.</p>
          
          <h3>Common Issues</h3>
          <ul>
            <li>Deliverables don't match agreement</li>
            <li>Quality below expectations</li>
            <li>Missed deadlines</li>
            <li>Communication problems</li>
          </ul>
          
          <h3>Steps to Resolve</h3>
          <ol>
            <li><strong>Communicate First:</strong> Discuss the issue with the creator in chat</li>
            <li><strong>Reference Agreement:</strong> Point to what was documented</li>
            <li><strong>Propose Solution:</strong> Suggest a fair resolution (revision, partial refund, etc.)</li>
            <li><strong>Seek Mediation:</strong> If you can't resolve it, contact our support</li>
          </ol>
          
          <h3>Mediation Process</h3>
          <ul>
            <li>Email care@collabhunts.com with details</li>
            <li>Include the agreement and relevant chat history</li>
            <li>We'll review with both parties</li>
            <li>We'll provide recommendations</li>
          </ul>
          
          <div class="alert alert-info">
            <strong>Prevention:</strong> Clear agreements with specific deliverables prevent most disputes. Take time to document everything before starting.
          </div>
        `,
        roles: ['brand'],
        order: 1
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
            <li>Creating fake profiles or misrepresenting yourself</li>
            <li>Creating fake reviews or engagement</li>
            <li>Misrepresenting audience or metrics</li>
            <li>Harassment or abuse of other users</li>
            <li>Posting prohibited content</li>
          </ul>
          
          <h3>Marketplace Understanding</h3>
          <p>CollabHunts is a discovery platform. We facilitate connections but don't process payments. You're responsible for:</p>
          <ul>
            <li>Negotiating fair terms</li>
            <li>Documenting agreements</li>
            <li>Arranging and fulfilling payments directly</li>
            <li>Delivering/receiving content as agreed</li>
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
            <li>Messages and agreements on the platform</li>
            <li>Usage analytics</li>
          </ul>
          
          <h3>How We Use It</h3>
          <ul>
            <li>Providing our services</li>
            <li>Facilitating connections and messaging</li>
            <li>Improving the platform</li>
            <li>Communicating with you</li>
          </ul>
          
          <p><a href="/privacy">Read the full Privacy Policy</a></p>
        `,
        roles: ['all'],
        order: 2
      },
      {
        slug: "marketplace-model",
        title: "Understanding the Marketplace Model",
        content: `
          <h2>How CollabHunts Works</h2>
          <p>CollabHunts operates as a classifieds-style marketplace, similar to platforms like Dubizzle or OLX, but specifically for creator-brand collaborations.</p>
          
          <h3>What This Means</h3>
          <ul>
            <li><strong>Discovery Platform:</strong> We help brands find creators and vice versa</li>
            <li><strong>Direct Relationships:</strong> You communicate and negotiate directly</li>
            <li><strong>No Transaction Fees:</strong> All payments happen between parties</li>
            <li><strong>Agreement Records:</strong> AI-drafted agreements document your terms</li>
          </ul>
          
          <h3>How We Make Money</h3>
          <p>Instead of transaction fees, we offer value-added services:</p>
          <ul>
            <li><strong>Brand Subscriptions:</strong> Access features like messaging, CRM, and filters</li>
            <li><strong>Creator Boost:</strong> Paid visibility for creators ($29-79/week)</li>
            <li><strong>Verified Badges:</strong> $99/year for verified business status</li>
            <li><strong>Opportunity Listings:</strong> $40 base + $25 for featured</li>
          </ul>
          
          <h3>Your Responsibilities</h3>
          <p>Since we don't process payments:</p>
          <ul>
            <li>Document terms clearly in agreements</li>
            <li>Arrange payment methods with your counterpart</li>
            <li>Follow through on your commitments</li>
            <li>Handle any issues professionally</li>
          </ul>
        `,
        roles: ['all'],
        order: 3
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
  const results: Array<{ category: KBCategory; article: KBArticle }> = [];
  const lowerQuery = query.toLowerCase();
  
  const categories = getCategoriesForRole(role);
  
  for (const category of categories) {
    for (const article of category.articles) {
      if (
        article.title.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery)
      ) {
        results.push({ category, article });
      }
    }
  }
  
  return results;
}
