-- Seed Data: Advisory Content with Image URLs
-- Date: 2025-10-07
-- Description: Populates the database with comprehensive farming advisory content

-- First, ensure we have at least one admin user to create content
INSERT INTO users (username, email, password_hash, role, full_name, phone_number, location, preferred_language)
VALUES 
  ('admin', 'admin@smartfarmer.com', '$2b$10$YourHashedPasswordHere', 'admin', 'Smart Farmer Admin', '+1234567890', 'Global', 'en')
ON CONFLICT (username) DO NOTHING;

-- Get the admin user_id
DO $$
DECLARE
  admin_id INT;
BEGIN
  SELECT user_id INTO admin_id FROM users WHERE username = 'admin' LIMIT 1;

  -- Insert comprehensive advisory content with images
  
  -- Disease Management Content
  INSERT INTO advisory_content (title, content_type, content, crop_type, disease_name, severity_level, image_url, created_by, is_active) VALUES
  (
    'Early Blight Prevention in Tomatoes',
    'disease',
    'Early blight is a common fungal disease affecting tomatoes. Key prevention strategies include:

1. **Crop Rotation**: Rotate tomatoes with non-solanaceous crops every 2-3 years
2. **Proper Spacing**: Ensure adequate air circulation between plants (18-24 inches apart)
3. **Mulching**: Apply organic mulch to prevent soil splash onto lower leaves
4. **Watering Practices**: Water at the base of plants in the morning to minimize leaf wetness
5. **Sanitation**: Remove and destroy infected plant debris immediately
6. **Resistant Varieties**: Choose varieties with genetic resistance when available

**Early Detection Signs:**
- Dark brown spots with concentric rings on older leaves
- Yellowing around the spots
- Premature leaf drop starting from the bottom of the plant

**Organic Treatment Options:**
- Copper-based fungicides
- Neem oil spray (apply weekly during humid periods)
- Baking soda solution (1 tablespoon per gallon of water)

**Chemical Control (if necessary):**
Use chlorothalonil or mancozeb-based products following label instructions. Apply at first sign of disease and repeat every 7-10 days during wet weather.',
    'Tomato',
    'Early Blight',
    'high',
    'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80',
    admin_id,
    true
  ),
  (
    'Powdery Mildew Control in Cucurbits',
    'disease',
    'Powdery mildew is one of the most common diseases affecting cucumbers, melons, squash, and pumpkins.

**Identification:**
- White, powdery fungal growth on leaves
- Starts on older leaves and spreads upward
- Leaves may yellow and die prematurely
- Can reduce fruit quality and yield

**Cultural Control Methods:**
1. **Variety Selection**: Plant resistant varieties when available
2. **Site Selection**: Choose locations with good air circulation and full sun
3. **Spacing**: Provide adequate spacing between plants
4. **Irrigation**: Use drip irrigation; avoid overhead watering
5. **Pruning**: Remove infected leaves immediately

**Organic Treatments:**
- **Milk Spray**: Mix 1 part milk with 9 parts water, spray weekly
- **Potassium Bicarbonate**: More effective than baking soda
- **Sulfur Dust**: Apply when temperatures are below 90°F
- **Neem Oil**: Apply early morning or late evening

**Prevention Schedule:**
- Week 1-2: Ensure proper spacing and airflow
- Week 3-4: Begin preventive sprays if conditions are favorable for disease
- Throughout season: Monitor daily, especially undersides of leaves
- After harvest: Clean up all plant debris

**Environmental Factors:**
Powdery mildew thrives in 60-80°F with high humidity but low leaf wetness.',
    'Cucumber',
    'Powdery Mildew',
    'medium',
    'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&q=80',
    admin_id,
    true
  ),
  (
    'Late Blight in Potatoes: Recognition and Management',
    'disease',
    'Late blight is the most destructive disease of potatoes and can cause total crop loss within 2 weeks under favorable conditions.

**Historical Context:**
This is the same disease that caused the Irish Potato Famine in the 1840s.

**Symptoms:**
- Water-soaked spots on leaves that quickly turn brown/black
- White fungal growth on undersides of leaves in humid conditions
- Brown lesions on stems
- Firm brown rot in tubers with reddish-brown discoloration

**Weather Conditions Favoring Disease:**
- Temperature: 50-70°F (10-21°C)
- High humidity (>90%) or frequent rain
- Overcast conditions
- Disease can spread rapidly during "blight weather"

**Management Strategies:**

**1. Cultural Practices:**
- Use certified disease-free seed potatoes
- Hill soil around plants to protect developing tubers
- Destroy volunteer potatoes and infected tomatoes nearby
- Avoid overhead irrigation
- Harvest on dry days when vines are completely dead

**2. Resistant Varieties:**
- Defender
- Jacqueline Lee
- King Edward
- Sarpo Mira (highly resistant)

**3. Fungicide Program:**
Start protective fungicide applications before disease appears:
- Chlorothalonil (Bravo, Daconil)
- Mancozeb (Manzate, Dithane)
- Copper-based products (organic option)

Apply every 5-7 days during favorable disease conditions.

**4. Emergency Measures:**
If late blight appears:
- Remove and destroy all infected plants immediately
- Do not compost infected material
- Increase fungicide frequency to every 5 days
- Kill vines 2 weeks before harvest to prevent tuber infection

**Storage:**
Cure potatoes at 50-60°F for 2 weeks before cold storage. Inspect regularly for signs of rot.',
    'Potato',
    'Late Blight',
    'critical',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
    admin_id,
    true
  );

  -- Pest Management Content
  INSERT INTO advisory_content (title, content_type, content, crop_type, disease_name, severity_level, image_url, created_by, is_active) VALUES
  (
    'Integrated Pest Management for Aphids',
    'pest',
    'Aphids are small, soft-bodied insects that suck plant sap and can transmit viral diseases.

**Identification:**
- 1-3mm long, pear-shaped bodies
- Colors: green, black, brown, yellow, or pink
- Usually found in clusters on new growth and undersides of leaves
- Produce honeydew (sticky substance) that attracts ants

**Damage Symptoms:**
- Curled, distorted leaves
- Stunted plant growth
- Sticky honeydew on leaves and stems
- Sooty mold growth (black fungus on honeydew)
- Reduced fruit/flower production

**Natural Control Methods:**

**1. Beneficial Insects:**
- Ladybugs (release 1,500-2,000 per acre)
- Lacewings
- Parasitic wasps
- Hover fly larvae

**2. Companion Planting:**
- Nasturtiums (trap crop)
- Garlic and onions (repellent)
- Marigolds (attract beneficials)
- Catnip and mint (repellent)

**3. Physical Control:**
- Strong water spray to knock aphids off plants
- Yellow sticky traps
- Row covers for young transplants
- Reflective mulches (aluminum foil)

**4. Organic Sprays:**
- **Insecticidal Soap**: Spray directly on aphids, repeat every 2-3 days
- **Neem Oil**: 2 tablespoons per gallon of water
- **Garlic Spray**: Blend 2 bulbs with 1 quart water, strain, add 1 tsp dish soap
- **Pepper Spray**: Hot pepper tea with soap

**5. Oil Spray Recipe:**
Mix:
- 1 cup vegetable oil
- 2 tablespoons liquid soap
Add 2 teaspoons to 1 cup water, spray plants thoroughly

**Prevention:**
- Inspect new plants before introducing to garden
- Control ants (they farm aphids for honeydew)
- Avoid excess nitrogen fertilization
- Maintain plant health through proper watering and fertilization

**When to Use Chemical Control:**
- Heavy infestation (>50 aphids per leaf)
- Critical growth stage of crop
- Disease transmission risk is high

**Recommended Products:**
- Pyrethrins (organic, fast-acting)
- Imidacloprid (systemic, long-lasting)
- Insecticidal soap (OMRI listed)',
    'Multiple Crops',
    'Aphid Infestation',
    'medium',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    admin_id,
    true
  ),
  (
    'Organic Control of Tomato Hornworms',
    'pest',
    'Tomato hornworms are large caterpillars that can defoliate tomato plants rapidly.

**Identification:**
- Large green caterpillars (3-4 inches long)
- White V-shaped marks on sides
- Horn-like projection on rear end
- Excellent camouflage, difficult to spot

**Life Cycle:**
- Adults are sphinx/hawk moths
- Moths lay eggs on tomato leaves
- Caterpillars hatch in 6-8 days
- Feed for 3-4 weeks before pupating
- Pupate in soil for 2-3 weeks
- 1-2 generations per year

**Signs of Infestation:**
- Large sections of leaves eaten
- Dark green/black droppings on leaves
- Stems stripped of foliage
- Green fruit with large holes

**Organic Control Methods:**

**1. Handpicking:**
- Inspect plants daily in early morning or evening
- Look for droppings, then search upward for caterpillar
- Wear gloves and drop into soapy water
- Check both sides of leaves

**2. Beneficial Insects:**
- **Braconid Wasps**: 
  * Lay eggs inside hornworm
  * White cocoons appear on hornworm body
  * DO NOT KILL hornworms with cocoons - let wasps complete cycle
- Parasitic flies
- Ground beetles

**3. Biological Control:**
- **Bt (Bacillus thuringiensis)**: 
  * Apply when caterpillars are small
  * Spray in evening (UV-sensitive)
  * Reapply after rain
  * Harmless to humans, pets, beneficial insects
- Spinosad (organic insecticide)

**4. Preventive Measures:**
- Till soil in fall to destroy pupae
- Use row covers until plants flower
- Interplant with marigolds, borage
- Attract birds to garden (they eat hornworms)

**5. Trap Crops:**
- Plant dill around tomatoes
- Moths prefer to lay eggs on dill

**Plant Companions That Help:**
- Basil
- Marigolds
- Borage
- Nasturtiums

**Chemical Control (Last Resort):**
- Permethrin
- Carbaryl (Sevin)

**Important Note:**
If you find hornworms covered with white cocoons (braconid wasp eggs), DO NOT DESTROY them. These parasitized hornworms will produce beneficial wasps that will control future hornworm populations.',
    'Tomato',
    'Hornworm',
    'high',
    'https://images.unsplash.com/photo-1597150509830-cc4bf0e44d67?w=800&q=80',
    admin_id,
    true
  );

  -- Soil Management Content
  INSERT INTO advisory_content (title, content_type, content, crop_type, image_url, created_by, is_active) VALUES
  (
    'Building Healthy Soil: The Foundation of Productive Farming',
    'soil_management',
    'Healthy soil is the foundation of successful farming. Understanding and improving your soil will dramatically increase yields and plant health.

**What is Healthy Soil?**

Healthy soil contains:
- 45% minerals (sand, silt, clay)
- 25% air
- 25% water
- 5% organic matter (the key to fertility!)

**Components of Soil Health:**

**1. Soil Structure:**
- Aggregation of soil particles
- Pore spaces for air and water
- Root penetration ability

**2. Soil Biology:**
- Bacteria (billions per teaspoon)
- Fungi and mycorrhizae
- Earthworms (nature''s tillers)
- Nematodes and protozoa

**3. Organic Matter:**
- Partially decomposed plant and animal material
- Provides nutrients through decomposition
- Improves water retention
- Feeds soil organisms

**4. pH Balance:**
- Most vegetables: 6.0-7.0
- Blueberries: 4.5-5.5
- Brassicas: 6.5-7.5

**How to Improve Your Soil:**

**Step 1: Soil Testing**
Get a professional soil test every 2-3 years:
- NPK levels (Nitrogen, Phosphorus, Potassium)
- pH
- Organic matter content
- Micronutrients
- Texture analysis

**Step 2: Add Organic Matter**

**Compost:**
- Apply 1-2 inches annually
- Well-aged (6-12 months)
- Mix of "browns" (carbon) and "greens" (nitrogen)

**Cover Crops:**
- Winter rye, hairy vetch, crimson clover
- Plant in fall, till in spring
- Adds nitrogen, prevents erosion
- Breaks up compaction

**Animal Manures:**
- Chicken: High nitrogen, composted 6+ months
- Cow: Balanced, composted 3+ months
- Horse: High carbon, composted 6+ months
- Application: 20-40 lbs per 100 sq ft

**Step 3: Minimize Tillage**
- Till only when necessary
- No-till methods preserve soil structure
- Use broadfork instead of rototiller
- Mulch to suppress weeds

**Step 4: Crop Rotation**
- Prevents disease buildup
- Balances nutrient use
- Sample 4-year rotation:
  * Year 1: Tomatoes, peppers, eggplant
  * Year 2: Beans, peas
  * Year 3: Brassicas, root vegetables
  * Year 4: Squash, cucumbers

**Step 5: Mulching**
- Organic mulches: straw, wood chips, leaves
- 2-4 inches deep
- Keeps soil cool and moist
- Prevents erosion
- Adds organic matter as it decomposes

**Natural Soil Amendments:**

**For Nitrogen:**
- Blood meal
- Alfalfa meal
- Fish emulsion
- Composted manure

**For Phosphorus:**
- Bone meal
- Rock phosphate
- Compost

**For Potassium:**
- Kelp meal
- Greensand
- Wood ash (also raises pH)

**For Calcium:**
- Lime (raises pH)
- Gypsum (neutral pH)
- Crushed eggshells

**Soil pH Adjustment:**

**To Raise pH (make more alkaline):**
- Lime: 5 lbs per 100 sq ft raises pH by 1 point
- Wood ash: 1-2 lbs per 100 sq ft

**To Lower pH (make more acidic):**
- Sulfur: 1-2 lbs per 100 sq ft lowers pH by 1 point
- Peat moss
- Pine needles

**Signs of Good Soil Health:**
- Earthworm presence (5-10 per shovel)
- Pleasant earthy smell
- Friable texture (crumbles easily)
- Good drainage but moisture retention
- Vigorous plant growth
- Few disease problems

**Long-Term Strategy:**
Building soil health takes 3-5 years. Focus on:
- Annual compost additions
- Rotating cover crops
- Reducing tillage
- Maintaining mulch
- Periodic soil testing

Remember: "Feed the soil, not the plant" - healthy soil creates healthy plants.',
    'All Crops',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    admin_id,
    true
  );

  -- Water Management Content
  INSERT INTO advisory_content (title, content_type, content, crop_type, image_url, created_by, is_active) VALUES
  (
    'Water-Efficient Irrigation Techniques for Maximum Yield',
    'water_management',
    'Efficient irrigation saves water, reduces costs, and can increase crop yields. Here''s how to optimize your watering strategy.

**Understanding Plant Water Needs:**

**Critical Growth Stages:**
Different crops have specific stages when water is most critical:
- **Tomatoes**: Flowering and fruit development
- **Corn**: Tasseling and ear development
- **Beans**: Flowering and pod fill
- **Lettuce**: All stages (shallow roots)

**Signs of Water Stress:**
- Wilting during heat of day
- Leaf rolling or cupping
- Slow growth
- Premature flowering
- Blossom end rot (tomatoes, peppers)
- Bitter flavor in lettuce

**Irrigation Methods Compared:**

**1. Drip Irrigation** ⭐ MOST EFFICIENT
**Efficiency**: 90-95%

**Advantages:**
- Delivers water directly to root zone
- Minimal evaporation
- Reduces weed growth
- Keeps foliage dry (reduces disease)
- Easy to automate with timers
- Works on slopes and irregular terrain

**Setup:**
- Main line: 1/2" to 3/4" tubing
- Drip tape or emitter tubing: 1/4" to 1/2"
- Emitter spacing: 12-18" for vegetables
- Flow rate: 0.5-1 gallon per hour per emitter

**Cost**: $300-500 per 1000 sq ft
**Best For**: Row crops, raised beds, permanent plantings

**2. Soaker Hoses**
**Efficiency**: 80-85%

**Advantages:**
- Porous hoses weep water along entire length
- Cheaper than drip systems
- Easy to install
- Good for dense plantings

**Disadvantages:**
- Less precise than drip
- Can clog from minerals
- Shorter lifespan (2-5 years)

**Setup:**
- Lay hoses 12-18" apart
- Cover with mulch
- Run time: 30-120 minutes per session

**Cost**: $50-100 per 1000 sq ft
**Best For**: Dense plantings, perennial beds

**3. Overhead Sprinklers**
**Efficiency**: 60-75%

**Types:**
- Oscillating
- Impact/rotor
- Stationary

**Disadvantages:**
- High evaporation losses
- Wets foliage (increases disease)
- Uneven coverage
- Wind affects distribution

**Best Practices:**
- Water early morning (4-8 AM)
- Avoid evening watering
- Use low-angle sprinklers
- Apply 1" per week

**Cost**: $20-200
**Best For**: Lawns, large areas, temporary irrigation

**4. Subsurface Drip Irrigation**
**Efficiency**: 95%+

**Advantages:**
- Lines buried 4-12" deep
- Zero surface evaporation
- Clean walkways
- Long-lasting (15-20 years)

**Disadvantages:**
- Expensive installation
- Hard to check for problems
- Root intrusion possible

**Cost**: $1,000-2,000 per 1000 sq ft
**Best For**: Permanent orchards, large vegetable operations

**Water Management Strategies:**

**1. Mulching** 💧 CRITICAL
- 2-4 inches of organic mulch
- Reduces evaporation by 70%
- Keeps soil cool
- Suppresses weeds (which compete for water)

**Best Mulches:**
- Straw: Excellent, decomposes slowly
- Wood chips: Long-lasting, good for paths
- Grass clippings: Free, adds nitrogen
- Shredded leaves: Free, improves soil

**2. Soil Improvement**
Adding compost improves water retention:
- Sandy soil: Holds water better
- Clay soil: Drains better
- 1% organic matter increase = 16,500 gallons more water per acre

**3. Timing Your Irrigation**

**Best Times:**
- **Early Morning (4-8 AM)**: 
  * Ideal - low wind, cooler temps
  * Foliage dries quickly
  * Less disease pressure
  
- **Evening**: 
  * OK if using drip
  * Avoid overhead irrigation (foliage stays wet)

**Worst Time:**
- **Midday**: 
  * High evaporation
  * Water droplets can burn leaves
  * Wasteful

**4. Deep vs Frequent Watering**

**Deep Watering** ✓ RECOMMENDED
- 1-2 times per week
- Soak to 6-8" deep
- Encourages deep roots
- Plants more drought-tolerant
- Less disease pressure

**Frequent Shallow Watering** ✗ AVOID
- Daily or multiple times per day
- Only wets top 1-2"
- Encourages shallow roots
- Plants less drought-tolerant
- Higher disease risk

**5. Measuring Water Application**

**The Tuna Can Test:**
- Place empty tuna cans around garden
- Run irrigation for 30 minutes
- Measure water depth in cans
- Calculate time needed for 1" of water

**Soil Moisture Test:**
- Dig down 6" with trowel
- Squeeze soil in hand:
  * Sand: Forms weak ball = moist
  * Loam: Forms ball, doesn''t stick = moist
  * Clay: Forms ball, slightly sticky = moist

**6. Smart Irrigation Controllers**

**Modern Options:**
- **Weather-based**: Adjust based on rainfall, temperature
- **Soil moisture sensors**: Measure actual soil water
- **Wi-Fi enabled**: Control from phone

**ROI**: Pay for themselves in 2-3 years through water savings

**Water-Saving Techniques:**

**Rainwater Harvesting:**
- 1,000 sq ft roof = 600 gallons per 1" rain
- Use rain barrels (55 gallon drums)
- Simple setup: gutter → filter → barrel → drip system

**Ollas (Clay Pot Irrigation):**
- Buried unglazed clay pots
- Fill with water
- Water seeps through walls to roots
- Lasts 3-7 days between fills
- Ancient technique, very effective

**Wicking Beds:**
- Self-watering raised beds
- Reservoir below soil
- Water wicks up through soil
- Water every 7-14 days

**Crop-Specific Water Needs:**

**High Water Needs (1.5-2" per week):**
- Tomatoes, peppers, eggplant
- Cucumbers, squash, melons
- Lettuce, spinach, celery

**Moderate Water Needs (1-1.5" per week):**
- Beans, peas
- Broccoli, cabbage, cauliflower
- Carrots, beets, turnips

**Low Water Needs (0.5-1" per week):**
- Onions, garlic
- Herbs (rosemary, thyme, oregano)
- Sweet potatoes (once established)

**Common Mistakes to Avoid:**
1. Watering on schedule instead of soil moisture
2. Overhead watering in evening
3. Short, frequent watering
4. Ignoring rainfall
5. No mulch
6. Poor soil preparation
7. Not grouping plants by water needs

**Emergency Drought Strategies:**
- Prioritize fruiting crops
- Add extra mulch (4-6")
- Use shade cloth during heat
- Remove flowers to reduce stress
- Harvest mature crops early
- Let some crops bolt
- Apply clay-based wilt-protectants

**Long-Term Water Conservation:**
- Install drip irrigation
- Add organic matter annually
- Use dense mulches
- Plant drought-tolerant varieties
- Design water-wise garden layout
- Capture and store rainwater
- Consider subsurface irrigation

Efficient irrigation is an investment that pays dividends in water savings, plant health, and increased yields.',
    'All Crops',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
    admin_id,
    true
  );

  -- Crop Planning Content
  INSERT INTO advisory_content (title, content_type, content, crop_type, image_url, created_by, is_active) VALUES
  (
    'Seasonal Crop Planning for Year-Round Production',
    'crop_planning',
    'Strategic crop planning ensures continuous harvests, optimizes space, and maximizes profits throughout the year.

**Planning Principles:**

**1. Know Your Climate Zone**
- USDA Hardiness Zone (cold hardiness)
- First and last frost dates
- Growing season length
- Heat zones
- Rainfall patterns

**2. Succession Planting**
Plant same crop every 2-3 weeks for continuous harvest:
- **Lettuce**: Every 2 weeks
- **Radishes**: Every 10 days
- **Beans**: Every 3 weeks
- **Carrots**: Every 3 weeks
- **Corn**: Every 2 weeks

**3. Companion Planting Benefits**
- Pest control
- Disease prevention
- Space optimization
- Nutrient sharing
- Support structures

**Seasonal Planting Guide:**

## SPRING (March - May)

**Early Spring (6-8 weeks before last frost):**

**Cool-Season Crops:**
- Peas (direct seed as soon as soil workable)
- Lettuce, spinach, arugula
- Radishes, turnips
- Onion sets
- Brassicas (start indoors): cabbage, broccoli, cauliflower
- Potatoes (plant 4 weeks before last frost)

**Soil Prep:**
- Add compost (1-2" layer)
- Test and adjust pH
- Create raised beds for earlier planting
- Use row covers for frost protection

**Mid-Spring (2-4 weeks before last frost):**
- Beets, carrots
- Swiss chard
- More lettuce succession
- Parsnips
- Transplant brassicas

**Late Spring (after last frost):**

**Warm-Season Crops:**
- Tomatoes, peppers, eggplant (transplant)
- Beans, corn (direct seed)
- Squash, cucumbers, melons
- Basil, cilantro
- Sweet potatoes (slips)

**Timing Tips:**
- Wait for soil temp 60°F+ for warm crops
- Use black plastic mulch to warm soil
- Harden off transplants for 7-10 days

## SUMMER (June - August)

**Early Summer:**
- **Succession plantings**: beans, corn, cucumbers
- **Heat-lovers**: okra, sweet potatoes, southern peas
- **Herbs**: basil, oregano, thyme

**Mid-Summer (June-July):**
**Planning Fall Garden:**
- Count back from first fall frost date
- Order seeds for fall crops
- Prepare beds in shaded area
- Start brassicas indoors in July

**Late Summer (August):**
**Plant Fall Crops:**
- Lettuce, spinach, arugula
- Radishes, turnips, beets
- Carrots (for winter storage)
- Broccoli, cabbage, cauliflower (transplants)
- Peas (where fall season allows)
- Kale, collards

**Summer Maintenance:**
- Deep watering (1-2" per week)
- Heavy mulching (4" layer)
- Stake and prune tomatoes
- Harvest regularly to encourage production
- Monitor for pests/diseases

## FALL (September - November)

**Early Fall:**
- Harvest summer crops
- Remove spent plants
- Add compost to cleared beds
- Plant garlic (6 weeks before hard freeze)
- Continue harvesting fall crops

**Mid-Fall:**
- Harvest before frost: tomatoes, peppers, eggplant, basil
- Protect tender fall greens with row covers
- Dig and cure sweet potatoes (before frost)
- Start cleaning up garden

**Late Fall:**
- Final harvest: hard squash, pumpkins
- Dig carrots, beets for storage
- Cut down spent plants
- Add fall leaves as mulch
- Plant cover crops
- Protect perennials

**Fall Tasks:**
- Soil testing
- Lime application (if needed)
- Compost pile management
- Tool cleaning and maintenance
- Seed inventory and ordering

## WINTER (December - February)

**Winter Activities:**

**Planning:**
- Review garden journal
- Plan crop rotations
- Order seeds (order early!)
- Design garden layout
- Calculate planting dates
- Budget for season

**Indoor Starting (6-8 weeks before spring planting):**
- Tomatoes, peppers, eggplant
- Broccoli, cabbage, cauliflower
- Onions, leeks
- Herbs

**Outdoor (in mild climates):**
- Garlic growing
- Overwintered kale, collards
- Cold frames/hoop houses: lettuce, spinach
- Harvest parsnips (frost improves flavor)

**Winter Protection:**
- Heavy mulch on garlic
- Cold frames for greens
- Hoop houses extend season
- Row covers add 3-5°F protection

**Crop Rotation Plan:**

**4-Year Rotation System:**

**Plot 1:**
- Year 1: Tomato family (Solanaceae)
- Year 2: Legumes (beans, peas)
- Year 3: Cabbage family (Brassicaceae)
- Year 4: Root vegetables, cucurbits

**Plot 2:**
- Year 1: Legumes
- Year 2: Cabbage family
- Year 3: Root vegetables, cucurbits
- Year 4: Tomato family

**Plot 3:**
- Year 1: Cabbage family
- Year 2: Root vegetables, cucurbits
- Year 3: Tomato family
- Year 4: Legumes

**Plot 4:**
- Year 1: Root vegetables, cucurbits
- Year 2: Tomato family
- Year 3: Legumes
- Year 4: Cabbage family

**Benefits:**
- Prevents disease buildup
- Balances soil nutrients
- Reduces pest problems
- Improves soil structure

**Succession Planting Calendar:**

**Example for Lettuce (60-day season):**
- Week 1: Plant first crop
- Week 3: Plant second crop
- Week 5: Plant third crop
- Week 7: Plant fourth crop
- Week 9: Harvest first, plant fifth crop
- Continue pattern for continuous harvest

**Space-Saving Techniques:**

**Vertical Growing:**
- Trellises: cucumbers, peas, beans, tomatoes
- Cages: tomatoes, peppers
- Teepees: pole beans, peas
- Wall planters: herbs, strawberries

**Interplanting:**
- Fast crops between slow: radishes with carrots
- Tall with short: corn with lettuce
- Shade-lovers under tall: lettuce under tomatoes

**Catch Crops:**
- Quick-growing crops in temporary space
- Radishes (25 days)
- Baby lettuce (30 days)
- Spinach (40 days)

**Record Keeping:**

**Essential Information:**
- Planting dates
- Varieties planted
- Germination rates
- Days to harvest
- Yield per plant
- Disease/pest problems
- Weather notes
- Successes and failures

**Tools:**
- Garden journal
- Smartphone apps
- Spreadsheets
- Photos with dates

**Planning Tools:**

**Seed Starting Calculator:**
1. Find last frost date
2. Count back weeks needed indoors
3. Add succession plantings
4. Mark on calendar

**Example (Tomatoes):**
- Last frost: May 15
- Start indoors: 6-8 weeks before
- Indoor date: March 15-30
- Succession: None (long harvest period)

**Planting Calendar Tips:**

**Use Growing Degree Days (GDD):**
More accurate than calendar dates
- GDD = (Max temp + Min temp) / 2 - Base temp
- Base temp varies by crop
- Sum GDD to predict harvest

**Moon Planting (Traditional):**
- Plant above-ground crops during waxing moon
- Plant root crops during waning moon
- Based on gravitational effects on water

**Common Planning Mistakes:**

1. **Planting Too Much at Once:**
   - Use succession planting
   - Spread over 4-6 weeks

2. **Ignoring Frost Dates:**
   - Know your dates
   - Use frost cloth for protection
   - Have backup plans

3. **Poor Spacing:**
   - Follow seed packet instructions
   - Crowding causes disease
   - Reduces yields

4. **Not Rotating Crops:**
   - Essential for disease prevention
   - Balances soil nutrients
   - Reduces pest pressure

5. **Forgetting About Fall Garden:**
   - Plan in summer
   - Start transplants indoors
   - Prepare beds early

**Year-Round Production Tips:**

**Season Extension Methods:**
- Cold frames: Add 4-6 weeks spring/fall
- Row covers: Protect from frost (3-5°F)
- Hoop houses: Extend season 8-12 weeks
- Greenhouses: Year-round in many climates

**Cold-Hardy Crops:**
- Kale (to 10°F)
- Spinach (to 15°F)
- Mache (to 5°F)
- Claytonia (to 10°F)
- Carrots in mulch (to 20°F)

**Profit Optimization:**

**High-Value Crops:**
- Specialty lettuce ($8-12/lb)
- Heirloom tomatoes ($4-6/lb)
- Herbs ($16-20/lb)
- Baby vegetables (premium prices)
- Out-of-season produce

**Low-Input, High-Yield:**
- Zucchini
- Kale
- Cherry tomatoes
- Herbs
- Lettuce

**Market Timing:**
- Early season: Premium prices
- Peak season: Lower prices
- Late season: Premium prices

**Resources for Planning:**
- Local extension office
- Weather station data
- Online planning tools
- Garden forums and groups
- Seed catalogs (free!)

**Final Planning Checklist:**

□ Know first/last frost dates
□ Choose crop varieties
□ Calculate planting dates
□ Order seeds early
□ Plan crop rotations
□ Schedule succession plantings
□ Prepare soil amendments
□ Arrange irrigation system
□ Identify companion plants
□ Set up recordkeeping system
□ Plan season extension methods
□ Budget for inputs
□ Arrange storage for harvest
□ Plan pest/disease management
□ Schedule time for garden tasks

A well-planned garden provides fresh produce from early spring through late fall, and in many climates, year-round!',
    'All Crops',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
    admin_id,
    true
  );

  -- Additional practical content
  INSERT INTO advisory_content (title, content_type, content, crop_type, disease_name, severity_level, image_url, created_by, is_active) VALUES
  (
    'Identifying and Treating Bacterial Wilt in Cucumbers',
    'disease',
    'Bacterial wilt is a devastating disease of cucumbers, squash, melons, and pumpkins, transmitted by cucumber beetles.

**Causal Agent:** Erwinia tracheiphila bacteria

**Symptoms:**
- Sudden wilting of individual leaves or entire vine
- Wilting most obvious during heat of day
- Initially wilting is temporary (recovers overnight)
- Eventually permanent wilting and death
- No recovery possible once infected

**Diagnostic Test:**
Cut a wilted stem and squeeze. If milky, sticky sap oozes out slowly, bacterial wilt is present.

**Transmission:**
- Cucumber beetles (spotted and striped)
- Beetles feed on plants, transmit bacteria
- Bacteria multiply in vascular system
- Plug water-conducting vessels

**Management Strategy:**

**1. Beetle Control (CRITICAL):**
Must control beetles to prevent disease

**Early Season:**
- Apply row covers immediately after planting
- Remove covers when flowering begins (need pollination)
- Check under covers daily for beetles

**Organic Options:**
- Neem oil spray
- Spinosad
- Pyrethrins
- Beneficial nematodes (soil-dwelling beetle larvae)

**Conventional Options:**
- Carbaryl
- Permethrin
- Apply at first sign of beetles

**2. Resistant Varieties:**
- County Fair (cucumber)
- Saladin (cucumber)
- Big Beef (squash)
- Sweet Slice (cucumber)

**3. Cultural Practices:**
- Remove infected plants immediately
- Don''t compost infected plants
- Clean tools with 10% bleach solution
- Plant later in season (fewer beetles)
- Use trap crops (Blue Hubbard squash)

**4. Companion Planting:**
**Beetle Repellents:**
- Radishes
- Tansy
- Marigolds
- Nasturtiums

**5. Prevention:**
- Clean up garden debris in fall
- Rotate to non-cucurbit crops for 2 years
- Remove wild cucurbits nearby
- Use mulch to reduce beetle emergence

**Prognosis:**
No cure once infected. Prevention through beetle control is essential.

**Yield Impact:**
Can cause 100% crop loss if beetles aren''t controlled early.',
    'Cucumber',
    'Bacterial Wilt',
    'critical',
    'https://images.unsplash.com/photo-1568584711133-c9db2ac2c2a5?w=800&q=80',
    admin_id,
    true
  ),
  (
    'Managing Blossom End Rot in Tomatoes and Peppers',
    'prevention',
    'Blossom end rot is a physiological disorder, NOT a disease. It''s caused by calcium deficiency in developing fruit.

**Symptoms:**
- Brown to black leathery spot on blossom end of fruit
- Appears when fruit is 1/3 to 1/2 grown
- Can affect tomatoes, peppers, squash, melons
- Spot may rot, inviting secondary infections

**Causes:**

**1. Calcium Deficiency in Fruit**
Not usually due to lack of calcium in soil, but due to:
- Inconsistent watering
- Root damage
- Excessive nitrogen
- Soil too acidic or alkaline
- High salt levels

**2. Irregular Watering (Main Cause)**
- Drought followed by heavy watering
- Disrupts calcium transport to fruit

**Prevention Strategies:**

**1. Consistent Watering ⭐ MOST IMPORTANT**
- Deep watering 1-2 times per week
- 1-2 inches of water per week
- Mulch heavily (4" layer)
- Drip irrigation or soaker hoses
- Avoid frequent shallow watering

**2. Calcium Application**
**Foliar Spray:**
- Calcium chloride solution
- Spray every 7-10 days
- Apply to foliage and developing fruit

**Soil Application:**
- Lime (if pH is low)
- Gypsum (calcium sulfate - pH neutral)
- Crushed eggshells (slow-release)
- Bone meal

**Application Rates:**
- Gypsum: 2-3 lbs per 100 sq ft
- Lime: Based on soil test
- Don''t over-apply (can cause other problems)

**3. Soil pH Management**
- Test soil pH annually
- Optimal pH: 6.2-6.8 for tomatoes
- Adjust pH in fall/winter

**4. Balanced Fertilization**
**Avoid:**
- Excessive nitrogen (promotes leaf growth over fruit)
- High ammonium-nitrogen fertilizers

**Use:**
- Balanced fertilizers (10-10-10)
- Calcium nitrate (provides both calcium and nitrogen)
- Slow-release fertilizers

**5. Mulching**
Benefits:
- Maintains even soil moisture
- Moderates soil temperature
- Protects shallow feeder roots
- Reduces evaporation

**Materials:**
- Straw (4" layer)
- Grass clippings (2-3" layer)
- Shredded leaves (3-4" layer)

**6. Root Protection**
- Avoid cultivating near plants
- Don''t damage roots when weeding
- Plant in well-draining soil
- Avoid working soil when too wet

**Treatment of Affected Plants:**

**Immediate Actions:**
1. Remove affected fruit (won''t recover)
2. Ensure consistent watering schedule
3. Apply calcium foliar spray
4. Add mulch if not present
5. Check soil moisture before watering

**Long-term Solutions:**
- Improve soil structure with compost
- Install drip irrigation
- Soil test before next season
- Amend soil based on test results

**Resistant Varieties:**
Some varieties are less susceptible:
- Mountain Fresh Plus
- Mountain Spring
- Jet Star
- Celebrity
- Big Beef

**Common Mistakes:**

1. **Overcompensating with Calcium:**
   - More is not better
   - Follow soil test recommendations
   - Excess calcium can tie up other nutrients

2. **Inconsistent Watering:**
   - Set up automatic system if possible
   - Check soil moisture before watering
   - Maintain 1-2" mulch layer

3. **Over-Fertilizing:**
   - Too much nitrogen makes problem worse
   - Use balanced, slow-release fertilizers
   - Follow package directions

4. **Ignoring Soil pH:**
   - pH affects all nutrient availability
   - Test every 1-2 years
   - Adjust based on results

**Environmental Factors:**

**More Common When:**
- Hot, dry weather
- Sandy, fast-draining soil
- Cool, wet spring followed by hot, dry summer
- High-nitrogen fertilization
- Rapid fruit development

**Less Common When:**
- Consistent rainfall
- Heavy clay soils (better water retention)
- Drip irrigation used
- Adequate mulching
- Proper calcium levels

**Monitoring:**
Check plants 2-3 times per week during fruit development:
- Inspect developing fruit
- Check soil moisture
- Look for water stress symptoms
- Adjust watering as needed

**Key Takeaway:**
Blossom end rot is 100% preventable through:
1. Consistent, deep watering
2. Heavy mulching
3. Adequate calcium
4. Proper pH
5. Balanced fertilization

It''s NOT a disease and requires no chemical treatment!',
    'Tomato',
    'Blossom End Rot',
    'medium',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
    admin_id,
    true
  ),
  (
    'Composting Guide: From Kitchen Scraps to Black Gold',
    'soil_management',
    'Learn how to create nutrient-rich compost that will transform your garden soil and reduce waste.

**What is Compost?**
Decomposed organic matter that improves soil structure, provides nutrients, and feeds beneficial soil organisms.

**Benefits of Composting:**
- Enriches soil with nutrients
- Improves soil structure and drainage
- Increases water retention
- Feeds beneficial microbes
- Reduces need for chemical fertilizers
- Recycles kitchen and garden waste
- Reduces landfill waste
- Saves money on soil amendments

**Basic Composting Requirements:**

**1. Carbon (Browns):** 60-70%
- Dry leaves
- Straw and hay
- Sawdust (untreated wood)
- Shredded paper/cardboard
- Corn stalks
- Pine needles

**2. Nitrogen (Greens):** 30-40%
- Fresh grass clippings
- Kitchen vegetable scraps
- Coffee grounds
- Fresh manure (cow, horse, chicken)
- Green leaves
- Garden trimmings

**3. Air (Oxygen):**
- Turn pile regularly
- Layer materials properly
- Don''t compact

**4. Water (Moisture):**
- Keep as moist as wrung-out sponge
- Not too wet or dry
- Cover in rainy climates

**5. Surface Area:**
- Chop/shred materials
- Smaller pieces = faster composting
- 1-2 inch pieces ideal

**Composting Methods:**

**Method 1: Hot Composting** ⭐ FASTEST
**Timeline:** 4-8 weeks

**Steps:**
1. **Build Pile:**
   - Minimum 3ft x 3ft x 3ft (1 cubic yard)
   - Larger heats better
   - Mix browns and greens in layers

2. **Monitor Temperature:**
   - Goal: 130-160°F
   - Use compost thermometer
   - Peak heat at 3-5 days

3. **Turn Regularly:**
   - Turn every 3-5 days
   - Moves cool outer material to hot center
   - Adds oxygen
   - Maintains heat

4. **Check Moisture:**
   - Squeeze test (should feel like wrung sponge)
   - Add water if too dry
   - Add browns if too wet

5. **Ready When:**
   - Dark brown color
   - Earthy smell
   - Crumbly texture
   - Original materials unrecognizable

**Advantages:**
- Fastest method
- Kills weed seeds and pathogens
- Produces highest quality compost

**Disadvantages:**
- Requires effort (turning)
- Needs large volume
- Requires attention

**Method 2: Cold Composting**
**Timeline:** 6-12 months

**Steps:**
1. Add materials as available
2. Mix occasionally (monthly)
3. Water when dry
4. Wait for decomposition

**Advantages:**
- Easy, low maintenance
- No size requirement
- Continuous addition possible

**Disadvantages:**
- Slow process
- Doesn''t kill weed seeds
- May attract pests

**Method 3: Vermicomposting (Worm Bins)**
**Timeline:** 2-3 months

**Setup:**
- Container with drainage
- Bedding (shredded paper/cardboard)
- Red wiggler worms
- Kitchen scraps

**Advantages:**
- Great for small spaces
- Indoor/outdoor
- Produces worm castings (nutrient-rich)
- Continuous process
- Good for apartments

**Disadvantages:**
- Limited capacity
- Need to maintain worm health
- Can''t compost everything

**Method 4: Trench Composting**
**Timeline:** 6-12 months

**Process:**
1. Dig trench 8-12" deep
2. Add kitchen scraps
3. Cover with soil
4. Plant over it next season

**Advantages:**
- No bin needed
- No turning
- Direct soil improvement
- Hidden from view

**Disadvantages:**
- Slow
- Can''t use compost elsewhere
- May attract animals

**What to Compost:**

✅ **YES:**
- Vegetable and fruit scraps
- Coffee grounds and filters
- Tea bags (remove staples)
- Eggshells (crushed)
- Grass clippings
- Leaves
- Straw and hay
- Shredded newspaper
- Cardboard (no wax coating)
- Plant trimmings
- Sawdust (untreated)
- Manure (herbivore only)

❌ **NO:**
- Meat, bones, fish
- Dairy products
- Fats, oils, grease
- Dog/cat waste
- Diseased plants
- Weeds with seeds (unless hot composting)
- Chemically treated lawn clippings
- Coal/charcoal ash
- Glossy paper
- Synthetic materials

⚠️ **CAUTION:**
- Citrus peels (small amounts ok)
- Onions (can repel worms)
- Bread/grains (can attract pests)

**Compost Bin Options:**

**1. Wire Cylinder:**
- Cheap ($10-20)
- Good airflow
- Easy to turn (lift and reposition)
- 3-4 ft diameter

**2. Wood Pallet Bins:**
- Free or cheap
- Rustic look
- 3-bin system ideal
- DIY friendly

**3. Plastic Bins:**
- Commercial ($50-200)
- Neat appearance
- Pest-resistant
- Less airflow

**4. Tumbler:**
- Easy turning ($100-300)
- Fast composting
- Rodent-proof
- Limited capacity

**5. Open Pile:**
- Free
- Unlimited capacity
- Less tidy
- May attract animals

**Troubleshooting:**

**Problem: Smells Bad**
**Cause:** Too wet or too much nitrogen
**Solution:**
- Add brown materials
- Turn pile more
- Improve drainage

**Problem: Not Heating**
**Cause:** Too small, too dry, wrong ratio
**Solution:**
- Build larger pile (3x3x3 minimum)
- Add water
- Add more nitrogen (greens)
- Turn to add air

**Problem: Attracting Pests**
**Cause:** Improper materials, accessible food
**Solution:**
- Avoid meat, dairy, oils
- Bury food scraps in center
- Use rodent-proof bin
- Keep pile balanced

**Problem: Too Dry**
**Cause:** Insufficient moisture, too much brown
**Solution:**
- Water thoroughly
- Cover pile in dry weather
- Add more greens

**Problem: Too Wet/Soggy**
**Cause:** Overwatered, poor drainage, too much green
**Solution:**
- Add browns (leaves, straw, paper)
- Turn pile to add air
- Cover from rain
- Improve drainage

**Problem: Some Materials Not Breaking Down**
**Cause:** Too large, woody, or slow-decomposing
**Solution:**
- Chop/shred materials smaller
- Add more nitrogen
- Give more time
- Screen out and re-compost

**Advanced Techniques:**

**Layering Method:**
1. 6" browns
2. 2-3" greens
3. 1-2" soil (adds microbes)
4. Repeat layers
5. Water each layer
6. End with browns on top

**Berkeley Method** (Fastest):
1. Build 1 cubic yard pile
2. C:N ratio 30:1
3. Turn every 2 days
4. Monitor temperature
5. Keep moist
6. Done in 18 days!

**Static Pile with Aeration:**
- PVC pipes with holes through pile
- Passive aeration
- Less turning needed
- Still relatively fast

**Using Finished Compost:**

**How to Know It''s Ready:**
- Dark brown/black color
- Crumbly, soil-like texture
- Sweet, earthy smell
- Original materials unrecognizable
- Temperature same as ambient
- No hot spots

**Screening:**
Use 1/2" hardware cloth to screen
- Coarse pieces back to pile
- Fine compost for use

**Applications:**

**Garden Beds:**
- Mix 2-3" into top 6" of soil
- Apply in spring or fall

**Container Mix:**
- 1 part compost
- 1 part peat/coco coir
- 1 part perlite/vermiculite

**Mulch:**
- 1-2" layer around plants
- Keep away from stems

**Compost Tea:**
- Steep finished compost in water
- Use as liquid fertilizer
- Dilute if strong

**Lawn Topdressing:**
- 1/4" layer
- Improves soil
- Reduces thatch

**Seed Starting:**
- Screen finely
- Mix with peat/vermiculite
- Provides nutrients

**Storage:**
- Keep covered and moist
- Use within 6 months for best quality
- Pile in corner of garden
- Bin or tarp covering

**Compost Math:**

**Volume Calculation:**
- 1 cubic yard = 27 cubic feet
- Covers 108 sq ft at 3" depth
- Average household: 3-5 cu ft per year

**Carbon:Nitrogen Ratios:**
- Browns (high carbon): 50:1 to 500:1
- Greens (high nitrogen): 5:1 to 25:1
- Ideal mix: 25:1 to 30:1

**Quick Reference C:N Ratios:**
- Coffee grounds: 20:1
- Grass clippings: 20:1
- Food scraps: 15:1
- Leaves: 60:1
- Straw: 80:1
- Sawdust: 500:1
- Newspaper: 170:1

**Seasonal Composting:**

**Spring:**
- Turn winter pile
- Start new hot pile
- Screen and use finished compost

**Summer:**
- Add grass clippings
- Keep pile moist
- Harvest finished compost

**Fall:**
- Add leaves (excellent carbon)
- Build new pile for winter
- Cover pile

**Winter:**
- Continue adding scraps (slow breakdown)
- Cover pile to shed snow/rain
- Plan spring composting

**Community Composting:**
- Share bins with neighbors
- Each contributes materials
- Take turns managing
- Share finished product

**Composting Tips for Success:**

1. **Chop materials** for faster decomposition
2. **Layer greens and browns** for balance
3. **Keep as moist as wrung sponge**
4. **Turn regularly** for hot composting
5. **Build pile all at once** for hot method
6. **Add finished compost** to inoculate new pile
7. **Cover food scraps** to deter pests
8. **Keep pile in shade** in hot climates
9. **Size matters** - bigger heats better
10. **Be patient** - nature takes time

Composting transforms waste into garden gold while benefiting the environment!',
    'All Crops',
    'https://images.unsplash.com/photo-1616429007084-33bb2323c3d0?w=800&q=80',
    admin_id,
    true
  );

END $$;
