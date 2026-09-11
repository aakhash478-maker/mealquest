export type PowerReferenceType =
  | 'ANIMAL'
  | 'HUMAN_ATHLETE'
  | 'FICTIONAL_CHARACTER'
  | 'MYTHOLOGY'
  | 'MACHINE_VEHICLE'
  | 'OBJECT_TOOL'
  | 'NATURAL_PHENOMENON'
  | 'STRUCTURE_PLACE'
  | 'COSMIC_PHENOMENON'
  | 'UNKNOWN';

export type PowerReferenceStatus =
  | 'Real-World Biology'
  | 'Real-World Human'
  | 'Real-World Engineering'
  | 'Real-World Physics / Nature'
  | 'Real-World Structure'
  | 'Fictional / Entertainment'
  | 'Mythology / Ancient Lore'
  | 'Unrecognized';

export interface PowerAnalysisResult {
  reference: string;
  type: string;
  status: PowerReferenceStatus;
  isFictional: boolean;
  isRecognized: boolean;
  quantity?: number;
  strengthDescription: string;
  knownFor: string;
  context: string;
  keyAttributes: string[];
  funMealAdvice: string;
  icon: string;
  disclaimer: string;
}

interface ReferenceEntry {
  keywords: string[];
  canonicalName: string;
  type: string;
  status: PowerReferenceStatus;
  isFictional: boolean;
  icon: string;
  knownFor: string;
  context: string;
  strengthDescription: string;
  keyAttributes: string[];
  funMealAdvice: string;
  quantityHandler?: (count: number) => {
    reference: string;
    description: string;
    context: string;
  };
}

