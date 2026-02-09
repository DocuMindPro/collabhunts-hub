// Lebanese market configuration
// City filters, payment methods, and local integrations

// Major Lebanese cities for event hosting
export const LEBANESE_CITIES = [
  { value: 'beirut', label: 'Beirut', region: 'Mount Lebanon' },
  { value: 'jounieh', label: 'Jounieh', region: 'Mount Lebanon' },
  { value: 'tripoli', label: 'Tripoli', region: 'North' },
  { value: 'sidon', label: 'Sidon (Saida)', region: 'South' },
  { value: 'tyre', label: 'Tyre', region: 'South' },
  { value: 'byblos', label: 'Byblos (Jbeil)', region: 'Mount Lebanon' },
  { value: 'zahle', label: 'Zahle', region: 'Bekaa' },
  { value: 'baalbek', label: 'Baalbek', region: 'Bekaa' },
  { value: 'aley', label: 'Aley', region: 'Mount Lebanon' },
  { value: 'batroun', label: 'Batroun', region: 'North' },
] as const;

export type LebaneseCityValue = typeof LEBANESE_CITIES[number]['value'];

// Payment methods available in Lebanon
export type PaymentMethod = 'card' | 'cod' | 'omt' | 'whish' | 'bank_transfer';

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  requiresVerification: boolean;
  processingTime: string;
  fees: string;
  available: boolean;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay instantly with Visa, Mastercard, or local cards',
    icon: 'credit-card',
    requiresVerification: false,
    processingTime: 'Instant',
    fees: '2.9% + $0.30',
    available: true,
  },
  {
    id: 'cod',
    name: 'Cash on Event Day',
    description: 'Pay cash to the creator at the venue on event day',
    icon: 'banknote',
    requiresVerification: true,
    processingTime: 'Requires venue approval',
    fees: 'No additional fees',
    available: true,
  },
  {
    id: 'omt',
    name: 'OMT Transfer',
    description: 'Transfer via OMT points across Lebanon',
    icon: 'building',
    requiresVerification: true,
    processingTime: '1-2 business days',
    fees: 'OMT standard fees apply',
    available: true,
  },
  {
    id: 'whish',
    name: 'Whish Money',
    description: 'Transfer via Whish Money mobile wallet',
    icon: 'smartphone',
    requiresVerification: true,
    processingTime: 'Same day',
    fees: 'Whish standard fees',
    available: true,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer in USD or LBP',
    icon: 'landmark',
    requiresVerification: true,
    processingTime: '2-3 business days',
    fees: 'Bank fees may apply',
    available: true,
  },
];

// WhatsApp configuration
export const WHATSAPP_CONFIG = {
  // Default country code for Lebanon
  countryCode: '+961',
  // Platform business WhatsApp number (placeholder)
  platformNumber: '+9611234567',
  // Message templates
  templates: {
    bookingConfirmation: (creatorName: string, eventDate: string, venueName: string) =>
      `🎉 Booking Confirmed!\n\nCreator: ${creatorName}\nDate: ${eventDate}\nVenue: ${venueName}\n\nYou'll receive event details soon.`,
    
    eventReminder: (eventName: string, eventDate: string, eventTime: string) =>
      `⏰ Reminder: \"${eventName}\" is tomorrow!\n\n📅 ${eventDate}\n🕐 ${eventTime}\n\nWe can't wait to see you there!`,
    
    bookingRequest: (venueName: string, eventType: string, eventDate: string) =>
      `📩 New Booking Request!\n\nVenue: ${venueName}\nEvent: ${eventType}\nDate: ${eventDate}\n\nTap to review and respond.`,

    paymentReceived: (amount: string, eventName: string) =>
      `💵 Payment Received!\n\n${amount} for \"${eventName}\"\n\nThank you! See you at the event.`,
  },
};

// Generate WhatsApp click-to-chat URL
export const generateWhatsAppLink = (
  phoneNumber: string,
  message?: string
): string => {
  // Remove any non-digit characters except +
  const cleanNumber = phoneNumber.replace(/[^\\d+]/g, '');
  // Remove leading + if present for wa.me format
  const waNumber = cleanNumber.startsWith('+') ? cleanNumber.slice(1) : cleanNumber;
  
  let url = `https://wa.me/${waNumber}`;
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }
  return url;
};

