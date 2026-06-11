// ============================================
// ADF Forge - Data Layer
// ============================================
// Source of truth for the entire tri-service reference.
// BASES (25+ tri-service: RAAF operational, bare/forward, Navy fleet/training, Army barracks + training), AIRCRAFT, NAVY, ARMY, WEAPONS, SYSTEMS, GLOSSARY, RANKS, etc.
// Edit here, reload index.html. Grids and cross-refs are built from this.

// ---------- ADF BASES (Tri-service: RAAF, Army, Navy) ----------
// Optional: add `image: "images/xxx_base.png"` (or .jpg) for a bird's-eye / aerial photo (offline preview).
// It will appear in the side panel under "Aerial View" and be clickable to enlarge.
// Also add `lat: -xx.xxxx, lng: yy.yyyy` (from Google Maps right-click "What's here?") to enable a "Live Satellite" link that opens the real-time Google satellite view.
const BASES = {
  amberley: {
    name: "RAAF Base Amberley",
    location: "Queensland",
    role: "Air Combat & Strike Hub",
    color: "#E05A40",
    desc: "Australia's largest RAAF base and primary air combat hub. Home to strike, electronic warfare, transport and tanker capabilities, operating under Air Combat Group and Combat Support Group.",
    image: "images/amberley_base.png",
    lat: -27.64056,
    lng: 152.71194,
    squadrons: [
      { num: "No. 1 Sqn", name: "Air Combat", aircraft: "F/A-18F Super Hornet" },
      { num: "No. 6 Sqn", name: "Electronic Attack", aircraft: "EA-18G Growler" },
      { num: "No. 33 Sqn", name: "Aerial Refuelling / Strategic Transport", aircraft: "KC-30A MRTT" },
      { num: "No. 35 Sqn", name: "Battlefield Airlift", aircraft: "C-27J Spartan" },
      { num: "No. 36 Sqn", name: "Heavy Strategic Transport", aircraft: "C-17A Globemaster III" },
    ]
  },
  williamtown: {
    name: "RAAF Base Williamtown",
    location: "New South Wales",
    role: "Air Combat Group HQ & F-35 Hub",
    color: "#E05A40",
    desc: "Home of the F-35A Lightning II and the Wedgetail Airborne Early Warning & Control aircraft. This is Australia's primary air defence base and headquarters of Air Combat Group (78 Wing).",
    image: "images/williamtown_base.png",
    lat: -32.795,
    lng: 151.834,
    squadrons: [
      { num: "No. 2 OCU", name: "F-35A Conversion Unit", aircraft: "F-35A Lightning II" },
      { num: "No. 3 Sqn", name: "Combat: F-35A", aircraft: "F-35A Lightning II" },
      { num: "No. 75 Sqn", name: "Combat: F-35A (Tindal detachment)", aircraft: "F-35A Lightning II" },
      { num: "No. 77 Sqn", name: "Combat: F-35A", aircraft: "F-35A Lightning II" },
      { num: "No. 2 Sqn", name: "Airborne Early Warning & Control", aircraft: "E-7A Wedgetail" },
    ]
  },
  edinburgh: {
    name: "RAAF Base Edinburgh",
    location: "South Australia",
    role: "Intelligence, Surveillance & Reconnaissance",
    color: "#4A9EDB",
    desc: "Australia's ISR hub, hosting P-8A Poseidon maritime patrol aircraft and the MC-55A Peregrine signals intelligence platform. Critical for maritime domain awareness across the Indo-Pacific.",
    image: "images/edinburgh_base.png",
    squadrons: [
      { num: "No. 11 Sqn", name: "Maritime Patrol & ASW", aircraft: "P-8A Poseidon" },
      { num: "No. 12 Sqn", name: "Maritime Patrol & ASW", aircraft: "P-8A Poseidon" },
      { num: "No. 10 Sqn", name: "Signals Intelligence / ISR", aircraft: "MC-55A Peregrine" },
    ]
  },
  richmond: {
    name: "RAAF Base Richmond",
    location: "New South Wales",
    role: "Medium Airlift",
    color: "#2EC4A0",
    desc: "Primary home of the C-130J Hercules medium tactical airlifter. Located 50 km north-west of Sydney, Richmond handles both tactical airlift and aerial delivery training.",
    image: "images/richmond_base.png",
    lat: -33.60056,
    lng: 150.78083,
    squadrons: [
      { num: "No. 37 Sqn", name: "Medium Tactical Airlift", aircraft: "C-130J Hercules" },
      { num: "No. 453 Sqn Flight", name: "Air Traffic Services", aircraft: "Admin / ATC" },
    ]
  },
  pearce: {
    name: "RAAF Base Pearce",
    location: "Western Australia",
    role: "Fighter Training & Maritime Patrol",
    color: "#4A9EDB",
    desc: "Fighter pilot training hub in Western Australia. Also hosts maritime patrol aircraft for operations across the Indian Ocean and serves as a gateway base for operations to Australia's north-west.",
    image: "images/pearce_base.png",
    lat: -31.66778,
    lng: 116.01500,
    squadrons: [
      { num: "No. 25 Sqn", name: "Lead-In Fighter Training", aircraft: "BAE Hawk 127" },
      { num: "No. 79 Sqn", name: "Basic Fighter Training", aircraft: "BAE Hawk 127" },
    ]
  },
  darwin: {
    name: "RAAF Base Darwin",
    location: "Northern Territory",
    role: "Northern Air Defence & Surge Base",
    color: "#E05A40",
    desc: "Australia's northernmost major base, strategically vital for northern approaches. Regularly hosts USAF rotational deployments under Force Posture Initiatives and serves as a surge base for regional operations.",
    lat: -12.415,
    lng: 130.877,
    squadrons: [
      { num: "Rotational USAF", name: "Enhanced Air Cooperation", aircraft: "F-22, B-52 (rotational)" },
      { num: "No. 452 Sqn", name: "Air Base Services", aircraft: "Admin / Support" },
    ]
  },
  tindal: {
    name: "RAAF Base Tindal",
    location: "Northern Territory",
    role: "Primary F-35A Forward Base",
    color: "#E05A40",
    desc: "Home of No. 75 Squadron (F-35A), Australia's northernmost combat aircraft base. Currently undergoing major expansion under the RAAF's Northern Base Redevelopment to support enhanced strike and deterrence.",
    image: "images/tindal_base.png",
    lat: -14.521,
    lng: 132.378,
    squadrons: [
      { num: "No. 75 Sqn", name: "Combat: F-35A (Primary)", aircraft: "F-35A Lightning II" },
    ]
  },
  fairbairn: {
    name: "Defence Establishment Fairbairn",
    location: "Australian Capital Territory",
    role: "VIP & Government Air Transport",
    color: "#C9A84C",
    desc: "Located adjacent to Canberra Airport, Fairbairn is home to the VIP transport squadron supporting the Prime Minister, Governor-General and senior government officials.",
    image: "images/fairbairn_base.png",
    lat: -35.302,
    lng: 149.202,
    squadrons: [
      { num: "No. 34 Sqn", name: "VIP / Government Transport", aircraft: "BBJ / Dassault Falcon 7X" },
    ]
  },
  eastsale: {
    name: "RAAF Base East Sale",
    location: "Victoria",
    role: "Training HQ",
    color: "#9B59B6",
    desc: "Home of the Air Force Flying Training School and Air Force Officer Training School. East Sale is the foundation of RAAF aircrew training and officer development.",
    image: "images/eastsale_base.png",
    lat: -38.099,
    lng: 147.149,
    squadrons: [
      { num: "No. 32 Sqn", name: "Navigator Training / Transport", aircraft: "Beechcraft King Air 350 / PC-21" },
      { num: "AFOTS", name: "Air Force Officer Training", aircraft: "n/a" },
    ]
  },
  townsville: {
    name: "RAAF Base Townsville",
    location: "Queensland",
    role: "Army Aviation Support & Strategic Location",
    color: "#C9A84C",
    desc: "Primarily an Army base (Lavarack Barracks), Townsville co-hosts RAAF elements focused on Northern Queensland and Pacific operations, supporting Army Aviation and strategic airlift.",
    image: "images/townsville_base.png",
    lat: -19.253,
    lng: 146.765,
    squadrons: [
      { num: "No. 38 Sqn", name: "Operational Support", aircraft: "Support / Admin" },
    ]
  },
  learmonth: {
    name: "RAAF Base Learmonth",
    location: "Western Australia",
    role: "Remote Forward Operating Base",
    color: "#4A9EDB",
    desc: "Remote forward operating base in north-west WA. Used for maritime patrol, ISR and as a diversion base for Indian Ocean operations. Supports P-8A and ISR rotations.",
    image: "images/learmonth_base.png",
    lat: -22.236,
    lng: 114.089,
    squadrons: [
      { num: "Deployed Flights", name: "P-8A Rotational Detachment", aircraft: "P-8A Poseidon" },
    ]
  },
  // Navy bases
  albatross: {
    name: "HMAS Albatross",
    location: "New South Wales",
    role: "Navy Aviation Base",
    color: "#4A9EDB",
    desc: "Primary Royal Australian Navy air station near Nowra. Home to MH-60R Seahawk helicopters supporting fleet operations, ASW, and search and rescue.",
    image: "images/albatross_base.png",
    lat: -34.949,
    lng: 150.537,
    squadrons: [
      { num: "816 Sqn", name: "Navy Helicopter", aircraft: "MH-60R Seahawk" },
    ]
  },
  stirling: {
    name: "HMAS Stirling",
    location: "Western Australia",
    role: "Navy Fleet Base West",
    color: "#4A9EDB",
    desc: "Major RAN base on Garden Island, south of Perth. Primary west coast port for submarines (Collins class) and surface combatants. Critical for Indian Ocean and western approaches.",
    image: "images/stirling_base.png",
    lat: -32.242,
    lng: 115.683,
    squadrons: [
      { num: "Submarine Force", name: "Collins-class Support", aircraft: "Support / Logistics" },
    ]
  },
  // Army bases
  lavarack: {
    name: "Lavarack Barracks",
    location: "Queensland",
    role: "Army Ready Brigade Base",
    color: "#228B22",
    desc: "Home of the 3rd Brigade, Australia's high-readiness Army formation. Co-located with RAAF Townsville for joint air-land operations in northern Australia and the Pacific.",
    image: "images/lavarack_base.png",
    lat: -19.322,
    lng: 146.802,
    squadrons: [
      { num: "3rd Brigade", name: "Ready Brigade", aircraft: "M113, Bushmaster, ARH Tiger" },
    ]
  },
  robertson: {
    name: "Robertson Barracks",
    location: "Northern Territory",
    role: "Army Northern Operations Base",
    color: "#228B22",
    desc: "Major Army base near Darwin. Home to 1st Armoured Regiment elements and other combat units. Key for northern defence, exercises and rapid response.",
    lat: -12.42,
    lng: 130.88,
    squadrons: [
      { num: "1st Armoured Regt", name: "Armour", aircraft: "M1A1 Abrams" },
    ]
  },
  puckapunyal: {
    name: "Puckapunyal Military Area",
    location: "Victoria",
    role: "Army Training & Armour Centre",
    color: "#228B22",
    desc: "Major Army training and manoeuvre area. Home of the School of Armour and key live-fire ranges. Supports M1 Abrams and combined arms training.",
    image: "images/puckapunyal_base.png",
    lat: -37.000,
    lng: 145.033,
    squadrons: [
      { num: "School of Armour", name: "Armour Training", aircraft: "M1A1 Abrams, ASLAV" },
    ]
  },
  holsworthy: {
    name: "Holsworthy Barracks",
    location: "New South Wales",
    role: "Army Special Operations & Logistics",
    color: "#228B22",
    desc: "Major Army base in Sydney's south-west. Home to 2nd Commando Regiment and other special operations and combat support units.",
    image: "images/holsworthy_base.png",
    lat: -33.995,
    lng: 150.952,
    squadrons: [
      { num: "2nd Commando Regt", name: "Special Operations", aircraft: "Support" },
    ]
  },
  oakey: {
    name: "Army Aviation Centre Oakey",
    location: "Queensland",
    role: "Army Aviation Training & Maintenance",
    color: "#228B22",
    desc: "Primary Army aviation base and training centre. Home to helicopter training, maintenance and some operational rotary assets.",
    image: "images/oakey_base.png",
    lat: -27.411,
    lng: 151.735,
    squadrons: [
      { num: "Army Aviation", name: "Helicopter Training", aircraft: "ARH Tiger, UH-60M" },
    ]
  },
  // Additional major Navy ports and key RAAF bare bases (added for completeness based on official ADF sources)
  kuttabul: {
    name: "HMAS Kuttabul",
    location: "New South Wales",
    role: "Fleet Base East Support",
    color: "#4A9EDB",
    desc: "Primary shore establishment for Fleet Base East at Garden Island, Sydney. Provides administrative, training, logistics and maintenance support to RAN fleet units on the east coast.",
    lat: -33.8625,
    lng: 151.2267,
    squadrons: [
      { num: "Fleet Support Unit", name: "South East", aircraft: "Logistics / Maintenance" },
    ]
  },
  coonawarra: {
    name: "HMAS Coonawarra",
    location: "Northern Territory",
    role: "Naval Base Darwin",
    color: "#4A9EDB",
    desc: "RAN base in Darwin (Larrakeyah Defence Precinct). Supports patrol boats, major fleet units and maritime operations in northern Australia and the Timor Sea.",
    lat: -12.4586,
    lng: 130.8217,
    squadrons: [
      { num: "Patrol Boat", name: "Darwin", aircraft: "Cape Class Patrol Boats" },
    ]
  },
  cerberus: {
    name: "HMAS Cerberus",
    location: "Victoria",
    role: "Navy Training Base",
    color: "#4A9EDB",
    desc: "Australia's largest naval training base at Crib Point on Western Port. Home to recruit training, seamanship school and numerous specialist training facilities for the RAN.",
    lat: -38.366,
    lng: 145.183,
    squadrons: [
      { num: "Recruit School", name: "Initial Training", aircraft: "Training" },
    ]
  },
  cairns: {
    name: "HMAS Cairns",
    location: "Queensland",
    role: "Patrol and Survey Base",
    color: "#4A9EDB",
    desc: "Naval base in Cairns supporting patrol boats and hydrographic survey vessels for operations in Far North Queensland, Torres Strait and the Great Barrier Reef.",
    lat: -16.925,
    lng: 145.778,
    squadrons: [
      { num: "Patrol Boat", name: "Cairns", aircraft: "Cape Class" },
    ]
  },
  scherger: {
    name: "RAAF Base Scherger",
    location: "Queensland",
    role: "Bare Base - Cape York Operations",
    color: "#E05A40",
    desc: "RAAF bare base located near Weipa in far north Queensland. Forward operating base capable of supporting air operations, exercises and regional presence in Australia's northern approaches.",
    lat: -12.616,
    lng: 142.083,
    squadrons: [
      { num: "Bare Base", name: "Support Squadron", aircraft: "Rotational / Deployed" },
    ]
  },
  curtin: {
    name: "RAAF Base Curtin",
    location: "Western Australia",
    role: "Bare Base - Kimberley Operations",
    color: "#E05A40",
    desc: "RAAF bare base near Derby in the Kimberley region of Western Australia. Important forward base for air power in the north-west and support to maritime surveillance and operations.",
    lat: -17.583,
    lng: 123.833,
    squadrons: [
      { num: "Bare Base", name: "Support Squadron", aircraft: "Rotational / Deployed" },
    ]
  },
  wagga: {
    name: "RAAF Base Wagga",
    location: "New South Wales",
    role: "Recruit Training & Ground Academy ('Home of the Airman')",
    color: "#9B59B6",
    desc: "Primary RAAF recruit training base and headquarters of Ground Academy. Home to No. 1 Recruit Training Unit (1RTU) for all Air Force recruits, plus major ground training schools including technical training (RAAFSTT), administration & logistics (RAAFSALT), and postgraduate studies. No. 31 Squadron provides airbase operations and support. One of the RAAF's oldest and most community-integrated bases (est. 1940).",
    image: "images/wagga_bae.png",
    lat: -35.1583,
    lng: 147.4667,
    squadrons: [
      { num: "No. 1 RTU", name: "Recruit Training", aircraft: "n/a" },
      { num: "No. 31 Sqn", name: "Airbase Operations", aircraft: "Support / Coordination" },
      { num: "RAAFSTT", name: "Technical Training", aircraft: "n/a" },
      { num: "RAAFSALT", name: "Admin & Logistics Training", aircraft: "n/a" },
      { num: "Ground Academy", name: "HQ & Training Schools", aircraft: "n/a" },
    ]
  },
};


// ---------- AIRCRAFT FLEET (Fixed-Wing + Rotary) ----------
const AIRCRAFT = [
  {
    id: "f35a",
    desig: "F-35A",
    name: "Lightning II",
    type: "combat",
    typeName: "5th Gen Fighter",
    category: "Combat",
    tagline: "Australia's primary combat aircraft. A stealthy multirole fighter that blends air-to-air dominance with precision strike capability.",
    img: "images/f35a.mp4",
    stats: [
      { k: "Speed", v: "Mach 1.6" },
      { k: "Range", v: "2,220 km" },
      { k: "Ceiling", v: "50,000 ft" },
      { k: "In service", v: "72 aircraft" }
    ],
    overview: "The F-35A is a fifth-generation, single-engine, supersonic stealth fighter manufactured by Lockheed Martin. Australia operates 72 F-35As, completing delivery in 2023. It is the most advanced combat aircraft in the RAAF inventory, combining low observability (stealth), sensor fusion, and precision strike in a single airframe. It replaced the legacy F/A-18A/B Hornet in RAAF service.",
    systems: [
      { name: "AN/APG-81 AESA Radar", code: "AESA", desc: "Active Electronically Scanned Array radar. Unlike older radars with a single rotating dish, this radar has thousands of tiny transmitter elements that electronically steer the beam. Think of it as thousands of small torches all pointing together — you can switch direction in microseconds without moving any parts.", layman: "Like having thousands of eyes that can look in any direction instantly, without turning your head." },
      { name: "AN/AAQ-40 EOTS", code: "EOTS", desc: "Electro-Optical Targeting System. A high-resolution infrared and optical camera built flush into the fuselage. Allows the pilot to see targets in detail day or night, guide laser-guided bombs and measure target distance.", layman: "An incredibly powerful zoom camera that also acts as a laser pointer for bombs — all built invisibly into the aircraft's nose." },
      { name: "AN/ASQ-239 EW Suite", code: "EW / ECM", desc: "Electronic Warfare suite covering radar warning, threat identification and electronic countermeasures. Detects enemy radar signals, identifies threat type and can automatically jam or spoof them.", layman: "The aircraft's self-defence system — it detects enemy radars trying to track you and can trick or jam them." },
      { name: "Distributed Aperture System", code: "AN/AAQ-37 DAS", desc: "Six infrared cameras arrayed around the aircraft giving the pilot 360° spherical vision. With a special helmet, a pilot can literally look through the floor of the aircraft.", layman: "Six cameras wrapped around the whole plane so you can see everywhere at once — the pilot can look through the floor." },
      { name: "JSM / Joint Strike Missile", code: "JSM", desc: "Norway's Kongsberg JSM is a stealth cruise missile that fits internally in the F-35A's weapons bay, preserving stealth. It can attack both ships and land targets using terrain-following navigation and GPS.", layman: "A GPS-guided cruise missile that can hide inside the aircraft (to stay stealthy) and hit ships or buildings from 200+ km away." },
      { name: "AIM-120 AMRAAM", code: "AMRAAM", desc: "Advanced Medium-Range Air-to-Air Missile. A radar-guided missile that can autonomously track and destroy enemy aircraft beyond visual range. 'Fire and forget' — the pilot doesn't need to keep pointing at the target.", layman: "The main air-to-air missile. You fire it, it finds the enemy aircraft itself, and you can fly away." },
    ],
    tags: ["Stealth", "AESA Radar", "Multirole", "Precision Strike", "Air Superiority"]
  },
  {
    id: "fa18f",
    desig: "F/A-18F",
    name: "Super Hornet",
    type: "combat",
    typeName: "Strike Fighter",
    category: "Combat",
    tagline: "A powerful twin-engine strike fighter. Australia's premier long-range strike platform until F-35A reaches full operational capability.",
    img: "images/superhornet.mp4",
    stats: [
      { k: "Speed", v: "Mach 1.8+" },
      { k: "Range", v: "~2,000 km" },
      { k: "Ceiling", v: "50,000 ft" },
      { k: "In service", v: "24 aircraft" }
    ],
    overview: "The F/A-18F Super Hornet is a two-seat, twin-engine, carrier-capable multirole fighter operated by No. 1 Squadron at RAAF Amberley. Australia's 24 Super Hornets have been upgraded with the Advanced Super Hornet configuration, adding an enclosed weapons pod (EWP), conformal fuel tanks for extended range, and enhanced electronic attack capability.",
    systems: [
      { name: "AN/APG-79 AESA Radar", code: "AESA", desc: "Advanced phased-array radar providing long-range air and surface search, tracking, and weapons guidance.", layman: "Powerful radar that can track many aircraft at once and guide missiles to multiple targets simultaneously." },
      { name: "AN/ALQ-214 IDECM", code: "IDECM", desc: "Integrated Defensive Electronic Countermeasures. Combines radar warning, missile warning, and active jamming in one system.", layman: "The jet's self-defence system — detects missiles fired at it and automatically deploys countermeasures." },
      { name: "JDAM & JSOW", code: "JDAM / JSOW", desc: "Joint Direct Attack Munition converts unguided bombs to GPS-guided precision weapons. Joint Standoff Weapon is a glide weapon released from altitude that flies unpowered to the target.", layman: "JDAM: strap a GPS kit onto a regular bomb to make it hit within metres of the target. JSOW: a bomb with wings that glides 100+ km after release." },
      { name: "HARPOON", code: "AGM-84", desc: "Anti-ship missile with active radar homing, designed to attack surface vessels at long range.", layman: "A missile specifically designed to sink ships — it flies low over the water and then activates its own radar to find the target." },
      { name: "SLAM-ER", code: "AGM-84H", desc: "Standoff Land Attack Missile – Expanded Response. Precision long-range cruise missile for land targets.", layman: "A precision cruise missile that can strike land targets from over 250 km away." },
    ],
    tags: ["Strike", "Twin Engine", "Long Range", "Anti-ship", "Precision"]
  },
  {
    id: "ea18g",
    desig: "EA-18G",
    name: "Growler",
    type: "ew",
    typeName: "Electronic Warfare",
    category: "Airborne Early Warning & Electronic Warfare",
    tagline: "The world's only dedicated airborne electronic attack aircraft. It can shut down enemy radars and communications from the air.",
    img: "images/growler.mp4",
    stats: [
      { k: "Speed", v: "Mach 1.8" },
      { k: "Range", v: "~2,000 km" },
      { k: "Ceiling", v: "50,000 ft" },
      { k: "In service", v: "12 aircraft" }
    ],
    overview: "The EA-18G Growler is the world's only operational airborne electronic attack aircraft, operated by No. 6 Squadron at RAAF Amberley. Derived from the F/A-18F, it replaces the gun and some weapons with an advanced suite of jamming and electronic warfare systems. Its primary mission is to suppress and destroy enemy air defence systems (SEAD) and provide electronic protection for strike packages.",
    systems: [
      { name: "AN/ALQ-218 Receiver", code: "ALQ-218", desc: "Wideband, high-sensitivity receiver that detects and precisely locates enemy radar and radio emissions across a vast frequency range.", layman: "An incredibly sensitive radio scanner that picks up every radar and radio signal in the area and maps where they're coming from." },
      { name: "AN/ALQ-99 Jamming Pods", code: "ALQ-99 TJS", desc: "Tactical Jamming System. These pods emit powerful electromagnetic signals to overload and blind enemy radar systems, rendering them ineffective.", layman: "Like shining a spotlight directly into someone's eyes to blind them — but for radar. Enemy radar operators see only static." },
      { name: "AN/APG-79 AESA Radar", code: "AESA", desc: "Same advanced radar as the Super Hornet, allowing the Growler to also self-defend and engage air threats.", layman: "Keeps all the Super Hornet's air combat radar, so it's not defenceless." },
      { name: "AGM-88 HARM", code: "HARM", desc: "High-speed Anti-Radiation Missile. Homes in on enemy radar emissions to destroy ground-based air defence radar systems.", layman: "A missile that specifically hunts radar — if an enemy radar turns on, HARM finds it and destroys it." },
      { name: "MALD-J", code: "MALD-J", desc: "Miniature Air Launched Decoy — Jammer. Small drone-like decoy that mimics a fighter aircraft's radar signature to confuse enemy air defences, while also jamming.", layman: "A small disposable drone the Growler launches that pretends to be a fighter jet on enemy radar, drawing fire away from real aircraft." },
    ],
    tags: ["Jamming", "SEAD", "Electronic Attack", "Force Multiplier"]
  },
  {
    id: "e7a",
    desig: "E-7A",
    name: "Wedgetail",
    type: "ew",
    typeName: "Airborne Early Warning",
    category: "Airborne Early Warning & Electronic Warfare",
    tagline: "Australia's airborne command post and radar in the sky. Sees threats hundreds of kilometres away and directs the entire battle.",
    img: "images/wedgetail.mp4",
    stats: [
      { k: "Speed", v: "Mach 0.85" },
      { k: "Range", v: "~7,000 km" },
      { k: "Endurance", v: "10+ hrs" },
      { k: "In service", v: "6 aircraft" }
    ],
    overview: "The E-7A Wedgetail (Boeing 737 AEW&C) is one of the world's most advanced Airborne Early Warning and Control aircraft, operated by No. 2 Squadron at RAAF Williamtown. It carries a top-mounted radar that rotates electronically (not physically) and can simultaneously track hundreds of airborne and surface targets while acting as an airborne command post to direct the entire air battle.",
    systems: [
      { name: "MESA Radar", code: "MESA", desc: "Multi-role Electronically Scanned Array. A fixed, top-mounted radar that uses electronic beam steering in both elevation and azimuth, providing 360° coverage without needing to physically rotate. Tracks both air and surface targets simultaneously.", layman: "A radar strapped on top of the aircraft that can look in every direction at once without spinning. It sees aircraft 600+ km away." },
      { name: "Mission Computing System", code: "MCS", desc: "Integrates all sensor data (radar, ESM, IFF) and fuses them into a single, coherent air picture. Operators in the cabin use this to manage the whole air battle.", layman: "The brain of the aircraft — it combines all the radar and sensor data into one clear picture that operators use to control the battle." },
      { name: "ESM System", code: "ESM", desc: "Electronic Support Measures — passively detects and locates radar and radio emissions from enemy aircraft and ships without transmitting a signal itself.", layman: "A passive listening system — it detects enemy radars without giving away the Wedgetail's own position." },
      { name: "IFF System", code: "IFF / Mode 5", desc: "Identification Friend or Foe — a coded signal system to distinguish friendly aircraft from enemy aircraft. Mode 5 is NATO's latest encrypted, hard-to-spoof standard.", layman: "An electronic tag system — friendly aircraft respond to a secret question so the Wedgetail knows not to shoot at them." },
      { name: "JTIDS / Link 16", code: "Link 16", desc: "Joint Tactical Information Distribution System. A secure, jam-resistant data network that shares the air picture in real time with all friendly forces.", layman: "A secure 'group chat' for all military platforms — aircraft, ships and ground forces all share the same live battlefield picture." },
    ],
    tags: ["AEW&C", "Command & Control", "MESA Radar", "Force Multiplier", "Link 16"]
  },
  {
    id: "p8a",
    desig: "P-8A",
    name: "Poseidon",
    type: "patrol",
    typeName: "Maritime Patrol",
    category: "Maritime Patrol & ISR",
    tagline: "Australia's maritime guardian. Hunts submarines and surface threats across vast ocean areas in the Indo-Pacific.",
    img: "images/poseidon.mp4",
    stats: [
      { k: "Speed", v: "Mach 0.82" },
      { k: "Range", v: "~8,300 km" },
      { k: "Endurance", v: "10 hrs" },
      { k: "In service", v: "14 aircraft" }
    ],
    overview: "The Boeing P-8A Poseidon is a maritime patrol and anti-submarine warfare (ASW) aircraft operated by No. 11 and No. 12 Squadrons at RAAF Edinburgh. Based on the 737-800ERX airframe, it replaced the AP-3C Orion and represents a quantum leap in maritime surveillance capability for Australia.",
    systems: [
      { name: "AN/APY-10 Radar", code: "APY-10", desc: "Multimode surface search radar. Can detect surfaced or snorkelling submarines, surface vessels and small objects in high sea states.", layman: "A powerful ground-scanning radar that can spot a submarine periscope poking above the water from high altitude." },
      { name: "Acoustic Sonobuoys", code: "DIFAR / LOFAR", desc: "Cylindrical devices dropped into the ocean that float and listen for underwater sounds. Directional Frequency And Recording (DIFAR) types detect direction; Low Frequency Analysis and Recording (LOFAR) detect very quiet sounds. Data is relayed back to the aircraft.", layman: "Underwater microphones dropped from the aircraft. They float on the surface listening for submarine engine noise and radio the data back." },
      { name: "MAD-XR", code: "MAD", desc: "Magnetic Anomaly Detector. Detects disturbances in the Earth's magnetic field caused by a submarine's steel hull. Towed in an extended 'boom' on some aircraft variants.", layman: "Detects the magnetic pull of a submarine's metal hull — like a massive compass that twitches when a submarine is below." },
      { name: "Mk-54 Lightweight Torpedo", code: "Mk-54 LHT", desc: "The primary anti-submarine weapon — dropped from altitude, it enters the water, activates its own sonar, and autonomously tracks and destroys submarines.", layman: "An underwater missile dropped from the air. Once it hits the water it 'wakes up', finds the submarine by sound and chases it down." },
      { name: "Harpoon Block II", code: "AGM-84L", desc: "Anti-ship missile for attacking surface vessels at long range.", layman: "Same anti-ship missile as the Super Hornet — lets the Poseidon attack enemy ships from a safe distance." },
    ],
    tags: ["ASW", "Maritime Patrol", "Anti-submarine", "ISR", "Long Range"]
  },
  {
    id: "c17",
    desig: "C-17A",
    name: "Globemaster III",
    type: "transport",
    typeName: "Heavy Transport",
    category: "Transport & Air Mobility",
    tagline: "Australia's heavy strategic airlifter — carries tanks, helicopters and hundreds of troops anywhere in the world.",
    img: "images/c17.mp4",
    stats: [
      { k: "Payload", v: "77,500 kg" },
      { k: "Range", v: "10,400 km" },
      { k: "Ceiling", v: "45,000 ft" },
      { k: "In service", v: "8 aircraft" }
    ],
    overview: "The C-17A Globemaster III is operated by No. 36 Squadron at RAAF Amberley. It is Australia's only heavy strategic airlifter, capable of carrying tanks, large vehicles, bulk cargo and over 100 personnel. It can land on unprepared, semi-prepared and short runways, making it the backbone of rapid strategic deployment for the ADF.",
    systems: [
      { name: "HGS-6000 Head-Up Display", code: "HUD", desc: "Projects critical flight data directly onto the windscreen so pilots can see altitude, speed and navigation without looking down at instruments.", layman: "Like a car's GPS screen projected directly in front of your eyes so you never have to look away from the road." },
      { name: "LAIRCM", code: "LAIRCM", desc: "Large Aircraft Infrared Countermeasures. Detects incoming heat-seeking missiles and uses a laser to confuse the missile's seeker, causing it to miss.", layman: "An automatic laser that blinds heat-seeking missiles fired at the aircraft — no pilot action needed." },
      { name: "TCAS II", code: "TCAS", desc: "Traffic Collision Avoidance System — monitors airspace for other aircraft and commands avoidance manoeuvres if collision is likely.", layman: "Automatic system that warns pilots of nearby aircraft and tells them which direction to fly to avoid a collision." },
    ],
    tags: ["Strategic Airlift", "Heavy Cargo", "Global Reach", "Humanitarian"]
  },
  {
    id: "c130j",
    desig: "C-130J",
    name: "Hercules",
    type: "transport",
    typeName: "Medium Transport",
    category: "Transport & Air Mobility",
    tagline: "The RAAF's versatile tactical workhorse. Can deliver troops, vehicles, airdrops and humanitarian aid almost anywhere.",
    img: "images/c130j.mp4",
    stats: [
      { k: "Payload", v: "19,000 kg" },
      { k: "Range", v: "3,800 km" },
      { k: "Speed", v: "Mach 0.6" },
      { k: "In service", v: "12 aircraft" }
    ],
    overview: "The Lockheed Martin C-130J-30 Hercules is operated by No. 37 Squadron at RAAF Base Richmond. It is the RAAF's primary medium tactical transport aircraft, capable of operating from short, unprepared airstrips. The C-130J is highly versatile — it can carry troops, vehicles, cargo pallets, perform airdrops, medical evacuations, and support disaster relief across Australia and the region.",
    systems: [
      { name: "AN/ALR-69 Radar Warning Receiver", code: "RWR", desc: "Detects enemy radar emissions and provides the crew with visual and audio warnings of potential threats, allowing the aircraft to take evasive action or deploy countermeasures.", layman: "The aircraft's 'ears' — it listens for enemy radars trying to lock on and warns the crew so they can dodge or hide." },
      { name: "Large Aircraft Infrared Countermeasures (LAIRCM)", code: "LAIRCM", desc: "Detects incoming heat-seeking missiles and automatically directs a high-intensity laser to blind the missile's seeker head, causing it to miss the aircraft.", layman: "An automatic laser turret that 'paints' incoming missiles so they can't see the plane anymore." },
      { name: "Night Vision Imaging System (NVIS)", code: "NVIS", desc: "Full cockpit compatibility with night vision goggles, allowing crews to conduct low-level operations and airdrops at night without using normal lighting that would give away their position.", layman: "The whole cockpit is designed so pilots can wear night vision goggles and still read every dial and screen in total darkness." },
      { name: "Cargo Handling System", code: "CHS", desc: "Roller and winch system that allows rapid loading and unloading of pallets, vehicles and containers. Enables the aircraft to be reconfigured quickly for different missions.", layman: "A built-in conveyor belt system in the floor that lets ground crews slide heavy cargo in and out extremely fast." },
    ],
    tags: ["Tactical Airlift", "Airdrop", "Versatile", "Short Field", "Humanitarian"]
  },
  {
    id: "c27j",
    desig: "C-27J",
    name: "Spartan",
    type: "transport",
    typeName: "Battlefield Airlift",
    category: "Transport & Air Mobility",
    tagline: "The 'Magnificent Seven' — a tough, agile battlefield airlifter that can operate from the smallest and roughest airstrips.",
    img: "images/c27j.mp4",
    stats: [
      { k: "Payload", v: "9,000 kg" },
      { k: "Range", v: "1,850 km" },
      { k: "Speed", v: "Mach 0.55" },
      { k: "In service", v: "10 aircraft" }
    ],
    overview: "The Alenia C-27J Spartan is operated by No. 35 Squadron at RAAF Base Amberley. Nicknamed the 'Magnificent Seven' by the squadron, it fills the gap between the larger C-130J and smaller utility aircraft. It is designed for operations from short, unimproved airstrips and is particularly valuable for supporting Australian Army operations in remote or austere locations across northern Australia and the Pacific.",
    systems: [
      { name: "Enhanced Vision System", code: "EVS", desc: "Forward-looking infrared and low-light camera system that gives pilots greatly improved situational awareness when operating into remote or poorly lit airstrips at night or in bad weather.", layman: "Special cameras that let the pilots 'see' the runway clearly even when it's pitch black or raining heavily." },
      { name: "Defensive Aids Suite", code: "DAS", desc: "Integrated missile warning, radar warning and countermeasures system tailored for operations in higher-threat environments than traditional transport aircraft usually face.", layman: "The aircraft's self-protection suite — it can detect incoming missiles and automatically release flares or chaff." },
      { name: "Rapid Rear Ramp System", code: "Ramp", desc: "Large rear cargo ramp and door that allows fast loading/unloading of troops, light vehicles and palletised cargo, including the ability to airdrop supplies.", layman: "A big back door that drops down like a drawbridge so soldiers and equipment can drive or walk straight on and off very quickly." },
    ],
    tags: ["Battlefield Airlift", "Rough Field", "Army Support", "Pacific Operations"]
  },
  {
    id: "kc30a",
    desig: "KC-30A",
    name: "Multi-Role Tanker Transport",
    type: "tanker",
    typeName: "Air-to-Air Refuelling",
    category: "Air Refuelling",
    tagline: "Extends the range of the entire RAAF fleet. Turns a 2-hour mission into an 8-hour one.",
    img: "images/kc30a.mp4",
    stats: [
      { k: "Fuel Offload", v: "111,000 kg" },
      { k: "Range", v: "14,800 km" },
      { k: "Ceiling", v: "43,000 ft" },
      { k: "In service", v: "7 aircraft" }
    ],
    overview: "The Airbus KC-30A MRTT (Multi-Role Tanker Transport) is operated by No. 33 Squadron at Amberley. Based on the A330, it is both a strategic transport and the RAAF's primary air-to-air refuelling platform. It extends the operational radius of F-35As, Super Hornets, Growlers and Wedgetails, enabling longer missions and reaching further into the Indo-Pacific without forward basing.",
    systems: [
      { name: "Fly-by-Wire Refuelling Boom", code: "FBW ARBS", desc: "An extendable boom at the tail of the aircraft that a receiver aircraft connects to. The boom is controlled by an operator using a fly-by-wire joystick, similar to video game controls.", layman: "A retractable 'hose on a stick' at the tail that links to a fighter's fuel port — the boom operator flies it into place with a joystick." },
      { name: "Hose & Drogue System", code: "HDU", desc: "Alternative refuelling system using a flexible hose with a funnel-shaped drogue basket at the end. The receiving aircraft's pilot flies into the basket to connect.", layman: "A flexible fuel hose with a basket on the end — the receiving pilot flies their aircraft's refuelling probe into the basket to refuel." },
    ],
    tags: ["Air Refuelling", "Strategic Transport", "Force Multiplier", "MRTT"]
  },
  {
    id: "mc55a",
    desig: "MC-55A",
    name: "Peregrine",
    type: "ew",
    typeName: "Signals Intelligence",
    category: "Maritime Patrol & ISR",
    tagline: "Australia's most secretive airborne intelligence platform — listens to everything, seen by almost no one.",
    img: "images/peregrine.mp4",
    stats: [
      { k: "Type", v: "SIGINT / ISR" },
      { k: "Based on", v: "Gulfstream G550" },
      { k: "Sqn", v: "No. 10 Sqn" },
      { k: "In service", v: "2 (more on order)" }
    ],
    overview: "The MC-55A Peregrine is Australia's signals intelligence (SIGINT) and electronic intelligence (ELINT) platform, operated by No. 10 Squadron at RAAF Edinburgh. Based on a modified Gulfstream G550 airframe, it provides the ADF with strategic-level intelligence gathering capability. Few public details are available due to its sensitive nature.",
    systems: [
      { name: "SIGINT Collection Systems", code: "SIGINT", desc: "Signals Intelligence — the collection and analysis of information from electromagnetic signals, including communications (COMINT) and electronic emissions (ELINT) from radars and weapons systems.", layman: "Flies around listening to enemy radio communications, radar emissions and electronic signals — then analyses what it hears for intelligence." },
      { name: "ELINT Sensors", code: "ELINT", desc: "Electronic Intelligence — specifically the collection of non-communications electronic signals, such as radar parameters. Allows the ADF to characterise enemy radar systems.", layman: "Records the unique 'fingerprint' of enemy radars — so next time that radar turns on, we instantly know who it is and what it can do." },
    ],
    tags: ["SIGINT", "ELINT", "ISR", "Intelligence", "Classified"]
  },
  {
    id: "pc21",
    desig: "PC-21",
    name: "Pilatus",
    type: "trainer",
    typeName: "Advanced Trainer",
    category: "Training",
    tagline: "The RAAF's primary advanced trainer and the foundation of modern Australian military pilot training.",
    img: "images/pc21.mp4",
    stats: [
      { k: "Max Speed", v: "370 km/h" },
      { k: "Range", v: "1,200 km" },
      { k: "Ceiling", v: "25,000 ft" },
      { k: "In service", v: "49 aircraft" }
    ],
    overview: "The Pilatus PC-21 is operated by the Central Flying School and No. 1 and No. 2 Flying Training Schools. It replaced the older CT-4 and Hawk in the basic-to-advanced training pipeline. The PC-21 features a highly advanced glass cockpit, embedded simulation, and the ability to replicate fighter-like handling characteristics, making it one of the most capable training aircraft in the world.",
    systems: [
      { name: "Glass Cockpit & Embedded Simulation", code: "Cockpit", desc: "Fully integrated touchscreen displays and onboard simulation systems that allow students to practice complex tactics and emergencies in the air without needing external support aircraft.", layman: "The cockpit feels like a real fighter jet. Students can practice radar, weapons, and emergencies right there in the training plane." },
      { name: "Martin-Baker Ejection Seats", code: "Ejection", desc: "Zero-zero ejection seats rated for safe escape even at zero altitude and zero speed, providing maximum safety for student pilots during all phases of flight.", layman: "Extremely safe ejection seats that work even if the plane is sitting still on the runway." },
      { name: "Full Authority Digital Engine Control (FADEC)", code: "FADEC", desc: "Advanced engine management system that gives smooth, predictable power response and protects the engine from pilot error during aggressive training manoeuvres.", layman: "Smart engine computer that makes the plane feel responsive and safe no matter how hard the student pushes it." },
      { name: "Aerodynamic Brakes & High-Lift Devices", code: "Airframe", desc: "Designed with fighter-like handling qualities at low speed and high speed, allowing students to experience jet-like flight characteristics in a turboprop airframe.", layman: "The plane is specially shaped so it flies like a small fighter jet when the instructor wants it to." },
    ],
    tags: ["Advanced Training", "Glass Cockpit", "Simulation", "Roulettes"]
  },
  {
    id: "hawk127",
    desig: "Hawk 127",
    name: "Hawk",
    type: "trainer",
    typeName: "Lead-In Fighter Trainer",
    category: "Training",
    tagline: "Australia's lead-in fighter trainer. The final step before pilots transition to the F-35A or Super Hornet.",
    img: "images/hawk127.mp4",
    stats: [
      { k: "Max Speed", v: "Mach 0.88" },
      { k: "Range", v: "2,000 km" },
      { k: "Ceiling", v: "44,000 ft" },
      { k: "In service", v: "33 aircraft" }
    ],
    overview: "The BAE Hawk 127 is operated by Nos. 76 and 79 Squadrons. It is the last training aircraft RAAF pilots fly before moving to operational combat types. The Hawk 127 is equipped with a radar, head-up display, and the ability to carry weapons and simulate air-to-air and air-to-ground missions, bridging the gap between basic trainers and frontline fighters.",
    systems: [
      { name: "AN/APG-66 Radar", code: "Radar", desc: "Lightweight fighter radar derived from the F-16, giving student pilots real experience using radar for intercepts and ground mapping.", layman: "A real fighter-style radar so students learn how to find and track other aircraft in the sky." },
      { name: "Head-Up Display (HUD)", code: "HUD", desc: "Projects critical flight and weapons information directly into the pilot's forward view, training the exact skills needed in the F-35 and Super Hornet.", layman: "Information is projected on the windscreen so the pilot never has to look down at instruments during high-speed manoeuvres." },
      { name: "Weapons Delivery Capability", code: "Armament", desc: "Can carry and employ practice bombs, rockets, and the ADEN 30mm cannon, allowing realistic weapons training.", layman: "Students can actually drop practice bombs and fire the gun on ranges — real combat training before they get to the real jets." },
      { name: "Brake Parachute", code: "Brake Chute", desc: "High-speed brake parachute for short-field landings and to reduce brake wear during training sorties.", layman: "A big parachute that pops out the back to help the plane stop quickly on the runway." },
    ],
    tags: ["Lead-In Training", "Fighter Lead-In", "Weapons Training", "HUD"]
  },
  {
    id: "kingair350",
    desig: "King Air 350",
    name: "King Air",
    type: "trainer",
    typeName: "Utility / Navigation Trainer",
    category: "Training",
    tagline: "The RAAF's multi-role light transport and advanced navigation trainer, supporting both training and real-world tasks.",
    img: "images/kingair.mp4",
    stats: [
      { k: "Max Speed", v: "560 km/h" },
      { k: "Range", v: "2,500 km" },
      { k: "Capacity", v: "8–10 passengers" },
      { k: "In service", v: "~12 aircraft" }
    ],
    overview: "The Beechcraft King Air 350 is operated by No. 32 Squadron at RAAF Base East Sale. It serves as both an advanced navigation trainer for Air Combat Officers and as a light utility transport for VIPs, medical evacuation, and liaison flights. Its twin-turboprop reliability and short-field performance make it highly versatile.",
    systems: [
      { name: "Advanced Navigation & Sensor Suite", code: "Nav", desc: "Equipped with modern glass cockpit and sensor training stations allowing students to practice complex navigation, radar, and electronic warfare scenarios.", layman: "Students sit at real sensor stations learning how to navigate and find targets using advanced equipment." },
      { name: "Pratt & Whitney PT6 Turboprops", code: "Engines", desc: "Extremely reliable engines with excellent hot-and-high performance, ideal for operations across northern Australia.", layman: "Tough, reliable engines that keep working even in Australia's harsh outback conditions." },
      { name: "Quick-Change Interior", code: "Interior", desc: "Cabin can be rapidly reconfigured between training, passenger transport, cargo, or aeromedical evacuation roles.", layman: "The inside of the plane can be changed in a few hours from a classroom to a flying ambulance or VIP transport." },
    ],
    tags: ["Navigation Training", "Utility Transport", "Versatile", "East Sale"]
  },
  {
    id: "bbj",
    desig: "737 BBJ",
    name: "Boeing Business Jet",
    type: "transport",
    typeName: "VIP Transport",
    category: "VIP & Special Mission",
    tagline: "The RAAF's long-range VIP jet used to fly the Prime Minister and senior officials around the world.",
    img: "images/bbj.mp4",
    stats: [
      { k: "Range", v: "10,000+ km" },
      { k: "Speed", v: "Mach 0.82" },
      { k: "Fleet", v: "2 aircraft" },
      { k: "Squadron", v: "No. 34 Sqn" }
    ],
    overview: "The Boeing 737 Business Jet (BBJ) is operated by No. 34 Squadron. These specially configured 737s provide long-range VIP transport for the Prime Minister, Governor-General, and other senior government officials. They offer intercontinental range with a secure cabin and communications suite.",
    systems: [
      { name: "Long-Range Fuel Tanks", code: "Range", desc: "Auxiliary fuel tanks give the BBJ true intercontinental range, allowing non-stop flights from Australia to Europe or the United States.", layman: "This plane can fly all the way from Canberra to London or Washington without refuelling." },
      { name: "Secure Communications", code: "Comms", desc: "Encrypted satellite communications allowing the Prime Minister and staff to conduct classified calls and send secure data from the air.", layman: "The PM can make secure phone calls and send secret messages from 35,000 feet." },
      { name: "VIP Cabin Fit-out", code: "Cabin", desc: "Luxury configuration with work areas, seating, and secure compartments for high-profile passengers and their staff.", layman: "The inside is set up like a luxury business jet with proper desks and secure areas." },
    ],
    tags: ["VIP", "Long Range", "Government", "Secure"]
  },
  {
    id: "falcon7x",
    desig: "Falcon 7X",
    name: "Dassault Falcon",
    type: "transport",
    typeName: "VIP Transport",
    category: "VIP & Special Mission",
    tagline: "The RAAF's fast, long-range trijet used for VIP and government transport missions.",
    img: "images/falcon7x.mp4",
    stats: [
      { k: "Range", v: "11,000 km" },
      { k: "Speed", v: "Mach 0.88" },
      { k: "Fleet", v: "3 aircraft" },
      { k: "Squadron", v: "No. 34 Sqn" }
    ],
    overview: "The Dassault Falcon 7X is a long-range business trijet operated by No. 34 Squadron. It complements the BBJs by offering excellent speed, range, and the ability to operate into smaller airfields, making it ideal for many government transport tasks.",
    systems: [
      { name: "Long-Range Capability", code: "Range", desc: "Can fly non-stop from Australia to most destinations in Asia, the Middle East, and even parts of Europe and North America.", layman: "Very long legs — it can go a huge distance without stopping." },
      { name: "Secure Communications Suite", code: "Comms", desc: "Encrypted systems for classified voice and data communications while in flight.", layman: "Same secure comms capability as the BBJ for government use." },
      { name: "High-Performance Airframe", code: "Performance", desc: "Trijet design gives strong speed and the ability to use shorter runways than larger VIP jets.", layman: "It's fast and can land at smaller airports that bigger planes can't use." },
    ],
    tags: ["VIP", "Long Range", "Government", "Fast"]
  },
  {
    id: "ch47f",
    desig: "CH-47F",
    name: "Chinook",
    type: "support",
    typeName: "Heavy-Lift Helicopter",
    category: "Rotary Wing",
    tagline: "RAAF's only heavy-lift helicopter. The workhorse that moves M1 Abrams tanks, artillery, troops and disaster relief supplies when nothing else can.",
    img: "images/chinook.mp4",
    stats: [
      { k: "Speed", v: "315 km/h" },
      { k: "Range", v: "~1,100 km" },
      { k: "Payload", v: "10,000+ kg internal / 12,700 kg sling" },
      { k: "In service", v: "10 aircraft (No. 5 Sqn)" }
    ],
    overview: "The Boeing CH-47F Chinook is operated by No. 5 Squadron at RAAF Base Townsville. It is the RAAF's primary heavy-lift rotary-wing asset and one of the few helicopters still flown by the Air Force rather than Army Aviation. The Chinook can carry an M1 Abrams tank internally or as a sling load, transport up to 44 troops, or move large volumes of humanitarian aid during disaster relief. It is a critical enabler for rapid deployment of Army forces and for HADR operations across Australia's north and the region.",
    systems: [
      { name: "Twin Honeywell T55-GA-714A Engines", code: "Engines", desc: "Two powerful turboshaft engines driving tandem rotors. The counter-rotating rotor design eliminates the need for a tail rotor and gives exceptional lift and hover performance even at high altitude and temperature.", layman: "Two huge engines spinning two big rotors in opposite directions — this lets it lift tanks and massive sling loads that normal helicopters can't touch." },
      { name: "Cargo Hook & Sling System", code: "Sling", desc: "Heavy-duty external cargo hooks capable of lifting over 12 tonnes. Used for moving artillery, vehicles, fuel bladders, and construction equipment into areas without landing zones.", layman: "The big hook underneath that can dangle an entire tank or a shipping container and put it exactly where the ground forces need it." },
      { name: "Advanced Cockpit & Digital Flight Controls", code: "Avionics", desc: "Modern glass cockpit with digital flight controls, night-vision compatibility, and excellent all-weather capability. The F-model has significantly improved reliability and maintenance compared with older Chinooks.", layman: "Up-to-date screens and computers so two pilots can fly it day or night, in bad weather, with far less workload." },
      { name: "Troop & Vehicle Carrying Capability", code: "Transport", desc: "Can carry 44 fully equipped troops or a mix of light vehicles and stores internally. The rear ramp allows rapid loading and unloading, including while hovering for certain operations.", layman: "A flying truck that can drive an Abrams tank straight in or unload 40 soldiers in seconds via the back ramp." }
    ],
    tags: ["Heavy Lift", "RAAF Rotary", "HADR", "Army Support", "Tank Transport"]
  },
  {
    id: "mq4c",
    desig: "MQ-4C",
    name: "Triton",
    type: "uav",
    typeName: "HALE UAV",
    category: "Uncrewed Systems",
    tagline: "Australia's high-altitude maritime surveillance drone. A persistent eye over the oceans that never gets tired.",
    img: "images/triton.mp4",
    stats: [
      { k: "Endurance", v: "24+ hours" },
      { k: "Altitude", v: "50,000+ ft" },
      { k: "Range", v: "14,000+ km" },
      { k: "In service", v: "3+ (more on order)" }
    ],
    overview: "The Northrop Grumman MQ-4C Triton is a High-Altitude Long-Endurance (HALE) unmanned aircraft operated by No. 9 Squadron. It provides persistent maritime surveillance over Australia's vast ocean approaches, complementing the P-8A Poseidon. Tritons can stay airborne for more than a day at a time, providing continuous radar and camera coverage over huge areas.",
    systems: [
      { name: "AN/ZPY-3 Multi-Function Active Sensor (MFAS)", code: "Radar", desc: "Advanced 360° maritime surveillance radar capable of detecting and tracking ships and surfaced submarines in all weather conditions.", layman: "A massive radar that can watch thousands of square kilometres of ocean at once, spotting ships even through clouds." },
      { name: "Electro-Optical / Infrared (EO/IR) Turret", code: "Camera", desc: "High-resolution day and night cameras that can zoom in on vessels from 50,000 feet to read names or identify activity.", layman: "Incredibly powerful cameras that can read the name on a ship from way up in the stratosphere." },
      { name: "Automatic Identification System (AIS)", code: "AIS", desc: "Receives signals from ships' transponders, allowing the Triton to identify vessels and cross-reference with radar tracks.", layman: "It listens to the 'I'm here' signals that ships broadcast and matches them to what it sees on radar." },
      { name: "Satellite Communications", code: "SATCOM", desc: "Real-time data link that sends radar and video imagery back to operators on the ground thousands of kilometres away.", layman: "Everything the drone sees is beamed live via satellite to analysts on the other side of the country." },
    ],
    tags: ["HALE UAV", "Maritime ISR", "Persistent Surveillance", "Uncrewed"]
  },
  {
    id: "mq28",
    desig: "MQ-28A",
    name: "Ghost Bat",
    type: "uav",
    typeName: "Loyal Wingman (CCA)",
    category: "Uncrewed Systems",
    tagline: "Australia's revolutionary 'loyal wingman' — a smart, autonomous drone that flies alongside crewed fighters.",
    img: "images/ghostbat.mp4",
    stats: [
      { k: "Status", v: "Flight testing + early production" },
      { k: "Range", v: "3,700+ km" },
      { k: "Speed", v: "Mach 0.8+" },
      { k: "Role", v: "Collaborative Combat Aircraft" }
    ],
    overview: "The Boeing MQ-28A Ghost Bat (formerly Loyal Wingman) is an Australian-designed collaborative combat aircraft (CCA) or 'loyal wingman' UAV. It is designed to fly alongside F-35s and other crewed aircraft, carrying sensors, electronic warfare systems, or weapons while keeping the crewed aircraft out of the highest-threat areas. Several flight-test aircraft are already flying and have completed live-fire tests.",
    systems: [
      { name: "Modular Mission Payload Bay", code: "Payload", desc: "Interchangeable nose and internal bays that can carry different sensors, jamming pods, or weapons depending on the mission.", layman: "The drone can be quickly reconfigured like a Swiss Army knife — cameras one day, jammers the next, or missiles." },
      { name: "Autonomous Teaming Software", code: "AI Teaming", desc: "Advanced autonomy that allows the Ghost Bat to fly in formation with crewed fighters, respond to voice or datalink commands, and make simple decisions on its own.", layman: "It can fly next to an F-35 like a well-trained dog — following orders but also thinking for itself when needed." },
      { name: "Low-Observable Design", code: "Stealth", desc: "Shaping and materials designed to reduce radar cross-section, allowing it to operate closer to enemy defences than normal drones.", layman: "It's harder for enemy radars to see than a normal aircraft, so it can go places crewed jets might not risk." },
      { name: "Satellite & Tactical Datalinks", code: "Link", desc: "Multiple secure data links that let it share everything it sees with F-35s, E-7 Wedgetails, and ground stations in real time.", layman: "Everything the Ghost Bat sees is instantly shared with the human pilots and commanders like a group chat for the battlefield." },
    ],
    tags: ["Loyal Wingman", "CCA", "Autonomous", "Future Capability", "Prototypes"]
  }
];


// ---------- ADF OPERATIONS ----------
const OPERATIONS = [
  {
    id: "accordion",
    name: "Operation Accordion",
    region: "Middle East — UAE",
    status: "active",
    lat: 25.109,
    lng: 55.373,
    desc: "Australia's overarching support mission in the Middle East. Headquarters Middle East (HQME) at Al Minhad Air Base, UAE, provides logistics, communications and support for up to 12 concurrent ADF operations across the region. The only forward-deployed ADF headquarters worldwide.",
    assets: ["Variable ADF personnel", "HQ support", "Al Minhad AB, UAE"],
    types: ["support"]
  },
  {
    id: "argos",
    name: "Operation Argos",
    region: "North East Asia — North Korea sanctions",
    status: "active",
    lat: 37.5,
    lng: 129.5,
    desc: "ADF contribution to the multinational effort to enforce UN Security Council sanctions against North Korea. Involves maritime patrol aircraft and naval vessels monitoring and deterring illegal ship-to-ship transfers of sanctioned goods.",
    assets: ["P-8A Poseidon aircraft", "RAN surface vessels", "ADF personnel (variable)"],
    types: ["patrol"]
  },
  {
    id: "aslan",
    name: "Operation Aslan",
    region: "South Sudan",
    status: "active",
    lat: 7.5,
    lng: 30.0,
    desc: "ADF contribution to the United Nations Mission in South Sudan (UNMISS). Personnel fill key positions including military liaison officers, operations, aviation and logistics support to protect civilians, monitor human rights and enable humanitarian assistance.",
    assets: ["~20 ADF personnel", "Military observers", "Liaison and support roles"],
    types: ["un"]
  },
  {
    id: "augury",
    name: "Operation Augury",
    region: "Global — Counter-terrorism",
    status: "active",
    lat: 15.0,
    lng: 45.0,
    desc: "ADF framework operation supporting efforts to counter terrorism and violent extremist organisations worldwide. Specific tasks and locations are generally not publicly disclosed for operational security reasons. Provides specialised capabilities as required.",
    assets: ["Specialised ADF capabilities", "Variable personnel (~40+)"],
    types: ["ct"]
  },
  {
    id: "beech",
    name: "Operation Beech",
    region: "Middle East",
    status: "active",
    lat: 31.5,
    lng: 34.5,
    desc: "Defence support to the Australian Government response to the Hamas-Israel conflict. Includes non-combat deployment of personnel and RAAF aircraft for contingency planning and support to Australian citizens and approved foreign nationals in the region.",
    assets: ["RAAF aircraft", "Army and RAAF personnel", "Contingency support"],
    types: ["support"]
  },
  {
    id: "dyurra",
    name: "Operation Dyurra",
    region: "Space / Global",
    status: "active",
    lat: -25.0,
    lng: 135.0,
    desc: "Dedicated ADF space operation that integrates space capabilities, services and effects into wider ADF operations. Includes space domain awareness, surveillance, and support to deterrence and interoperability in the contested space domain.",
    assets: ["Space surveillance assets", "ADF Space Command personnel", "Ground stations (e.g. Exmouth)"],
    types: ["space"]
  },
  {
    id: "fortitude",
    name: "Operation Fortitude",
    region: "Syria / Israel region",
    status: "active",
    lat: 33.5,
    lng: 36.0,
    desc: "ADF contribution of personnel to the United Nations Disengagement Observer Force (UNDOF) to maintain the ceasefire between Israel and Syria. Includes staff officers and observers supervising separation areas.",
    assets: ["Up to 2 ADF personnel", "UN observers and staff"],
    types: ["un"]
  },
  {
    id: "gateway",
    name: "Operation Gateway",
    region: "South East Asia — Malaysia",
    status: "active",
    lat: 5.47,
    lng: 100.38,
    desc: "Long-running ADF contribution to regional security and stability in South East Asia. Maritime surveillance patrols in the North Indian Ocean and South China Sea from RMAF Base Butterworth under the Malaysia-Australia Joint Defence Program.",
    assets: ["P-8A Poseidon", "RAAF rotational detachment", "RMAF Base Butterworth"],
    types: ["patrol"]
  },
  {
    id: "hydranth",
    name: "Operation Hydranth",
    region: "Red Sea / Middle East",
    status: "active",
    lat: 19.5,
    lng: 38.5,
    desc: "ADF personnel embedded in the US-led headquarters supporting operations against Houthi capabilities threatening freedom of navigation in the Red Sea. Contribution is embedded staff officers, not direct strike operations.",
    assets: ["ADF embedded staff", "HQME support"],
    types: ["support"]
  },
  {
    id: "ipe",
    name: "Indo-Pacific Endeavour",
    region: "Indo-Pacific Region",
    status: "active",
    lat: -8.8,
    lng: 125.0,
    desc: "Australia's annual strategic military engagement activity across the Indo-Pacific. Recent iterations have deployed up to ~1,600 ADF personnel — the largest commitment in nearly 20 years — to build partnerships, conduct exercises and demonstrate capability.",
    assets: ["HMAS Choules", "P-8A Poseidon", "Army elements", "Special Operations", "Up to 1,600 personnel"],
    types: ["navy", "patrol", "army"]
  },
  {
    id: "kudu",
    name: "Operation Kudu",
    region: "Europe — Ukraine training",
    status: "active",
    lat: 51.5,
    lng: -0.5,
    desc: "ADF commitment to the training of Armed Forces of Ukraine personnel, primarily in the United Kingdom under the UK-led Operation Interflex. Also included E-7A Wedgetail support in Germany for early warning.",
    assets: ["ADF trainers (~50-100+)", "Army instructors", "E-7A Wedgetail (periodic)"],
    types: ["army"]
  },
  {
    id: "linesmen",
    name: "Operation Linesmen",
    region: "Korea — DMZ / Inter-Korean peace",
    status: "active",
    lat: 37.95,
    lng: 126.7,
    desc: "ADF contribution to the Inter-Korean peace process at the request of the United Nations Command. Small team operates in the demilitarised zone monitoring projects and supporting military agreements in the Korean Peninsula peace process.",
    assets: ["~4 ADF personnel", "Senior officers and NCOs"],
    types: ["un"]
  },
  {
    id: "manitou",
    name: "Operation Manitou",
    region: "Middle East — Persian Gulf",
    status: "active",
    lat: 25.5,
    lng: 55.0,
    desc: "Australia's contribution to Combined Task Force 150 and Combined Maritime Forces in the Gulf and broader Middle East. Focused on maritime security, counter-narcotics and counter-terrorism at sea. One of Australia's longest-running overseas commitments.",
    assets: ["RAN frigate/destroyer (rotational)", "Navy Seahawk helicopters", "ADF embarked personnel"],
    types: ["navy", "army"]
  },
  {
    id: "mazurka",
    name: "Operation Mazurka",
    region: "Sinai Peninsula",
    status: "active",
    lat: 29.5,
    lng: 33.0,
    desc: "ADF contribution to the Multinational Force and Observers (MFO) peacekeeping mission in the Sinai. Personnel support the MFO in supervising the peace treaty between Egypt and Israel, including force protection, administration and observer roles.",
    assets: ["Up to ~30 ADF personnel", "MFO support roles"],
    types: ["un"]
  },
  {
    id: "paladin",
    name: "Operation Paladin",
    region: "Israel / Middle East",
    status: "active",
    lat: 31.8,
    lng: 35.2,
    desc: "ADF support to the UN Truce Supervision Organisation (UNTSO). Personnel serve as staff officers in UNTSO Headquarters in Jerusalem and as military observers supervising cease-fire arrangements, truces and peace treaties across the region.",
    assets: ["~12 ADF personnel", "Military observers", "HQ staff"],
    types: ["un"]
  },
  {
    id: "resolute",
    name: "Operation Resolute",
    region: "Australia — Maritime Borders",
    status: "active",
    lat: -25.2744,
    lng: 133.7751,
    desc: "The ADF's primary domestic border protection operation. Covers approximately 10% of the world's surface including Australia's exclusive economic zone. ADF assets support Australian Border Force in civil maritime security operations against illegal activities.",
    assets: ["P-8A Poseidon", "Navy patrol vessels", "Army detachments", "Up to 600 personnel"],
    types: ["patrol", "navy", "army"]
  },
  {
    id: "solania",
    name: "Operation Solania",
    region: "Pacific — Fisheries Surveillance",
    status: "active",
    lat: -8.0,
    lng: 158.0,
    desc: "ADF support to Pacific Island Forum Fisheries Agency operations to detect and deter illegal, unreported and unregulated fishing across Pacific Island exclusive economic zones. Conducted under the Pacific Maritime Security Program.",
    assets: ["C-27J Spartan (No. 35 Sqn)", "RAAF aircrews", "Pacific detachments"],
    types: ["patrol"]
  },
  {
    id: "okra",
    name: "Operation Okra",
    region: "Middle East — Iraq & Syria",
    status: "concluded",
    lat: 33.3,
    lng: 43.0,
    desc: "Australia’s contribution to the international coalition against Daesh (ISIL) in Iraq and Syria (2014–2024/25). Involved Air Task Group (Super Hornets, Wedgetail, tankers), Task Group Taji (training Iraqi forces), Special Operations Task Group, and embedded personnel. More than 4,800 ADF personnel deployed. Ceased after major combat phase ended.",
    assets: ["Air Task Group (F/A-18F, E-7A, KC-30A)", "Task Group Taji", "Special Operations", "Embedded staff"],
    types: ["concluded"]
  },
  {
    id: "steadfast",
    name: "Operation Steadfast",
    region: "Iraq",
    status: "concluded",
    lat: 33.3,
    lng: 43.0,
    desc: "ADF contribution to the NATO Mission in Iraq (NMI) to train, advise and assist Iraqi Security Forces (2018–Dec 2025). Successor to earlier Iraq missions. Concluded after more than two decades of Australian involvement in Iraq. ADF officers embedded in key headquarters positions.",
    assets: ["Embedded officers in NATO HQ", "Capacity building teams"],
    types: ["concluded"]
  }
];


// ---------- ROYAL AUSTRALIAN NAVY MARITIME FORCES ----------
// Data for the Maritime section (formerly Fleet). Each entry powers the detailed modal when a maritime card is clicked.
// Structured identically to AIRCRAFT for consistency in modal rendering and plain-English explanations.
const NAVY = [
  {
    id: "hobart",
    desig: "DDG",
    name: "Hobart Class",
    typeName: "Air Warfare Destroyer",
    tagline: "Australia's most capable surface combatants. Aegis-equipped destroyers providing area air defence for naval task groups.",
    img: "images/hmas_hobart.mp4",
    stats: [
      { k: "Displacement", v: "7,000 t" },
      { k: "Speed", v: "28+ kts" },
      { k: "VLS Cells", v: "48 Mk 41" },
      { k: "Helicopter", v: "1 × MH-60R" }
    ],
    overview: "The Hobart-class Air Warfare Destroyers are the RAN's premier surface combatants. Three ships (Hobart, Brisbane, Sydney) were built in Australia on a Spanish F100 hull form and fitted with the Lockheed Martin Aegis combat system. They deliver long-range air defence with SM-2 and ESSM missiles, surface strike via the Naval Strike Missile, and a full suite of ASW weapons and sensors. For RAAF P-8A Poseidon, MH-60R Seahawk and MQ-4C Triton crews, Hobart-class ships are the primary air-defence escorts in a task group. Their SPY-1D radar picture and data links extend the recognised air picture far beyond what airborne sensors alone can achieve, and they provide the last line of defence against air and missile threats to high-value units.",
    systems: [
      { name: "Aegis Combat System (Baseline 9)", code: "Aegis", desc: "The heart of the ship. Integrates the SPY-1D radar, command-and-decision software, and missile launchers into one coherent air-defence system capable of tracking hundreds of targets and engaging multiple threats simultaneously.", layman: "Think of it as the ship's brain and eyes combined — it sees everything in the sky and decides which missiles to fire, all in seconds." },
      { name: "AN/SPY-1D(V) Phased Array Radar", code: "SPY-1D", desc: "Four fixed faces of the Aegis radar providing 360° volume search and tracking. Detects aircraft and missiles at ranges exceeding 150 km and provides mid-course guidance to SM-2 and SM-6 missiles.", layman: "Four giant flat-panel radars that never stop spinning. They can track dozens of aircraft and missiles at once and tell the missiles exactly where to go." },
      { name: "Mk 41 Vertical Launch System (48 cells)", code: "VLS", desc: "48 cells that can hold a mix of RIM-66 SM-2 (long-range air defence), quad-packed RIM-162 ESSM (point defence), SM-6, and Tomahawk land-attack missiles. Also integrated with Naval Strike Missile in deck canisters.", layman: "A vertical honeycomb of missiles. The ship can load whatever mix the mission needs — mostly air-defence missiles, with some strike weapons for land or ships." },
      { name: "MH-60R Seahawk Romeo", code: "Helo", desc: "Organic helicopter for ASW, anti-surface warfare, and search-and-rescue. Carries sonobuoys, dipping sonar, Mk 54 torpedoes and Hellfire missiles. Extends the ship's sensor and weapon reach over the horizon.", layman: "The ship's own helicopter that flies out, drops listening buoys, hunts submarines, and can attack surface targets with missiles or torpedoes." },
      { name: "Integrated Sonar Suite + MU90 Torpedoes", code: "ASW", desc: "Hull-mounted and towed-array sonars plus two triple MU90 lightweight torpedo launchers. Provides the ship with its own submarine detection and engagement capability independent of the helicopter.", layman: "Underwater ears plus torpedoes the ship can shoot itself. Good for when the helicopter is busy or the threat is close." }
    ],
    tags: ["Aegis", "Area Air Defence", "SM-2 / ESSM / SM-6", "NSM", "Task Group Escort", "MH-60R"]
  },
  {
    id: "mh60r",
    desig: "MH-60R",
    name: "Seahawk 'Romeo'",
    typeName: "Shipborne Multi-Role Helicopter",
    tagline: "The RAN's primary shipborne helicopter. The eyes, ears and precision strike arm of every major surface combatant.",
    img: "images/mh60r.mp4",
    stats: [
      { k: "Speed", v: "270 km/h" },
      { k: "Range", v: "~450 km" },
      { k: "Endurance", v: "~3.5 hours" },
      { k: "In service", v: "~24 aircraft" }
    ],
    overview: "The MH-60R Seahawk (Romeo) is the Royal Australian Navy's standard shipborne helicopter, operated by 816 Squadron. It flies from Hobart-class destroyers, Anzac-class frigates, the Canberra-class LHDs, and the future Hunter-class frigates. The Romeo is a true multi-role platform: anti-submarine warfare (dipping sonar + sonobuoys + Mk 54 torpedoes), anti-surface warfare (Hellfire missiles + machine guns), search and rescue, and over-the-horizon targeting for the ship's weapons. For RAAF P-8A and Triton crews, the MH-60R is the most common rotary-wing partner at sea.",
    systems: [
      { name: "AQS-22F Dipping Sonar + Sonobuoys", code: "ASW", desc: "Lowerable sonar buoy that actively and passively hunts submarines. Combined with sonobuoys dropped from the helicopter, it gives the ship a mobile, long-range underwater sensor that can be positioned exactly where needed.", layman: "The helicopter can dunk a powerful underwater microphone into the sea to listen for submarines, then drop listening buoys in patterns around the contact." },
      { name: "AGM-114 Hellfire Missiles", code: "Strike", desc: "Laser or radar-guided anti-armour and anti-boat missiles. The primary precision weapon for engaging small surface vessels, fast attack craft, and even some land targets from standoff range.", layman: "The same missile the Army uses from helicopters — it can destroy a small boat or a bunker with pinpoint accuracy while the Seahawk stays safely out of range." },
      { name: "Mk 54 Lightweight Torpedo", code: "Torpedo", desc: "Air-dropped anti-submarine torpedo. The helicopter's main weapon against submerged submarines once it has a solid contact from sonar or sonobuoys.", layman: "When the helicopter finds a submarine, it drops a smart torpedo that hunts it down in the water." },
      { name: "AN/APS-153 Multi-Mode Radar + EO/IR", code: "Sensors", desc: "Powerful surface-search radar plus high-resolution electro-optical/infrared turret for visual identification and targeting at long range, day and night.", layman: "The helicopter's own radar and cameras let it spot ships and small boats far over the horizon and identify them before the parent ship can see them." }
    ],
    tags: ["ASW", "Shipborne", "Hellfire", "Dipping Sonar", "RAN Aviation", "Task Group"]
  },
  {
    id: "anzac",
    desig: "FFH",
    name: "Anzac Class",
    typeName: "Frigate (ASMD / AMCAP)",
    tagline: "General-purpose frigates upgraded with world-class Australian CEAFAR2 radar. The workhorses of the current surface fleet.",
    img: "images/anzac.mp4",
    stats: [
      { k: "Displacement", v: "3,600 t" },
      { k: "Speed", v: "27 kts" },
      { k: "VLS Cells", v: "8 (32 ESSM)" },
      { k: "Helicopter", v: "1 × MH-60R" }
    ],
    overview: "The eight Anzac-class frigates (one recently decommissioned) form the bulk of the RAN's surface combatant force. Originally based on the German MEKO 200, they received the Anti-Ship Missile Defence (ASMD) upgrade with CEA Technologies CEAFAR and CEAMOUNT radars, followed by the AMCAP program adding the CEAFAR2-L long-range AESA. They carry ESSM for air defence, Naval Strike Missiles, a 5-inch gun, MU90 torpedoes and a Seahawk helicopter. For RAAF maritime crews they are the most numerous surface escorts you will work with on a daily basis during exercises and operations. Their upgraded Australian radars give them excellent detection performance against sea-skimming threats.",
    systems: [
      { name: "CEAFAR2-L Long-Range AESA Radar", code: "CEAFAR2", desc: "Australian-designed L-band active electronically scanned array optimised for long-range air search and tracking. Provides superior performance against small, fast, sea-skimming targets compared with the original SPS-49 radar.", layman: "A locally built 'flat panel' radar that is exceptionally good at spotting low-flying missiles and aircraft over the ocean horizon." },
      { name: "8-Cell Mk 41 VLS (ESSM)", code: "ESSM", desc: "Fires up to 32 quad-packed Evolved Sea Sparrow Missiles. Provides point and limited area defence against aircraft and incoming missiles. The primary self-defence weapon of the class.", layman: "A small vertical box that holds 32 short-range air-defence missiles. Each cell actually carries four missiles — clever packing." },
      { name: "Naval Strike Missile (NSM)", code: "NSM", desc: "Modern stealthy anti-ship cruise missile with imaging infrared seeker and land-attack capability. Replaced the older Harpoon on upgraded ships. Range in excess of 180 km.", layman: "A very sneaky missile that flies low, hides from radar, and has a smart camera in the nose so it can pick out the right ship even in a busy sea." },
      { name: "MH-60R Seahawk + MU90 Torpedoes", code: "ASW", desc: "Full ASW suite with helicopter, hull sonar, and two triple MU90 lightweight torpedo tubes. The combination makes the Anzac a credible submarine hunter in its own right.", layman: "Between the ship's own sonar and the helicopter's dipping sonar and torpedoes, it can find and kill submarines at useful ranges." }
    ],
    tags: ["CEAFAR2", "ESSM", "NSM", "General Purpose", "ASW Frigate", "MH-60R"]
  },
  {
    id: "collins",
    desig: "SSK",
    name: "Collins Class",
    typeName: "Diesel-Electric Submarine",
    tagline: "Australia's current submarine force. Large, long-range conventional boats optimised for the vast Indo-Pacific.",
    img: "images/collins.mp4",
    stats: [
      { k: "Displacement", v: "3,100 t (surf)" },
      { k: "Speed", v: "21 kts submerged" },
      { k: "Range", v: "11,500 nm" },
      { k: "Weapons", v: "Mk 48 + Harpoon" }
    ],
    overview: "The six Collins-class submarines are among the largest and most capable conventional submarines in the world. Designed and built in Australia, they feature exceptional range and endurance for operations across the Indian and Pacific Oceans. Armed with Mk 48 heavyweight torpedoes and Sub-Harpoon anti-ship missiles, they are currently undergoing Life-of-Type Extension (LOTE) upgrades to remain effective until the AUKUS SSNs arrive. For RAAF P-8A crews, Collins boats are the 'friendly' submarines you train to hunt and protect. Their acoustic signature, patrol patterns, and tactics are essential knowledge for any maritime patrol or ASW officer.",
    systems: [
      { name: "AN/BYG-1 Combat System", code: "BYG-1", desc: "Integrated combat management system (US origin, Australian modifications) that fuses sonar, periscope, ESM and weapon data. Provides fire-control solutions for torpedoes and missiles.", layman: "The submarine's central computer that turns raw sonar pings and sensor data into a clear picture and firing solutions." },
      { name: "Mk 48 Mod 7 CBASS Torpedo", code: "Mk 48", desc: "Heavyweight wire-guided torpedo with active/passive sonar homing. Extremely capable against both submarines and surface ships at long range. The primary weapon of the class.", layman: "A big, smart torpedo that swims out on a thin wire so the sub can steer it, then goes active and hunts on its own." },
      { name: "UGM-84 Sub-Harpoon", code: "Harpoon", desc: "Submarine-launched anti-ship missile fired from the torpedo tubes. Gives the boat a standoff surface strike capability.", layman: "A missile the sub can shoot from underwater that flies to a ship and then dives into it." },
      { name: "Sophisticated Sonar Suite + Towed Array", code: "Sonar", desc: "Bow, flank and distributed arrays plus a towed array. The Collins is renowned for its passive detection performance in the right ocean conditions.", layman: "Underwater microphones all over the boat plus a long cable that listens far behind. One of the quietest conventional subs ever built." }
    ],
    tags: ["SSK", "Long Range", "Mk 48", "ASW", "Indo-Pacific", "LOTE"]
  },
  {
    id: "canberra",
    desig: "LHD",
    name: "Canberra Class",
    typeName: "Amphibious Assault Ship",
    tagline: "The largest ships ever operated by the RAN. Full-spectrum amphibious capability with 18+ helicopters and a well dock.",
    img: "images/canberra.mp4",
    stats: [
      { k: "Displacement", v: "27,500 t" },
      { k: "Speed", v: "20+ kts" },
      { k: "Helicopters", v: "Up to 18" },
      { k: "Troops", v: "1,046+" }
    ],
    overview: "HMAS Canberra and Adelaide are the RAN's two Landing Helicopter Docks — the biggest vessels in Australian service. Based on the Spanish Juan Carlos I design, they combine a full flight deck and hangar for 18 helicopters, a massive well dock for landing craft, and capacity for over 1,000 troops plus vehicles including M1 Abrams tanks. They are central to amphibious operations, HADR, and regional engagement. For RAAF crews, especially those flying MH-60R or C-27J in support roles, the LHDs are the floating bases you will operate from or around. Their radars and command facilities also make them useful as secondary aviation control platforms.",
    systems: [
      { name: "Flight Deck + 2 Aircraft Lifts", code: "Aviation", desc: "202 m flight deck with six spots for medium helicopters or four CH-47 Chinooks simultaneously. Two lifts (one large enough for Chinook) move aircraft between the 990 m² hangar and the deck. Can operate up to Sea State 5.", layman: "A floating airport that can launch and recover many helicopters at once, day or night, even in rough seas." },
      { name: "Well Dock (LCM-1E Landing Craft)", code: "Well Dock", desc: "69 m floodable stern dock that carries up to four LCM-1E landing craft. Enables over-the-horizon ship-to-shore movement of troops, vehicles and stores without needing a port.", layman: "A giant garage at the back of the ship that fills with water so big landing barges can drive in and out fully loaded." },
      { name: "Vehicle Decks + 110+ Vehicles", code: "Vehicles", desc: "Heavy and light vehicle decks with capacity for 12 M1 Abrams tanks, 110+ vehicles, or hundreds of shipping containers. Stern and side ramps for rapid loading/unloading.", layman: "Massive car parks inside the ship that can carry an entire armoured battle group or disaster relief supplies." },
      { name: "Role 2E Medical Facility", code: "Hospital", desc: "Two operating theatres, eight-bed critical care unit, pathology, radiology, pharmacy and dental — a genuine floating hospital for combat casualties or humanitarian missions.", layman: "A proper hospital at sea with surgeons and intensive care. Critical for long deployments far from land hospitals." }
    ],
    tags: ["LHD", "Amphibious", "18 Helos", "Well Dock", "HADR", "Power Projection"]
  },
  {
    id: "supply",
    desig: "AOR",
    name: "Supply Class",
    typeName: "Replenishment Oiler",
    tagline: "The RAN's new double-hulled replenishment ships. Essential for sustaining any task group far from Australia.",
    img: "images/supply-class.mp4",
    stats: [
      { k: "Displacement", v: "19,500 t" },
      { k: "Speed", v: "20 kts" },
      { k: "Range", v: "6,000 nm" },
      { k: "Cargo", v: "Fuel + Stores" }
    ],
    overview: "HMAS Supply and Stalwart are the RAN's two new Auxiliary Oiler Replenishment (AOR) ships, replacing the elderly Success and Sirius. Based on the Spanish Cantabria class, they carry marine diesel, JP-5 jet fuel, fresh water, ammunition and provisions. They can conduct connected replenishment (RAS) with up to three ships simultaneously plus vertical replenishment by helicopter. For RAAF maritime crews on long deployments, the Supply-class ships are the floating petrol stations and supermarkets that keep the task group at sea for weeks or months. Without them, P-8A and helicopter operations from forward locations become severely constrained.",
    systems: [
      { name: "Multiple RAS Stations (Fuel + Solids)", code: "RAS", desc: "Abeam and astern replenishment rigs for simultaneous fuel and stores transfer. Can support three receiving ships at once in moderate sea states.", layman: "Hoses and highlines that let other ships pull alongside and take fuel, food, spare parts and ammunition while still moving." },
      { name: "Vertical Replenishment (VERTREP)", code: "Helo", desc: "Large flight deck and hangar for one medium helicopter (MH-60R compatible). Used to transfer ammunition, stores and personnel by air when alongside RAS is impractical.", layman: "The ship's own helicopter that can lift pallets of missiles or food across to other ships without them having to come alongside." },
      { name: "Cargo Capacities", code: "Cargo", desc: "8,200 m³ marine diesel, 1,450 m³ JP-5, 1,400 m³ fresh water, 270+ tonnes ammunition, 500+ tonnes provisions and containers. Double-hull construction for environmental protection.", layman: "A floating warehouse that carries everything a task group needs to stay at sea for 30+ days without visiting a port." }
    ],
    tags: ["AOR", "RAS", "Underway Replenishment", "Task Group Endurance", "JP-5"]
  },
  {
    id: "choules",
    desig: "LSD",
    name: "Choules Class",
    typeName: "Dock Landing Ship",
    tagline: "Versatile amphibious sealift ship acquired from the UK. Heavy vehicle and landing-craft capacity for regional operations.",
    img: "images/choules.mp4",
    stats: [
      { k: "Displacement", v: "16,000 t" },
      { k: "Speed", v: "18 kts" },
      { k: "Vehicles", v: "1,150 lane m" },
      { k: "Helicopters", v: "2 spots" }
    ],
    overview: "HMAS Choules (formerly RFA Largs Bay) is the RAN's Bay-class Landing Ship Dock. Acquired in 2011, it provides a vital 'second tier' amphibious capability alongside the larger Canberra-class LHDs. It features a floodable well dock, large vehicle decks, two helicopter spots on the flight deck, and capacity for 356 troops (overload to 700). It has been heavily used for HADR, regional engagement, and as a training platform. For RAAF crews it is a common partner in amphibious exercises and disaster relief — you will see it in the background of many P-8A and C-27J support missions.",
    systems: [
      { name: "Floodable Well Dock + Landing Craft", code: "Well Dock", desc: "Carries one LCM-8 or two LCVPs plus two Mexeflote powered rafts. Enables ship-to-shore movement of vehicles and troops in conditions up to Sea State 4 without port infrastructure.", layman: "A back garage that floods so big landing barges full of trucks and soldiers can drive straight out onto the beach." },
      { name: "1,150 Linear Metres of Vehicle Deck", code: "Vehicles", desc: "Space for 32 M1 Abrams tanks or 150 light trucks, plus 200 tonnes of ammunition or 24 TEU containers. Stern and side ramps for fast roll-on/roll-off.", layman: "A huge internal car park that can carry an entire armoured squadron or a town-worth of disaster relief supplies." },
      { name: "Twin-Spot Flight Deck (Chinook Capable)", code: "Helo", desc: "Aft flight deck rated for two medium helicopters or one CH-47 Chinook simultaneously. No permanent hangar, but temporary shelter can be fitted. Over 1,000 deck landings recorded in some periods.", layman: "A helicopter landing pad big enough for the Army's biggest Chinooks to bring in heavy gear or evacuate casualties." }
    ],
    tags: ["LSD", "Amphibious Sealift", "Well Dock", "HADR", "Vehicle Carrier"]
  },
  {
    id: "hunter",
    desig: "FFG (Future)",
    name: "Hunter Class",
    typeName: "Anti-Submarine Frigate",
    tagline: "The RAN's future high-end ASW frigates. Australian-optimised Type 26 with CEAFAR2 and Aegis integration.",
    img: "images/hunter-class.mp4",
    stats: [
      { k: "Displacement", v: "8,800 t" },
      { k: "Speed", v: "27+ kts" },
      { k: "VLS Cells", v: "32 Mk 41" },
      { k: "Helicopter", v: "1 × MH-60R" }
    ],
    overview: "The Hunter-class frigates (SEA 5000) are the RAN's next-generation surface combatants, optimised for anti-submarine warfare in the Indo-Pacific. Derived from the British Type 26 but with major Australian changes — most notably the CEAFAR2 AESA radar suite integrated with Aegis via a Saab interface, plus an advanced sonar suite (Ultra S2150 bow + Thales 2087 towed array). First steel cut in 2024; lead ship expected early 2030s. For RAAF maritime aircrews these will be the primary ASW surface partners once in service. Their quiet propulsion, world-class sonars and MH-60R helicopters will make them extremely effective submarine hunters alongside P-8A and future SSN operations.",
    systems: [
      { name: "CEAFAR2 + Aegis Combat System", code: "CEAFAR2", desc: "Australian tri-band AESA radar (L/S/X) integrated with Aegis via Saab 9LV interface. Provides superior air and surface surveillance plus fire control for SM-2/ESSM and future weapons.", layman: "The same locally designed radar family as the upgraded Anzacs, but married to the full power of Aegis — the best of Australian and American technology." },
      { name: "32-Cell Mk 41 VLS + NSM", code: "VLS", desc: "32 strike-length cells for SM-2, quad-packed ESSM, and potentially SM-6 or Tomahawk in later fits. Eight Naval Strike Missiles in deck canisters for surface strike.", layman: "A decent-sized vertical missile farm plus the latest anti-ship missiles. Not as many cells as a Hobart, but still very capable." },
      { name: "Advanced ASW Suite (S2150 + 2087 TAS/VDS)", code: "Sonar", desc: "Ultra S2150 hull-mounted sonar plus Thales Sonar 2087 towed array and variable-depth sonar. Combined with MH-60R and Surface Ship Torpedo Defence (SSTD), this is a world-class submarine hunting package.", layman: "The best underwater listening gear Australia could buy, plus a helicopter and anti-torpedo decoys. Built from the keel up to kill submarines." },
      { name: "Flexible Mission Bay", code: "Mission Bay", desc: "Large stern mission bay for additional uncrewed systems, extra boats, or modular payloads. Supports future growth in uncrewed and autonomous systems.", layman: "A big empty garage at the back that can be filled with drones, extra boats, or special equipment depending on the mission." }
    ],
    tags: ["Future Frigate", "ASW Optimised", "CEAFAR2", "Aegis", "Type 26", "MH-60R"]
  },
  {
    id: "aukus",
    desig: "SSN (Future)",
    name: "Virginia-class + SSN-AUKUS",
    typeName: "Nuclear Attack Submarine",
    tagline: "Australia's future nuclear-powered attack submarines under AUKUS. Virginia-class boats first, then sovereign SSN-AUKUS.",
    img: "images/virginia-class.mp4",
    stats: [
      { k: "Displacement", v: "~7,800 t (VA)" },
      { k: "Speed", v: "25+ kts" },
      { k: "Weapons", v: "Mk 48 + Tomahawk" },
      { k: "Endurance", v: "Unlimited" }
    ],
    overview: "Under the AUKUS Optimal Pathway, Australia will acquire three (optionally five) Virginia-class SSNs from the United States in the early 2030s as an interim capability, followed by five sovereign-built SSN-AUKUS boats from the early 2040s. The Virginia boats will be Block IV/VII configuration with 12 Tomahawk vertical launch tubes and advanced AN/BYG-1 combat systems. SSN-AUKUS will be a larger UK-derived design with US technology, common VLS for Tomahawk and future hypersonics, and a Rolls-Royce PWR3-derived reactor. For RAAF personnel these platforms represent the single biggest capability shift in decades. P-8A crews will train alongside them for ASW and ISR support; the boats will also provide long-range strike and special operations insertion that dramatically changes Australia's deterrence posture.",
    systems: [
      { name: "Virginia Payload Tubes (VPT) / Common VLS", code: "VLS", desc: "Early Virginias have 12 Tomahawk tubes (two large-diameter VPTs). SSN-AUKUS will have dedicated vertical launch cells for Tomahawk and future weapons, freeing torpedo room for more Mk 48s or other payloads.", layman: "Vertical missile silos that let the sub strike land targets from hundreds or thousands of kilometres away without using its torpedo tubes." },
      { name: "AN/BYG-1 Combat & Weapons System", code: "BYG-1", desc: "The most advanced submarine combat system in the world. Fuses all sonar, ESM, periscope and external data into a common tactical picture and provides fire control for torpedoes and missiles.", layman: "The submarine's super-smart brain that turns every sensor into a firing solution and shares the picture with friendly forces." },
      { name: "Advanced Sonar Suite + Pump-Jet", code: "Sonar", desc: "Large-aperture bow, flank and towed arrays plus a pump-jet propulsor for dramatically reduced acoustic signature. Nuclear power gives near-unlimited endurance and high sustained speed.", layman: "Extremely quiet underwater ears plus a propulsion system that doesn't sound like a noisy propeller. These boats can listen and move for months without surfacing." },
      { name: "Special Operations / UUV Capability", code: "SOF", desc: "Lock-out chambers, dry-deck shelters and large lock-in/lock-out capability for special forces. Also designed to deploy and recover large uncrewed underwater vehicles for ISR and strike.", layman: "Can quietly drop off and pick up special forces teams or robot submarines that go do dangerous jobs while the big sub stays hidden." }
    ],
    tags: ["AUKUS", "SSN", "Virginia", "Tomahawk", "Future Capability", "Nuclear"]
  },
  // ADVERSARY RECOGNITION
  {
    id: "type055",
    desig: "DDG (Adversary)",
    name: "Type 055 (Renhai)",
    typeName: "Chinese Cruiser / Destroyer",
    tagline: "China's most powerful surface combatant. 112 VLS cells, hypersonic YJ-21 capability, and carrier escort role.",
    img: "images/type-055.jpg",
    stats: [
      { k: "Displacement", v: "13,000 t" },
      { k: "Speed", v: "30+ kts" },
      { k: "VLS Cells", v: "112 Universal" },
      { k: "Helicopters", v: "2" }
    ],
    overview: "The Type 055 Renhai-class is the largest and most capable surface combatant in the PLAN. With 112 universal VLS cells, a powerful Type 346B AESA radar suite, and the ability to launch the YJ-21 hypersonic anti-ship ballistic missile, it represents a significant threat to any naval force operating in the Indo-Pacific. For RAAF P-8A and Triton crews, visual and radar recognition of the Type 055's distinctive enclosed mast, large superstructure and heavy VLS armament is essential. These ships are the primary air-defence and command escorts for Chinese carrier strike groups. Their long-range SAMs and hypersonic strike weapons create a dangerous A2/AD bubble that maritime patrol aircraft must respect.",
    systems: [
      { name: "Type 346B 'Dragon Eye' AESA Radar", code: "346B", desc: "Large S/C-band active phased-array radar providing long-range air and surface search, tracking, and missile guidance. One of the most powerful naval radars currently at sea.", layman: "Four huge flat-panel radars that can see aircraft and missiles at enormous ranges and guide the ship's many missiles to them." },
      { name: "112-Cell Universal VLS + YJ-21", code: "VLS", desc: "64 forward + 48 aft cells. Capable of HHQ-9B SAMs, YJ-18 supersonic ASCMs, CJ-10 LACMs, and the YJ-21 hypersonic anti-ship ballistic missile. The YJ-21 gives the ship a very long-range 'carrier killer' capability.", layman: "A massive vertical missile farm that can hold a mix of everything from air-defence missiles to hypersonic weapons that can hit ships from over 1,000 km away." },
      { name: "Dual Helicopter Hangar + CIWS", code: "Helo", desc: "Hangar and flight deck for two medium helicopters (Z-18/Z-20). Multiple CIWS (Type 1130 30 mm Gatling + HHQ-10 point-defence missiles) for last-ditch defence.", layman: "Two helicopters for ASW and targeting plus layers of close-in guns and missiles to shoot down anything that gets past the big SAMs." }
    ],
    tags: ["PLAN", "Cruiser", "112 VLS", "YJ-21", "Hypersonic", "Carrier Escort"]
  },
  {
    id: "type052d",
    desig: "DDG (Adversary)",
    name: "Type 052D (Luyang III)",
    typeName: "Chinese Multi-role Destroyer",
    tagline: "The most numerous modern Chinese destroyer. 64 VLS cells, YJ-18 supersonic ASCMs, and widespread deployment.",
    img: "images/type-052d.jpg",
    stats: [
      { k: "Displacement", v: "7,500 t" },
      { k: "Speed", v: "30 kts" },
      { k: "VLS Cells", v: "64 Universal" },
      { k: "Helicopter", v: "1" }
    ],
    overview: "The Type 052D Luyang III-class is the backbone of the modern PLAN surface fleet, with ~35 hulls in service and more building. It introduced China's first universal VLS (64 cells) and carries the potent YJ-18 supersonic anti-ship cruise missile. The Type 346A AESA radar gives it a capable 'Chinese Aegis' air-defence capability. For RAAF maritime crews these are the destroyers you will most frequently encounter in the South China Sea and western Pacific. Their combination of long-range YJ-18 missiles, area air defence, and helicopter makes them a credible multi-threat opponent. Recognition of the distinctive forward/aft VLS layout and integrated mast is a core visual ID skill.",
    systems: [
      { name: "Type 346A AESA Radar Suite", code: "346A", desc: "Four-panel S/C-band active phased-array radar for air and surface search, tracking and missile illumination. Significantly more capable than the earlier Type 052C radar.", layman: "The 'Chinese Aegis' radar — four big flat panels that give the ship a very good picture of the sky and sea around it." },
      { name: "64-Cell Universal VLS + YJ-18", code: "VLS", desc: "Two 32-cell groups. Fires HHQ-9 long-range SAMs, YJ-18 supersonic anti-ship missiles (Mach 2.5+ terminal sprint), CJ-10 land-attack missiles, and CY-5 ASW rockets.", layman: "A big vertical box of missiles that can shoot air-defence, ship-killing (very fast ones), and land-attack weapons depending on what the mission needs." },
      { name: "YJ-18 Supersonic ASCM", code: "YJ-18", desc: "Primary anti-ship weapon. Subsonic cruise phase followed by a Mach 2.5–3.0 supersonic terminal sprint with sea-skimming or pop-up profile. Extremely challenging for ship defences.", layman: "A missile that flies low and slow for most of the way, then suddenly accelerates to three times the speed of sound in the last 20–30 km — very hard to shoot down." }
    ],
    tags: ["PLAN", "Destroyer", "64 VLS", "YJ-18", "Supersonic", "Most Numerous"]
  },
  {
    id: "kilo",
    desig: "SSK (Adversary)",
    name: "Kilo / Improved Kilo",
    typeName: "Russian Diesel-Electric Submarine",
    tagline: "The 'Black Hole' — one of the quietest conventional submarines ever built. Kalibr cruise missile capable in 636.3 variant.",
    img: "images/kilo-class.jpg",
    stats: [
      { k: "Displacement", v: "2,400 t (surf)" },
      { k: "Speed", v: "17–20 kts" },
      { k: "Weapons", v: "6 tubes + Kalibr" },
      { k: "Signature", v: "Very Quiet" }
    ],
    overview: "The Project 877/636 Kilo and Improved Kilo (Varshavyanka) class are Russia's most successful export submarines and remain potent in the hands of the Russian Navy and several client states. The 636.3 variant is exceptionally quiet ('Black Hole' nickname) thanks to advanced anechoic coatings, rafted machinery, and a skewed seven-bladed propeller. Later boats can launch Kalibr (Club-S) cruise missiles from the torpedo tubes. For RAAF P-8A crews, Kilo-class boats are classic 'adversary' targets in training — small, extremely quiet on battery, and capable of laying mines or firing long-range land-attack missiles. Their low acoustic signature makes them one of the hardest conventional submarines to detect with passive sonar.",
    systems: [
      { name: "MGK-400EM / Rubikon Sonar Suite", code: "Sonar", desc: "Bow, flank and intercept arrays with good passive performance. Later 636.3 boats have upgraded digital processing. No towed array in standard fit.", layman: "Decent underwater ears, but the boat's real defence is how incredibly quiet it is — it often hears you before you hear it." },
      { name: "6 × 533 mm Torpedo Tubes + Kalibr", code: "Weapons", desc: "Can carry up to 18 torpedoes or 24 mines, or a mix including 3M-54 Kalibr anti-ship and 3M-14 land-attack cruise missiles (4–8 missiles typical). The Kalibr gives the boat long-range strike reach.", layman: "Six tubes that can shoot regular torpedoes or, on the newer boats, big cruise missiles that can hit ships or land targets from over 1,000 km away." },
      { name: "Exceptional Acoustic Stealth", code: "Stealth", desc: "Double-hull construction, extensive anechoic tiles, vibration-isolated machinery and a specially designed low-noise propeller make the Improved Kilo one of the quietest conventional submarines in service.", layman: "When running on battery at slow speed this boat is almost silent. It is genuinely hard to hear even when you know it's out there." }
    ],
    tags: ["SSK", "Very Quiet", "Kalibr", "Black Hole", "Mine Layer", "Export"]
  },
  {
    id: "gorshkov",
    desig: "FFG (Adversary)",
    name: "Admiral Gorshkov Class",
    typeName: "Russian Multi-role Frigate",
    tagline: "Modern Russian stealth frigate. 16–24 strike VLS cells carrying Kalibr and the hypersonic Tsirkon (Zircon).",
    img: "images/gorshkov-class.jpg",
    stats: [
      { k: "Displacement", v: "5,400 t" },
      { k: "Speed", v: "29+ kts" },
      { k: "VLS (Strike)", v: "16–24 UKSK" },
      { k: "SAM VLS", v: "32 Redut" }
    ],
    overview: "The Project 22350 Admiral Gorshkov-class frigates are Russia's most advanced surface combatants currently in series production. They combine stealth shaping, a powerful Poliment AESA radar for air defence, 16–24 strike VLS cells (UKSK) that can carry Kalibr cruise missiles and the hypersonic 3M22 Tsirkon, plus a full ASW suite and a Ka-27 helicopter. For RAAF crews these are the ships most likely to be encountered in the northern Indian Ocean or during any future high-end contingency. Their combination of long-range hypersonic strike weapons and capable air-defence radars makes them a serious threat that P-8A and MH-60R crews must treat with respect. The later hulls with 24 strike cells are particularly potent 'missile trucks'.",
    systems: [
      { name: "Poliment 4-Face AESA + Redut SAMs", code: "SAM", desc: "Four-panel AESA radar tied to 32-cell Redut VLS firing 9M96 and 9M100 missiles. Provides medium-range area air defence out to ~150 km for the best variants.", layman: "A proper modern air-defence radar and missile system — the ship can protect itself and nearby vessels from aircraft and cruise missiles." },
      { name: "UKSK Strike VLS (Kalibr + Tsirkon)", code: "Strike", desc: "16 cells on early ships, 24 on later hulls. Fires Kalibr land-attack and anti-ship cruise missiles plus the 3M22 Tsirkon hypersonic missile (Mach 8–9, ~500–1,000 km range). Tsirkon is the ship's most dangerous weapon.", layman: "Vertical tubes that can shoot either normal cruise missiles or a hypersonic weapon that is extremely difficult to intercept because of its speed and flight profile." },
      { name: "Ka-27 ASW Helicopter + Sonars", code: "ASW", desc: "Hangar and deck for one Ka-27 (or Ka-27M) helicopter with dipping sonar and torpedoes. Hull-mounted Zarya-M sonar plus Vinyetka towed array for submarine detection.", layman: "A proper helicopter and underwater sensors so the ship can hunt submarines as well as fire long-range missiles." }
    ],
    tags: ["Russia", "Stealth Frigate", "Kalibr", "Tsirkon", "Hypersonic", "Poliment"]
  }
];


// ---------- AUSTRALIAN ARMY GROUND VEHICLES ----------
// Data for the new Vehicles section. Focused on platforms RAAF personnel are likely to encounter
// during joint operations, HADR, or when supporting Army movement by air.
const ARMY = [
  {
    id: "abrams",
    desig: "M1A1",
    name: "Abrams AIM",
    typeName: "Main Battle Tank",
    tagline: "Australia's heavy armoured punch. The 70-tonne tank that only the Chinook can move by air when needed.",
    img: "images/abrams.mp4",
    stats: [
      { k: "Weight", v: "70 tonnes" },
      { k: "Main Gun", v: "120 mm M256" },
      { k: "Speed", v: "67 km/h" },
      { k: "In service", v: "59 (upgrade program)" }
    ],
    overview: "The M1A1 Abrams is the Australian Army's main battle tank, operated by the 1st Armoured Regiment. It provides the ADF's heaviest direct-fire capability. Because of its weight, strategic airlift by C-17 is limited and the RAAF's CH-47F Chinook is one of the few assets that can move it tactically by helicopter in certain configurations. RAAF crews (especially C-27J, C-17, and Chinook) must understand the tank's dimensions, weight, and recovery requirements.",
    systems: [
      { name: "120 mm M256 Smoothbore Gun", code: "Gun", desc: "Fires depleted uranium or tungsten sabot rounds and HEAT. Extremely accurate and lethal against other tanks and hardened targets out to 3+ km.", layman: "The big cannon that can destroy another tank from several kilometres away with a single shot." },
      { name: "Heavy Armour + Reactive Tiles", code: "Protection", desc: "Composite armour with explosive reactive armour tiles. Designed to defeat modern anti-tank missiles and kinetic rounds.", layman: "Incredibly thick layered armour that can shrug off most battlefield threats." },
      { name: "Digital Fire Control + Hunter-Killer Sight", code: "Fire Control", desc: "Commander and gunner have independent thermal sights, allowing the tank to engage multiple targets rapidly while moving.", layman: "The tank can spot and shoot at two different threats at the same time, day or night." },
      { name: "CITV / Commander's Independent Thermal Viewer (M1A1 Abrams)", code: "Thermal", desc: "Independent 360° thermal sight for commander. Hunter-killer capability with gunner sight; day/night target acquisition.", layman: "The boss has his own set of magic night-vision binoculars that spin all the way around." }
    ],
    tags: ["Heavy Armour", "Tank", "Chinook Lift", "Direct Fire"]
  },
  {
    id: "bushmaster",
    desig: "PMV",
    name: "Bushmaster",
    typeName: "Protected Mobility Vehicle",
    tagline: "The backbone of Australian protected mobility. Mine-resistant, highly mobile, and a frequent passenger on RAAF transports.",
    img: "images/bushmaster.mp4",
    stats: [
      { k: "Weight", v: "~15 t" },
      { k: "Capacity", v: "1+9 troops" },
      { k: "Protection", v: "IED / Mine resistant" },
      { k: "In service", v: "1,000+" }
    ],
    overview: "The Bushmaster Protected Mobility Vehicle is the Australian Army's workhorse for moving troops safely in high-threat environments. It has saved countless lives with its V-shaped hull that deflects mine and IED blasts. RAAF C-130J, C-27J and Chinook crews regularly move Bushmasters for exercises and operations. Understanding its dimensions and weight is essential for load planning.",
    systems: [
      { name: "V-Hull Blast Protection", code: "Survivability", desc: "Monocoque V-shaped hull designed to channel blast energy away from the crew compartment.", layman: "The belly is shaped like a V so bombs and mines push the force sideways instead of up into the soldiers." },
      { name: "Remote Weapon Station", code: "RWS", desc: "Can mount .50 cal, 40 mm grenade launcher or 7.62 mm MG controlled from inside the vehicle.", layman: "A gun on the roof that the crew can fire without exposing themselves." },
      { name: "Modular Mission Fit", code: "Role", desc: "Ambulance, command post, troop transport and specialist variants exist.", layman: "The same basic truck can be quickly turned into an armoured ambulance or a mobile headquarters." }
    ],
    tags: ["Protected Mobility", "IED Resistant", "Army Workhorse", "Air Transportable"]
  },
  {
    id: "hawkei",
    desig: "4x4",
    name: "Hawkei",
    typeName: "Protected Light Vehicle",
    tagline: "The new lightweight protected 4x4 replacing the Land Rover. Designed from the ground up for rapid air deployment.",
    img: "images/hawkei.mp4",
    stats: [
      { k: "Weight", v: "~7 t" },
      { k: "Capacity", v: "1+5" },
      { k: "Speed", v: "130+ km/h" },
      { k: "In service", v: "1,000+ on order" }
    ],
    overview: "The Hawkei is the Australian Army's new generation of light protected vehicle, designed specifically with air mobility in mind. It is significantly lighter than the Bushmaster while still offering good mine and ballistic protection. This makes it ideal for rapid deployment by C-27J Spartan and CH-47F Chinook. RAAF crews will see increasing numbers of Hawkei in the coming years.",
    systems: [
      { name: "Lightweight Composite Armour", code: "Protection", desc: "Advanced materials providing STANAG Level 2 ballistic and mine protection at a fraction of the weight of older vehicles.", layman: "Tough enough to stop bullets and blasts but light enough for smaller aircraft to carry." },
      { name: "Integrated Battle Management System", code: "C4I", desc: "Modern digital radios and displays that link directly with higher command and other vehicles.", layman: "Everyone in the vehicle can see the same map and talk securely to the rest of the force." },
      { name: "Weapon Mount Options", code: "Armament", desc: "Can carry a range of weapons including the M2 .50 cal or lighter machine guns.", layman: "Flexible firepower depending on the mission." }
    ],
    tags: ["Light Protected", "Air Mobile", "Next-Gen", "C-27J / Chinook"]
  },
  {
    id: "m777",
    desig: "M777A2",
    name: "155 mm Howitzer",
    typeName: "Towed Artillery",
    tagline: "The Army's long-range indirect fire support. Lightweight enough for Chinook sling-load yet devastating on the battlefield.",
    img: "images/m777.mp4",
    stats: [
      { k: "Calibre", v: "155 mm" },
      { k: "Range", v: "24–30 km (standard)" },
      { k: "Weight", v: "4.2 tonnes" },
      { k: "In service", v: "54 guns" }
    ],
    overview: "The M777A2 is the Australian Army's current 155 mm towed howitzer. It is significantly lighter than previous generations, allowing it to be sling-loaded under a CH-47F Chinook or transported internally by C-130/C-27J. This air mobility gives the ADF a true rapid-response artillery capability that RAAF crews must be able to plan and execute.",
    systems: [
      { name: "Digital Fire Control System", code: "FCS", desc: "Computerised aiming with GPS and inertial navigation for first-round accuracy.", layman: "The gun knows exactly where it is and can hit targets accurately with the first shot." },
      { name: "Excalibur & Precision Munitions", code: "PGM", desc: "Compatible with GPS-guided Excalibur rounds for effects within metres of the target.", layman: "Smart shells that can be steered onto a specific grid reference." },
      { name: "Chinook Sling-Load Capable", code: "Mobility", desc: "Designed to be lifted by heavy-lift helicopters for rapid repositioning on the battlefield.", layman: "The RAAF Chinook can pick it up and move it to a new firing position in minutes." }
    ],
    tags: ["Artillery", "Chinook Sling", "Precision Fires", "Air Mobile"]
  },
  {
    id: "hx",
    desig: "HX77",
    name: "Heavy Truck",
    typeName: "Heavy Logistics Vehicle",
    tagline: "The Army's heavy transport backbone. Moves fuel, ammunition, water and engineering equipment in large quantities.",
    img: "images/hx77.mp4",
    stats: [
      { k: "Payload", v: "15–20 tonnes" },
      { k: "Configuration", v: "8x8 / 6x6" },
      { k: "Variants", v: "Fuel, Cargo, Recovery" },
      { k: "In service", v: "Hundreds" }
    ],
    overview: "The Rheinmetall MAN HX series (including HX77) forms the backbone of Australian Army heavy logistics. These trucks move the fuel, water, ammunition and heavy engineering equipment that sustain any deployed force. RAAF crews (especially C-17, C-130 and Chinook) frequently transport these vehicles or their cargo during exercises and operations.",
    systems: [
      { name: "Modular Cargo & Tanker Bodies", code: "Role", desc: "Interchangeable flatbed, fuel tanker, water, and container-handling variants.", layman: "The same truck can be a petrol tanker one day and a flatbed for containers the next." },
      { name: "High Mobility Suspension", code: "Mobility", desc: "Designed for rough terrain while carrying heavy loads at convoy speeds.", layman: "Can go places ordinary trucks would get stuck, even when fully loaded." },
      { name: "Recovery & Engineer Variants", code: "Support", desc: "Heavy recovery vehicles and engineering modules are part of the family.", layman: "Includes the big wreckers that can tow a broken tank or Bushmaster." }
    ],
    tags: ["Logistics", "Heavy Transport", "Fuel & Ammo", "Convoy"]
  },
  {
    id: "aslav",
    desig: "ASLAV",
    name: "Australian Light Armoured Vehicle",
    typeName: "Wheeled Recon / APC",
    tagline: "The Army's long-serving 8x8 reconnaissance and patrol vehicle. Still widely used while Boxer and Redback arrive.",
    img: "images/aslav.mp4",
    stats: [
      { k: "Weight", v: "~13 t" },
      { k: "Crew + Troops", v: "3 + 6" },
      { k: "Main Armament", v: "25 mm Bushmaster" },
      { k: "In service", v: "~250 (phasing down)" }
    ],
    overview: "The ASLAV (based on the Canadian LAV III / US Stryker family) has been the Australian Army's primary wheeled armoured vehicle for over 20 years. It comes in many variants (recon, command, ambulance, mortar). While being progressively replaced by Boxer and Redback under LAND 400, large numbers remain in service and will be relevant for RAAF air mobility planning for years to come.",
    systems: [
      { name: "25 mm Bushmaster Chain Gun", code: "Cannon", desc: "Stabilised automatic cannon with day/night sights. Effective against light armour, bunkers and personnel out to 2 km.", layman: "A fast-firing cannon that can chew through most things that aren't heavy tanks." },
      { name: "Thermal Sights + Battle Management", code: "Sensors", desc: "Good night-fighting capability and digital links to other vehicles and headquarters.", layman: "Can see in the dark and share what it sees with the rest of the force." },
      { name: "Modular Variants", code: "Roles", desc: "Reconnaissance, Command Post, Ambulance, Recovery, and 81 mm Mortar carrier versions exist.", layman: "The same basic vehicle can be kitted out for scouting, commanding, or carrying a mortar." }
    ],
    tags: ["Wheeled Armour", "Recon", "Legacy", "Air Mobile"]
  },
  {
    id: "boxer",
    desig: "Boxer CRV",
    name: "Combat Reconnaissance Vehicle",
    typeName: "Wheeled IFV / Recon",
    tagline: "The Army's new 8x8 heavyweight. Highly protected, modular, and designed for the Indo-Pacific fight.",
    img: "images/boxer.mp4",
    stats: [
      { k: "Weight", v: "~35 t (mission fit)" },
      { k: "Crew + Dismounts", v: "3 + 6–8" },
      { k: "Main Armament", v: "30 mm + Javelin / Spike" },
      { k: "In service", v: "Entering service 2025+" }
    ],
    overview: "The Rheinmetall Boxer CRV (Combat Reconnaissance Vehicle) is the winner of LAND 400 Phase 2. It offers vastly superior protection, mobility, and firepower compared with the ASLAV it replaces. Its modular mission module design means the same hull can be re-roled quickly. Because of its weight it is primarily moved by C-17, though C-27J and Chinook can handle some variants in limited configurations. Critical platform for RAAF planners.",
    systems: [
      { name: "30 mm Lance Turret + Coaxial MG", code: "Turret", desc: "Remote or manned turret with 30 mm cannon, excellent day/night optics, and hunter-killer capability.", layman: "A serious cannon in a well-protected turret that can engage light armour and infantry from a distance." },
      { name: "Modular Mission Module", code: "Modularity", desc: "The entire rear 'pod' can be swapped in the field for different roles (recon, command, ambulance, etc.).", layman: "Like swapping the back of a truck — the same vehicle can become a different specialist platform quickly." },
      { name: "Active Protection + High-Level Armour", code: "Survivability", desc: "Advanced composite armour and options for active protection systems against RPGs and ATGMs.", layman: "Much harder to kill than older Australian armoured vehicles." }
    ],
    tags: ["LAND 400", "Heavy Wheeled", "Modular", "High Protection"]
  },
  {
    id: "redback",
    desig: "Redback",
    name: "Infantry Fighting Vehicle",
    typeName: "Tracked IFV (Future)",
    tagline: "Australia's future tracked infantry fighting vehicle under LAND 400 Phase 3. Will replace the venerable M113.",
    img: "images/redback.mp4",
    stats: [
      { k: "Weight", v: "~42 t" },
      { k: "Crew + Dismounts", v: "3 + 8" },
      { k: "Main Armament", v: "30 mm + Spike LR2" },
      { k: "Status", v: "In development / early production" }
    ],
    overview: "The Hanwha Redback is the selected platform for LAND 400 Phase 3. A modern tracked IFV with exceptional protection (including active protection), a powerful 30 mm turret, and capacity for a full section of infantry. It will be the Army's primary mechanised infantry vehicle for the next 30+ years. Heavier than Boxer, so primarily C-17 strategic lift + some heavy-lift helicopter options in extremis.",
    systems: [
      { name: "30 mm Turret + Dual Spike Launchers", code: "Firepower", desc: "Stabilised 30 mm cannon plus two Spike LR2 anti-tank guided missiles for heavy armour engagement.", layman: "Can take on tanks and bunkers while carrying its own infantry section into the fight." },
      { name: "Iron Fist Active Protection System", code: "APS", desc: "Hard-kill active protection that intercepts incoming RPGs and some ATGMs before they hit the vehicle.", layman: "An automatic 'umbrella' that shoots down incoming rockets and missiles." },
      { name: "High Mobility Tracked Chassis", code: "Mobility", desc: "Excellent cross-country performance and the ability to keep up with tanks in mechanised operations.", layman: "Can go places wheeled vehicles struggle while carrying a lot of armour and soldiers." }
    ],
    tags: ["LAND 400 Phase 3", "Tracked IFV", "Active Protection", "Future"]
  },
  {
    id: "himars",
    desig: "M142",
    name: "HIMARS",
    typeName: "High Mobility Artillery Rocket System",
    tagline: "Long-range precision rocket artillery. Recently acquired and a major new strike capability for the Army.",
    img: "images/himars.mp4",
    stats: [
      { k: "Range (GMLRS)", v: "70+ km" },
      { k: "Range (PrSM)", v: "500+ km (future)" },
      { k: "Payload", v: "6 GMLRS or 1 ATACMS" },
      { k: "In service", v: "20+ systems (more on order)" }
    ],
    overview: "The M142 HIMARS is a wheeled, air-mobile multiple rocket launcher that gives the Australian Army long-range precision strike for the first time. It can fire GPS-guided GMLRS rockets (70+ km) and in future the Precision Strike Missile (PrSM) out to 500+ km. Because it is truck-mounted and relatively light, it is highly air-transportable by C-130J, C-27J, and even Chinook in some configurations — making it extremely relevant for RAAF crews.",
    systems: [
      { name: "GMLRS / PrSM Rockets", code: "Munitions", desc: "GPS-guided rockets with a variety of warheads. PrSM will give theatre-level strike range from land.", layman: "Rockets that can hit targets with pinpoint accuracy from dozens or hundreds of kilometres away." },
      { name: "Highly Mobile Launcher", code: "Mobility", desc: "Mounted on a 6x6 FMTV truck. Can 'shoot and scoot' — fire a salvo and be gone in minutes before counter-battery fire arrives.", layman: "Drive in, fire a bunch of smart rockets, and drive away before the enemy can shoot back." },
      { name: "Air Deployable", code: "Airlift", desc: "Light enough for C-130/C-27J internal transport and rapid sling or internal lift by heavy helicopters in some loads.", layman: "The RAAF can fly these launchers around the region quickly to create sudden long-range strike capability." }
    ],
    tags: ["Precision Strike", "Rocket Artillery", "Airliftable", "Long Range"]
  },
  // Army Aviation Helicopters
  {
    id: "uh60m",
    desig: "UH-60M",
    name: "Black Hawk",
    typeName: "Utility Helicopter",
    tagline: "The Australian Army's primary utility helicopter for troop transport, special operations, and medical evacuation.",
    img: "images/blackhawk.mp4",
    stats: [
      { k: "Speed", v: "280 km/h" },
      { k: "Range", v: "~590 km" },
      { k: "Capacity", v: "11 troops + 2 crew" },
      { k: "In service", v: "40+ (more on order)" }
    ],
    overview: "The UH-60M Black Hawk is the backbone of current Australian Army Aviation. It is used for rapid troop movement, special forces insertion/extraction, casualty evacuation, and general utility support across the battlefield. RAAF crews (particularly Chinook and C-27J) regularly work alongside Black Hawks during joint operations.",
    systems: [
      { name: "Twin T700 Engines + Hoist", code: "Utility", desc: "Powerful engines and rescue hoist for medevac and special operations roles." },
      { name: "Self-Defence Suite", code: "Protection", desc: "Missile warning receivers and countermeasures for operations in higher threat environments." }
    ],
    tags: ["Army Aviation", "Utility", "Medevac", "Special Operations"]
  },
  {
    id: "arh-tiger",
    desig: "ARH",
    name: "Tiger",
    typeName: "Armed Reconnaissance Helicopter",
    tagline: "The Army's dedicated attack and reconnaissance helicopter for finding and engaging enemy forces.",
    img: "images/tiger.mp4",
    stats: [
      { k: "Speed", v: "290 km/h" },
      { k: "Range", v: "~800 km" },
      { k: "Armament", v: "30 mm cannon + Hellfire + Rockets" },
      { k: "In service", v: "~22 (being phased out)" }
    ],
    overview: "The ARH Tiger provides the Australian Army with armed reconnaissance and precision strike capability from the air. Although the platform has had sustainment issues and is scheduled for replacement, it remains an important asset for recognition training.",
    systems: [
      { name: "30 mm Cannon + Hellfire", code: "Firepower", desc: "Heavy cannon and laser-guided missiles for engaging armoured and soft targets." },
      { name: "OSIRIS / Strix Mast-Mounted Sight (ARH Tiger)", code: "EO-IR + Radar", desc: "Gyro-stabilised mast sight with thermal, TV, laser and mm-wave radar. Allows target ID and Hellfire designation while masked.", layman: "A periscope on a stick that sees in infrared and with radar, so the Tiger can hide behind a hill." }
    ],
    tags: ["Army Aviation", "Attack", "Reconnaissance", "Hellfire"]
  }
];

window.ARMY = ARMY;


// ---------- ADVERSARY GROUND VEHICLES ----------
// Key Chinese and Russian armoured vehicles, IFVs, and artillery systems relevant to ADF threat awareness and recognition.
// Structured the same as Australian VEHICLES for consistency in modals and Study Tools.
const ADVERSARY_ARMY = [
  {
    id: "type99a",
    desig: "Type 99A",
    name: "ZTZ-99A",
    typeName: "Chinese Main Battle Tank",
    tagline: "PLA's most capable tank. Modern 3rd-gen MBT with advanced armour, fire control, and hard-kill APS.",
    img: "images/type-99a.jpg",
    stats: [
      { k: "Weight", v: "~55–58 t" },
      { k: "Main Gun", v: "125 mm smoothbore" },
      { k: "Protection", v: "Composite + ERA + APS" },
      { k: "Numbers", v: "Several hundred in service" }
    ],
    overview: "The Type 99A is the pinnacle of current PLA tank design. It features a 125 mm gun with autoloader, advanced composite armour with explosive reactive armour (ERA), and China's GL5 hard-kill active protection system. It is the primary heavy armoured threat Australian forces would face in any high-end conflict in our region. Recognition of its distinctive angular turret and hull shape is important for RAAF ISR crews.",
    systems: [
      { name: "125 mm Smoothbore + ATGM", code: "Gun", desc: "Fires kinetic energy rounds and laser-guided anti-tank missiles through the barrel. Very long effective range.", layman: "A powerful tank gun that can also shoot missiles at other tanks or helicopters." },
      { name: "GL5 Active Protection System", code: "APS", desc: "Hard-kill APS that intercepts incoming RPGs and some anti-tank missiles before they impact.", layman: "An automatic shield that shoots down rockets aimed at the tank." },
      { name: "Advanced Thermal Sights + Hunter-Killer", code: "Fire Control", desc: "High-quality thermal imagers and independent commander sight for rapid multi-target engagement.", layman: "The crew can spot and engage multiple targets quickly, day or night." }
    ],
    tags: ["China", "MBT", "APS", "Threat", "Heavy Armour"]
  },
  {
    id: "zbd04",
    desig: "ZBD-04 / ZBD-08",
    name: "Infantry Fighting Vehicle",
    typeName: "Chinese Tracked IFV",
    tagline: "PLA's primary mechanised infantry carrier. Amphibious, well-armed, and produced in large numbers.",
    img: "images/zbd-04.jpg",
    stats: [
      { k: "Weight", v: "~20–25 t" },
      { k: "Crew + Troops", v: "3 + 7" },
      { k: "Armament", v: "30 mm + HJ-73 / HJ-9 ATGMs" },
      { k: "Numbers", v: "Thousands in service" }
    ],
    overview: "The ZBD-04 (and improved ZBD-08 variants) is the backbone of PLA mechanised infantry. It is amphibious, carries a 30 mm cannon, co-axial machine gun, and anti-tank guided missiles. Large numbers would be encountered in any island or littoral campaign. Its relatively light weight compared with Western heavy IFVs makes it more mobile but less protected.",
    systems: [
      { name: "30 mm Cannon + ATGMs", code: "Firepower", desc: "Stabilised 30 mm gun plus wire-guided or laser anti-tank missiles on the roof.", layman: "Can chew up lighter vehicles and infantry while also threatening tanks at range." },
      { name: "Amphibious Capability", code: "Mobility", desc: "Designed to swim across rivers and narrow straits with minimal preparation.", layman: "Can drive straight into the water and keep going — useful for island hopping." },
      { name: "Basic ERA & Protection", code: "Armour", desc: "Explosive reactive armour on many examples plus composite base armour.", layman: "Better protected than older BMPs but still vulnerable to modern anti-armour weapons." }
    ],
    tags: ["China", "IFV", "Amphibious", "Mechanised Infantry", "Threat"]
  },
  {
    id: "t90m",
    desig: "T-90M",
    name: "Breakthrough",
    typeName: "Russian Main Battle Tank",
    tagline: "Russia's most modern serial MBT. Upgraded T-90 with improved armour, fire control, and active protection.",
    img: "images/t-90m.jpg",
    stats: [
      { k: "Weight", v: "~48 t" },
      { k: "Main Gun", v: "125 mm smoothbore" },
      { k: "Protection", v: "Relikt ERA + Kalina APS (late)" },
      { k: "Numbers", v: "Hundreds upgraded / in production" }
    ],
    overview: "The T-90M 'Breakthrough' is the current top-tier Russian tank in series production and combat use in Ukraine. It features improved Relikt ERA, better optics, a more powerful engine, and in later batches elements of active protection. While not as numerous in the Pacific as Chinese types, Russian equipment and doctrine remain relevant for ADF threat awareness, especially through exercises and intelligence.",
    systems: [
      { name: "125 mm 2A46M-5 + Reflex ATGMs", code: "Gun", desc: "Accurate gun that can fire laser-guided anti-tank missiles as well as conventional rounds.", layman: "Tank gun + tank-launched missiles in one package." },
      { name: "Relikt ERA + Kalina APS", code: "Protection", desc: "Advanced reactive armour and (on some) active protection against shaped-charge weapons.", layman: "Tougher to kill from the front than older T-72s and T-80s." },
      { name: "Improved Thermal Sights", code: "Sensors", desc: "Modern thermal imagers for commander and gunner giving better night and bad-weather performance.", layman: "Much better at seeing targets in the dark or through smoke than legacy Russian tanks." }
    ],
    tags: ["Russia", "MBT", "T-90M", "Threat", "Ukraine Lessons"]
  },
  {
    id: "bmp3",
    desig: "BMP-3",
    name: "Infantry Fighting Vehicle",
    typeName: "Russian Tracked IFV",
    tagline: "Unique Russian IFV with heavy armament for its size. 100 mm gun + 30 mm cannon + ATGMs.",
    img: "images/bmp-3.jpg",
    stats: [
      { k: "Weight", v: "~18.5 t" },
      { k: "Crew + Troops", v: "3 + 7" },
      { k: "Armament", v: "100 mm + 30 mm + ATGMs" },
      { k: "Numbers", v: "Thousands in Russian service + exports" }
    ],
    overview: "The BMP-3 is unusual for an IFV because of its heavy 100 mm main gun (which can also fire ATGMs) in addition to a 30 mm cannon. This gives it significant direct-fire support capability beyond normal infantry carriers. It is amphibious and relatively light, making it air-transportable by medium helicopters in some configurations. Widely exported and still in production in improved forms.",
    systems: [
      { name: "100 mm Gun/Launcher + 30 mm Cannon", code: "Firepower", desc: "The 100 mm weapon fires both high-explosive shells and laser-guided anti-tank missiles. Combined with the 30 mm for suppressive fire.", layman: "Carries a mini-tank gun that can blast buildings or other vehicles while also having a fast cannon for infantry." },
      { name: "Amphibious + Good Mobility", code: "Mobility", desc: "Fully amphibious with water jets. Excellent power-to-weight for its class.", layman: "Can swim and move quickly across rough ground." },
      { name: "Basic Armour + ERA Options", code: "Protection", desc: "Lightly armoured by Western standards but often fitted with reactive armour kits in modern conflicts.", layman: "Not very well protected against serious anti-armour weapons." }
    ],
    tags: ["Russia", "IFV", "Heavy Firepower", "Amphibious", "Threat"]
  },
  {
    id: "pcl181",
    desig: "PCL-181",
    name: "155 mm Truck Gun",
    typeName: "Chinese Truck-Mounted Howitzer",
    tagline: "Modern Chinese 155 mm truck howitzer. Long range, highly mobile, and produced in large numbers.",
    img: "images/pcl-181.jpg",
    stats: [
      { k: "Calibre", v: "155 mm" },
      { k: "Range", v: "40+ km (base bleed)" },
      { k: "Chassis", v: "6x6 heavy truck" },
      { k: "Numbers", v: "Hundreds in service" }
    ],
    overview: "The PCL-181 is the PLA's current standard 155 mm truck-mounted howitzer. It offers much better range and accuracy than older 130 mm and 152 mm systems and is far more mobile than towed artillery. Large numbers give the PLA significant long-range indirect fire capability that can be rapidly repositioned. Its truck-mounted nature makes it a target for RAAF maritime and land ISR assets.",
    systems: [
      { name: "155 mm / 52 Calibre Gun", code: "Gun", desc: "Long barrel for improved range. Fires standard NATO-compatible 155 mm ammunition plus Chinese precision rounds.", layman: "A proper modern 155 mm gun that can reach much farther than old Soviet-calibre artillery." },
      { name: "Automated Loading & Fire Control", code: "Automation", desc: "Semi-automatic loader and digital fire control for high rate of fire and rapid emplacement.", layman: "Can shoot faster and more accurately than older manually loaded guns." },
      { name: "High Road Mobility", code: "Mobility", desc: "Mounted on a heavy 6x6 truck. Can move quickly on roads and deploy in minutes.", layman: "Drive to a new firing position fast, set up, shoot, and move again before being found." }
    ],
    tags: ["China", "Artillery", "Truck Howitzer", "Long Range", "Threat"]
  }
];

window.ADVERSARY_ARMY = ADVERSARY_ARMY;


// ---------- SPACE DOMAIN ASSETS & KNOWLEDGE ----------
// Data for the Space section cards. Includes ADF, adversary, and allied space capabilities, satellites, and key concepts for Space Operations Officers.
const SPACE = [
  {
    id: "adf-satcom",
    desig: "JP9102",
    name: "ADF Protected Satcom",
    tagline: "Sovereign resilient satellite communications",
    stats: [
      { v: "GEO/LEO", k: "Orbit" },
      { v: "High", k: "Anti-Jam" },
      { v: "Global", k: "Coverage" },
      { v: "2028+", k: "IOC" }
    ],
    tags: ["ADF", "Comms", "Sovereign", "Resilient"],
    img: "images/adf-satcom.jpg",
    overview: "The ADF is acquiring protected satellite communications to ensure secure, anti-jam, global comms independent of commercial or foreign providers during conflict. Essential for C2 in contested electromagnetic environments where adversaries will prioritize denying space-based links."
  },
  {
    id: "sda",
    desig: "SDA-Radar",
    name: "Space Domain Awareness",
    tagline: "Tracking and characterizing objects in orbit",
    stats: [
      { v: "LEO-GEO", k: "Regimes" },
      { v: "High", k: "Sensitivity" },
      { v: "Sovereign", k: "Capability" }
    ],
    tags: ["ADF", "Surveillance", "SDA", "Debris", "Threat"],
    img: "images/sda.jpg",
    overview: "Australia is investing in sovereign space domain awareness (SDA) radars, optical telescopes, and data fusion to detect, track, and attribute objects and threats in Earth orbit. Critical for protecting ADF and allied satellites from debris, co-orbital threats, and direct-ascent ASATs."
  },
  {
    id: "china-asat",
    desig: "SC-19 / DN-3",
    name: "Chinese Direct-Ascent ASAT",
    tagline: "Kinetic counterspace weapon",
    stats: [
      { v: "LEO", k: "Target" },
      { v: "Demonstrated", k: "Status" },
      { v: "High", k: "Threat" }
    ],
    tags: ["China", "ASAT", "Counterspace", "Adversary"],
    img: "images/china-asat.jpg",
    overview: "China has tested and deployed direct-ascent anti-satellite missiles capable of destroying satellites in low Earth orbit. Combined with co-orbital 'killer' satellites, ground-based lasers, jammers, and cyber attacks, this forms a mature counterspace doctrine aimed at blinding adversaries in the opening phases of conflict."
  },
  {
    id: "russia-asat",
    desig: "Nudol / PL-19",
    name: "Russian Co-Orbital ASAT",
    tagline: "On-orbit inspection and attack systems",
    stats: [
      { v: "LEO/MEO", k: "Target" },
      { v: "Active", k: "Status" },
      { v: "High", k: "Threat" }
    ],
    tags: ["Russia", "ASAT", "Co-orbital", "Adversary"],
    img: "images/russia-asat.jpg",
    overview: "Russia operates co-orbital anti-satellite systems that can rendezvous with and disable or destroy target satellites. Recent tests have generated long-lived debris, underscoring the dual-use nature of 'inspector' satellites and the risk of irreversible escalation in space."
  },
  {
    id: "us-starshield",
    desig: "Starshield",
    name: "US Starshield Constellation",
    tagline: "Resilient military LEO comms & ISR",
    stats: [
      { v: "LEO", k: "Orbit" },
      { v: "Thousands", k: "Scale" },
      { v: "Low-latency", k: "Performance" }
    ],
    tags: ["US", "Allied", "Constellation", "Comms/ISR"],
    img: "images/us-starshield.jpg",
    overview: "The military evolution of Starlink provides proliferated, resilient, low-latency communications and ISR. Australia is integrating access for regional operations. In a high-intensity fight, such mega-constellations are difficult to fully suppress and enable distributed C2 for the joint force."
  },
  {
    id: "us-gps",
    desig: "GPS III / M-Code",
    name: "US Global Positioning System",
    tagline: "Precision navigation and timing backbone",
    stats: [
      { v: "MEO", k: "Orbit" },
      { v: "31+", k: "Satellites" },
      { v: "Global", k: "Coverage" }
    ],
    tags: ["US", "Allied", "PNT", "Navigation"],
    img: "images/us-gps.jpg",
    overview: "GPS remains the primary source of positioning, navigation and timing for precision weapons, aircraft, and forces. Space Operations Officers must understand jamming/spoofing threats, M-Code receivers, and the need for alternative PNT (inertial, celestial, terrain-referenced) in denied environments."
  },
  {
    id: "aus-cubesat",
    desig: "Buccaneer / M2",
    name: "Australian Defence Cubesats",
    tagline: "Sovereign small satellite capabilities",
    stats: [
      { v: "LEO", k: "Orbit" },
      { v: "3U-12U", k: "Size" },
      { v: "Tech Demo", k: "Role" }
    ],
    tags: ["ADF", "Cubesat", "ISR", "Sovereign"],
    img: "images/aus-cubesat.jpg",
    overview: "Australia is rapidly developing small satellite and cubesat programs for ISR, communications relay, and technology risk reduction. These attritable, rapidly replaceable assets are a key part of building a resilient, distributed space architecture that can survive attacks on large satellites."
  },
  {
    id: "space-law",
    desig: "OST 1967",
    name: "Outer Space Treaty & IHL",
    tagline: "Legal and ethical framework for space ops",
    stats: [
      { v: "1967", k: "Treaty" },
      { v: "Core", k: "Principles" },
      { v: "Evolving", k: "Norms" }
    ],
    tags: ["Law", "Doctrine", "Ethics", "All"],
    img: "images/space-law.jpg",
    overview: "The Outer Space Treaty bans WMD in space and territorial claims, but does not prohibit conventional ASATs, jamming, or cyber attacks on space systems. A Space Operations Officer must understand the legal boundaries, the blurred line between civilian and military space assets, and how actions in space can trigger escalation under international humanitarian law."
  },
  {
    id: "kessler",
    desig: "Kessler Syndrome",
    name: "Orbital Debris Cascade Risk",
    tagline: "The existential threat to space access",
    stats: [
      { v: "Critical", k: "Risk Level" },
      { v: "LEO", k: "Primary Zone" }
    ],
    tags: ["Threat", "Debris", "Sustainability", "All"],
    img: "images/kessler.jpg",
    overview: "Kessler Syndrome describes a cascading collision scenario where debris generates more debris, potentially rendering certain orbits unusable for generations. Every Space Operations Officer must appreciate how ASAT tests and irresponsible operations increase this risk and why space sustainability is a core national security interest."
  },
  {
    id: "launch",
    desig: "Responsive Launch",
    name: "Responsive & Sovereign Launch",
    tagline: "Getting assets to orbit when needed",
    stats: [
      { v: "Days", k: "Responsive" },
      { v: "Critical", k: "Survivability" }
    ],
    tags: ["Launch", "Sovereign", "Resilience"],
    img: "images/responsive-launch.jpg",
    overview: "In conflict, traditional launch pads will be targeted. Responsive launch (small rockets, air-launched, sea-launched) and dispersed ground infrastructure are essential for reconstituting space capabilities. Australia is developing sovereign launch options and partnerships to reduce reliance on foreign providers."
  }
];


// ---------- MASTER GLOSSARY ----------
// High-value acronyms and terms (tri-service). Used for auto cross-ref tooltips + whyItMatters.
// Every entry includes a crisp definition + "Why it matters" (operational / technical / command context).
const GLOSSARY = [
  { term: "AESA", full: "Active Electronically Scanned Array", category: "sensors", definition: "A radar that uses thousands of small transmit/receive modules to steer the beam electronically instead of physically moving an antenna.", whyItMatters: "AESA radars are superior to older mechanically scanned radars because they have no moving parts. The beam is steered electronically by thousands of tiny transmit/receive modules. This allows: extremely rapid scanning and near-instant beam redirection; simultaneous tracking of dozens of targets in different directions; much higher reliability (the radar continues to work even if some modules fail); lower probability of intercept (narrow beams and rapid frequency changes); and true multi-function capability (search, track, communications, and limited jamming from the same array)." },
  { term: "AUKUS", full: "Australia–UK–US Security Partnership", category: "doctrine", definition: "Trilateral security agreement (2021) focused on sharing nuclear propulsion technology for submarines and deepening cooperation in cyber, AI, quantum, and undersea capabilities.", whyItMatters: "The single biggest strategic shift for the ADF this century. You must be able to articulate Pillar 1 (SSNs) vs Pillar 2 (advanced capabilities) and why it matters for RAAF roles." },
  { term: "CEAFAR2", full: "CEA Active Phased Array Radar 2", category: "sensors", definition: "Australian-designed multi-band AESA radar family (L/S/X) developed by CEA Technologies. Fitted to upgraded Anzac-class and the future Hunter-class frigates.", whyItMatters: "Demonstrates sovereign Australian capability. Shows you understand how local industry contributes to ADF lethality and why CEAFAR2 is a genuine world-class sensor." },
  { term: "ESSM", full: "Evolved Sea Sparrow Missile", category: "weapons", definition: "Short-to-medium range naval surface-to-air missile, quad-packed in Mk 41 VLS cells. Primary point-defence weapon on Hobart and Anzac-class ships.", whyItMatters: "Key to understanding layered air defence in a task group. P-8A crews often operate inside the ESSM engagement envelope of escorts." },
  { term: "JSM", full: "Joint Strike Missile", category: "weapons", definition: "Norwegian stealthy, long-range anti-ship and land-attack cruise missile designed to fit internally in the F-35A weapons bay.", whyItMatters: "Gives the F-35A a potent maritime strike capability while preserving stealth. One of the most important future weapons for the RAAF." },
  { term: "Link 16", full: "Tactical Data Link", category: "sensors", definition: "NATO-standard secure, jam-resistant data network that shares a common tactical picture between aircraft, ships, and ground units in real time.", whyItMatters: "The 'group chat' of the modern battlefield. Wedgetail, F-35A, and Hobart-class all rely heavily on it. Expect questions about data fusion and interoperability." },
  { term: "MESA", full: "Multi-role Electronically Scanned Array", category: "sensors", definition: "The fixed, top-mounted radar on the E-7A Wedgetail that provides 360° coverage without physically rotating.", whyItMatters: "The heart of Australia's airborne command and control capability. Frequently discussed when covering ISR and C2." },
  { term: "MH-60R", full: "MH-60R Seahawk 'Romeo'", category: "platforms", definition: "The RAN's primary shipborne helicopter for anti-submarine warfare, anti-surface warfare, and search and rescue. Operates from Anzac, Hobart, and future Hunter-class vessels.", whyItMatters: "Critical partner for P-8A Poseidon crews. Understanding MH-60R capabilities and limitations is essential for any maritime air role." },
  { term: "NSM", full: "Naval Strike Missile", category: "weapons", definition: "Modern stealthy, sea-skimming anti-ship cruise missile with imaging infrared seeker. Replacing Harpoon on RAN surface combatants.", whyItMatters: "The new standard anti-ship weapon for the surface fleet. Much harder to defeat than older missiles." },
  { term: "P-8A", full: "P-8A Poseidon", category: "platforms", definition: "RAAF's maritime patrol and anti-submarine warfare aircraft based on the Boeing 737. Operated by No. 11 and 12 Squadrons at Edinburgh.", whyItMatters: "The backbone of Australia's maritime ISR and ASW capability. Central to almost any discussion of maritime patrol and ASW." },
  { term: "SPY-1D", full: "AN/SPY-1D Phased Array Radar", category: "sensors", definition: "The four-faced Aegis radar fitted to Hobart-class destroyers. Provides volume search, tracking, and missile guidance.", whyItMatters: "The sensor that makes the Hobart-class true area air-defence ships. Understanding Aegis/SPY-1 is fundamental when discussing task group defence." },
  { term: "VLS", full: "Vertical Launch System", category: "weapons", definition: "A below-deck missile launch system that fires missiles vertically. Allows rapid, flexible launches in any direction without training launchers.", whyItMatters: "The standard on all modern surface combatants (Hobart 48 cells, Type 055 112 cells, Hunter 32 cells). Questions about VLS capacity and missile mix are common." },
  { term: "DSR", full: "Defence Strategic Review (2023)", category: "doctrine", definition: "Major independent review that shifted Australia from a 'balanced force' to a 'focused force' optimised for the immediate region, with the Strategy of Denial at its core.", whyItMatters: "The foundational document for current Australian defence policy. You must be able to summarise its key recommendations and implications." },
  { term: "Strategy of Denial", full: "Strategy of Denial", category: "doctrine", definition: "Australia's core military strategy: deterring an adversary from successfully conducting major operations in our region by making the cost too high.", whyItMatters: "The central idea behind the 2023 DSR and subsequent National Defence Strategies. Expect to be asked to explain it in your own words." },
  { term: "NDS", full: "National Defence Strategy", category: "doctrine", definition: "The 2024 and 2026 documents that translate the DSR into specific capability, posture, and investment decisions.", whyItMatters: "Shows you understand the difference between high-level strategy and actual implementation decisions." },
  { term: "Mission Command", full: "Mission Command", category: "doctrine", definition: "A command philosophy that emphasises decentralised execution based on clear intent, allowing subordinates maximum freedom of action within the commander's intent.", whyItMatters: "One of the 10 ADF Leadership Principles and a core part of ADF-P-0. Frequently cited when discussing command philosophy and decentralised execution." },
  { term: "OTD", full: "Officer Training Day / Officer Training School", category: "orgs", definition: "The 12-week initial officer training course conducted at RAAF Base East Sale for all RAAF officer candidates (including direct-entry specialists).", whyItMatters: "The common foundation for every RAAF officer. You will be expected to know the duration, location, and purpose of OTS." },
  { term: "SEAD", full: "Suppression of Enemy Air Defences", category: "doctrine", definition: "Operations to temporarily or permanently degrade, disrupt, or destroy enemy air defence systems to enable friendly air operations.", whyItMatters: "Primary mission of the EA-18G Growler. Understanding SEAD is essential for any discussion of contested airspace operations." },
  { term: "SIGINT", full: "Signals Intelligence", category: "sensors", definition: "Intelligence derived from collecting and analysing electromagnetic signals (communications and electronic emissions).", whyItMatters: "Core mission of the MC-55A Peregrine and a major growth area for the RAAF. Directly relevant to Cyber and Intelligence officer roles." },
  { term: "CCA", full: "Collaborative Combat Aircraft", category: "platforms", definition: "Uncrewed 'loyal wingman' aircraft designed to operate alongside crewed fighters, carrying sensors, EW payloads, or weapons.", whyItMatters: "The MQ-28A Ghost Bat is Australia's CCA program. This is the future of air combat — expect questions on teaming concepts." },
  { term: "Growler", full: "EA-18G Growler", category: "platforms", definition: "The world's only dedicated airborne electronic attack aircraft, operated by No. 6 Squadron at Amberley.", whyItMatters: "Australia's primary SEAD/DEAD capability. Critical enabler for strike packages in contested airspace." },
  { term: "EA-18G", full: "EA-18G Growler", category: "platforms", definition: "The world's only operational airborne electronic attack aircraft. It replaces the gun and some weapons on the F/A-18F Super Hornet with a powerful suite of jamming and electronic warfare systems for SEAD/DEAD missions.", whyItMatters: "The RAAF's dedicated 'Wild Weasel' platform. Essential knowledge for any discussion of suppressing enemy air defences in a high-threat environment." },
  { term: "Super Hornet", full: "F/A-18F Super Hornet", category: "platforms", definition: "RAAF's two-seat multirole strike fighter, operated by No. 1 and 6 Squadrons. Equipped with APG-79 AESA radar and capable of carrying a wide range of precision weapons including the JSM for maritime strike.", whyItMatters: "Core strike and maritime strike platform that works closely with the Growler and F-35A. Understanding its capabilities is fundamental for air combat and maritime roles." },
  { term: "F/A-18F", full: "F/A-18F Super Hornet", category: "platforms", definition: "RAAF two-seat strike fighter variant of the Super Hornet family.", whyItMatters: "The RAAF's primary strike fighter until the F-35A fleet is fully operational and beyond." },
  { term: "Wedgetail", full: "E-7A Wedgetail", category: "platforms", definition: "Australia's airborne early warning and control aircraft based on the Boeing 737, providing 360° radar coverage and airborne command.", whyItMatters: "The 'eye in the sky' that directs the entire air battle. One of the most important force multipliers in the RAAF inventory." },
  { term: "Triton", full: "MQ-4C Triton", category: "platforms", definition: "High-altitude long-endurance (HALE) maritime surveillance UAV that provides persistent ISR over Australia's ocean approaches.", whyItMatters: "Future partner to the P-8A. Understanding persistent surveillance concepts is increasingly important for maritime roles." },
  { term: "Ghost Bat", full: "MQ-28A Ghost Bat", category: "platforms", definition: "Australia's loyal wingman collaborative combat aircraft (CCA) designed to team with crewed fighters.", whyItMatters: "A sovereign Australian capability and a window into the future of air combat. Frequently discussed in the context of loyal wingman / CCA concepts." },
  { term: "Hobart-class", full: "Hobart-class Destroyer (AWD)", category: "platforms", definition: "Australia's three Aegis-equipped Air Warfare Destroyers (Hobart, Brisbane, Sydney).", whyItMatters: "The most capable surface combatants in the RAN. Central to task group air defence discussions." },
  { term: "Hunter-class", full: "Hunter-class Frigate", category: "platforms", definition: "Australia's future anti-submarine optimised frigates (SEA 5000), based on the Type 26 with CEAFAR2 and Aegis integration.", whyItMatters: "The future backbone of the surface fleet's ASW capability. Important context when discussing AUKUS and future maritime operations." },
  { term: "Collins-class", full: "Collins-class Submarine", category: "platforms", definition: "Australia's current diesel-electric attack submarines, undergoing life-of-type extension ahead of AUKUS SSNs.", whyItMatters: "The only submarines the ADF currently operates. You must understand their capabilities and limitations." },
  { term: "Type 055", full: "Type 055 Renhai-class", category: "platforms", definition: "China's largest and most capable surface combatant, with 112 VLS cells and hypersonic YJ-21 capability.", whyItMatters: "The premier adversary surface threat in the Indo-Pacific. Visual and capability recognition is essential for maritime roles." },
  { term: "YJ-21", full: "YJ-21 Hypersonic Anti-Ship Ballistic Missile", category: "weapons", definition: "Chinese hypersonic maneuvering ballistic missile launched from Type 055 VLS, designed to threaten high-value naval targets at long range.", whyItMatters: "Represents a major new threat to surface ships and the concept of sea control. Frequently referenced in modern threat discussions." },
  { term: "Kalibr", full: "3M-14 / 3M-54 Kalibr", category: "weapons", definition: "Russian family of long-range cruise missiles (land-attack and anti-ship variants) launched from submarines, ships, and aircraft.", whyItMatters: "Demonstrated in combat in Syria and Ukraine. Shows the reach of modern cruise missile threats from both surface and sub-surface platforms." },
  { term: "Tsirkon", full: "3M22 Tsirkon (Zircon)", category: "weapons", definition: "Russian hypersonic cruise missile capable of Mach 8–9, launched from Gorshkov-class frigates and other platforms.", whyItMatters: "One of the most difficult weapons to defend against due to speed and maneuverability. Relevant when discussing future threat environments." },
  { term: "Mk 48", full: "Mk 48 Heavyweight Torpedo", category: "weapons", definition: "The primary heavyweight torpedo used by both US and Australian submarines (Collins and future SSNs).", whyItMatters: "The main weapon of the Collins class and future AUKUS submarines. Core knowledge for any ASW discussion." },
  { term: "ADF-P-0", full: "ADF Philosophical Doctrine", category: "doctrine", definition: "The foundational doctrine document that sets out the ADF's approach to leadership, command, and the profession of arms.", whyItMatters: "Directly underpins the Leadership section of this site and is frequently referenced in officer selection processes." },
  { term: "RAAF", full: "Royal Australian Air Force", category: "orgs", definition: "Australia's air and space power service, responsible for air combat, air mobility, ISR, space operations, and cyber effects in support of joint operations.", whyItMatters: "You are applying to join this organisation. You should be able to articulate its current roles and future direction concisely." },
  { term: "A2/AD", full: "Anti-Access / Area Denial", category: "doctrine", definition: "Strategies and capabilities designed to prevent an adversary from entering or operating freely in a specific region (anti-access) or to limit their freedom of action within it (area denial).", whyItMatters: "The central problem the 2023 DSR and National Defence Strategy are designed to solve. You must be able to discuss how the ADF is responding to A2/AD threats." },
  { term: "ASW", full: "Anti-Submarine Warfare", category: "doctrine", definition: "Operations to detect, track, and engage enemy submarines using aircraft, ships, and submarines.", whyItMatters: "Core mission for P-8A, MH-60R, Collins-class, and future Hunter-class and SSNs. Expect detailed questions on ASW tactics and platforms." },
  { term: "ISR", full: "Intelligence, Surveillance and Reconnaissance", category: "doctrine", definition: "The collection and processing of information to support decision-making and targeting.", whyItMatters: "The primary mission area for many non-kinetic RAAF roles (P-8A, Triton, Peregrine, Wedgetail). Fundamental to modern operations." },
  { term: "SEAD / DEAD", full: "Suppression / Destruction of Enemy Air Defences", category: "doctrine", definition: "Operations to neutralise or destroy enemy air defence systems (radars, SAMs, AAA) to enable friendly air operations.", whyItMatters: "Primary role of the EA-18G Growler. Critical enabler for any strike package in a contested environment." },
  { term: "IFF", full: "Identification Friend or Foe", category: "sensors", definition: "A system that uses coded radio signals to distinguish friendly platforms from enemy ones. Mode 5 is the current NATO encrypted standard.", whyItMatters: "Essential for deconfliction and preventing fratricide. Wedgetail, F-35A and most modern platforms rely heavily on it." },
  { term: "JORN", full: "Jindalee Operational Radar Network", category: "sensors", definition: "Australia's over-the-horizon radar system that provides long-range surveillance of the northern and western approaches.", whyItMatters: "A unique sovereign Australian capability that provides strategic early warning. Often discussed in the context of northern basing and ISR." },
  { term: "REDFIN", full: "RAAF Electronic Warfare and Intelligence", category: "orgs", definition: "The RAAF's electronic warfare and signals intelligence unit (No. 462 Squadron and related elements) that supports operations with EW and SIGINT.", whyItMatters: "Relevant for Electronic Warfare and Intelligence roles. Shows understanding of the RAAF's specialist EW capabilities." },
  { term: "APG-81", full: "AN/APG-81 AESA Radar", category: "sensors", definition: "The advanced Active Electronically Scanned Array radar fitted to the F-35A Lightning II.", whyItMatters: "The APG-81 is one of the most advanced fighter radars in service. Its key advantages include a very large number of transmit/receive modules for excellent range and resolution, the ability to track many targets simultaneously while searching, integrated electronic attack capabilities, and very low probability of intercept modes. It is central to the F-35A's sensor fusion and situational awareness advantage." },
  { term: "APY-10", full: "AN/APY-10 Radar", category: "sensors", definition: "The multi-mode surface search radar fitted to the P-8A Poseidon, optimised for maritime surveillance including periscope detection.", whyItMatters: "The primary sensor for the P-8A's maritime patrol role. Understanding its capabilities is essential for maritime aircrew applicants." },
  { term: "MAD", full: "Magnetic Anomaly Detector", category: "sensors", definition: "A sensor that detects disturbances in the Earth's magnetic field caused by a submarine's steel hull. Often used on maritime patrol aircraft.", whyItMatters: "A classic ASW tool still used on the P-8A. Good for showing you understand multiple layers of submarine detection." },
  { term: "Sonobuoy", full: "Sonobuoy", category: "sensors", definition: "A small expendable buoy dropped from aircraft that listens for underwater sounds and transmits data back to the aircraft or ship.", whyItMatters: "The primary tool used by P-8A and MH-60R for wide-area submarine detection. Expect questions on DIFAR, LOFAR, and active/passive buoys." },
  { term: "Aegis", full: "Aegis Combat System", category: "sensors", definition: "The US Navy's integrated air and missile defence combat system used on Hobart-class destroyers (and many US and allied ships).", whyItMatters: "The heart of Australia's area air defence capability. Understanding how Aegis works with the SPY-1D radar is important for joint operations knowledge." },
  { term: "UKSK", full: "Universal Shipborne Firing Complex", category: "weapons", definition: "Russian vertical launch system (3S14) used on Gorshkov-class frigates and other vessels to launch Kalibr, Oniks, and Tsirkon missiles.", whyItMatters: "Key to understanding the strike capability of modern Russian surface combatants like the Admiral Gorshkov class." },
  { term: "Poliment", full: "Poliment AESA Radar", category: "sensors", definition: "The four-faced active phased array radar fitted to Russian Admiral Gorshkov-class frigates for air defence.", whyItMatters: "The primary air defence sensor on one of Russia's most capable surface combatants. Relevant for threat recognition." },
  { term: "YJ-18", full: "YJ-18 Supersonic Anti-Ship Cruise Missile", category: "weapons", definition: "Chinese supersonic sea-skimming anti-ship missile with a high-speed terminal sprint phase. Primary ASCM on Type 052D and Type 055 destroyers.", whyItMatters: "A major threat to surface ships. Understanding its speed profile and engagement challenges is valuable for maritime roles." },
  { term: "AWACS", full: "Airborne Warning and Control System", category: "platforms", definition: "A general term for aircraft that provide airborne early warning, command and control, and battle management (e.g. E-7A Wedgetail, E-3 Sentry).", whyItMatters: "The role performed by the Wedgetail. Being able to explain the difference between AWACS and fighter control is useful." },
  { term: "OCA / DCA", full: "Offensive / Defensive Counter-Air", category: "doctrine", definition: "OCA: Operations to destroy or degrade enemy air forces on the ground or in the air. DCA: Operations to defend friendly airspace against enemy air attack.", whyItMatters: "Core air power missions. The F-35A and Super Hornet perform both roles. Expect questions on how the RAAF contributes to counter-air operations." },
  { term: "BDA", full: "Battle Damage Assessment", category: "doctrine", definition: "The process of assessing the physical and functional effects of attacks on targets after they have been struck.", whyItMatters: "Critical part of the targeting cycle. ISR platforms (P-8A, Triton, Wedgetail) play a major role in BDA." },
  { term: "ROE", full: "Rules of Engagement", category: "doctrine", definition: "Directives issued by competent military authority that specify the circumstances and limitations under which forces may initiate or continue combat engagement with other forces.", whyItMatters: "Fundamental to all military operations. Officers must understand how ROE constrain and enable action in different scenarios." },
  { term: "Integrated Force", full: "Integrated Force", category: "doctrine", definition: "The 2023 DSR concept of a single, integrated ADF optimised for the primary mission of deterring and defeating attacks on Australia and its interests in the region.", whyItMatters: "The central organising idea of current Australian defence policy. Shows you understand the shift away from a 'balanced' force." },
  { term: "Northern Basing", full: "Northern Basing", category: "doctrine", definition: "The ADF's plan to significantly expand and harden bases in northern Australia (Tindal, Darwin, Townsville, etc.) to support operations in the Indo-Pacific.", whyItMatters: "A major investment and strategic signal. Relevant when discussing posture, resilience, and power projection." },

  // New Cyberspace / Threat Landscape entries (added 2025)
  { term: "APT40", full: "Advanced Persistent Threat 40", category: "doctrine", definition: "Chinese state-sponsored cyber espionage group (linked to Hainan State Security Department) known for rapid exploitation of vulnerabilities and heavy targeting of Australian defence and maritime sectors.", whyItMatters: "One of the most active and capable groups against Australian networks. Frequently referenced when discussing current Chinese cyber threats to the ADF and defence industry." },
  { term: "Volt Typhoon", full: "Volt Typhoon", category: "doctrine", definition: "Chinese state-sponsored group specialising in long-term pre-positioning inside critical infrastructure networks (energy, water, transport, ports) using living-off-the-land techniques to prepare for potential disruptive effects in a future conflict.", whyItMatters: "Considered one of the highest strategic cyber threats to Australia. Demonstrates the shift from espionage to preparation for wartime effects on civilian and military infrastructure." },
  { term: "Salt Typhoon", full: "Salt Typhoon", category: "doctrine", definition: "Chinese cyber espionage group focused on compromising telecommunications providers to gain access to backbone networks, subscriber data, and communications infrastructure.", whyItMatters: "Direct threat to Australia's critical communications networks. Highlights the vulnerability of national infrastructure to state actors seeking persistent access." },
  { term: "Living off the Land", full: "Living off the Land (LOTL)", category: "doctrine", definition: "A technique where attackers use legitimate, built-in operating system tools (PowerShell, WMI, etc.) instead of custom malware to stay stealthy and evade detection.", whyItMatters: "The dominant tactic used by sophisticated groups like Volt Typhoon. Understanding LOTL is essential for modern cyber defence and threat hunting." },
  { term: "Essential Eight", full: "ASD Essential Eight", category: "doctrine", definition: "Australia's baseline set of mitigation strategies (application control, patching, multi-factor authentication, etc.) recommended by the Australian Signals Directorate to protect against cyber threats.", whyItMatters: "The primary defensive framework used across Australian government and industry. Demonstrates you understand practical cyber hygiene and risk reduction." },
  { term: "Pre-positioning", full: "Cyber Pre-positioning", category: "doctrine", definition: "The act of gaining and maintaining long-term access inside an adversary's networks in preparation for future disruptive or destructive operations.", whyItMatters: "The core concern with groups like Volt Typhoon. It shifts the threat from data theft to the potential for effects on critical services during conflict." },
  { term: "ASD", full: "Australian Signals Directorate", category: "orgs", definition: "Australia's national signals intelligence and cyber security agency, responsible for foreign signals intelligence, cyber threat intelligence, and protecting government networks.", whyItMatters: "The lead agency for cyber defence and offensive cyber effects. Critical knowledge for anyone applying to Cyber Warfare Officer or related intelligence roles." },
  { term: "REDSPICE", full: "Resilience, Effects, Defence, Space, Intelligence, Cyber, Enablers", category: "doctrine", definition: "Australia's major ~$10 billion program to significantly expand ASD and ADF cyber capabilities, including offensive effects, persistent hunt teams, and workforce growth.", whyItMatters: "The flagship investment in Australia's cyber warfighting capability. Shows understanding of current capability development priorities." },
  { term: "Cyber Command", full: "ADF Cyber Command", category: "orgs", definition: "The tri-service organisation established in 2024 responsible for generating and sustaining ADF cyber capability and integrating cyber effects across all domains.", whyItMatters: "The central organisation for military cyber operations. Relevant when discussing how the ADF organises for operations in the fifth domain." },

  // Additional technical & prevention terms from expanded Cyberspace content
  { term: "Supply Chain Attack", full: "Supply Chain Attack", category: "doctrine", definition: "A cyber attack that targets an organisation indirectly by compromising a third-party vendor, software provider, or service used by the target.", whyItMatters: "One of the most effective techniques used by advanced groups (including APT41). Demonstrates understanding of modern attack vectors beyond direct network intrusion." },
  { term: "Zero Trust", full: "Zero Trust Architecture", category: "doctrine", definition: "A security model that assumes no user, device, or network is trusted by default and requires continuous verification for every access request.", whyItMatters: "A key modern defensive concept. Frequently discussed as a response to sophisticated persistent threats and the limitations of traditional perimeter-based security." },
  { term: "Network Segmentation", full: "Network Segmentation", category: "doctrine", definition: "Dividing a computer network into smaller, isolated segments to limit lateral movement and contain breaches.", whyItMatters: "One of the most effective controls against pre-positioning threats like Volt Typhoon. Shows you understand practical network defence beyond basic perimeter security." },
  { term: "Behavioural Analytics", full: "Behavioural Analytics (Cyber)", category: "doctrine", definition: "The use of machine learning and statistical analysis to detect anomalies in user or system behaviour that may indicate a cyber attack.", whyItMatters: "Critical for detecting living-off-the-land and other stealthy techniques used by advanced state actors. A core capability in modern Security Operations Centres." },
  { term: "Application Control", full: "Application Control", category: "doctrine", definition: "A security control that only allows approved software to run on systems, preventing unauthorised or malicious executables from executing.", whyItMatters: "One of the most effective controls in the Essential Eight. Particularly strong against commodity malware and some advanced persistent threats." },
  { term: "Conditional Access", full: "Conditional Access", category: "doctrine", definition: "A security feature (commonly in cloud environments) that enforces access policies based on signals such as user location, device health, risk level, and time of access.", whyItMatters: "A key component of modern identity and access management. Demonstrates understanding of cloud security controls used across Australian government and defence." },
  { term: "MFA", full: "Multi-Factor Authentication", category: "doctrine", definition: "A security process that requires users to provide two or more verification factors to gain access to a system or application.", whyItMatters: "One of the highest-impact controls against credential-based attacks. Almost universally recommended in every cyber security framework." },
  { term: "Critical Infrastructure", full: "Critical Infrastructure", category: "doctrine", definition: "Physical and digital systems and assets so vital that their incapacitation or destruction would have a debilitating effect on national security, economy, or public safety.", whyItMatters: "The primary target set for pre-positioning threats like Volt Typhoon. Central to national resilience and cyber defence strategy discussions." },
  { term: "Third-Party Risk", full: "Third-Party / Vendor Risk", category: "doctrine", definition: "The risk an organisation faces when it relies on external vendors, contractors, or service providers that may have weaker security controls.", whyItMatters: "A major attack vector for state actors. Understanding third-party risk management is increasingly important for anyone working in defence capability or cyber roles." },
  { term: "Offensive Cyber Effects", full: "Offensive Cyber Effects", category: "doctrine", definition: "Operations conducted in cyberspace to deny, degrade, disrupt, or destroy adversary capabilities, systems, or decision-making processes.", whyItMatters: "The offensive side of military cyber operations. Relevant when discussing the full spectrum of cyber power and how it integrates with conventional operations." },

  // Additional technical sensor/platform terms for in-context tooltips
  { term: "CEAFAR", full: "CEA Active Phased Array Radar", category: "sensors", definition: "Australian-designed active phased array radar (developed by CEA Technologies) originally fitted to Anzac-class frigates during the ASMD upgrade. Provides 3D air and surface search and tracking.", whyItMatters: "Australia's first major sovereign radar system on major surface combatants. Understanding the progression from the original CEAFAR to the more advanced CEAFAR2 family demonstrates the growth of local industry and ADF capability." },
  { term: "CEAMOUNT", full: "CEA Multi-function Array", category: "sensors", definition: "The companion fire-control radar to CEAFAR on upgraded Anzac-class ships. Provides high-precision tracking and supports missile guidance/illumination for ESSM engagements.", whyItMatters: "Works in tandem with CEAFAR to deliver modern point and limited area air defence. Key part of the story of how the RAN upgraded its existing fleet to counter sea-skimming missile threats." },
  { term: "SPS-49", full: "AN/SPS-49 Long-Range Air Search Radar", category: "sensors", definition: "Legacy US 2D long-range air search radar that was the primary radar on the original Anzac-class frigates before the ASMD/AMCAP upgrades replaced it with the Australian CEAFAR2-L.", whyItMatters: "The 'old' radar that the locally developed CEAFAR2-L was designed to supersede. Highlights the performance leap from traditional rotating radars to modern AESA technology in the RAN." },
  { term: "AMCAP", full: "Anzac Mid-life Capability Assurance Program", category: "platforms", definition: "The mid-life upgrade program for the Anzac-class that installed the CEAFAR2-L radar, enhanced combat system integration, and other improvements to maintain relevance until the Hunter-class enters service.", whyItMatters: "Demonstrates the ADF's approach of extending platform life through smart, targeted upgrades rather than immediate full replacement." },
  { term: "ASMD", full: "Anti-Ship Missile Defence (upgrade)", category: "doctrine", definition: "The upgrade program (and resulting capability) focused on improving detection, tracking, and engagement of incoming anti-ship missiles, especially low-flying sea-skimming threats.", whyItMatters: "The specific driver for fitting CEAFAR and CEAMOUNT to the Anzac class. Essential context for understanding the evolution of RAN surface combatant air defence." },
  { term: "C-27J", full: "Alenia C-27J Spartan", category: "platforms", definition: "RAAF tactical battlefield airlifter (No. 35 Sqn at Amberley). Operates from short/unprepared strips, carries troops/light vehicles/pallets in support of Army and amphibious ops. Nicknamed 'Magnificent Seven'.", whyItMatters: "Bridges heavy airlifters and utility aircraft. Frequently supports LHD operations, disaster relief, and Army mobility. Key for understanding RAAF's role in joint amphibious and regional engagement." },
  { term: "C-130J", full: "C-130J Hercules", category: "platforms", definition: "RAAF medium tactical airlifter (No. 37 Sqn at Richmond). The versatile workhorse for troops, vehicles, airdrops, medevac and humanitarian support. Operates from short/unprepared strips.", whyItMatters: "The most common RAAF airlift asset for intra-theatre movement and Army support. Essential context for joint logistics, disaster relief, and how the ADF sustains operations across Australia and the region." },
  { term: "M1A1", full: "M1A1 Abrams", category: "platforms", definition: "Australian Army's main battle tank (1st Armoured Regiment). 70-tonne heavy armour with 120mm gun, composite/reactive armour, and high mobility for its size. Air-transportable in limited numbers by C-17 and sling by Chinook.", whyItMatters: "Provides the ADF's heaviest direct fire and breakthrough capability. RAAF crews (Chinook, C-17, C-27J) must understand its weight, dimensions, and recovery needs for joint amphibious and manoeuvre operations." },
  { term: "Chinook", full: "CH-47F Chinook", category: "platforms", definition: "RAAF's heavy-lift helicopter (No. 12 Squadron). Primary asset for moving M1 Abrams tanks, M777 howitzers, HIMARS, troops, and supplies in support of Army and LHD amphibious operations.", whyItMatters: "The only helicopter in the ADF inventory capable of lifting heavy armoured vehicles. Critical for RAAF-Army integration in manoeuvre and amphibious warfare." },
  { term: "C-17A", full: "C-17A Globemaster III", category: "platforms", definition: "RAAF's heavy strategic transport aircraft. Can carry M1 Abrams tanks, helicopters, large vehicles and troops over intercontinental distances with strategic airlift.", whyItMatters: "Enables rapid deployment of heavy Army equipment and sustainment. RAAF crews must understand its capabilities for joint logistics and amphibious support planning." },
  { term: "KC-30A", full: "KC-30A MRTT", category: "platforms", definition: "RAAF multi-role tanker transport based on the A330. Provides air-to-air refuelling for F-35A, Super Hornet, Growler and Wedgetail, greatly extending their range and endurance.", whyItMatters: "Force multiplier for strike, EW and AEW&C packages. Essential for understanding how the RAAF projects power over the vast Indo-Pacific." },

  // Common naval ship/submarine designators (appear in desig fields on cards)
  { term: "FFH", full: "Frigate, Helicopter", category: "platforms", definition: "General-purpose frigate equipped with helicopter facilities (hangar and flight deck). In RAN, the Anzac-class and future Hunter-class are FFH.", whyItMatters: "Standard RAN surface combatant type optimized for ASW and general escort duties with organic air capability." },
  { term: "SSK", full: "Submarine, Diesel-Electric (Hunter-Killer)", category: "platforms", definition: "Diesel-electric attack submarine designed primarily to hunt other submarines and surface ships. Collins-class are SSKs.", whyItMatters: "Current RAN submarine type; quiet when running on battery but limited endurance compared to nuclear boats." },
  { term: "LSD", full: "Landing Ship, Dock", category: "platforms", definition: "Amphibious ship with a floodable well dock for landing craft, vehicle decks, and helicopter facilities. Choules is LSD.", whyItMatters: "Provides secondary amphibious lift alongside the larger LHDs." },
  { term: "FFG", full: "Frigate, Guided Missile", category: "platforms", definition: "Guided-missile frigate (US/NATO designation). Hobart-class were originally FFGs before re-designation as DDGs in some contexts, but the term is still used generically.", whyItMatters: "Common allied surface escort type." },
  { term: "SSN", full: "Submarine, Nuclear-powered (Attack)", category: "platforms", definition: "Nuclear-powered attack submarine. Unlimited submerged endurance, high speed, large payload. Virginia-class and future SSN-AUKUS are SSNs.", whyItMatters: "The future backbone of RAN under AUKUS; dramatically changes Australia's undersea strike and ISR reach." },
  { term: "LHD", full: "Landing Helicopter Dock", category: "platforms", definition: "Large amphibious assault ship with full flight deck/hangar for helicopters and a well dock for landing craft. Canberra-class are LHDs.", whyItMatters: "Primary RAN amphibious warfare platforms; central to joint operations with Army and RAAF support aircraft." },
  { term: "DDG", full: "Destroyer, Guided Missile", category: "platforms", definition: "Guided-missile destroyer — larger, more capable than frigate, typically with area air-defence systems like Aegis. Hobart-class are DDGs.", whyItMatters: "High-end surface combatants for task group air defence and strike." },
  { term: "SSBN", full: "Submarine, Ballistic Missile, Nuclear", category: "platforms", definition: "Nuclear-powered ballistic missile submarine (strategic deterrent). Not currently in RAN service.", whyItMatters: "Represents the highest end of undersea strategic strike; relevant for understanding allied (US/UK) capabilities under AUKUS." }
];


// ---------- WEAPONS & MUNITIONS ----------
// Grouped for clarity: australian-strike | australian-fleet | defensive | adversary
const WEAPONS = [
  // ============================================
  // AUSTRALIAN STRIKE WEAPONS (RAAF air-launched)
  // ============================================
  {
    id: "aim120",
    desig: "AIM-120",
    name: "AMRAAM",
    type: "Air-to-Air",
    group: "air-to-air",
    tagline: "The RAAF's primary beyond-visual-range air-to-air missile. 'Fire and forget' radar-guided weapon.",
    img: "images/aim120.jpg",
    stats: [
      { k: "Range", v: "~100+ km" },
      { k: "Speed", v: "Mach 4" },
      { k: "Guidance", v: "Active Radar" },
      { k: "Platforms", v: "F-35A, F/A-18F, EA-18G" }
    ],
    overview: "The AIM-120 Advanced Medium-Range Air-to-Air Missile (AMRAAM) is the RAAF's standard beyond-visual-range (BVR) air-to-air missile. It uses inertial navigation with mid-course updates from the launching aircraft's radar, then activates its own active radar seeker for terminal homing. This 'fire and forget' capability allows the pilot to engage other targets or manoeuvre defensively after launch.",
    systems: [
      { name: "Active Radar Seeker", code: "Seeker", desc: "The missile's own radar that activates in the terminal phase, allowing true fire-and-forget employment without the launch aircraft needing to maintain lock.", layman: "Once the missile gets close, it turns on its own radar and finds the target itself — the pilot can fly away or engage someone else." },
      { name: "Inertial + Data Link Guidance", code: "Midcourse", desc: "Uses inertial navigation plus two-way data link updates from the launching aircraft or other platforms (e.g. Wedgetail) to fly an optimised intercept course.", layman: "The missile gets constant course corrections from the aircraft or AWACS while it's flying, so it arrives in the right place to start its own search." },
      { name: "High-Explosive Warhead + Proximity Fuze", code: "Warhead", desc: "Blast-fragmentation warhead with a proximity fuze optimised for destroying fast-moving aircraft and cruise missiles.", layman: "It doesn't need a direct hit — it explodes near the target and shreds it with high-speed fragments." }
    ],
    tags: ["BVR", "Fire & Forget", "F-35A", "Super Hornet", "Growler"]
  },
  {
    id: "aim9x",
    desig: "AIM-9X",
    name: "Sidewinder",
    type: "Air-to-Air",
    group: "air-to-air",
    tagline: "Short-range, highly manoeuvrable infrared-guided 'dogfight' missile with helmet cueing and off-boresight capability.",
    img: "images/aim9x.jpg",
    stats: [
      { k: "Range", v: "~35 km" },
      { k: "Speed", v: "Mach 2.5+" },
      { k: "Guidance", v: "Imaging IR + Helmet Cue" },
      { k: "Platforms", v: "F-35A, F/A-18F, EA-18G" }
    ],
    overview: "The AIM-9X is the latest generation of the legendary Sidewinder short-range air-to-air missile. It features a high off-boresight seeker, thrust vectoring for extreme manoeuvrability, and full integration with the pilot's helmet-mounted sight, allowing the pilot to simply look at a target and fire.",
    systems: [
      { name: "Imaging Infrared Seeker", code: "IIR", desc: "High-resolution focal plane array seeker that can track targets from any angle, including from behind, with excellent resistance to flares and decoys.", layman: "A smart heat-seeking camera that can see the target from almost any direction and isn't easily fooled by flares." },
      { name: "Thrust Vectoring Control", code: "TVC", desc: "The missile's rocket motor nozzles can swivel, giving it the ability to make extremely tight turns immediately after launch.", layman: "The back end can point in different directions, letting the missile turn corners that older missiles couldn't." },
      { name: "Helmet-Mounted Sight Integration", code: "HMS", desc: "The missile can be slaved to the pilot's helmet cueing system, allowing high off-boresight shots without having to point the nose of the aircraft at the target.", layman: "You can look to the side, see the enemy on your helmet display, and fire the missile without having to turn the whole plane toward them." }
    ],
    tags: ["WVR", "Dogfight", "Off-Boresight", "F-35A", "Growler"]
  },
  {
    id: "jsm",
    desig: "JSM",
    name: "Joint Strike Missile",
    type: "Air-to-Surface",
    group: "air-to-surface",
    tagline: "Stealthy, long-range anti-ship and land-attack cruise missile designed specifically for internal carriage on the F-35A.",
    img: "images/jsm.jpg",
    stats: [
      { k: "Range", v: "250+ km" },
      { k: "Speed", v: "High Subsonic" },
      { k: "Guidance", v: "IIR + GPS/INS" },
      { k: "Platforms", v: "F-35A (internal)" }
    ],
    overview: "The Kongsberg Joint Strike Missile (JSM) is a next-generation stealthy cruise missile developed for the F-35. It can be carried internally in the F-35A's weapons bays (preserving stealth) and is capable of striking both ships and land targets at long range. It features advanced imaging infrared guidance, terrain-following capability, and a two-way data link for in-flight retargeting.",
    systems: [
      { name: "Imaging Infrared Seeker", code: "IIR", desc: "A high-resolution infrared camera in the nose that can identify specific ships or buildings even in poor weather or against cluttered backgrounds.", layman: "A smart camera that can pick out the exact target it was told to hit, even if there are many ships or buildings nearby." },
      { name: "Internal Carriage on F-35A", code: "Stealth", desc: "Designed from the start to fit inside the F-35's internal weapons bay, allowing the aircraft to remain low-observable while carrying a potent stand-off weapon.", layman: "The missile hides inside the F-35 so enemy radars can't see it coming until it's too late." },
      { name: "Two-Way Data Link", code: "Link", desc: "Allows the launching aircraft or other platforms to update the target or abort the mission after launch.", layman: "You can still talk to the missile after you fire it and tell it to change targets or cancel if the situation changes." }
    ],
    tags: ["Stealth", "Anti-Ship", "Land Attack", "F-35A", "Stand-off"]
  },
  {
    id: "jdam",
    desig: "JDAM",
    name: "Joint Direct Attack Munition",
    type: "Air-to-Surface",
    group: "air-to-surface",
    tagline: "GPS-guided kit that turns ordinary 'dumb' bombs into precision weapons in all weather, day or night.",
    img: "images/jdam.jpg",
    stats: [
      { k: "Accuracy", v: "< 5 m CEP" },
      { k: "Range", v: "15–30 km (glide)" },
      { k: "All-Weather", v: "Yes (GPS/INS)" },
      { k: "Platforms", v: "F-35A, F/A-18F, Hawk" }
    ],
    overview: "JDAM (Joint Direct Attack Munition) is a low-cost guidance kit fitted to existing unguided bombs (Mk 82 500 lb, Mk 83 1,000 lb, Mk 84 2,000 lb). It adds a GPS/INS guidance section and tail fins, converting 'dumb' bombs into highly accurate all-weather precision weapons. The RAAF uses JDAM extensively on the F-35A and Super Hornet.",
    systems: [
      { name: "GPS / INS Guidance", code: "Guidance", desc: "Combines satellite navigation with an internal inertial navigation system. If GPS is jammed, the INS continues to guide the weapon to the target coordinates.", layman: "It uses satellites to know exactly where it is, and if the satellites are blocked it uses its own internal 'dead reckoning' to keep going." },
      { name: "Tail Control Fins", code: "Control", desc: "Movable fins that steer the bomb in flight, allowing it to glide toward the target from significant standoff ranges.", layman: "Small wings on the back that let the bomb steer itself like a tiny aircraft toward the GPS coordinates you gave it." },
      { name: "Programmable Fuze Options", code: "Fuze", desc: "Can be set for airburst, impact, or delayed penetration fuzing depending on the target (bunkers, buildings, personnel, etc.).", layman: "You can tell the bomb whether to explode above the ground, on impact, or after it has burrowed into a building or bunker." }
    ],
    tags: ["Precision Strike", "All-Weather", "GPS", "Low Cost", "F-35A"]
  },
  {
    id: "sdb",
    desig: "GBU-39",
    name: "Small Diameter Bomb",
    type: "Air-to-Surface",
    group: "air-to-surface",
    tagline: "Lightweight precision glide bomb that allows the F-35A to carry up to eight weapons internally while remaining stealthy.",
    img: "images/sdb.jpg",
    stats: [
      { k: "Weight", v: "250 lb (113 kg)" },
      { k: "Range", v: "~110 km (glide)" },
      { k: "Accuracy", v: "< 1 m CEP" },
      { k: "Internal Load", v: "Up to 8 on F-35A" }
    ],
    overview: "The GBU-39 Small Diameter Bomb (SDB) dramatically increases the number of precision strikes a single stealth fighter can deliver on one mission. The F-35A can carry eight of them internally in two four-round racks while preserving its low-observable signature.",
    systems: [
      { name: "GPS/INS with Anti-Jam", code: "Guidance", desc: "Highly accurate GPS guidance backed by inertial navigation and anti-jamming features for use in contested electromagnetic environments.", layman: "Very precise navigation that keeps working even when the enemy tries to jam GPS signals." },
      { name: "DiamondBack Wing Kit", code: "Wings", desc: "Fold-out wings that deploy after release, giving the small bomb a surprisingly long glide range from high altitude.", layman: "Wings pop out so the bomb can glide a very long way after being dropped from high up." },
      { name: "Multi-Purpose Penetrating Warhead", code: "Warhead", desc: "Compact blast-fragmentation/penetrating warhead effective against a wide range of targets from personnel and light vehicles to bunkers and hardened aircraft shelters.", layman: "One small warhead that can do many different jobs instead of needing lots of different bomb types." }
    ],
    tags: ["Precision", "Stand-off", "Stealth Carrier", "F-35A", "High Quantity"]
  },
  {
    id: "jsow",
    desig: "AGM-154",
    name: "JSOW",
    type: "Air-to-Surface",
    group: "air-to-surface",
    tagline: "Stand-off glide weapon family that can deliver submunitions or a unitary penetrating warhead from long range.",
    img: "images/jsow.jpg",
    stats: [
      { k: "Range", v: "70–130 km" },
      { k: "Weight", v: "~450–500 kg" },
      { k: "Guidance", v: "GPS/INS (+ IIR on C variant)" },
      { k: "Platforms", v: "F/A-18F, F-35A" }
    ],
    overview: "The Joint Standoff Weapon (JSOW) allows aircraft to attack defended targets from well outside most point-defence systems. Different variants carry different payloads, from sensor-fuzed anti-armour submunitions (A variant) to a precision penetrating unitary warhead (C variant).",
    systems: [
      { name: "GPS/INS Navigation", code: "Guidance", desc: "Primary all-weather guidance using GPS aided by inertial navigation for day/night, adverse weather operation.", layman: "It knows where to go using satellites and its own internal sensors." },
      { name: "Imaging Infrared Seeker (C variant)", code: "IIR", desc: "The JSOW-C adds a terminal imaging infrared seeker with automatic target recognition for precision attacks on hardened point targets.", layman: "The smart version can see the target with a camera at the end and steer itself precisely onto it." },
      { name: "BLU-108 Sensor-Fuzed Submunitions (A variant)", code: "Submunitions", desc: "The original JSOW-A dispenses BLU-108 submunitions, each containing four smart Skeet warheads designed to attack armoured vehicles from above.", layman: "It drops little smart bombs that hunt tanks from the sky." }
    ],
    tags: ["Stand-off", "Glide Weapon", "Multi-Role", "F-35A"]
  },
  {
    id: "slam-er",
    desig: "AGM-84H",
    name: "SLAM-ER",
    type: "Air-to-Surface",
    group: "air-to-surface",
    tagline: "Standoff Land Attack Missile – Expanded Response. Precision long-range cruise missile for land targets.",
    img: "images/slam-er.jpg",
    stats: [
      { k: "Range", v: "250+ km" },
      { k: "Speed", v: "High Subsonic" },
      { k: "Guidance", v: "GPS/INS + IIR" },
      { k: "Platforms", v: "F/A-18F Super Hornet" }
    ],
    overview: "SLAM-ER is the long-range, precision land-attack version of the Harpoon family. It gives the Super Hornet a true standoff strike capability against high-value land targets, with man-in-the-loop retargeting via a two-way data link and an imaging infrared seeker for terminal accuracy. It remains an important weapon while JSM reaches full operational capability on the F-35A.",
    systems: [
      { name: "Imaging Infrared Seeker + Data Link", code: "IIR + Link", desc: "The missile transmits live imagery back to the launching aircraft, allowing the crew to confirm the target and even retarget in flight if the situation changes.", layman: "You can watch through the missile's camera as it flies and steer it onto the exact building or bunker you want." },
      { name: "GPS/INS with Terrain Reference", code: "Navigation", desc: "Combines satellite guidance with inertial navigation and terrain reference updates for accuracy even in GPS-denied environments.", layman: "It knows where it is by matching the ground it flies over against a stored map if satellites are jammed." }
    ],
    tags: ["Stand-off", "Land Attack", "Super Hornet", "Precision"]
  },
  {
    id: "harm",
    desig: "AGM-88",
    name: "HARM",
    type: "Air-to-Surface",
    group: "air-to-surface",
    tagline: "High-speed anti-radiation missile designed to home in on and destroy enemy radar emitters.",
    img: "images/harm.jpg",
    stats: [
      { k: "Speed", v: "Mach 2+" },
      { k: "Range", v: "~150 km" },
      { k: "Guidance", v: "Passive Radar" },
      { k: "Platforms", v: "EA-18G Growler (primary)" }
    ],
    overview: "The AGM-88 High-speed Anti-Radiation Missile (HARM) is the primary SEAD weapon of the EA-18G Growler. It passively detects radar emissions, locks on, and flies at very high speed to destroy the radar antenna and associated equipment. Modern variants include improved counter-countermeasures and the ability to remember the location of a radar even if it turns off.",
    systems: [
      { name: "Passive Radar Homing", code: "Seeker", desc: "The missile does not emit any signals of its own. It simply listens for enemy radar transmissions and flies toward the source.", layman: "It is completely silent — it just listens for enemy radars and then races straight at them at over twice the speed of sound." },
      { name: "Home-On-Jam / Location Memory", code: "Advanced", desc: "Later HARM variants can continue to the last known location even if the radar shuts down, and can resist some electronic countermeasures.", layman: "Even if the radar operator turns off the radar when they see the missile coming, the HARM still remembers where it was and keeps going." }
    ],
    tags: ["SEAD", "Anti-Radar", "Growler", "Suppression"]
  },
  {
    id: "harpoon-nsm",
    desig: "AGM-84 / NSM",
    name: "Harpoon / Naval Strike Missile",
    type: "Air-to-Surface",
    group: "air-to-surface",
    tagline: "Long-range, sea-skimming anti-ship missile. The RAAF is transitioning from legacy Harpoon to the stealthier, more capable Naval Strike Missile.",
    img: "images/harpoon-nsm.jpg",
    stats: [
      { k: "Range", v: "120–180+ km" },
      { k: "Speed", v: "High Subsonic" },
      { k: "Guidance", v: "Active Radar (Harpoon) / IIR (NSM)" },
      { k: "Platforms", v: "P-8A, F/A-18F (also RAN ships)" }
    ],
    overview: "The Harpoon has been the RAAF's primary anti-ship weapon for decades. Australia is now introducing the more advanced Norwegian Naval Strike Missile (NSM), which offers better stealth shaping, an imaging infrared seeker, and secondary land-attack capability. The same NSM is also fitted to Hobart-class and upgraded Anzac-class ships.",
    systems: [
      { name: "Active Radar Seeker (Harpoon)", code: "Radar", desc: "The missile flies low over the water and activates its own radar in the terminal phase to find and home in on ships.", layman: "It skims the waves, then turns on its radar at the last minute to find the target ship." },
      { name: "Imaging Infrared Seeker (NSM)", code: "IIR", desc: "The NSM uses a high-resolution infrared camera and advanced target recognition algorithms, making it much harder to decoy than traditional radar-guided missiles.", layman: "It has a smart camera in the nose that can recognise the shape of ships and is very hard to fool with decoys." },
      { name: "Sea-Skimming Low-Altitude Profile", code: "Profile", desc: "Both missiles fly at very low altitude for most of their flight to remain below enemy radar horizons for as long as possible.", layman: "They fly so low that ship radars often can't see them until it's almost too late." }
    ],
    tags: ["Anti-Ship", "Sea Skimming", "P-8A", "Super Hornet", "NSM", "Fleet"]
  },
  {
    id: "apkws",
    desig: "APKWS",
    name: "Advanced Precision Kill Weapon System",
    type: "Air-to-Surface",
    group: "air-to-surface",
    tagline: "Laser-guided 70 mm (2.75 inch) rocket that turns cheap unguided rockets into low-cost precision weapons.",
    img: "images/apkws.jpg",
    stats: [
      { k: "Range", v: "~5–8 km" },
      { k: "Warhead", v: "~2–4 kg" },
      { k: "Guidance", v: "Semi-Active Laser" },
      { k: "Cost", v: "Very low per shot" }
    ],
    overview: "APKWS adds a laser guidance kit between the motor and warhead of standard 70 mm Hydra rockets. This gives helicopters and light fixed-wing aircraft a cheap, high-volume precision weapon ideal for engaging soft targets, personnel, and light vehicles.",
    systems: [
      { name: "Distributed Aperture Semi-Active Laser Seeker", code: "DASL", desc: "Four small laser sensors around the nose that detect the laser spot designated by the launching aircraft or ground forces and steer the rocket toward it.", layman: "Small sensors that find the laser dot someone is pointing at the target and steer the rocket toward it." },
      { name: "Mid-Body Control Fins", code: "Control", desc: "Pop-out control fins located in the guidance section provide steering without changing the rocket motor or warhead.", layman: "Fins that pop out in the middle to steer the rocket after it's been fired." }
    ],
    tags: ["Low Cost", "Precision", "High Volume", "Helicopters", "MH-60R"]
  },
  {
    id: "hellfire",
    desig: "AGM-114",
    name: "Hellfire",
    type: "Air-to-Surface",
    group: "air-to-surface",
    tagline: "Heavy anti-armour and multi-role missile carried by the MH-60R Seahawk for precision strikes against vehicles, small boats, and bunkers.",
    img: "images/hellfire.jpg",
    stats: [
      { k: "Range", v: "~8–11 km" },
      { k: "Warhead", v: "~8–9 kg tandem HEAT" },
      { k: "Guidance", v: "Semi-Active Laser / Radar (Longbow)" },
      { k: "Platforms", v: "MH-60R Seahawk" }
    ],
    overview: "The Hellfire is the primary heavy precision weapon for the RAN's MH-60R helicopters. It can destroy tanks, small vessels, and fortified positions with high accuracy while the helicopter remains at a safe standoff distance.",
    systems: [
      { name: "Semi-Active Laser Homing", code: "SAL", desc: "The missile homes in on a laser spot designated by the launching helicopter or another platform (ground or air).", layman: "Someone points a laser at the target and the missile flies straight to the dot." },
      { name: "Tandem Shaped-Charge Warhead", code: "Warhead", desc: "Two shaped charges in sequence. The first defeats explosive reactive armour; the second penetrates the main armour of the target.", layman: "A two-part explosive that first clears the tank's extra armour, then punches through the real armour underneath." },
      { name: "Millimetre-Wave Radar Seeker (Longbow variant)", code: "MMW", desc: "Radar-guided fire-and-forget variant that allows the helicopter to launch and immediately take evasive action or engage other targets.", layman: "A radar version that can be fired and then forgotten while the helicopter hides or shoots at something else." }
    ],
    tags: ["Anti-Armour", "Precision", "MH-60R", "Helicopter"]
  },
  {
    id: "mk54",
    desig: "Mk 54",
    name: "Lightweight Torpedo",
    type: "Maritime",
    group: "air-to-surface",
    tagline: "The primary anti-submarine weapon dropped by P-8A Poseidon and MH-60R Seahawk helicopters.",
    img: "images/mk54.jpg",
    stats: [
      { k: "Diameter", v: "324 mm (12.75\")" },
      { k: "Speed", v: "40+ knots" },
      { k: "Range", v: "~10 km" },
      { k: "Platforms", v: "P-8A, MH-60R" }
    ],
    overview: "The Mk 54 Lightweight Torpedo is the standard air-dropped ASW weapon used by the RAAF's P-8A Poseidon and the RAN's MH-60R Seahawk. It combines a proven lightweight torpedo body with modern digital sonar processing and a sophisticated guidance system that allows it to hunt submarines autonomously after entering the water.",
    systems: [
      { name: "Active / Passive Sonar Homing", code: "Sonar", desc: "Uses both active pinging and passive listening to detect, classify, and home in on submarine targets in shallow and deep water.", layman: "It can listen for the sub's noise or send out its own pings to find the submarine, then chase it down." },
      { name: "Air-Dropped Delivery", code: "Delivery", desc: "Dropped from altitude by P-8A or MH-60R. A parachute or high-altitude release system slows it before water entry to protect the weapon.", layman: "The aircraft drops it from high up; it slows down with a parachute or special mechanism so it doesn't smash when it hits the water." },
      { name: "Counter-Countermeasure Logic", code: "CCM", desc: "Advanced software to resist submarine countermeasures such as decoys, noisemakers, and evasive manoeuvres.", layman: "It is smart enough not to be fooled by the tricks a submarine uses to try to escape (like launching decoys that make fake noise)." }
    ],
    tags: ["ASW", "Torpedo", "P-8A", "MH-60R", "Lightweight"]
  },
  {
    id: "tomahawk",
    desig: "Tomahawk",
    name: "Land Attack Cruise Missile",
    type: "Land Attack",
    group: "air-to-surface",
    tagline: "Long-range, subsonic cruise missile integrated on Hobart-class destroyers and future AUKUS SSNs (also air-launched in some allied configurations).",
    img: "images/tomahawk.jpg",
    stats: [
      { k: "Range", v: "1,500–2,500+ km" },
      { k: "Speed", v: "High Subsonic" },
      { k: "Guidance", v: "GPS/INS + TERCOM + DSMAC" },
      { k: "Platforms", v: "Hobart-class, Virginia-class (future), SSN-AUKUS (future)" }
    ],
    overview: "The Tomahawk Land Attack Missile (TLAM) is a long-range, highly accurate subsonic cruise missile. Australia is acquiring Tomahawk for the Hobart-class destroyers (first live firings conducted in 2024) and it will also arm the future Virginia-class and SSN-AUKUS submarines. It provides a sovereign, long-range precision strike capability from both surface and sub-surface platforms.",
    systems: [
      { name: "TERCOM + DSMAC Guidance", code: "Navigation", desc: "Terrain Contour Matching (TERCOM) and Digital Scene Matching Area Correlator (DSMAC) allow the missile to navigate accurately even when GPS is denied by comparing the terrain and visual scene against stored maps.", layman: "It flies low following the shape of the ground and can recognise landmarks visually, so it can still hit the target even if satellites are jammed." },
      { name: "Block V Variants", code: "Modern", desc: "Newer Block V Tomahawks have improved navigation, communications, and the ability to strike moving maritime targets in some configurations.", layman: "The latest versions are smarter and more flexible than the old ones used in the 1990s and 2000s." }
    ],
    tags: ["Long Range", "Land Attack", "Tomahawk", "Hobart-class", "AUKUS", "Fleet"]
  },

  // ============================================
  // AUSTRALIAN FLEET & VESSEL WEAPONRY (RAN ships & organic helos)
  // ============================================
  {
    id: "mk48",
    desig: "Mk 48",
    name: "Heavyweight Torpedo",
    type: "Maritime",
    group: "surface-subsurface",
    tagline: "The primary heavyweight torpedo of the Collins-class submarines and future AUKUS SSNs. Wire-guided with autonomous terminal homing.",
    img: "images/mk48.jpg",
    stats: [
      { k: "Diameter", v: "533 mm (21\")" },
      { k: "Range", v: "35+ km" },
      { k: "Speed", v: "55+ knots" },
      { k: "Warhead", v: "~295 kg" }
    ],
    overview: "The Mk 48 Mod 7 CBASS is Australia's heavyweight anti-submarine and anti-surface torpedo. Carried by Collins-class boats (and future SSNs), it is wire-guided for the majority of its run, giving the submarine full control and the ability to update the target solution. In the terminal phase it switches to active/passive sonar homing. It is one of the most capable heavyweight torpedoes in the world and remains central to Australian undersea warfare.",
    systems: [
      { name: "Wire-Guided Command + Autonomous Homing", code: "Guidance", desc: "The submarine sends steering commands down a thin fibre-optic or copper wire for most of the run. The torpedo can then go active or passive sonar for the final attack.", layman: "The sub steers the torpedo like a remote-controlled car until the last few kilometres, then the torpedo wakes up and finishes the job itself." },
      { name: "Advanced Counter-Countermeasures", code: "CCM", desc: "Sophisticated signal processing and tactics to defeat submarine decoys, noisemakers, and evasive manoeuvres.", layman: "It is very hard for a submarine to fool once the torpedo is in the water." }
    ],
    tags: ["Heavyweight", "ASW", "Anti-Surface", "Collins", "AUKUS", "SSN"]
  },
  {
    id: "mu90",
    desig: "MU90",
    name: "Impact Lightweight Torpedo",
    type: "Maritime",
    group: "surface-subsurface",
    tagline: "European lightweight torpedo used by Hobart-class, Anzac-class and future Hunter-class ships. Primary ship-launched ASW weapon.",
    img: "images/mu90.jpg",
    stats: [
      { k: "Diameter", v: "324 mm" },
      { k: "Speed", v: "50+ knots" },
      { k: "Range", v: "~10–15 km" },
      { k: "Platforms", v: "Hobart, Anzac, Hunter (future)" }
    ],
    overview: "The MU90 Impact is the RAN's ship-launched lightweight torpedo. It is fired from triple torpedo tubes on Hobart and Anzac-class vessels and will equip the Hunter-class. It is a fast, deep-diving, highly manoeuvrable weapon with excellent counter-countermeasure performance and is considered one of the best lightweight torpedoes in service.",
    systems: [
      { name: "Active / Passive Sonar + Wake Homing", code: "Sonar", desc: "Combines traditional sonar homing with wake-homing logic that can follow the disturbed water left by a moving submarine or surface ship.", layman: "It can chase either the noise the sub makes or the bubble trail it leaves behind." },
      { name: "High-Speed Sprint + Deep Diving", code: "Performance", desc: "Capable of speeds over 50 knots and diving to depths that defeat many older torpedo countermeasures.", layman: "Very fast and can go extremely deep — hard for a submarine to outrun or hide from." }
    ],
    tags: ["Lightweight", "Ship-Launched", "ASW", "Hobart-class", "Anzac-class"]
  },
  {
    id: "mk45",
    desig: "Mk 45",
    name: "5-inch/127mm Naval Gun",
    type: "Naval Gun",
    group: "surface-subsurface",
    tagline: "Primary surface gun on Hobart-class and Anzac-class frigates. Versatile for surface fire, naval gunfire support, and limited air defence.",
    img: "images/mk45.jpg",
    stats: [
      { k: "Calibre", v: "127 mm (5 inch)" },
      { k: "Rate of Fire", v: "16–20 rounds/min" },
      { k: "Range (surface)", v: "~24 km" },
      { k: "Platforms", v: "Hobart-class, Anzac-class" }
    ],
    overview: "The Mk 45 Mod 4 5-inch gun is the main gun armament on Australia's major surface combatants. It provides long-range surface fire, naval gunfire support for land forces, and a limited anti-air / anti-surface missile defence capability with special projectiles. It remains an important 'last resort' weapon and is frequently used for warning shots, boarding support, and HADR tasks.",
    systems: [
      { name: "Automated Loading & FCS Integration", code: "FCS", desc: "Fully automatic loading with integration into the ship's combat management system for rapid engagement of surface and shore targets.", layman: "The gun is loaded and aimed automatically once the combat system decides what to shoot at." },
      { name: "Extended Range Munitions (future)", code: "ERM", desc: "Australia is acquiring extended-range guided projectiles that will significantly increase the effective range and accuracy of the gun against land targets.", layman: "New smart shells will let the gun hit targets much farther inland with GPS precision." }
    ],
    tags: ["Naval Gunfire", "Surface Warfare", "NGFS", "Hobart", "Anzac"]
  },

  // ============================================
  // FLEET AIR & MISSILE DEFENCE SYSTEMS
  // ============================================
  {
    id: "essm",
    desig: "RIM-162",
    name: "Evolved Sea Sparrow Missile",
    type: "Surface-to-Air",
    group: "defensive",
    tagline: "Primary point-defence and limited area air-defence missile. Quad-packed in Mk 41 VLS on Hobart and Anzac-class ships.",
    img: "images/essm.jpg",
    stats: [
      { k: "Range", v: "~50 km" },
      { k: "Speed", v: "Mach 3+" },
      { k: "Guidance", v: "Semi-active + active (ESSM Block 2)" },
      { k: "VLS Packing", v: "4 per cell" }
    ],
    overview: "ESSM is the backbone of RAN point air defence. Quad-packed in Mk 41 cells, a single Hobart-class destroyer can carry up to 128 ESSM missiles. It is highly effective against sea-skimming anti-ship missiles, aircraft, and drones. The latest Block 2 version adds an active radar seeker, giving true fire-and-forget capability.",
    systems: [
      { name: "Quad-Pack VLS Efficiency", code: "VLS", desc: "Four missiles fit in the space normally used by one larger SAM, dramatically increasing the number of ready-to-fire rounds.", layman: "One vertical tube holds four missiles instead of one — you get four times as many shots for the same deck space." },
      { name: "Active Radar Terminal Seeker (Block 2)", code: "Seeker", desc: "The missile can acquire and home on the target with its own radar in the final phase, freeing the ship's illuminators for other engagements.", layman: "The missile turns on its own radar near the target so the ship can go and shoot at something else at the same time." }
    ],
    tags: ["Point Defence", "SAM", "VLS", "Hobart-class", "Anzac-class", "ESSM"]
  },
  {
    id: "sm2",
    desig: "RIM-66",
    name: "SM-2 Medium-Range SAM",
    type: "Surface-to-Air",
    group: "defensive",
    tagline: "Medium-to-long range area air-defence missile. The main air-defence weapon of the Hobart-class Aegis destroyers.",
    img: "images/sm2.jpg",
    stats: [
      { k: "Range", v: "150+ km" },
      { k: "Speed", v: "Mach 3.5+" },
      { k: "Guidance", v: "Inertial + semi-active + mid-course updates" },
      { k: "Platforms", v: "Hobart-class (primary)" }
    ],
    overview: "The SM-2 is the workhorse area air-defence missile for the Hobart-class destroyers. It provides the outer layer of protection for a task group, engaging aircraft, cruise missiles, and some ballistic missile threats at long range. Aegis provides the fire-control solution and mid-course guidance updates via the ship's SPY-1D radar.",
    systems: [
      { name: "Aegis Mid-Course Guidance", code: "Aegis", desc: "The launching ship (or a cooperating Aegis ship) sends continuous course corrections to the missile while it is in flight, greatly extending effective range and accuracy.", layman: "The ship keeps talking to the missile in flight and steers it right up to the point where it can see the target itself." },
      { name: "Semi-Active Terminal Homing", code: "Seeker", desc: "In the final phase the missile homes on radar energy reflected from the target, which is illuminated by the ship's SPY-1D or SPG-62 illuminators.", layman: "The ship 'lights up' the target with radar and the missile flies straight to the reflection." }
    ],
    tags: ["Area Air Defence", "SAM", "Aegis", "Hobart-class", "SM-2"]
  },
  {
    id: "sm6",
    desig: "RIM-174",
    name: "SM-6 Extended Range Active Missile",
    type: "Surface-to-Air",
    group: "defensive",
    tagline: "Long-range, active-radar SAM with multi-mission capability (air defence, anti-surface, and limited ballistic missile defence).",
    img: "images/sm6.jpg",
    stats: [
      { k: "Range", v: "240+ km" },
      { k: "Speed", v: "Mach 3.5+" },
      { k: "Guidance", v: "Active radar + GPS/INS + data link" },
      { k: "Platforms", v: "Hobart-class (future integration)" }
    ],
    overview: "SM-6 is the most advanced surface-to-air missile in the US and Australian inventories. It combines the long range of SM-2 with an active radar seeker like the AIM-120, giving it true fire-and-forget performance and the ability to engage surface targets as well. Australia has approved SM-6 for the Hobart-class as part of the Aegis Baseline 9 upgrade path.",
    systems: [
      { name: "Active Radar Seeker", code: "Seeker", desc: "The missile's own radar acquires and homes on the target in the terminal phase, removing the need for continuous ship illumination.", layman: "The missile finds the target itself in the last part of the flight — the ship doesn't have to keep pointing a radar at it." },
      { name: "Multi-Mission Capability", code: "Multi-role", desc: "Can be used against aircraft, cruise missiles, surface ships, and has a limited anti-ballistic missile role.", layman: "One missile that can shoot down planes, incoming missiles, or even attack enemy ships if needed." }
    ],
    tags: ["Long Range", "Active Seeker", "Multi-Mission", "Hobart-class", "SM-6"]
  },
  {
    id: "nulka",
    desig: "Nulka",
    name: "Active Missile Decoy",
    type: "Defensive",
    group: "defensive",
    tagline: "Ship-launched active decoy that flies away from the vessel while broadcasting a powerful radar signal to lure incoming anti-ship missiles away from the real target.",
    img: "images/nulka.jpg",
    stats: [
      { k: "Flight Duration", v: "~5–8 minutes" },
      { k: "Stand-off Distance", v: "Several km from ship" },
      { k: "Role", v: "Soft-kill electronic decoy" },
      { k: "Platforms", v: "Hobart-class, Anzac-class, Hunter-class (future)" }
    ],
    overview: "Nulka is an Australian-developed active offboard decoy. Instead of just launching passive chaff, it launches a small rocket that flies out and actively pretends to be a much larger warship on enemy radar, seducing incoming missiles far away from the actual ship.",
    systems: [
      { name: "Broadband RF Repeater Payload", code: "Repeater", desc: "Receives incoming enemy radar signals and retransmits them at much higher power, making the small decoy appear as a large, attractive target to anti-ship missiles.", layman: "It listens to the enemy's radar and then shouts back a much louder fake version of the ship so the missile chases the decoy instead." },
      { name: "Rocket-Propelled Flight Vehicle", code: "Vehicle", desc: "Small rocket that rapidly carries the electronic payload away from the ship and can manoeuvre to create the best geometry for seduction.", layman: "A small rocket that flies the jammer away from the ship so the missile is drawn far from the real target." }
    ],
    tags: ["Decoy", "Soft Kill", "Ship Defence", "Hobart-class", "Australian"]
  },

  // ============================================
  // ADVERSARY WEAPONS & DEFENCE SYSTEMS
  // ============================================
  {
    id: "pl15",
    desig: "PL-15",
    name: "Long-Range AAM",
    type: "Air-to-Air",
    group: "adversary",
    tagline: "China's primary beyond-visual-range air-to-air missile. Estimated range significantly exceeds Western equivalents.",
    img: "images/pl15.jpg",
    stats: [
      { k: "Estimated Range", v: "200–300 km" },
      { k: "Speed", v: "Mach 4+" },
      { k: "Guidance", v: "Active Radar + Data Link" },
      { k: "Platforms", v: "J-20, J-16, J-10C" }
    ],
    overview: "The PL-15 is the PLAAF's premier long-range air-to-air missile. It is designed to outrange the AIM-120 and engage high-value targets such as AWACS, tankers, and strike packages from extreme distances. Its combination of range, speed, and the J-20's sensor fusion makes it a significant threat to non-stealth platforms and a serious consideration even for stealth aircraft.",
    systems: [
      { name: "Active Radar Seeker + Two-Way Data Link", code: "Seeker", desc: "The missile receives mid-course updates from the launching aircraft (or other platforms) and then activates its own active radar for terminal homing.", layman: "It gets steered most of the way by the fighter, then turns on its own radar for the kill." },
      { name: "Ramjet Propulsion (PL-15E export variant)", code: "Motor", desc: "Sustained high-speed flight gives it energy to manoeuvre in the terminal phase even at very long ranges.", layman: "It keeps its speed up for a very long time, so it is still dangerous when it arrives." }
    ],
    tags: ["BVR", "Long Range", "PLAAF", "J-20", "Threat"]
  },
  {
    id: "r37m",
    desig: "R-37M",
    name: "Axehead",
    type: "Air-to-Air",
    group: "adversary",
    tagline: "Russian very-long-range air-to-air missile designed specifically to engage AWACS, tankers and high-value assets at extreme distances.",
    img: "images/r37m.jpg",
    stats: [
      { k: "Estimated Range", v: "300+ km" },
      { k: "Speed", v: "Mach 5–6" },
      { k: "Guidance", v: "Inertial + Active Radar" },
      { k: "Platforms", v: "Su-35S, MiG-31BM" }
    ],
    overview: "The R-37M (NATO: Axehead) is one of the longest-ranged air-to-air missiles in the world. It was developed to allow Russian interceptors to engage NATO AWACS and tanker aircraft from well outside the engagement envelope of Western fighters. The Su-35S can carry it on external hardpoints.",
    systems: [
      { name: "Inertial + Active Radar Terminal", code: "Guidance", desc: "The missile flies most of the way under inertial guidance with mid-course updates, then activates its own seeker for the final attack.", layman: "It coasts for a huge distance using its memory, then wakes up and finds the target itself." },
      { name: "High-Speed Ramjet-like Motor", code: "Motor", desc: "Sustains very high speed to give the missile energy for manoeuvring at extreme ranges.", layman: "It arrives still going incredibly fast, making it hard to dodge even if you see it coming." }
    ],
    tags: ["Very Long Range", "AWACS Killer", "Russian", "Su-35", "Threat"]
  },
  {
    id: "yj18",
    desig: "YJ-18",
    name: "Supersonic ASCM",
    type: "Anti-Ship",
    group: "adversary",
    tagline: "China's primary ship-launched supersonic anti-ship cruise missile. Subsonic cruise followed by Mach 2.5–3.0 terminal sprint.",
    img: "images/yj18.jpg",
    stats: [
      { k: "Range", v: "~220–540 km (variant dependent)" },
      { k: "Speed", v: "Mach 0.8 cruise → Mach 2.5–3.0 sprint" },
      { k: "Guidance", v: "Inertial + Active Radar + IIR options" },
      { k: "Platforms", v: "Type 052D, Type 055, submarines" }
    ],
    overview: "The YJ-18 is the most numerous modern Chinese anti-ship cruise missile. It flies the majority of its route at high subsonic speed, then accelerates to supersonic speed in the terminal phase, making it extremely difficult for ship defences to intercept. It is the main surface-strike weapon of the Type 052D and Type 055 destroyers.",
    systems: [
      { name: "Supersonic Terminal Sprint", code: "Sprint", desc: "In the final 20–40 km the missile accelerates dramatically and can perform evasive manoeuvres or pop-up attacks.", layman: "It suddenly goes from 'fast' to 'almost impossible to shoot down' in the last part of the flight." },
      { name: "Sea-Skimming + Manœuvring", code: "Profile", desc: "Flies very low for most of the route and can perform high-g turns or climb-and-dive profiles to defeat CIWS.", layman: "It hides behind the radar horizon and then jinks around at the last second." }
    ],
    tags: ["Supersonic", "ASCM", "PLAN", "Type 052D", "Type 055", "Threat"]
  },
  {
    id: "yj21",
    desig: "YJ-21",
    name: "Hypersonic ASBM",
    type: "Anti-Ship Ballistic",
    group: "adversary",
    tagline: "Chinese hypersonic anti-ship ballistic missile launched from Type 055 VLS. Extreme speed and manoeuvrability make it a major threat to large surface ships.",
    img: "images/yj21.jpg",
    stats: [
      { k: "Range", v: "1,000–1,500+ km" },
      { k: "Speed", v: "Mach 6–10 (terminal)" },
      { k: "Trajectory", v: "Ballistic + manoeuvring" },
      { k: "Platforms", v: "Type 055 (VLS)" }
    ],
    overview: "The YJ-21 is a ship-launched hypersonic anti-ship ballistic missile. It follows a ballistic trajectory for most of its flight, then manoeuvres at hypersonic speed in the terminal phase, making traditional ship air-defence systems extremely challenged. It is currently the most potent 'carrier killer' weapon in the PLAN inventory.",
    systems: [
      { name: "Hypersonic Manoeuvring Re-entry Vehicle", code: "HGV", desc: "The warhead can perform high-speed lateral manoeuvres during re-entry, defeating predicted intercept solutions.", layman: "It doesn't fly in a straight line at the end — it can dodge while still going many times the speed of sound." },
      { name: "VLS Launch from Large Surface Combatants", code: "Launch", desc: "Fired vertically from the Type 055's universal VLS cells, allowing the ship to carry a mix of air-defence and strike weapons.", layman: "The big Chinese destroyers can carry these in the same tubes they use for normal missiles." }
    ],
    tags: ["Hypersonic", "ASBM", "Carrier Killer", "Type 055", "PLAN", "Major Threat"]
  },
  {
    id: "kalibr",
    desig: "3M-14 / 3M-54",
    name: "Kalibr Cruise Missile",
    type: "Cruise Missile",
    group: "adversary",
    tagline: "Russian family of land-attack and anti-ship cruise missiles. Launched from submarines, surface ships, and aircraft. Combat-proven in Syria and Ukraine.",
    img: "images/kalibr.jpg",
    stats: [
      { k: "Range (land attack)", v: "1,500–2,500 km" },
      { k: "Range (anti-ship)", v: "~220–300 km" },
      { k: "Speed", v: "High subsonic" },
      { k: "Platforms", v: "Kilo-class, Gorshkov-class, many others" }
    ],
    overview: "The Kalibr (Club) family gives Russian (and export) submarines and surface ships a long-range precision strike capability previously reserved for major powers. The 3M-14 land-attack version has been used extensively in Syria and Ukraine. The 3M-54 anti-ship variant adds a supersonic terminal sprint.",
    systems: [
      { name: "Terrain-Following + GPS/INS Guidance", code: "Navigation", desc: "Flies low using terrain reference and satellite navigation to reach targets deep inland or at sea.", layman: "It sneaks in low following the ground so it stays hidden from radar until the last moment." },
      { name: "3M-54 Anti-Ship Sprint Version", code: "Sprint", desc: "The anti-ship variant flies subsonic for most of the route then accelerates to Mach 2.5–3.0 for the terminal attack.", layman: "It looks like a normal slow missile until it suddenly goes supersonic at the end." }
    ],
    tags: ["Cruise Missile", "Kalibr", "Land Attack", "Anti-Ship", "Russian", "Proven"]
  },
  {
    id: "tsirkon",
    desig: "3M22",
    name: "Tsirkon (Zircon)",
    type: "Hypersonic",
    group: "adversary",
    tagline: "Russian hypersonic cruise missile. Mach 8–9 speed and extreme manoeuvrability make it one of the hardest weapons to defend against.",
    img: "images/tsirkon.jpg",
    stats: [
      { k: "Range", v: "~500–1,000 km" },
      { k: "Speed", v: "Mach 8–9" },
      { k: "Guidance", v: "Active radar + inertial" },
      { k: "Platforms", v: "Gorshkov-class (UKSK VLS), submarines (future)" }
    ],
    overview: "Tsirkon is Russia's most advanced hypersonic weapon currently in service. It combines sustained hypersonic speed with manoeuvrability throughout its flight profile, presenting a severe challenge to existing air and missile defence systems. It is the primary strike weapon on the Admiral Gorshkov-class frigates.",
    systems: [
      { name: "Sustained Hypersonic Flight", code: "Hypersonic", desc: "Maintains Mach 8–9 for the majority of its route, giving defenders very little reaction time.", layman: "It flies faster than almost anything that can shoot it down for almost the entire journey." },
      { name: "Manoeuvring Throughout Trajectory", code: "Manoeuvre", desc: "Unlike traditional ballistic missiles, it can change direction at hypersonic speed, defeating most current interceptors.", layman: "It doesn't follow a predictable path — it can jink and dodge while still going hypersonic." }
    ],
    tags: ["Hypersonic", "Cruise Missile", "Tsirkon", "Gorshkov-class", "Russian", "Major Threat"]
  },
  {
    id: "hhq9b",
    desig: "HHQ-9B",
    name: "Long-Range Naval SAM",
    type: "Surface-to-Air",
    group: "adversary",
    tagline: "China's primary long-range naval surface-to-air missile. Equips Type 052D and Type 055 destroyers. Comparable to SM-2 / S-300.",
    img: "images/hhq9b.jpg",
    stats: [
      { k: "Range", v: "~200+ km" },
      { k: "Speed", v: "Mach 4+" },
      { k: "Guidance", v: "Semi-active + active (later variants)" },
      { k: "Platforms", v: "Type 052D, Type 055" }
    ],
    overview: "The HHQ-9B is the PLAN's principal area air-defence missile. It provides the outer layer of protection for Chinese carrier strike groups and major surface combatants. The Type 055 can carry a very large number of these missiles in its 112-cell VLS.",
    systems: [
      { name: "Type 346 AESA Illumination & Guidance", code: "Radar", desc: "The ship's powerful flat-panel AESA radars provide target illumination and mid-course guidance for the missiles.", layman: "The big Chinese destroyers have very powerful radars that guide these missiles out to long range." },
      { name: "High Firepower Magazine", code: "VLS", desc: "A Type 055 can carry dozens of HHQ-9B missiles, giving it sustained area air-defence capacity for a carrier group.", layman: "These ships can shoot a lot of long-range missiles before they run out." }
    ],
    tags: ["Area Air Defence", "SAM", "PLAN", "Type 055", "Type 052D", "Threat"]
  }
];

// Expose to window for robustness across script loading
window.WEAPONS = WEAPONS;


// ---------- ADVERSARY AIRCRAFT (Recognition for RAAF crews) ----------
const ADVERSARY_AIRCRAFT = [
  {
    id: "j20",
    desig: "J-20",
    name: "Mighty Dragon",
    origin: "China",
    tagline: "China's first operational fifth-generation stealth fighter. Long-range air superiority and strike platform.",
    img: "images/j-20.jpg",
    type: "adversary",
    typeName: "5th Gen Stealth Fighter",
    stats: [
      { k: "Role", v: "5th Gen Fighter" },
      { k: "Speed", v: "Mach 2+" },
      { k: "Range", v: "Long (internal fuel)" },
      { k: "Status", v: "In service (hundreds)" }
    ],
    overview: "The Chengdu J-20 is China's premier stealth fighter. It combines low observability, supercruise capability, long range, and powerful sensors. For RAAF F-35A and Wedgetail crews, the J-20 represents the primary high-end air-to-air threat in the Indo-Pacific. Its large size (for a stealth fighter) gives it excellent range and internal weapons carriage, but also makes it a larger radar target than the F-35 in some aspects.",
    systems: [
      { name: "Type 1475 AESA Radar", code: "AESA", desc: "Large active electronically scanned array radar with excellent long-range detection and multi-target tracking capability, optimized for beyond-visual-range engagements.", layman: "A very powerful 'flat panel' radar that can spot enemy aircraft from far away and track many targets at once." },
      { name: "PL-15 Long-Range AAM", code: "PL-15", desc: "Active radar-guided air-to-air missile with estimated range exceeding 200 km, designed to outrange Western equivalents like the AIM-120.", layman: "A very long-range missile that can shoot down aircraft from extremely far away before they even know it's coming." },
      { name: "Electro-Optical Targeting System", code: "EOTS", desc: "Forward-looking infrared and laser targeting system for passive detection and precision engagement of air and ground targets.", layman: "A powerful camera system that can see heat signatures and help aim weapons without giving away the plane's position with radar." },
      { name: "Internal Weapons Bay", code: "Stealth", desc: "Large internal bays allowing carriage of multiple long-range missiles while maintaining low observability.", layman: "Missiles are carried inside the plane so enemy radars have a much harder time seeing the J-20 coming." }
    ],
    recognition: "Large canard-delta configuration, prominent diverterless supersonic inlets (DSI), canted twin tails, and a relatively large airframe for a stealth fighter. Often flies with external tanks or weapons on non-stealthy missions.",
    whyMatters: "The J-20 is designed to contest air superiority at long ranges. RAAF crews must understand its sensor fusion, long-range PL-15 missiles, and how to exploit any RCS or IR signature advantages the F-35 may hold."
  },
  {
    id: "su35",
    desig: "Su-35S",
    name: "Flanker-E",
    origin: "Russia",
    tagline: "Extremely agile 4.5-generation air superiority fighter with powerful radar and long-range missiles.",
    img: "images/su-35s.jpg",
    type: "adversary",
    typeName: "4.5 Gen Air Superiority",
    stats: [
      { k: "Role", v: "Air Superiority" },
      { k: "Speed", v: "Mach 2.25" },
      { k: "Manoeuvrability", v: "Exceptional (thrust vectoring)" },
      { k: "Missiles", v: "R-77, R-37M" }
    ],
    overview: "The Sukhoi Su-35S is one of the most capable non-stealth fighters in the world. It features a powerful Irbis-E passive electronically scanned array radar, thrust-vectoring engines, and the ability to carry the very long-range R-37M 'Axehead' air-to-air missile. Russian Su-35s have seen combat in Syria and Ukraine.",
    systems: [
      { name: "Irbis-E PESA Radar", code: "Irbis-E", desc: "Very powerful passive electronically scanned array radar with exceptional long-range detection and the ability to track dozens of targets simultaneously.", layman: "One of the strongest radars on any fighter — it can see very far and keep track of many aircraft at the same time." },
      { name: "R-37M Long-Range AAM", code: "R-37M", desc: "Very long-range air-to-air missile (up to 300+ km) designed specifically to engage high-value targets like AWACS and tankers from extreme distances.", layman: "A missile that can shoot down big support planes (like Wedgetail) from ridiculously far away." },
      { name: "Thrust Vectoring Engines", code: "TV", desc: "2D thrust-vectoring nozzles allowing extreme manoeuvrability at high angles of attack and in close-range dogfights.", layman: "The engines can point in different directions, letting the plane do crazy tight turns that normal fighters can't match." },
      { name: "R-77M Active Radar AAM", code: "R-77M", desc: "Modern medium-range active radar missile with improved seeker and resistance to countermeasures.", layman: "A solid all-round air-to-air missile for normal beyond-visual-range fights." }
    ],
    recognition: "Classic Flanker family planform (twin engines, twin tails, canards on some variants), but with more angular features and prominent engine nozzles. Very large and distinctive in the air.",
    whyMatters: "The Su-35 is a serious threat to non-stealth aircraft and can pose problems even for stealth platforms if it can get a good radar lock or use its long-range missiles at extreme distances. Important for Wedgetail and P-8A crews to understand its radar and missile reach."
  },
  {
    id: "h6k",
    desig: "H-6K",
    name: "Badger",
    origin: "China",
    tagline: "China's primary long-range bomber and cruise missile carrier. The maritime strike workhorse of the PLAAF.",
    img: "images/h-6k.jpg",
    type: "adversary",
    typeName: "Strategic Bomber",
    stats: [
      { k: "Role", v: "Bomber / Missile Carrier" },
      { k: "Range", v: "Very Long" },
      { k: "Weapons", v: "CJ-10, YJ-12, KD-21" },
      { k: "Numbers", v: "Large fleet" }
    ],
    overview: "The Xian H-6K is a modernised version of the Soviet Tu-16 Badger. It is China's main platform for long-range maritime strike, carrying large numbers of CJ-10 land-attack cruise missiles and YJ-12 supersonic anti-ship missiles. It is a frequent participant in long-range patrols around Taiwan, the Senkakus, and into the western Pacific.",
    systems: [
      { name: "Type 245 Radar + Electro-Optics", code: "Sensors", desc: "Improved maritime search radar and electro-optical targeting system for locating and engaging ships at long range.", layman: "Powerful sensors that help the bomber find ships far out at sea before launching missiles." },
      { name: "YJ-12 Supersonic ASCM", code: "YJ-12", desc: "Large supersonic anti-ship cruise missile with high speed and powerful warhead, difficult for ship defences to intercept.", layman: "A very fast ship-killing missile that flies at supersonic speeds in the final stage — hard for ships to shoot down." },
      { name: "CJ-10 / KD-21 Land Attack Missiles", code: "Cruise Missiles", desc: "Long-range land-attack cruise missiles capable of striking targets deep inside enemy territory from stand-off distances.", layman: "Missiles that can fly hundreds of kilometres to hit airfields, ports, or command centres on land." },
      { name: "Electronic Warfare Suite", code: "EW", desc: "Defensive jammers and decoys to help the large, slow bomber survive against modern air defences.", layman: "Systems that try to confuse enemy radars and missiles so the bomber can get close enough to launch its weapons." }
    ],
    recognition: "Large twin-engine bomber with a distinctive glazed nose (on older variants) or solid nose on H-6K, swept wings, and usually seen with multiple large missiles under the wings and fuselage.",
    whyMatters: "The H-6K is the most likely platform to launch large salvos of cruise missiles against Australian or allied ships and bases in a conflict. P-8A and Triton crews are likely to be tasked with finding and tracking these aircraft at long range."
  },
  {
    id: "kj500",
    desig: "KJ-500",
    name: "Mainring",
    origin: "China",
    tagline: "China's primary airborne early warning and control aircraft. The PLAAF's 'Wedgetail equivalent'.",
    img: "images/kj-500.jpg",
    type: "adversary",
    typeName: "AEW&C Aircraft",
    stats: [
      { k: "Role", v: "AEW&C" },
      { k: "Radar", v: "Large AESA" },
      { k: "Endurance", v: "Long" },
      { k: "Numbers", v: "Growing fleet" }
    ],
    overview: "The KJ-500 is the most numerous and capable AEW&C aircraft in Chinese service. It provides the PLAAF and PLAN with battle management, fighter control, and maritime surveillance. It is frequently seen supporting long-range bomber and fighter operations in the East and South China Seas.",
    systems: [
      { name: "Large AESA Radar (Type 366)", code: "AESA", desc: "Large active electronically scanned array radar mounted in a fixed circular radome providing 360° coverage and excellent detection of air and surface targets.", layman: "A big round radar on top that can see aircraft and ships in every direction at long range." },
      { name: "Integrated Battle Management System", code: "C2", desc: "Advanced command and control suite allowing operators to direct large numbers of fighters, coordinate strikes, and share the air picture in real time.", layman: "The 'brain' of the aircraft — it tells Chinese fighters where to go and what to shoot at." },
      { name: "Data Links & Communications", code: "Links", desc: "Multiple secure data links that allow the KJ-500 to share its radar picture with ground stations, ships, and other aircraft.", layman: "It sends what it sees to other planes and ships so everyone has the same picture of the battlefield." },
      { name: "Electronic Support Measures (ESM)", code: "ESM", desc: "Passive sensors that detect and locate enemy radar and communications emissions without emitting any signals itself.", layman: "It can listen to enemy radars and radios without being detected, helping find threats quietly." }
    ],
    recognition: "Based on the Y-9 transport, with a large fixed circular radome on top (similar to but larger than the E-2 Hawkeye style), four turboprop engines, and a high T-tail.",
    whyMatters: "The KJ-500 significantly extends the PLAAF's ability to detect and direct fighters and bombers at long range. It is a high-value target and a key node in China's integrated air defence system. Wedgetail crews will likely be tasked with locating and tracking these aircraft."
  }
];


// ============================================
// SYSTEMS (extracted & deduped from all aircraft, navy vessels/helo, army vehicles/platforms)
// Segregated by type for UI grids: radar, eo-ir, sonar, ew, avionics, other
// Each has id for linking, name/code, group, tagline (short), overview (full desc + layman combined), platforms (list for back-links), img if available
const SYSTEMS = [
  // RADAR
  {
    id: "an-apg-81-aesa",
    name: "AN/APG-81 AESA Radar",
    code: "AESA",
    group: "radar",
    tagline: "Advanced Active Electronically Scanned Array radar for F-35A. Thousands of T/R modules for multi-function search, track, mapping and EA.",
    overview: "Active Electronically Scanned Array radar. Unlike older radars with a single rotating dish, this radar has thousands of tiny transmitter elements that electronically steer the beam. Think of it as thousands of small torches all pointing together — you can switch direction in microseconds without moving any parts. Provides excellent range, resolution, simultaneous multi-target tracking, low probability of intercept modes, and integrated electronic attack capability. Central to F-35A sensor fusion and situational awareness.",
    layman: "Like having thousands of eyes that can look in any direction instantly, without turning your head.",
    platforms: ["f35a"],
    img: "images/apg-81-aesa.jpg"
  },
  {
    id: "an-apg-79-aesa",
    name: "AN/APG-79 AESA Radar",
    code: "AESA",
    group: "radar",
    tagline: "Advanced phased-array radar for Super Hornet and Growler. Long-range air/surface search, tracking and weapons guidance.",
    overview: "Advanced phased-array radar providing long-range air and surface search, tracking, and weapons guidance. Same radar on Super Hornet and Growler (Growler version allows self-defence and air threats).",
    layman: "Powerful radar that can track many aircraft at once and guide missiles to multiple targets simultaneously.",
    platforms: ["fa18f", "ea18g"],
    img: "images/apg-79-aesa.jpg"
  },
  {
    id: "mesa-radar",
    name: "MESA Radar",
    code: "MESA",
    group: "radar",
    tagline: "Multi-role Electronically Scanned Array on E-7A Wedgetail. Fixed top-mounted 360° coverage without physical rotation.",
    overview: "Multi-role Electronically Scanned Array. A fixed, top-mounted radar that uses electronic beam steering in both elevation and azimuth, providing 360° coverage without needing to physically rotate. Tracks both air and surface targets simultaneously.",
    layman: "A radar strapped on top of the aircraft that can look in every direction at once without spinning. It sees aircraft 600+ km away.",
    platforms: ["e7a"],
    img: "images/mesa-radar.jpg"
  },
  {
    id: "an-apy-10-radar",
    name: "AN/APY-10 Radar",
    code: "APY-10",
    group: "radar",
    tagline: "Multimode surface search radar on P-8A Poseidon. Optimised for maritime surveillance including periscope detection.",
    overview: "Multimode surface search radar. Can detect surfaced or snorkelling submarines, surface vessels and small objects in high sea states.",
    layman: "A powerful ground-scanning radar that can spot a submarine periscope poking above the water from high altitude.",
    platforms: ["p8a"],
    img: "images/apy-10-radar.jpg"
  },
  {
    id: "an-zpy-3-mfas",
    name: "AN/ZPY-3 Multi-Function Active Sensor (MFAS)",
    code: "Radar",
    group: "radar",
    tagline: "Advanced 360° maritime surveillance radar on MQ-4C Triton. Detects and tracks ships and surfaced submarines in all weather.",
    overview: "Advanced 360° maritime surveillance radar capable of detecting and tracking ships and surfaced submarines in all weather conditions.",
    layman: "A massive radar that can watch thousands of square kilometres of ocean at once, spotting ships even through clouds.",
    platforms: ["triton"],
    img: "images/zpy-3-mfas.jpeg"
  },
  {
    id: "spy-1d",
    name: "AN/SPY-1D(V) Phased Array Radar",
    code: "SPY-1D",
    group: "radar",
    tagline: "Four fixed faces of Aegis radar on Hobart-class. 360° volume search and tracking at 150+ km.",
    overview: "Four fixed faces of the Aegis radar providing 360° volume search and tracking. Detects aircraft and missiles at ranges exceeding 150 km and provides mid-course guidance to SM-2 and SM-6 missiles.",
    layman: "Four giant flat-panel radars that never stop spinning. They can track dozens of aircraft and missiles at once and tell the missiles exactly where to go.",
    platforms: ["hobart"],
    img: "images/spy-1d-v.jpg"
  },
  {
    id: "ceafar2-l",
    name: "CEAFAR2-L Long-Range AESA Radar",
    code: "CEAFAR2",
    group: "radar",
    tagline: "Australian L-band AESA on upgraded Anzac and Hunter-class. Superior against sea-skimming threats vs legacy SPS-49.",
    overview: "Australian-designed L-band active electronically scanned array optimised for long-range air search and tracking. Provides superior performance against small, fast, sea-skimming targets compared with the original SPS-49 radar.",
    layman: "A locally built 'flat panel' radar that is exceptionally good at spotting low-flying missiles and aircraft over the ocean horizon.",
    platforms: ["anzac", "hunter"],
    img: "images/CEAFAR-L.jpg"
  },
  {
    id: "ceafar2-aegis",
    name: "CEAFAR2 + Aegis Combat System",
    code: "CEAFAR2",
    group: "radar",
    tagline: "Australian tri-band AESA (L/S/X) on Hunter-class integrated with Aegis via Saab 9LV. Superior surveillance and fire control.",
    overview: "Australian tri-band AESA radar (L/S/X) integrated with Aegis via Saab 9LV interface. Provides superior air and surface surveillance plus fire control for SM-2/ESSM and future weapons.",
    layman: "The same locally designed radar family as the upgraded Anzacs, but married to the full power of Aegis — the best of Australian and American technology.",
    platforms: ["hunter"],
    img: "images/CEAFAR-L.jpg"
  },
  {
    id: "an-zpy-3-mfas-t",
    name: "AN/ZPY-3 MFAS (Triton variant)",
    code: "Radar",
    group: "radar",
    tagline: "360° maritime surveillance radar on Triton. All-weather ship and sub detection.",
    overview: "Advanced 360° maritime surveillance radar capable of detecting and tracking ships and surfaced submarines in all weather conditions.",
    layman: "A massive radar that can watch thousands of square kilometres of ocean at once, spotting ships even through clouds.",
    platforms: ["triton"],
    img: "images/zpy-3-mfas.jpeg"
  },
  // EO/IR & Cameras
  {
    id: "an-aaq-40-eots",
    name: "AN/AAQ-40 EOTS",
    code: "EOTS",
    group: "eo-ir",
    tagline: "Electro-Optical Targeting System on F-35A. High-res IR/optical camera flush in fuselage for day/night targeting and laser designation.",
    overview: "Electro-Optical Targeting System. A high-resolution infrared and optical camera built flush into the fuselage. Allows the pilot to see targets in detail day or night, guide laser-guided bombs and measure target distance.",
    layman: "An incredibly powerful zoom camera that also acts as a laser pointer for bombs — all built invisibly into the aircraft's nose.",
    platforms: ["f35a"],
    img: "images/anaqq-40-eots.jpg"
  },
  {
    id: "eo-ir-turret-triton",
    name: "Electro-Optical / Infrared (EO/IR) Turret",
    code: "Camera",
    group: "eo-ir",
    tagline: "High-res day/night cameras on Triton. Zoom from 50,000 ft to read ship names or identify activity.",
    overview: "High-resolution day and night cameras that can zoom in on vessels from 50,000 feet to read names or identify activity.",
    layman: "Incredibly powerful cameras that can read the name on a ship from way up in the stratosphere.",
    platforms: ["triton"],
    img: "images/triton.mp4"
  },
  {
    id: "an-aps-153-eo-ir",
    name: "AN/APS-153 Multi-Mode Radar + EO/IR",
    code: "Sensors",
    group: "eo-ir",
    tagline: "Powerful surface-search radar plus high-res EO/IR turret on MH-60R. Visual ID and targeting day/night at long range.",
    overview: "Powerful surface-search radar plus high-resolution electro-optical/infrared turret for visual identification and targeting at long range, day and night.",
    layman: "The helicopter's own radar and cameras let it spot ships and small boats far over the horizon and identify them before the parent ship can see them.",
    platforms: ["mh60r"],
    img: "images/aps-143-radar.JPG"
  },
  // Sonar & Acoustic
  {
    id: "aqs-22f-dipping",
    name: "AQS-22F Dipping Sonar + Sonobuoys",
    code: "ASW",
    group: "sonar",
    tagline: "Dipping sonar and sonobuoys on MH-60R. Active/passive sub hunting, mobile long-range underwater sensor.",
    overview: "Lowerable sonar buoy that actively and passively hunts submarines. Combined with sonobuoys dropped from the helicopter, it gives the ship a mobile, long-range underwater sensor that can be positioned exactly where needed.",
    layman: "The helicopter can dunk a powerful underwater microphone into the sea to listen for submarines, then drop listening buoys in patterns around the contact.",
    platforms: ["mh60r"],
    img: "images/aqs-22f-sonar.jpg"
  },
  {
    id: "an-aps-153-sonar-helo",
    name: "AN/APS-153 + Acoustic Suite (MH-60R)",
    code: "Sensors",
    group: "sonar",
    tagline: "Multi-mode radar + acoustic on MH-60R. Full ASW with dipping sonar and sonobuoys.",
    overview: "Powerful surface-search radar plus high-resolution electro-optical/infrared turret for visual identification and targeting at long range, day and night. Combined with AQS-22F for full sub hunting.",
    layman: "The helicopter's own radar and cameras plus underwater sensors for complete ASW picture.",
    platforms: ["mh60r"],
    img: "images/aqs-22f-sonar.jpg"
  },
  {
    id: "integrated-sonar-hobart",
    name: "Integrated Sonar Suite + MU90 Torpedoes (Hobart)",
    code: "ASW",
    group: "sonar",
    tagline: "Hull + towed array sonars on Hobart-class. Independent sub detection and engagement with torpedoes.",
    overview: "Hull-mounted and towed-array sonars plus two triple MU90 lightweight torpedo launchers. Provides the ship with its own submarine detection and engagement capability independent of the helicopter.",
    layman: "Underwater ears plus torpedoes the ship can shoot itself. Good for when the helicopter is busy or the threat is close.",
    platforms: ["hobart"],
    img: "images/hobart.jpg"
  },
  {
    id: "advanced-asw-hunter",
    name: "Advanced ASW Suite (S2150 + 2087 TAS/VDS)",
    code: "Sonar",
    group: "sonar",
    tagline: "Ultra S2150 hull + Thales 2087 towed/variable depth sonar on Hunter-class. World-class sub hunting with MH-60R.",
    overview: "Ultra S2150 hull-mounted sonar plus Thales Sonar 2087 towed array and variable-depth sonar. Combined with MH-60R and Surface Ship Torpedo Defence (SSTD), this is a world-class submarine hunting package.",
    layman: "The best underwater listening gear Australia could buy, plus a helicopter and anti-torpedo decoys. Built from the keel up to kill submarines.",
    platforms: ["hunter"],
    img: "images/s2150-2087-tasvds.jpg"
  },
  {
    id: "sophisticated-sonar-collins",
    name: "Sophisticated Sonar Suite + Towed Array (Collins)",
    code: "Sonar",
    group: "sonar",
    tagline: "Bow, flank, distributed + towed arrays on Collins-class. Renowned passive detection in right conditions.",
    overview: "Bow, flank and distributed arrays plus a towed array. The Collins is renowned for its passive detection performance in the right ocean conditions.",
    layman: "Underwater microphones all over the boat plus a long cable that listens far behind. One of the quietest conventional subs ever built.",
    platforms: ["collins"],
    img: "images/sonar-suite-collins.jpg"
  },
  // EW & ESM
  {
    id: "an-alq-214-idecm",
    name: "AN/ALQ-214 IDECM",
    code: "IDECM",
    group: "ew",
    tagline: "Integrated Defensive Electronic Countermeasures on Super Hornet. Radar warning, missile warning, active jamming.",
    overview: "Integrated Defensive Electronic Countermeasures. Combines radar warning, missile warning, and active jamming in one system.",
    layman: "The jet's self-defence system — detects missiles fired at it and automatically deploys countermeasures.",
    platforms: ["fa18f"],
    img: "images/alq-214-idecm.jpg"
  },
  {
    id: "an-alq-218",
    name: "AN/ALQ-218 Receiver",
    code: "ALQ-218",
    group: "ew",
    tagline: "Wideband high-sensitivity receiver on Growler. Detects and locates enemy radar/radio emissions across vast frequencies.",
    overview: "Wideband, high-sensitivity receiver that detects and precisely locates enemy radar and radio emissions across a vast frequency range.",
    layman: "An incredibly sensitive radio scanner that picks up every radar and radio signal in the area and maps where they're coming from.",
    platforms: ["ea18g"],
    img: "images/alq-2018-receiver.jpg"
  },
  {
    id: "an-alq-99",
    name: "AN/ALQ-99 Jamming Pods",
    code: "ALQ-99 TJS",
    group: "ew",
    tagline: "Tactical Jamming System pods on Growler. Powerful EM signals to overload and blind enemy radars.",
    overview: "Tactical Jamming System. These pods emit powerful electromagnetic signals to overload and blind enemy radar systems, rendering them ineffective.",
    layman: "Like shining a spotlight directly into someone's eyes to blind them — but for radar. Enemy radar operators see only static.",
    platforms: ["ea18g"],
    img: "images/alq-99-jamming_pods.JPG"
  },
  {
    id: "an-alr-69-rwr",
    name: "AN/ALR-69 Radar Warning Receiver",
    code: "RWR",
    group: "ew",
    tagline: "Detects enemy radar emissions on C-130J. Visual/audio warnings for evasive action or countermeasures.",
    overview: "Detects enemy radar emissions and provides the crew with visual and audio warnings of potential threats, allowing the aircraft to take evasive action or deploy countermeasures.",
    layman: "The aircraft's 'ears' — it listens for enemy radars trying to lock on and warns the crew so they can dodge or hide.",
    platforms: ["c130j"],
    img: "images/alr-69-radar_receiver.jpg"
  },
  {
    id: "laircm",
    name: "LAIRCM / Large Aircraft Infrared Countermeasures",
    code: "LAIRCM",
    group: "ew",
    tagline: "Detects heat-seeking missiles on large aircraft (C-17, C-130, P-8) and uses laser to confuse seeker.",
    overview: "Large Aircraft Infrared Countermeasures. Detects incoming heat-seeking missiles and uses a laser to confuse the missile's seeker, causing it to miss. Automatic on some variants.",
    layman: "An automatic laser that blinds heat-seeking missiles fired at the aircraft — no pilot action needed.",
    platforms: ["c17", "c130j", "p8a"],
    img: "images/laircm.jpg"
  },
  {
    id: "an-alq-218-growler",
    name: "AN/ALQ-218 + ALQ-99 (Growler EW Suite)",
    code: "EW",
    group: "ew",
    tagline: "Growler's full EW suite: receiver for detection/location + jamming pods for blinding enemy radars.",
    overview: "Wideband receiver for precise location of emissions + high-power tactical jamming pods. Primary SEAD/DEAD enabler.",
    layman: "The Growler's ears (detects everything) + its jamming fists (blinds the bad guys).",
    platforms: ["ea18g"],
    img: "images/alq-99-jamming_pods.JPG"
  },
  // Avionics / Other
  {
    id: "mission-computing-wedgetail",
    name: "Mission Computing System (Wedgetail)",
    code: "MCS",
    group: "avionics",
    tagline: "Integrates all sensor data on E-7A into single coherent air picture for battle management.",
    overview: "Integrates all sensor data (radar, ESM, IFF) and fuses them into a single, coherent air picture. Operators in the cabin use this to manage the whole air battle.",
    layman: "The brain of the aircraft — it combines all the radar and sensor data into one clear picture that operators use to control the battle.",
    platforms: ["e7a"],
    img: "images/wedgetail.mp4"
  },
  {
    id: "glass-cockpit-pilatus",
    name: "Glass Cockpit & Embedded Simulation (PC-21)",
    code: "Cockpit",
    group: "avionics",
    tagline: "Modern touchscreen + onboard sim on PC-21 for complex tactics training in air.",
    overview: "Fully integrated touchscreen displays and onboard simulation systems that allow students to practice complex tactics and emergencies in the air without needing external support aircraft.",
    layman: "The cockpit feels like a real fighter jet. Students can practice radar, weapons, and emergencies right there in the training plane.",
    platforms: ["pc21"],
    img: "images/pc21.mp4"
  },
  {
    id: "enhanced-vision-c27j",
    name: "Enhanced Vision System (C-27J)",
    code: "EVS",
    group: "avionics",
    tagline: "FLIR + low-light cameras on C-27J for improved SA into remote/poorly lit strips at night/bad weather.",
    overview: "Forward-looking infrared and low-light camera system that gives pilots greatly improved situational awareness when operating into remote or poorly lit airstrips at night or in bad weather.",
    layman: "Special cameras that let the pilots 'see' the runway clearly even when it's pitch black or raining heavily.",
    platforms: ["c27j"],
    img: "images/c27j.mp4"
  },
  {
    id: "defensive-aids-c27j",
    name: "Defensive Aids Suite (C-27J)",
    code: "DAS",
    group: "ew",
    tagline: "Missile/radar warning + countermeasures on C-27J for higher-threat ops than typical transports.",
    overview: "Integrated missile warning, radar warning and countermeasures system tailored for operations in higher-threat environments than traditional transport aircraft usually face.",
    layman: "The aircraft's self-protection suite — it can detect incoming missiles and automatically release flares or chaff.",
    platforms: ["c27j"],
    img: "images/defensive_aids_suite.avif"
  },
  {
    id: "fly-by-wire-refuelling",
    name: "Fly-by-Wire Refuelling Boom (KC-30A)",
    code: "FBW ARBS",
    group: "avionics",
    tagline: "Extendable boom on KC-30A controlled by operator with joystick-like video game controls.",
    overview: "An extendable boom at the tail of the aircraft that a receiver aircraft connects to. The boom is controlled by an operator using a fly-by-wire joystick, similar to video game controls.",
    layman: "A retractable 'hose on a stick' at the tail that links to a fighter's fuel port — the boom operator flies it into place with a joystick.",
    platforms: ["kc30a"],
    img: "images/refuelling-boom-kc-30a.jpg"
  },
  {
    id: "hose-drogue-kc30a",
    name: "Hose & Drogue System (KC-30A)",
    code: "HDU",
    group: "avionics",
    tagline: "Flexible hose with drogue basket on KC-30A. Receiver pilot flies probe into basket.",
    overview: "Alternative refuelling system using a flexible hose with a funnel-shaped drogue basket at the end. The receiving aircraft's pilot flies into the basket to connect.",
    layman: "A flexible fuel hose with a basket on the end — the receiving pilot flies their aircraft's refuelling probe into the basket to refuel.",
    platforms: ["kc30a"],
    img: "images/hose-drogue-system-KC30a.jpg"
  },
  {
    id: "twin-t55-chinook",
    name: "Twin Honeywell T55-GA-714A Engines (CH-47F)",
    code: "Engines",
    group: "avionics",
    tagline: "Powerful turboshaft engines on Chinook. Counter-rotating rotors eliminate tail rotor, exceptional lift/hover at altitude.",
    overview: "Two powerful turboshaft engines driving tandem rotors. The counter-rotating rotor design eliminates the need for a tail rotor and gives exceptional lift and hover performance even at high altitude and temperature.",
    layman: "Two huge engines spinning two big rotors in opposite directions — this lets it lift tanks and massive sling loads that normal helicopters can't touch.",
    platforms: ["ch47f"],
    img: "images/t55-ga-714a_engines.jpg"
  },
  {
    id: "advanced-cockpit-chinook",
    name: "Advanced Cockpit & Digital Flight Controls (CH-47F)",
    code: "Avionics",
    group: "avionics",
    tagline: "Modern glass cockpit on F-model Chinook. Digital controls, NVG compatible, improved reliability.",
    overview: "Modern glass cockpit with digital flight controls, night-vision compatibility, and excellent all-weather capability. The F-model has significantly improved reliability and maintenance compared with older Chinooks.",
    layman: "Up-to-date screens and computers so two pilots can fly it day or night, in bad weather, with far less workload.",
    platforms: ["ch47f"],
    img: "images/cockpit_ch47f.jpg"
  },
  {
    id: "cargo-hook-chinook",
    name: "Cargo Hook & Sling System (CH-47F)",
    code: "Sling",
    group: "avionics",
    tagline: "Heavy-duty external hooks on Chinook. Lift over 12 tonnes for artillery, vehicles, fuel, construction into no-LZ areas.",
    overview: "Heavy-duty external cargo hooks capable of lifting over 12 tonnes. Used for moving artillery, vehicles, fuel bladders, and construction equipment into areas without landing zones.",
    layman: "The big hook underneath that can dangle an entire tank or a shipping container and put it exactly where the ground forces need it.",
    platforms: ["ch47f"],
    img: "images/cargo-hook_chinook.jpg"
  },
  {
    id: "troop-vehicle-chinook",
    name: "Troop & Vehicle Carrying Capability (CH-47F)",
    code: "Transport",
    group: "avionics",
    tagline: "Internal carry on Chinook: 44 troops or light vehicles/stores. Rapid load/unload, hover options.",
    overview: "Can carry 44 fully equipped troops or a mix of light vehicles and stores internally. The rear ramp allows rapid loading and unloading, including while hovering for certain operations.",
    layman: "A flying truck that can drive an Abrams tank straight in or unload 40 soldiers in seconds via the back ramp.",
    platforms: ["ch47f"],
    img: "images/chinook.mp4"
  },
  // Army ground vehicle sensors / sights (added for full cross-platform coverage)
  {
    id: "m1a1-citv-thermal",
    name: "CITV / Commander's Independent Thermal Viewer (M1A1 Abrams)",
    code: "Thermal",
    group: "eo-ir",
    tagline: "Independent 360° thermal sight for commander. Hunter-killer capability with gunner sight; day/night target acquisition.",
    overview: "The Commander's Independent Thermal Viewer gives the tank commander a separate stabilised thermal and day camera that can scan while the gunner engages. Classic hunter-killer: commander finds, gunner kills. Critical for situational awareness in cluttered or low-visibility fights.",
    layman: "The boss has his own set of magic night-vision binoculars that spin all the way around, so he can spot bad guys while the gunner is busy shooting the first one.",
    platforms: ["m1a1"],
    img: "images/citv.jpeg"
  },
  {
    id: "m1a1-fcs",
    name: "Fire Control System + Laser Rangefinder (M1A1)",
    code: "FCS",
    group: "avionics",
    tagline: "Ballistic computer, laser rangefinder and stabilised sights. First-round hit probability high even on the move.",
    overview: "Digital fire control with laser rangefinder, meteorological sensors, and gun stabilisation. Allows accurate main gun shots while the tank is moving over rough ground.",
    layman: "The tank's computer does the hard maths for bullet drop, wind and movement so the gunner just puts the crosshair on target and fires — even while bouncing across a paddock.",
    platforms: ["m1a1"],
    img: "images/abrams.jpg"
  },
  {
    id: "boxer-lance-turret-sight",
    name: "Lance Turret Sight / EO-IR (Boxer CRV)",
    code: "EO-IR",
    group: "eo-ir",
    tagline: "Stabilised day/night sight on the 30 mm turret. Target acquisition, tracking and hunter-killer for the crew.",
    overview: "Integrated electro-optical/infrared sight package on the remote or manned turret. Provides detection, recognition and engagement of targets at range in all light conditions.",
    layman: "The armoured vehicle's own camera suite that lets the crew see and shoot accurately at night or through smoke and dust.",
    platforms: ["boxer"],
    img: "images/boxer.mp4"
  },
  {
    id: "arhtiger-osiris",
    name: "OSIRIS / Strix Mast-Mounted Sight (ARH Tiger)",
    code: "EO-IR + Radar",
    group: "eo-ir",
    tagline: "Gyro-stabilised mast sight with thermal, TV, laser and mm-wave radar. Allows target ID and Hellfire designation while masked.",
    overview: "The mast sight lets the helicopter peek over trees or ridges, designate targets with laser or radar, and fire Hellfires without exposing the whole aircraft. One of the best reconnaissance/attack sights on any attack helo.",
    layman: "A periscope on a stick that sees in infrared and with radar, so the Tiger can hide behind a hill, find the enemy, and launch missiles without ever showing itself.",
    platforms: ["arhtiger"],
    img: "images/osiris.jpg"
  },
  {
    id: "type055-radar",
    name: "Type 346B / S-band AESA (Type 055)",
    code: "AESA",
    group: "radar",
    tagline: "Large active phased-array suite on Chinese Renhai-class. 360° air/surface search and fire control for HHQ-9 / YJ-21 etc.",
    overview: "Advanced four-face S-band AESA providing long-range surveillance, tracking and illumination. Comparable in role to SPY-1/6 but with Chinese characteristics and very high power.",
    layman: "The big flat radars on China's most powerful destroyer — they watch the sky and sea for hundreds of kilometres and guide the ship's many missiles.",
    platforms: ["type055"],
    img: "images/346b-aesa-type055.jpg"
  }
  // Note: many more systems exist in platform data (e.g. more radars on adversary, additional avionics). Auto-linking via previewMap + wrap will cover references; full exhaustive list can be expanded in future passes. Core representative set added for organisation and linking.
];

// End SYSTEMS

// These arrays power the Flashcards and Quiz features
// ============================================

// Pre-entry Fitness Assessment (PFA) standards
const PFA_STANDARDS = [
  // Army - Combat / Officer
  { id: "pfa-army-combat-push-m", front: "Army Combat / Officer roles – Push-ups (Male)", back: "15 correct push-ups in 1 minute (full range of motion)", category: "PFA - Army" },
  { id: "pfa-army-combat-push-f", front: "Army Combat / Officer roles – Push-ups (Female)", back: "8 correct push-ups in 1 minute (full range of motion)", category: "PFA - Army" },
  { id: "pfa-army-combat-sit", front: "Army Combat / Officer roles – Sit-ups", back: "45 sit-ups (feet held) in 1 minute", category: "PFA - Army" },
  { id: "pfa-army-combat-beep", front: "Army Combat / Officer roles – Beep Test", back: "Level 7.5 on the 20m shuttle run (gender neutral)", category: "PFA - Army" },

  // Army - Combat Support
  { id: "pfa-army-support-push-m", front: "Army Combat Support roles – Push-ups (Male)", back: "8 correct push-ups in 1 minute", category: "PFA - Army" },
  { id: "pfa-army-support-push-f", front: "Army Combat Support roles – Push-ups (Female)", back: "4 correct push-ups in 1 minute", category: "PFA - Army" },
  { id: "pfa-army-support-sit", front: "Army Combat Support roles – Sit-ups", back: "20 sit-ups (feet held) in 1 minute", category: "PFA - Army" },
  { id: "pfa-army-support-beep", front: "Army Combat Support roles – Beep Test", back: "Level 6.1 on the 20m shuttle run", category: "PFA - Army" },

  // Navy
  { id: "pfa-navy-sit", front: "Royal Australian Navy – Sit-ups", back: "20 sit-ups (feet held) in 1 minute (same for male & female)", category: "PFA - Navy" },
  { id: "pfa-navy-beep-m", front: "Royal Australian Navy – Beep Test (Male)", back: "Level 6.0 on the 20m shuttle run", category: "PFA - Navy" },
  { id: "pfa-navy-beep-f", front: "Royal Australian Navy – Beep Test (Female)", back: "Level 5.5 on the 20m shuttle run", category: "PFA - Navy" },

  // RAAF - General
  { id: "pfa-raaf-sit", front: "RAAF General Entry – Sit-ups", back: "20 sit-ups (feet held) in 1 minute (male & female)", category: "PFA - RAAF" },
  { id: "pfa-raaf-beep-m", front: "RAAF General Entry – Beep Test (Male)", back: "Level 6.1 on the 20m shuttle run", category: "PFA - RAAF" },
  { id: "pfa-raaf-beep-f", front: "RAAF General Entry – Beep Test (Female)", back: "Level 5.1 on the 20m shuttle run", category: "PFA - RAAF" },

  // RAAF - Ground Defence Officer
  { id: "pfa-raaf-gdo-push", front: "RAAF Ground Defence Officer – Push-ups", back: "10 push-ups (same standard for male & female)", category: "PFA - RAAF" },
  { id: "pfa-raaf-gdo-beep", front: "RAAF Ground Defence Officer – Beep Test", back: "Level 6.5 on the 20m shuttle run", category: "PFA - RAAF" },

  // Special Forces
  { id: "pfa-sf-push", front: "Special Forces Pre-entry – Push-ups", back: "Minimum 40 correct push-ups", category: "PFA - Special Forces" },
  { id: "pfa-sf-sit", front: "Special Forces Pre-entry – Sit-ups", back: "Minimum 60 sit-ups (feet held)", category: "PFA - Special Forces" },
  { id: "pfa-sf-beep", front: "Special Forces Pre-entry – Beep Test", back: "Minimum Level 10.1 on the 20m shuttle run", category: "PFA - Special Forces" },
  { id: "pfa-sf-pullups", front: "Special Forces Pre-entry – Pull-ups", back: "Minimum 6 over-grasp heaves (pull-ups)", category: "PFA - Special Forces" },
];

window.PFA_STANDARDS = PFA_STANDARDS;


// Ranks (simplified for study)
const RANKS = [
  // Officer Ranks
  { id: "rank-acm", term: "Air Chief Marshal (ACM)", definition: "Highest active rank in the RAAF. Four-star equivalent. Normally held by the Chief of the Defence Force when an Air Force officer is appointed." },
  { id: "rank-am", term: "Air Marshal (AM)", definition: "Three-star rank. Professional head of the RAAF (Chief of Air Force) normally holds this rank." },
  { id: "rank-avm", term: "Air Vice-Marshal (AVM)", definition: "Two-star rank. Commands major formations or holds key joint appointments." },
  { id: "rank-aircdre", term: "Air Commodore (AIRCDRE)", definition: "One-star rank. Commands large bases or formations (e.g. Air Combat Group)." },
  { id: "rank-gpcapt", term: "Group Captain (GPCAPT)", definition: "Commands major RAAF bases or holds significant headquarters roles. Equivalent to Colonel." },
  { id: "rank-wgcdr", term: "Wing Commander (WGCDR)", definition: "Commands flying squadrons or large headquarters branches." },
  { id: "rank-sqnldr", term: "Squadron Leader (SQNLDR)", definition: "Commands smaller units or serves as executive officers." },
  { id: "rank-fltlt", term: "Flight Lieutenant (FLTLT)", definition: "Experienced junior officer. Often a flight commander." },
  { id: "rank-flgoff", term: "Flying Officer (FLGOFF)", definition: "Junior officer who has completed initial training." },
  { id: "rank-pltoff", term: "Pilot Officer (PLTOFF)", definition: "Entry-level commissioned officer rank upon graduation from training." },

  // Enlisted Ranks
  { id: "rank-woffaf", term: "Warrant Officer of the Air Force (WOFF-AF)", definition: "Single most senior enlisted member in the RAAF. Principal advisor to the Chief of Air Force on airmen/airwomen matters." },
  { id: "rank-woff", term: "Warrant Officer (WOFF)", definition: "Most senior non-commissioned rank. Significant leadership and disciplinary responsibilities." },
  { id: "rank-fsgt", term: "Flight Sergeant (FSGT)", definition: "Senior enlisted rank with supervisory responsibilities." },
  { id: "rank-sgt", term: "Sergeant (SGT)", definition: "First level of senior non-commissioned officer. Leads small teams." },
  { id: "rank-cpl", term: "Corporal (CPL)", definition: "Junior non-commissioned officer. First leadership rank for enlisted personnel." },
  { id: "rank-lcpl", term: "Leading Aircraftman/Aircraftwoman (LAC/LAW)", definition: "Senior junior rank with some supervisory responsibilities." },
  { id: "rank-ac", term: "Aircraftman/Aircraftwoman (AC)", definition: "Entry-level enlisted rank upon completion of initial training." },
];

window.RANKS = RANKS;


// Leadership concepts (values + principles + key ideas)
const LEADERSHIP_ITEMS = [
  { id: "lead-service", term: "Defence Value: Service", definition: "Selflessness — placing the security and interests of the nation and its people ahead of your own." },
  { id: "lead-courage", term: "Defence Value: Courage", definition: "The strength to do and say what is right, especially when it is difficult (physical and moral courage)." },
  { id: "lead-respect", term: "Defence Value: Respect", definition: "Valuing others and treating them with dignity. Requires humility and fairness." },
  { id: "lead-integrity", term: "Defence Value: Integrity", definition: "Consistency between what you think, say, and do. Being honest with yourself and others." },
  { id: "lead-excellence", term: "Defence Value: Excellence", definition: "Striving to be the best you can be — professionally and personally — every day." },

  { id: "lead-principle-1", term: "Leadership Principle 1", definition: "Know yourself and seek self-improvement." },
  { id: "lead-principle-2", term: "Leadership Principle 2", definition: "Be proficient — Master your trade and understand the broader context." },
  { id: "lead-principle-3", term: "Leadership Principle 3", definition: "Seek and accept responsibility." },
  { id: "lead-principle-4", term: "Leadership Principle 4", definition: "Lead by example." },
  { id: "lead-principle-5", term: "Leadership Principle 5", definition: "Provide direction and keep your team informed." },
  { id: "lead-principle-6", term: "Leadership Principle 6", definition: "Know and care for your people." },
  { id: "lead-principle-7", term: "Leadership Principle 7", definition: "Develop the potential of your people." },
  { id: "lead-principle-8", term: "Leadership Principle 8", definition: "Make sound and timely decisions." },
  { id: "lead-principle-9", term: "Leadership Principle 9", definition: "Build the team and challenge its abilities." },
  { id: "lead-principle-10", term: "Leadership Principle 10", definition: "Communicate effectively." },

  { id: "lead-mission-command", term: "Mission Command", definition: "The ADF’s preferred command philosophy: centralised intent and decentralised execution. Leaders provide clear purpose and intent while empowering subordinates to decide how." },
  { id: "lead-character", term: "ADF Leadership Model – Character", definition: "Who you are when no one is watching. Built on moral courage, integrity, and living the Defence values." },
  { id: "lead-competence", term: "ADF Leadership Model – Professional Competence", definition: "Mastery of your trade, understanding of the wider context, and the ability to apply knowledge under pressure." },
  { id: "lead-understanding", term: "ADF Leadership Model – Human Understanding", definition: "Self-awareness and insight into what motivates and affects others." },
];

window.LEADERSHIP_ITEMS = LEADERSHIP_ITEMS;
window.AIRCRAFT = AIRCRAFT;
window.NAVY = NAVY;
window.SPACE = SPACE;


// ============================================
// CYBERSPACE / THREAT LANDSCAPE STUDY ITEMS
// New content from expanded Cyberspace section
// ============================================
const CYBERSPACE_STUDY_ITEMS = [
  {
    id: "cyber-volt-typhoon-goal",
    front: "What is Volt Typhoon's primary objective in Australian networks?",
    back: "Long-term pre-positioning in critical infrastructure (energy, water, transport, communications) to enable disruptive or destructive effects during a future conflict with the West.",
    source: "Cyberspace - Threat Actors"
  },
  {
    id: "cyber-volt-typhoon-tactics",
    front: "Name the key tactic Volt Typhoon uses to remain stealthy inside networks.",
    back: "Living-off-the-land (using native admin tools like PowerShell and WMI instead of custom malware) combined with extreme patience and minimal activity.",
    source: "Cyberspace - Threat Actors"
  },
  {
    id: "cyber-volt-typhoon-assessment",
    front: "What is the official threat assessment level given to Volt Typhoon activity against Australia?",
    back: "Critical — because it represents preparation for wartime effects on Australian society and military operations rather than traditional espionage.",
    source: "Cyberspace - Threat Actors"
  },
  {
    id: "cyber-apt40-focus",
    front: "What sector does APT40 focus on most heavily against Australia?",
    back: "Maritime, defence industry, engineering, aerospace, and government entities (especially those linked to shipbuilding and underwater capabilities).",
    source: "Cyberspace - Threat Actors"
  },
  {
    id: "cyber-apt40-tactics",
    front: "What is one distinctive TTP of APT40?",
    back: "Extremely rapid exploitation of newly public vulnerabilities combined with heavy use of web shells and compromised SOHO routers as infrastructure.",
    source: "Cyberspace - Threat Actors"
  },
  {
    id: "cyber-salt-typhoon-target",
    front: "What type of infrastructure does Salt Typhoon primarily target?",
    back: "Telecommunications providers — aiming for persistent access to backbone and edge networks to collect metadata and enable future interception.",
    source: "Cyberspace - Threat Actors"
  },
  {
    id: "cyber-sandworm-capability",
    front: "What makes Sandworm (Russian GRU) particularly dangerous?",
    back: "Proven willingness and ability to conduct high-impact destructive attacks (e.g. NotPetya, Ukraine power grid) while also conducting espionage.",
    source: "Cyberspace - Threat Actors"
  },
  {
    id: "cyber-lazarus-motivation",
    front: "What is the primary motivation of North Korea's Lazarus Group?",
    back: "Financial gain through large-scale theft (especially cryptocurrency) to fund the North Korean regime, combined with state espionage.",
    source: "Cyberspace - Threat Actors"
  },
  {
    id: "cyber-prevention-segmentation",
    front: "Name one defensive measure proven effective against Volt Typhoon-style pre-positioning in Australia.",
    back: "Strict network segmentation (especially between IT and operational technology / critical systems) combined with behavioural detection of living-off-the-land techniques.",
    source: "Cyberspace - Preventions"
  },
  {
    id: "cyber-prevention-essential-eight",
    front: "Which Australian defensive framework has repeatedly helped organisations detect and block APT40 activity?",
    back: "The ASD Essential Eight (particularly application control and timely patching of known vulnerabilities).",
    source: "Cyberspace - Preventions"
  },
  {
    id: "cyber-prevention-lotl",
    front: "What defensive technique has been particularly successful at catching Chinese actors using Volt Typhoon tactics?",
    back: "Behavioural analytics and monitoring for unusual use of native Windows tools (PowerShell, WMI, etc.) rather than relying only on signature-based malware detection.",
    source: "Cyberspace - Preventions"
  },
  {
    id: "cyber-prevention-supply-chain",
    front: "What approach has reduced successful supply-chain intrusions by groups like APT41?",
    back: "Increased third-party vendor security assessments, software bill of materials (SBOM) requirements, and stricter scrutiny of the defence supply chain.",
    source: "Cyberspace - Preventions"
  },
  {
    id: "cyber-threat-assessment-volt",
    front: "Which Chinese group currently carries the highest strategic threat assessment against Australia?",
    back: "Volt Typhoon — rated Critical because of its focus on pre-positioning for wartime disruption of critical infrastructure rather than espionage.",
    source: "Cyberspace - Threat Assessments"
  },
  {
    id: "cyber-threat-assessment-apt40",
    front: "What threat assessment level is given to APT40 activity against Australian defence targets?",
    back: "Critical — due to high volume, rapid exploitation of new vulnerabilities, and direct targeting of maritime and defence industry programs.",
    source: "Cyberspace - Threat Assessments"
  },
  {
    id: "cyber-threat-assessment-russia",
    front: "What is the current threat assessment for major Russian GRU-linked groups (Sandworm) against Australia?",
    back: "High — they have demonstrated global destructive capability and are actively conducting espionage against Australian government and defence targets.",
    source: "Cyberspace - Threat Assessments"
  },
  {
    id: "cyber-threat-assessment-iran",
    front: "What threat level is currently assessed for Iranian state cyber actors against Australia?",
    back: "Medium — capable of espionage and disruption but currently lower priority and focus compared to China or Russia.",
    source: "Cyberspace - Threat Assessments"
  }
];

window.CYBERSPACE_STUDY_ITEMS = CYBERSPACE_STUDY_ITEMS;

// ============================================
// AUDIO LEARNING LOOPS - Listening-Optimized Content
// Designed specifically for audio consumption and urgent study.
// Each item is crafted for clarity, flow, and memory retention when heard.
// Structure: Title → Smooth Overview (with memory hooks) → Key Systems/Facts
// ============================================

const LISTENING_DATA = {
  // Group 1: Bases & Operations
  "group1": [
    {
      id: "amberley",
      title: "RAAF Base Amberley",
      overview: "Australia's largest and most important air combat base, located in Queensland. It serves as the central hub for strike, electronic attack, heavy transport, and air-to-air refuelling. Think of it as the 'main workshop' where Australia's most powerful combat and strategic lift assets live and train together under one roof.",
      whyItMatters: "Amberley is the only base in Australia that can generate and sustain a full combat air package including its own tankers and heavy airlift. Losing or degrading Amberley would severely limit Australia's ability to project power or sustain operations in the north.",
      commonMisconceptions: "Many assume it is purely a fighter base. In reality it is a multi-role strategic hub that combines fighters, electronic attack, tankers, and heavy lift in one location.",
      keyPoints: [
        "Houses No.1 and No.6 Squadrons flying the F/A-18F Super Hornet and EA-18G Growler — the backbone of RAAF air combat and electronic warfare.",
        "Also home to KC-30A tankers and C-17 Globemasters, allowing it to launch, refuel, and sustain complex strike and air mobility missions without relying on other bases.",
        "Strategically vital for operations in the northern approaches and as a forward operating location for sustained campaigns."
      ]
    },
    {
      id: "williamtown",
      title: "RAAF Base Williamtown",
      overview: "Home of the F-35A Lightning II and the E-7A Wedgetail. This is Australia's primary air defence base and headquarters of Air Combat Group. It is the centre where fifth-generation air power and battle management capabilities are concentrated and developed.",
      whyItMatters: "Williamtown is the only location currently hosting the full F-35A operational capability and the Wedgetail fleet. It is the heart of Australia's ability to control the air and direct complex joint operations.",
      commonMisconceptions: "Some think the F-35 is just a better fighter jet. In reality the combination of F-35 stealth sensors and Wedgetail battle management creates a system that multiplies the effectiveness of the entire ADF.",
      keyPoints: [
        "Primary base and training centre for the entire Australian F-35A fleet, including the Operational Conversion Unit.",
        "Wedgetail provides unmatched 360-degree airborne early warning and command & control — essentially an airborne headquarters for air and joint operations.",
        "Maintains a critical detachment capability to Tindal, extending air defence coverage deep into Australia's northern approaches."
      ]
    },
    {
      id: "operation-accordion",
      title: "Operation Accordion",
      overview: "Australia's main support mission in the Middle East, based at Al Minhad Air Base in the UAE. It is the only permanent forward-deployed ADF headquarters in the world and provides the backbone for up to twelve concurrent operations across the region.",
      whyItMatters: "It allows Australia to maintain a persistent presence and rapid response capability in a critical region without having to surge everything from home bases every time a crisis occurs.",
      commonMisconceptions: "Some see it as just 'support'. In reality it is the central nervous system that enables multiple simultaneous ADF operations far from Australia.",
      keyPoints: [
        "Acts as the central logistics and command hub for all ADF activities in the Middle East and surrounding areas.",
        "Enables rapid response and sustained presence without needing to fly everything from Australia every time.",
        "Critical enabler for any future larger commitment in the region."
      ]
    },
    {
      id: "pearce",
      title: "RAAF Base Pearce",
      overview: "Located in Western Australia, Pearce is the primary fighter pilot training base and also supports maritime patrol operations. It is strategically important for training and for operations across the Indian Ocean approaches.",
      whyItMatters: "Australia's ability to generate and sustain combat pilots depends heavily on Pearce. It is also a key western node for maritime surveillance and operations in the Indian Ocean.",
      commonMisconceptions: "Often overlooked compared to eastern bases. In reality it is vital for pilot production and for covering Australia's vast western and northwestern maritime areas.",
      keyPoints: [
        "Home to No.79 Squadron for basic fighter training and No.25 Squadron for lead-in fighter training on the Hawk 127.",
        "Regularly hosts maritime patrol aircraft and supports operations into the Indian Ocean and northwest approaches.",
        "Critical for maintaining pilot numbers and for training in the unique conditions of Western Australia."
      ]
    },
    {
      id: "darwin",
      title: "RAAF Base Darwin",
      overview: "Australia's northernmost major air base. It is a key forward location for air defence, exercises, and operations in the northern approaches. It regularly hosts US aircraft rotations under the Force Posture Initiative.",
      whyItMatters: "Darwin is the most forward major base for defending the northern approaches and for projecting power into Southeast Asia and the South China Sea region.",
      commonMisconceptions: "People think it is just a small forward base. It is actually a major hub that can surge significantly and hosts important allied rotations.",
      keyPoints: [
        "Strategically positioned as Australia's northernmost significant air base for rapid response and air defence.",
        "Hosts rotational US Air Force deployments including fighters and bombers, strengthening deterrence and interoperability.",
        "Serves as a critical node for operations and exercises in the northern approaches."
      ]
    },
    {
      id: "operation-gateway",
      title: "Operation Gateway",
      overview: "A long-running maritime surveillance operation focused on the Indian Ocean and South China Sea. It provides persistent intelligence on shipping movements and supports Australia's understanding of the regional maritime picture.",
      whyItMatters: "Australia depends on sea lanes for trade and security. Knowing who is moving where in our northern maritime approaches is fundamental to protecting national interests.",
      commonMisconceptions: "It is sometimes dismissed as 'just watching ships'. In reality it builds the detailed pattern-of-life understanding that allows detection of unusual or threatening activity.",
      keyPoints: [
        "Involves regular P-8A Poseidon deployments to provide wide-area maritime surveillance.",
        "Contributes to the overall picture of merchant and naval traffic in critical sea lanes.",
        "Has been running for decades and remains highly relevant in the current strategic environment."
      ]
    },
    {
      id: "tindal",
      title: "RAAF Base Tindal",
      overview: "A key forward operating base in the Northern Territory. Tindal is strategically located for operations across northern Australia and into the region. It is being developed as a more resilient and capable northern node.",
      whyItMatters: "Tindal allows the RAAF to operate fighters and other aircraft much closer to potential areas of interest without having to stage everything through more southern bases.",
      commonMisconceptions: "Often seen as secondary to Darwin. In reality it is becoming increasingly important as a dispersed and survivable operating location.",
      keyPoints: [
        "Regularly hosts F-35 and other combat aircraft for exercises and operations.",
        "Infrastructure upgrades are making it more capable of supporting sustained operations in the north.",
        "Part of the broader effort to make northern bases more resilient and distributed."
      ]
    }
    // More bases and operations can (and should) be added following the same listening-optimized format with whyItMatters and commonMisconceptions.
  ],

  // Group 2: Air Force, Navy, Army, Weapons & Systems
  "group2": [
    {
      id: "f35a",
      title: "F-35A Lightning II",
      overview: "Australia's fifth-generation stealth multirole fighter. The F-35A functions as a flying sensor fusion and command node. It does not just find and kill targets — it shares high-quality data with other aircraft, ships, and ground forces in real time, multiplying the power of the entire joint force.",
      whyItMatters: "The F-35 changes the character of air operations. Because it can operate inside contested airspace while feeding information to other platforms, it enables the rest of the force (Growlers, Super Hornets, Wedgetails, ships) to be far more effective and survivable.",
      commonMisconceptions: "A common mistake is to compare it only on speed or weapons load to 4th-gen fighters. Its real value is in stealth + sensor fusion + networking, not traditional dogfighting metrics.",
      keyPoints: [
        "APG-81 AESA radar is exceptionally powerful and difficult to detect, giving the pilot high situational awareness while the aircraft remains hard to find.",
        "Internal weapons carriage preserves low observability while still allowing it to carry advanced weapons such as AIM-120D and JSM maritime strike missiles.",
        "Advanced data fusion turns the aircraft into a node that dramatically increases the combat effectiveness of legacy platforms and ground forces through Link 16 and other links."
      ],
      img: "images/f35a.jpg"
    },
    {
      id: "growler",
      title: "EA-18G Growler",
      overview: "The world's only dedicated airborne electronic attack aircraft in service with a Western air force. The Growler does not just jam enemy radars — it can destroy them with HARM missiles and creates safe corridors for other aircraft to operate.",
      keyPoints: [
        "ALQ-99 jamming pods and ALQ-218 receiver give it the ability to detect, locate and suppress enemy air defences.",
        "Often works as a 'guardian' for strike packages, blinding enemy radars so the bombers and fighters can get through.",
        "Extremely high demand from the US Navy and allies because of its unique capability."
      ],
      img: "images/growler.jpg"
    },
    {
      id: "hobart",
      title: "Hobart-class Destroyer",
      overview: "Australia's Aegis-equipped Air Warfare Destroyers. These are the most capable surface combatants the RAN has ever operated and form the core of any major task group for air defence and long-range strike.",
      keyPoints: [
        "SPY-1D radar and Aegis combat system give world-class area air defence against aircraft and missiles.",
        "Can fire SM-2, SM-6 and ESSM missiles and are being upgraded with NSM for surface strike.",
        "Work closely with the F-35 and Growler to create a layered defence and strike capability."
      ],
      img: "images/hobart.jpg"
    },
    {
      id: "m1a1",
      title: "M1A1 Abrams Main Battle Tank",
      overview: "The Australian Army's heavy armour. The Abrams is designed to close with and destroy enemy armour while surviving hits that would destroy lighter vehicles. It is the centrepiece of the Army's combined arms manoeuvre capability.",
      whyItMatters: "Heavy armour gives the Army the ability to dominate the close fight and break through fortified positions that lighter forces cannot handle alone.",
      commonMisconceptions: "Some think tanks are obsolete in modern warfare. In reality they remain essential for breaking stalemates and providing protected firepower in high-threat environments.",
      keyPoints: [
        "120mm smoothbore gun with advanced ammunition gives it massive firepower against modern tanks and fortifications.",
        "Heavy armour and excellent fire control system make it very survivable on the modern battlefield.",
        "Works as part of a team with infantry in IFVs, attack helicopters and artillery."
      ],
      img: "images/abrams.jpg"
    },
    {
      id: "superhornet",
      title: "F/A-18F Super Hornet",
      overview: "The RAAF's current main strike fighter, operated by No.1 and No.6 Squadrons. It is a highly capable multirole aircraft that can perform air-to-air, air-to-ground, and maritime strike missions.",
      whyItMatters: "The Super Hornet provides the bulk of Australia's current air combat and strike capacity while the F-35 fleet builds up. It bridges the gap and will remain important for many years.",
      commonMisconceptions: "Often seen as just a 'legacy' aircraft compared to the F-35. In practice it is a very modern, highly capable platform that complements the F-35 extremely well.",
      keyPoints: [
        "Equipped with the APG-79 AESA radar, giving excellent detection and tracking performance.",
        "Can carry a wide range of weapons including the JSM for long-range maritime strike.",
        "Works closely with the Growler for electronic attack support during strike missions."
      ],
      img: "images/superhornet.jpg"
    },
    {
      id: "poseidon",
      title: "P-8A Poseidon",
      overview: "The RAAF's primary maritime patrol and anti-submarine warfare aircraft. Operated by No.11 and No.12 Squadrons, the Poseidon provides long-range surveillance, submarine hunting, and strike capability over vast ocean areas.",
      whyItMatters: "Australia has one of the largest maritime areas in the world. The Poseidon is essential for finding submarines, tracking surface vessels, and providing persistent ISR across the Indo-Pacific.",
      commonMisconceptions: "People sometimes think of it only as a 'patrol plane'. It is in fact a heavily armed maritime combat aircraft capable of independent strike and anti-submarine warfare.",
      keyPoints: [
        "Long endurance and advanced sensors allow it to cover enormous areas of ocean for extended periods.",
        "Equipped with torpedoes, Harpoon missiles, and sonobuoys for hunting and engaging submarines and surface ships.",
        "Works in close coordination with the Navy's surface fleet and helicopters for layered maritime operations."
      ],
      img: "images/poseidon.mp4"
    },
    {
      id: "wedgetail",
      title: "E-7A Wedgetail",
      overview: "Australia's airborne early warning and control aircraft. The Wedgetail provides 360-degree radar coverage and acts as an airborne command post, directing fighters, managing the battlespace, and linking everything together.",
      whyItMatters: "In modern air operations, whoever controls the information controls the battle. The Wedgetail multiplies the effectiveness of every other platform by providing real-time situational awareness and direction.",
      commonMisconceptions: "Some view it as just a 'radar plane'. In reality it is a flying headquarters that can manage complex air operations involving dozens of aircraft and coordinate with ground and naval forces.",
      keyPoints: [
        "MESA radar provides true 360-degree coverage with very long range detection of aircraft and ships.",
        "Can direct fighters, coordinate strikes, and manage the entire air picture from a safe distance.",
        "One of the most advanced AEW&C systems in the world and a major force multiplier for the entire ADF."
      ],
      img: "images/wedgetail.mp4"
    },
    {
      id: "jassm",
      title: "JASSM - AGM-158",
      overview: "The Joint Air-to-Surface Standoff Missile is a long-range, stealthy cruise missile designed to strike high-value targets from outside the range of most enemy air defences. It gives Australia a significant stand-off strike capability.",
      whyItMatters: "For the first time, Australia has a weapon that can reliably reach well-defended targets deep inside an adversary's territory without putting aircraft at extreme risk.",
      commonMisconceptions: "It is sometimes thought of as just 'another bomb'. It is actually a sophisticated, low-observable cruise missile with a large warhead and significant range.",
      keyPoints: [
        "Stealthy design and long range allow launch aircraft to stay outside most surface-to-air missile envelopes.",
        "Carried by the F-35A and Super Hornet, dramatically extending Australia's strike reach.",
        "Being integrated with the F-35 gives Australia one of the most survivable long-range strike options in the region."
      ]
    },
    {
      id: "collins",
      title: "Collins-class Submarine",
      overview: "Australia's current diesel-electric attack submarines. The Collins boats are large, capable, and quiet for their class. They provide Australia with a potent undersea warfare and intelligence collection capability.",
      whyItMatters: "Submarines are one of the most effective ways to impose costs on an adversary in the maritime domain. They can operate undetected for long periods and strike when least expected.",
      commonMisconceptions: "People sometimes dismiss diesel subs as inferior to nuclear boats. In the shallow, noisy waters around Australia and Southeast Asia, well-handled conventional submarines can be extremely dangerous.",
      keyPoints: [
        "Large size for a conventional submarine gives good endurance and the ability to carry a significant weapons load.",
        "Very quiet when operating on battery, making them difficult to detect in the right conditions.",
        "Provide both anti-shipping strike and intelligence gathering deep in adversary areas."
      ],
      img: "images/collins.mp4"
    },
    {
      id: "bushmaster",
      title: "Bushmaster Protected Mobility Vehicle",
      overview: "The Australian Army's workhorse protected vehicle. The Bushmaster is designed to carry troops safely in high-threat environments while providing good mobility and protection against mines and IEDs.",
      whyItMatters: "It allows infantry to move through dangerous areas with a much higher chance of surviving mines and ambushes than soft-skinned vehicles.",
      commonMisconceptions: "Often seen as just 'an armoured truck'. It is a purpose-designed protected mobility vehicle that has saved many lives in Afghanistan and other operations.",
      keyPoints: [
        "V-shaped hull and high ground clearance provide excellent protection against under-vehicle blasts.",
        "Can carry a section of infantry plus the crew with good situational awareness and firepower options.",
        "Has become the standard vehicle for many Army units operating in contested or IED-prone environments."
      ],
      img: "images/bushmaster.mp4"
    }
    // Add more high-priority platforms here following the same pattern. Aim for variety across air, land, sea, and weapons.
  ],

  // Group 3: Space, Cyberspace, Ranks, Leadership, National Defence
  "group3": [
    {
      id: "space-ops-officer",
      title: "Space Operations Officer Role",
      overview: "Space Operations Officers are responsible for protecting Australia's access to space and using space capabilities to support operations on Earth. In a contested environment, they must understand threats to satellites and how to maintain critical services even when things are being attacked.",
      keyPoints: [
        "Key threats include anti-satellite missiles, jamming, cyber attacks on ground stations, and the growing problem of space debris.",
        "Resilience is more important than perfect protection — being able to operate with degraded or lost capabilities is essential.",
        "Australia works closely with the US and other allies through initiatives like the Combined Space Operations Center."
      ]
    },
    {
      id: "cyber-warfare-officer",
      title: "Cyber Warfare Officer",
      overview: "Cyber Warfare Officers defend Australian networks and conduct operations in cyberspace to support military objectives. In modern conflict, the first shots may be fired in cyberspace long before any physical movement occurs.",
      keyPoints: [
        "Defensive cyber is about protecting the networks that everything else depends on — from logistics to command systems.",
        "Offensive cyber can disrupt enemy command, control, air defences and logistics without firing a traditional weapon.",
        "Attribution is difficult, which makes cyber a domain where speed of detection and response matters enormously."
      ]
    },
    {
      id: "mission-command",
      title: "Mission Command Philosophy",
      overview: "Mission Command is the ADF's command philosophy. It gives subordinates the freedom to decide how to achieve the commander's intent, rather than waiting for detailed orders. This is essential in fast-moving, uncertain environments.",
      keyPoints: [
        "Built on three pillars: trust, shared understanding, and clear commander's intent.",
        "The commander states what needs to be achieved and why, then allows subordinates maximum freedom in how they do it.",
        "This philosophy is one of the biggest differentiators between professional Western forces and more rigid adversaries."
      ]
    },
    {
      id: "national-defence-strategy",
      title: "2026 National Defence Strategy - Core Idea",
      overview: "Australia has shifted to a strategy of 'denial' in our immediate region. The goal is to make any potential aggressor calculate that the cost of attacking Australia or our interests would be too high, rather than trying to defeat them in a distant war.",
      whyItMatters: "This is a fundamental shift from expeditionary thinking to defending the homeland and region from our own shores. It changes what capabilities we need and where we need to be able to operate.",
      commonMisconceptions: "Some still think in terms of 'defeating' an enemy far away. The new strategy accepts we may not be able to do that and instead focuses on making any attack prohibitively expensive from the start.",
      keyPoints: [
        "Focus is on the 'five tasks' and being able to hold an adversary at risk from our own territory and waters.",
        "This requires long-range strike, resilient bases, a larger Navy and Army that can operate in our northern approaches.",
        "The strategy accepts that we may have to fight with what we have at the start of a conflict, so readiness and stockpiles matter enormously."
      ]
    },
    {
      id: "space-debris-threat",
      title: "Space Debris and Congestion",
      overview: "The space around Earth is becoming increasingly crowded with satellites and debris. Even small pieces of debris traveling at orbital speeds can destroy satellites, and the problem is growing with every new launch and collision.",
      whyItMatters: "Australia and its allies rely heavily on space for communications, navigation, intelligence, and missile warning. Losing access to space capabilities would cripple modern military operations almost immediately.",
      commonMisconceptions: "Many assume space is 'big and empty'. In key orbits it is actually becoming quite congested, and the Kessler syndrome risk (cascading collisions) is real.",
      keyPoints: [
        "Even tiny debris can destroy multi-billion dollar satellites because of the extreme speeds involved in orbit.",
        "Australia is working with allies to improve space domain awareness so we can better track what is happening overhead.",
        "Resilient and redundant systems on the ground and in orbit are becoming essential as space becomes more contested."
      ]
    },
    {
      id: "ranks-commissioned",
      title: "Commissioned Officer Ranks",
      overview: "Commissioned officers hold the Queen's (or King's) commission and are responsible for command, leadership, and the overall direction of military forces. The rank structure creates a clear chain of command from junior officers up to the Chief of the Defence Force.",
      whyItMatters: "Officers are ultimately responsible for the lives of their people and the success of missions. Understanding the rank structure helps you know who is in charge and how decisions flow in any operation.",
      commonMisconceptions: "Civilians often assume higher rank automatically means more technical expertise. In reality, senior officers are primarily leaders and decision-makers; deep technical knowledge often sits with more junior specialists.",
      keyPoints: [
        "The structure runs from Second Lieutenant up through to General/Admiral ranks, with clear levels of command responsibility at each step.",
        "Promotion is based on a combination of performance, potential, and the needs of the service.",
        "The highest ranks (O-7 and above) are joint and strategic leaders responsible for large formations or entire services."
      ]
    },
    {
      id: "leadership-mission-command",
      title: "Mission Command in Practice",
      overview: "Mission Command is the ADF's preferred command philosophy. It means telling subordinates what needs to be achieved and why, then giving them maximum freedom in how they achieve it. It is designed for complex, fast-moving environments where detailed orders quickly become outdated.",
      whyItMatters: "In modern warfare and operations, the side that can make good decisions faster usually wins. Mission Command enables speed and initiative at every level instead of waiting for orders from above.",
      commonMisconceptions: "Some think it means 'do whatever you want'. In reality it requires very clear commander's intent and a high level of trust and shared understanding throughout the force.",
      keyPoints: [
        "Success depends on three things: clear intent from the commander, competence and initiative at every level, and mutual trust.",
        "It is the opposite of micromanagement and is one of the key cultural differences between Western professional forces and more centralised adversaries.",
        "Training and education are essential so that people at every level understand the commander's intent deeply enough to act when communications fail."
      ]
    },
    {
      id: "ranks-senior-enlisted",
      title: "Senior Enlisted Ranks (Warrant Officers)",
      overview: "Warrant Officers are the most senior non-commissioned members in the ADF. They sit at the top of the enlisted structure and serve as the principal advisers to commanders on matters affecting soldiers, sailors, and airmen.",
      whyItMatters: "The senior enlisted voice is critical. Commanders rely on Warrant Officers to understand the lived experience of the force and to translate intent down and feedback up the chain.",
      commonMisconceptions: "Civilians often think all senior leaders are officers. In reality the most experienced people on the 'shop floor' are usually senior warrant officers with decades of hands-on service.",
      keyPoints: [
        "They are the link between the commissioned officer corps and the enlisted force.",
        "They carry enormous institutional knowledge and are often the ones who make complex plans actually work on the ground.",
        "Each service has a senior warrant officer who advises the service chief directly (e.g., Warrant Officer of the Air Force, etc.)."
      ]
    },
    {
      id: "cyber-threat-china",
      title: "Chinese State Cyber Threat",
      overview: "China is assessed as the most significant state-based cyber threat to Australia. Multiple sophisticated actors, including those linked to the Ministry of State Security and People's Liberation Army, conduct persistent espionage against government, defence, and critical infrastructure targets.",
      whyItMatters: "China's cyber operations are aimed at stealing intellectual property, understanding Australian decision-making, and preparing the battlefield for potential future conflict. This is not opportunistic crime — it is strategic, state-directed activity.",
      commonMisconceptions: "Some still believe the main cyber threat is from criminals or lone hackers. State actors, particularly China, represent a far more persistent and capable threat with resources and long-term objectives.",
      keyPoints: [
        "Chinese actors have demonstrated the ability and willingness to target Australian defence industry and government networks at scale.",
        "They often use living-off-the-land techniques and supply-chain compromise to maintain access for years.",
        "Defending against this threat requires both technical measures and a whole-of-society awareness of the strategic nature of the activity."
      ]
    },
    {
      id: "space-satellites",
      title: "Military Use of Satellites",
      overview: "Satellites provide critical capabilities including communications, navigation (GPS), missile warning, intelligence collection, and weather data. Modern military operations are almost impossible to conduct effectively without reliable access to space-based services.",
      whyItMatters: "Everything from precision-guided weapons to real-time video feeds to secure communications depends on satellites. An adversary that can disrupt these services gains an enormous advantage.",
      commonMisconceptions: "Many people think of satellites as 'up there and safe'. In reality they are vulnerable to jamming, cyber attack, directed energy, and anti-satellite missiles.",
      keyPoints: [
        "GPS is used for navigation, timing, and guiding weapons — disrupting it affects far more than just maps.",
        "Australia is investing in its own sovereign satellite communications and space domain awareness capabilities.",
        "Resilience (having backups and being able to operate in a degraded environment) is now a core requirement."
      ]
    },
    {
      id: "space-asat-threat",
      title: "Anti-Satellite (ASAT) Weapons",
      overview: "Anti-satellite weapons are designed to destroy or disable satellites in orbit. They can be ground-launched missiles, co-orbital killers, or even directed energy weapons from the ground or space.",
      whyItMatters: "A successful ASAT attack could blind Australia and its allies in the opening hours of a conflict by taking out critical communications, navigation, and intelligence satellites.",
      commonMisconceptions: "Some believe space is too vast for ASATs to be practical. In reality, many satellites are in predictable orbits and relatively easy to target with modern missiles.",
      keyPoints: [
        "China and Russia have both demonstrated direct-ascent ASAT capabilities in tests.",
        "Even the debris from a destroyed satellite can create long-lasting hazards for all space operations (Kessler syndrome risk).",
        "Defending satellites is extremely difficult; the emphasis is on resilience, redundancy, and rapid replacement rather than perfect protection."
      ]
    },
    {
      id: "space-domain-awareness",
      title: "Space Domain Awareness",
      overview: "Space Domain Awareness is the ability to detect, track, and characterize objects in space — satellites, debris, and potential threats. It is the foundation for protecting friendly space assets and understanding adversary activities.",
      whyItMatters: "Without good awareness, you cannot know if your satellites are being targeted or if an adversary is positioning assets for an attack. It is the 'eyes and ears' of space operations.",
      commonMisconceptions: "Many assume we can see everything in space easily. Tracking small objects and determining their intent is actually very difficult and resource-intensive.",
      keyPoints: [
        "Australia is developing sovereign space surveillance capabilities, including radar and optical sensors.",
        "Close cooperation with the US (through Combined Space Operations) greatly multiplies our awareness.",
        "Knowing the 'pattern of life' in space allows us to spot unusual behavior that might indicate preparation for conflict."
      ]
    },
    {
      id: "space-australian-space-command",
      title: "Defence Space Command",
      overview: "Defence Space Command is the ADF's dedicated organisation for space operations, capability development, and integration of space into joint operations. It was established to give space the organisational focus it deserves.",
      whyItMatters: "Space is now recognised as a critical domain. Having a dedicated command ensures space considerations are properly represented in planning and that we develop the people and capabilities needed.",
      commonMisconceptions: "Some think this is Australia trying to become a space superpower. It is actually a modest but important step to better protect our access to space and use space capabilities effectively.",
      keyPoints: [
        "Responsible for space operations, space capability development, and space domain awareness for the ADF.",
        "Works closely with the Australian Space Agency and international partners.",
        "Critical for ensuring the ADF can operate effectively in a contested space environment."
      ]
    },
    {
      id: "cyber-supply-chain-attacks",
      title: "Supply Chain Cyber Attacks",
      overview: "Instead of attacking a target directly, sophisticated actors compromise a supplier, software provider, or hardware manufacturer so that the malicious code or backdoor is delivered as part of a legitimate product or update.",
      whyItMatters: "This is one of the most effective ways to get inside well-defended networks. If the compromise happens before the equipment or software even reaches you, traditional defences are bypassed.",
      commonMisconceptions: "Many organisations still focus almost exclusively on their own perimeter. Supply chain attacks show that your security is only as strong as the weakest link in your entire supply chain.",
      keyPoints: [
        "SolarWinds and similar incidents showed how one compromised update can affect thousands of organisations worldwide.",
        "Defence and critical infrastructure are high-value targets for these types of attacks.",
        "Rigorous vendor assessment, software bill of materials, and assuming breach are now essential practices."
      ]
    },
    {
      id: "cyber-information-operations",
      title: "Information Operations & Influence",
      overview: "Cyber is not only about networks and data. It is also used as a vector for information operations — shaping narratives, spreading disinformation, and influencing public opinion and decision-making in target countries.",
      whyItMatters: "Modern conflict is fought in the information domain as much as the physical one. An adversary can achieve strategic effects by eroding public confidence, sowing division, or shaping the information environment before any shots are fired.",
      commonMisconceptions: "Some still separate 'cyber' (technical) from 'information operations'. In practice the two are deeply connected — cyber tools are frequently used to enable influence activities.",
      keyPoints: [
        "Social media, news sites, and official-looking accounts can all be targeted or used as vectors for influence.",
        "Attribution is deliberately made difficult so the attacking state can maintain plausible deniability.",
        "Building societal resilience to disinformation is now part of national security."
      ]
    },
    {
      id: "ranks-lieutenant-colonel",
      title: "Lieutenant Colonel (O-5) / Wing Commander",
      overview: "A Lieutenant Colonel or Wing Commander is a senior officer who usually commands a battalion-sized unit or serves in significant staff roles at brigade or higher level. They are experienced leaders responsible for hundreds of people and complex tactical operations.",
      whyItMatters: "This is a critical rank where officers move from direct tactical leadership into planning and directing larger formations. Performance at this level heavily influences who reaches senior command.",
      commonMisconceptions: "The rank is sometimes seen as 'mostly staff work'. In reality, commanding officers at this level still carry direct responsibility for the lives of their people and the success of their missions.",
      keyPoints: [
        "Typically commands 500–800 personnel or leads a major staff branch (operations, plans, logistics).",
        "Responsible for training, readiness, welfare, and operational output of their unit or formation.",
        "Many future one-star and two-star officers are identified and developed at this rank."
      ]
    },
    {
      id: "ranks-colonel",
      title: "Colonel (O-6) / Group Captain",
      overview: "A Colonel or Group Captain is a senior officer who commands brigade-sized formations, major bases, or holds significant joint or service-level staff appointments. They operate at the operational level and are key advisers to one-star and two-star commanders.",
      whyItMatters: "Colonels are the link between tactical execution and strategic direction. They turn higher-level guidance into executable plans and are responsible for the overall effectiveness of large organisations.",
      commonMisconceptions: "People sometimes assume this rank is purely administrative. Many colonels still command significant combat formations or critical enabling organisations.",
      keyPoints: [
        "Usually commands a brigade (several thousand personnel) or holds a senior staff role at division or service headquarters.",
        "Responsible for integrating multiple units and capabilities into coherent operations.",
        "This is the last rank before officers are seriously considered for general/admiral officer appointments."
      ]
    },
    {
      id: "leadership-trust",
      title: "Trust in Leadership",
      overview: "Trust is the foundation of effective leadership in the ADF. Subordinates must trust that their leaders are competent, care about them, and will make good decisions. Leaders must trust that their people will do the right thing when left to their own initiative.",
      whyItMatters: "Without trust, Mission Command collapses. People will not take initiative if they fear being second-guessed or punished for honest mistakes, and leaders will not delegate if they do not believe their teams are capable.",
      commonMisconceptions: "Some believe trust is just about being 'nice' or popular. Real trust is built on consistent competence, integrity, and genuine care for people over time.",
      keyPoints: [
        "Trust is earned slowly and lost quickly. One major breach can take years to repair.",
        "Leaders build trust by being competent, consistent, transparent where possible, and by looking after their people.",
        "High-trust organisations can operate much faster and more effectively than low-trust ones, especially when communications are degraded."
      ]
    },
    {
      id: "national-defence-deterrence-by-denial",
      title: "Deterrence by Denial",
      overview: "The core idea of Australia's current strategy is to deter potential adversaries by making it clear that any attempt to attack or coerce Australia would be extremely costly and unlikely to succeed — rather than trying to threaten retaliation after the fact.",
      whyItMatters: "This is a shift from being able to 'defeat' an enemy far from our shores to being able to stop them from achieving their objectives in the first place, close to our region and territory.",
      commonMisconceptions: "Some still think in terms of 'punishing' an attacker after the fact. Deterrence by denial is about convincing them not to try in the first place because the attempt itself will fail or be too expensive.",
      keyPoints: [
        "Requires credible capabilities that can actually hold an adversary's forces at risk (long-range strike, resilient bases, capable maritime forces).",
        "Also requires the will to use those capabilities and the resilience to absorb and recover from initial attacks.",
        "Success is measured by an adversary deciding that the costs and risks of aggression are too high."
      ]
    },
    {
      id: "national-defence-aukus",
      title: "AUKUS and Nuclear-Powered Submarines",
      overview: "AUKUS is a trilateral security partnership between Australia, the UK, and the US. Its most prominent element is Australia's acquisition of nuclear-powered submarines, which will give Australia a much more capable, longer-range, and stealthier undersea platform than the current Collins class.",
      whyItMatters: "Nuclear-powered submarines dramatically increase Australia's ability to operate persistently and stealthily across the vast distances of the Indo-Pacific, providing a powerful conventional deterrent.",
      commonMisconceptions: "Some believe Australia is acquiring nuclear weapons. AUKUS is about conventionally armed, nuclear-powered submarines only. The boats will not carry nuclear weapons.",
      keyPoints: [
        "Nuclear propulsion gives submarines much greater speed, endurance, and stealth compared with diesel-electric boats.",
        "The program will take decades and involves major investment in infrastructure, workforce, and regulatory frameworks.",
        "It represents the biggest single capability investment in Australian defence history and a major deepening of the alliance with the United States."
      ]
    },
    {
      id: "space-resilience",
      title: "Space Resilience and Redundancy",
      overview: "Space resilience means designing systems so that the loss of individual satellites or ground stations does not cause mission failure. This includes having backup satellites, alternative communication paths, and the ability to operate with degraded space support.",
      whyItMatters: "An adversary will almost certainly try to attack our space capabilities in a conflict. The ADF that can continue to fight effectively with reduced space support will have a major advantage.",
      commonMisconceptions: "Resilience is not just about having 'spares'. It also requires training people to operate when GPS is jammed, satellite comms are down, or imagery is unavailable.",
      keyPoints: [
        "Modern forces are heavily dependent on space; operating without it requires significant changes to tactics and procedures.",
        "Australia is investing in more distributed and resilient satellite architectures rather than a small number of high-value assets.",
        "Regular training in GPS-denied and communications-denied environments is now essential."
      ]
    },
    {
      id: "cyber-red-team",
      title: "Red Teaming and Offensive Cyber Testing",
      overview: "Red teams are authorised friendly forces that attack an organisation's networks and systems using the same techniques as real adversaries. Their job is to find weaknesses before the real enemy does.",
      whyItMatters: "You cannot defend what you do not understand. Regular, realistic red teaming is one of the best ways to discover vulnerabilities and test whether defences actually work.",
      commonMisconceptions: "Some leaders see red team findings as criticism of their team. Good red teaming is a gift — it shows you where you are vulnerable so you can fix it before an adversary exploits it.",
      keyPoints: [
        "Effective red teams use the same tools, tactics, and persistence as real threat actors.",
        "The best results come when red team findings are treated as valuable intelligence rather than a report card.",
        "The ADF and its industry partners conduct regular red team activities against critical systems."
      ]
    },
    {
      id: "ranks-brigadier",
      title: "Brigadier (O-7) / Air Commodore",
      overview: "A Brigadier or Air Commodore is a one-star officer. They typically command brigades, major formations, or hold senior joint appointments. This is the first general/admiral officer rank and marks the transition into strategic leadership.",
      whyItMatters: "One-star officers are the first level of truly joint and strategic leadership. They are responsible for integrating multiple capabilities and advising two-star and three-star commanders.",
      commonMisconceptions: "The jump from Colonel to Brigadier is not just 'more of the same'. It is a fundamental shift from commanding a unit to leading at the formation and strategic level.",
      keyPoints: [
        "Commands formations of several thousand personnel or holds senior appointments in joint headquarters.",
        "Responsible for major capability programs, operational planning, and advising government through the chain of command.",
        "Promotion to this rank is highly competitive and signals that an officer is being groomed for the most senior roles."
      ]
    },
    {
      id: "leadership-cohesion",
      title: "Unit Cohesion and Morale",
      overview: "Cohesion is the bond that holds a team together under stress. It is built through shared hardship, trust, competence, and belief in the mission. High-cohesion units can achieve far more than the sum of their individual members.",
      whyItMatters: "In combat and high-stress operations, cohesion is often the difference between success and failure, and between people staying in the force or leaving. It cannot be ordered — it must be earned.",
      commonMisconceptions: "Some leaders believe cohesion comes from social events and 'fun' activities. Real cohesion comes from shared challenge, mutual respect, and confidence that your mates will not let you down.",
      keyPoints: [
        "Cohesion is built over time through realistic training, shared adversity, and leaders who genuinely care for their people.",
        "It is fragile — one or two bad leaders or toxic incidents can destroy years of work.",
        "The ADF invests heavily in team-building, welfare, and leadership development precisely because cohesion is a combat multiplier."
      ]
    },
    {
      id: "national-defence-guided-weapons",
      title: "Guided Weapons and Explosive Ordnance Enterprise",
      overview: "Australia is building a domestic guided weapons manufacturing and sustainment capability. This includes missiles, rockets, bombs, and the industrial base needed to produce and maintain them at scale during a conflict.",
      whyItMatters: "In a high-intensity conflict, stockpiles of precision weapons will be consumed extremely quickly. Being able to produce and replenish them domestically is a critical strategic vulnerability that must be addressed.",
      commonMisconceptions: "Some believe we can simply buy more weapons from overseas when we need them. In a major conflict, supply chains will be contested and our allies will have their own massive demands.",
      keyPoints: [
        "The enterprise includes both sovereign manufacturing and deep integration with US and allied production lines.",
        "It covers the full spectrum from small precision munitions up to long-range strike weapons.",
        "Sustaining this capability in peacetime is expensive but essential for credible deterrence and the ability to fight a prolonged campaign."
      ]
    },
    {
      id: "space-counterspace",
      title: "Counter-Space Operations",
      overview: "Counter-space operations are actions taken to deny an adversary the use of space capabilities. This includes jamming satellite communications, attacking ground stations, dazzling sensors, or destroying satellites themselves.",
      whyItMatters: "An adversary that can blind or degrade our space support while protecting their own will have a massive advantage in any conflict. Counter-space is now a core part of modern warfare.",
      commonMisconceptions: "Some believe counter-space is only about blowing up satellites. In practice, reversible effects like jamming and dazzling are often more attractive because they are harder to attribute and less escalatory.",
      keyPoints: [
        "Jamming and electronic attack against satellite links is already common in contested regions.",
        "Ground stations and control links are often more vulnerable than the satellites themselves.",
        "The ADF must train and equip to operate when space support is degraded or denied."
      ]
    },
    {
      id: "cyber-offensive-operations",
      title: "Offensive Cyber Operations",
      overview: "Offensive cyber operations use cyber tools to disrupt, degrade, or destroy an adversary's networks, systems, and data in support of military objectives. This can range from temporary disruption of command systems to permanent damage of critical infrastructure.",
      whyItMatters: "Offensive cyber is a powerful tool that can achieve effects traditionally requiring kinetic strikes, often with lower risk to our own forces and less collateral damage.",
      commonMisconceptions: "Many assume offensive cyber is only about 'hacking'. It is a full military capability that requires targeting, planning, deconfliction, and integration with other operations — just like any other weapon system.",
      keyPoints: [
        "Effects can be reversible (temporary disruption) or irreversible (data destruction or physical damage via cyber means).",
        "Attribution and escalation control are major challenges — the defender may not know who attacked them or why.",
        "The ADF maintains offensive cyber capabilities that can be employed in support of joint operations."
      ]
    },
    {
      id: "ranks-commander",
      title: "Commander (O-5 Navy) / Lieutenant Colonel equivalent",
      overview: "In the Navy, a Commander is the equivalent of a Lieutenant Colonel. They often command major warships (frigates, destroyers, submarines) or serve as executive officers on larger vessels and in senior staff roles.",
      whyItMatters: "Commanding a warship is one of the most demanding leadership roles in the ADF. Commanders at sea are responsible for the ship, its crew, and the mission with very limited higher support.",
      commonMisconceptions: "The title 'Commander' can be confusing because it is both a rank and a position. Not every person in command of a ship is the rank of Commander.",
      keyPoints: [
        "Commands major surface combatants or submarines, or fills key staff appointments ashore.",
        "Responsible for the fighting efficiency, safety, and welfare of several hundred sailors.",
        "Sea command at this level is a major career milestone and a key test for further promotion."
      ]
    },
    {
      id: "leadership-values",
      title: "ADF Values and Behaviours",
      overview: "The ADF has a set of core values — Courage, Integrity, Respect, and Excellence — that are expected to guide the behaviour of all members. These values are not just posters on the wall; they are meant to shape how people treat each other and make decisions under pressure.",
      whyItMatters: "Values and culture determine how an organisation behaves when no one is watching. In the military, poor values lead to toxic cultures, ethical failures, and ultimately mission failure.",
      commonMisconceptions: "Some think values training is 'soft'. In reality, values-based leadership is one of the hardest and most important parts of command, especially when it means making unpopular decisions or holding people to account.",
      keyPoints: [
        "Courage includes both physical courage and the moral courage to do the right thing when it is difficult.",
        "Integrity means being honest with yourself, your people, and your superiors — even when it is uncomfortable.",
        "Leaders are responsible for the culture of their unit. You cannot outsource values to the training system."
      ]
    },
    {
      id: "national-defence-northern-bases",
      title: "Northern Bases and Dispersal",
      overview: "Australia is investing heavily in making its northern bases more resilient and distributed. Instead of concentrating forces in a few large, vulnerable locations, the strategy emphasises dispersal, hardening, and the ability to operate from multiple smaller airfields and ports.",
      whyItMatters: "Concentrated bases are easy targets for long-range missiles. A more dispersed and resilient posture makes it much harder for an adversary to achieve a decisive first strike.",
      commonMisconceptions: "Some think this is just about building more runways. It also requires fuel storage, maintenance facilities, command and control, and the ability to rapidly move people and aircraft between locations.",
      keyPoints: [
        "Major upgrades are underway at existing northern bases plus development of additional dispersal locations.",
        "The goal is to be able to absorb attacks and keep operating rather than having everything destroyed in the first wave.",
        "This requires significant investment in infrastructure, logistics, and the ability to operate with limited centralised support."
      ]
    },
    {
      id: "cyber-volt-typhoon",
      title: "Volt Typhoon (Chinese Cyber Actor)",
      overview: "Volt Typhoon is a sophisticated Chinese state-sponsored cyber group focused on pre-positioning inside critical infrastructure networks (energy, water, transport, communications) for potential disruptive attacks in a future conflict.",
      whyItMatters: "This represents a shift from espionage to preparation for wartime sabotage. If conflict breaks out, these actors could cause blackouts, disrupt logistics, and create chaos behind the lines.",
      commonMisconceptions: "People often think cyber threats are mainly about stealing data. Volt Typhoon shows the growing risk of destructive, pre-planted capabilities designed to cause real-world effects.",
      keyPoints: [
        "The group prefers 'living off the land' techniques — using existing tools on the network to avoid detection.",
        "They have shown particular interest in operational technology (OT) systems that control physical infrastructure.",
        "Defence against this requires strong network segmentation, monitoring for unusual behavior, and rapid incident response capabilities."
      ]
    },
    {
      id: "cyber-resilience",
      title: "Cyber Resilience",
      overview: "Cyber resilience is the ability to continue operating effectively even when networks are under attack or partially compromised. It accepts that perfect prevention is impossible and focuses on detection, response, and recovery.",
      whyItMatters: "In a real conflict, Australian networks will be attacked. The side that can keep fighting with degraded systems will have a major advantage.",
      commonMisconceptions: "Resilience is not the same as 'backup and restore'. It includes operating in disconnected or contested environments and having manual workarounds.",
      keyPoints: [
        "Key elements include redundant systems, offline capabilities, well-trained people who can work without computers, and rapid recovery plans.",
        "The ADF is increasingly designing systems and procedures that can function with limited or no network access.",
        "Regular realistic exercises are essential to test whether resilience plans actually work under pressure."
      ]
    },
    {
      id: "ranks-lieutenant",
      title: "Lieutenant (O-2)",
      overview: "A Lieutenant is a junior commissioned officer, typically in their early to mid-20s. They command small teams (platoons in the Army, watches or departments at sea, flights in the Air Force) and are responsible for the welfare, training, and performance of their people.",
      whyItMatters: "Lieutenants are the first level of commissioned leadership. How they lead their small teams sets the tone for the entire organisation and directly affects retention and combat effectiveness.",
      commonMisconceptions: "Some believe junior officers just give orders. In reality they spend most of their time leading by example, solving problems for their team, and translating higher intent into action.",
      keyPoints: [
        "Usually commands 20-40 people (a platoon, a watch section, or a small flight).",
        "Responsible for individual training, welfare, discipline, and small-unit tactics or procedures.",
        "The rank where most officers learn the real craft of leadership under pressure."
      ]
    },
    {
      id: "ranks-captain",
      title: "Captain (O-3) / Flight Lieutenant",
      overview: "A Captain (Army/Navy) or Flight Lieutenant (Air Force) is an experienced junior officer. They often command companies, larger departments, or flights, and serve as staff officers or instructors. This is where officers start taking on broader responsibilities.",
      whyItMatters: "Captains are the backbone of tactical leadership. They turn strategic direction into executable plans and are usually the last officers who still know every person in their unit by name.",
      commonMisconceptions: "The rank is sometimes underestimated because it is still 'junior officer'. In practice, Captains run most day-to-day operations and training in the ADF.",
      keyPoints: [
        "Typically commands 100+ people or leads a significant staff function.",
        "Often serves as a company commander, operations officer, or specialist instructor.",
        "This is the rank where many officers decide whether they want a long-term military career."
      ]
    },
    {
      id: "ranks-major",
      title: "Major (O-4) / Squadron Leader",
      overview: "A Major or Squadron Leader is a senior junior officer who typically commands a sub-unit (company/squadron) or works as a key staff officer at battalion or higher level. They are expected to think and plan at the tactical-to-operational level.",
      whyItMatters: "Majors are where real staff work and sub-unit command happens. They bridge the gap between the 'doing' ranks and higher command, and are critical for planning and executing operations.",
      commonMisconceptions: "People often think majors are 'just staff officers'. Many are still commanding combat sub-units and making life-and-death decisions in the field.",
      keyPoints: [
        "Usually commands 100-200 people or is a primary staff officer for operations, plans, or logistics.",
        "Responsible for writing and executing complex plans that involve multiple sub-units.",
        "This is a key rank for promotion — performance here heavily influences whether someone reaches senior ranks."
      ]
    },
    {
      id: "national-defence-five-tasks",
      title: "The Five Tasks of the 2026 National Defence Strategy",
      overview: "The strategy defines five core tasks the ADF must be able to perform: defend Australia, contribute to the security of the immediate region, contribute to stability in the broader Indo-Pacific, support global security, and shape the strategic environment.",
      whyItMatters: "These five tasks replace the old 'defence of Australia' plus expeditionary thinking. They force the ADF to be ready to operate across a spectrum from homeland defence to coalition operations.",
      commonMisconceptions: "Some still believe the ADF's main job is 'defending Australia from invasion'. The strategy makes clear we must be able to act earlier and further afield to prevent threats from reaching our shores.",
      keyPoints: [
        "Task 1 is still the most important: the ability to defend Australia and its territories.",
        "Tasks 2 and 3 focus on our immediate region and the broader Indo-Pacific — where most future risk lies.",
        "The strategy accepts we may need to do several of these tasks simultaneously in a crisis."
      ]
    },
    {
      id: "national-defence-long-range-strike",
      title: "Long Range Strike Capability",
      overview: "A major pillar of the new strategy is the ability to hold adversary forces at risk from Australian territory using long-range missiles, aircraft, and (eventually) submarines. This includes HIMARS, Tomahawk, JASSM-ER, and future hypersonic weapons.",
      whyItMatters: "Long-range strike allows Australia to deter aggression by threatening high-value targets deep in an adversary's operating areas without needing to put our own forces in immediate danger.",
      commonMisconceptions: "Many assume this is just about buying missiles. It also requires resilient basing, targeting intelligence, command and control, and the ability to sustain operations under attack.",
      keyPoints: [
        "The ADF is acquiring land-based long-range precision strike systems (HIMARS with precision rockets and Tomahawk).",
        "The F-35A and future bombers will carry standoff weapons like JASSM-ER.",
        "AUKUS will eventually give Australia nuclear-powered submarines with long-range strike options."
      ]
    }
  ]
};

// Public / OSINT "latest known" position data for the Operations map live layers.
// True real-time public tracking of military aircraft and ships is very limited (many assets do not broadcast for security).
// Aircraft layer uses the free OpenSky Network public API (civil + occasional military squawks).
// Ship / adversary layers are illustrative last-reported / open source intelligence examples (manually curated, not live).
const ADF_SHIPS_LAST_KNOWN = [
  {
    id: "hmas-brisbane",
    name: "HMAS Brisbane (DDG 43)",
    type: "ship",
    lat: -15.2,
    lng: 145.8,
    description: "Last reported in northern Australian / Coral Sea waters (public sources)",
    updated: "Open source reporting"
  },
  {
    id: "hmas-sydney",
    name: "HMAS Sydney (DDG 42)",
    type: "ship",
    lat: -8.5,
    lng: 152.0,
    description: "Indo-Pacific presence / regional operations (public)",
    updated: "Recent public info"
  },
  {
    id: "hmas-hobart",
    name: "HMAS Hobart (DDG 39)",
    type: "ship",
    lat: -12.0,
    lng: 130.5,
    description: "Northern deployment / Darwin area (public)",
    updated: "Open source"
  },
  {
    id: "hmas-supply",
    name: "HMAS Supply (AOR)",
    type: "ship",
    lat: -20.5,
    lng: 116.0,
    description: "Replenishment oiler supporting task group (public reporting)",
    updated: "Public sources"
  },
  {
    id: "hmas-perth",
    name: "HMAS Perth (FFH 157)",
    type: "ship",
    lat: -32.0,
    lng: 115.5,
    description: "Anzac-class frigate, west coast patrol (example)",
    updated: "Public reporting"
  },
  {
    id: "hmas-choules",
    name: "HMAS Choules (LSD)",
    type: "ship",
    lat: -27.5,
    lng: 153.5,
    description: "Amphibious support / HADR ready (public)",
    updated: "Open source"
  }
];

const ADVERSARY_OSINT = [
  {
    id: "china-scs",
    name: "PLAN Carrier Group (illustrative)",
    side: "china",
    lat: 17.0,
    lng: 112.0,
    description: "South China Sea presence - based on open-source intelligence & sightings",
    color: "#C0392B"
  },
  {
    id: "china-taiwan",
    name: "PLAN Amphibious Task Group (illustrative)",
    side: "china",
    lat: 24.5,
    lng: 120.5,
    description: "Eastern Taiwan Strait - public OSINT reports",
    color: "#C0392B"
  },
  {
    id: "russia-pacific",
    name: "Russian Pacific Fleet (illustrative)",
    side: "russia",
    lat: 42.5,
    lng: 133.0,
    description: "NW Pacific / Sea of Japan - public reports",
    color: "#5D4E8C"
  },
  {
    id: "russia-indian",
    name: "Russian Navy Indian Ocean detachment (illustrative)",
    side: "russia",
    lat: -5.5,
    lng: 78.0,
    description: "Indian Ocean - open source tracking",
    color: "#5D4E8C"
  }
];

// Make sure all the main data structures are on window so buildListeningPool and the rest of the site can find them reliably.
window.BASES = BASES;
window.OPERATIONS = OPERATIONS;
window.AIRCRAFT = AIRCRAFT;
window.NAVY = NAVY;
window.ARMY = ARMY;
window.WEAPONS = WEAPONS;
window.ADF_SHIPS_LAST_KNOWN = ADF_SHIPS_LAST_KNOWN;
window.ADVERSARY_OSINT = ADVERSARY_OSINT;
window.GLOSSARY = (typeof GLOSSARY !== 'undefined' ? GLOSSARY : []);
window.SPACE = (typeof SPACE !== 'undefined' ? SPACE : []);
window.CYBERSPACE_STUDY_ITEMS = (typeof CYBERSPACE_STUDY_ITEMS !== 'undefined' ? CYBERSPACE_STUDY_ITEMS : []);
window.RANKS = (typeof RANKS !== 'undefined' ? RANKS : {});
window.LEADERSHIP_ITEMS = (typeof LEADERSHIP_ITEMS !== 'undefined' ? LEADERSHIP_ITEMS : []);

// Expose the listening data
window.LISTENING_DATA = LISTENING_DATA;