const UNIVERSAL_DATABASE: ReferenceEntry[] = [
  // =========================================================================
  // 1. ANIMALS (Real-World Biology — specific anatomical & physical capabilities)
  // =========================================================================
  {
    keywords: ['lion', 'lions'],
    canonicalName: 'Lion (Panthera leo)',
    type: 'Animal (Apex Predator)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🦁',
    knownFor: 'Heavy muscular build, explosive ambush attack, bite force, and prey-overpowering physical strength',
    context: 'Lions rely on heavy forequarter muscle density and coordinated pride hunting to tackle prey weighing up to several times their own mass.',
    strengthDescription:
      'A lion possesses a robust musculoskeletal build with heavily muscled shoulders and forelegs capable of delivering concussive strikes, an estimated canine bite force of roughly 650 psi, and explosive sprint acceleration designed for ambush takedowns rather than sustained long-distance chases.',
    keyAttributes: [
      'Bite force (~650 psi) with deep canine anchorage',
      'Dense forequarter muscle mass for grappling prey',
      'Explosive short-range ambush acceleration',
      'Coordinated pride hunting mechanics'
    ],
    funMealAdvice:
      'Lions depend on substantial protein intake to recover from explosive muscular sprints. Pair your hotel staple (rice, chapati, or dosa) with a solid protein source like eggs, dal, or chicken.',
    quantityHandler: (count: number) => ({
      reference: `${count} Lions (Pride Scale)`,
      description: `A pride of ${count} lions combines collective forequarter muscle mass, multi-angle flanking coordination, and overlapping canine bite pressure capable of grounding massive megafauna like cape buffalo and giraffes.`,
      context: `Scale comparison: ${count} adult apex predators coordinating ambush mechanics and explosive predatory power.`
    })
  },
  {
    keywords: ['elephant', 'elephants'],
    canonicalName: 'Elephant (Elephantidae)',
    type: 'Animal (Megafauna)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐘',
    knownFor: 'Enormous body mass, pushing and pulling power, prehensile trunk dexterity, and dense bone structure',
    context: 'Elephants are the largest living terrestrial mammals, possessing unrivaled pushing force and physical weight leverage.',
    strengthDescription:
      'An elephant’s strength derives from colossal adult body mass (4 to 7 metric tons), solid pillar-like limb bones engineered for extreme compressive loads, and a prehensile trunk containing over 40,000 distinct muscle fascicles capable of uprooting mature trees, pushing over barriers, and carrying heavy timber.',
    keyAttributes: [
      'Immense body mass (4,000–7,000 kg) providing unmatched ground traction',
      'Muscular hydrostat trunk with 40,000+ individual muscle bundles',
      'Thick cortical bone density resisting enormous compressive forces',
      'Exceptional pushing, pulling, and draft leverage'
    ],
    funMealAdvice:
      'Elephants sustain enormous physical power entirely on wholesome, fiber-rich plant food. Clean staples (rice, whole wheat chapati, lentils, vegetables) provide continuous, long-lasting stamina.',
    quantityHandler: (count: number) => ({
      reference: `${count} Elephants (Herd Scale)`,
      description: `A herd of ${count} adult elephants represents an extraordinary concentration of physical mass (${count * 5} metric tons on average), generating immense collective ground traction and pushing capability.`,
      context: `Scale comparison: ${count} colossal terrestrial herbivores combining multi-ton pushing force.`
    })
  },
  {
    keywords: ['tiger', 'tigers'],
    canonicalName: 'Tiger (Panthera tigris)',
    type: 'Animal (Apex Predator)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐅',
    knownFor: 'Dense shoulder musculature, solitary hunting capability, deep bite force, and leaping momentum',
    context: 'The tiger is the largest of the big cats, built for solitary ambush and overpowering prey larger than itself without a pack.',
    strengthDescription:
      'The tiger combines dense skeletal density with an exceptionally muscular shoulder girdle and hindquarters, allowing horizontal leaps up to 10 meters, an estimated canine bite force exceeding 1,000 psi, and the solitary physical force necessary to wrestle down gaurs and adult wild boars.',
    keyAttributes: [
      'Canine bite force (~1,000 psi) capable of puncturing thick hide and bone',
      'Dense muscular shoulder girdle providing solitary grappling leverage',
      'Explosive hindquarter leap momentum reaching up to 10 meters',
      'Retractable claws providing positive mechanical traction during grappling'
    ],
    funMealAdvice:
      'Solitary predators require nutrient-dense meals to repair heavy muscle tissue. Make sure your meal includes adequate protein to fuel your physical recovery.',
    quantityHandler: (count: number) => ({
      reference: `${count} Tigers`,
      description: `${count} adult tigers combine massive individual solitary muscle density, each capable of generating over 1,000 psi of canine bite pressure and explosive ambush takedowns.`,
      context: `Scale comparison: ${count} solitary apex predators.`
    })
  },
  {
    keywords: ['gorilla', 'gorillas', 'silverback'],
    canonicalName: 'Gorilla (Gorilla beringei / gorilla)',
    type: 'Animal (Primate)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🦍',
    knownFor: 'Upper-body muscle density, crushing grip strength, dense cortical bone, and quadrupedal leverage',
    context: 'Adult silverback gorillas possess upper-body muscular development several times denser than that of human athletes of comparable body mass.',
    strengthDescription:
      'A silverback gorilla possesses exceptional upper-body muscle density, an arm span exceeding 2.3 meters, dense cortical bone structure, and a crushing grip force estimated to be four to nine times stronger than an average human, generating tremendous branch-breaking and ground-slamming leverage.',
    keyAttributes: [
      'Upper-body muscle mass with broad sagittal crest jaw muscle anchoring',
      'Crushing hand grip force estimated at 4–9× human capability',
      'Dense limb bone cortex resisting extreme bending moments',
      'Quadrupedal knuckle-walking charging power'
    ],
    funMealAdvice:
      'Gorillas maintain huge muscle mass on a 100% plant-rich diet of shoots, leaves, and fruits. An affordable vegetarian plate (rice, dal, vegetable poriyal) provides clean, steady vitality.',
    quantityHandler: (count: number) => ({
      reference: `${count} Gorillas`,
      description: `${count} gorillas represent immense collective upper-body muscular strength and crushing grip leverage, with combined primate power capable of tearing dense tropical vegetation and exerting formidable physical force.`,
      context: `Scale comparison: ${count} powerful primates combining exceptional upper-body density.`
    })
  },
  {
    keywords: ['bear', 'bears', 'grizzly', 'polar bear'],
    canonicalName: 'Bear (Ursidae)',
    type: 'Animal (Apex Mammal)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐻',
    knownFor: 'High body mass, heavy paw strike impact force, non-retractable digging claws, and seasonal metabolic endurance',
    context: 'Bears balance massive physical bulk and thick bone density with seasonal metabolic fat storage and cardiovascular resilience.',
    strengthDescription:
      'Bears combine heavy skeletal and muscle mass (ranging from 200 kg to over 600 kg in brown and polar bears) with non-retractable claws up to 10 cm long, delivering concussive paw swipes capable of breaking ice sheets or fracturing large prey bones, coupled with notable swimming and digging stamina.',
    keyAttributes: [
      'Heavy body mass (200–600+ kg) delivering high-inertia paw strikes',
      'Reinforced non-retractable claws adapted for digging and tearing',
      'Thick skeletal frame with heavy cervical vertebrae',
      'Seasonal metabolic endurance supporting long hibernation cycles'
    ],
    funMealAdvice:
      'Bears balance caloric volume with diverse seasonal nutrition. A well-rounded meal containing hearty carbohydrates, protein, and healthy fats gives you sustained endurance throughout the day.'
  },
  {
    keywords: ['wolf', 'wolves', 'gray wolf', 'grey wolf'],
    canonicalName: 'Gray Wolf (Canis lupus)',
    type: 'Animal (Pack Hunter)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐺',
    knownFor: 'High cardiovascular running endurance, jaw clamping pressure, and coordinated pack pursuit',
    context: 'Wolves excel through tireless endurance coursing, pursuing prey across tens of kilometers at steady trotting speeds until the quarry tires.',
    strengthDescription:
      'A wolf’s capability lies in its cardiovascular efficiency, deep narrow chest with large lungs, a crushing jaw bite force of approximately 400 psi, and pack communication tactics that allow coordinated pursuit across harsh terrain for hours without exhaustion.',
    keyAttributes: [
      'Aerobic endurance capable of trotting 50+ km in a single hunt',
      'Crushing jaw clamping force (~400 psi) capable of snapping ungulate bones',
      'Pack tactical coordination and relay pursuit',
      'Cold-weather physiological insulation and footpad circulation'
    ],
    funMealAdvice:
      'Endurance athletes and long-distance hunters need regular, dependable fueling. Eat consistent, timely meals so you never face an energy deficit during demanding study or work sessions.'
  },
  {
    keywords: ['eagle', 'eagles', 'golden eagle', 'bald eagle'],
    canonicalName: 'Eagle (Accipitridae)',
    type: 'Animal (Raptor / Bird of Prey)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🦅',
    knownFor: 'Locking talon grip force, visual acuity, aerodynamic lift, and high-speed aerial hunting (NOT heavy surface lifting)',
    context: 'An eagle’s physical strength is specialized for flight dynamics, high-altitude soaring, and lethal grip force, not ground-based lifting.',
    strengthDescription:
      'An eagle’s physical capability relies on phenomenal visual acuity (up to 4–8 times sharper than human eyesight), powerful flight pectorals generating aerodynamic lift, and curved talons backed by a digital flexor mechanism capable of exerting crushing grip pressures of 400+ psi to secure prey mid-flight or on steep terrain.',
    keyAttributes: [
      'Phenomenal binocular visual acuity resolving small prey at kilometers',
      'Locking digital flexor tendon grip exceeding 400 psi in large species',
      'Aerodynamic wing camber providing efficient thermal soaring',
      'High-velocity diving speed and aerial interception agility'
    ],
    funMealAdvice:
      'Raptors rely on razor-sharp focus and lightweight agility. Choose light, digestible meals (idli, light rice with rasam, fresh buttermilk) to maintain mental clarity without feeling weighed down.'
  },
  {
    keywords: ['hawk', 'hawks', 'falcon', 'falcons'],
    canonicalName: 'Hawk / Falcon (Accipitriformes / Falconidae)',
    type: 'Animal (Aerial Predator)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🦅',
    knownFor: 'High-speed aerial dives (stoop), raptor visual tracking, and agile banking maneuvers',
    context: 'Falcons (like the Peregrine falcon) achieve the highest recorded velocities in the animal kingdom during hunting stoops, converting gravity into kinetic momentum.',
    strengthDescription:
      'Hawks and falcons possess aerodynamic airframes, pointed wings optimized for low drag, specialized nostrils regulating air pressure during 300+ km/h dives, and precise talon strikes that use sheer kinetic impact speed to stun or kill avian prey in mid-air.',
    keyAttributes: [
      'World-record animal dive velocity (300+ km/h in Peregrine falcon)',
      'Low-drag aerodynamic wing profile and reinforced chest keel',
      'Specialized nostril baffles regulating high-speed airflow into lungs',
      'Kinetic momentum impact strikes delivered at terminal velocity'
    ],
    funMealAdvice:
      'High-speed aerial agility requires sharp neuromuscular coordination. Hydrate well and avoid heavy, greasy foods before active focus periods.'
  },
  {
    keywords: ['crocodile', 'crocodiles', 'alligator', 'alligators'],
    canonicalName: 'Crocodile (Crocodylidae)',
    type: 'Animal (Semiaquatic Reptile)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐊',
    knownFor: 'Extreme bite force, armored osteoderms, ambush clamping, and rotational death roll mechanics',
    context: 'Crocodilians possess the highest measured bite forces of any living terrestrial or amphibious animals.',
    strengthDescription:
      'A large saltwater or Nile crocodile can produce measured bite forces reaching up to 3,700 psi (over 16,000 Newtons) through massive pterygoideus jaw adductor muscles, combined with an armored dermal skeleton (osteoderms) and a rotational "death roll" maneuver that applies massive torsional shear to tear prey.',
    keyAttributes: [
      'World-record living animal bite force (up to 3,700 psi / 16,000 N)',
      'Massive jaw closing adductor musculature',
      'Torsional body rotation ("death roll") applying rotational shear',
      'Armored osteoderm scales protecting against mechanical trauma'
    ],
    funMealAdvice:
      'Crocodiles have remarkable metabolic efficiency and digestion capable of dissolving bone. For human digestion, eat foods that digest smoothly without causing acidity.'
  },
  {
    keywords: ['shark', 'sharks', 'great white'],
    canonicalName: 'Shark (Chondrichthyes)',
    type: 'Animal (Marine Apex Predator)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🦈',
    knownFor: 'Hydrodynamic cartilaginous skeleton, continuous tooth replacement, electroreception, and pelagic cruising power',
    context: 'Sharks are apex marine predators engineered for hydrodynamic efficiency, sensory perception, and shearing bite mechanics.',
    strengthDescription:
      'A shark’s physical prowess is built upon a flexible, lightweight cartilaginous skeleton, dermal denticles that disrupt turbulent water drag, continuous conveyor-belt tooth replacement, and ampullae of Lorenzini electroreceptors that detect microvolt bioelectric fields of swimming prey.',
    keyAttributes: [
      'Lightweight cartilaginous skeleton saving metabolic swimming energy',
      'Hydrodynamic dermal denticle skin reducing fluid surface friction',
      'Multiple rows of continually advancing serrated cutting teeth',
      'Electroreceptive ampullae of Lorenzini detecting prey nerve impulses'
    ],
    funMealAdvice:
      'Pelagic predators maintain continuous metabolic readiness. Ensure your three daily meals provide a steady, predictable supply of nutrition.'
  },
  {
    keywords: ['whale', 'whales', 'blue whale', 'humpback'],
    canonicalName: 'Whale (Cetacea / Balaenoptera musculus)',
    type: 'Animal (Marine Megafauna)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐋',
    knownFor: 'Enormous ocean physical scale, hydrodynamic fluked propulsion, and sustained deep-dive lung capacity (NOT terrestrial lifting)',
    context: 'The blue whale is the largest known animal to have ever lived on Earth, reaching masses up to 150–200 metric tons.',
    strengthDescription:
      'A whale’s physical strength is defined by immense hydrodynamic propulsion from horizontal tail flukes driven by massive dorsal and hypaxial muscle bundles, moving ocean water volumes with every stroke, alongside a circulatory system holding thousands of liters of oxygenated blood for sustained deep-water diving.',
    keyAttributes: [
      'Largest physical body mass on Earth (up to 200 metric tons / 200,000 kg)',
      'Colossal fluked swimming thrust generated by massive axial musculature',
      'Exceptional myoglobin concentration storing oxygen in deep-diving muscle tissue',
      'Fluid hydrodynamic mass displacement in oceanic medium'
    ],
    funMealAdvice:
      'Whales filter tons of krill to sustain their colossal scale. In your daily life, consistent, unskipped meals form the ocean of energy you need to tackle your classes or work.'
  },
  {
    keywords: ['horse', 'horses', 'stallion'],
    canonicalName: 'Horse (Equus caballus)',
    type: 'Animal (Equine Herbivore)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐎',
    knownFor: 'Aerobic cardiovascular capacity, elastic leg tendon energy return, hindquarter galloping drive, and sustained endurance',
    context: 'Horses are adapted for sustained terrestrial locomotion and high-speed galloping, with tendons that act as natural biological springs.',
    strengthDescription:
      'Horses possess a large cardiovascular stroke volume, powerful gluteal hindquarter musculature, and specialized elastic tendons (such as the superficial digital flexor) that store and return mechanical strain energy during each stride, enabling efficient sustained galloping and pulling capability.',
    keyAttributes: [
      'Aerobic VO2 capacity supported by large splenic red blood cell reserves',
      'Elastic leg tendon recoil returning substantial kinetic energy per stride',
      'Powerful gluteal and hamstring hip-extension propulsion',
      'Sustained trotting and galloping draft capability'
    ],
    funMealAdvice:
      'Clean complex carbohydrates and consistent hydration keep equine-level physical stamina high. Drink plenty of water throughout the day.'
  },
  {
    keywords: ['bull', 'bulls', 'ox', 'oxen'],
    canonicalName: 'Bull / Ox (Bos taurus)',
    type: 'Animal (Bovine)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐂',
    knownFor: 'Massive muscular neck and shoulder hump, head-on charging force, horn leverage, and agricultural draft pulling',
    context: 'Bulls and draft oxen have served humanity for millennia due to their dense muscular necks, heavy bone density, and unmatched low-speed pulling torque.',
    strengthDescription:
      'A bull combines dense muscle mass concentrated in the cervical neck hump and shoulders, supported by heavy thoracic spinous vertebrae, allowing it to exert tremendous head-on ramming force, horn tossing leverage, and continuous ground-tractive drawbar pull when draft-harnessed.',
    keyAttributes: [
      'Muscular cervical hump providing immense neck-tossing force',
      'Thick skeletal limb bones resisting heavy ground traction torque',
      'High-inertia head-on charge momentum',
      'Continuous low-speed agricultural draft pulling power'
    ],
    funMealAdvice:
      'Draft power requires a solid, unshakeable foundation. A steady base of wholesome carbohydrates (rice or chapati) provides the bedrock for heavy physical tasks.'
  },
  {
    keywords: ['rhino', 'rhinos', 'rhinoceros'],
    canonicalName: 'Rhinoceros (Rhinocerotidae)',
    type: 'Animal (Armored Megafauna)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🦏',
    knownFor: 'Multi-ton armored bulk, explosive linear charging speed up to 50 km/h, and solid keratin horn leverage',
    context: 'Rhinos are heavily built herbivores with thick collagenous dermal shielding and surprisingly explosive linear sprint power.',
    strengthDescription:
      'A rhinoceros combines a heavy mass of 1.5 to 2.5 metric tons with thick, plate-like collagenous skin, charging at speeds up to 50 km/h to deliver immense kinetic impact backed by a solid keratin horn anchored on a reinforced nasal bone bridge.',
    keyAttributes: [
      'Immense charging momentum (2+ tons traveling at up to 50 km/h)',
      'Dense collagenous dermal shielding up to 5 cm thick',
      'Solid keratin horn with reinforced cranial skeletal foundation',
      'Explosive linear acceleration from a standing start'
    ],
    funMealAdvice:
      'Heavy-duty defenses require steady, high-volume fuel. Never skip lunch when you have a busy afternoon ahead.'
  },
  {
    keywords: ['hippo', 'hippos', 'hippopotamus'],
    canonicalName: 'Hippopotamus (Hippopotamus amphibius)',
    type: 'Animal (Semiaquatic Megafauna)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🦛',
    knownFor: 'Bone-crushing canine tusk bite force, 150-degree jaw gape, and multi-ton amphibious bulk',
    context: 'Hippos are among the most physically formidable creatures in Africa, possessing jaws capable of severing wooden canoes.',
    strengthDescription:
      'A hippopotamus possesses a 150-degree jaw opening angle, massive masseter and temporalis jaw adductor muscles generating a bite force exceeding 12,000 Newtons (roughly 1,800 psi), paired with continuously growing ivory canine tusks up to 50 cm long and a dense 1.5-to-3-ton aquatic buoyant body mass.',
    keyAttributes: [
      'Massive jaw bite force (~1,800 psi / 12,000+ N) with 150° gape angle',
      'Solid ivory canine tusks reaching up to 50 cm in length',
      'Dense, thick-boned pachyostotic skeleton assisting riverbed locomotion',
      'Explosive short-range territorial charges on land and water'
    ],
    funMealAdvice:
      'Dense herbivores graze heavily through the night. Plan your meals on a regular schedule to keep your energy balanced throughout the day.'
  },
  {
    keywords: ['cheetah', 'cheetahs'],
    canonicalName: 'Cheetah (Acinonyx jubatus)',
    type: 'Animal (Specialized Terrestrial Sprinter)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐆',
    knownFor: 'World-record land acceleration, sprint speed (0–100 km/h in 3 sec), agility, and spring-like spine (NOT heavy lifting)',
    context: 'The cheetah is the fastest terrestrial mammal, engineered entirely for explosive acceleration and agile sprint pursuit, not brute mass or lifting.',
    strengthDescription:
      'A cheetah’s physical capability centers on extreme acceleration, reaching up to 100–120 km/h in 3-second bursts due to a flexible spring-like lumbar spine, an enlarged heart and respiratory system delivering maximum oxygen, and non-retractable claws functioning like athletic sprint cleats for tight turns.',
    keyAttributes: [
      'World-record land acceleration (0 to 100 km/h in under 3 seconds)',
      'Highly flexible spring-like spine expanding stride length up to 7 meters',
      'Enlarged thoracic cavity with high-capacity heart and bronchial passages',
      'Semi-retractable traction claws providing immediate grip during high-G turns'
    ],
    funMealAdvice:
      'High-speed sprinting burns immediate muscular glycogen. Clean, fast-absorbing carbohydrates like idli or steamed rice give your brain and muscles quick, clean energy.'
  },
  {
    keywords: ['snake', 'snakes', 'python', 'anaconda', 'cobra'],
    canonicalName: 'Constrictor / Serpent (Serpentes)',
    type: 'Animal (Reptile)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐍',
    knownFor: 'Constrictive muscular compression pressure, flexible multi-vertebral spine, and predatory stealth',
    context: 'Constrictors (like pythons and anacondas) generate immense circumferential squeeze pressure that halts prey circulatory blood flow.',
    strengthDescription:
      'A large constrictor snake utilizes hundreds of specialized vertebrae and thousands of interlocking intercostal muscles to wrap around prey, applying sustained circumferential pressure exceeding 10 to 15 psi with each exhale, effectively arresting prey blood circulation within seconds.',
    keyAttributes: [
      'Continuous muscular hoop stress and circumferential squeeze pressure',
      'Highly articulate multi-vertebrae spine (200–400 vertebrae)',
      'Quadrate bone jaw dislocation accommodating prey wider than skull',
      'Low resting metabolic rate with immense digestive enzyme secretion'
    ],
    funMealAdvice:
      'Serpents have efficient digestive systems that process whole nutrients slowly. Give your digestive system time to process meals by avoiding constant grazing.'
  },
  {
    keywords: ['ant', 'ants'],
    canonicalName: 'Ant (Formicidae)',
    type: 'Animal (Insect / Colonial Invertebrate)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐜',
    knownFor: 'Relative strength compared with body size (10–50× body weight), chitinous exoskeleton leverage, and colonial teamwork',
    context: 'Ants are famous for relative strength, lifting objects many times their own minuscule mass due to square-cube physics scaling laws.',
    strengthDescription:
      'An ant’s strength is governed by the square-cube law: because its body volume and mass are tiny, its muscular cross-sectional area allows it to carry 10 to 50 times its own body weight, utilizing a rigid chitinous exoskeleton as an external lever system with remarkable colonial transport coordination.',
    keyAttributes: [
      'Relative lifting capability 10–50× body mass due to square-cube scaling',
      'Rigid external chitinous exoskeleton providing optimal tendon leverage',
      'Mandibular clamping force capable of cutting vegetation and biting enemies',
      'Colonial division of labor combining relative strength across thousands of workers'
    ],
    funMealAdvice:
      'Relative strength comes from disciplined, efficient fueling. Consistent, modest portion sizes (e.g., 2–3 idlis or 1 dosa) provide the right amount of energy without overfilling.',
    quantityHandler: (count: number) => ({
      reference: `${count} Ants (Colony Teamwork)`,
      description: `${count} ants coordinate their relative physical capabilities, collectively lifting and hauling items hundreds of times their individual weight through organized colonial trail mechanics.`,
      context: `Scale comparison: ${count} colonial insects demonstrating relative strength-to-body-size scaling.`
    })
  },
  {
    keywords: ['spider', 'spiders'],
    canonicalName: 'Spider (Araneae)',
    type: 'Animal (Arachnid)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🕷️',
    knownFor: 'Tensile silk strength (stronger than structural steel by weight), hydraulic limb extension, and predatory reflex',
    context: 'Spiders produce biomaterials with world-class tensile strength and use hydraulic hemolymph pressure to extend their limbs.',
    strengthDescription:
      'A spider’s physical engineering combines dragline silk with a tensile strength exceeding 1 GPa (stronger than structural steel by weight with high elasticity) and a hydraulic circulatory system that pumps hemolymph fluid to rapidly extend joints with zero extensor muscles, coupled with sensory micro-trichobothria hairs detecting nanometer vibrations.',
    keyAttributes: [
      'Dragline silk tensile strength (>1 GPa) combining extreme strength and elasticity',
      'Hydraulic hemolymph limb extension mechanism',
      'Cheliceral fangs delivering localized digestive enzymes or venom',
      'Micro-trichobothria vibrational sensitivity across web structures'
    ],
    funMealAdvice:
      'Spiders build complex webs through patience and structural precision. Building healthy eating habits works the same way—one balanced meal at a time.'
  },
  {
    keywords: ['dog', 'dogs', 'canine'],
    canonicalName: 'Domestic Dog (Canis familiaris)',
    type: 'Animal (Canine)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐕',
    knownFor: 'Cardiovascular endurance, tracking olfaction, jaw bite grip, and pack loyalty',
    context: 'Canines possess exceptional aerobic running stamina, olfactory sensory receptors, and loyalty to working handlers.',
    strengthDescription:
      'Dogs possess high aerobic endurance, efficient gait mechanics, jaw bite forces ranging from 200 to 450 psi in working breeds, and an olfactory system containing up to 300 million scent receptors that detects chemical cues at parts-per-trillion sensitivity.',
    keyAttributes: [
      'Aerobic stamina adapted for long-distance trotting and coursing',
      'Canine jaw bite force (200–450+ psi in working breeds)',
      'Olfactory sensory system with 200–300 million nasal chemoreceptors',
      'High cooperative social intelligence and trainable athletic endurance'
    ],
    funMealAdvice:
      'Loyal companions stay energetic with balanced, predictable meals. Keep your meal times consistent so your body knows when to expect fresh energy.'
  },
  {
    keywords: ['cat', 'cats', 'feline'],
    canonicalName: 'Domestic Cat (Felis catus)',
    type: 'Animal (Feline)',
    status: 'Real-World Biology',
    isFictional: false,
    icon: '🐈',
    knownFor: 'Spinal flexibility, vestibular righting reflex, explosive vertical leaps (up to 6× body length), and rapid fast-twitch stalking',
    context: 'Cats are masters of kinetic flexibility, fast-twitch muscle contraction, and self-righting aerial physics.',
    strengthDescription:
      'A cat’s capability centers on a free-floating clavicle and flexible lumbar vertebrae allowing explosive vertical leaps up to six times its body length, an innate vestibular righting reflex that reorients the body during falls, and rapid fast-twitch muscle fibers optimized for instantaneous pouncing.',
    keyAttributes: [
      'Spinal flexibility with free-floating clavicle bones and 30 vertebrae',
      'Explosive vertical leaping power up to 5–6× body length',
      'Vestibular righting reflex reorienting body mid-air in milliseconds',
      'Ultra-quiet stalk mechanics and rapid claw retraction control'
    ],
    funMealAdvice:
      'Agility and fast reflexes thrive on clean, non-sluggish nutrition. Avoid heavy fried foods when you need to stay sharp and nimble.'
  },

  // =========================================================================
  // 2. HUMANS / REAL PEOPLE (Athletes, Strongmen, Martial Artists, Historical)
  // =========================================================================
  {
    keywords: ['usain bolt', 'bolt'],
    canonicalName: 'Usain Bolt (World Champion Sprinter)',
    type: 'Human / Real-World Track Athlete',
    status: 'Real-World Human',
    isFictional: false,
    icon: '⚡',
    knownFor: 'World records in 100m (9.58s) and 200m (19.19s), explosive stride power, and peak speed (>44 km/h)',
    context: 'Usain Bolt is widely recognized as the greatest sprinter in history, holding multiple Olympic gold medals and world records.',
    strengthDescription:
      'Usain Bolt combined an exceptional 1.95m height with a high percentage of fast-twitch muscle fibers, generating peak ground reaction forces over 1,000 lbs per foot strike with an average stride length of 2.44m, reaching a recorded peak velocity of 44.72 km/h without fabricated statistics.',
    keyAttributes: [
      'Official 100m World Record (9.58s) and 200m World Record (19.19s)',
      'Peak velocity reached: 44.72 km/h (27.78 mph)',
      'High ground reaction force per stride (~2.44m average stride length)',
      '8 Olympic gold medals in sprint athletics'
    ],
    funMealAdvice:
      'Elite sprinters fuel their training with clean carbohydrates like yams, rice, and lean protein. Never skip breakfast before a busy, active morning.'
  },
  {
    keywords: ['mike tyson', 'tyson'],
    canonicalName: 'Mike Tyson (Heavyweight Boxing Champion)',
    type: 'Human / Real-World Combat Athlete',
    status: 'Real-World Human',
    isFictional: false,
    icon: '🥊',
    knownFor: 'Peek-a-boo defensive slipping, rotational hip punch torque, explosive closing speed, and youngest heavyweight titleholder',
    context: 'Mike Tyson became the youngest undisputed world heavyweight champion in history at age 20 through devastating kinetic punching mechanics.',
    strengthDescription:
      'Tyson’s physical power was generated through exceptional rotational kinetic energy transfer from powerful legs and hips through a heavily conditioned core into compact hook and uppercut strikes, coordinated with rapid head movement and short-range closing footwork.',
    keyAttributes: [
      'Youngest undisputed heavyweight champion in boxing history (age 20)',
      'Rotational kinetic punch transfer through hips and core',
      'Peek-a-boo defense with rapid head-slip slip angles',
      'High-velocity closing speed and inside combination punching'
    ],
    funMealAdvice:
      'Power punchers generate force from a solid, grounded base. Make sure your meal includes a reliable main food (rice, dosa, chapati) to anchor your energy.'
  },
  {
    keywords: ['muhammad ali', 'ali'],
    canonicalName: 'Muhammad Ali (The Greatest)',
    type: 'Human / Real-World Combat Athlete',
    status: 'Real-World Human',
    isFictional: false,
    icon: '🥊',
    knownFor: 'Light-footed agility ("float like a butterfly"), rapid jab velocity, tactical ring intelligence, and 3-time heavyweight champion',
    context: 'Muhammad Ali is regarded as one of the most significant sporting and cultural figures of the 20th century.',
    strengthDescription:
      'Muhammad Ali revolutionized heavyweight boxing by pairing heavyweight reach and power with middleweight footwork, exceptional jab velocity, reactive head slipping, and unmatched cardiovascular conditioning that sustained elite output through 15-round championship bouts.',
    keyAttributes: [
      'Three-time World Heavyweight Champion',
      'Exceptional light-footed lateral ring mobility and footwork',
      'High-speed stiff jab delivered from unorthodox angles',
      'Championship stamina sustaining high punch volume through 15 rounds'
    ],
    funMealAdvice:
      'Stamina and foot speed require clean fuel and disciplined hydration. Stay light on your feet by avoiding overeating at single meals.'
  },
  {
    keywords: ['bruce lee'],
    canonicalName: 'Bruce Lee (Martial Artist & Philosopher)',
    type: 'Human / Real-World Martial Artist',
    status: 'Real-World Human',
    isFictional: false,
    icon: '🥋',
    knownFor: 'Jeet Kune Do founder, neuromuscular speed, one-inch punch kinetic transfer, and scientific physical conditioning',
    context: 'Bruce Lee was a pioneer in functional martial arts conditioning, core strength development, and kinetic strike mechanics.',
    strengthDescription:
      'Bruce Lee achieved legendary physical capability through rigorous isometric and core conditioning, exceptional neuromuscular coordination, and the ability to transfer kinetic energy from the floor through the hips into short-range strikes (such as his famous one-inch punch demonstration).',
    keyAttributes: [
      'Founder of Jeet Kune Do martial philosophy',
      'High neuromuscular kinetic transfer in short-range strikes',
      'Pioneering core, latissimus, and isometric conditioning regimens',
      'High strike velocity paired with disciplined flexibility'
    ],
    funMealAdvice:
      'Bruce Lee advocated for clean nutrition without empty filler calories. Prioritize quality nutrition over deep-fried snacks when eating at the hotel.'
  },
  {
    keywords: ['arnold schwarzenegger', 'schwarzenegger', 'arnold'],
    canonicalName: 'Arnold Schwarzenegger (Bodybuilding Champion)',
    type: 'Human / Real-World Athlete & Cultural Figure',
    status: 'Real-World Human',
    isFictional: false,
    icon: '🏆',
    knownFor: 'Seven-time Mr. Olympia winner, iconic chest/arm development, high-volume resistance training, and athletic longevity',
    context: 'Schwarzenegger set the historic benchmark for classical aesthetic bodybuilding symmetry and rigorous training discipline.',
    strengthDescription:
      'Schwarzenegger achieved historic physical development through high-volume progressive resistance training, heavy compound lifting (squat, bench press, deadlift), exceptional mind-muscle neural control, and strict competitive nutritional discipline that earned him seven Mr. Olympia titles.',
    keyAttributes: [
      '7-time Mr. Olympia champion',
      'Classical aesthetic hypertrophy and symmetry standard',
      'Mastery of high-volume compound resistance training',
      'Lifelong physical conditioning and fitness advocacy'
    ],
    funMealAdvice:
      'Bodybuilders prioritize consistent daily protein and clean carbohydrates for recovery. Add an egg or dal to your hotel meal to keep your physical recovery on track.'
  },
  {
    keywords: ['hafthor', 'eddie hall', 'strongman', 'powerlifter'],
    canonicalName: 'World-Class Strongman / Powerlifter',
    type: 'Human / Real-World Strength Athlete',
    status: 'Real-World Human',
    isFictional: false,
    icon: '🏋️',
    knownFor: 'Maximal compound lifting (deadlift >500 kg), dense connective tissue conditioning, and posterior chain power',
    context: 'Elite strongmen and powerlifters push human mechanical lifting capacity to the absolute biological frontier.',
    strengthDescription:
      'World-class strongmen and powerlifters develop maximum physical force production through heavy posterior chain compound training, dense skeletal bone adaptation, massive axial spinal loading tolerance, and neuromuscular recruitment capable of deadlifting over 500 kilograms under certified competition conditions.',
    keyAttributes: [
      'Official competition deadlift records exceeding 500 kg (1,102 lbs)',
      'Heavy spinal axial compression tolerance and posterior chain density',
      'Maximal motor unit recruitment in compound multi-joint movements',
      'Superhuman log lift, yolk carry, and stone loading power'
    ],
    funMealAdvice:
      'Lifting heavy requires serious caloric and protein support. Make sure your meal includes wholesome staples and adequate protein so you feel strong and grounded.'
  },
  {
    keywords: ['michael phelps', 'phelps'],
    canonicalName: 'Michael Phelps (Olympic Swimmer)',
    type: 'Human / Real-World Aquatic Athlete',
    status: 'Real-World Human',
    isFictional: false,
    icon: '🏊',
    knownFor: '28 Olympic medals (23 gold), 2.01m wingspan, exceptional VO2 max, and hydrodynamic stroke efficiency',
    context: 'Michael Phelps is the most decorated Olympian in history, possessing unique physiological adaptations for swimming.',
    strengthDescription:
      'Phelps’s athletic prowess derived from remarkable physiological traits: a 2.01m wingspan on a 1.93m frame, hyperextending joints acting like flippers, a high VO2 max lung capacity, and rapid metabolic lactic acid clearance that allowed multiple world-record swims in a single day.',
    keyAttributes: [
      '28 Olympic medals (23 gold)—the most in human history',
      '2.01m wingspan leverage and hyper-flexible ankle articulation',
      'High aerobic capacity and rapid lactic acid clearance',
      'World records across freestyle, butterfly, and medley disciplines'
    ],
    funMealAdvice:
      'Swimmers burn thousands of calories and need structured nutrition. Keep your meals balanced with sufficient carbs to recover without exceeding your daily budget.'
  },
  {
    keywords: ['cristiano ronaldo', 'ronaldo', 'cr7'],
    canonicalName: 'Cristiano Ronaldo (Professional Footballer)',
    type: 'Human / Real-World Football Athlete',
    status: 'Real-World Human',
    isFictional: false,
    icon: '⚽',
    knownFor: 'Elite vertical leap (>78 cm), sprint acceleration, low body fat, and multi-decade athletic conditioning',
    context: 'Cristiano Ronaldo is renowned for his extraordinary athletic longevity, conditioning discipline, and aerial heading prowess.',
    strengthDescription:
      'Ronaldo combines low body fat with explosive fast-twitch vertical jump power (recording takeoffs over 78 cm with significant hangtime), sprint deceleration/acceleration mechanics, and a strict daily conditioning and recovery regimen that has sustained world-class performance across two decades.',
    keyAttributes: [
      'Elite recorded vertical jump (>78 cm) with exceptional aerial hangtime',
      'High lean muscle ratio and low body fat percentage',
      'Multi-decade professional career at the highest international level',
      'Rigorous hydration, sleep, and recovery discipline'
    ],
    funMealAdvice:
      'Ronaldo famously skips sugary sodas in favor of clean water and wholesome whole foods. Skip sugary drinks with your hotel meal to keep your energy clean.'
  },
  {
    keywords: ['lionel messi', 'messi'],
    canonicalName: 'Lionel Messi (Professional Footballer)',
    type: 'Human / Real-World Football Athlete',
    status: 'Real-World Human',
    isFictional: false,
    icon: '⚽',
    knownFor: 'Low center of gravity, rapid sharp deceleration/re-acceleration, balance under physical challenge, and ball control',
    context: 'Messi is widely considered one of the greatest football players of all time, utilizing balance and micro-acceleration.',
    strengthDescription:
      'Messi’s physical strength is characterized by a low center of gravity, supreme rotational core stability, micro-stride acceleration that allows directional changes without losing forward momentum, and remarkable physical balance that absorbs heavy defensive challenges.',
    keyAttributes: [
      'Eight-time Ballon d\'Or winner and World Cup champion',
      'Low center of gravity providing exceptional stability through tackles',
      'Micro-acceleration and sharp deceleration without momentum loss',
      'Elite cognitive pitch perception and motor coordination'
    ],
    funMealAdvice:
      'Balance and rapid footwork depend on easily digestible, comfortable foods. Choose dishes that digest easily without causing stomach heaviness.'
  },
  {
    keywords: ['khabib', 'nurmagomedov'],
    canonicalName: 'Khabib Nurmagomedov (MMA Champion)',
    type: 'Human / Real-World Combat Athlete',
    status: 'Real-World Human',
    isFictional: false,
    icon: '🤼',
    knownFor: 'Dominant combat sambo grappling, chain wrestling, top control pressure, and undefeated 29-0 MMA record',
    context: 'Khabib is regarded as one of the most dominant grapplers in mixed martial arts history, retiring undefeated.',
    strengthDescription:
      'Khabib’s physical strength was expressed through relentless combat sambo chain wrestling, wrist control (Dagestani handcuffs), suffocating top-pressure weight distribution, and cardiovascular endurance that maintained high-output grappling across all five championship rounds.',
    keyAttributes: [
      'Undefeated professional MMA career (29-0) and UFC Lightweight Champion',
      'Relentless chain wrestling and mat-return takedown mechanics',
      'Suffocating top-control weight distribution neutralizing opponents',
      'Pace-dictating cardiovascular and mental combat endurance'
    ],
    funMealAdvice:
      'Grapplers need hearty, grounded nutrition to sustain heavy wrestling practices. Wholesome vegetarian and protein meals provide the steady power needed on the mat.'
  },
  {
    keywords: ['eliud kipchoge', 'kipchoge'],
    canonicalName: 'Eliud Kipchoge (Marathon World Champion)',
    type: 'Human / Real-World Endurance Athlete',
    status: 'Real-World Human',
    isFictional: false,
    icon: '🏃',
    knownFor: 'Sub-2-hour exhibition marathon (1:59:40), multiple Olympic marathon golds, and supreme running economy',
    context: 'Eliud Kipchoge is universally recognized as the greatest marathon runner in history.',
    strengthDescription:
      'Kipchoge’s strength lies in unmatched running economy, extraordinary VO2 max oxygen utilization, a lightweight biomechanical frame that minimizes kinetic energy dissipation per stride, and mental equanimity that sustains a 2:50/km pace across 42.195 kilometers.',
    keyAttributes: [
      'Historic sub-2-hour marathon run (1:59:40 in Vienna exhibition)',
      'Two-time Olympic Marathon Gold Medalist',
      'World-class running economy and biomechanical efficiency',
      'Disciplined daily lifestyle and mental consistency'
    ],
    funMealAdvice:
      'Marathon legends rely on wholesome carbohydrate staples like ugali and rice. Fuel your daily mental and physical marathons with reliable, unskipped meals.'
  },

  // =========================================================================
  // 3. FICTIONAL CHARACTERS (Anime, Comics, Games, Entertainment)
  // =========================================================================
  {
    keywords: ['gojo', 'satoru gojo', 'six eyes', 'limitless'],
    canonicalName: 'Gojo Satoru (Jujutsu Kaisen)',
    type: 'Fictional Character (Anime / Manga)',
    status: 'Fictional / Entertainment',
    isFictional: true,
    icon: '👁️',
    knownFor: 'Limitless spatial barrier (Infinity), Six Eyes cursed energy efficiency, Hollow Purple, and Unlimited Void domain',
    context: 'In Jujutsu Kaisen lore, Gojo Satoru is the strongest modern sorcerer, wielding inherited spatial cursed techniques.',
    strengthDescription:
      'In Jujutsu Kaisen lore, Gojo manipulates space at an atomic level via the Limitless technique: "Infinity" prevents physical contact by infinitely dividing incoming distance, "Blue" generates spatial attraction, "Red" produces explosive spatial repulsion, and "Hollow Purple" collides both into a destructive mass. His Six Eyes grant atomic cursed energy processing.',
    keyAttributes: [
      'Infinity spatial barrier preventing any physical attack from connecting',
      'Six Eyes atomic-level cursed energy vision and near-zero energy consumption',
      'Spatial teleportation, attractive Blue, and repulsive Red techniques',
      'Unlimited Void domain flooding targets with infinite cerebral information'
    ],
    funMealAdvice:
      'In lore, operating the Six Eyes constantly burns cerebral glucose! In the real world, complex carbohydrates provide genuine, steady brain fuel for your day.'
  },
  {
    keywords: ['sukuna', 'ryomen sukuna', 'king of curses'],
    canonicalName: 'Ryomen Sukuna (Jujutsu Kaisen)',
    type: 'Fictional Character (Anime / Manga)',
    status: 'Fictional / Entertainment',
    isFictional: true,
    icon: '👹',
    knownFor: 'Cleave & Dismantle precision slashes, barrierless Malevolent Shrine domain, Divine Flame, and Heian-era cursed energy',
    context: 'In Jujutsu Kaisen lore, Sukuna is the King of Curses from the Golden Age of Jujutsu, possessing four arms and colossal cursed energy.',
    strengthDescription:
      'In Jujutsu Kaisen lore, Ryomen Sukuna commands colossal cursed energy reserves, executing invisible slashing attacks ("Dismantle" against inanimate targets and "Cleave" adjusted to target toughness). His "Malevolent Shrine" is an open barrierless domain painting slashes across a 200m radius, followed by the thermonuclear "Divine Flame" (Furnace).',
    keyAttributes: [
      'Dismantle and Cleave invisible slicing cursed techniques',
      'Barrierless Malevolent Shrine domain spanning up to a 200-meter radius',
      'Divine Flame (Kamino) explosive pyrotechnic incineration',
      'Advanced Reverse Cursed Technique healing severed limbs in moments'
    ],
    funMealAdvice:
      'Containing mythical Heian cursed energy burns fictional calories! In reality, your body needs a reliable main dish and sufficient protein to stay grounded and focused.',
    quantityHandler: (count: number) => ({
      reference: `${count}-Finger Sukuna (Ryomen Sukuna Lore)`,
      description: `In Jujutsu Kaisen lore, consuming ${count} of Sukuna's 20 indestructible fingers invokes roughly ${Math.round((count / 20) * 100)}% of the King of Curses' Heian-era cursed energy reserves, granting overwhelming physical reinforcement, rapid Reverse Cursed Technique healing, and immense destructive slashing capability.`,
      context: `Fictional lore reference: ${count} of 20 cursed fingers embodying a fraction of the King of Curses' power.`
    })
  },
  {
    keywords: ['saitama', 'one punch man', 'one-punch'],
    canonicalName: 'Saitama (One-Punch Man)',
    type: 'Fictional Character (Anime / Manga)',
    status: 'Fictional / Entertainment',
    isFictional: true,
    icon: '🥊',
    knownFor: 'Shattered biological limiter, boundless kinetic punching force, absolute invulnerability, and one-punch threat resolution',
    context: 'In One-Punch Man lore, Saitama broke his biological limiter through sheer mundane workout willpower, becoming casually invincible.',
    strengthDescription:
      'In One-Punch Man lore, Saitama has removed his universe\'s biological limiter, granting him casually infinite physical strength, total invulnerability against planetary impacts and cosmic radiation, casual faster-than-light speed, and the ability to defeat any opponent with a single serious punch.',
    keyAttributes: [
      'Shattered biological limiter granting limitless physical potential',
      'Serious Punch producing atmospheric shockwaves that part cloud layers globally',
      'Complete physical invulnerability to blunt force, heat, and planetary collisions',
      'Casual faster-than-light reaction speed and lunar leaping momentum'
    ],
    funMealAdvice:
      'Saitama strictly respects supermarket discount sales, eats bananas, and never skips meals! Staying within your daily budget while eating well is the ultimate hero discipline.'
  },
  {
    keywords: ['superman', 'clark kent', 'kal-el'],
    canonicalName: 'Superman (DC Comics)',
    type: 'Fictional Character (Comic Books / Pop Culture)',
    status: 'Fictional / Entertainment',
    isFictional: true,
    icon: '🦸',
    knownFor: 'Yellow solar radiation absorption, superhuman strength, invulnerability, flight, heat vision, and freeze breath',
    context: 'In DC Comics lore, Kal-El is the Last Son of Krypton, empowered under Earth\'s yellow sun to protect humanity.',
    strengthDescription:
      'In DC Comics lore, Superman’s Kryptonian cellular structure absorbs yellow solar radiation, empowering him with near-limitless physical lifting and striking capacity, impervious cellular invulnerability, faster-than-light flight, optical heat vision reaching stellar temperatures, and arctic freeze breath.',
    keyAttributes: [
      'Photovoltaic cellular absorption of yellow solar radiation',
      'Planetary-scale physical lifting and striking strength',
      'Impervious cellular invulnerability against ballistic and explosive trauma',
      'Heat vision, freeze breath, X-ray vision, and super-hearing'
    ],
    funMealAdvice:
      'While Superman absorbs solar rays, mortal humans need actual food! Eat a complete plate with vegetables and protein so your real-world energy stays super.'
  },
  {
    keywords: ['hulk', 'bruce banner', 'incredible hulk'],
    canonicalName: 'The Incredible Hulk (Marvel Comics)',
    type: 'Fictional Character (Comic Books / Pop Culture)',
    status: 'Fictional / Entertainment',
    isFictional: true,
    icon: '💥',
    knownFor: 'Rage-scaled physical strength, cellular regeneration, thunderclap shockwaves, and superhuman leaping',
    context: 'In Marvel Comics lore, Dr. Bruce Banner transforms into the Hulk when adrenaline spikes, gaining strength proportional to anger.',
    strengthDescription:
      'In Marvel Comics lore, gamma radiation fundamentally altered Bruce Banner\'s cellular biology so that emotional rage triggers an adrenaline-driven metamorphosis into the Hulk, where physical strength, bone density, and accelerated cellular regeneration scale upward without any documented upper limit.',
    keyAttributes: [
      'Strength and durability dynamically scaling with anger and adrenaline',
      'Thunderclap shockwaves generating localized hurricane-force winds',
      'Accelerated cellular healing factor regenerating tissue in seconds',
      'Sub-orbital leaping distances traversing continents in bounds'
    ],
    funMealAdvice:
      'Irritability and temper often spike when blood sugar drops! Eating balanced, timely meals prevents sudden hunger crashes and keeps you in calm control.'
  },
  {
    keywords: ['goku', 'son goku', 'saiyan', 'kakarot'],
    canonicalName: 'Son Goku (Dragon Ball)',
    type: 'Fictional Character (Anime / Manga)',
    status: 'Fictional / Entertainment',
    isFictional: true,
    icon: '⚡',
    knownFor: 'Saiyan warrior biology, Ki energy manipulation, Kamehameha wave, Zenkai boosts, and Ultra Instinct',
    context: 'In Dragon Ball lore, Goku is a pure-blooded Saiyan martial artist who constantly surpasses biological limits through training.',
    strengthDescription:
      'In Dragon Ball lore, Goku channels Ki life energy for high-speed flight, superhuman strikes, and energy projection (Kamehameha), empowered by Saiyan Zenkai genetic recovery boosts after near-fatal battles, progressing through Super Saiyan forms up to the autonomous reflexes of Ultra Instinct.',
    keyAttributes: [
      'Ki manipulation and focused energy blast projection (Kamehameha)',
      'Zenkai genetic biological recoveries yielding permanent power boosts',
      'Super Saiyan transformations multiplying speed and energy exponentially',
      'Autonomous Ultra Instinct allowing automatic subconscious combat evasion'
    ],
    funMealAdvice:
      'Saiyans eat colossal banquets after tough battles. At your local hotel, maximize your food value with nutrient-dense staples and eggs without blowing your daily budget.'
  },
  {
    keywords: ['batman', 'bruce wayne', 'dark knight'],
    canonicalName: 'Batman (DC Comics)',
    type: 'Fictional Character (Comic Books / Pop Culture)',
    status: 'Fictional / Entertainment',
    isFictional: true,
    icon: '🦇',
    knownFor: 'Peak human physical conditioning, mastery of martial arts, tactical prep time, forensic deduction, and Wayne Enterprises tech',
    context: 'In DC Comics lore, Bruce Wayne operates without superpowers, relying on human willpower, tactical intelligence, and advanced technology.',
    strengthDescription:
      'In DC Comics lore, Batman embodies the apex of human physical and intellectual capability: Olympic-level gymnastics, mastery of 127 martial arts disciplines, forensic deductive genius, tactical prep time, and an arsenal of high-tech graphite armor and surveillance gadgets.',
    keyAttributes: [
      'Peak human physical conditioning (bench, squat, sprint, endurance)',
      'Mastery of dozens of martial arts and tactical hand-to-hand combat',
      'Genius-level deductive intellect and tactical preparatory planning',
      'Advanced specialized Kevlar-titanium armor and stealth gear'
    ],
    funMealAdvice:
      'Peak mental and physical performance requires tactical planning. Review the hotel inventory before ordering to choose the smartest combination.'
  },
  {
    keywords: ['spiderman', 'spider-man', 'peter parker'],
    canonicalName: 'Spider-Man (Marvel Comics)',
    type: 'Fictional Character (Comic Books / Pop Culture)',
    status: 'Fictional / Entertainment',
    isFictional: true,
    icon: '🕷️',
    knownFor: 'Proportional spider strength (lifting 10+ tons), precognitive Spider-Sense, wall-crawling, and web-slinging agility',
    context: 'In Marvel Comics lore, Peter Parker gained arachnid abilities after a bite from a radioactive spider.',
    strengthDescription:
      'In Marvel Comics lore, Peter Parker possesses the proportional physical capabilities of a spider: lifting over 10 metric tons, electrostatic surface adhesion allowing wall-crawling, reflexes 40 times faster than an average human, and a precognitive "Spider-Sense" warning of immediate danger.',
    keyAttributes: [
      'Proportional arachnid physical strength (lifting 10–20 metric tons)',
      'Precognitive Spider-Sense detecting immediate environmental hazards',
      'Electrostatic inter-molecular van der Waals wall-crawling adhesion',
      'Superhuman acrobatic agility, balance, and rapid web-shooting reflexes'
    ],
    funMealAdvice:
      'Web-slinging through the city burns serious energy. When eating out on a student or adventurer budget, pick affordable staples like dosa or idli plus an egg.'
  },
  {
    keywords: ['kratos', 'god of war'],
    canonicalName: 'Kratos (God of War)',
    type: 'Fictional Character (Video Games)',
    status: 'Fictional / Entertainment',
    isFictional: true,
    icon: '🪓',
    knownFor: 'Spartan demigod physical strength, Leviathan Axe, Blades of Chaos, Spartan Rage, and grappling mythological titans',
    context: 'In God of War lore, Kratos is a Spartan demigod who overthrew the Greek pantheon and journeys through Norse realms.',
    strengthDescription:
      'In God of War lore, Kratos possesses divine physical strength capable of grappling colossal mythological titans and gods, wielding the fire-forged Blades of Chaos and the frost-infused Leviathan Axe, supported by Spartan Rage and rapid godly cellular resilience.',
    keyAttributes: [
      'Divine titan-grappling physical strength and crushing grip leverage',
      'Spartan Rage empowerment multiplying combat impact and invulnerability',
      'Mastery of frost Leviathan Axe and primordial Blades of Chaos',
      'Exceptional physical endurance and godly regenerative vitality'
    ],
    funMealAdvice:
      'Spartan warriors prioritized discipline and hearty nutrition over luxury. Eat solid, wholesome food that prepares you for any daily challenge.'
  },
  {
    keywords: ['godzilla', 'king of the monsters'],
    canonicalName: 'Godzilla (Toho / MonsterVerse)',
    type: 'Fictional Character (Kaiju / Pop Culture)',
    status: 'Fictional / Entertainment',
    isFictional: true,
    icon: '🦖',
    knownFor: 'Colossal prehistoric mass (90,000+ tons), atomic breath thermal ray, nuclear pulse, and cellular regeneration',
    context: 'In kaiju lore, Godzilla is an ancient radioactive titan standing over 100 meters tall with immense destructive durability.',
    strengthDescription:
      'In kaiju lore, Godzilla possesses an estimated mass exceeding 90,000 metric tons, an internal biological nuclear reactor that powers an atomic breath thermal beam capable of melting titanium and vaporizing city blocks, coupled with impenetrable armored scales and rapid cellular regeneration (Organizer G-1).',
    keyAttributes: [
      'Colossal physical mass (90,000+ metric tons) generating immense seismic footfalls',
      'Atomic breath thermal beam fueled by internal nuclear bio-reactor',
      'Impenetrable armored hide resisting military-grade ballistic bombardment',
      'Rapid cellular regeneration healing extensive physical tissue trauma'
    ],
    funMealAdvice:
      'Colossal titans run on nuclear energy, but human energy comes from clean food! Eat hearty meals on time to keep your personal energy stable.'
  },

  // =========================================================================
  // 4. MYTHOLOGY / LEGENDS / FOLKLORE
  // =========================================================================
  {
    keywords: ['hanuman', 'bajrangbali', 'maruti', 'anjaneya'],
    canonicalName: 'Lord Hanuman (Ramayana Lore)',
    type: 'Mythology / Ancient Epic Lore (Hindu Epic)',
    status: 'Mythology / Ancient Lore',
    isFictional: false, // Sacred / legendary tradition
    icon: '🚩',
    knownFor: 'Boundless physical strength, selfless devotion, lifting Mount Dronagiri, ocean leap, and siddhi mastery',
    context: 'In the Hindu epic Ramayana, Hanuman embodies supreme strength, unwavering loyalty, and selfless service.',
    strengthDescription:
      'In Ramayana and Vedic tradition, Hanuman is revered for supreme physical might and eight yogic siddhis, notably Anima (shrinking) and Mahima (expanding to colossal size), carrying the Dronagiri mountain with life-giving Sanjeevani herbs across India, and leaping across the southern ocean to Lanka.',
    keyAttributes: [
      'Revered embodiment of supreme physical strength, humility, and devotion',
      'Mastery of eight yogic siddhis including size manipulation (Anima & Mahima)',
      'Fabled carrier of the medicinal Mount Dronagiri to heal wounded warriors',
      'Leap across the southern ocean in selfless service to Rama'
    ],
    funMealAdvice:
      'Hanuman’s strength is deeply tied to purity, wholesome vegetarian food, and mental discipline. Wholesome vegetarian meals like dal, vegetables, and rice provide great real-world vitality.'
  },
  {
    keywords: ['hercules', 'heracles'],
    canonicalName: 'Hercules / Heracles (Greco-Roman Mythology)',
    type: 'Mythology / Ancient Folklore (Classical Greek)',
    status: 'Mythology / Ancient Lore',
    isFictional: true,
    icon: '🏛️',
    knownFor: 'Divine mortal strength from birth, Twelve Labors, slaying the Nemean Lion, and holding up the celestial sky',
    context: 'In Greek mythology, Heracles is the demigod son of Zeus whose unmatched physical power was tested through twelve monumental labors.',
    strengthDescription:
      'In Greek mythology, Heracles possessed unmatched divine physical strength from infancy (strangling serpents in his crib), successfully completing the Twelve Labors by wrestling the invulnerable Nemean Lion, capturing the Erymanthian Boar, and temporarily shouldering the weight of the celestial heavens for Atlas.',
    keyAttributes: [
      'Divine physical strength from infancy in Greek myth',
      'Completion of the legendary Twelve Labors',
      'Subdual and slaying of the invulnerable Nemean Lion',
      'Mythological feat of bearing the celestial sphere for Atlas'
    ],
    funMealAdvice:
      'Even legendary heroes faced labors one step at a time. Tracking your meals one breakfast, lunch, and dinner at a time builds long-term success.'
  },
  {
    keywords: ['thor', 'mjolnir'],
    canonicalName: 'Thor (Norse Mythology)',
    type: 'Mythology / Ancient Folklore (Norse Tradition)',
    status: 'Mythology / Ancient Lore',
    isFictional: true,
    icon: '🔨',
    knownFor: 'Mountain-crushing hammer Mjölnir, belt Megingjörð doubling physical strength, lightning, and protector of Midgard',
    context: 'In ancient Norse mythology, Thor is the son of Odin and protector of humanity (Midgard), wielding the forged hammer Mjölnir.',
    strengthDescription:
      'In ancient Norse mythology, Thor is the strongest of the Aesir gods, wielding the dwarf-forged war hammer Mjölnir that levels mountains with a single blow, wearing iron gloves (Járngreipr) and the belt Megingjörð which doubles his already godlike physical might when buckled.',
    keyAttributes: [
      'Wielder of the enchanted dwarf-forged hammer Mjölnir',
      'Megingjörð belt doubling divine physical strength when worn',
      'Summoner of atmospheric thunderstorms and lightning',
      'Fabled protector of Midgard and Asgard against jotnar giants'
    ],
    funMealAdvice:
      'Norse sagas describe Thor eating entire oxen at feasts! In reality, pacing your portions across the day keeps your physical energy balanced and sustainable.'
  },
  {
    keywords: ['zeus', 'jupiter'],
    canonicalName: 'Zeus (Greek Mythology)',
    type: 'Mythology / Ancient Folklore (Classical Greek)',
    status: 'Mythology / Ancient Lore',
    isFictional: true,
    icon: '⚡',
    knownFor: 'Thunderbolt weapon forged by Cyclopes, ruler of Mount Olympus, sky and weather control, and divine authority',
    context: 'In classical Greek mythology, Zeus is the king of the Olympian deities, presiding over the sky, law, and cosmic order.',
    strengthDescription:
      'In Greek mythology, Zeus wields celestial lightning bolts forged by the Cyclopes, possessing supreme sovereign authority over the sky, storm clouds, and Olympic gods, capable of overthrowing the Titans and reshaping atmospheric weather across the mortal world.',
    keyAttributes: [
      'Cyclops-forged celestial thunderbolt weapon',
      'Supreme sovereign authority over the Olympian pantheon',
      'Control over atmospheric wind, lightning, and torrential rain',
      'Aegis shield offering divine tactical protection'
    ],
    funMealAdvice:
      'Mythological rulers feasted on ambrosia, but mortal humans need real, grounded nourishment. A hearty lunch with grains and protein keeps you energized.'
  },
  {
    keywords: ['bhima', 'bheem'],
    canonicalName: 'Bhima (Mahabharata Epic Lore)',
    type: 'Mythology / Ancient Epic Lore (Hindu Epic)',
    status: 'Mythology / Ancient Lore',
    isFictional: false,
    icon: '🔱',
    knownFor: 'Physical strength of 10,000 elephants, heavy mace (gada) combat, wrestling prowess, and Pandava protector',
    context: 'In the Hindu epic Mahabharata, Bhima is the second Pandava brother, renowned for immense physical bulk and appetite.',
    strengthDescription:
      'In the Mahabharata, Bhima was blessed with the physical might of 10,000 elephants after drinking the divine nectar in the realm of the Nagas, proving unmatched in mace warfare, wrestling down fierce combatants like Jarasandha and Duryodhana, and protecting his brothers with sheer physical force.',
    keyAttributes: [
      'Legendary physical strength traditionally compared to 10,000 elephants',
      'Supreme mastery of heavy mace (gada) warfare and close-quarter wrestling',
      'Vast appetite and physical stamina sustaining demanding martial campaigns',
      'Core warrior strength anchoring the Pandava army in the Kurukshetra war'
    ],
    funMealAdvice:
      'Bhima’s appetite was legendary, matching his monumental workload. Eat meals that genuinely satisfy your hunger without exceeding your daily food budget.'
  },
  {
    keywords: ['dragon', 'dragons'],
    canonicalName: 'Dragon (Mythological & Folklore)',
    type: 'Mythology / Legendary Creature',
    status: 'Mythology / Ancient Lore',
    isFictional: true,
    icon: '🐉',
    knownFor: 'Armored scales, massive aerial wingspan, elemental fire breath, and ancient physical power',
    context: 'Dragons appear across global folklore (European and Asian traditions) as supreme mythical creatures of power and nature.',
    strengthDescription:
      'In mythological lore, dragons embody primordial elemental force: impenetrable armored scales resisting mundane weapons, colossal wing spans generating downdrafts, and the ability to expel superheated fire, representing the untamed power of the natural elements.',
    keyAttributes: [
      'Impenetrable mythical armored scales resisting mundane weapons',
      'Elemental pyrotechnic breath producing superheated firestreams',
      'Enormous wingspan generating localized gale-force downdrafts',
      'Universal legendary status across Eastern and Western folklore'
    ],
    funMealAdvice:
      'Fire-breathing dragons may be fantasy, but spicy or oily foods can cause real-world heartburn! Keep hot and fried foods in moderation for easy digestion.'
  },

  // =========================================================================
  // 5. VEHICLES & MACHINES (Real-World Engineering — NO muscle descriptions)
  // =========================================================================
  {
    keywords: ['bulldozer', 'bulldozers'],
    canonicalName: 'Bulldozer (Heavy Construction Machinery)',
    type: 'Machine / Heavy Construction Vehicle',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '🚜',
    knownFor: 'Continuous crawler track ground traction, drawbar pushing force, and heavy blade earthmoving capability',
    context: 'A bulldozer is an industrial tracked machine engineered specifically to push vast volumes of soil, rubble, and compacted earth.',
    strengthDescription:
      'A bulldozer operates through low-speed, high-displacement diesel torque transferred through wide steel crawler tracks that maximize ground contact area, using a reinforced hydraulic front blade to exert tens of thousands of Newtons of drawbar pushing force to move dense earth and rock without slipping.',
    keyAttributes: [
      'High-displacement diesel engine output (up to 800+ hp in mining class)',
      'Wide steel crawler tracks distributing weight and maximizing ground tractive friction',
      'Reinforced hydraulic front blade exerting massive forward pushing force',
      'Rear multi-shank ripper penetrating and fracturing compacted bedrock'
    ],
    funMealAdvice:
      'Heavy earthmoving machines require heavy-duty fuel reserves. A hearty base of carbohydrates (rice or chapati) provides the solid foundation for all physical activity.',
    quantityHandler: (count: number) => ({
      reference: `${count} Bulldozers`,
      description: `${count} industrial crawler bulldozers combine their tractive drawbar pushing power, capable of shifting hundreds of metric tons of compacted soil and rock simultaneously on heavy earthwork sites.`,
      context: `Industrial engineering scale: ${count} heavy tracked machines delivering collective drawbar pushing force.`
    })
  },
  {
    keywords: ['crane', 'cranes', 'tower crane', 'mobile crane'],
    canonicalName: 'Crane (Hydraulic / Tower Lifting Machine)',
    type: 'Machine / Heavy Lifting Engineering',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '🏗️',
    knownFor: 'Vertical load lifting capacity, counterbalanced moment stability, and heavy steel wire rope tensile handling',
    context: 'Cranes are specialized construction machines designed to lift and position multi-ton structural loads to extreme heights.',
    strengthDescription:
      'A crane’s capability is defined by vertical load-handling capacity and overturning moment stability, utilizing hydraulic telescopic booms or steel lattice jibs, heavy concrete counterweights to offset load leverage, and multi-part high-tensile steel wire ropes capable of lifting tens to hundreds of metric tons.',
    keyAttributes: [
      'Vertical lifting capacity ranging from 50 to 1,200+ metric tons in mobile cranes',
      'Overturning moment counterbalancing with calibrated ballast weights',
      'High-tensile multi-strand steel hoist cables distributing tensile stress',
      'Hydraulic outrigger stabilization securing the machine to ground foundations'
    ],
    funMealAdvice:
      'Lifting heavy loads requires balance and steady anchoring. Balance your daily food budget so your morning, lunch, and dinner are all accounted for.'
  },
  {
    keywords: ['train', 'trains', 'locomotive', 'freight train'],
    canonicalName: 'Locomotive / Freight Train (Rail Transport)',
    type: 'Machine / Rail Transport Engineering',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '🚆',
    knownFor: 'Diesel-electric traction motor torque, low rolling friction steel-on-steel contact, and multi-thousand-ton freight hauling',
    context: 'Locomotives are the most energy-efficient heavy overland transport machines, moving tens of thousands of tons of cargo.',
    strengthDescription:
      'A modern diesel-electric locomotive generates 3,000 to 4,500 kilowatts of continuous electric traction motor power, delivering exceptional tractive effort through steel wheels on steel rails, moving trailing freight masses exceeding 10,000 to 20,000 metric tons with minimal rolling resistance.',
    keyAttributes: [
      'Continuous electric traction motor torque delivering high starting tractive effort',
      'Steel-on-steel rail interface providing world-class low rolling friction coefficient',
      'Hauling capability for freight consists exceeding 10,000+ metric tons',
      'Dynamic regenerative braking converting kinetic train energy into electrical load'
    ],
    funMealAdvice:
      'Trains excel through unbroken momentum. Maintain your daily tracking streak to build an unbroken chain of healthy habits.'
  },
  {
    keywords: ['rocket', 'rockets', 'spacecraft', 'saturn v', 'falcon heavy'],
    canonicalName: 'Rocket / Orbital Launch Vehicle',
    type: 'Machine / Aerospace Engineering',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '🚀',
    knownFor: 'Multi-million Newton combustion thrust, supersonic exhaust propellant velocity, and orbital escape speed',
    context: 'Rockets produce the greatest instantaneous kinetic thrust of any human-engineered machines, escaping Earth\'s gravity.',
    strengthDescription:
      'A multi-stage chemical launch vehicle generates millions of Newtons of thrust by combusting high-density propellants (such as liquid oxygen and RP-1 or methane) in high-pressure combustion chambers, expelling exhaust gases at supersonic velocities (over 3,000 m/s) through de Laval nozzles to overcome Earth gravity and reach orbital velocity (28,000 km/h).',
    keyAttributes: [
      'Massive combustion thrust (e.g. Falcon Heavy generates over 22 million Newtons)',
      'Supersonic exhaust propellant gas velocities exceeding 3,000 m/s',
      'Thrust-to-weight ratio exceeding 1.2 to 1.5 at liftoff',
      'Atmospheric escape velocity capability reaching ~40,000 km/h'
    ],
    funMealAdvice:
      'Rocket stages require precise fuel measurements. Staying within your daily food budget requires similar discipline so your funds last through dinner!'
  },
  {
    keywords: ['aircraft', 'airplane', 'jet', 'fighter jet', 'f-22', 'f-35'],
    canonicalName: 'Jet Aircraft / Fighter Jet',
    type: 'Machine / Aerospace Aviation',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '✈️',
    knownFor: 'Afterburning turbofan engine thrust, aerodynamic airfoil lift, supersonic cruise, and high-G structural design',
    context: 'Jet aircraft convert chemical jet fuel into forward thrust and aerodynamic lift, achieving high-speed aerial flight.',
    strengthDescription:
      'A modern jet aircraft produces tens of thousands of pounds of thrust via high-bypass turbofans or afterburning military turbojets, converting forward airspeed across cambered airfoil wings into aerodynamic lift, designed with titanium-composite airframes capable of enduring 9G sustained maneuvers.',
    keyAttributes: [
      'Afterburning turbofan thrust output exceeding 35,000 lbs per engine',
      'Aerodynamic wing camber generating tens of tons of vertical lift',
      'High-G airframe structural engineering rated for 9G combat turns',
      'Supersonic flight speeds exceeding Mach 1.5 to Mach 2.0'
    ],
    funMealAdvice:
      'Aviation relies on weight efficiency and balance. A well-proportioned plate with the right ratio of main staple, protein, and vegetables keeps your metabolism running clean.'
  },
  {
    keywords: ['car', 'cars', 'automobile', 'sports car'],
    canonicalName: 'Automobile (Motor Vehicle)',
    type: 'Machine / Automotive Engineering',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '🚗',
    knownFor: 'Engine horsepower and rotational torque, transmission gearing, tire road friction, and hydraulic braking',
    context: 'Automobiles convert thermal or electrical energy into rotational drivetrain torque for wheeled personal transit.',
    strengthDescription:
      'An automobile delivers power through an internal combustion engine or electric traction motor, transferring rotational torque through transmission gears and differentials to drive wheels, generating tractive force against road pavement to achieve controlled acceleration and high-friction disc braking.',
    keyAttributes: [
      'Internal combustion or electric motor output (typically 100 to 500+ horsepower)',
      'Drivetrain rotational torque transmission with calibrated gear multiplication',
      'Pneumatic tire rubber friction coefficient providing road adhesion',
      'Hydraulic caliper disc braking converting kinetic energy to thermal dissipation'
    ],
    funMealAdvice:
      'Just as an engine runs poorly on dirty or inadequate fuel, your body needs clean, quality nourishment to avoid sluggish afternoons. Avoid greasy overeating.'
  },
  {
    keywords: ['truck', 'trucks', 'semi', 'semi-truck', 'lorry'],
    canonicalName: 'Heavy Transport Semi-Truck',
    type: 'Machine / Commercial Transport Engineering',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '🚛',
    knownFor: 'High low-end turbo-diesel torque (1,500–2,500+ Nm), heavy chassis towing capacity, and pneumatic air brakes',
    context: 'Heavy freight trucks are engineered for high sustained torque and multi-ton towing endurance across highway networks.',
    strengthDescription:
      'A heavy transport truck is powered by a multi-liter turbo-diesel engine engineered for extreme low-end torque (generating 1,500 to 2,800 Nm at low RPM), coupled with an 18-speed transmission and multi-axle pneumatic dual-circuit air brakes to haul 40+ metric tons of gross vehicle weight across long distances.',
    keyAttributes: [
      'High low-end turbo-diesel torque output (1,500–2,800 Nm at 1,100 RPM)',
      'Heavy steel ladder chassis engineered for multi-ton fifth-wheel tongue weight',
      'Pneumatic dual-circuit air brakes designed for continuous descent braking',
      'Multi-axle weight distribution minimizing highway pavement shear'
    ],
    funMealAdvice:
      'Heavy haulers require reliable energy reserves. Don’t run on empty—log your meals to ensure you meet your daily nutritional baseline.'
  },
  {
    keywords: ['excavator', 'excavators', 'jcb', 'backhoe'],
    canonicalName: 'Hydraulic Excavator (Heavy Earthmoving Machinery)',
    type: 'Machine / Hydraulic Engineering',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '🚜',
    knownFor: 'High-pressure hydraulic breakout force (300+ bar), steel boom leverage, and 360-degree slew rotation',
    context: 'Excavators use fluid hydraulic power to fracture compacted earth, dig deep trenches, and handle heavy rock loads.',
    strengthDescription:
      'An excavator generates tremendous mechanical breakout force through high-pressure variable-displacement hydraulic pumps operating at 300 to 350 bar, directing pressurized hydraulic fluid into heavy steel cylinder pistons to actuate the boom, stick, and bucket to slice compacted earth and lift multi-ton boulders.',
    keyAttributes: [
      'High-pressure hydraulic system (300–350 bar) generating massive breakout force',
      'Variable-displacement axial piston hydraulic pumps',
      'Heavy structural steel boom and arm providing rigid mechanical leverage',
      'Continuous 360-degree slew ring rotation torque for efficient spoil casting'
    ],
    funMealAdvice:
      'Steady hydraulic power depends on a smooth, constant pressure source. Eating at regular meal intervals prevents energy drops.'
  },
  {
    keywords: ['tank', 'tanks', 'battle tank', 'm1 abrams'],
    canonicalName: 'Main Battle Tank (Armored Military Vehicle)',
    type: 'Machine / Armored Military Engineering',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '🛡️',
    knownFor: 'Heavy composite/reactive armor protection, 1,500+ hp multi-fuel powerplant, and all-terrain crawler track mobility',
    context: 'Main battle tanks combine heavy ballistic protection, high all-terrain horsepower, and stabilized firepower in a 60+ ton platform.',
    strengthDescription:
      'A modern main battle tank combines a 1,500-horsepower turbine or turbo-diesel engine with heavy composite chobham and reactive armor plating, distributing a 60-to-70-metric-ton combat mass across wide continuous track pads to traverse mud, trenches, and obstacles with high cross-country speed.',
    keyAttributes: [
      '1,500-horsepower multi-fuel turbine/diesel powertrain',
      'Heavy composite and explosive reactive armor resisting kinetic penetrators',
      'High-mobility torsion bar or hydropneumatic tracked suspension',
      'Gyrostabilized smoothbore cannon delivering high-velocity ballistic kinetic energy'
    ],
    funMealAdvice:
      'Armor and defense begin from within. When you feel sick or sensitive, choose mild, non-fried foods to protect your digestive system.'
  },

  // =========================================================================
  // 6. OBJECTS / TOOLS / EQUIPMENT
  // =========================================================================
  {
    keywords: ['hydraulic press'],
    canonicalName: 'Industrial Hydraulic Press',
    type: 'Object / Industrial Machine Tool',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '⚙️',
    knownFor: 'Pascal\'s principle hydraulic force multiplication, concentrated compressive tonnage, and material forming',
    context: 'Hydraulic presses use fluid mechanics to multiply force, delivering hundreds or thousands of tons of compressive force.',
    strengthDescription:
      'A hydraulic press applies Pascal\'s principle: a small piston pressurizes hydraulic fluid, which transmits uniform pressure to a large-diameter slave piston, multiplying input force into hundreds to thousands of metric tons of compressive force capable of crushing solid steel, forging billet, or stamping sheet metal.',
    keyAttributes: [
      'Pascal\'s law fluid force multiplication: F2 = F1 × (A2 / A1)',
      'Compressive force capacities ranging from 50 to 50,000+ metric tons',
      'Rigid cast-steel tie-rod frame resisting massive internal tensile deflection',
      'Continuous, smooth force delivery without impact shock'
    ],
    funMealAdvice:
      'Even a massive press applies force smoothly and steadily. Building a great streak works the same way—smooth, daily consistency rather than sudden extremes.'
  },
  {
    keywords: ['hammer', 'hammers', 'sledgehammer'],
    canonicalName: 'Hammer / Sledgehammer (Kinetic Tool)',
    type: 'Object / Hand Tool',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '🔨',
    knownFor: 'Kinetic impact force, lever arm acceleration, and momentum transfer onto targets',
    context: 'A hammer converts human arm leverage and velocity into high-impact kinetic energy concentrated on a small striking surface.',
    strengthDescription:
      'A hammer functions as a third-class lever: muscular force accelerates a heavy forged-steel head at the end of a rigid handle, and upon contact, the kinetic energy (KE = ½mv²) is transferred almost instantaneously over a tiny contact area, generating thousands of Newtons of momentary impact force to drive fasteners or fracture stone.',
    keyAttributes: [
      'Lever arm kinetic acceleration concentrating momentum: KE = ½mv²',
      'Forged high-carbon steel head resisting mushrooming and structural fatigue',
      'Instantaneous momentum transfer generating high-amplitude shock pulses',
      'Ergonomic handle dampening harmonic rebound vibrations'
    ],
    funMealAdvice:
      'Focusing impact on a single point achieves clear results. Focus on one meal decision at a time to stay on budget every day.'
  },
  {
    keywords: ['engine', 'engines'],
    canonicalName: 'Internal Combustion Engine / Electric Motor',
    type: 'Object / Mechanical Powertrain',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '⚙️',
    knownFor: 'Thermodynamic energy conversion, brake horsepower, and continuous rotational torque output',
    context: 'Engines and motors convert chemical or electrical energy into mechanical rotational work.',
    strengthDescription:
      'An internal combustion engine converts the chemical energy of fuel into thermal pressure that drives pistons down cylinders, turning a forged steel crankshaft into rotational torque, measured in Newton-meters and brake horsepower across a calibrated powerband.',
    keyAttributes: [
      'Thermodynamic chemical-to-mechanical energy conversion',
      'Rotational torque output delivered through a balanced crankshaft',
      'Brake horsepower rating determining rate of mechanical work',
      'Thermal cooling and pressurized lubrication managing friction and heat'
    ],
    funMealAdvice:
      'An engine requires consistent oil and fuel. Nourish your body regularly throughout the day with clean, wholesome food.'
  },
  {
    keywords: ['battery', 'batteries'],
    canonicalName: 'Electrochemical Battery',
    type: 'Object / Electrical Energy Storage',
    status: 'Real-World Engineering',
    isFictional: false,
    icon: '🔋',
    knownFor: 'Chemical energy density (Wh/kg), continuous current delivery, and peak electrical discharge (NOT physical muscle)',
    context: 'Batteries store electrical potential chemically and deliver power on demand, quantified in voltage and ampere-hours.',
    strengthDescription:
      'A battery’s "power" is defined by electrochemical potential difference (voltage), energy density (watt-hours per kilogram), and discharge current (C-rating), releasing electrons through an external circuit via reduction-oxidation reactions at the anode and cathode without physical mechanical motion.',
    keyAttributes: [
      'Electrochemical cell potential (Volts) and capacity (Ampere-hours)',
      'Energy density per unit mass (Wh/kg) and volumetric density (Wh/L)',
      'Peak burst discharge capability (C-rate) without thermal runaway',
      'Reversible redox chemistry enabling multi-thousand-cycle charge life'
    ],
    funMealAdvice:
      'When your personal battery runs low in the afternoon, skip high-sugar snacks that cause crashes. A balanced meal or warm tea restores clean energy.'
  },

  // =========================================================================
  // 7. NATURE & NATURAL PHENOMENA
  // =========================================================================
  {
    keywords: ['hurricane', 'cyclone', 'typhoon'],
    canonicalName: 'Tropical Cyclone / Hurricane',
    type: 'Natural Phenomenon (Meteorology / Geophysical)',
    status: 'Real-World Physics / Nature',
    isFictional: false,
    icon: '🌀',
    knownFor: 'Vast rotating thermal heat engine, sustained winds >150–250 km/h, barometric pressure drop, and kinetic storm surge',
    context: 'Tropical cyclones are planetary-scale meteorological heat engines powered by ocean evaporation, releasing colossal kinetic energy.',
    strengthDescription:
      'A hurricane is a planetary-scale atmospheric heat engine driven by latent heat release from warm ocean water, generating sustained winds exceeding 150 to 250 km/h across hundreds of kilometers, creating deep central low-pressure barometric drops and releasing mechanical energy equivalent to multiple nuclear detonations per day.',
    keyAttributes: [
      'Planetary-scale thermal energy system spanning hundreds of kilometers',
      'Sustained wind velocities exceeding 150–250 km/h (Category 1 to 5)',
      'Colossal kinetic energy release (~1.5 × 10¹² Watts in latent heat)',
      'Massive coastal storm surges driven by low central barometric pressure'
    ],
    funMealAdvice:
      'Hurricanes demonstrate the raw power of continuous thermal energy. Give your body steady caloric energy through regular, planned meals.'
  },
  {
    keywords: ['tornado', 'twister'],
    canonicalName: 'Tornado (Violent Atmospheric Vortex)',
    type: 'Natural Phenomenon (Severe Weather)',
    status: 'Real-World Physics / Nature',
    isFictional: false,
    icon: '🌪️',
    knownFor: 'Violent concentrated rotational wind speeds (>400 km/h in EF5), vertical updraft, and localized kinetic shear',
    context: 'Tornadoes concentrate atmospheric kinetic energy into narrow rotating columns of air descending from supercell thunderstorms.',
    strengthDescription:
      'A tornado concentrates violent atmospheric kinetic shear into a localized rotating column extending from a supercell to the ground, with peak rotational wind speeds exceeding 400 to 500 km/h in EF5 events, generating extreme dynamic wind loads and intense vertical updrafts that dislodge reinforced foundations.',
    keyAttributes: [
      'Extreme rotational wind velocity reaching 400–500+ km/h in EF5 events',
      'Violent vertical updrafts exceeding 150 km/h lifting heavy debris',
      'Concentrated localized kinetic shear energy',
      'Extreme barometric pressure gradients across the vortex core'
    ],
    funMealAdvice:
      'Concentrated energy is most effective when controlled. Avoid erratic snacking and eat structured, balanced meals during the day.'
  },
  {
    keywords: ['earthquake', 'earthquakes', 'seismic'],
    canonicalName: 'Earthquake (Tectonic Strain Release)',
    type: 'Natural Phenomenon (Geophysics / Seismology)',
    status: 'Real-World Physics / Nature',
    isFictional: false,
    icon: '🌋',
    knownFor: 'Tectonic fault slip, seismic wave propagation (P & S waves), ground acceleration, and gigajoule crustal energy release',
    context: 'Earthquakes are sudden releases of strain energy built up along geological fault lines within the Earth\'s crust.',
    strengthDescription:
      'An earthquake occurs when accumulated frictional tectonic strain along a lithospheric fault plane suddenly overcomes shear resistance, releasing millions of gigajoules of elastic strain energy that propagates through the crust as compressional P-waves and shearing S-waves, causing intense ground acceleration.',
    keyAttributes: [
      'Sudden release of elastic strain energy accumulated over decades or centuries',
      'Seismic wave propagation (P-waves, S-waves, Rayleigh and Love surface waves)',
      'Peak ground acceleration (PGA) exerting severe lateral forces on structures',
      'Massive crustal displacement altering topography along fault lines'
    ],
    funMealAdvice:
      'Tectonic energy builds steadily over time. Consistency in your daily food habits creates a solid, unshakable foundation for your personal wellness.'
  },
  {
    keywords: ['volcano', 'volcanoes', 'volcanic eruption'],
    canonicalName: 'Volcanic Eruption (Geothermal Volcanology)',
    type: 'Natural Phenomenon (Geothermal Physics)',
    status: 'Real-World Physics / Nature',
    isFictional: false,
    icon: '🌋',
    knownFor: 'Subterranean magmatic pressure, superheated pyroclastic flows, volcanic gas venting, and landform creation',
    context: 'Volcanoes vent interior planetary heat and magma, reshaping regional geology through thermal and explosive force.',
    strengthDescription:
      'A volcanic eruption represents the release of subterranean magmatic and gas pressure as magma ascends through crustal conduits, producing explosive plinian ash columns reaching into the stratosphere, high-velocity superheated pyroclastic density currents (moving at 100+ km/h), and liquid basaltic lava flows.',
    keyAttributes: [
      'Immense geothermal pressure driven by dissolved volcanic volatile expansion',
      'High-velocity pyroclastic density currents (superheated gas and tephra)',
      'Stratospheric ash injection altering atmospheric solar transmission',
      'Basaltic lava thermal transfer exceeding 1,000°C'
    ],
    funMealAdvice:
      'Volcanic heat comes from deep within. Nourish yourself from the inside out with wholesome, nutrient-rich foods at every meal.'
  },
  {
    keywords: ['lightning', 'thunderbolt'],
    canonicalName: 'Atmospheric Lightning Discharge',
    type: 'Natural Phenomenon (Atmospheric Electrophysics)',
    status: 'Real-World Physics / Nature',
    isFictional: false,
    icon: '⚡',
    knownFor: 'High-voltage electrostatic dielectric breakdown, 30,000+ ampere plasma current, and 30,000 Kelvin rapid heating',
    context: 'Lightning is an instantaneous electrostatic discharge neutralizing massive voltage potentials between clouds and the ground.',
    strengthDescription:
      'Lightning is an electrostatic dielectric breakdown of air, neutralizing electrical potential differences of tens to hundreds of millions of volts in fractions of a millisecond, conducting peak currents over 30,000 amperes and heating the narrow plasma channel to roughly 30,000 Kelvin (hotter than the sun\'s surface), generating acoustic thunder shockwaves.',
    keyAttributes: [
      'High-voltage electric potential difference (100+ million Volts)',
      'Peak electrical current conduction exceeding 30,000 Amperes',
      'Rapid plasma channel thermal expansion up to 30,000 Kelvin',
      'Acoustic shockwave generation resulting in sonic thunder'
    ],
    funMealAdvice:
      'Quick energy bursts need replenishment. Eat complex carbohydrates with protein to avoid energy slumps after intense physical or mental tasks.'
  },
  {
    keywords: ['tsunami', 'megawave'],
    canonicalName: 'Tsunami (Oceanic Seismic Surge)',
    type: 'Natural Phenomenon (Oceanography)',
    status: 'Real-World Physics / Nature',
    isFictional: false,
    icon: '🌊',
    knownFor: 'Undersea vertical water column displacement, long-wavelength ocean wave speed (700+ km/h), and coastal momentum surge',
    context: 'Tsunamis are water displacement waves generated by submarine earthquakes or volcanic caldera collapses.',
    strengthDescription:
      'A tsunami is generated by the sudden vertical displacement of the entire ocean water column from an undersea megathrust earthquake, propagating across deep ocean basins at speeds exceeding 700 km/h with hundreds of kilometers of wavelength, then shoaling into a massive, unstoppable momentum surge as it enters shallow coastal waters.',
    keyAttributes: [
      'Full water-column vertical kinetic displacement (not merely surface wind waves)',
      'High open-ocean wave propagation velocity (700–800+ km/h)',
      'Enormous wavelength energy conservation traversing entire ocean basins',
      'Catastrophic coastal momentum runup and hydraulic inundation force'
    ],
    funMealAdvice:
      'Sustained momentum wins the race. Stay consistent with your daily meal tracking and food budget.'
  },

  // =========================================================================
  // 8. PLACES & STRUCTURES
  // =========================================================================
  {
    keywords: ['mountain', 'mountains', 'mount everest', 'himalayas'],
    canonicalName: 'Mountain / Geological Range',
    type: 'Structure / Geological Landmark',
    status: 'Real-World Structure',
    isFictional: false,
    icon: '⛰️',
    knownFor: 'Continental tectonic collision uplift, millions of tons of bedrock permanence, and environmental elevation barrier',
    context: 'Mountains are massive geological landforms produced by tectonic plate collisions over millions of years.',
    strengthDescription:
      'A mountain represents monumental geological mass and permanence: millions of metric tons of metamorphic and igneous bedrock uplifted by continental tectonic plate convergence, enduring centuries of glacial and hydraulic weathering while serving as regional climatic and elevation barriers.',
    keyAttributes: [
      'Continental tectonic plate collision and crustal uplift permanence',
      'Immense granite, basalt, and metamorphic bedrock structural mass',
      'Extreme gravitational and hydrostatic load containment',
      'Long-term resistance against glacial shear and atmospheric erosion'
    ],
    funMealAdvice:
      'Mountains stand solid because of their vast, unshakeable base. Build your daily energy on solid main staples (rice, dosa, or chapati) that keep you grounded.'
  },
  {
    keywords: ['dam', 'dams', 'hydroelectric dam', 'hoover dam'],
    canonicalName: 'Hydroelectric / Gravity Dam',
    type: 'Structure / Civil Engineering',
    status: 'Real-World Structure',
    isFictional: false,
    icon: '🌊',
    knownFor: 'Hydrostatic water pressure containment, reinforced concrete mass, and hydraulic flood regulation',
    context: 'Dams are monumental civil engineering works engineered to hold back millions of tons of hydrostatic water pressure.',
    strengthDescription:
      'A concrete gravity or arch dam is engineered to withstand immense hydrostatic head pressure from impounded reservoir water, utilizing millions of tons of post-tensioned reinforced concrete anchored into canyon bedrock to resist overturning, sliding, and hydraulic seepage.',
    keyAttributes: [
      'Continuous containment of millions of metric tons of hydrostatic water pressure',
      'Massive reinforced concrete volume anchored into geological bedrock',
      'Arch geometry transferring water loads laterally into canyon abutments',
      'High-flow spillways regulating catastrophic flood volumes safely'
    ],
    funMealAdvice:
      'Dams manage huge water reservoirs with disciplined spillways. Managing your daily food budget uses the same discipline—pace your spending so dinner is comfortable.'
  },
  {
    keywords: ['skyscraper', 'skyscrapers', 'burj khalifa', 'high-rise'],
    canonicalName: 'Skyscraper / Supertall Tower',
    type: 'Structure / Structural Engineering',
    status: 'Real-World Structure',
    isFictional: false,
    icon: '🏢',
    knownFor: 'Deep bedrock pile foundations, structural steel/concrete core, tuned mass damping, and wind load deflection',
    context: 'Supertall skyscrapers stand hundreds of meters tall by engineering vertical gravity load and horizontal wind deflection paths.',
    strengthDescription:
      'A supertall skyscraper withstands thousands of tons of vertical gravity dead-load and intense aerodynamic lateral wind shear through deep friction-pile bedrock foundations, reinforced high-strength concrete cores, outrigger steel trusses, and tuned mass dampers (pendulums) that neutralize seismic and wind oscillations.',
    keyAttributes: [
      'Deep foundation piles transferring millions of kilograms into bedrock',
      'Reinforced concrete shear walls and outrigger steel truss framing',
      'Tuned mass dampers counteracting resonant wind sway and seismic motion',
      'Aerodynamic exterior vortex shedding minimizing lateral wind loads'
    ],
    funMealAdvice:
      'Tall buildings require deep, solid foundations. A nutritious, reliable breakfast gives you the solid foundation for a productive, high-energy day.'
  }
];

