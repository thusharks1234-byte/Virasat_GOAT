import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { supabase, BACKEND_API_URL } from './supabase';
import './index.css';

const ArchiveOfMonuments = lazy(() =>
  import('./components/ArchiveOfMonuments').then(({ ArchiveOfMonuments: Archive }) => ({ default: Archive }))
);

interface TranslationDict {
  [key: string]: {
    logo: string;
    navHome: string;
    navAbout: string;
    navGallery: string;
    navFeatures: string;
    heroTitle: string;
    introText: string;
    tag1: string;
    tag2: string;
    tag3: string;
    panel1Title: string;
    panel1Desc: string;
    panel2Title: string;
    panel2Desc: string;
    card1Kicker: string;
    card1Title: string;
    card1Desc: string;
    card2Kicker: string;
    card2Title: string;
    card2Desc: string;
    card3Kicker: string;
    card3Title: string;
    card3Desc: string;
    card4Kicker: string;
    card4Title: string;
    card4Desc: string;
    card5Kicker: string;
    card5Title: string;
    card5Desc: string;
    chaptersSubtitle: string;
    chaptersTitle: string;
    exploreBtn: string;
    chap1Num: string;
    chap1Title: string;
    chap1Desc: string;
    chap2Num: string;
    chap2Title: string;
    chap2Desc: string;
    chap3Num: string;
    chap3Title: string;
    chap3Desc: string;
    chap4Num: string;
    chap4Title: string;
    chap4Desc: string;
    chap5Num: string;
    chap5Title: string;
    chap5Desc: string;
    chap6Num: string;
    chap6Title: string;
    chap6Desc: string;
    chap7Num: string;
    chap7Title: string;
    chap7Desc: string;
    chap8Num: string;
    chap8Title: string;
    chap8Desc: string;
    getStarted: string;
    authClose: string;
    authWelcomeKicker: string;
    authWelcomeTitle: string;
    authWelcomeDesc: string;
  };
}

interface KathakarMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface LipikaLine {
  label: string;
  text: string;
}

interface LipikaResult {
  title: string;
  script: string;
  approximate_date: string;
  location: string;
  provider?: string;
  lines: LipikaLine[];
}

interface QuestData {
  destination: string;
  passport_hash: string;
  provider?: string;
  stops: string[];
  reward: { title: string; description: string };
}

interface CrowdForecast {
  site: string;
  provider?: string;
  densityStatus: string;
  densityPercentage: number;
  peakWindow: string;
  peakReason: string;
  optimalWindow: string;
  optimalReason: string;
}

interface CraftTelemetry {
  provider?: string;
  regionFormatted: string;
  giStatus: string;
  craftName: string;
  craftHistory: string;
  authenticityMarkers: string[];
}

interface FestivalTelemetry {
  provider?: string;
  festivalName: string;
  regionFormatted: string;
  historicalSignificance: string;
  touristEtiquette: string[];
}

interface TryOnTelemetry {
  provider?: string;
  garment: string;
  garmentNameFormatted: string;
  regionOfOrigin: string;
  fabricHistory: string;
  drapingTechnique: string;
  styleSynthesis: string;
}

interface PuterRuntime {
  ai?: {
    txt2img?: (prompt: string, options?: { ratio?: { w: number; h: number }; input_image?: string; input_images?: string[] }) => Promise<unknown>;
  };
}