// Format Lebanese phone number
export const formatLebanesPhone = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 961, format as international
  if (digits.startsWith('961')) {
    const local = digits.slice(3);
    return `+961 ${local.slice(0, 1)} ${local.slice(1, 4)} ${local.slice(4)}`;
  }
  
  // If starts with 0, remove it and format
  if (digits.startsWith('0')) {
    const local = digits.slice(1);
    return `+961 ${local.slice(0, 1)} ${local.slice(1, 4)} ${local.slice(4)}`;
  }
  
  // Otherwise assume local format
  return `+961 ${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
};

// Validate Lebanese phone number
export const isValidLebanesePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  // Lebanese numbers: 961 + 8 digits OR 0 + 8 digits OR just 8 digits
  if (digits.startsWith('961')) {
    return digits.length === 11;
  }
  if (digits.startsWith('0')) {
    return digits.length === 9;
  }
  return digits.length === 8;
};

// Currency formatting for Lebanon (show both USD and LBP)
export const formatPriceLBP = (usdCents: number, exchangeRate: number = 89500): string => {
  const usd = usdCents / 100;
  const lbp = Math.round(usd * exchangeRate);
  return `${lbp.toLocaleString()} LBP`;
};

export const formatDualCurrency = (usdCents: number, exchangeRate: number = 89500): { usd: string; lbp: string } => {
  const usd = usdCents / 100;
  return {
    usd: `$${usd.toFixed(0)}`,
    lbp: formatPriceLBP(usdCents, exchangeRate),
  };
};

// Middle East cities for regional coverage (Brand page)
export interface MiddleEastCity {
  value: string;
  label: string;
  country: string;
}

const COUNTRY_ORDER = ['Lebanon', 'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Jordan', 'Egypt', 'Oman'];

export const MIDDLE_EAST_CITIES: MiddleEastCity[] = [
  // Lebanon
  ...LEBANESE_CITIES.map(c => ({ value: c.value, label: c.label, country: 'Lebanon' })),
  // UAE
  { value: 'dubai', label: 'Dubai', country: 'UAE' },
  { value: 'abu-dhabi', label: 'Abu Dhabi', country: 'UAE' },
  { value: 'sharjah', label: 'Sharjah', country: 'UAE' },
  // Saudi Arabia
  { value: 'riyadh', label: 'Riyadh', country: 'Saudi Arabia' },
  { value: 'jeddah', label: 'Jeddah', country: 'Saudi Arabia' },
  { value: 'dammam', label: 'Dammam', country: 'Saudi Arabia' },
  // Qatar
  { value: 'doha', label: 'Doha', country: 'Qatar' },
  // Kuwait
  { value: 'kuwait-city', label: 'Kuwait City', country: 'Kuwait' },
  // Bahrain
  { value: 'manama', label: 'Manama', country: 'Bahrain' },
  // Jordan
  { value: 'amman', label: 'Amman', country: 'Jordan' },
  // Egypt
  { value: 'cairo', label: 'Cairo', country: 'Egypt' },
  { value: 'alexandria', label: 'Alexandria', country: 'Egypt' },
  // Oman
  { value: 'muscat', label: 'Muscat', country: 'Oman' },
];

export const getMiddleEastCitiesByCountry = () => {
  const grouped: Record<string, MiddleEastCity[]> = {};
  for (const city of MIDDLE_EAST_CITIES) {
    if (!grouped[city.country]) grouped[city.country] = [];
    grouped[city.country].push(city);
  }
  return COUNTRY_ORDER.filter(c => grouped[c]).map(country => ({
    country,
    cities: grouped[country],
  }));
};

// Helper to check if city is in Lebanon
export const isLebanesCity = (city: string): boolean => {
  return LEBANESE_CITIES.some(c => 
    c.label.toLowerCase() === city.toLowerCase() ||
    c.value === city.toLowerCase()
  );
};

// Get city by value
export const getCityByValue = (value: string) => {
  return LEBANESE_CITIES.find(c => c.value === value);
};
