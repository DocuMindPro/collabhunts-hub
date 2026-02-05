// Agreement template types and templates for the marketplace model

export type AgreementTemplateType = 'unbox_review' | 'social_boost' | 'meet_greet' | 'content_creation' | 'custom';

export interface DeliverableItem {
  description: string;
  quantity: number;
  completed?: boolean;
}

export interface AgreementTemplate {
  id: AgreementTemplateType;
  name: string;
  description: string;
  icon: string;
  defaultDeliverables: DeliverableItem[];
  suggestedContent: string;
}

export const AGREEMENT_TEMPLATES: Record<AgreementTemplateType, AgreementTemplate> = {
  unbox_review: {
    id: 'unbox_review',
    name: 'Unboxing & Review',
    description: 'Product unboxing video or review content',
    icon: '📦',
    defaultDeliverables: [
      { description: 'Unboxing video (60-90 seconds)', quantity: 1 },
      { description: 'Instagram Story posts', quantity: 3 },
      { description: 'Product review post', quantity: 1 },
    ],
    suggestedContent: `This Agreement is entered into between the Creator and Brand for unboxing/review content creation.

**Scope of Work:**
Creator agrees to produce authentic unboxing and review content featuring Brand's product(s).

**Content Requirements:**
- Genuine first impressions during unboxing
- Honest product review highlighting features
- Content must comply with FTC disclosure guidelines

**Timeline:**
Content to be delivered within the agreed timeframe after receiving the product.

**Usage Rights:**
Brand may repost/share the content on their own channels with creator credit.`,
  },
  social_boost: {
    id: 'social_boost',
    name: 'Social Media Boost',
    description: 'Event attendance with social media coverage',
    icon: '📱',
    defaultDeliverables: [
      { description: 'Instagram Stories from event', quantity: 5 },
      { description: 'Instagram Feed post', quantity: 1 },
      { description: 'Event attendance (hours)', quantity: 2 },
    ],
    suggestedContent: `This Agreement is entered into between the Creator and Brand for event attendance and social media coverage.

**Scope of Work:**
Creator agrees to attend Brand's event and provide live social media coverage.

**Content Requirements:**
- Real-time Instagram Stories during event
- At least one feed post featuring the event/brand
- Tag brand in all content
- Use provided hashtags

**Event Details:**
[To be filled: Date, Time, Location, Duration]

**Dress Code & Guidelines:**
Creator will dress appropriately for the event and follow any brand guidelines provided.`,
  },
  meet_greet: {
    id: 'meet_greet',
    name: 'Meet & Greet',
    description: 'Fan interaction and appearance at venue',
    icon: '🤝',
    defaultDeliverables: [
      { description: 'Hours of appearance', quantity: 2 },
      { description: 'Photos with guests', quantity: 20 },
      { description: 'Social media story posts', quantity: 3 },
    ],
    suggestedContent: `This Agreement is entered into between the Creator and Brand for a meet & greet appearance.

**Scope of Work:**
Creator agrees to appear at Brand's venue for a meet & greet session with fans/customers.

**Appearance Requirements:**
- Arrive on time at designated location
- Engage positively with attendees
- Take photos with guests
- Post about the experience on social media

**Event Details:**
[To be filled: Date, Time, Location, Duration]

**Additional Services:**
[Any additional requirements like signing merchandise, etc.]`,
  },
  content_creation: {
    id: 'content_creation',
    name: 'Content Creation',
    description: 'Custom branded content production',
    icon: '🎬',
    defaultDeliverables: [
      { description: 'Branded content video', quantity: 1 },
      { description: 'Behind-the-scenes content', quantity: 2 },
      { description: 'Product photos', quantity: 5 },
    ],
    suggestedContent: `This Agreement is entered into between the Creator and Brand for branded content creation.

**Scope of Work:**
Creator agrees to produce custom branded content as specified below.

**Content Specifications:**
- Content type and format
- Length/duration requirements
- Brand integration guidelines
- Key messaging points

**Revisions:**
One round of minor revisions included. Additional revisions may incur extra fees.

**Usage Rights:**
[Specify usage rights, duration, and platforms]

**Delivery Timeline:**
[Specify delivery deadline]`,
  },
  custom: {
    id: 'custom',
    name: 'Custom Agreement',
    description: 'Create your own custom agreement',
    icon: '✍️',
    defaultDeliverables: [],
    suggestedContent: `This Agreement is entered into between the Creator and Brand for the services described below.

**Scope of Work:**
[Describe the work to be performed]

**Deliverables:**
[List specific deliverables]

**Timeline:**
[Specify timeline and milestones]

**Compensation:**
[Specify agreed compensation]

**Terms:**
- Both parties agree to act in good faith
- Any disputes will be resolved through mutual discussion
- This agreement may be terminated by mutual consent`,
  },
};

export const getTemplateById = (id: AgreementTemplateType): AgreementTemplate => {
  return AGREEMENT_TEMPLATES[id] || AGREEMENT_TEMPLATES.custom;
};
