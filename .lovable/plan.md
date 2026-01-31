

# Expand City/State Data for Lebanon and Middle East

## Current State Analysis

The `src/config/country-locations.ts` file currently has:

| Country | Regions/States | Cities |
|---------|----------------|--------|
| Lebanon | 7 | 47 cities |
| UAE | 7 | 4 cities |
| Saudi Arabia | 4 | 6 cities |
| USA | 51 | 37 cities |

**Problem**: Lebanon needs more cities (especially in Akkar - only 2 cities), and GCC countries are severely limited.

## Expansion Plan

### 1. Lebanon - Significantly Expanded (47 to 120+ cities)

**Mount Lebanon** (currently 18, adding 15+):
- Add: Mansourieh, Fanar, Jal el Dib, Naccache, Rabieh, Yarze, Hadath, Jdeideh, Zalka, Sahel Alma, Ghazir, Kfarhbab, Amchit, Mayrouba, Faraya, Harissa, Tabarja, Maameltein, Adma, Haret Sakher, Sarba, Ajaltoun, Jeita, Zouk Mosbeh, Dora, Achrafieh, Hamra, Verdun, Gemmayze, Mar Mikhael, Ras Beirut

**North Lebanon** (currently 8, adding 10+):
- Add: Mina, Beddawi, Amioun, Kousba, Douma, Tannourine, Beit Mery (Koura), Anfeh, Qalamoun, Ras Maska

**South Lebanon** (currently 5, adding 10+):
- Add: Abra, Ghazieh, Maghdouche, Jiyeh, Damour, Rmeileh, Sarafand, Adloun, Cana, Beit Yahoun, Khiam

**Nabatieh** (currently 2, adding 5+):
- Add: Arnoun, Tebnine, Kfar Tibnit, Jbaa, Kfarouman

**Bekaa** (currently 4, adding 10+):
- Add: Ablah, Jeb Jennine, Marj, Rashaya, Saghbine, Kabb Elias, Bar Elias, Taanayel, Ferzol, Majdel Anjar

**Baalbek-Hermel** (currently 2, adding 5+):
- Add: Labweh, Ras Baalbek, Arsal, Nabi Sheet, Deir el Ahmar

**Akkar** (currently 2, adding 10+):
- Add: Qoubaiyat, Bebnine, Fneidek, Tikrit, Minyara, Rahbe, Michmich, Andaket, Sheikh Mohammad, Halba

### 2. UAE - Comprehensive Expansion (4 to 40+ cities)

**Dubai** (adding 10+):
- Dubai Marina, JBR, Downtown Dubai, Business Bay, Deira, Bur Dubai, Al Barsha, Jumeirah, Palm Jumeirah, Al Quoz, Silicon Oasis, Dubai Hills

**Abu Dhabi** (adding 8+):
- Abu Dhabi Island, Al Reem Island, Yas Island, Saadiyat Island, Al Ain, Khalifa City, Mussafah, Al Raha

**Sharjah** (adding 5+):
- Al Nahda, Al Khan, Al Majaz, Muwaileh, Al Qasimia

**Other Emirates**:
- Ras Al Khaimah City, Al Hamra, Khorfakkan, Fujairah City, Dibba, Umm Al Quwain City

### 3. Saudi Arabia - Major Expansion (6 to 50+ cities)

**Add All 13 Regions**:
- Asir, Jazan, Najran, Al Baha, Hail, Al Jouf, Northern Borders, Tabuk, Qassim

**Major Cities per Region**:
- Riyadh Region: Al Kharj, Ad Diriyah, Al Majmaah
- Makkah Region: Taif, Rabigh, Al Qunfudhah
- Eastern Province: Jubail, Khobar, Qatif, Hofuf, Ras Tanura
- Madinah Region: Yanbu, Al Ula, Badr
- Qassim: Buraidah, Unaizah
- Asir: Abha, Khamis Mushait, Najran
- Tabuk: Tabuk City, NEOM, Duba

### 4. Add New GCC Countries

**Kuwait (KW)**:
- Governorates: Capital, Hawalli, Farwaniya, Ahmadi, Jahra, Mubarak Al-Kabeer
- Cities: Kuwait City, Salmiya, Hawalli, Jahra, Ahmadi, Fahaheel, Mangaf

**Qatar (QA)**:
- Municipalities: Doha, Al Rayyan, Al Wakrah, Al Khor, Al Shamal, Umm Salal, Al Daayen
- Cities: Doha, Lusail, The Pearl, West Bay, Al Wakra, Dukhan, Mesaieed

**Bahrain (BH)**:
- Governorates: Capital, Muharraq, Northern, Southern
- Cities: Manama, Muharraq, Riffa, Hamad Town, Isa Town, Sitra

**Oman (OM)**:
- Governorates: Muscat, Dhofar, Al Batinah North, Al Batinah South, Al Dakhiliyah
- Cities: Muscat, Salalah, Sohar, Nizwa, Sur, Barka, Ibri

**Jordan (JO)**:
- Governorates: Amman, Irbid, Zarqa, Balqa, Aqaba, Mafraq, Karak
- Cities: Amman, Zarqa, Irbid, Aqaba, Salt, Madaba, Jerash

**Egypt (EG)**:
- Governorates: Cairo, Alexandria, Giza, Dakahlia, Sharqia, Gharbia
- Cities: Cairo, Alexandria, Giza, Sharm El Sheikh, Hurghada, Luxor, Aswan

## Implementation

### File to Modify
`src/config/country-locations.ts`

### Changes Summary

| Country | Before | After |
|---------|--------|-------|
| Lebanon (LB) | 47 cities | 120+ cities |
| UAE (AE) | 4 cities | 40+ cities |
| Saudi Arabia (SA) | 6 cities, 4 regions | 50+ cities, 13 regions |
| Kuwait (KW) | - | NEW: 6 governorates, 15+ cities |
| Qatar (QA) | - | NEW: 7 municipalities, 15+ cities |
| Bahrain (BH) | - | NEW: 4 governorates, 10+ cities |
| Oman (OM) | - | NEW: 5+ governorates, 15+ cities |
| Jordan (JO) | - | NEW: 7+ governorates, 15+ cities |
| Egypt (EG) | - | NEW: 6+ governorates, 15+ cities |

### Technical Notes
- All cities will reference their parent state/region via the `state` property
- Values use snake_case for consistency
- Labels show proper local names (with transliterations where helpful)
- Helper functions remain unchanged - they already support the expanded data

