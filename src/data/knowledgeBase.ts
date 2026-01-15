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
  Heart
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
    publishedAt: new Date("2024-12-10"),
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
    publishedAt: new Date("2024-12-05"),
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
    publishedAt: new Date("2024-12-01"),
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
    publishedAt: new Date("2024-11-25"),
    roles: ['all'],
    category: 'improvement',
    icon: Shield
  },
  {
    id: "campaign-approval-system",
    title: "Campaign Quality Review",
    description: "All campaigns are now reviewed before going live",
    content: `
      <h2>Campaign Approval Process</h2>
      <p>To maintain marketplace quality, all brand campaigns are now reviewed by our team before becoming visible to creators.</p>
      
      <h3>What This Means</h3>
      <ul>
        <li>Campaigns are reviewed within 1-2 business days</li>
        <li>You'll be notified when your campaign is approved</li>
        <li>Only approved campaigns appear to creators</li>
        <li>Higher quality campaigns for creators to apply to</li>
      </ul>
    `,
    publishedAt: new Date("2024-11-20"),
    roles: ['brand'],
    category: 'improvement',
    icon: Award
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
    publishedAt: new Date("2024-11-15"),
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
    publishedAt: new Date("2024-11-10"),
    roles: ['brand'],
    category: 'feature',
    icon: Target
  },
  {
    id: "creator-profile-analytics",
    title: "Profile View Analytics",
    description: "Creators can now see who's viewing their profile",
    content: `
      <h2>Track Your Profile Performance</h2>
      <p>Creators can now see detailed analytics about profile views in their dashboard.</p>
      
      <h3>Analytics Include</h3>
      <ul>
        <li>Daily profile view counts</li>
        <li>View trends over time</li>
        <li>Peak viewing days</li>
      </ul>
      
      <p>Use this data to optimize your profile and understand when brands are most active.</p>
    `,
    publishedAt: new Date("2024-11-05"),
    roles: ['creator'],
    category: 'feature',
    icon: TrendingUp
  },
  // Older updates (will appear in changelog)
  {
    id: "subscription-tiers-launch",
    title: "Brand Subscription Tiers",
    description: "New subscription plans with different features and fees",
    content: `
      <h2>Choose Your Plan</h2>
      <p>We've launched three subscription tiers for brands with different features and marketplace fees.</p>
      
      <h3>Available Plans</h3>
      <ul>
        <li><strong>Basic (Free):</strong> Browse creators, 20% marketplace fee</li>
        <li><strong>Pro ($99/mo):</strong> Contact & book creators, CRM, 15% fee</li>
        <li><strong>Premium ($299/mo):</strong> Unlimited campaigns, 50GB storage, 15% fee</li>
      </ul>
    `,
    publishedAt: new Date("2024-10-15"),
    roles: ['brand'],
    category: 'feature',
    icon: Star
  },
  {
    id: "dispute-system",
    title: "Dispute Resolution System",
    description: "Fair and transparent process for resolving issues",
    content: `
      <h2>Resolving Issues Fairly</h2>
      <p>Our dispute resolution system helps brands and creators resolve issues fairly with admin oversight when needed.</p>
      
      <h3>How It Works</h3>
      <ul>
        <li>Either party can open a dispute</li>
        <li>3-day response window</li>
        <li>Negotiation period</li>
        <li>Admin review if unresolved</li>
      </ul>
    `,
    publishedAt: new Date("2024-10-01"),
    roles: ['all'],
    category: 'feature',
    icon: AlertTriangle
  },
  {
    id: "direct-collaboration",
    title: "Direct Creator Collaboration",
    description: "Connect and work directly with creators",
    content: `
      <h2>How Collaborations Work</h2>
      <p>CollabHunts connects brands with creators. All project terms and payments are arranged directly between parties.</p>
      
      <h3>Collaboration Process</h3>
      <ul>
        <li>Browse and discover verified creators</li>
        <li>Message creators to discuss your project</li>
        <li>Negotiate terms and deliverables directly</li>
        <li>Arrange payment offline between parties</li>
        <li>Receive high-quality content</li>
      </ul>
    `,
    publishedAt: new Date("2024-09-15"),
    roles: ['all'],
    category: 'feature',
    icon: MessageSquare
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
            <li><strong>Receive collaboration requests</strong> - CollabHunts will contact you when brands want to work with you</li>
            <li><strong>Deliver content</strong> - Complete the work within the agreed timeframe</li>
            <li><strong>Get paid!</strong> - CollabHunts pays you after successful delivery</li>
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
    slug: "grow-your-business",
    title: "Grow Your Business",
    description: "Tips and strategies to increase bookings and maximize earnings",
    icon: Rocket,
    roles: ['creator'],
    order: 2,
    articles: [
      {
        slug: "increase-booking-rate",
        title: "How to Increase Your Booking Rate",
        content: `
          <h2>Get More Bookings</h2>
          <p>Your booking rate depends on multiple factors. Here's how to optimize each one to attract more brands.</p>
          
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
            <li><strong>Start Competitive:</strong> Lower prices initially can help build reviews</li>
            <li><strong>Offer Bundles:</strong> Create package deals for multiple pieces of content</li>
            <li><strong>Adjust Based on Demand:</strong> Raise prices as bookings increase</li>
          </ul>
          
          <h3>3. Respond Quickly</h3>
          <p>Brands often reach out to multiple creators. The first to respond often gets the booking.</p>
          <ul>
            <li>Enable notifications on your phone</li>
            <li>Respond within 2-4 hours during business hours</li>
            <li>Even if busy, acknowledge the message and give a timeline</li>
          </ul>
          
          <h3>4. Build Your Reputation</h3>
          <ul>
            <li><strong>Deliver Quality:</strong> Exceed expectations on every booking</li>
            <li><strong>Meet Deadlines:</strong> Late delivery kills repeat business</li>
            <li><strong>Request Reviews:</strong> Politely ask satisfied brands to leave reviews</li>
          </ul>
          
          <div class="alert alert-info">
            <strong>Pro Tip:</strong> Creators with 5+ positive reviews get 3x more booking requests than those with no reviews.
          </div>
        `,
        roles: ['creator'],
        order: 1
      },
      {
        slug: "best-campaign-applications",
        title: "Best Practices for Campaign Applications",
        content: `
          <h2>Stand Out in Campaign Applications</h2>
          <p>With many creators applying to campaigns, here's how to make your application stand out.</p>
          
          <h3>Before You Apply</h3>
          <ul>
            <li><strong>Read the Brief Carefully:</strong> Understand exactly what the brand wants</li>
            <li><strong>Check Brand Fit:</strong> Only apply to campaigns that align with your content style</li>
            <li><strong>Review Requirements:</strong> Make sure you can meet all requirements</li>
          </ul>
          
          <h3>Writing Your Application</h3>
          <ol>
            <li><strong>Personalize It:</strong> Reference the specific campaign and brand by name</li>
            <li><strong>Show Understanding:</strong> Demonstrate you understand their goals</li>
            <li><strong>Highlight Relevance:</strong> Explain why YOU are perfect for this campaign</li>
            <li><strong>Share Ideas:</strong> Briefly pitch 1-2 content concepts</li>
            <li><strong>Include Metrics:</strong> Mention relevant engagement rates or past results</li>
          </ol>
          
          <h3>Example Application</h3>
          <div class="example-box">
            <p>"Hi [Brand]! I'm excited about your [Campaign Name] campaign. As a [niche] creator with [X]k engaged followers, I've worked with similar brands like [examples] with great results.</p>
            <p>For this campaign, I'm thinking a [specific content idea] would resonate with my audience because [reason]. My average engagement rate is [X]% and I typically see [results].</p>
            <p>I'd love to bring [unique value] to this collaboration!"</p>
          </div>
          
          <h3>Pricing Your Application</h3>
          <ul>
            <li>Stay within the campaign's stated budget range</li>
            <li>Don't undervalue yourself just to win</li>
            <li>Consider the work involved vs. your normal rates</li>
            <li>Be prepared to negotiate slightly</li>
          </ul>
          
          <div class="alert alert-warning">
            <strong>Avoid:</strong> Generic copy-paste applications. Brands can tell immediately and will skip to the next applicant.
          </div>
        `,
        roles: ['creator'],
        order: 2
      },
      {
        slug: "building-your-brand",
        title: "Building Your Personal Brand",
        content: `
          <h2>Create a Memorable Personal Brand</h2>
          <p>Your personal brand is what makes brands remember and choose you over others.</p>
          
          <h3>Define Your Niche</h3>
          <ul>
            <li><strong>Be Specific:</strong> "Travel creator" is generic. "Budget backpacking in Southeast Asia" is memorable</li>
            <li><strong>Find Your Angle:</strong> What unique perspective do you bring?</li>
            <li><strong>Stay Consistent:</strong> Your content should have a recognizable style</li>
          </ul>
          
          <h3>Visual Consistency</h3>
          <ul>
            <li>Use consistent colors, fonts, and editing styles</li>
            <li>Create a cohesive portfolio that tells a story</li>
            <li>Your cover photos should immediately communicate your vibe</li>
          </ul>
          
          <h3>Voice & Personality</h3>
          <ul>
            <li>Let your personality shine in your bio and messages</li>
            <li>Be authentic - brands value genuine creators</li>
            <li>Develop catchphrases or formats your audience recognizes</li>
          </ul>
          
          <h3>Portfolio Curation</h3>
          <ul>
            <li>Only show your absolute best work</li>
            <li>Include variety while maintaining your style</li>
            <li>Update regularly with fresh content</li>
            <li>Remove outdated or lower-quality pieces</li>
          </ul>
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
          
          <h3>Tiered Service Pricing</h3>
          <p>Offer multiple price points to capture different budgets:</p>
          <ul>
            <li><strong>Basic:</strong> Simple deliverable, fastest turnaround</li>
            <li><strong>Standard:</strong> More polish, includes minor revisions</li>
            <li><strong>Premium:</strong> Full production value, multiple revisions, exclusivity</li>
          </ul>
          
          <h3>Upselling Strategies</h3>
          <ul>
            <li>Offer add-ons: extra revisions, faster delivery, raw footage</li>
            <li>Suggest complementary services: "Would you also like Stories?"</li>
            <li>Create bundles: "3 posts for the price of 2.5"</li>
          </ul>
          
          <h3>Build Repeat Relationships</h3>
          <ul>
            <li>Over-deliver on first bookings to earn repeat business</li>
            <li>Offer "returning client" discounts</li>
            <li>Stay in touch with past brands</li>
            <li>Suggest relevant opportunities when you see them</li>
          </ul>
          
          <h3>Increase Your Value</h3>
          <ul>
            <li>Grow your audience = higher rates</li>
            <li>Improve engagement = more valuable to brands</li>
            <li>Build case studies from successful campaigns</li>
            <li>Get testimonials and reviews</li>
          </ul>
          
          <div class="alert alert-info">
            <strong>Rule of Thumb:</strong> Aim to increase your rates by 10-20% every 6 months as you gain experience and reviews.
          </div>
        `,
        roles: ['creator'],
        order: 4
      },
      {
        slug: "response-time-importance",
        title: "Why Response Time Matters",
        content: `
          <h2>Speed Wins Bookings</h2>
          <p>Response time is one of the biggest factors in converting inquiries to bookings.</p>
          
          <h3>The Numbers</h3>
          <ul>
            <li>Creators who respond within 1 hour are <strong>7x more likely</strong> to get booked</li>
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
            <li><strong>Use Quick Replies:</strong> Have templates ready for common questions</li>
            <li><strong>Acknowledge First:</strong> Even if you can't fully respond, say "Thanks! I'll review this and get back to you within [time]"</li>
          </ul>
          
          <h3>When You Can't Respond Immediately</h3>
          <p>If you're unavailable for an extended period:</p>
          <ul>
            <li>Update your profile status</li>
            <li>Extend delivery times temporarily</li>
            <li>Mention availability in your bio</li>
          </ul>
        `,
        roles: ['creator'],
        order: 5
      }
    ]
  },
  {
    slug: "managing-bookings-creators",
    title: "Managing Bookings",
    description: "How to handle booking requests, deliveries, and revisions",
    icon: Briefcase,
    roles: ['creator'],
    order: 3,
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
          <p>Once you've completed the content, submit your deliverables to the CollabHunts team as instructed during the project coordination.</p>
          
          <h3>What Happens After Delivery</h3>
          <ol>
            <li>CollabHunts reviews your deliverables for quality</li>
            <li>We share them with the brand for approval</li>
            <li>Brand provides feedback through us</li>
            <li>Once approved, you receive payment from CollabHunts</li>
          </ol>
          
          <div class="alert alert-warning">
            <strong>Important:</strong> Make sure your deliverables match what was agreed upon. Clear communication prevents delays.
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
    order: 4,
    articles: [
      {
        slug: "how-payments-work",
        title: "How Payments Work",
        content: `
          <h2>Managed Payment System</h2>
          <p>CollabHunts handles all payments. Brands pay us, and we pay you after successful delivery.</p>
          
          <h3>Payment Process</h3>
          <ul>
            <li><strong>Brand books you:</strong> Brand pays CollabHunts for the collaboration</li>
            <li><strong>You deliver:</strong> Complete and submit your work</li>
            <li><strong>Brand approves:</strong> Brand reviews and approves deliverables</li>
            <li><strong>You get paid:</strong> CollabHunts releases payment to you</li>
          </ul>
          
          <h3>Your Earnings</h3>
          <p>You receive the <strong>full price</strong> you set for your services. All fees are handled separately.</p>
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
    order: 5,
    articles: [
      {
        slug: "dispute-process-creators",
        title: "Issue Resolution",
        content: `
          <h2>When Issues Happen</h2>
          <p>Sometimes there may be disagreements about deliverables. CollabHunts acts as a mediator to resolve issues fairly.</p>
          
          <h3>Resolution Process</h3>
          <ol>
            <li><strong>Issue Reported:</strong> Either party raises a concern with our team</li>
            <li><strong>Review:</strong> CollabHunts reviews the situation with both parties</li>
            <li><strong>Resolution:</strong> Our team makes a fair decision based on the agreement</li>
          </ol>
          
          <h3>Possible Outcomes</h3>
          <ul>
            <li><strong>Full payment to you:</strong> Work meets agreed requirements</li>
            <li><strong>Full refund to brand:</strong> Significant issues with delivery</li>
            <li><strong>Partial payment:</strong> Compromise when both parties share responsibility</li>
          </ul>
          
          <div class="alert alert-info">
            <strong>Tip:</strong> Always keep records and communicate through CollabHunts. This helps us resolve issues quickly and fairly.
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
      },
      {
        slug: "choosing-right-creator",
        title: "How to Choose the Right Creator",
        content: `
          <h2>Beyond Follower Count</h2>
          <p>The best creator for your campaign isn't always the one with the most followers. Here's what really matters.</p>
          
          <h3>Key Factors to Consider</h3>
          <ul>
            <li><strong>Engagement Rate:</strong> High engagement indicates an active, trusting audience</li>
            <li><strong>Content Quality:</strong> Does their style match your brand aesthetic?</li>
            <li><strong>Audience Demographics:</strong> Are their followers your target customers?</li>
            <li><strong>Brand Alignment:</strong> Do they authentically use products like yours?</li>
            <li><strong>Past Performance:</strong> Check reviews from other brands</li>
          </ul>
          
          <h3>Red Flags to Watch</h3>
          <ul>
            <li>Unusually low engagement for their follower count (potential fake followers)</li>
            <li>No portfolio or poor quality samples</li>
            <li>Pricing that seems too good to be true</li>
            <li>Slow response times during inquiry</li>
          </ul>
          
          <h3>Micro vs. Macro Influencers</h3>
          <table>
            <tr><th>Micro (10k-100k)</th><th>Macro (100k+)</th></tr>
            <tr><td>Higher engagement rates</td><td>Broader reach</td></tr>
            <tr><td>More affordable</td><td>More brand awareness</td></tr>
            <tr><td>Niche audiences</td><td>Diverse audiences</td></tr>
            <tr><td>More authentic feel</td><td>More polished content</td></tr>
          </table>
          
          <div class="alert alert-info">
            <strong>Pro Tip:</strong> Consider booking multiple micro-influencers instead of one macro-influencer for better ROI on most campaigns.
          </div>
        `,
        roles: ['brand'],
        order: 3
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
        title: "How to Book a Creator",
        content: `
          <h2>Managed Booking Process</h2>
          <p>All creator collaborations are managed by CollabHunts. Here's how it works:</p>
          
          <ol>
            <li>Find a creator you want to work with</li>
            <li>Click "Book This Service" on their profile</li>
            <li>Contact CollabHunts with your project details</li>
            <li>We coordinate with the creator and finalize terms</li>
            <li>Make payment securely to CollabHunts</li>
            <li>Receive your content</li>
          </ol>
          
          <h3>Why Managed Bookings?</h3>
          <ul>
            <li><strong>Quality Assurance:</strong> We ensure deliverables meet expectations</li>
            <li><strong>Payment Protection:</strong> Secure transactions through CollabHunts</li>
            <li><strong>Dispute Resolution:</strong> We mediate if issues arise</li>
            <li><strong>Hassle-Free:</strong> We handle all the coordination</li>
          </ul>
        `,
        roles: ['brand'],
        order: 1
      },
      {
        slug: "reviewing-deliverables",
        title: "Reviewing Deliverables",
        content: `
          <h2>Content Review Process</h2>
          <p>When a creator completes your project, CollabHunts will share the deliverables with you for review.</p>
          
          <h3>Your Options</h3>
          <ul>
            <li><strong>Approve:</strong> Confirm the content meets your requirements</li>
            <li><strong>Request Changes:</strong> Ask for specific revisions through our team</li>
            <li><strong>Report Issues:</strong> Contact us if there are significant problems</li>
          </ul>
          
          <div class="alert alert-info">
            <strong>Note:</strong> CollabHunts manages the revision process to ensure smooth communication between you and the creator.
          </div>
        `,
        roles: ['brand'],
        order: 2
      },
      {
        slug: "writing-effective-briefs",
        title: "Writing Effective Campaign Briefs",
        content: `
          <h2>Clear Briefs = Better Results</h2>
          <p>The quality of content you receive directly depends on the clarity of your brief.</p>
          
          <h3>Essential Brief Elements</h3>
          <ol>
            <li><strong>Campaign Objective:</strong> What do you want to achieve? (awareness, sales, engagement)</li>
            <li><strong>Target Audience:</strong> Who should the content appeal to?</li>
            <li><strong>Key Messages:</strong> What must be communicated?</li>
            <li><strong>Content Requirements:</strong> Format, length, style preferences</li>
            <li><strong>Brand Guidelines:</strong> Colors, logos, dos and don'ts</li>
            <li><strong>Timeline:</strong> Important dates and deadlines</li>
            <li><strong>Examples:</strong> Links to content you like (and dislike)</li>
          </ol>
          
          <h3>What to Avoid</h3>
          <ul>
            <li>Vague instructions like "make it cool"</li>
            <li>Too many requirements that stifle creativity</li>
            <li>Unrealistic expectations for the budget</li>
            <li>Missing information that causes back-and-forth</li>
          </ul>
          
          <h3>Template Brief</h3>
          <div class="example-box">
            <p><strong>Campaign:</strong> [Name]<br>
            <strong>Product:</strong> [What you're promoting]<br>
            <strong>Objective:</strong> [Awareness/Sales/Engagement]<br>
            <strong>Target Audience:</strong> [Demographics]<br>
            <strong>Key Message:</strong> [Main point to convey]<br>
            <strong>Content Type:</strong> [Post/Story/Video etc.]<br>
            <strong>Must Include:</strong> [Required elements]<br>
            <strong>Avoid:</strong> [Things not to do]<br>
            <strong>Examples:</strong> [Links to reference content]<br>
            <strong>Deadline:</strong> [Date]</p>
          </div>
        `,
        roles: ['brand'],
        order: 3
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
          
          <h3>Basic ($39/month)</h3>
          <ul>
            <li>Contact and message creators</li>
            <li>View all creator pricing</li>
            <li>10 GB Content Library</li>
          </ul>
          
          <h3>Pro ($99/month)</h3>
          <ul>
            <li>All Basic features</li>
            <li>Creator CRM (save, notes, folders)</li>
            <li>Advanced demographic filters</li>
            <li>1 active campaign per month</li>
            <li>Mass messaging</li>
          </ul>
          
          <h3>Premium ($299/month)</h3>
          <ul>
            <li>All Pro features</li>
            <li>50 GB Content Library</li>
            <li>Unlimited campaigns</li>
            <li>Priority support</li>
          </ul>
          
          <h3>How Bookings Work</h3>
          <p>CollabHunts is a discovery platform. Once you find creators you want to work with, message them directly to discuss your project and negotiate terms. All payments and transactions are handled offline between you and the creator.</p>
        `,
        roles: ['brand'],
        order: 1
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
      },
      {
        slug: "maximizing-campaign-results",
        title: "Maximizing Your Campaign Results",
        content: `
          <h2>Get Better ROI</h2>
          <p>Follow these best practices to maximize the impact of your influencer campaigns.</p>
          
          <h3>Before the Campaign</h3>
          <ul>
            <li><strong>Set Clear Goals:</strong> Define measurable objectives (reach, engagement, sales)</li>
            <li><strong>Choose Right Creators:</strong> Prioritize relevance over reach</li>
            <li><strong>Provide Detailed Briefs:</strong> Clear expectations = better content</li>
          </ul>
          
          <h3>During the Campaign</h3>
          <ul>
            <li><strong>Be Available:</strong> Respond quickly to creator questions</li>
            <li><strong>Be Flexible:</strong> Trust creators to know their audience</li>
            <li><strong>Track Performance:</strong> Monitor metrics in real-time</li>
          </ul>
          
          <h3>After the Campaign</h3>
          <ul>
            <li><strong>Repurpose Content:</strong> Use UGC across your marketing channels</li>
            <li><strong>Build Relationships:</strong> Re-book high-performers</li>
            <li><strong>Leave Reviews:</strong> Help great creators get discovered</li>
            <li><strong>Analyze Results:</strong> Document what worked for future campaigns</li>
          </ul>
          
          <h3>Content Repurposing Ideas</h3>
          <ul>
            <li>Website hero images and testimonials</li>
            <li>Paid ad creative (with proper rights)</li>
            <li>Email marketing content</li>
            <li>Social proof on product pages</li>
            <li>Sales presentation materials</li>
          </ul>
        `,
        roles: ['brand'],
        order: 2
      },
      {
        slug: "building-creator-relationships",
        title: "Building Long-Term Creator Relationships",
        content: `
          <h2>The Power of Repeat Collaborations</h2>
          <p>Long-term creator partnerships deliver better results than one-off campaigns.</p>
          
          <h3>Benefits of Repeat Collaborations</h3>
          <ul>
            <li>Creators understand your brand better over time</li>
            <li>More authentic content as they genuinely use your product</li>
            <li>Better rates for ongoing partnerships</li>
            <li>Consistent brand presence in their content</li>
          </ul>
          
          <h3>Using the Creator CRM</h3>
          <p>Pro and Premium brands can use the Creator CRM to:</p>
          <ul>
            <li><strong>Save Favorites:</strong> Build a roster of go-to creators</li>
            <li><strong>Add Notes:</strong> Track what worked well with each creator</li>
            <li><strong>View History:</strong> See all past collaborations</li>
            <li><strong>Organize:</strong> Create folders by campaign, category, or tier</li>
          </ul>
          
          <h3>Nurturing Relationships</h3>
          <ul>
            <li>Pay promptly - approve deliverables quickly</li>
            <li>Provide constructive feedback, not just criticism</li>
            <li>Share campaign results with creators</li>
            <li>Send products they'll genuinely enjoy</li>
            <li>Consider exclusive partnerships for top performers</li>
          </ul>
        `,
        roles: ['brand'],
        order: 3
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
