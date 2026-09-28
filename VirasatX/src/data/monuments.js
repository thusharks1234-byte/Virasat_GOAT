export const MONUMENTS = [
  {
    id: "hampi",
    name: "Hampi (Vijayanagara)",
    state: "Karnataka",
    latitude: 15.3350,
    longitude: 76.4600,
    shortDescription: "The magnificent ruins of the Vijayanagara Empire capital, featuring monolithic granite temples, musical pillars, and the world-renowned stone chariot.",
    historicalPeriod: "14th – 16th Century CE (Vijayanagara Empire)",
    architecturalStyle: "Dravidian / Vijayanagara Monolithic Granite Architecture",
    modelPath: "models/hampi.glb",
    imagePath: "images/hampi.png",
    patron: "King Devaraya II & Krishnadevaraya",
    unescoYear: 1986,
    keyFeatures: [
      "Monolithic granite stone chariot dedicated to Garuda",
      "56 musical pillars in the Vittala Temple complex",
      "Sophisticated subterranean aqueduct & royal bath systems",
      "Virupaksha Temple rising 50 meters above the Tungabhadra River"
    ],
    timeline: [
      { era: "Past (Origin)", year: "1336 CE", description: "Founded by brothers Harihara I and Bukka Raya I as the capital of the Vijayanagara Empire." },
      { era: "Historical Period (Golden Era)", year: "1509–1529 CE", description: "Reign of Krishnadevaraya; peak architectural expansion, monumental gopurams and international gemstone trade." },
      { era: "Present (Heritage)", year: "1986–Today", description: "Designated a UNESCO World Heritage site and preserved as India's largest open-air archaeological museum." }
    ]
  },
  {
    id: "st-philomena",
    name: "St. Philomena's Church",
    state: "Karnataka (Mysuru)",
    latitude: 12.3211,
    longitude: 76.6583,
    shortDescription: "A majestic Neo-Gothic cathedral in Mysuru inspired by Germany's Cologne Cathedral, featuring twin 175-foot soaring spires, subterranean crypt, and vibrant French stained glass.",
    historicalPeriod: "1936 CE (Wadiyar Dynasty / Neo-Gothic Era)",
    architecturalStyle: "Neo-Gothic (Twin Spires & French Stained Glass)",
    modelPath: "models/st-philomena.glb",
    imagePath: "images/taj.png",
    patron: "Maharaja Nalwadi Krishnaraja Wadiyar IV & French Architect Daly",
    virtualTourUrl: "https://www.p4panorama.com/360-virtual-tour/st-philomena-church-mysore/",
    keyFeatures: [
      "Twin 175-foot soaring spires modeled after the iconic Cologne Cathedral in Germany",
      "Underground crypt holding sacred 3rd-century relics beneath the main marble altar",
      "Vibrant stained-glass windows crafted in France depicting the life of Jesus Christ",
      "Cruciform layout seating over 800 worshippers under Gothic ribbed vaulting"
    ],
    timeline: [
      { era: "Past (Origin)", year: "1843 CE", description: "Maharaja Mummadi Krishnaraja Wadiyar grants land for the original church for the European community." },
      { era: "Historical Period (Construction)", year: "1933–1936 CE", description: "Maharaja Nalwadi Krishnaraja Wadiyar IV commissions modern cathedral designed by French architect Daly." },
      { era: "Present (Architectural Beacon)", year: "Today", description: "One of Asia's tallest cathedrals, standing as a monument to Karnataka's syncretic heritage." }
    ]
  },
  {
    id: "humayuns-tomb",
    name: "Humayun's Tomb",
    state: "Delhi (New Delhi)",
    latitude: 28.5933,
    longitude: 77.2507,
    shortDescription: "The first grand garden-tomb of the Indian subcontinent, commissioned by Empress Bega Begum, synthesizing Persian geometry and Mughal craftsmanship as the precursor to the Taj Mahal.",
    historicalPeriod: "1565 – 1572 CE (Mughal Empire)",
    architecturalStyle: "Early Mughal / Persian Charbagh Synthesis",
    modelPath: "models/humayuns-tomb.glb",
    imagePath: "images/taj.png",
    patron: "Empress Bega Begum & Emperor Akbar",
    unescoYear: 1993,
    virtualTourUrl: "https://www.360cities.net/image/humayuns-tomb#google_vignette",
    keyFeatures: [
      "First Indian building to introduce the Persian double-dome standing 42.5 meters tall",
      "Symmetrical 30-acre Charbagh (four-quadrant) garden divided by water channels",
      "Red sandstone facade framed with white marble inlay ornamentation and vaulted pishtaq arches",
      "Houses the royal tombs of over 150 Mughal dignitaries, known as the 'Dormitory of the Mughals'"
    ],
    timeline: [
      { era: "Past (Conception)", year: "1565 CE", description: "Commissioned nine years after Emperor Humayun's death by his senior consort, Empress Bega Begum." },
      { era: "Historical Period (Completion)", year: "1572 CE", description: "Completed under Persian architect Mirak Mirza Ghiyas, pioneering Mughal monumental garden architecture." },
      { era: "Present (UNESCO World Heritage)", year: "1993–Today", description: "Inscribed on UNESCO World Heritage list and painstakingly conserved by the Aga Khan Trust for Culture." }
    ]
  },
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    state: "Uttar Pradesh",
    latitude: 27.1751,
    longitude: 78.0421,
    shortDescription: "An ivory-white marble mausoleum on the right bank of the river Yamuna, acclaimed globally as the pinnacle of Indo-Islamic symmetry and architectural harmony.",
    historicalPeriod: "1631 – 1648 CE (Mughal Empire)",
    architecturalStyle: "Mughal (Indo-Islamic & Persian synthesis)",
    modelPath: "models/taj-mahal.glb",
    imagePath: "images/taj.png",
    patron: "Emperor Shah Jahan",
    unescoYear: 1983,
    keyFeatures: [
      "Translucent Makrana white marble inlaid with 28 types of precious stones",
      "Perfect bilateral symmetry with four 40-meter tilted minarets",
      "Central double-dome standing 73 meters tall",
      "Charbagh Persian four-quadrant reflecting pool garden layout"
    ],
    timeline: [
      { era: "Past (Conception)", year: "1631 CE", description: "Commissioned by Emperor Shah Jahan in memory of his beloved empress Mumtaz Mahal." },
      { era: "Historical Period (Completion)", year: "1648 CE", description: "Main mausoleum completed by over 20,000 master artisans, calligraphers, and lapidaries." },
      { era: "Present (Global Icon)", year: "1983–Today", description: "Recognized as a UNESCO World Heritage site and voted one of the New Seven Wonders of the World." }
    ]
  },
  {
    id: "konark",
    name: "Konark Sun Temple",
    state: "Odisha",
    latitude: 19.8876,
    longitude: 86.0945,
    shortDescription: "Conceived as a colossal stone chariot of the Sun God Surya, with 24 elaborately carved wheels functioning as exact astronomical sundials pulled by seven stone horses.",
    historicalPeriod: "1250 CE (Eastern Ganga Dynasty)",
    architecturalStyle: "Kalinga Architectural Style (Rekha & Pidha Deula)",
    modelPath: "models/konark.glb",
    imagePath: "images/konark.png",
    patron: "King Narasimhadeva I",
    unescoYear: 1984,
    keyFeatures: [
      "24 monolithic wheels acting as precision solar sundials calculating exact minutes",
      "Constructed using Khondalite stone joined with iron dowels and heavy magnetic loadstones",
      "Intricate Natya Mandap dance hall depicting 128 traditional Odissi mudras",
      "Oriented directly towards the dawn of the Bay of Bengal sunrise"
    ],
    timeline: [
      { era: "Past (Foundation)", year: "1250 CE", description: "Commissioned by King Narasimhadeva I of the Eastern Ganga Dynasty over 12 years with 1,200 sculptors." },
      { era: "Historical Period (Astronomical Use)", year: "13th–16th Century CE", description: "Served as the maritime navigational landmark known as the 'Black Pagoda' to European sailors." },
      { era: "Present (Conservation)", year: "1984–Today", description: "Inscribed on the UNESCO World Heritage list, continuously conserved for monumental stone relief art." }
    ]
  },
  {
    id: "ajanta",
    name: "Ajanta Caves",
    state: "Maharashtra",
    latitude: 20.5519,
    longitude: 75.7033,
    shortDescription: "Thirty rock-cut Buddhist cave monuments excavated into a horseshoe-shaped ravine cliff, containing masterpieces of ancient Indian Buddhist mural painting and sculpture.",
    historicalPeriod: "2nd Century BCE – 5th Century CE (Satavahana & Vakataka Dynasties)",
    architecturalStyle: "Ancient Rock-Cut Buddhist Architecture (Chaityas & Viharas)",
    modelPath: "models/ajanta.glb",
    imagePath: "images/ashoka_edict.png",
    patron: "Harishena (Vakataka King) & Satavahana Rulers",
    unescoYear: 1983,
    keyFeatures: [
      "Dry fresco tempera murals illustrating Jataka tales and Bodhisattva Padmapani",
      "Acoustically tuned chaitya halls carved directly into basalt volcanic cliffs",
      "Monolithic columns with intricate animal capitols and ribbed stone vaults",
      "Cave 26 giant Reclining Buddha portraying Mahaparinirvana"
    ],
    timeline: [
      { era: "Past (Phase 1)", year: "2nd Century BCE", description: "Initial Hinayana Buddhist caves carved during the reign of the Satavahana Empire." },
      { era: "Historical Period (Phase 2)", year: "460–480 CE", description: "Resurgence under Emperor Harishena of the Vakataka Empire; creation of the famous paintings." },
      { era: "Present (Rediscovery)", year: "1819–Today", description: "Rediscovered by British officer John Smith in 1819; designated UNESCO World Heritage in 1983." }
    ]
  },
  {
    id: "ellora",
    name: "Ellora Caves (Kailasa Temple)",
    state: "Maharashtra",
    latitude: 20.0268,
    longitude: 75.1780,
    shortDescription: "A monumental multi-religious rock-cut sanctuary featuring Cave 16 (Kailash), the world's largest monolithic rock excavation carved top-down from a single basalt cliff.",
    historicalPeriod: "6th – 10th Century CE (Rashtrakuta & Yadava Dynasties)",
    architecturalStyle: "Monolithic Rock-Cut Dravidian & Cave Architecture",
    modelPath: "models/ellora.glb",
    imagePath: "images/ashoka_edict.png",
    patron: "King Krishna I (Rashtrakuta Dynasty)",
    unescoYear: 1983,
    virtualTourUrl: "https://www.p4panorama.com/360-virtual-tour/ellora-caves/",
    keyFeatures: [
      "Kailasa Temple: over 200,000 tonnes of volcanic rock carved top-down without scaffolds",
      "Harmonious coexistence of 34 caves across Hindu, Buddhist, and Jain traditions",
      "Multistorey subterranean monasteries with life-sized elephant colonnades",
      "Massive cantilevered gateway mandapas standing over 30 meters high"
    ],
    timeline: [
      { era: "Past (Excavation Start)", year: "600 CE", description: "Early excavation of Buddhist and Hindu caves along the ancient trade caravan route." },
      { era: "Historical Period (Kailasa Wonder)", year: "756–774 CE", description: "King Krishna I commissions the monumental monolithic Kailasa temple complex (Cave 16)." },
      { era: "Present (World Wonder)", year: "1983–Today", description: "UNESCO World Heritage designation celebrating unprecedented ancient stone engineering feats." }
    ]
  },
  {
    id: "qutub-minar",
    name: "Qutub Minar",
    state: "Delhi",
    latitude: 28.5244,
    longitude: 77.1855,
    shortDescription: "A 72.5-meter fluted red sandstone and marble minaret symbolizing the dawn of the Delhi Sultanate, adorned with intricate geometric calligraphic bands and stalactite corbeling.",
    historicalPeriod: "1192 – 1220 CE (Mamluk / Delhi Sultanate)",
    architecturalStyle: "Indo-Islamic / Early Afghan Minaret Architecture",
    modelPath: "models/qutub-minar.glb",
    imagePath: "images/qutb.png",
    patron: "Qutb-ud-din Aibak & Shams-ud-din Iltutmish",
    unescoYear: 1993,
    keyFeatures: [
      "Five distinct storeys with alternating angular and rounded flutings",
      "Projecting balconies supported by exquisite stalactite corbels and Quranic calligraphy",
      "Adjacent 4th-century rust-resistant Iron Pillar of Chandragupta II",
      "Quwwat-ul-Islam Mosque built using cloistered arches and repurposed stone columns"
    ],
    timeline: [
      { era: "Past (Foundation)", year: "1199 CE", description: "Base level founded by Qutb-ud-din Aibak following the establishment of the Delhi Sultanate." },
      { era: "Historical Period (Completion)", year: "1220 CE & 1368 CE", description: "Iltutmish adds three storeys; Firoz Shah Tughlaq repairs top levels with white marble." },
      { era: "Present (National Landmark)", year: "1993–Today", description: "Inscribed on the UNESCO World Heritage list as an outstanding monument of early Islamic Delhi." }
    ]
  },
  {
    id: "sanchi",
    name: "Sanchi Stupa",
    state: "Madhya Pradesh",
    latitude: 23.4793,
    longitude: 77.7397,
    shortDescription: "The Great Stupa at Sanchi is India's oldest stone structure, featuring a hemispherical dome sheltering holy Buddhist relics with four grand carved stone Torana gateways.",
    historicalPeriod: "3rd Century BCE – 1st Century CE (Maurya & Satavahana Empires)",
    architecturalStyle: "Ancient Mauryan / Buddhist Stupa Architecture",
    modelPath: "models/sanchi.glb",
    imagePath: "images/ashoka_edict.png",
    patron: "Emperor Ashoka the Great",
    unescoYear: 1989,
    keyFeatures: [
      "Hemispherical dome (anda) symbolizing the cosmic vault of heaven",
      "Four monumental Torana ceremonial gateways facing the cardinal compass directions",
      "Exquisite narrative relief carvings depicting the life of Buddha and Ashoka's pilgrimages",
      "Harmika square balcony topped with the triple-umbrella (chhatra) of high spiritual rank"
    ],
    timeline: [
      { era: "Past (Ashokan Origin)", year: "3rd Century BCE", description: "Emperor Ashoka commissions the brick stupa core and installs the Ashoka Pillar with lion capital." },
      { era: "Historical Period (Gateways Added)", year: "1st Century BCE", description: "Satavahana craftsmen add the four intricately sculpted stone Torana gateways." },
      { era: "Present (Global Sanctuary)", year: "1989–Today", description: "Restored by Sir John Marshall in the early 1900s; UNESCO World Heritage site since 1989." }
    ]
  },
  {
    id: "mahabalipuram",
    name: "Mahabalipuram (Shore Temple & Rathas)",
    state: "Tamil Nadu",
    latitude: 12.6169,
    longitude: 80.1927,
    shortDescription: "An ancient Coromandel Coast port sanctuary famous for monolithic Pancha Rathas, giant open-air rock reliefs like Arjuna's Penance, and the sea-swept structural Shore Temple.",
    historicalPeriod: "7th – 8th Century CE (Pallava Dynasty)",
    architecturalStyle: "Early Pallava Rock-Cut & Coastal Structural Dravidian Architecture",
    modelPath: "models/mahabalipuram.glb",
    imagePath: "images/brihadeeswarar.png",
    patron: "King Narasimhavarman I (Mamalla) & Rajasimha",
    unescoYear: 1984,
    keyFeatures: [
      "Shore Temple: Twin structural granite shrines standing against the ocean waves for 1,300 years",
      "Descent of the Ganges (Arjuna's Penance): World's largest open-air rock relief carving",
      "Pancha Rathas: Five monolithic chariot shrines carved from single granite boulders",
      "Krishna's Butterball: A 250-tonne precariously balanced balancing granite boulder"
    ],
    timeline: [
      { era: "Past (Port Dynasty)", year: "630–668 CE", description: "King Narasimhavarman I transforms the harbor into a major center for Southeast Asian trade." },
      { era: "Historical Period (Shore Temple)", year: "700–728 CE", description: "King Rajasimha builds the structural Shore Temple out of cut granite blocks along the surf." },
      { era: "Present (Coastal Wonder)", year: "1984–Today", description: "UNESCO World Heritage designation; survived the 2004 tsunami revealing submerged ancient structures." }
    ]
  }
];