/**
 * Universal entity-aware power & strength reference analyzer.
 * Accepts ANY input (animals, humans, fictional characters, machines, tools, nature, places).
 * Parses quantities (e.g. "8 Sukuna fingers", "3 elephants", "100 ants").
 * If unrecognized, returns an explicit non-hallucinated message per prompt directives.
 */
export function analyzeFunPower(powerText: string): PowerAnalysisResult {
  const text = (powerText || '').trim();
  const lower = text.toLowerCase();

  // If empty input
  if (!text) {
    return {
      reference: 'Power Reference Explorer',
      type: 'No Reference Entered',
      status: 'Unrecognized',
      isFictional: false,
      isRecognized: false,
      strengthDescription:
        'Enter any reference you find interesting—an animal (Lion, Elephant, Eagle, Ant, Cheetah), machine (Bulldozer, Crane, Train, Rocket, Car), athlete or person (Usain Bolt, Mike Tyson, Bruce Lee), fictional character (Gojo, Sukuna, Saitama, Superman, Hulk), mythological figure (Hercules, Hanuman, Thor, Zeus), or natural phenomenon (Hurricane, Volcano, Lightning).',
      knownFor: 'Context-specific evaluation across real-world biology, engineering, and popular fiction.',
      context: 'MealQuest recognizes real animals, machines, athletes, mythologies, and fictional lore without fake generic answers.',
      keyAttributes: ['Universal entity awareness', 'No fake science power units', 'Fictional vs Real clearly distinguished'],
      funMealAdvice: 'Every journey begins with a nourishing meal. Fuel yourself with a balanced plate today!',
      icon: '💡',
      disclaimer: 'Enter a recognized entity to see an accurate, context-specific description.'
    };
  }

  // Check for quantity in the input (e.g. "8 Sukuna fingers", "3 elephants", "100 ants", "2 bulldozers")
  let parsedQuantity: number | undefined;
  const quantityMatch = lower.match(/\b(\d+)\b/);
  if (quantityMatch) {
    const val = parseInt(quantityMatch[1], 10);
    if (val > 0 && val <= 100000) {
      parsedQuantity = val;
    }
  }

  // 1. Search in universal entity database
  for (const entry of UNIVERSAL_DATABASE) {
    for (const kw of entry.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(lower)) {
        let reference = entry.canonicalName;
        let strengthDesc = entry.strengthDescription;
        let contextDesc = entry.context;

        // If there's a custom quantity handler (like for Sukuna fingers or elephants or ants)
        if (parsedQuantity && entry.quantityHandler) {
          const qRes = entry.quantityHandler(parsedQuantity);
          reference = qRes.reference;
          strengthDesc = qRes.description;
          contextDesc = qRes.context;
        } else if (parsedQuantity && parsedQuantity > 1) {
          reference = `${parsedQuantity} × ${entry.canonicalName}`;
          contextDesc = `${contextDesc} (Reference scale: ${parsedQuantity} units).`;
        }

        const disclaimer = entry.isFictional
          ? '⚠️ FICTIONAL / ENTERTAINMENT REFERENCE: This describes fictional abilities from popular media or mythology. It is for entertainment and roleplay only, not a scientific or medical measurement.'
          : '🌿 REAL-WORLD REFERENCE: This describes actual physical, biological, mechanical, or geological characteristics grounded in factual engineering and science without fabricated power units.';

        return {
          reference,
          type: entry.type,
          status: entry.status,
          isFictional: entry.isFictional,
          isRecognized: true,
          quantity: parsedQuantity,
          strengthDescription: strengthDesc,
          knownFor: entry.knownFor,
          context: contextDesc,
          keyAttributes: entry.keyAttributes,
          funMealAdvice: entry.funMealAdvice,
          icon: entry.icon,
          disclaimer
        };
      }
    }
  }

  // 2. UNKNOWN / UNRECOGNIZED INPUT (STRICT COMPLIANCE WITH PROMPT RULE 12)
  // "For unknown entities: DO NOT generate a generic description.
  // Instead say something like: 'Strength reference not confidently recognized. Try a more specific or recognizable name.'
  // Then allow the user to try again."
  return {
    reference: text,
    type: 'Unrecognized Entity',
    status: 'Unrecognized',
    isFictional: false,
    isRecognized: false,
    strengthDescription:
      `Strength reference not confidently recognized. Try a more specific or recognizable name.`,
    knownFor: 'Unrecognized reference',
    context:
      `MealQuest cannot provide an accurate, fact-based description for "${text}". Please enter a recognized animal (e.g. Lion, Elephant, Eagle, Ant, Cheetah), vehicle or machine (e.g. Bulldozer, Crane, Train, Rocket, Car), real athlete or person (e.g. Usain Bolt, Mike Tyson, Bruce Lee), fictional character (e.g. Gojo, Sukuna, Saitama, Superman, Hulk), mythological figure (e.g. Hanuman, Hercules, Thor, Zeus), or natural phenomenon (e.g. Hurricane, Volcano, Lightning).`,
    keyAttributes: [
      'Entity not confidently recognized',
      'No hallucinated generic statistics',
      'Please try a recognized name'
    ],
    funMealAdvice:
      'Whatever inspires your day, remember that real energy comes from actual food—wholesome main staples (rice, dosa, chapati) accompanied by proper protein keep your real body strong.',
    icon: '❓',
    disclaimer:
      '⚠️ UNRECOGNIZED INPUT: MealQuest does not fabricate generic descriptions for unknown entries. Please enter a recognized animal, machine, athlete, fictional character, or natural phenomenon.'
  };
}
