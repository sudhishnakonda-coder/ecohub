import bcrypt from 'bcryptjs';
import { initDatabase, query } from '../config/db.js';

export async function seedDatabase() {
  await initDatabase();

  // Check if default farmer user exists
  const uCheck = await query('SELECT * FROM users WHERE email = ?', ['farmer@ecohub.com']);
  let userId;

  if (uCheck.rows.length === 0) {
    console.log('[Seed] Seeding default farmer user (farmer@ecohub.com)...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const uRes = await query(
      'INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?) RETURNING id',
      ['Ramesh Patel', '+91 98765 43210', 'farmer@ecohub.com', hashedPassword]
    );
    userId = uRes.rows[0]?.id || uRes.lastID;

    // Create default farm profile
    const fRes = await query(
      'INSERT INTO farms (user_id, crop, location, soil_type, crop_stage, size_acres) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      [userId, 'Wheat', 'GreenValley Farm', 'Loamy Soil', 'Vegetative Stage', 10]
    );
    const farmId = fRes.rows[0]?.id || fRes.lastID;

    // Create default calendar events
    const today = new Date();
    const formatDate = (daysOut) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysOut);
      return d.toISOString().split('T')[0];
    };

    await query(
      'INSERT INTO calendar_events (user_id, title, date, type, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'Drip Irrigation: Wheat Field A', formatDate(0), 'Irrigation', 'Provide 25mm water application during early morning.', 'completed']
    );

    await query(
      'INSERT INTO calendar_events (user_id, title, date, type, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'NPK Fertilizer Dose 2', formatDate(2), 'Fertilizer', 'Apply 45kg/acre balanced NPK 10-26-26 with organic vermicompost.', 'pending']
    );

    await query(
      'INSERT INTO calendar_events (user_id, title, date, type, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'Pest Monitoring & Neem Spray', formatDate(5), 'Pest Inspection', 'Inspect leaves for aphid damage and apply 5ml/L neem oil solution.', 'pending']
    );

    // Initial Notification
    await query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, 'Welcome to EcoHub!', 'Your smart sustainable farm dashboard is ready. Try AI Crop Advisor for personalized tips.', 'success']
    );

    // Initial AI Recommendation
    const sampleAiOutput = {
      irrigation: "Apply 25-30 mm of water every 3 to 4 days during early morning hours. Loamy soil retains moisture well—maintain split application.",
      fertilizer: "Apply balanced NPK (10-26-26) at 45 kg/acre. Supplement with organic vermicompost (200 kg/acre) to enrich soil microbiota.",
      harvest: "Harvest in approximately 30 days when moisture content stabilizes below 18%. Store immediately in climate cold storage.",
      pest_control: "Monitor for aphid and stem borer activity. Apply neem oil solution (5ml/L water) as organic preventive spray.",
      tips: [
        "Implement drip irrigation to reduce overall water consumption by up to 45% in GreenValley Farm.",
        "Practice crop rotation with pulse legumes to naturally fix atmospheric nitrogen into Loamy Soil.",
        "Book shared machinery early via EcoHub Marketplace to cut diesel fuel emissions."
      ]
    };

    await query(
      'INSERT INTO recommendations (farm_id, user_id, ai_response) VALUES (?, ?, ?)',
      [farmId, userId, JSON.stringify(sampleAiOutput)]
    );
  }

  // Check if machinery exists
  const mCheck = await query('SELECT COUNT(*) as count FROM machinery');
  if (parseInt(mCheck.rows[0]?.count || 0) === 0) {
    console.log('[Seed] Seeding sample machinery marketplace listings...');
    const seedMachines = [
      {
        owner: 'Ramesh Patel',
        machine_name: 'Mahindra 575 DI Tractor 45HP',
        type: 'Tractor',
        location: 'GreenValley Agro Hub',
        lat: 17.3850,
        lng: 78.4867,
        rent: 45,
        image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
        description: 'Heavy duty 45HP diesel tractor, ideal for plowing, tilling, and heavy farm haulage. Comes with driver.'
      },
      {
        owner: 'Kisan Cooperative',
        machine_name: 'Kubota Combine Harvester DC-68G',
        type: 'Harvester',
        location: 'Sunrise Rural Sector',
        lat: 17.4120,
        lng: 78.4400,
        rent: 120,
        image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
        description: 'High performance paddy & wheat harvester. Minimum grain loss technology with automatic chaff separator.'
      },
      {
        owner: 'Sardar Agro Tech',
        machine_name: 'Shaktiman 7-Feet Heavy Duty Rotavator',
        type: 'Rotavator',
        location: 'GreenValley Agro Hub',
        lat: 17.3980,
        lng: 78.5100,
        rent: 30,
        image_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
        description: 'Multi-speed gearbox rotavator for fine seedbed preparation. Pre-adjusted depth skids included.'
      },
      {
        owner: 'EcoFarm Solutions',
        machine_name: 'ASPEE Tractor-Mounted Boom Sprayer (500L)',
        type: 'Sprayer',
        location: 'Highland Farm Center',
        lat: 17.4500,
        lng: 78.3800,
        rent: 35,
        image_url: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=600&q=80',
        description: 'Precision 12-meter boom sprayer with anti-drip nozzles. Perfect for micro-pesticide and liquid bio-fertilizer application.'
      },
      {
        owner: 'Gurpreet Singh',
        machine_name: 'Fieldking 9-Row Automatic Seed Drill',
        type: 'Seed Drill',
        location: 'Sunrise Rural Sector',
        lat: 17.3700,
        lng: 78.4500,
        rent: 28,
        image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
        description: 'Zero-till seed cum fertilizer drill for sowing wheat, corn, and pulses with accurate depth control.'
      }
    ];

    for (const m of seedMachines) {
      await query(
        `INSERT INTO machinery (owner, machine_name, type, location, lat, lng, rent, image_url, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.owner, m.machine_name, m.type, m.location, m.lat, m.lng, m.rent, m.image_url, m.description]
      );
    }
  }

  // Check if cold storage exists
  const sCheck = await query('SELECT COUNT(*) as count FROM cold_storages');
  if (parseInt(sCheck.rows[0]?.count || 0) === 0) {
    console.log('[Seed] Seeding sample cold storage facility listings...');
    const seedStorages = [
      {
        name: 'FrostShield Agri Cold Storage',
        location: 'GreenValley Agro Hub',
        lat: 17.3900,
        lng: 78.4900,
        capacity: 500,
        price: 15,
        image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'EcoPreserve Multi-Commodity Warehouse',
        location: 'Sunrise Rural Sector',
        lat: 17.4200,
        lng: 78.4300,
        capacity: 1200,
        price: 12,
        image_url: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'HarvestSafe Solar Cold Chain Unit',
        location: 'Highland Farm Center',
        lat: 17.4600,
        lng: 78.3900,
        capacity: 350,
        price: 18,
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
      }
    ];

    for (const s of seedStorages) {
      await query(
        `INSERT INTO cold_storages (name, location, lat, lng, capacity, price, available_capacity, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.name, s.location, s.lat, s.lng, s.capacity, s.price, s.capacity, s.image_url]
      );
    }
  }

  console.log('[Seed] Database seeding completed successfully.');
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  seedDatabase().catch(err => console.error('Seed script error:', err));
}