const translations: TranslationDict = {
  en: {
    logo: "INDIA", navHome: "Home", navAbout: "About", navGallery: "Gallery", navFeatures: "Features", heroTitle: "VIRASAT",
    introText: "A vibrant tapestry of ancient stone, sweeping landscapes, and unbroken living traditions shaping a breathtaking cultural journey across the Indian subcontinent.",
    tag1: "Ancient Heritage", tag2: "Living Arts", tag3: "Spiritual Journey",
    panel1Title: "Stones that speak.", panel1Desc: "India's monuments are architectural compasses bridging millennia of art, astronomy, and dynastic history.",
    panel2Title: "The living pulse.", panel2Desc: "Culture here is not just observed in museums; it is experienced in every street, festival, and artisan's craft.",
    card1Kicker: "Timeless Architecture", card1Title: "Temples of Hampi", card1Desc: "Stone chariots and monolithic ruins echoing the glory of the Vijayanagara Empire.",
    card2Kicker: "Spiritual Heart", card2Title: "Varanasi Ghats", card2Desc: "The world's oldest living city, where ancient rituals meet the sacred Ganges.",
    card3Kicker: "Royal Legacy", card3Title: "Rajputana Forts", card3Desc: "Impregnable hill forts in Rajasthan featuring intricate palaces and sweeping views.",
    card4Kicker: "Living Arts", card4Title: "Classical Traditions", card4Desc: "From Bharatanatyam to ancient copper craft, a culture that lives and breathes today.",
    card5Kicker: "Natural Heritage", card5Title: "Kerala Backwaters", card5Desc: "An interconnected network of ancient trade routes and serene ecological harmony.",
    chaptersSubtitle: "VIRASAT JOURNEY", chaptersTitle: "EXPLORE THE CHAPTERS", exploreBtn: "EXPLORE →",
    chap1Num: "CHAPTER 01", chap1Title: "The Archive of Monuments", chap1Desc: "Interactive 3D structural mapping and historical reconstruction of India's architectural marvels.",
    chap2Num: "CHAPTER 02", chap2Title: "Kathakar AI Guide", chap2Desc: "Conversational lore and historical narratives powered by Google Gemini, speaking fluent local folklore.",
    chap3Num: "CHAPTER 03", chap3Title: "Lipika Script Lens", chap3Desc: "Real-time optical character recognition decoding ancient Brahmi, Pali, and Sanskrit stone inscriptions.",
    chap4Num: "CHAPTER 04", chap4Title: "Blockchain Yatra Passports", chap4Desc: "Cryptographic digital stamps and NFTs verifying your journey across India's cultural corridors.",
    chap5Num: "CHAPTER 05", chap5Title: "Tirth-Yatra Crowd Forecast", chap5Desc: "Predictive analytics engine estimating live foot traffic and optimal visiting hours for congested temples and historical shrines.",
    chap6Num: "CHAPTER 06", chap6Title: "Kala-Bazaar Artisan Heritage", chap6Desc: "Discover living regional crafts, verified GI status, and practical markers for authentic artisan work.",
    chap7Num: "CHAPTER 07", chap7Title: "Parv-Darshan Festival Heritage", chap7Desc: "Map living festivals by region and season with historical context and respectful visitor guidance.",
    chap8Num: "CHAPTER 08", chap8Title: "Kala-Kriti Digital Try-On", chap8Desc: "Upload a portrait to receive a regional styling report, draping telemetry, textile history, and an optional heritage moodboard.",
    getStarted: "Get Started",
    authClose: "[ CLOSE ]", authWelcomeKicker: "THE VIRASAT JOURNEY", authWelcomeTitle: "Explore India's living heritage.", authWelcomeDesc: "Discover sacred places, enduring traditions, and the stories that connect generations.",
  },
  hi: {
    logo: "भारत", navHome: "मुख्य पृष्ठ", navAbout: "हमारे बारे में", navGallery: "गैलरी", navFeatures: "विशेषताएं", heroTitle: "विरासत",
    introText: "प्राचीन पत्थरों, विस्तृत परिदृश्यों और अखंड जीवंत परंपराओं की एक जीवंत टेपेस्ट्री, जो भारतीय उपमहाद्वीप में एक लुभावनी सांस्कृतिक यात्रा को आकार देती है।",
    tag1: "प्राचीन विरासत", tag2: "जीवित कलाएं", tag3: "आध्यात्मिक यात्रा",
    panel1Title: "पत्थर जो बोलते हैं।", panel1Desc: "भारत के स्मारक स्थापत्य कंपास हैं जो कला, खगोल विज्ञान और राजवंशीय इतिहास की सहस्राब्दी को जोड़ते हैं।",
    panel2Title: "जीवंत स्पंदन।", panel2Desc: "यहाँ संस्कृति केवल संग्रहालयों में नहीं देखी जाती; यह हर सड़क, त्योहार और कारीगर के शिल्प में अनुभव की जाती है।",
    card1Kicker: "कालातीत वास्तुकला", card1Title: "हम्पी के मंदिर", card1Desc: "विजयनगर साम्राज्य की महिमा को दर्शाते पत्थर के रथ और अखंड खंडहर।",
    card2Kicker: "आध्यात्मिक हृदय", card2Title: "वाराणसी के घाट", card2Desc: "दुनिया का सबसे पुराना जीवित शहर, जहां प्राचीन अनुष्ठान पवित्र गंगा से मिलते हैं।",
    card3Kicker: "शाही विरासत", card3Title: "राजपूताना किले", card3Desc: "राजस्थान के अभेद्य पहाड़ी किले जिनमें जटिल महल और मनोरम दृश्य हैं।",
    card4Kicker: "जीवित कलाएं", card4Title: "शास्त्रीय परंपराएं", card4Desc: "भरतनाट्यम से लेकर प्राचीन तांबे के शिल्प तक, एक ऐसी संस्कृति जो आज भी जीवित है और सांस लेती है।",
    card5Kicker: "प्राकृतिक विरासत", card5Title: "केरल बैकवाटर्स", card5Desc: "प्राचीन व्यापार मार्गों और शांत पारिस्थितिक सद्भाव का एक परस्पर नेटवर्क।",
    chaptersSubtitle: "विरासत यात्रा", chaptersTitle: "अध्याय एक्सप्लोर करें", exploreBtn: "एक्सप्लोर करें →",
    chap1Num: "अध्याय 01", chap1Title: "स्मारकों का पुरालेख", chap1Desc: "भारत के वास्तुशिल्प चमत्कारों का इंटरैक्टिव 3डी संरचनात्मक मानचित्रण और ऐतिहासिक पुनर्निर्माण।",
    chap2Num: "अध्याय 02", chap2Title: "कथाकार एआई गाइड", chap2Desc: "Google Gemini द्वारा संचालित संवादी विद्या और ऐतिहासिक आख्यान, जो स्थानीय लोककथाएं बोलते हैं।",
    chap3Num: "अध्याय 03", chap3Title: "लिपि स्क्रिप्ट लेंस", chap3Desc: "प्राचीन ब्राह्मी, पाली और संस्कृत पत्थर के शिलालेखों को डिकोड करने वाली वास्तविक समय की ऑप्टिकल चरित्र मान्यता।",
    chap4Num: "अध्याय 04", chap4Title: "ब्लॉकचेन यात्रा पासपोर्ट", chap4Desc: "भारत के सांस्कृतिक गलियारों में आपकी यात्रा की पुष्टि करने वाले क्रिप्टोग्राफिक डिजिटल टिकट और एनएफटी।",
    chap5Num: "अध्याय 05", chap5Title: "तीर्थ-यात्रा भीड़ पूर्वानुमान", chap5Desc: "भीड़भाड़ वाले मंदिरों और ऐतिहासिक स्थलों के लिए लाइव भीड़ का अनुमान लगाने वाला मॉडल।",
    chap6Num: "अध्याय 06", chap6Title: "व्यंजन मसाला मार्ग स्कैनर", chap6Desc: "एआई कंप्यूटर विज़न क्षेत्रीय पाक इतिहास और प्राचीन मसाला व्यापार की उत्पत्ति को डिकोड करता है।",
    chap7Num: "अध्याय 07", chap7Title: "परंपरा विद्या अन्वेषण", chap7Desc: "जियो-फेंस्ड गामिफाइड हेरिटेज एक्सप्लोरेशन डिजिटल रिवॉर्ड्स और स्थानीय कारीगर छूट अनलॉक करता है।",
    chap8Num: "अध्याय 08", chap8Title: "कला-कृति डिजिटल ट्राई-ऑन", chap8Desc: "एआर बॉडी सेगमेंटेशन जिससे पर्यटक क्षेत्रीय हथकरघा वस्त्रों को डिजिटल रूप से पहन सकते हैं।",
    getStarted: "शुरू करें",
    authClose: "[ बंद करें ]", authWelcomeKicker: "विरासत यात्रा", authWelcomeTitle: "भारत की जीवंत विरासत खोजें।", authWelcomeDesc: "पवित्र स्थलों, जीवंत परंपराओं और पीढ़ियों को जोड़ने वाली कहानियों को जानें।",
  },
  kn: {
    logo: "ಭಾರತ", navHome: "ಮುಖಪುಟ", navAbout: "ನಮ್ಮ ಬಗ್ಗೆ", navGallery: "ಗ್ಯಾಲರಿ", navFeatures: "ವೈಶಿಷ್ಟ್ಯಗಳು", heroTitle: "ವಿರಾಸತ್",
    introText: "ಭಾರತೀಯ ಉಪಖಂಡದಾದ್ಯಂತ ಉಸಿರುಕಟ್ಟುವ ಸಾಂಸ್ಕೃತಿಕ ಪ್ರಯಾಣವನ್ನು ರೂಪಿಸುವ ಪ್ರಾಚೀನ ಕಲ್ಲುಗಳು, ವಿಸ್ತಾರವಾದ ಭೂದೃಶ್ಯಗಳು ಮತ್ತು ಮುರಿಯದ ಜೀವಂತ ಸಂಪ್ರದಾಯಗಳ ರೋಮಾಂಚಕ ವಸ್ತ್ರ.",
    tag1: "ಪ್ರಾಚೀನ ಪರಂಪರೆ", tag2: "ಜೀವಂತ ಕಲೆಗಳು", tag3: "ಆಧ್ಯಾತ್ಮಿಕ ಪ್ರಯಾಣ",
    panel1Title: "ಮಾತನಾಡುವ ಕಲ್ಲುಗಳು.", panel1Desc: "ಭಾರತದ ಸ್ಮಾರಕಗಳು ಕಲೆ, ಖಗೋಳಶಾಸ್ತ್ರ ಮತ್ತು ರಾಜವಂಶದ ಇತಿಹಾಸವನ್ನು ಬೆಸೆಯುವ ವಾಸ್ತುಶಿಲ್ಪದ ದಿಕ್ಸೂಚಿಗಳಾಗಿವೆ.",
    panel2Title: "ಜೀವಂತ ನಾಡಿ.", panel2Desc: "ಇಲ್ಲಿನ ಸಂಸ್ಕೃತಿಯನ್ನು ವಸ್ತುಸಂಗ್ರಹಾಲಯಗಳಲ್ಲಿ ಮಾತ್ರ ನೋಡಲಾಗುವುದಿಲ್ಲ; ಪ್ರತಿಯೊಂದು ಬೀದಿ, ಹಬ್ಬ ಮತ್ತು ಕುಶಲಕರ್ಮಿಗಳ ಕಲೆಯಲ್ಲಿ ಇದನ್ನು ಅನುಭವಿಸಲಾಗುತ್ತದೆ.",
    card1Kicker: "ಕಾಲಾತೀತ ವಾಸ್ತುಶಿಲ್ಪ", card1Title: "ಹಂಪಿಯ ದೇವಾಲಯಗಳು", card1Desc: "ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ವೈಭವವನ್ನು ಪ್ರತಿಬಿಂಬಿಸುವ ಕಲ್ಲಿನ ರಥಗಳು ಮತ್ತು ಏಕಶಿಲಾ ಅವಶೇಷಗಳು.",
    card2Kicker: "ಆಧ್ಯಾತ್ಮಿಕ ಹೃದಯ", card2Title: "ವಾರಣಾಸಿ ಘಾಟ್ಗಳು", card2Desc: "ಪ್ರಾಚೀನ ಆಚರಣೆಗಳು ಪವಿತ್ರ ಗಂಗೆಯನ್ನು ಸಂಧಿಸುವ ವಿಶ್ವದ ಅತ್ಯಂತ ಹಳೆಯ ಜೀವಂತ ನಗರ.",
    card3Kicker: "ರಾಜ ಪರಂಪರೆ", card3Title: "ರಜಪೂತಾನ ಕೋಟೆಗಳು", card3Desc: "ಸಂಕೀರ್ಣವಾದ ಅರಮನೆಗಳು ಮತ್ತು ವಿಸ್ತಾರವಾದ ನೋಟಗಳನ್ನು ಒಳಗೊಂಡಿರುವ ರಾಜಸ್ಥಾನದ ಭೇದಿಸಲಾಗದ ಬೆಟ್ಟದ ಕೋಟೆಗಳು.",
    card4Kicker: "ಜೀವಂತ ಕಲೆಗಳು", card4Title: "ಶಾಸ್ತ್ರೀಯ ಸಂಪ್ರದಾಯಗಳು", card4Desc: "ಭರತನಾಟ್ಯದಿಂದ ಪ್ರಾಚೀನ ತಾಮ್ರದ ಕರಕುಶಲತೆಯವರೆಗೆ, ಇಂದಿಗೂ ಜೀವಿಸುವ ಮತ್ತು ಉಸಿರಾಡುವ ಸಂಸ್ಕೃತಿ.",
    card5Kicker: "ನೈಸರ್ಗಿಕ ಪರಂಪರೆ", card5Title: "ಕೇರಳ ಬ್ಯಾಕ್ವಾಟರ್ಸ್", card5Desc: "ಪ್ರಾಚೀನ ವ್ಯಾಪಾರ ಮಾರ್ಗಗಳು ಮತ್ತು ಪ್ರಶಾಂತ ಪರಿಸರ ಸಾಮರಸ್ಯದ ಪರಸ್ಪರ ಜಾಲ.",
    chaptersSubtitle: "ವಿರಾಸತ್ ಪ್ರಯಾಣ", chaptersTitle: "ಅಧ್ಯಾಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ", exploreBtn: "ಅನ್ವೇಷಿಸಿ →",
    chap1Num: "ಅಧ್ಯಾಯ 01", chap1Title: "ಸ್ಮಾರಕಗಳ ಆರ್ಕೈವ್", chap1Desc: "ಭಾರತದ ವಾಸ್ತುಶಿಲ್ಪದ ಅದ್ಭುತಗಳ ಸಂವಾದಾತ್ಮಕ 3D ರಚನಾತ್ಮಕ ಮ್ಯಾಪಿಂಗ್ ಮತ್ತು ಐತಿಹಾಸಿಕ ಪುನರ್ನಿರ್ಮಾಣ.",
    chap2Num: "ಅಧ್ಯಾಯ 02", chap2Title: "ಕಥಾಕರ್ AI ಮಾರ್ಗದರ್ಶಿ", chap2Desc: "ಸ್ಥಳೀಯ ಜಾನಪದವನ್ನು ನಿರರ್ಗಳವಾಗಿ ಮಾತನಾಡುವ Google Gemini ಯಿಂದ ನಡೆಸಲ್ಪಡುವ ಸಂವಾದಾತ್ಮಕ ಕಥೆ ಮತ್ತು ಐತಿಹಾಸಿಕ ನಿರೂಪಣೆಗಳು.",
    chap3Num: "ಅಧ್ಯಾಯ 03", chap3Title: "ಲಿಪಿಕಾ ಸ್ಕ್ರಿಪ್ಟ್ ಲೆನ್ಸ್", chap3Desc: "ಪ್ರಾಚೀನ ಬ್ರಾಹ್ಮಿ, ಪಾಲಿ ಮತ್ತು ಸಂಸ್ಕೃತ ಕಲ್ಲಿನ ಶಾಸನಗಳನ್ನು ಡಿಕೋಡ್ ಮಾಡುವ ನೈಜ-ಸಮಯದ ಆಪ್ಟಿಕಲ್ ಅಕ್ಷರ ಗುರುತಿಸುವಿಕೆ.",
    chap4Num: "ಅಧ್ಯಾಯ 04", chap4Title: "ಬ್ಲಾಕ್‌ಚೈನ್ ಯಾತ್ರಾ ಪಾಸ್‌ಪೋರ್ಟ್‌ಗಳು", chap4Desc: "ಭಾರತದ ಸಾಂಸ್ಕೃತಿಕ ಕಾರಿಡಾರ್‌ಗಳಾದ್ಯಂತ ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಪರಿಶೀಲಿಸುವ ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಡಿಜಿಟಲ್ ಸ್ಟ್ಯಾಂಪ್‌ಗಳು ಮತ್ತು NFT ಗಳು.",
    chap5Num: "ಅಧ್ಯಾಯ 05", chap5Title: "ತೀರ್ಥ-ಯಾತ್ರಾ ಜನಸಂದಣಿ ಮುನ್ಸೂಚನೆ", chap5Desc: "ದಟ್ಟಣೆಯ ದೇವಾಲಯಗಳ ಲೈವ್ ಜನಸಂದಣಿಯನ್ನು ಅಂದಾಜು ಮಾಡುವ AI ಮುನ್ಸೂಚನೆ ಎಂಜಿನ್.",
    chap6Num: "ಅಧ್ಯಾಯ 06", chap6Title: "ವ್ಯಂಜನ್ ಮಸಾಲೆ ಮಾರ್ಗ ಸ್ಕ್ಯಾನರ್", chap6Desc: "AI ಕಂಪ್ಯೂಟರ್ ದೃಷ್ಟಿ ಪ್ರಾದೇಶಿಕ ಪಾಕಶಾಲೆಯ ಇತಿಹಾಸ ಮತ್ತು ಪ್ರಾಚೀನ ಮಸಾಲೆ ವ್ಯಾಪಾರದ ಮೂಲವನ್ನು ಡಿಕೋಡ್ ಮಾಡುತ್ತದೆ.",
    chap7Num: "ಅಧ್ಯಾಯ 07", chap7Title: "ಪರಂಪರಾ ಇತಿಹಾಸದ ಕ್ವೆಸ್ಟ್‌ಗಳು", chap7Desc: "ಜಿಯೋ-ಫೆನ್ಸ್ಡ್ ಗ್ಯಾಮಿಫೈಡ್ ಹೆರಿಟೇಜ್ ಅನ್ವೇಷಣೆಯು ಡಿಜಿಟಲ್ ಪ್ರತಿಫಲಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಕುಶಲಕರ್ಮಿಗಳ ರಿಯಾಯಿತಿಗಳನ್ನು ಅನ್ಲಾಕ್ ಮಾಡುತ್ತದೆ.",
    chap8Num: "ಅಧ್ಯಾಯ 08", chap8Title: "ಕಲಾ-ಕೃತಿ ಡಿಜಿಟಲ್ ಟ್ರೈ-ಆನ್", chap8Desc: "ಪ್ರಾದೇಶಿಕ ಕೈಮಗ್ಗದ ಜವಳಿಗಳನ್ನು ಡಿಜಿಟಲ್ ಆಗಿ ಧರಿಸಲು ಪ್ರವಾಸಿಗರಿಗೆ ಅವಕಾಶ ನೀಡುವ AR ದೇಹ ವಿಭಾಗ.",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ",
    authClose: "[ ಮುಚ್ಚಿ ]", authWelcomeKicker: "ವಿರಾಸತ್ ಪಯಣ", authWelcomeTitle: "ಭಾರತದ ಜೀವಂತ ಪರಂಪರೆಯನ್ನು ಅನ್ವೇಷಿಸಿ.", authWelcomeDesc: "ಪವಿತ್ರ ಸ್ಥಳಗಳು, ಜೀವಂತ ಸಂಪ್ರದಾಯಗಳು ಮತ್ತು ತಲೆಮಾರುಗಳನ್ನು ಬೆಸೆಯುವ ಕಥೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.",
  },
  pa: {
    logo: "ਭਾਰਤ", navHome: "ਮੁੱਖ ਪੰਨਾ", navAbout: "ਸਾਡੇ ਬਾਰੇ", navGallery: "ਗੈਲਰੀ", navFeatures: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ", heroTitle: "ਵਿਰਾਸਤ",
    introText: "ਪ੍ਰਾਚੀਨ ਪੱਥਰਾਂ, ਵਿਸ਼ਾਲ ਦ੍ਰਿਸ਼ਾਂ, ਅਤੇ ਅਟੁੱਟ ਜੀਵਤ ਪਰੰਪਰਾਵਾਂ ਦੀ ਇੱਕ ਜੀਵੰਤ ਟੇਪਸਟਰੀ ਜੋ ਭਾਰਤੀ ਉਪਮਹਾਂਦੀਪ ਵਿੱਚ ਇੱਕ ਸ਼ਾਨਦਾਰ ਸੱਭਿਆਚਾਰਕ ਯਾਤਰਾ ਨੂੰ ਰੂਪ ਦਿੰਦੀ ਹੈ।",
    tag1: "ਪ੍ਰਾਚੀਨ ਵਿਰਾਸਤ", tag2: "ਜੀਵਤ ਕਲਾਵਾਂ", tag3: "ਅਧਿਆਤਮਿਕ ਯਾਤਰਾ",
    panel1Title: "ਪੱਥਰ ਜੋ ਬੋਲਦੇ ਹਨ।", panel1Desc: "ਭਾਰਤ ਦੀਆਂ ਯਾਦਗਾਰਾਂ ਕਲਾ, ਖਗੋਲ ਵਿਗਿਆਨ ਅਤੇ ਰਾਜਵੰਸ਼ ਦੇ ਇਤਿਹਾਸ ਦੇ ਹਜ਼ਾਰਾਂ ਸਾਲਾਂ ਨੂੰ ਜੋੜਨ ਵਾਲੇ ਆਰਕੀਟੈਕਚਰਲ ਕੰਪਾਸ ਹਨ।",
    panel2Title: "ਜੀਵਤ ਨਬਜ਼।", panel2Desc: "ਇੱਥੇ ਸੱਭਿਆਚਾਰ ਸਿਰਫ਼ ਅਜਾਇਬ ਘਰਾਂ ਵਿੱਚ ਨਹੀਂ ਦੇਖਿਆ ਜਾਂਦਾ; ਇਹ ਹਰ ਗਲੀ, ਤਿਉਹਾਰ ਅਤੇ ਕਾਰੀਗਰਾਂ ਦੀ ਕਲਾ ਵਿੱਚ ਮਹਿਸੂਸ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    card1Kicker: "ਸਦੀਵੀ ਆਰਕੀਟੈਕਚਰ", card1Title: "ਹੰਪੀ ਦੇ ਮੰਦਰ", card1Desc: "ਵਿਜੇਨਗਰ ਸਾਮਰਾਜ ਦੀ ਸ਼ਾਨ ਨੂੰ ਦਰਸਾਉਂਦੇ ਪੱਥਰ ਦੇ ਰੱਥ ਅਤੇ ਅਖੰਡ ਖੰਡਰ।",
    card2Kicker: "ਅਧਿਆਤਮਿਕ ਦਿਲ", card2Title: "ਵਾਰਾਣਸੀ ਦੇ ਘਾਟ", card2Desc: "ਦੁਨੀਆ ਦਾ ਸਭ ਤੋਂ ਪੁਰਾਣਾ ਜੀਵਤ ਸ਼ਹਿਰ, ਜਿੱਥੇ ਪ੍ਰਾਚੀਨ ਰੀਤੀ-ਰਿਵਾਜ ਪਵਿੱਤਰ ਗੰਗਾ ਨੂੰ ਮਿਲਦੇ ਹਨ।",
    card3Kicker: "ਸ਼ਾਹੀ ਵਿਰਾਸਤ", card3Title: "ਰਾਜਪੂਤਾਨਾ ਕਿਲੇ", card3Desc: "ਰਾਜਸਥਾਨ ਦੇ ਅਭੇਦ ਪਹਾੜੀ ਕਿਲੇ ਜਿਨ੍ਹਾਂ ਵਿੱਚ ਗੁੰਝਲਦਾਰ ਮਹਿਲ ਅਤੇ ਸ਼ਾਨਦਾਰ ਦ੍ਰਿਸ਼ ਹਨ।",
    card4Kicker: "ਜੀਵਤ ਕਲਾਵਾਂ", card4Title: "ਕਲਾਸੀਕਲ ਪਰੰਪਰਾਵਾਂ", card4Desc: "ਭਰਤਨਾਟਿਅਮ ਤੋਂ ਲੈ ਕੇ ਪ੍ਰਾਚੀਨ ਤਾਂਬੇ ਦੀ ਕਲਾ ਤੱਕ, ਇੱਕ ਅਜਿਹਾ ਸੱਭਿਆਚਾਰ ਜੋ ਅੱਜ ਵੀ ਜਿਉਂਦਾ ਹੈ ਅਤੇ ਸਾਹ ਲੈਂਦਾ ਹੈ।",
    card5Kicker: "ਕੁਦਰਤੀ ਵਿਰਾਸਤ", card5Title: "ਕੇਰਲ ਬੈਕਵਾਟਰਸ", card5Desc: "ਪ੍ਰਾਚੀਨ ਵਪਾਰਕ ਮਾਰਗਾਂ ਅਤੇ ਸ਼ਾਂਤ ਵਾਤਾਵਰਣਕ ਸਦਭਾਵਨਾ ਦਾ ਆਪਸ ਵਿੱਚ ਜੁੜਿਆ ਨੈਟਵਰਕ।",
    chaptersSubtitle: "ਵਿਰਾਸਤ ਯਾਤਰਾ", chaptersTitle: "ਅਧਿਆਇ ਐਕਸਪਲੋਰ ਕਰੋ", exploreBtn: "ਐਕਸਪਲੋਰ ਕਰੋ →",
    chap1Num: "ਅਧਿਆਇ 01", chap1Title: "ਸਮਾਰਕਾਂ ਦਾ ਪੁਰਾਲੇਖ", chap1Desc: "ਭਾਰਤ ਦੇ ਆਰਕੀਟੈਕਚਰਲ ਅਜੂਬਿਆਂ ਦੀ ਇੰਟਰਐਕਟਿਵ 3D ਢਾਂਚਾਗਤ ਮੈਪਿੰਗ ਅਤੇ ਇਤਿਹਾਸਕ ਪੁਨਰ ਨਿਰਮਾਣ।",
    chap2Num: "ਅਧਿਆਇ 02", chap2Title: "ਕਥਾਕਾਰ ਏਆਈ ਗਾਈਡ", chap2Desc: "ਗੂਗਲ ਜੇਮਿਨੀ ਦੁਆਰਾ ਸੰਚਾਲਿਤ ਗੱਲਬਾਤ ਦੀ ਵਿਦਿਆ ਅਤੇ ਇਤਿਹਾਸਕ ਬਿਰਤਾਂਤ, ਸਥਾਨਕ ਲੋਕਧਾਰਾ ਬੋਲਦੇ ਹੋਏ।",
    chap3Num: "ਅਧਿਆਇ 03", chap3Title: "ਲਿਪਿਕਾ ਸਕ੍ਰਿਪਟ ਲੈਂਸ", chap3Desc: "ਪ੍ਰਾਚੀਨ ਬ੍ਰਾਹਮੀ, ਪਾਲੀ, ਅਤੇ ਸੰਸਕ੍ਰਿਤ ਪੱਥਰ ਦੇ ਸ਼ਿਲਾਲੇਖਾਂ ਨੂੰ ਡੀਕੋਡ ਕਰਨ ਵਾਲੀ ਰੀਅਲ-ਟਾਈਮ ਆਪਟੀਕਲ ਅੱਖਰ ਮਾਨਤਾ।",
    chap4Num: "ਅਧਿਆਇ 04", chap4Title: "ਬਲਾਕਚੈਨ ਯਾਤਰਾ ਪਾਸਪੋਰਟ", chap4Desc: "ਭਾਰਤ ਦੇ ਸੱਭਿਆਚਾਰਕ ਗਲਿਆਰਿਆਂ ਵਿੱਚ ਤੁਹਾਡੀ ਯਾਤਰਾ ਦੀ ਪੁਸ਼ਟੀ ਕਰਨ ਵਾਲੀਆਂ ਕ੍ਰਿਪਟੋਗ੍ਰਾਫਿਕ ਡਿਜੀਟਲ ਟਿਕਟਾਂ ਅਤੇ NFT।",
    chap5Num: "ਅਧਿਆਇ 05", chap5Title: "ਤੀਰਥ-ਯਾਤਰਾ ਭੀੜ ਪੂਰਵ ਅਨੁਮਾਨ", chap5Desc: "ਇਤਿਹਾਸਕ ਮੰਦਰਾਂ ਦੀ ਲਾਈਵ ਭੀੜ ਦਾ ਅੰਦਾਜ਼ਾ ਲਗਾਉਣ ਵਾਲਾ ਏਆਈ ਇੰਜਣ।",
    chap6Num: "ਅਧਿਆਇ 06", chap6Title: "ਵਿਅੰਜਨ ਮਸਾਲਾ ਰੂਟ ਸਕੈਨਰ", chap6Desc: "AI ਕੰਪਿਊਟਰ ਵਿਜ਼ਨ ਖੇਤਰੀ ਰਸੋਈ ਇਤਿਹਾਸ ਅਤੇ ਪ੍ਰਾਚੀਨ ਮਸਾਲਾ ਵਪਾਰ ਦੇ ਮੂਲ ਨੂੰ ਡੀਕੋਡ ਕਰਦਾ ਹੈ।",
    chap7Num: "ਅਧਿਆਇ 07", chap7Title: "ਪਰੰਪਰਾ ਇਤਿਹਾਸ ਦੀਆਂ ਖੋਜਾਂ", chap7Desc: "ਜੀਓ-ਫੈਂਸਡ ਗੇਮੀਫਾਈਡ ਹੈਰੀਟੇਜ ਖੋਜ ਡਿਜੀਟਲ ਇਨਾਮ ਅਤੇ ਸਥਾਨਕ ਕਾਰੀਗਰਾਂ ਦੀਆਂ ਛੋਟਾਂ ਨੂੰ ਅਨਲੌਕ ਕਰਦੀ ਹੈ।",
    chap8Num: "ਅਧਿਆਇ 08", chap8Title: "ਕਲਾ-ਕ੍ਰਿਤੀ ਡਿਜੀਟਲ ਟਰਾਈ-ਆਨ", chap8Desc: "AR ਸਰੀਰ ਵਿਭਾਜਨ ਜੋ ਸੈਲਾਨੀਆਂ ਨੂੰ ਡਿਜ਼ੀਟਲ ਤੌਰ 'ਤੇ ਖੇਤਰੀ ਹੈਂਡਲੂਮ ਟੈਕਸਟਾਈਲ ਪਹਿਨਣ ਦੀ ਆਗਿਆ ਦਿੰਦਾ ਹੈ।",
    getStarted: "ਸ਼ੁਰੂ ਕਰੋ",
    authClose: "[ ਬੰਦ ਕਰੋ ]", authWelcomeKicker: "ਵਿਰਾਸਤ ਯਾਤਰਾ", authWelcomeTitle: "ਭਾਰਤ ਦੀ ਜੀਵੰਤ ਵਿਰਾਸਤ ਨੂੰ ਜਾਣੋ।", authWelcomeDesc: "ਪਵਿੱਤਰ ਥਾਵਾਂ, ਜੀਵੰਤ ਰਿਵਾਜਾਂ ਅਤੇ ਪੀੜ੍ਹੀਆਂ ਨੂੰ ਜੋੜਨ ਵਾਲੀਆਂ ਕਹਾਣੀਆਂ ਦੀ ਖੋਜ ਕਰੋ।",
  },
  hr: {
    logo: "भारत", navHome: "मुख्य पृष्ठ", navAbout: "म्हारै बारे म", navGallery: "गैलरी", navFeatures: "खासियत", heroTitle: "विरासत",
    introText: "पुराणे पत्थरां, चौड़े नज़ारे, अर कदे ना टूटन आली जीवंत परंपराओं का एक सुथरा ढांचा, जो भारतीय उपमहाद्वीप में एक गज़ब की सांस्कृतिक यात्रा नै आकार दे सै।",
    tag1: "पुराणी विरासत", tag2: "जीवित कला", tag3: "आध्यात्मिक यात्रा",
    panel1Title: "पत्थर जो बोलैं सैं।", panel1Desc: "भारत के स्मारक वास्तुकला के कंपास सैं जो कला, खगोल विज्ञान अर राजवंशीय इतिहास के हज़ारों सालां नै जोड़ैं सैं।",
    panel2Title: "जीवंत धड़कन।", panel2Desc: "उरै संस्कृति खाली म्यूज़ियम में कोन्या देखी जाती; या हर गली, त्योहार अर कारीगर की कला में महसूस करी जावै सै।",
    card1Kicker: "सदाबहार वास्तुकला", card1Title: "हम्पी के मंदिर", card1Desc: "विजयनगर साम्राज्य की शान नै दिखांदे पत्थर के रथ अर अखंड खंडहर।",
    card2Kicker: "आध्यात्मिक दिल", card2Title: "वाराणसी के घाट", card2Desc: "दुनिया का सबतै पुराणा जीवित शहर, जड़ै पुराणे रीति-रिवाज़ पवित्र गंगा तै मिलैं सैं।",
    card3Kicker: "शाही विरासत", card3Title: "राजपूताना किले", card3Desc: "राजस्थान के ना टूटन आले पहाड़ी किले जिन्मै सुथरे महल अर गज़ब के नज़ारे सैं।",
    card4Kicker: "जीवित कला", card4Title: "शास्त्रीय परंपराएं", card4Desc: "भरतनाट्यम तै लेकै पुराणे तांबे के शिल्प तक, एक इसी संस्कृति जो आज भी ज़िंदा सै अर सांस लेवै सै।",
    card5Kicker: "प्राकृतिक विरासत", card5Title: "केरल बैकवाटर्स", card5Desc: "पुराणे व्यापार रास्तों अर शांत पर्यावरण का आपस में जुड़्या होया नेटवर्क।",
    chaptersSubtitle: "विरासत की यात्रा", chaptersTitle: "अध्याय देख्याँ", exploreBtn: "देखें →",
    chap1Num: "अध्याय 01", chap1Title: "स्मारकां का पुरालेख", chap1Desc: "भारत के वास्तुशिल्प चमत्कारां का इंटरैक्टिव 3डी संरचनात्मक मानचित्रण और ऐतिहासिक पुनर्निर्माण।",
    chap2Num: "अध्याय 02", chap2Title: "कथाकार एआई गाइड", chap2Desc: "गूगल जेमिनी द्वारा संचालित संवादी विद्या अर ऐतिहासिक आख्यान, जो स्थानीय लोककथा बोलै सै।",
    chap3Num: "अध्याय 03", chap3Title: "लिपि स्क्रिप्ट लेंस", chap3Desc: "प्राचीन ब्राह्मी, पाली अर संस्कृत पत्थर के शिलालेखों ने डिकोड करण आली रियल-टाइम ऑप्टिकल चरित्र मान्यता।",
    chap4Num: "अध्याय 04", chap4Title: "ब्लॉकचेन यात्रा पासपोर्ट", chap4Desc: "भारत के सांस्कृतिक गलियारां म थारी यात्रा की पुष्टि करण आले क्रिप्टोग्राफिक डिजिटल टिकट अर एनएफटी।",
    chap5Num: "अध्याय 05", chap5Title: "तीर्थ-यात्रा भीड़ पूर्वानुमान", chap5Desc: "भीड़भाड़ वाले तीर्थ स्थलां खातिर लाइव भीड़ का अंदाज़ा लावण आला एआई इंजन।",
    chap6Num: "अध्याय 06", chap6Title: "व्यंजन मसाला मार्ग स्कैनर", chap6Desc: "एआई कंप्यूटर विज़न क्षेत्रीय पकवान के इतिहास अर प्राचीन मसाला व्यापार नै डिकोड करै सै।",
    chap7Num: "अध्याय 07", chap7Title: "परंपरा विद्या अन्वेषण", chap7Desc: "जियो-फेंस्ड गामिफाइड हेरिटेज एक्सप्लोरेशन डिजिटल रिवॉर्ड्स अर स्थानीय कारीगरां की छूट नै अनलॉक करै सै।",
    chap8Num: "अध्याय 08", chap8Title: "कला-कृति डिजिटल ट्राई-ऑन", chap8Desc: "एआर बॉडी सेगमेंटेशन जिसतै पर्यटक क्षेत्रीय हथकरघा कपड़ां नै डिजिटल रूप तै पहण सकैं सैं।",
    getStarted: "शुरू करां",
    authClose: "[ बंद कर ]", authWelcomeKicker: "विरासत यात्रा", authWelcomeTitle: "भारत की जीवंत विरासत नै जाणो।", authWelcomeDesc: "पवित्र जगहां, जीवंत रिवाजां अर पीढ़ियां नै जोड़ण आली कहाणियां की खोज करो।",
  }
};

