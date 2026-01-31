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
  // Lebanon - Primary market with comprehensive city coverage (120+ cities)
  LB: {
    states: [
      { value: 'mount_lebanon', label: 'Mount Lebanon' },
      { value: 'beirut', label: 'Beirut' },
      { value: 'north', label: 'North Lebanon' },
      { value: 'south', label: 'South Lebanon' },
      { value: 'bekaa', label: 'Bekaa' },
      { value: 'nabatieh', label: 'Nabatieh' },
      { value: 'akkar', label: 'Akkar' },
      { value: 'baalbek_hermel', label: 'Baalbek-Hermel' },
    ],
    cities: [
      // Beirut (Capital - separate governorate)
      { value: 'beirut_central', label: 'Beirut Central', state: 'beirut' },
      { value: 'achrafieh', label: 'Achrafieh', state: 'beirut' },
      { value: 'hamra', label: 'Hamra', state: 'beirut' },
      { value: 'verdun', label: 'Verdun', state: 'beirut' },
      { value: 'gemmayze', label: 'Gemmayze', state: 'beirut' },
      { value: 'mar_mikhael', label: 'Mar Mikhael', state: 'beirut' },
      { value: 'ras_beirut', label: 'Ras Beirut', state: 'beirut' },
      { value: 'badaro', label: 'Badaro', state: 'beirut' },
      { value: 'mazraa', label: 'Mazraa', state: 'beirut' },
      { value: 'moussaitbeh', label: 'Moussaitbeh', state: 'beirut' },
      { value: 'tariq_el_jdideh', label: 'Tariq El Jdideh', state: 'beirut' },
      { value: 'ain_el_mreisseh', label: 'Ain El Mreisseh', state: 'beirut' },
      
      // Mount Lebanon - Metn
      { value: 'jounieh', label: 'Jounieh', state: 'mount_lebanon' },
      { value: 'byblos', label: 'Byblos (Jbeil)', state: 'mount_lebanon' },
      { value: 'zouk_mikael', label: 'Zouk Mikael', state: 'mount_lebanon' },
      { value: 'zouk_mosbeh', label: 'Zouk Mosbeh', state: 'mount_lebanon' },
      { value: 'kaslik', label: 'Kaslik', state: 'mount_lebanon' },
      { value: 'dbayeh', label: 'Dbayeh', state: 'mount_lebanon' },
      { value: 'antelias', label: 'Antelias', state: 'mount_lebanon' },
      { value: 'jal_el_dib', label: 'Jal El Dib', state: 'mount_lebanon' },
      { value: 'sin_el_fil', label: 'Sin el Fil', state: 'mount_lebanon' },
      { value: 'dekwaneh', label: 'Dekwaneh', state: 'mount_lebanon' },
      { value: 'bourj_hammoud', label: 'Bourj Hammoud', state: 'mount_lebanon' },
      { value: 'mansourieh', label: 'Mansourieh', state: 'mount_lebanon' },
      { value: 'fanar', label: 'Fanar', state: 'mount_lebanon' },
      { value: 'naccache', label: 'Naccache', state: 'mount_lebanon' },
      { value: 'rabieh', label: 'Rabieh', state: 'mount_lebanon' },
      { value: 'yarze', label: 'Yarze', state: 'mount_lebanon' },
      { value: 'jdeideh', label: 'Jdeideh', state: 'mount_lebanon' },
      { value: 'zalka', label: 'Zalka', state: 'mount_lebanon' },
      { value: 'dora', label: 'Dora', state: 'mount_lebanon' },
      { value: 'bikfaya', label: 'Bikfaya', state: 'mount_lebanon' },
      { value: 'beit_mery', label: 'Beit Mery', state: 'mount_lebanon' },
      { value: 'broummana', label: 'Broummana', state: 'mount_lebanon' },
      { value: 'baabda', label: 'Baabda', state: 'mount_lebanon' },
      { value: 'hazmieh', label: 'Hazmieh', state: 'mount_lebanon' },
      { value: 'hadath', label: 'Hadath', state: 'mount_lebanon' },
      
      // Mount Lebanon - Keserwan & Jbeil
      { value: 'sahel_alma', label: 'Sahel Alma', state: 'mount_lebanon' },
      { value: 'ghazir', label: 'Ghazir', state: 'mount_lebanon' },
      { value: 'kfarhbab', label: 'Kfarhbab', state: 'mount_lebanon' },
      { value: 'amchit', label: 'Amchit', state: 'mount_lebanon' },
      { value: 'harissa', label: 'Harissa', state: 'mount_lebanon' },
      { value: 'tabarja', label: 'Tabarja', state: 'mount_lebanon' },
      { value: 'maameltein', label: 'Maameltein', state: 'mount_lebanon' },
      { value: 'adma', label: 'Adma', state: 'mount_lebanon' },
      { value: 'haret_sakher', label: 'Haret Sakher', state: 'mount_lebanon' },
      { value: 'sarba', label: 'Sarba', state: 'mount_lebanon' },
      { value: 'ajaltoun', label: 'Ajaltoun', state: 'mount_lebanon' },
      { value: 'jeita', label: 'Jeita', state: 'mount_lebanon' },
      { value: 'ballouneh', label: 'Ballouneh', state: 'mount_lebanon' },
      { value: 'mayrouba', label: 'Mayrouba', state: 'mount_lebanon' },
      { value: 'faraya', label: 'Faraya', state: 'mount_lebanon' },
      { value: 'faqra', label: 'Faqra', state: 'mount_lebanon' },
      { value: 'kfardebian', label: 'Kfardebian', state: 'mount_lebanon' },
      
      // Mount Lebanon - Aley & Chouf
      { value: 'aley', label: 'Aley', state: 'mount_lebanon' },
      { value: 'choueifat', label: 'Choueifat', state: 'mount_lebanon' },
      { value: 'khaldeh', label: 'Khaldeh', state: 'mount_lebanon' },
      { value: 'bchamoun', label: 'Bchamoun', state: 'mount_lebanon' },
      { value: 'aramoun', label: 'Aramoun', state: 'mount_lebanon' },
      { value: 'bhamdoun', label: 'Bhamdoun', state: 'mount_lebanon' },
      { value: 'sofar', label: 'Sofar', state: 'mount_lebanon' },
      { value: 'beiteddine', label: 'Beiteddine', state: 'mount_lebanon' },
      { value: 'deir_el_qamar', label: 'Deir El Qamar', state: 'mount_lebanon' },
      { value: 'jiyeh', label: 'Jiyeh', state: 'mount_lebanon' },
      { value: 'damour', label: 'Damour', state: 'mount_lebanon' },
      { value: 'moukhtara', label: 'Moukhtara', state: 'mount_lebanon' },
      
      // North Lebanon
      { value: 'tripoli', label: 'Tripoli', state: 'north' },
      { value: 'mina', label: 'Mina', state: 'north' },
      { value: 'batroun', label: 'Batroun', state: 'north' },
      { value: 'zgharta', label: 'Zgharta', state: 'north' },
      { value: 'bcharre', label: 'Bcharre', state: 'north' },
      { value: 'ehden', label: 'Ehden', state: 'north' },
      { value: 'chekka', label: 'Chekka', state: 'north' },
      { value: 'enfeh', label: 'Enfeh', state: 'north' },
      { value: 'beddawi', label: 'Beddawi', state: 'north' },
      { value: 'amioun', label: 'Amioun', state: 'north' },
      { value: 'kousba', label: 'Kousba', state: 'north' },
      { value: 'douma', label: 'Douma', state: 'north' },
      { value: 'tannourine', label: 'Tannourine', state: 'north' },
      { value: 'anfeh', label: 'Anfeh', state: 'north' },
      { value: 'qalamoun', label: 'Qalamoun', state: 'north' },
      { value: 'ras_maska', label: 'Ras Maska', state: 'north' },
      { value: 'kfar_aabida', label: 'Kfar Aabida', state: 'north' },
      { value: 'hasroun', label: 'Hasroun', state: 'north' },
      { value: 'hadchit', label: 'Hadchit', state: 'north' },
      { value: 'tourza', label: 'Tourza', state: 'north' },
      
      // South Lebanon
      { value: 'sidon', label: 'Sidon (Saida)', state: 'south' },
      { value: 'tyre', label: 'Tyre', state: 'south' },
      { value: 'jezzine', label: 'Jezzine', state: 'south' },
      { value: 'marjayoun', label: 'Marjayoun', state: 'south' },
      { value: 'abra', label: 'Abra', state: 'south' },
      { value: 'ghazieh', label: 'Ghazieh', state: 'south' },
      { value: 'maghdouche', label: 'Maghdouche', state: 'south' },
      { value: 'rmeileh', label: 'Rmeileh', state: 'south' },
      { value: 'sarafand', label: 'Sarafand', state: 'south' },
      { value: 'adloun', label: 'Adloun', state: 'south' },
      { value: 'cana', label: 'Cana', state: 'south' },
      { value: 'khiam', label: 'Khiam', state: 'south' },
      { value: 'bent_jbeil', label: 'Bint Jbeil', state: 'south' },
      { value: 'deir_mimas', label: 'Deir Mimas', state: 'south' },
      { value: 'nabatieh_el_tahta', label: 'Nabatieh El Tahta', state: 'south' },
      { value: 'maarakeh', label: 'Maarakeh', state: 'south' },
      
      // Nabatieh
      { value: 'nabatieh_city', label: 'Nabatieh', state: 'nabatieh' },
      { value: 'hasbaya', label: 'Hasbaya', state: 'nabatieh' },
      { value: 'arnoun', label: 'Arnoun', state: 'nabatieh' },
      { value: 'tebnine', label: 'Tebnine', state: 'nabatieh' },
      { value: 'kfar_tibnit', label: 'Kfar Tibnit', state: 'nabatieh' },
      { value: 'jbaa', label: 'Jbaa', state: 'nabatieh' },
      { value: 'kfarouman', label: 'Kfarouman', state: 'nabatieh' },
      { value: 'kfar_roummane', label: 'Kfar Roummane', state: 'nabatieh' },
      { value: 'jarmaq', label: 'Jarmaq', state: 'nabatieh' },
      { value: 'kawkaba', label: 'Kawkaba', state: 'nabatieh' },
      
      // Bekaa
      { value: 'zahle', label: 'Zahle', state: 'bekaa' },
      { value: 'chtaura', label: 'Chtaura', state: 'bekaa' },
      { value: 'rayak', label: 'Rayak', state: 'bekaa' },
      { value: 'anjar', label: 'Anjar', state: 'bekaa' },
      { value: 'ablah', label: 'Ablah', state: 'bekaa' },
      { value: 'jeb_jennine', label: 'Jeb Jennine', state: 'bekaa' },
      { value: 'marj', label: 'Marj', state: 'bekaa' },
      { value: 'rashaya', label: 'Rashaya', state: 'bekaa' },
      { value: 'saghbine', label: 'Saghbine', state: 'bekaa' },
      { value: 'kabb_elias', label: 'Kabb Elias', state: 'bekaa' },
      { value: 'bar_elias', label: 'Bar Elias', state: 'bekaa' },
      { value: 'taanayel', label: 'Taanayel', state: 'bekaa' },
      { value: 'ferzol', label: 'Ferzol', state: 'bekaa' },
      { value: 'majdel_anjar', label: 'Majdel Anjar', state: 'bekaa' },
      { value: 'saadnayel', label: 'Saadnayel', state: 'bekaa' },
      { value: 'joubb_jannine', label: 'Joubb Jannine', state: 'bekaa' },
      { value: 'machghara', label: 'Machghara', state: 'bekaa' },
      
      // Baalbek-Hermel
      { value: 'baalbek', label: 'Baalbek', state: 'baalbek_hermel' },
      { value: 'hermel', label: 'Hermel', state: 'baalbek_hermel' },
      { value: 'labweh', label: 'Labweh', state: 'baalbek_hermel' },
      { value: 'ras_baalbek', label: 'Ras Baalbek', state: 'baalbek_hermel' },
      { value: 'arsal', label: 'Arsal', state: 'baalbek_hermel' },
      { value: 'nabi_sheet', label: 'Nabi Sheet', state: 'baalbek_hermel' },
      { value: 'deir_el_ahmar', label: 'Deir El Ahmar', state: 'baalbek_hermel' },
      { value: 'chaat', label: 'Chaat', state: 'baalbek_hermel' },
      { value: 'brital', label: 'Brital', state: 'baalbek_hermel' },
      { value: 'younine', label: 'Younine', state: 'baalbek_hermel' },
      
      // Akkar
      { value: 'halba', label: 'Halba', state: 'akkar' },
      { value: 'kobayat', label: 'Kobayat', state: 'akkar' },
      { value: 'qoubaiyat', label: 'Qoubaiyat', state: 'akkar' },
      { value: 'bebnine', label: 'Bebnine', state: 'akkar' },
      { value: 'fneidek', label: 'Fneidek', state: 'akkar' },
      { value: 'tikrit', label: 'Tikrit', state: 'akkar' },
      { value: 'minyara', label: 'Minyara', state: 'akkar' },
      { value: 'rahbe', label: 'Rahbe', state: 'akkar' },
      { value: 'michmich', label: 'Michmich', state: 'akkar' },
      { value: 'andaket', label: 'Andaket', state: 'akkar' },
      { value: 'sheikh_mohammad', label: 'Sheikh Mohammad', state: 'akkar' },
      { value: 'aaidamoun', label: 'Aaidamoun', state: 'akkar' },
      { value: 'berkayel', label: 'Berkayel', state: 'akkar' },
      { value: 'kherbet_daoud', label: 'Kherbet Daoud', state: 'akkar' },
    ],
  },

  // United Arab Emirates - Comprehensive coverage
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
      // Dubai
      { value: 'dubai_downtown', label: 'Downtown Dubai', state: 'dubai' },
      { value: 'dubai_marina', label: 'Dubai Marina', state: 'dubai' },
      { value: 'jbr', label: 'JBR', state: 'dubai' },
      { value: 'business_bay', label: 'Business Bay', state: 'dubai' },
      { value: 'deira', label: 'Deira', state: 'dubai' },
      { value: 'bur_dubai', label: 'Bur Dubai', state: 'dubai' },
      { value: 'al_barsha', label: 'Al Barsha', state: 'dubai' },
      { value: 'jumeirah', label: 'Jumeirah', state: 'dubai' },
      { value: 'palm_jumeirah', label: 'Palm Jumeirah', state: 'dubai' },
      { value: 'al_quoz', label: 'Al Quoz', state: 'dubai' },
      { value: 'dubai_silicon_oasis', label: 'Dubai Silicon Oasis', state: 'dubai' },
      { value: 'dubai_hills', label: 'Dubai Hills', state: 'dubai' },
      { value: 'jlt', label: 'JLT', state: 'dubai' },
      { value: 'difc', label: 'DIFC', state: 'dubai' },
      { value: 'motor_city', label: 'Motor City', state: 'dubai' },
      { value: 'dubai_sports_city', label: 'Dubai Sports City', state: 'dubai' },
      { value: 'arabian_ranches', label: 'Arabian Ranches', state: 'dubai' },
      { value: 'mirdif', label: 'Mirdif', state: 'dubai' },
      { value: 'al_rashidiya', label: 'Al Rashidiya', state: 'dubai' },
      { value: 'dubai_international_city', label: 'International City', state: 'dubai' },
      
      // Abu Dhabi
      { value: 'abu_dhabi_city', label: 'Abu Dhabi City', state: 'abu_dhabi' },
      { value: 'al_reem_island', label: 'Al Reem Island', state: 'abu_dhabi' },
      { value: 'yas_island', label: 'Yas Island', state: 'abu_dhabi' },
      { value: 'saadiyat_island', label: 'Saadiyat Island', state: 'abu_dhabi' },
      { value: 'al_ain', label: 'Al Ain', state: 'abu_dhabi' },
      { value: 'khalifa_city', label: 'Khalifa City', state: 'abu_dhabi' },
      { value: 'mussafah', label: 'Mussafah', state: 'abu_dhabi' },
      { value: 'al_raha', label: 'Al Raha', state: 'abu_dhabi' },
      { value: 'corniche', label: 'Corniche', state: 'abu_dhabi' },
      { value: 'al_maryah_island', label: 'Al Maryah Island', state: 'abu_dhabi' },
      { value: 'al_bateen', label: 'Al Bateen', state: 'abu_dhabi' },
      { value: 'al_wahda', label: 'Al Wahda', state: 'abu_dhabi' },
      
      // Sharjah
      { value: 'sharjah_city', label: 'Sharjah City', state: 'sharjah' },
      { value: 'al_nahda_sharjah', label: 'Al Nahda', state: 'sharjah' },
      { value: 'al_khan', label: 'Al Khan', state: 'sharjah' },
      { value: 'al_majaz', label: 'Al Majaz', state: 'sharjah' },
      { value: 'muwaileh', label: 'Muwaileh', state: 'sharjah' },
      { value: 'al_qasimia', label: 'Al Qasimia', state: 'sharjah' },
      { value: 'al_taawun', label: 'Al Taawun', state: 'sharjah' },
      { value: 'al_mamzar_sharjah', label: 'Al Mamzar', state: 'sharjah' },
      
      // Ajman
      { value: 'ajman_city', label: 'Ajman City', state: 'ajman' },
      { value: 'al_nuaimiya', label: 'Al Nuaimiya', state: 'ajman' },
      { value: 'al_rashidiya_ajman', label: 'Al Rashidiya', state: 'ajman' },
      
      // Ras Al Khaimah
      { value: 'rak_city', label: 'RAK City', state: 'ras_al_khaimah' },
      { value: 'al_hamra', label: 'Al Hamra', state: 'ras_al_khaimah' },
      { value: 'khuzam', label: 'Khuzam', state: 'ras_al_khaimah' },
      
      // Fujairah
      { value: 'fujairah_city', label: 'Fujairah City', state: 'fujairah' },
      { value: 'khorfakkan', label: 'Khorfakkan', state: 'fujairah' },
      { value: 'dibba', label: 'Dibba', state: 'fujairah' },
      
      // Umm Al Quwain
      { value: 'uaq_city', label: 'UAQ City', state: 'umm_al_quwain' },
    ],
  },

  // Saudi Arabia - All 13 regions with major cities
  SA: {
    states: [
      { value: 'riyadh_region', label: 'Riyadh Region' },
      { value: 'makkah_region', label: 'Makkah Region' },
      { value: 'eastern_province', label: 'Eastern Province' },
      { value: 'madinah_region', label: 'Madinah Region' },
      { value: 'qassim', label: 'Qassim' },
      { value: 'asir', label: 'Asir' },
      { value: 'tabuk', label: 'Tabuk' },
      { value: 'hail', label: 'Hail' },
      { value: 'northern_borders', label: 'Northern Borders' },
      { value: 'jazan', label: 'Jazan' },
      { value: 'najran', label: 'Najran' },
      { value: 'al_baha', label: 'Al Baha' },
      { value: 'al_jouf', label: 'Al Jouf' },
    ],
    cities: [
      // Riyadh Region
      { value: 'riyadh', label: 'Riyadh', state: 'riyadh_region' },
      { value: 'al_kharj', label: 'Al Kharj', state: 'riyadh_region' },
      { value: 'ad_diriyah', label: 'Ad Diriyah', state: 'riyadh_region' },
      { value: 'al_majmaah', label: "Al Majma'ah", state: 'riyadh_region' },
      { value: 'al_dawadmi', label: 'Al Dawadmi', state: 'riyadh_region' },
      { value: 'wadi_al_dawasir', label: 'Wadi Al Dawasir', state: 'riyadh_region' },
      
      // Makkah Region
      { value: 'jeddah', label: 'Jeddah', state: 'makkah_region' },
      { value: 'mecca', label: 'Mecca', state: 'makkah_region' },
      { value: 'taif', label: 'Taif', state: 'makkah_region' },
      { value: 'rabigh', label: 'Rabigh', state: 'makkah_region' },
      { value: 'al_qunfudhah', label: 'Al Qunfudhah', state: 'makkah_region' },
      { value: 'al_lith', label: 'Al Lith', state: 'makkah_region' },
      
      // Eastern Province
      { value: 'dammam', label: 'Dammam', state: 'eastern_province' },
      { value: 'dhahran', label: 'Dhahran', state: 'eastern_province' },
      { value: 'khobar', label: 'Al Khobar', state: 'eastern_province' },
      { value: 'jubail', label: 'Jubail', state: 'eastern_province' },
      { value: 'qatif', label: 'Qatif', state: 'eastern_province' },
      { value: 'hofuf', label: 'Hofuf', state: 'eastern_province' },
      { value: 'ras_tanura', label: 'Ras Tanura', state: 'eastern_province' },
      { value: 'hafr_al_batin', label: 'Hafr Al Batin', state: 'eastern_province' },
      
      // Madinah Region
      { value: 'medina', label: 'Medina', state: 'madinah_region' },
      { value: 'yanbu', label: 'Yanbu', state: 'madinah_region' },
      { value: 'al_ula', label: 'Al Ula', state: 'madinah_region' },
      { value: 'badr', label: 'Badr', state: 'madinah_region' },
      
      // Qassim
      { value: 'buraidah', label: 'Buraidah', state: 'qassim' },
      { value: 'unaizah', label: 'Unaizah', state: 'qassim' },
      { value: 'ar_rass', label: 'Ar Rass', state: 'qassim' },
      
      // Asir
      { value: 'abha', label: 'Abha', state: 'asir' },
      { value: 'khamis_mushait', label: 'Khamis Mushait', state: 'asir' },
      { value: 'bisha', label: 'Bisha', state: 'asir' },
      
      // Tabuk
      { value: 'tabuk_city', label: 'Tabuk City', state: 'tabuk' },
      { value: 'neom', label: 'NEOM', state: 'tabuk' },
      { value: 'duba', label: 'Duba', state: 'tabuk' },
      
      // Hail
      { value: 'hail_city', label: 'Hail City', state: 'hail' },
      
      // Northern Borders
      { value: 'arar', label: 'Arar', state: 'northern_borders' },
      { value: 'rafha', label: 'Rafha', state: 'northern_borders' },
      
      // Jazan
      { value: 'jazan_city', label: 'Jazan City', state: 'jazan' },
      { value: 'sabya', label: 'Sabya', state: 'jazan' },
      
      // Najran
      { value: 'najran_city', label: 'Najran City', state: 'najran' },
      
      // Al Baha
      { value: 'al_baha_city', label: 'Al Baha City', state: 'al_baha' },
      
      // Al Jouf
      { value: 'sakaka', label: 'Sakaka', state: 'al_jouf' },
      { value: 'dumat_al_jandal', label: 'Dumat Al Jandal', state: 'al_jouf' },
    ],
  },

  // Kuwait
  KW: {
    states: [
      { value: 'capital', label: 'Capital (Al Asimah)' },
      { value: 'hawalli', label: 'Hawalli' },
      { value: 'farwaniya', label: 'Farwaniya' },
      { value: 'ahmadi', label: 'Ahmadi' },
      { value: 'jahra', label: 'Jahra' },
      { value: 'mubarak_al_kabeer', label: 'Mubarak Al-Kabeer' },
    ],
    cities: [
      // Capital
      { value: 'kuwait_city', label: 'Kuwait City', state: 'capital' },
      { value: 'sharq', label: 'Sharq', state: 'capital' },
      { value: 'dasman', label: 'Dasman', state: 'capital' },
      { value: 'mirqab', label: 'Mirqab', state: 'capital' },
      
      // Hawalli
      { value: 'hawalli_city', label: 'Hawalli', state: 'hawalli' },
      { value: 'salmiya', label: 'Salmiya', state: 'hawalli' },
      { value: 'salwa', label: 'Salwa', state: 'hawalli' },
      { value: 'jabriya', label: 'Jabriya', state: 'hawalli' },
      { value: 'rumaithiya', label: 'Rumaithiya', state: 'hawalli' },
      { value: 'bayan', label: 'Bayan', state: 'hawalli' },
      { value: 'mishref', label: 'Mishref', state: 'hawalli' },
      
      // Farwaniya
      { value: 'farwaniya_city', label: 'Farwaniya', state: 'farwaniya' },
      { value: 'khaitan', label: 'Khaitan', state: 'farwaniya' },
      { value: 'jleeb_al_shuyoukh', label: 'Jleeb Al-Shuyoukh', state: 'farwaniya' },
      { value: 'sabah_al_nasser', label: 'Sabah Al-Nasser', state: 'farwaniya' },
      
      // Ahmadi
      { value: 'ahmadi_city', label: 'Ahmadi', state: 'ahmadi' },
      { value: 'fahaheel', label: 'Fahaheel', state: 'ahmadi' },
      { value: 'mangaf', label: 'Mangaf', state: 'ahmadi' },
      { value: 'mahboula', label: 'Mahboula', state: 'ahmadi' },
      { value: 'abu_halifa', label: 'Abu Halifa', state: 'ahmadi' },
      { value: 'fintas', label: 'Fintas', state: 'ahmadi' },
      
      // Jahra
      { value: 'jahra_city', label: 'Jahra', state: 'jahra' },
      { value: 'sulaibiya', label: 'Sulaibiya', state: 'jahra' },
      
      // Mubarak Al-Kabeer
      { value: 'sabah_al_salem', label: 'Sabah Al-Salem', state: 'mubarak_al_kabeer' },
      { value: 'qurain', label: 'Qurain', state: 'mubarak_al_kabeer' },
      { value: 'adan', label: 'Adan', state: 'mubarak_al_kabeer' },
    ],
  },

  // Qatar
  QA: {
    states: [
      { value: 'doha_municipality', label: 'Doha' },
      { value: 'al_rayyan', label: 'Al Rayyan' },
      { value: 'al_wakrah', label: 'Al Wakrah' },
      { value: 'al_khor', label: 'Al Khor' },
      { value: 'al_shamal', label: 'Al Shamal' },
      { value: 'umm_salal', label: 'Umm Salal' },
      { value: 'al_daayen', label: 'Al Daayen' },
    ],
    cities: [
      // Doha
      { value: 'doha', label: 'Doha', state: 'doha_municipality' },
      { value: 'west_bay', label: 'West Bay', state: 'doha_municipality' },
      { value: 'the_pearl', label: 'The Pearl', state: 'doha_municipality' },
      { value: 'musheireb', label: 'Musheireb', state: 'doha_municipality' },
      { value: 'al_sadd', label: 'Al Sadd', state: 'doha_municipality' },
      { value: 'al_waab', label: 'Al Waab', state: 'doha_municipality' },
      
      // Al Rayyan
      { value: 'al_rayyan_city', label: 'Al Rayyan', state: 'al_rayyan' },
      { value: 'education_city', label: 'Education City', state: 'al_rayyan' },
      { value: 'al_gharafa', label: 'Al Gharafa', state: 'al_rayyan' },
      
      // Al Wakrah
      { value: 'al_wakra', label: 'Al Wakra', state: 'al_wakrah' },
      { value: 'mesaieed', label: 'Mesaieed', state: 'al_wakrah' },
      
      // Al Khor
      { value: 'al_khor_city', label: 'Al Khor', state: 'al_khor' },
      { value: 'al_thakhira', label: 'Al Thakhira', state: 'al_khor' },
      
      // Al Shamal
      { value: 'al_ruwais', label: 'Al Ruwais', state: 'al_shamal' },
      
      // Umm Salal
      { value: 'umm_salal_city', label: 'Umm Salal', state: 'umm_salal' },
      
      // Al Daayen
      { value: 'lusail', label: 'Lusail', state: 'al_daayen' },
      { value: 'al_kheesa', label: 'Al Kheesa', state: 'al_daayen' },
    ],
  },

  // Bahrain
  BH: {
    states: [
      { value: 'capital', label: 'Capital Governorate' },
      { value: 'muharraq', label: 'Muharraq Governorate' },
      { value: 'northern', label: 'Northern Governorate' },
      { value: 'southern', label: 'Southern Governorate' },
    ],
    cities: [
      // Capital
      { value: 'manama', label: 'Manama', state: 'capital' },
      { value: 'juffair', label: 'Juffair', state: 'capital' },
      { value: 'seef', label: 'Seef', state: 'capital' },
      { value: 'adliya', label: 'Adliya', state: 'capital' },
      
      // Muharraq
      { value: 'muharraq_city', label: 'Muharraq', state: 'muharraq' },
      { value: 'amwaj_islands', label: 'Amwaj Islands', state: 'muharraq' },
      { value: 'busaiteen', label: 'Busaiteen', state: 'muharraq' },
      
      // Northern
      { value: 'budaiya', label: 'Budaiya', state: 'northern' },
      { value: 'saar', label: 'Saar', state: 'northern' },
      { value: 'janabiya', label: 'Janabiya', state: 'northern' },
      { value: 'hamad_town', label: 'Hamad Town', state: 'northern' },
      
      // Southern
      { value: 'riffa', label: 'Riffa', state: 'southern' },
      { value: 'isa_town', label: 'Isa Town', state: 'southern' },
      { value: 'sitra', label: 'Sitra', state: 'southern' },
      { value: 'awali', label: 'Awali', state: 'southern' },
    ],
  },

  // Oman
  OM: {
    states: [
      { value: 'muscat', label: 'Muscat' },
      { value: 'dhofar', label: 'Dhofar' },
      { value: 'al_batinah_north', label: 'Al Batinah North' },
      { value: 'al_batinah_south', label: 'Al Batinah South' },
      { value: 'al_dakhiliyah', label: 'Al Dakhiliyah' },
      { value: 'al_sharqiyah_north', label: 'Al Sharqiyah North' },
      { value: 'al_sharqiyah_south', label: 'Al Sharqiyah South' },
      { value: 'al_buraimi', label: 'Al Buraimi' },
      { value: 'al_dhahirah', label: 'Al Dhahirah' },
      { value: 'musandam', label: 'Musandam' },
      { value: 'al_wusta', label: 'Al Wusta' },
    ],
    cities: [
      // Muscat
      { value: 'muscat_city', label: 'Muscat City', state: 'muscat' },
      { value: 'mutrah', label: 'Mutrah', state: 'muscat' },
      { value: 'ruwi', label: 'Ruwi', state: 'muscat' },
      { value: 'qurum', label: 'Qurum', state: 'muscat' },
      { value: 'al_khuwair', label: 'Al Khuwair', state: 'muscat' },
      { value: 'bausher', label: 'Bausher', state: 'muscat' },
      { value: 'seeb', label: 'Seeb', state: 'muscat' },
      
      // Dhofar
      { value: 'salalah', label: 'Salalah', state: 'dhofar' },
      { value: 'taqah', label: 'Taqah', state: 'dhofar' },
      { value: 'mirbat', label: 'Mirbat', state: 'dhofar' },
      
      // Al Batinah North
      { value: 'sohar', label: 'Sohar', state: 'al_batinah_north' },
      { value: 'shinas', label: 'Shinas', state: 'al_batinah_north' },
      { value: 'liwa', label: 'Liwa', state: 'al_batinah_north' },
      
      // Al Batinah South
      { value: 'barka', label: 'Barka', state: 'al_batinah_south' },
      { value: 'rustaq', label: 'Rustaq', state: 'al_batinah_south' },
      { value: 'nakhal', label: 'Nakhal', state: 'al_batinah_south' },
      
      // Al Dakhiliyah
      { value: 'nizwa', label: 'Nizwa', state: 'al_dakhiliyah' },
      { value: 'bahla', label: 'Bahla', state: 'al_dakhiliyah' },
      { value: 'adam', label: 'Adam', state: 'al_dakhiliyah' },
      
      // Al Sharqiyah South
      { value: 'sur', label: 'Sur', state: 'al_sharqiyah_south' },
      
      // Al Buraimi
      { value: 'buraimi', label: 'Al Buraimi', state: 'al_buraimi' },
      
      // Al Dhahirah
      { value: 'ibri', label: 'Ibri', state: 'al_dhahirah' },
      
      // Musandam
      { value: 'khasab', label: 'Khasab', state: 'musandam' },
    ],
  },

  // Jordan
  JO: {
    states: [
      { value: 'amman', label: 'Amman' },
      { value: 'irbid', label: 'Irbid' },
      { value: 'zarqa', label: 'Zarqa' },
      { value: 'balqa', label: 'Balqa' },
      { value: 'aqaba', label: 'Aqaba' },
      { value: 'mafraq', label: 'Mafraq' },
      { value: 'karak', label: 'Karak' },
      { value: 'madaba', label: 'Madaba' },
      { value: 'jerash', label: 'Jerash' },
      { value: 'ajloun', label: 'Ajloun' },
      { value: 'maan', label: "Ma'an" },
      { value: 'tafilah', label: 'Tafilah' },
    ],
    cities: [
      // Amman
      { value: 'amman_city', label: 'Amman', state: 'amman' },
      { value: 'abdoun', label: 'Abdoun', state: 'amman' },
      { value: 'shmeisani', label: 'Shmeisani', state: 'amman' },
      { value: 'jabal_amman', label: 'Jabal Amman', state: 'amman' },
      { value: 'sweifieh', label: 'Sweifieh', state: 'amman' },
      { value: 'khalda', label: 'Khalda', state: 'amman' },
      { value: 'dabouq', label: 'Dabouq', state: 'amman' },
      
      // Irbid
      { value: 'irbid_city', label: 'Irbid', state: 'irbid' },
      { value: 'ramtha', label: 'Ramtha', state: 'irbid' },
      
      // Zarqa
      { value: 'zarqa_city', label: 'Zarqa', state: 'zarqa' },
      { value: 'russeifa', label: 'Russeifa', state: 'zarqa' },
      
      // Balqa
      { value: 'salt', label: 'Salt', state: 'balqa' },
      
      // Aqaba
      { value: 'aqaba_city', label: 'Aqaba', state: 'aqaba' },
      
      // Madaba
      { value: 'madaba_city', label: 'Madaba', state: 'madaba' },
      
      // Jerash
      { value: 'jerash_city', label: 'Jerash', state: 'jerash' },
      
      // Ajloun
      { value: 'ajloun_city', label: 'Ajloun', state: 'ajloun' },
      
      // Ma'an
      { value: 'petra', label: 'Petra', state: 'maan' },
      { value: 'maan_city', label: "Ma'an", state: 'maan' },
    ],
  },

  // Egypt
  EG: {
    states: [
      { value: 'cairo', label: 'Cairo' },
      { value: 'alexandria', label: 'Alexandria' },
      { value: 'giza', label: 'Giza' },
      { value: 'dakahlia', label: 'Dakahlia' },
      { value: 'sharqia', label: 'Sharqia' },
      { value: 'gharbia', label: 'Gharbia' },
      { value: 'red_sea', label: 'Red Sea' },
      { value: 'south_sinai', label: 'South Sinai' },
      { value: 'luxor', label: 'Luxor' },
      { value: 'aswan', label: 'Aswan' },
      { value: 'port_said', label: 'Port Said' },
      { value: 'suez', label: 'Suez' },
    ],
    cities: [
      // Cairo
      { value: 'cairo_city', label: 'Cairo', state: 'cairo' },
      { value: 'heliopolis', label: 'Heliopolis', state: 'cairo' },
      { value: 'maadi', label: 'Maadi', state: 'cairo' },
      { value: 'nasr_city', label: 'Nasr City', state: 'cairo' },
      { value: 'new_cairo', label: 'New Cairo', state: 'cairo' },
      { value: 'zamalek', label: 'Zamalek', state: 'cairo' },
      { value: 'downtown_cairo', label: 'Downtown Cairo', state: 'cairo' },
      { value: 'sixth_october', label: '6th of October', state: 'cairo' },
      
      // Alexandria
      { value: 'alexandria_city', label: 'Alexandria', state: 'alexandria' },
      { value: 'san_stefano', label: 'San Stefano', state: 'alexandria' },
      { value: 'montaza', label: 'Montaza', state: 'alexandria' },
      { value: 'smouha', label: 'Smouha', state: 'alexandria' },
      
      // Giza
      { value: 'giza_city', label: 'Giza', state: 'giza' },
      { value: 'dokki', label: 'Dokki', state: 'giza' },
      { value: 'mohandessin', label: 'Mohandessin', state: 'giza' },
      { value: 'sheikh_zayed', label: 'Sheikh Zayed', state: 'giza' },
      
      // Red Sea
      { value: 'hurghada', label: 'Hurghada', state: 'red_sea' },
      { value: 'el_gouna', label: 'El Gouna', state: 'red_sea' },
      { value: 'marsa_alam', label: 'Marsa Alam', state: 'red_sea' },
      
      // South Sinai
      { value: 'sharm_el_sheikh', label: 'Sharm El Sheikh', state: 'south_sinai' },
      { value: 'dahab', label: 'Dahab', state: 'south_sinai' },
      { value: 'taba', label: 'Taba', state: 'south_sinai' },
      
      // Luxor
      { value: 'luxor_city', label: 'Luxor', state: 'luxor' },
      
      // Aswan
      { value: 'aswan_city', label: 'Aswan', state: 'aswan' },
      
      // Port Said
      { value: 'port_said_city', label: 'Port Said', state: 'port_said' },
      
      // Suez
      { value: 'suez_city', label: 'Suez', state: 'suez' },
      
      // Dakahlia
      { value: 'mansoura', label: 'Mansoura', state: 'dakahlia' },
      
      // Sharqia
      { value: 'zagazig', label: 'Zagazig', state: 'sharqia' },
      
      // Gharbia
      { value: 'tanta', label: 'Tanta', state: 'gharbia' },
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
