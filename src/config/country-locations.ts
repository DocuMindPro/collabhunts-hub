// Country-specific location data for dynamic city/state dropdowns

export interface LocationOption {
  value: string;
  label: string;
  state?: string; // For cities, reference to the parent state/region
}

export interface LocationData {
  states: LocationOption[];
  cities: LocationOption[];
}

export const COUNTRY_LOCATIONS: Record<string, LocationData> = {
  // Lebanon - Primary market with comprehensive city coverage
  LB: {
    states: [
      { value: 'mount_lebanon', label: 'Mount Lebanon' },
      { value: 'north', label: 'North Lebanon' },
      { value: 'south', label: 'South Lebanon' },
      { value: 'bekaa', label: 'Bekaa' },
      { value: 'nabatieh', label: 'Nabatieh' },
      { value: 'akkar', label: 'Akkar' },
      { value: 'baalbek_hermel', label: 'Baalbek-Hermel' },
    ],
    cities: [
      // Mount Lebanon
      { value: 'beirut', label: 'Beirut', state: 'mount_lebanon' },
      { value: 'jounieh', label: 'Jounieh', state: 'mount_lebanon' },
      { value: 'byblos', label: 'Byblos (Jbeil)', state: 'mount_lebanon' },
      { value: 'zouk_mikael', label: 'Zouk Mikael', state: 'mount_lebanon' },
      { value: 'kaslik', label: 'Kaslik', state: 'mount_lebanon' },
      { value: 'aley', label: 'Aley', state: 'mount_lebanon' },
      { value: 'broummana', label: 'Broummana', state: 'mount_lebanon' },
      { value: 'dbayeh', label: 'Dbayeh', state: 'mount_lebanon' },
      { value: 'antelias', label: 'Antelias', state: 'mount_lebanon' },
      { value: 'baabda', label: 'Baabda', state: 'mount_lebanon' },
      { value: 'hazmieh', label: 'Hazmieh', state: 'mount_lebanon' },
      { value: 'sin_el_fil', label: 'Sin el Fil', state: 'mount_lebanon' },
      { value: 'dekwaneh', label: 'Dekwaneh', state: 'mount_lebanon' },
      { value: 'bourj_hammoud', label: 'Bourj Hammoud', state: 'mount_lebanon' },
      { value: 'bikfaya', label: 'Bikfaya', state: 'mount_lebanon' },
      { value: 'beit_mery', label: 'Beit Mery', state: 'mount_lebanon' },
      { value: 'choueifat', label: 'Choueifat', state: 'mount_lebanon' },
      { value: 'khaldeh', label: 'Khaldeh', state: 'mount_lebanon' },
      // North Lebanon
      { value: 'tripoli', label: 'Tripoli', state: 'north' },
      { value: 'batroun', label: 'Batroun', state: 'north' },
      { value: 'zgharta', label: 'Zgharta', state: 'north' },
      { value: 'bcharre', label: 'Bcharre', state: 'north' },
      { value: 'koura', label: 'Koura', state: 'north' },
      { value: 'ehden', label: 'Ehden', state: 'north' },
      { value: 'chekka', label: 'Chekka', state: 'north' },
      { value: 'enfeh', label: 'Enfeh', state: 'north' },
      // South Lebanon
      { value: 'sidon', label: 'Sidon (Saida)', state: 'south' },
      { value: 'tyre', label: 'Tyre', state: 'south' },
      { value: 'jezzine', label: 'Jezzine', state: 'south' },
      { value: 'bint_jbeil', label: 'Bint Jbeil', state: 'south' },
      { value: 'marjayoun', label: 'Marjayoun', state: 'south' },
      // Nabatieh
      { value: 'nabatieh_city', label: 'Nabatieh', state: 'nabatieh' },
      { value: 'hasbaya', label: 'Hasbaya', state: 'nabatieh' },
      // Bekaa
      { value: 'zahle', label: 'Zahle', state: 'bekaa' },
      { value: 'chtaura', label: 'Chtaura', state: 'bekaa' },
      { value: 'rayak', label: 'Rayak', state: 'bekaa' },
      { value: 'anjar', label: 'Anjar', state: 'bekaa' },
      // Baalbek-Hermel
      { value: 'baalbek', label: 'Baalbek', state: 'baalbek_hermel' },
      { value: 'hermel', label: 'Hermel', state: 'baalbek_hermel' },
      // Akkar
      { value: 'halba', label: 'Halba', state: 'akkar' },
      { value: 'kobayat', label: 'Kobayat', state: 'akkar' },
    ],
  },

  // United States - States with major cities
  US: {
    states: [
      { value: 'AL', label: 'Alabama' },
      { value: 'AK', label: 'Alaska' },
      { value: 'AZ', label: 'Arizona' },
      { value: 'AR', label: 'Arkansas' },
      { value: 'CA', label: 'California' },
      { value: 'CO', label: 'Colorado' },
      { value: 'CT', label: 'Connecticut' },
      { value: 'DE', label: 'Delaware' },
      { value: 'FL', label: 'Florida' },
      { value: 'GA', label: 'Georgia' },
      { value: 'HI', label: 'Hawaii' },
      { value: 'ID', label: 'Idaho' },
      { value: 'IL', label: 'Illinois' },
      { value: 'IN', label: 'Indiana' },
      { value: 'IA', label: 'Iowa' },
      { value: 'KS', label: 'Kansas' },
      { value: 'KY', label: 'Kentucky' },
      { value: 'LA', label: 'Louisiana' },
      { value: 'ME', label: 'Maine' },
      { value: 'MD', label: 'Maryland' },
      { value: 'MA', label: 'Massachusetts' },
      { value: 'MI', label: 'Michigan' },
      { value: 'MN', label: 'Minnesota' },
      { value: 'MS', label: 'Mississippi' },
      { value: 'MO', label: 'Missouri' },
      { value: 'MT', label: 'Montana' },
      { value: 'NE', label: 'Nebraska' },
      { value: 'NV', label: 'Nevada' },
      { value: 'NH', label: 'New Hampshire' },
      { value: 'NJ', label: 'New Jersey' },
      { value: 'NM', label: 'New Mexico' },
      { value: 'NY', label: 'New York' },
      { value: 'NC', label: 'North Carolina' },
      { value: 'ND', label: 'North Dakota' },
      { value: 'OH', label: 'Ohio' },
      { value: 'OK', label: 'Oklahoma' },
      { value: 'OR', label: 'Oregon' },
      { value: 'PA', label: 'Pennsylvania' },
      { value: 'RI', label: 'Rhode Island' },
      { value: 'SC', label: 'South Carolina' },
      { value: 'SD', label: 'South Dakota' },
      { value: 'TN', label: 'Tennessee' },
      { value: 'TX', label: 'Texas' },
      { value: 'UT', label: 'Utah' },
      { value: 'VT', label: 'Vermont' },
      { value: 'VA', label: 'Virginia' },
      { value: 'WA', label: 'Washington' },
      { value: 'WV', label: 'West Virginia' },
      { value: 'WI', label: 'Wisconsin' },
      { value: 'WY', label: 'Wyoming' },
      { value: 'DC', label: 'Washington D.C.' },
    ],
    cities: [
      // California
      { value: 'los_angeles', label: 'Los Angeles', state: 'CA' },
      { value: 'san_francisco', label: 'San Francisco', state: 'CA' },
      { value: 'san_diego', label: 'San Diego', state: 'CA' },
      { value: 'san_jose', label: 'San Jose', state: 'CA' },
      { value: 'sacramento', label: 'Sacramento', state: 'CA' },
      // New York
      { value: 'new_york_city', label: 'New York City', state: 'NY' },
      { value: 'buffalo', label: 'Buffalo', state: 'NY' },
      { value: 'albany', label: 'Albany', state: 'NY' },
      // Texas
      { value: 'houston', label: 'Houston', state: 'TX' },
      { value: 'dallas', label: 'Dallas', state: 'TX' },
      { value: 'austin', label: 'Austin', state: 'TX' },
      { value: 'san_antonio', label: 'San Antonio', state: 'TX' },
      // Florida
      { value: 'miami', label: 'Miami', state: 'FL' },
      { value: 'orlando', label: 'Orlando', state: 'FL' },
      { value: 'tampa', label: 'Tampa', state: 'FL' },
      { value: 'jacksonville', label: 'Jacksonville', state: 'FL' },
      // Illinois
      { value: 'chicago', label: 'Chicago', state: 'IL' },
      // Georgia
      { value: 'atlanta', label: 'Atlanta', state: 'GA' },
      // Washington
      { value: 'seattle', label: 'Seattle', state: 'WA' },
      // Massachusetts
      { value: 'boston', label: 'Boston', state: 'MA' },
      // Arizona
      { value: 'phoenix', label: 'Phoenix', state: 'AZ' },
      // Colorado
      { value: 'denver', label: 'Denver', state: 'CO' },
      // Nevada
      { value: 'las_vegas', label: 'Las Vegas', state: 'NV' },
      // Pennsylvania
      { value: 'philadelphia', label: 'Philadelphia', state: 'PA' },
      { value: 'pittsburgh', label: 'Pittsburgh', state: 'PA' },
      // Michigan
      { value: 'detroit', label: 'Detroit', state: 'MI' },
      // Ohio
      { value: 'columbus', label: 'Columbus', state: 'OH' },
      { value: 'cleveland', label: 'Cleveland', state: 'OH' },
      // Tennessee
      { value: 'nashville', label: 'Nashville', state: 'TN' },
      { value: 'memphis', label: 'Memphis', state: 'TN' },
      // North Carolina
      { value: 'charlotte', label: 'Charlotte', state: 'NC' },
      { value: 'raleigh', label: 'Raleigh', state: 'NC' },
      // Washington D.C.
      { value: 'washington_dc', label: 'Washington D.C.', state: 'DC' },
      // Maryland
      { value: 'baltimore', label: 'Baltimore', state: 'MD' },
      // Oregon
      { value: 'portland', label: 'Portland', state: 'OR' },
      // Louisiana
      { value: 'new_orleans', label: 'New Orleans', state: 'LA' },
      // Minnesota
      { value: 'minneapolis', label: 'Minneapolis', state: 'MN' },
    ],
  },

  // United Arab Emirates
  AE: {
    states: [
      { value: 'dubai', label: 'Dubai' },
      { value: 'abu_dhabi', label: 'Abu Dhabi' },
      { value: 'sharjah', label: 'Sharjah' },
      { value: 'ajman', label: 'Ajman' },
      { value: 'ras_al_khaimah', label: 'Ras Al Khaimah' },
      { value: 'fujairah', label: 'Fujairah' },
      { value: 'umm_al_quwain', label: 'Umm Al Quwain' },
    ],
    cities: [
      { value: 'dubai_city', label: 'Dubai City', state: 'dubai' },
      { value: 'abu_dhabi_city', label: 'Abu Dhabi City', state: 'abu_dhabi' },
      { value: 'sharjah_city', label: 'Sharjah City', state: 'sharjah' },
      { value: 'ajman_city', label: 'Ajman City', state: 'ajman' },
    ],
  },

  // Saudi Arabia
  SA: {
    states: [
      { value: 'riyadh_region', label: 'Riyadh Region' },
      { value: 'makkah_region', label: 'Makkah Region' },
      { value: 'eastern_province', label: 'Eastern Province' },
      { value: 'madinah_region', label: 'Madinah Region' },
    ],
    cities: [
      { value: 'riyadh', label: 'Riyadh', state: 'riyadh_region' },
      { value: 'jeddah', label: 'Jeddah', state: 'makkah_region' },
      { value: 'mecca', label: 'Mecca', state: 'makkah_region' },
      { value: 'medina', label: 'Medina', state: 'madinah_region' },
      { value: 'dammam', label: 'Dammam', state: 'eastern_province' },
      { value: 'dhahran', label: 'Dhahran', state: 'eastern_province' },
    ],
  },
};

// Helper to check if a country has location data
export const hasLocationData = (countryCode: string): boolean => {
  return countryCode in COUNTRY_LOCATIONS;
};

// Get states for a country
export const getStatesForCountry = (countryCode: string): LocationOption[] => {
  return COUNTRY_LOCATIONS[countryCode]?.states || [];
};

// Get cities for a country, optionally filtered by state
export const getCitiesForCountry = (countryCode: string, stateValue?: string): LocationOption[] => {
  const locationData = COUNTRY_LOCATIONS[countryCode];
  if (!locationData) return [];
  
  if (stateValue) {
    return locationData.cities.filter(city => city.state === stateValue);
  }
  
  return locationData.cities;
};

// Get state label from value
export const getStateLabel = (countryCode: string, stateValue: string): string => {
  const states = getStatesForCountry(countryCode);
  return states.find(s => s.value === stateValue)?.label || stateValue;
};

// Get city label from value
export const getCityLabel = (countryCode: string, cityValue: string): string => {
  const cities = COUNTRY_LOCATIONS[countryCode]?.cities || [];
  return cities.find(c => c.value === cityValue)?.label || cityValue;
};