function App() {
  const [lang, setLang] = useState<string>('en');
  const [isChaptersOpen, setIsChaptersOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Authentication State & Session Persistence
  const [authTab, setAuthTab] = useState<'signin' | 'signup' | 'profile'>('signin');
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('virasat_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authFullName, setAuthFullName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authFeedback, setAuthFeedback] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const saveUserSession = (user: any, token: string | null = null) => {
    if (user) {
      localStorage.setItem('virasat_user', JSON.stringify(user));
      if (token) localStorage.setItem('virasat_token', token);
      setCurrentUser(user);
    } else {
      localStorage.removeItem('virasat_user');
      localStorage.removeItem('virasat_token');
      setCurrentUser(null);
    }
  };

  // Feature Access Guard: only allow logged in users to access features, else redirect to sign in
  const handleFeatureAccess = (callback: () => void) => {
    if (!currentUser) {
      setIsChaptersOpen(false);
      setAuthTab('signin');
      setAuthFeedback({
        text: 'Please sign in or create an account to access Virasat features.',
        type: 'info'
      });
      setIsAuthOpen(true);
      return;
    }
    callback();
  };

  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [isKathakarOpen, setIsKathakarOpen] = useState<boolean>(false);
  const [isLipikaOpen, setIsLipikaOpen] = useState<boolean>(false);
  const [isQuestOpen, setIsQuestOpen] = useState<boolean>(false);
  const [questDestination, setQuestDestination] = useState<string>('');
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [questCollectedStops, setQuestCollectedStops] = useState<number>(0);
  const [isQuestGenerating, setIsQuestGenerating] = useState<boolean>(false);
  const [questError, setQuestError] = useState<string>('');
  const [isForecastOpen, setIsForecastOpen] = useState<boolean>(false);
  const [forecastSite, setForecastSite] = useState<string>('');
  const [forecastData, setForecastData] = useState<CrowdForecast | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);
  const [forecastError, setForecastError] = useState<string>('');
  const [isCraftOpen, setIsCraftOpen] = useState<boolean>(false);
  const [craftRegion, setCraftRegion] = useState<string>('');
  const [craftData, setCraftData] = useState<CraftTelemetry | null>(null);
  const [isCraftLoading, setIsCraftLoading] = useState<boolean>(false);
  const [craftError, setCraftError] = useState<string>('');
  const [isFestivalOpen, setIsFestivalOpen] = useState<boolean>(false);
  const [festivalQuery, setFestivalQuery] = useState<string>('');
  const [festivalData, setFestivalData] = useState<FestivalTelemetry | null>(null);
  const [isFestivalLoading, setIsFestivalLoading] = useState<boolean>(false);
  const [festivalError, setFestivalError] = useState<string>('');
  const [isTryOnOpen, setIsTryOnOpen] = useState<boolean>(false);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [tryOnImageName, setTryOnImageName] = useState<string>('');
  const [tryOnGarment, setTryOnGarment] = useState<string>('');
  const [tryOnData, setTryOnData] = useState<TryOnTelemetry | null>(null);
  const [isTryOnLoading, setIsTryOnLoading] = useState<boolean>(false);
  const [tryOnError, setTryOnError] = useState<string>('');
  const [tryOnVisual, setTryOnVisual] = useState<string | null>(null);
  const [tryOnImagePrompt, setTryOnImagePrompt] = useState<string>('');
  const [isTryOnVisualLoading, setIsTryOnVisualLoading] = useState<boolean>(false);
  const [lipikaImage, setLipikaImage] = useState<string | null>(null);
  const [lipikaImageName, setLipikaImageName] = useState<string>('');
  const [lipikaResult, setLipikaResult] = useState<LipikaResult | null>(null);
  const [lipikaError, setLipikaError] = useState<string>('');
  const [isLipikaAnalyzing, setIsLipikaAnalyzing] = useState<boolean>(false);
  const [isLipikaCameraOpen, setIsLipikaCameraOpen] = useState<boolean>(false);
  const lipikaVideoRef = useRef<HTMLVideoElement | null>(null);
  const lipikaStreamRef = useRef<MediaStream | null>(null);
  const lipikaFileInputRef = useRef<HTMLInputElement | null>(null);
  const [kathakarMessages, setKathakarMessages] = useState<KathakarMessage[]>([
    { sender: 'ai', text: 'Namaste! I’m Kathakar, your guide to India’s monuments, folklore, and living heritage. What would you like to explore?' },
  ]);
  const [kathakarInput, setKathakarInput] = useState<string>('');
  const [isKathakarSending, setIsKathakarSending] = useState<boolean>(false);
  const [kathakarConnection, setKathakarConnection] = useState<{ status: string; message: string; provider?: string | null }>({ status: 'checking', message: 'Checking AI providers…' });
  const [activeSightIndex, setActiveSightIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const existing = document.querySelector('script[src*="js.puter.com/v2"]');
    if (existing) return;
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.dataset.puterRuntime = 'true';
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isKathakarOpen) return;
    const controller = new AbortController();
    fetch(`${BACKEND_API_URL}/api/kathakar/health`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Could not check Gemini connection.');
        setKathakarConnection({ status: data.status, message: data.message, provider: data.provider });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setKathakarConnection({ status: 'unreachable', message: 'Could not reach the Virasat API server.' });
      });
    return () => controller.abort();
  }, [isKathakarOpen]);

  const sendKathakarMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const query = kathakarInput.trim();
    if (!query || isKathakarSending) return;

    const nextMessages = [...kathakarMessages, { sender: 'user' as const, text: query }];
    setKathakarMessages(nextMessages);
    setKathakarInput('');
    setIsKathakarSending(true);

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/kathakar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          language: ['en', 'hi', 'kn'].includes(lang) ? lang : 'auto',
          conversation_history: nextMessages.slice(-16),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'Kathakar could not answer right now.');
      setKathakarConnection({ status: 'ready', message: `${data.provider === 'groq' ? 'Groq fallback' : 'Gemini'} connected.`, provider: data.provider || 'gemini' });
      setKathakarMessages((messages) => [...messages, { sender: 'ai', text: data.reply }]);
    } catch (error) {
      const message = error instanceof TypeError
        ? 'Kathakar is offline right now. Start the Virasat API and try again.'
        : error instanceof Error
          ? error.message
          : 'Could not reach Kathakar. Please try again.';
      setKathakarConnection((connection) => connection.status === 'ready'
        ? { status: 'unreachable', message }
        : connection);
      setKathakarMessages((messages) => [...messages, { sender: 'ai', text: message }]);
    } finally {
      setIsKathakarSending(false);
    }
  };

  const startNewKathakarChat = () => {
    setKathakarMessages([{ sender: 'ai', text: 'Namaste! I’m Kathakar, your guide to India’s monuments, folklore, and living heritage. What would you like to explore?' }]);
    setKathakarInput('');
  };

  const stopLipikaCamera = () => {
    lipikaStreamRef.current?.getTracks().forEach((track) => track.stop());
    lipikaStreamRef.current = null;
    if (lipikaVideoRef.current) lipikaVideoRef.current.srcObject = null;
    setIsLipikaCameraOpen(false);
  };

  const openLipika = () => {
    handleFeatureAccess(() => {
      setIsChaptersOpen(false);
      setIsLipikaOpen(true);
      setLipikaError('');
    });
  };

  const closeLipika = () => {
    stopLipikaCamera();
    setIsLipikaOpen(false);
  };

  const handleLipikaFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    stopLipikaCamera();
    setLipikaError('');
    setLipikaResult(null);
    setLipikaImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setLipikaImage(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => setLipikaError('The image could not be opened. Please choose another file.');
    reader.readAsDataURL(file);
  };

  const startLipikaCamera = async () => {
    setLipikaError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1440 }, height: { ideal: 1080 } },
        audio: false,
      });
      lipikaStreamRef.current = stream;
      setIsLipikaCameraOpen(true);
      window.setTimeout(() => {
        if (lipikaVideoRef.current) {
          lipikaVideoRef.current.srcObject = stream;
          void lipikaVideoRef.current.play();
        }
      }, 0);
    } catch {
      setLipikaError('Camera access was unavailable. Use Upload from files instead.');
    }
  };

  const captureLipikaFrame = () => {
    const video = lipikaVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setLipikaError('The camera is still warming up. Try again in a moment.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setLipikaImage(canvas.toDataURL('image/jpeg', 0.92));
    setLipikaImageName('Live scan capture');
    setLipikaResult(null);
    stopLipikaCamera();
  };

  const analyzeLipikaImage = async () => {
    if (!lipikaImage || isLipikaAnalyzing) return;
    setIsLipikaAnalyzing(true);
    setLipikaError('');
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/lipika/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: lipikaImage,
          image_mime_type: lipikaImage.slice(5, lipikaImage.indexOf(';')) || 'image/jpeg',
          document_hint: "Belur Halmidi shasana",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'The inscription could not be read.');
      setLipikaResult(data as LipikaResult);
    } catch (error) {
      setLipikaError(error instanceof TypeError
        ? 'Lipika is offline right now. Start the Virasat API and try again.'
        : error instanceof Error ? error.message : 'The inscription could not be read.');
    } finally {
      setIsLipikaAnalyzing(false);
    }
  };

  useEffect(() => () => stopLipikaCamera(), []);

  const openQuestPassport = () => {
    handleFeatureAccess(() => {
      setIsChaptersOpen(false);
      setIsQuestOpen(true);
      setQuestError('');
    });
  };

  const closeQuestPassport = () => setIsQuestOpen(false);

  const generateQuestPassport = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const destination = questDestination.trim();
    if (!destination || isQuestGenerating) return;
    setIsQuestGenerating(true);
    setQuestError('');
    setQuestData(null);
    setQuestCollectedStops(0);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/quest/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'The quest could not be generated.');
      setQuestData(data as QuestData);
    } catch (error) {
      setQuestError(error instanceof TypeError
        ? 'The passport engine is offline. Start the Virasat API and try again.'
        : error instanceof Error ? error.message : 'The quest could not be generated.');
    } finally {
      setIsQuestGenerating(false);
    }
  };

  const collectQuestStop = (index: number) => {
    if (!questData || index !== questCollectedStops) return;
    setQuestCollectedStops((count) => Math.min(count + 1, questData.stops.length));
  };

  const openForecast = () => {
    handleFeatureAccess(() => {
      setIsChaptersOpen(false);
      setIsForecastOpen(true);
      setForecastError('');
    });
  };
  const closeForecast = () => setIsForecastOpen(false);
  const analyzeForecast = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const site = forecastSite.trim();
    if (!site || isForecastLoading) return;
    setIsForecastLoading(true); setForecastError(''); setForecastData(null);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/forecast/crowd`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ site }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'The crowd forecast could not be generated.');
      setForecastData(data as CrowdForecast);
    } catch (error) {
      setForecastError(error instanceof TypeError ? 'The forecast engine is offline. Start the Virasat API and try again.' : error instanceof Error ? error.message : 'The crowd forecast could not be generated.');
    } finally { setIsForecastLoading(false); }
  };

  const openCraftArchive = () => {
    handleFeatureAccess(() => {
      setIsChaptersOpen(false);
      setIsCraftOpen(true);
      setCraftError('');
    });
  };
  const closeCraftArchive = () => setIsCraftOpen(false);
  const discoverCraft = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const region = craftRegion.trim();
    if (!region || isCraftLoading) return;
    setIsCraftLoading(true); setCraftError(''); setCraftData(null);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/crafts/discover`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ region }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'The craft archive could not be loaded.');
      setCraftData(data as CraftTelemetry);
    } catch (error) {
      setCraftError(error instanceof TypeError ? 'The craft archive is offline. Start the Virasat API and try again.' : error instanceof Error ? error.message : 'The craft archive could not be loaded.');
    } finally { setIsCraftLoading(false); }
  };

  const openFestivalCalendar = () => {
    handleFeatureAccess(() => {
      setIsChaptersOpen(false);
      setIsFestivalOpen(true);
      setFestivalError('');
    });
  };
  const closeFestivalCalendar = () => setIsFestivalOpen(false);
  const discoverFestival = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const query = festivalQuery.trim();
    if (!query || isFestivalLoading) return;
    setIsFestivalLoading(true); setFestivalError(''); setFestivalData(null);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/festivals/discover`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'The festival calendar could not be loaded.');
      setFestivalData(data as FestivalTelemetry);
    } catch (error) {
      setFestivalError(error instanceof TypeError ? 'The cultural calendar is offline. Start the Virasat API and try again.' : error instanceof Error ? error.message : 'The festival calendar could not be loaded.');
    } finally { setIsFestivalLoading(false); }
  };

  const openTryOn = () => {
    handleFeatureAccess(() => {
      setIsChaptersOpen(false);
      setIsTryOnOpen(true);
      setTryOnError('');
    });
  };
  const closeTryOn = () => setIsTryOnOpen(false);

  const handleTryOnFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setTryOnError('');
    setTryOnData(null);
    setTryOnVisual(null);
    setTryOnImagePrompt('');
    setTryOnImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setTryOnImage(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => setTryOnError('The portrait could not be opened. Please choose another image.');
    reader.readAsDataURL(file);
  };

  const analyzeTryOn = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!tryOnImage || !tryOnGarment.trim() || isTryOnLoading) return;
    setIsTryOnLoading(true); setTryOnError(''); setTryOnData(null); setTryOnVisual(null); setTryOnImagePrompt('');
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/tryon/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: tryOnImage, image_mime_type: tryOnImage.slice(5, tryOnImage.indexOf(';')) || 'image/jpeg', garment_name: tryOnGarment.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'The virtual fitting report could not be generated.');
      setTryOnData(data as TryOnTelemetry);
    } catch (error) {
      setTryOnError(error instanceof TypeError ? 'The virtual stylist is offline. Start the Virasat API and try again.' : error instanceof Error ? error.message : 'The virtual fitting report could not be generated.');
    } finally { setIsTryOnLoading(false); }
  };

  const generateTryOnVisual = async () => {
    if (!tryOnData || isTryOnVisualLoading) return;
    const runtime = (window as Window & { puter?: PuterRuntime }).puter;
    setIsTryOnVisualLoading(true); setTryOnError('');
    try {
      const promptResponse = await fetch(`${BACKEND_API_URL}/api/tryon/image-prompt`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: tryOnImage,
          garment_name: tryOnGarment,
          garment_formatted: tryOnData.garmentNameFormatted,
          region_of_origin: tryOnData.regionOfOrigin,
          fabric_history: tryOnData.fabricHistory,
          draping_technique: tryOnData.drapingTechnique,
          style_synthesis: tryOnData.styleSynthesis,
        }),
      });
      const promptData = await promptResponse.json().catch(() => ({}));
      if (!promptResponse.ok) {
        throw new Error(promptData.detail || 'The heritage image prompt could not be prepared.');
      }
      if (typeof promptData.image_url === 'string' && promptData.image_url.startsWith('/')) {
        setTryOnImagePrompt('');
        setTryOnVisual(promptData.image_url);
        return;
      }
      if (typeof promptData.prompt !== 'string' || !promptData.prompt.trim()) {
        throw new Error('The heritage image prompt could not be prepared.');
      }
      const generatedPrompt = promptData.prompt.trim();
      setTryOnImagePrompt(generatedPrompt);
      if (!runtime?.ai?.txt2img) {
        setTryOnError('The personalized prompt is ready, but the Puter image service has not loaded yet. Retry in a moment.');
        return;
      }
      const result = await runtime.ai.txt2img(generatedPrompt, { input_image: tryOnImage || undefined, ratio: { w: 3, h: 4 } });
      let source = '';
      if (typeof result === 'string') source = result;
      else if (result instanceof HTMLImageElement) source = result.src;
      else if (result && typeof result === 'object' && 'src' in result && typeof result.src === 'string') source = result.src;
      if (!source) throw new Error('The image generator returned no image.');
      setTryOnVisual(source);
    } catch (error) {
      setTryOnError(error instanceof TypeError
        ? 'The image service could not be reached. Your styling prompt is ready; retry when the service is available.'
        : error instanceof Error ? error.message : 'The heritage visual could not be generated.');
    } finally { setIsTryOnVisualLoading(false); }
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = authEmail.trim().toLowerCase();
    if (!cleanEmail || !authPassword) {
      setAuthFeedback({ text: 'Please enter both email and password.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setAuthFeedback({ text: 'Verifying credentials with Supabase...', type: 'info' });

    try {
      let loggedUser = null;
      let token = null;

      // 1. Try FastAPI Backend
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: authPassword }),
        });
        if (res.ok) {
          const json = await res.json();
          loggedUser = json.user;
          token = json.session?.access_token || null;
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Login failed');
        }
      } catch (backendErr: any) {
        // 2. Direct Supabase Fallback
        if (!supabase) throw backendErr;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data?.user) {
          loggedUser = {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            role: 'explorer',
          };
          token = data.session?.access_token || null;
        }
      }

      if (loggedUser) {
        saveUserSession(loggedUser, token);
        setAuthFeedback({ text: `✓ Welcome back, ${loggedUser.full_name || 'Explorer'}!`, type: 'success' });
        setAuthPassword('');
        setTimeout(() => {
          setIsAuthOpen(false);
          setAuthFeedback(null);
        }, 1500);
      } else {
        throw new Error('Could not establish session. Please verify your credentials.');
      }
    } catch (err: any) {
      setAuthFeedback({ text: err.message || 'Invalid email or password. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = authEmail.trim().toLowerCase();
    const name = authFullName.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !authPassword) {
      setAuthFeedback({ text: 'Please fill out all required fields.', type: 'error' });
      return;
    }
    if (authPassword.length < 6) {
      setAuthFeedback({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setAuthFeedback({ text: 'Creating account & syncing credentials in Supabase...', type: 'info' });

    try {
      let createdUser = null;
      let token = null;

      // 1. Try FastAPI Backend
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: authPassword, full_name: name }),
        });
        if (res.ok) {
          const json = await res.json();
          createdUser = json.user;
          token = json.session?.access_token || null;
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Registration failed');
        }
      } catch (backendErr: any) {
        // 2. Direct Supabase Fallback
        if (!supabase) throw backendErr;
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: authPassword,
          options: {
            data: { full_name: name, role: 'explorer' },
          },
        });
        if (error) throw error;
        if (data?.user) {
          createdUser = {
            id: data.user.id,
            email: data.user.email,
            full_name: name,
            role: 'explorer',
          };
          token = data.session?.access_token || null;

          try {
            await supabase.from('subscribers').upsert([{ email: cleanEmail, full_name: name }]);
            await supabase.from('user_accounts').upsert([{ email: cleanEmail, full_name: name, auth_id: data.user.id }]);
          } catch {}
        }
      }

      if (createdUser) {
        saveUserSession(createdUser, token);
        setAuthFeedback({ text: '✓ Account created successfully! Welcome to Virasat.', type: 'success' });
        setAuthPassword('');
        setTimeout(() => {
          setIsAuthOpen(false);
          setAuthFeedback(null);
        }, 1800);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setAuthFeedback({ text: err.message || 'Error creating account. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await supabase?.auth.signOut();
    } catch {}
    saveUserSession(null);
    setIsChaptersOpen(false);
    setIsArchiveOpen(false);
    setIsKathakarOpen(false);
    setIsLipikaOpen(false);
    setIsQuestOpen(false);
    setIsForecastOpen(false);
    setIsCraftOpen(false);
    setIsFestivalOpen(false);
    setIsTryOnOpen(false);
    setAuthFeedback({ text: '✓ You have been signed out.', type: 'success' });
    setTimeout(() => {
      setAuthTab('signin');
      setAuthFeedback(null);
    }, 800);
  };

  // Parallax animation ref
  const cinemaRef = useRef<HTMLElement>(null);
  const sightsTrackRef = useRef<HTMLDivElement>(null);

  const t = translations[lang] || translations.en;

  // App Initial Loading Fadeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isAuthOpen]);

  // Parallax Scroll Animation Setup
  useEffect(() => {
    let rafId: number;
    let targetScroll = 0;
    let smoothScroll = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);
    const smoothstep = (min: number, max: number, value: number) => {
      const x = clamp((value - min) / (max - min));
      return x * x * (3 - 2 * x);
    };

    const segmentInOut = (val: number, inStart: number, inEnd: number, outStart: number, outEnd: number) => {
      const enter = smoothstep(inStart, inEnd, val);
      const exit = smoothstep(outStart, outEnd, val);
      return { enter, exit, active: enter * (1 - exit) };
    };

    const handleScroll = () => {
      targetScroll = window.scrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const update = () => {
      smoothScroll = lerp(smoothScroll, targetScroll, 0.12);
      mouseX = lerp(mouseX, targetMouseX, 0.1);
      mouseY = lerp(mouseY, targetMouseY, 0.1);

      const root = document.documentElement;
      const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
      const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
      const progress = clamp(smoothScroll / 5000);
      const introExit = smoothstep(90, 650, smoothScroll);
      const sightsEnter = smoothstep(2680, 4500, smoothScroll);
      const sightsControlsEnter = smoothstep(4100, 4660, smoothScroll);
      const blurActive = clamp(frame2.active + frame3.active);
      const frame2Opacity = frame2.active * (1 - frame3.enter);
      const splitDrift = Math.pow(frame2.enter, 1.5);
      const panel2Opacity = frame2.active * (1 - frame2.exit);
      const panel3Opacity = frame3.active * (1 - frame3.exit);
      const backScale = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
      const sharedHeroY = progress * -74;
      const sharedHeroScale = progress * 0.23;
      const sightsScreenTop = Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 50;

      root.style.setProperty("--mx", mouseX.toFixed(4));
      root.style.setProperty("--my", mouseY.toFixed(4));
      root.style.setProperty("--back-opacity", (1 - frame2.active * 0.06).toFixed(4));
      root.style.setProperty("--back-x", `${(mouseX * -12).toFixed(4)}px`);
      root.style.setProperty("--back-y", `${(mouseY * -4).toFixed(4)}px`);
      root.style.setProperty("--back-scale", backScale.toFixed(4));
      root.style.setProperty("--four-y", `${(10 + progress * 10).toFixed(4)}vh`);
      root.style.setProperty("--four-scale", (0.78 + progress * 0.16).toFixed(4));
      root.style.setProperty("--bazaar-y", `${(20 - progress * 8).toFixed(4)}vh`);
      root.style.setProperty("--blur-px", `${(blurActive * 14).toFixed(4)}px`);
      root.style.setProperty("--back-brightness", (1 - blurActive * 0.255).toFixed(4));
      root.style.setProperty("--bazaar-blur-px", `${(frame2.active * 14).toFixed(4)}px`);
      root.style.setProperty("--bazaar-brightness", (1 - frame2.active * 0.255 - frame3.active * 0.06).toFixed(4));
      root.style.setProperty("--bazaar-saturation", (1 + frame3.active * 0.18).toFixed(4));
      root.style.setProperty("--shade-opacity", "1");
      root.style.setProperty("--shade-z", frame2.active > 0.02 ? "2" : "0");
      root.style.setProperty("--shade-top-alpha", (blurActive * 0.465).toFixed(4));
      root.style.setProperty("--shade-mid-alpha", (blurActive * 0.42).toFixed(4));
      root.style.setProperty("--shade-bottom-alpha", (blurActive * 0.51).toFixed(4));

      root.style.setProperty("--title-y", `${(introExit * -210).toFixed(4)}px`);
      root.style.setProperty("--title-scale", (1 - introExit * 0.08).toFixed(4));
      root.style.setProperty("--title-opacity", (1 - introExit).toFixed(4));

      root.style.setProperty("--monument-x", `calc(-50% + ${(mouseX * 18).toFixed(4)}px)`);
      root.style.setProperty("--monument-y", `${(mouseY * 8 + sharedHeroY - frame2.exit * 760).toFixed(4)}px`);
      root.style.setProperty("--monument-bottom", `${(5 - frame2.enter * 13).toFixed(4)}vh`);
      root.style.setProperty("--monument-width", `${(67.2 + frame2.enter * 37.8).toFixed(4)}vw`);
      root.style.setProperty("--monument-scale", (1.02 + sharedHeroScale + frame2.exit * 0.46).toFixed(4));

      root.style.setProperty("--split-left-x", `calc(-50% + ${(-splitDrift * 46).toFixed(4)}vw + ${(mouseX * 22).toFixed(4)}px)`);
      root.style.setProperty("--split-left-y", `${(mouseY * 10 + sharedHeroY - splitDrift * 180).toFixed(4)}px`);
      root.style.setProperty("--split-left-scale", (1 + sharedHeroScale + frame2.enter * 0.74).toFixed(4));
      root.style.setProperty("--split-right-x", `calc(-50% + ${(splitDrift * 46).toFixed(4)}vw + ${(mouseX * 22).toFixed(4)}px)`);
      root.style.setProperty("--split-right-y", `${(mouseY * 10 + sharedHeroY - splitDrift * 180).toFixed(4)}px`);
      root.style.setProperty("--split-right-scale", (1 + sharedHeroScale + frame2.enter * 0.74).toFixed(4));

      root.style.setProperty("--frame2-opacity", frame2Opacity.toFixed(4));
      root.style.setProperty("--frame2-x", `calc(-50% + ${(mouseX * 10).toFixed(4)}px)`);
      root.style.setProperty("--frame2-y", `calc(-50% + ${(mouseY * 8 - frame2.exit * 150).toFixed(4)}px)`);
      root.style.setProperty("--frame2-scale", (1.06 + frame2.enter * 0.08 + frame2.exit * 0.08).toFixed(4));

      root.style.setProperty("--intro-copy-y", `${(introExit * 90).toFixed(4)}px`);
      root.style.setProperty("--intro-copy-opacity", (1 - introExit).toFixed(4));
      root.style.setProperty("--panel2-opacity", panel2Opacity.toFixed(4));
      root.style.setProperty("--panel2-y", `calc(-50% + ${(-frame2.exit * 86 + (1 - frame2.enter) * 58).toFixed(4)}px)`);
      root.style.setProperty("--panel3-opacity", panel3Opacity.toFixed(4));
      root.style.setProperty("--panel3-y", `calc(-50% + ${(-frame3.exit * 86 + (1 - frame3.enter) * 58).toFixed(4)}px)`);

      root.style.setProperty("--sights-opacity", sightsEnter.toFixed(4));
      root.style.setProperty("--sights-controls-opacity", sightsControlsEnter.toFixed(4));
      root.style.setProperty("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
      root.style.setProperty("--sights-y", "0px");
      root.style.setProperty("--sights-enter-x", `${((1 - sightsEnter) * 128).toFixed(4)}vw`);
      root.style.setProperty("--sights-scale", "1");
      root.style.setProperty("--sights-top", `${sightsScreenTop.toFixed(4)}px`);
      root.style.setProperty("--sights-screen-top", `${sightsScreenTop.toFixed(4)}px`);

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleNextSight = () => {
    setActiveSightIndex((prev) => (prev + 1) % 5);
  };

  const handlePrevSight = () => {
    setActiveSightIndex((prev) => (prev - 1 + 5) % 5);
  };

  useEffect(() => {
    const root = document.documentElement;
    const cardWidth = 380;
    const gap = 20;
    root.style.setProperty("--sights-shift", `${-(cardWidth + gap) * activeSightIndex}px`);
  }, [activeSightIndex]);

  return (
    <>
      {/* Loading Overlay */}
      <div id="app-loading-container" className={isLoading ? '' : 'is-hidden'}>
        <div className="loader-film-strip top"></div>
        <div className="loader-text">loading</div>
        <div className="loader-film-strip bottom"></div>
      </div>

      <main className="site-shell">
        {/* Parallax Cinema Scroll Section */}
        <section className="cinema-scroll" id="cinema" ref={cinemaRef} aria-label="Virasat cinematic scroll story">
          <div className="stage">
            <div className="world">
              <img className="scene-img sky-img" src="https://raft-blast-61784561.figma.site/_assets/v11/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png" alt="" />

              {/* Site Header */}
              <header className="site-header" aria-label="Primary navigation">
                <a className="site-logo" href="#cinema" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                    alt="Indian Flag"
                    style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px' }}
                  />
                  <span>{t.logo}</span>
                </a>

                <nav className="site-nav" aria-label="Main menu">
                  <a href="#cinema">{t.navHome}</a>
                  <a href="#cinema">{t.navAbout}</a>
                  <a href="#cinema">{t.navGallery}</a>
                  <a
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault();
                      handleFeatureAccess(() => setIsChaptersOpen(true));
                    }}
                  >
                    {t.navFeatures}
                  </a>
                </nav>

                <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px', justifySelf: 'end' }}>
                  {/* Account / User Status Button */}
                  <div id="header-user-status" style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                      className={`header-auth-btn ${currentUser ? 'logged-in' : ''}`}
                      onClick={() => {
                        setAuthTab(currentUser ? 'profile' : 'signin');
                        setAuthFeedback(null);
                        setIsAuthOpen(true);
                      }}
                      aria-label="Account / Sign In"
                    >
                      <span className="auth-btn-icon">👤</span>
                      <span className="auth-btn-text">
                        {currentUser ? (currentUser.full_name || currentUser.email.split('@')[0]) : 'Sign In'}
                      </span>
                    </button>
                  </div>

                  {/* Language Selector Dropdown */}
                  <div className="language-dropdown-container">
                    <button className="language-switcher" aria-label="Change language">
                      <span>{lang.toUpperCase()}</span>
                      <span aria-hidden="true">⌄</span>
                    </button>
                    <div className="language-menu">
                      <button onClick={() => setLang('en')}>English</button>
                      <button onClick={() => setLang('hi')}>हिन्दी (Hindi)</button>
                      <button onClick={() => setLang('kn')}>ಕನ್ನಡ (Kannada)</button>
                      <button onClick={() => setLang('pa')}>ਪੰਜਾਬੀ (Punjabi)</button>
                      <button onClick={() => setLang('hr')}>हरियाणवी (Haryanvi)</button>
                    </div>
                  </div>

                  {/* Chapters Menu Trigger Button */}
                  <button
                    className="chapters-trigger-btn"
                    onClick={() => handleFeatureAccess(() => setIsChaptersOpen(true))}
                    aria-label="Open chapters menu"
                  >
                    <span></span><span></span><span></span>
                  </button>
                </div>
              </header>

              {/* Background Stack */}
              <div className="back-stack">
                <img className="scene-img back-img back-four" src="https://raft-blast-61784561.figma.site/_assets/v11/8a7f8af50e0ce92ec2e228e7b0b4112178c51cf1.png" alt="" />
                <img className="scene-img back-img back-tradition" src="https://raft-blast-61784561.figma.site/_assets/v11/864afe00e41e2fa20a5aa546e15cb807e0f81384.png" alt="" />
              </div>

              {/* Sights Slider */}
              <section className="sights-slider" aria-label="Heritage sights slider">
                <div className="sights-track" ref={sightsTrackRef}>
                  <article className="sight-card" tabIndex={0} role="button">
                    <span className="sight-kicker">{t.card1Kicker}</span>
                    <img className="sight-pin" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png" alt="" />
                    <h3 className="sight-title">{t.card1Title}</h3>
                    <p className="sight-desc">{t.card1Desc}</p>
                  </article>
                  <article className="sight-card" tabIndex={0} role="button">
                    <span className="sight-kicker">{t.card2Kicker}</span>
                    <img className="sight-pin" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png" alt="" />
                    <h3 className="sight-title">{t.card2Title}</h3>
                    <p className="sight-desc">{t.card2Desc}</p>
                  </article>
                  <article className="sight-card" tabIndex={0} role="button">
                    <span className="sight-kicker">{t.card3Kicker}</span>
                    <img className="sight-pin" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230448_825949c9-ccdb-4857-b4a6-e349eccc9010.png" alt="" />
                    <h3 className="sight-title">{t.card3Title}</h3>
                    <p className="sight-desc">{t.card3Desc}</p>
                  </article>
                  <article className="sight-card" tabIndex={0} role="button">
                    <span className="sight-kicker">{t.card4Kicker}</span>
                    <img className="sight-pin" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png" alt="" />
                    <h3 className="sight-title">{t.card4Title}</h3>
                    <p className="sight-desc">{t.card4Desc}</p>
                  </article>
                  <article className="sight-card" tabIndex={0} role="button">
                    <span className="sight-kicker">{t.card5Kicker}</span>
                    <img className="sight-pin" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png" alt="" />
                    <h3 className="sight-title">{t.card5Title}</h3>
                    <p className="sight-desc">{t.card5Desc}</p>
                  </article>
                </div>
              </section>

              {/* Slider Controls */}
              <div className="sights-controls is-ready" aria-label="Slider controls">
                <button className="sight-nav sight-prev" onClick={handlePrevSight} aria-label="Previous sight">←</button>
                <button className="sight-nav sight-next" onClick={handleNextSight} aria-label="Next sight">→</button>
              </div>

              {/* Hero Title */}
              <h1 className="hero-title">{t.heroTitle}</h1>

              <img className="scene-img splitframe-img splitframe-left" src="https://raft-blast-61784561.figma.site/_assets/v11/7536d7b60a1fce482cf6edf3f0bffd3bad5d0f8a.png" alt="" />
              <img className="scene-img splitframe-img splitframe-right" src="https://raft-blast-61784561.figma.site/_assets/v11/392db6a6a6b98e868bd7f8d3f55bb719d51e5028.png" alt="" />
              <img className="scene-img monument-img" src="https://raft-blast-61784561.figma.site/_assets/v11/c6a6d8ef49bca43f708aa852692942c45ec950d4.png" alt="" />
              <img className="scene-img frame-two-img" src="https://raft-blast-61784561.figma.site/_assets/v11/ba75252bab2b1c510987b74837770f7bc8a6b2d4.png" alt="" />
              <div className="shade"></div>
            </div>

            {/* Intro Copy */}
            <section className="intro-copy" aria-label="Virasat overview">
              <p>{t.introText}</p>
              <div className="hero-tags" aria-label="Virasat highlights">
                <span>{t.tag1}</span>
                <span>{t.tag2}</span>
                <span>{t.tag3}</span>
              </div>
              <button
                className="get-started-btn"
                onClick={() => {
                  setAuthTab(currentUser ? 'profile' : 'signin');
                  setAuthFeedback(null);
                  setIsAuthOpen(true);
                }}
              >
                {t.getStarted}
              </button>
            </section>

            {/* Story Panels */}
            <section className="story-panel story-panel-bridge">
              <h2>{t.panel1Title}</h2>
              <p>{t.panel1Desc}</p>
            </section>
            <section className="story-panel story-panel-bazaar">
              <h2>{t.panel2Title}</h2>
              <p>{t.panel2Desc}</p>
            </section>
          </div>
        </section>

        {/* Site Footer */}
        <footer className="site-footer">
          <div className="footer-top">
            <div className="footer-headline">
              <h2>Empowering Immersive<br />Heritage Journeys</h2>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <a href="#">Platform</a>
                <a href="#">Technology</a>
                <a href="#">Blockchain ID</a>
                <a href="#">Analytics</a>
                <a href="#">Partners</a>
              </div>
              <div className="footer-col">
                <a href="#">About Us</a>
                <a href="#">News</a>
                <a href="#">Careers</a>
                <a href="#">Contact Us</a>
              </div>
              <div className="footer-col">
                <a href="#">LinkedIn</a>
                <a href="#">Follow Us on X</a>
              </div>
            </div>
          </div>

          <div className="footer-divider"></div>
          <div className="footer-pattern"></div>

          <div className="footer-bottom">
            <div className="footer-logo-wrapper">
              <img
                className="footer-logo-icon"
                src="/logo.png"
                alt="Virasat Logo"
                style={{ borderRadius: '50%', objectFit: 'cover', background: 'transparent' }}
              />
              <span className="footer-logo-text">Virasat</span>
            </div>
            <div className="footer-legal">
              <span>© 2026 Virasat. All rights reserved.</span>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
              <span>Designed for <strong>SIH</strong></span>
            </div>
          </div>
        </footer>
      </main>

      {/* Chapters Modal Overlay */}
      <div className={`chapters-modal-overlay ${isChaptersOpen ? 'is-open' : ''}`} id="chapters-modal">
        <div className="chapters-modal-container">
          <button className="chapters-close-btn" onClick={() => setIsChaptersOpen(false)}>×</button>
          <div className="chapters-header">
            <span className="chapters-subtitle">{t.chaptersSubtitle}</span>
            <h2>{t.chaptersTitle}</h2>
          </div>

          <div className="chapters-stack">
            {/* Chapter 01 — Fully Functional Archive of Monuments */}
            <div
              className="chapter-card"
              data-chapter="1"
              onClick={() => {
                handleFeatureAccess(() => {
                  setIsChaptersOpen(false);
                  setIsArchiveOpen(true);
                });
              }}
            >
              <span className="chapter-num">{t.chap1Num}</span>
              <h3>{t.chap1Title}</h3>
              <p>{t.chap1Desc}</p>
              <span className="chapter-explore">{t.exploreBtn}</span>
            </div>

            {/* Chapter 02 */}
            <div
              className="chapter-card"
              data-chapter="2"
              onClick={() => {
                handleFeatureAccess(() => {
                  setIsChaptersOpen(false);
                  setIsKathakarOpen(true);
                });
              }}
            >
              <span className="chapter-num">{t.chap2Num}</span>
              <h3>{t.chap2Title}</h3>
              <p>{t.chap2Desc}</p>
              <span className="chapter-explore">{t.exploreBtn}</span>
            </div>

            {/* Chapter 03 */}
            <div
              className="chapter-card"
              data-chapter="3"
              onClick={() => {
                setIsChaptersOpen(false);
                openLipika();
              }}
            >
              <span className="chapter-num">{t.chap3Num}</span>
              <h3>{t.chap3Title}</h3>
              <p>{t.chap3Desc}</p>
              <span className="chapter-explore">{t.exploreBtn}</span>
            </div>

            {/* Chapter 04 */}
            <div
              className="chapter-card"
              data-chapter="4"
              onClick={() => {
                setIsChaptersOpen(false);
                openQuestPassport();
              }}
            >
              <span className="chapter-num">{t.chap4Num}</span>
              <h3>{t.chap4Title}</h3>
              <p>{t.chap4Desc}</p>
              <span className="chapter-explore">{t.exploreBtn}</span>
            </div>

            {/* Chapter 05 */}
            <div
              className="chapter-card"
              data-chapter="5"
              onClick={() => {
                setIsChaptersOpen(false);
                openForecast();
              }}
            >
              <span className="chapter-num">{t.chap5Num}</span>
              <h3>{t.chap5Title}</h3>
              <p>{t.chap5Desc}</p>
              <span className="chapter-explore">{t.exploreBtn}</span>
            </div>

            {/* Chapter 06 */}
            <div
              className="chapter-card"
              data-chapter="6"
              onClick={() => {
                setIsChaptersOpen(false);
                openCraftArchive();
              }}
            >
              <span className="chapter-num">{t.chap6Num}</span>
              <h3>{t.chap6Title}</h3>
              <p>{t.chap6Desc}</p>
              <span className="chapter-explore">{t.exploreBtn}</span>
            </div>

            {/* Chapter 07 */}
            <div
              className="chapter-card"
              data-chapter="7"
              onClick={() => {
                setIsChaptersOpen(false);
                openFestivalCalendar();
              }}
            >
              <span className="chapter-num">{t.chap7Num}</span>
              <h3>{t.chap7Title}</h3>
              <p>{t.chap7Desc}</p>
              <span className="chapter-explore">{t.exploreBtn}</span>
            </div>

            {/* Chapter 08 */}
            <div
              className="chapter-card"
              data-chapter="8"
              onClick={() => {
                openTryOn();
              }}
            >
              <span className="chapter-num">{t.chap8Num}</span>
              <h3>{t.chap8Title}</h3>
              <p>{t.chap8Desc}</p>
              <span className="chapter-explore">{t.exploreBtn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth / Menu Modal Overlay */}
      <div className={`auth-modal-overlay ${isAuthOpen ? 'is-open' : ''}`} id="auth-modal">
        <div className="auth-modal-header">
          <div className="auth-logo">VIRASAT</div>
          <button className="auth-close-btn" onClick={() => setIsAuthOpen(false)}>{t.authClose}</button>
        </div>

        <div className="auth-modal-content">
          <div className="auth-left">
            <section className="auth-welcome" aria-labelledby="auth-welcome-title">
              <span className="auth-welcome-kicker">{t.authWelcomeKicker}</span>
              <h1 id="auth-welcome-title">{t.authWelcomeTitle}</h1>
              <p>{t.authWelcomeDesc}</p>
              <div className="auth-welcome-rule" aria-hidden="true"><span>✦</span></div>
            </section>
          </div>

          <div className="auth-right">
            <div className="auth-form-container">
              <img
                src="https://raft-blast-61784561.figma.site/_assets/v11/8a7f8af50e0ce92ec2e228e7b0b4112178c51cf1.png"
                alt="Virasat heritage landscape"
                className="auth-image"
              />

              {/* Tab Switcher (Only when not logged in) */}
              {!currentUser && (
                <div className="auth-tabs">
                  <button
                    type="button"
                    className={`auth-tab-btn ${authTab === 'signin' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthTab('signin');
                      setAuthFeedback(null);
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthTab('signup');
                      setAuthFeedback(null);
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* 1. SIGN IN FORM */}
              {authTab === 'signin' && !currentUser && (
                <div className="auth-tab-panel">
                  <h3>Sign In to Virasat</h3>
                  <p>Access your synced passport, stamps, and heritage explorations.</p>

                  <form className="auth-form" onSubmit={handleSignIn}>
                    <div className="auth-input-group">
                      <label htmlFor="react-signin-email">EMAIL ADDRESS</label>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          id="react-signin-email"
                          placeholder="explorer@virasat.org"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label htmlFor="react-signin-password">PASSWORD</label>
                      <div className="input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="react-signin-password"
                          placeholder="••••••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="pw-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? '🔒' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                      <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>

                    <div className="auth-switch-prompt">
                      <span>Don't have an account?</span>
                      <button
                        type="button"
                        className="auth-switch-link"
                        onClick={() => {
                          setAuthTab('signup');
                          setAuthFeedback(null);
                        }}
                      >
                        Create one here
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 2. SIGN UP FORM */}
              {authTab === 'signup' && !currentUser && (
                <div className="auth-tab-panel">
                  <h3>Create Virasat Account</h3>
                  <p>Register to preserve cultural heritage & collect digital yatra stamps.</p>

                  <form className="auth-form" onSubmit={handleSignUp}>
                    <div className="auth-input-group">
                      <label htmlFor="react-signup-name">NAME</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="react-signup-name"
                          placeholder="Name (optional)"
                          value={authFullName}
                          onChange={(e) => setAuthFullName(e.target.value)}
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label htmlFor="react-signup-email">EMAIL ADDRESS</label>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          id="react-signup-email"
                          placeholder="explorer@virasat.org"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label htmlFor="react-signup-password">PASSWORD</label>
                      <div className="input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="react-signup-password"
                          placeholder="Min 6 characters"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="pw-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? '🔒' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                      <span>{isSubmitting ? 'Creating Account...' : 'Sign Up'}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>

                    <div className="auth-switch-prompt">
                      <span>Already registered?</span>
                      <button
                        type="button"
                        className="auth-switch-link"
                        onClick={() => {
                          setAuthTab('signin');
                          setAuthFeedback(null);
                        }}
                      >
                        Sign in to your account
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 3. ACTIVE PROFILE PANEL */}
              {currentUser && (
                <div className="auth-tab-panel">
                  <div className="profile-card">
                    <div className="profile-avatar">
                      {(currentUser.full_name || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                      <h4>{currentUser.full_name || 'Heritage Explorer'}</h4>
                      <p>{currentUser.email}</p>
                      <div className="profile-badge">
                        <span className="badge-dot"></span>
                        <span>Supabase Authenticated</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-stats">
                    <div className="stat-box">
                      <span className="stat-value">0</span>
                      <span className="stat-label">Yatra Stamps</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">0</span>
                      <span className="stat-label">Lore Quests</span>
                    </div>
                  </div>

                  <button type="button" className="auth-signout-btn" onClick={handleSignOut}>
                    <span>Sign Out</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </button>
                </div>
              )}

              {/* Real-time Status Feedback */}
              {authFeedback && (
                <div className={`auth-feedback is-visible ${authFeedback.type}`}>
                  {authFeedback.text}
                </div>
              )}

            </div>
          </div>
        </div>

        <div className="auth-modal-footer">
          <div className="auth-footer-copyright">
            © 2026 VIRASAT PLATFORM. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>

      {/* Chapter 01: The Archive of Monuments Immersive Fullscreen Experience */}
      {isArchiveOpen && (
        <Suspense fallback={<div className="archive-loading" role="status">Opening the heritage archive…</div>}>
          <ArchiveOfMonuments
            isOpen={isArchiveOpen}
            onClose={() => setIsArchiveOpen(false)}
          />
        </Suspense>
      )}

      <section
        className={`fullscreen-feature-view ${isKathakarOpen ? 'is-active' : ''}`}
        aria-hidden={!isKathakarOpen}
        aria-label="Kathakar AI Guide"
      >
        <nav className="feature-nav">
          <button className="back-btn" onClick={() => setIsKathakarOpen(false)}>← Back to Virasat</button>
          <h1 className="nav-title">KATHAKAR</h1>
            <span className={`nav-status kathakar-status ${kathakarConnection.status}`} role="status" title={kathakarConnection.message}>
            <span className="connection-dot" />{kathakarConnection.status === 'ready' ? `${kathakarConnection.provider === 'groq' ? 'Groq fallback' : 'Gemini'} connected` : kathakarConnection.status === 'checking' ? 'Checking AI…' : 'AI unavailable'}
          </span>
        </nav>
        <div className="kathakar-workspace">
          <aside className="kathakar-sidebar">
            <button className="new-chat-btn" onClick={startNewKathakarChat}>＋ New conversation</button>
            <span className="sidebar-section-title">Your guide</span>
            <p className="kathakar-sidebar-copy">Ask about Indian monuments, dynasties, architecture, folklore, and living traditions.</p>
          </aside>
          <div className="kathakar-main-chat">
            <header className="feature-header-mini">
              <span className="chapters-subtitle">CHAPTER 02 · HERITAGE STORYTELLER</span>
              <h2>Kathakar AI Guide</h2>
            </header>
            <div className="chat-messages" aria-live="polite" aria-busy={isKathakarSending}>
              {kathakarMessages.map((message, index) => (
                <div className={`chat-msg ${message.sender === 'user' ? 'user-msg' : 'ai-msg'}`} key={`${index}-${message.sender}`}>
                  {message.text}
                </div>
              ))}
              {isKathakarSending && <div className="chat-msg ai-msg" role="status">Kathakar is gathering the stories…</div>}
            </div>
            <form className="chat-input-area" onSubmit={sendKathakarMessage}>
              <input
                value={kathakarInput}
                onChange={(event) => setKathakarInput(event.target.value)}
                placeholder="Ask about a monument, story, or tradition…"
                aria-label="Message Kathakar"
                disabled={isKathakarSending}
              />
              <button id="send-chat-btn" type="submit" disabled={isKathakarSending || !kathakarInput.trim()}>
                {isKathakarSending ? '…' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section
        className={`fullscreen-feature-view ${isLipikaOpen ? 'is-active' : ''}`}
        aria-hidden={!isLipikaOpen}
        aria-label="Lipika Script Lens"
      >
        <nav className="feature-nav">
          <button className="back-btn" onClick={closeLipika}>← Back to Virasat</button>
          <h1 className="nav-title">LIPIKA</h1>
          <span className="nav-status lipika-nav-status">EPIGRAPHIC SCANNER</span>
        </nav>
        <div className="lipika-workspace">
          <div className="lipika-header">
            <span className="chapters-subtitle">CHAPTER 03 · SCRIPT LENS</span>
            <h2>Decode the stone</h2>
            <p>Upload a clear inscription image or use a live camera scan. Lipika identifies the script and returns a readable, line-grouped translation.</p>
          </div>

          <div className="lipika-content">
            <div className="lipika-capture-panel">
              <input
                ref={lipikaFileInputRef}
                className="lipika-file-input"
                type="file"
                accept="image/*"
                onChange={handleLipikaFile}
                aria-label="Upload inscription image"
              />
              {isLipikaCameraOpen ? (
                <div className="lipika-camera-frame">
                  <video ref={lipikaVideoRef} autoPlay muted playsInline aria-label="Live inscription camera preview" />
                  <div className="lipika-camera-guides" aria-hidden="true"><span /><span /><span /><span /></div>
                  <div className="lipika-camera-actions">
                    <button className="lipika-secondary-btn" onClick={stopLipikaCamera}>Cancel</button>
                    <button className="lipika-primary-btn" onClick={captureLipikaFrame}>Capture scan</button>
                  </div>
                </div>
              ) : lipikaImage ? (
                <div className="lipika-preview-card">
                  <img src={lipikaImage} alt="Selected inscription for Lipika analysis" />
                  <div className="lipika-preview-overlay">
                    <span>{lipikaImageName || 'Inscription image selected'}</span>
                    <button className="lipika-secondary-btn" onClick={() => { setLipikaImage(null); setLipikaResult(null); }}>Choose another</button>
                  </div>
                </div>
              ) : (
                <button className="lipika-upload-zone" onClick={() => lipikaFileInputRef.current?.click()}>
                  <span className="lipika-upload-icon">⌁</span>
                  <strong>Drop an inscription image here</strong>
                  <span>JPG, PNG, or HEIC · use a sharp, front-facing capture</span>
                </button>
              )}
              {!isLipikaCameraOpen && (
                <div className="lipika-capture-actions">
                  <button className="lipika-primary-btn" onClick={() => lipikaFileInputRef.current?.click()}>Upload from files</button>
                  <button className="lipika-secondary-btn" onClick={startLipikaCamera}>Live scan</button>
                </div>
              )}
              {lipikaImage && !isLipikaCameraOpen && (
                <button className="lipika-analyze-btn" onClick={analyzeLipikaImage} disabled={isLipikaAnalyzing}>
                  {isLipikaAnalyzing ? 'Reading inscription…' : 'Read with Lipika →'}
                </button>
              )}
              {lipikaError && <p className="lipika-error" role="alert">{lipikaError}</p>}
            </div>

            <div className="lipika-result-panel" aria-live="polite">
              {lipikaResult ? (
                <>
                  <div className="lipika-result-heading">
                    <div>
                      <span className="chapters-subtitle">READING COMPLETE</span>
                      <h3>{lipikaResult.title}</h3>
                    </div>
                    <span className="lipika-provider-badge">{lipikaResult.provider === 'gemini' ? 'GEMINI VISION' : 'REFERENCE READING'}</span>
                  </div>
                  <dl className="lipika-metadata">
                    <div><dt>Script</dt><dd>{lipikaResult.script}</dd></div>
                    <div><dt>Date</dt><dd>{lipikaResult.approximate_date}</dd></div>
                    <div><dt>Location</dt><dd>{lipikaResult.location}</dd></div>
                  </dl>
                  <div className="lipika-transcription">
                    {lipikaResult.lines.map((line) => (
                      <section className="lipika-line-group" key={line.label}>
                        <h4>{line.label}</h4>
                        <p>{line.text}</p>
                      </section>
                    ))}
                  </div>
                </>
              ) : (
                <div className="lipika-empty-result">
                  <span className="lipika-result-mark">01</span>
                  <h3>Your reading will appear here</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`fullscreen-feature-view ${isQuestOpen ? 'is-active' : ''}`}
        aria-hidden={!isQuestOpen}
        aria-label="Yatra-Quest digital passport"
      >
        <nav className="feature-nav">
          <button className="back-btn" onClick={closeQuestPassport}>← Return to Chapters</button>
          <h1 className="nav-title ch4-nav-title">YATRA-QUEST</h1>
          <span className="nav-status ch4-nav-status"><span className="connection-dot" />LIVE QR &amp; REWARD ENGINE</span>
        </nav>
        <main className="dashboard-layout ch4-dashboard-layout">
          <div className="search-panel ch4-search-panel">
            <span className="chapters-subtitle">CHAPTER 04 · DIGITAL PASSPORT</span>
            <h2 className="dashboard-heading">Gamified Tourist Passport</h2>
            <p className="dashboard-subtext">Enter a destination to generate a unique quest passport. Check in at three cultural landmarks to collect cryptographic stamps and unlock a proposed partner reward.</p>
            <form className="search-box-wrapper ch4-search-box" onSubmit={generateQuestPassport}>
              <input
                value={questDestination}
                onChange={(event) => setQuestDestination(event.target.value)}
                placeholder="E.g., Varanasi, Jaipur, Hampi…"
                aria-label="Quest destination"
              />
              <button type="submit" disabled={isQuestGenerating || !questDestination.trim()}>
                {isQuestGenerating ? 'Mapping…' : 'Generate Quest ↗'}
              </button>
            </form>
            {questError && <p className="ch4-error" role="alert">{questError}</p>}
          </div>

          {questData && (
            <div className="quest-dashboard" aria-live="polite">
              <article className="passport-card ch4-card">
                <span className="card-label">SECURE DIGITAL PASSPORT</span>
                <strong className="passport-destination">{questData.destination}</strong>
                <div className="qr-container">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(questData.passport_hash)}&color=070b0a&bgcolor=fdf1e1`}
                    alt={`QR code for ${questData.passport_hash}`}
                  />
                </div>
                <span className="hash-string">{questData.passport_hash}</span>
                <span className="passport-provider">{questData.provider === 'gemini' ? 'Gemini quest engine' : 'Heritage route engine'}</span>
              </article>

              <article className="trail-card ch4-card">
                <div className="trail-heading">
                  <span className="card-label trail-label">ACTIVE QUEST TRAIL</span>
                  <span className="trail-progress">{questCollectedStops}/{questData.stops.length} stamps</span>
                </div>
                <div className="stamp-grid">
                  {questData.stops.map((stop, index) => {
                    const collected = index < questCollectedStops;
                    const ready = index === questCollectedStops;
                    return (
                      <button
                        className={`stamp-slot ${collected ? 'collected' : ''} ${ready ? 'active' : ''}`}
                        key={stop}
                        onClick={() => collectQuestStop(index)}
                        disabled={!ready}
                        aria-label={`${collected ? 'Collected' : ready ? 'Collect' : 'Locked'} stop ${index + 1}: ${stop}`}
                      >
                        <span className="stamp-number">0{index + 1}</span>
                        <span className="stamp-icon">{collected ? '✓' : ready ? '📍' : '○'}</span>
                        <span className="stamp-name">{stop}</span>
                        <span className="stamp-action">{collected ? 'STAMP COLLECTED' : ready ? 'CHECK IN' : 'LOCKED'}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="trail-hint">Collect each stop in sequence to unlock the final reward.</p>
              </article>

              <article className={`reward-card ch4-card ${questCollectedStops === questData.stops.length ? 'reward-unlocked' : ''}`}>
                <span className="card-label highlight-label">GOVERNMENT / PARTNER REWARD</span>
                {questCollectedStops === questData.stops.length ? (
                  <>
                    <h3 className="dynamic-value highlight-value">{questData.reward.title}</h3>
                    <p className="context-text highlight-text">{questData.reward.description}</p>
                    <span className="reward-unlocked-badge">QUEST COMPLETE · REWARD UNLOCKED</span>
                  </>
                ) : (
                  <>
                    <h3 className="dynamic-value highlight-value">REWARD LOCKED</h3>
                    <p className="context-text highlight-text">Complete all three stops to reveal your destination reward.</p>
                  </>
                )}
              </article>
            </div>
          )}
        </main>
      </section>

      <section className={`fullscreen-feature-view ${isForecastOpen ? 'is-active' : ''}`} aria-hidden={!isForecastOpen} aria-label="Tirth-Yatra crowd forecast">
        <nav className="feature-nav">
          <button className="back-btn" onClick={closeForecast}>← Return to Chapters</button>
          <h1 className="nav-title">TIRTH-YATRA FORECAST</h1>
          <span className="nav-status dashboard-nav-status"><span className="connection-dot" />LIVE AI PREDICTIVE MODELING</span>
        </nav>
        <main className="dashboard-layout ai-dashboard-layout">
          <div className="search-panel ai-search-panel">
            <span className="chapters-subtitle">CHAPTER 05 · CROWD ANALYTICS</span>
            <h2 className="dashboard-heading">Pilgrimage Crowd Analytics</h2>
            <p className="dashboard-subtext">Enter a sacred heritage site to estimate crowd density, peak congestion, and a calmer visiting window using ritual calendars and travel patterns.</p>
            <form className="search-box-wrapper ai-search-box" onSubmit={analyzeForecast}>
              <input value={forecastSite} onChange={(event) => setForecastSite(event.target.value)} placeholder="E.g., Vaishno Devi, Golden Temple, Madurai Meenakshi…" aria-label="Pilgrimage site" />
              <button type="submit" disabled={isForecastLoading || !forecastSite.trim()}>{isForecastLoading ? 'Analyzing…' : 'Run Analytics ↗'}</button>
            </form>
            {forecastError && <p className="dashboard-error" role="alert">{forecastError}</p>}
          </div>
          {forecastData && (
            <div className="telemetry-grid dashboard-output-grid" aria-live="polite">
              <article className="telemetry-card">
                <span className="card-label">CURRENT DENSITY MODEL · {forecastData.provider === 'gemini' ? 'GEMINI AI' : forecastData.provider === 'groq' ? 'GROQ AI' : 'SCRIPTED FALLBACK'}</span>
                <h3 className="dynamic-value density-value" style={{ color: forecastData.densityPercentage > 80 ? '#ff4d4d' : forecastData.densityPercentage > 50 ? '#ffcc00' : '#4bb543' }}>{forecastData.densityStatus}</h3>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${forecastData.densityPercentage}%`, background: forecastData.densityPercentage > 80 ? '#ff4d4d' : forecastData.densityPercentage > 50 ? '#ffcc00' : '#4bb543' }} /></div>
                <span className="density-percent">{forecastData.densityPercentage}% estimated occupancy</span>
              </article>
              <article className="telemetry-card">
                <span className="card-label">PEAK CONGESTION WINDOW</span>
                <h3 className="dynamic-value">{forecastData.peakWindow}</h3>
                <p className="context-text">{forecastData.peakReason}</p>
              </article>
              <article className="telemetry-card optimal-card">
                <span className="card-label highlight-label">AI OPTIMAL VISIT WINDOW</span>
                <h3 className="dynamic-value highlight-value">{forecastData.optimalWindow}</h3>
                <p className="context-text highlight-text">{forecastData.optimalReason}</p>
              </article>
            </div>
          )}
        </main>
      </section>

      <section className={`fullscreen-feature-view ${isCraftOpen ? 'is-active' : ''}`} aria-hidden={!isCraftOpen} aria-label="Kala-Bazaar artisan heritage archive">
        <nav className="feature-nav">
          <button className="back-btn" onClick={closeCraftArchive}>← Return to Chapters</button>
          <h1 className="nav-title">KALA-BAZAAR</h1>
          <span className="nav-status dashboard-nav-status"><span className="connection-dot" />LIVE CRAFT &amp; GI SCANNER</span>
        </nav>
        <main className="dashboard-layout ai-dashboard-layout">
          <div className="search-panel ai-search-panel">
            <span className="chapters-subtitle">CHAPTER 06 · ARTISAN HERITAGE</span>
            <h2 className="dashboard-heading">Regional Artisan Archive</h2>
            <p className="dashboard-subtext">Enter an Indian city, state, or region to discover its living craft, GI status, history, and practical ways to spot an authentic piece.</p>
            <form className="search-box-wrapper ai-search-box" onSubmit={discoverCraft}>
              <input value={craftRegion} onChange={(event) => setCraftRegion(event.target.value)} placeholder="E.g., Kanchipuram, Kutch, Mysuru, Varanasi…" aria-label="Craft region" />
              <button type="submit" disabled={isCraftLoading || !craftRegion.trim()}>{isCraftLoading ? 'Scanning…' : 'Discover Crafts ↗'}</button>
            </form>
            {craftError && <p className="dashboard-error" role="alert">{craftError}</p>}
          </div>
          {craftData && (
            <div className="craft-telemetry-container dashboard-output-panel" aria-live="polite">
              <div className="telemetry-header">
                <div><span className="chapters-subtitle">REGION MAPPED · {craftData.provider === 'gemini' ? 'GEMINI' : craftData.provider === 'groq' ? 'GROQ' : 'SCRIPTED FALLBACK'}</span><h3 className="dashboard-output-title">{craftData.regionFormatted}</h3></div>
                <span className="status-pill status-pill-green">{craftData.giStatus}</span>
              </div>
              <div className="telemetry-grid dashboard-output-grid craft-output-grid">
                <article className="telemetry-card craft-history-card"><span className="card-label">PRIMARY HERITAGE CRAFT &amp; HISTORY</span><h3 className="dynamic-value craft-name-value">{craftData.craftName}</h3><p className="context-text craft-history-text">{craftData.craftHistory}</p></article>
                <article className="telemetry-card"><span className="card-label marker-label">AUTHENTICITY MARKERS · SPOT FAKES</span><ul className="dashboard-list">{craftData.authenticityMarkers.map((marker) => <li key={marker}>{marker}</li>)}</ul></article>
              </div>
            </div>
          )}
        </main>
      </section>

      <section className={`fullscreen-feature-view ${isFestivalOpen ? 'is-active' : ''}`} aria-hidden={!isFestivalOpen} aria-label="Parv-Darshan festival heritage calendar">
        <nav className="feature-nav">
          <button className="back-btn" onClick={closeFestivalCalendar}>← Return to Chapters</button>
          <h1 className="nav-title">PARV-DARSHAN</h1>
          <span className="nav-status dashboard-nav-status"><span className="connection-dot" />LIVE CULTURAL CALENDAR</span>
        </nav>
        <main className="dashboard-layout ai-dashboard-layout">
          <div className="search-panel ai-search-panel">
            <span className="chapters-subtitle">CHAPTER 07 · FESTIVAL HERITAGE</span>
            <h2 className="dashboard-heading">Cultural Festival &amp; Etiquette Engine</h2>
            <p className="dashboard-subtext">Enter a region and time of year to discover a festival’s living history, rituals, and respectful tourism guidelines.</p>
            <form className="search-box-wrapper ai-search-box" onSubmit={discoverFestival}>
              <input value={festivalQuery} onChange={(event) => setFestivalQuery(event.target.value)} placeholder="E.g., Kerala in August, Varanasi in November…" aria-label="Festival region and season" />
              <button type="submit" disabled={isFestivalLoading || !festivalQuery.trim()}>{isFestivalLoading ? 'Mapping…' : 'Discover Festivals ↗'}</button>
            </form>
            {festivalError && <p className="dashboard-error" role="alert">{festivalError}</p>}
          </div>
          {festivalData && (
            <div className="festival-telemetry-container dashboard-output-panel" aria-live="polite">
              <div className="telemetry-header">
                <div><span className="chapters-subtitle">CULTURAL CALENDAR · {festivalData.provider === 'gemini' ? 'GEMINI' : festivalData.provider === 'groq' ? 'GROQ' : 'SCRIPTED FALLBACK'}</span><h3 className="dashboard-output-title">{festivalData.festivalName}</h3></div>
                <span className="status-pill status-pill-orange">{festivalData.regionFormatted}</span>
              </div>
              <div className="telemetry-grid dashboard-output-grid festival-output-grid">
                <article className="telemetry-card festival-history-card"><span className="card-label">MYTHOLOGICAL SIGNIFICANCE &amp; HISTORY</span><p className="context-text festival-history-text">{festivalData.historicalSignificance}</p></article>
                <article className="telemetry-card optimal-card"><span className="card-label highlight-label">RESPONSIBLE TOURIST ETIQUETTE</span><ul className="dashboard-list">{festivalData.touristEtiquette.map((item) => <li key={item}>{item}</li>)}</ul></article>
              </div>
            </div>
          )}
        </main>
      </section>

      <section className={`fullscreen-feature-view ${isTryOnOpen ? 'is-active' : ''}`} aria-hidden={!isTryOnOpen} aria-label="Kala-Kriti digital try-on">
        <nav className="feature-nav">
          <button className="back-btn" onClick={closeTryOn}>← Return to Chapters</button>
          <h1 className="nav-title">KALA-KRITI · DIGITAL TRY-ON</h1>
          <span className="nav-status dashboard-nav-status"><span className="connection-dot" />LIVE HERITAGE STYLIST</span>
        </nav>
        <main className="dashboard-layout ai-dashboard-layout ch8-dashboard-layout">
          <div className="search-panel ai-search-panel">
            <span className="chapters-subtitle">CHAPTER 08 · VIRTUAL FITTING ROOM</span>
            <h2 className="dashboard-heading">Virtual Heritage Fitting Room</h2>
            <p className="dashboard-subtext">Upload a portrait and select regional attire. The stylist returns fabric history, traditional draping telemetry, and a respectful cultural styling synthesis. An optional Puter visual creates a generic textile moodboard without altering or identifying a real person.</p>
          </div>

          <div className="try-on-workspace">
            <form className="try-on-upload-panel" onSubmit={analyzeTryOn}>
              <label className="ch8-upload-zone" htmlFor="ch8-file-input">
                {tryOnImage ? <img className="ch8-preview-img" src={tryOnImage} alt="Uploaded portrait preview" /> : <span className="ch8-upload-placeholder"><span className="ch8-upload-icon">👤</span><strong>Upload Your Photo</strong><small>Front-facing portraits work best</small></span>}
                <span className="ch8-upload-overlay">{tryOnImageName || 'Choose image file'}</span>
                <input id="ch8-file-input" type="file" accept="image/*" onChange={handleTryOnFile} />
                {isTryOnLoading && <span className="ch8-laser-scan" aria-hidden="true" />}
              </label>
              <input className="ch8-garment-input" value={tryOnGarment} onChange={(event) => setTryOnGarment(event.target.value)} placeholder="E.g., Rajputana Sherwani, Banarasi Saree…" aria-label="Requested regional attire" />
              <button className="ch8-analyze-btn" type="submit" disabled={isTryOnLoading || !tryOnImage || !tryOnGarment.trim()}>{isTryOnLoading ? 'Synthesizing Fit…' : 'Synthesize Fit ↗'}</button>
              <small className="ch8-privacy-note">Your portrait is sent to the image service only when you choose Generate Heritage Visual.</small>
              {tryOnError && <p className="dashboard-error" role="alert">{tryOnError}</p>}
            </form>

            <div className={`ch8-telemetry ${tryOnData ? 'is-ready' : ''}`} aria-live="polite">
              {!tryOnData ? <div className="ch8-empty-state"><span className="ch8-empty-mark">KALA-KRITI / 08</span><h3>Awaiting a portrait</h3><p>Upload a photo and name the attire to unlock the styling report.</p></div> : (
                <>
                  <div className="telemetry-card ch8-garment-card">
                    <div><span className="card-label tech-label">SELECTED GARMENT · PERSONALIZED STYLE REPORT</span><h3 className="dynamic-value ch8-garment-name">{tryOnData.garmentNameFormatted}</h3></div>
                    <div className="ch8-origin"><span className="card-label tech-label">REGION OF ORIGIN</span><p>{tryOnData.regionOfOrigin}</p></div>
                  </div>
                  <div className="telemetry-grid ch8-telemetry-grid">
                    <article className="telemetry-card"><span className="card-label tech-label">FABRIC &amp; CRAFT HISTORY</span><p className="context-text ch8-copy">{tryOnData.fabricHistory}</p></article>
                    <article className="telemetry-card"><span className="card-label tech-label">TRADITIONAL DRAPING TECHNIQUE</span><p className="context-text ch8-copy">{tryOnData.drapingTechnique}</p></article>
                  </div>
                  <article className="telemetry-card optimal-card ch8-synthesis-card"><span className="card-label tech-label highlight-label">PERSONALIZED STYLING SYNTHESIS</span><p className="context-text highlight-text ch8-copy">{tryOnData.styleSynthesis}</p><button className="ch8-visual-btn" type="button" onClick={generateTryOnVisual} disabled={isTryOnVisualLoading}>{isTryOnVisualLoading ? 'Preparing prompt & generating…' : tryOnVisual ? 'Regenerate Heritage Visual ↗' : 'Generate Heritage Visual ↗'}</button></article>
                  {tryOnImagePrompt && <article className="telemetry-card ch8-prompt-card"><span className="card-label tech-label">IMAGE PROMPT FOR YOUR TRY-ON</span><p>{tryOnImagePrompt}</p></article>}
                  {tryOnVisual && <article className="telemetry-card ch8-visual-card"><span className="card-label tech-label">GENERATED TRY-ON VISUAL · DISPLAYED IN VIRASAT</span><img src={tryOnVisual} alt={`Generated ${tryOnData.garmentNameFormatted} try-on for the uploaded portrait`} /></article>}
                </>
              )}
            </div>
          </div>
        </main>
      </section>
    </>
  );
}

export default App;
