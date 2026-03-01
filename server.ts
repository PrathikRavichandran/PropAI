import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

console.log("[Server] Script execution started...");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Database
let db: Database.Database;

function initDb() {
  console.log("[DB] Initializing database...");
  try {
    db = new Database("propai.db");
    db.pragma("journal_mode = WAL");
    console.log("[DB] Database connected.");
    initializeSchema();
    seedData();
  } catch (error) {
    console.error("[DB] Critical initialization error:", error);
    process.exit(1);
  }
}

// Database Schema Initialization
const initializeSchema = () => {
  console.log("Initializing database schema...");
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        name TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        type TEXT,
        status TEXT,
        bed INTEGER,
        bath INTEGER,
        image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        property_id TEXT,
        name TEXT,
        phone TEXT,
        email TEXT,
        occupation TEXT,
        rent_amount REAL,
        security_deposit REAL,
        pet_deposit REAL,
        lease_start TEXT,
        lease_end TEXT,
        lease_duration INTEGER,
        pet_policy TEXT,
        renewal_status TEXT,
        payment_status TEXT,
        FOREIGN KEY(property_id) REFERENCES properties(id)
      );

      CREATE TABLE IF NOT EXISTS loans (
        id TEXT PRIMARY KEY,
        property_id TEXT,
        lender_name TEXT,
        loan_amount REAL,
        interest_rate REAL,
        start_date TEXT,
        tenure_months INTEGER,
        emi_amount REAL,
        emi_due_date TEXT,
        outstanding_balance REAL,
        last_payment_date TEXT,
        status TEXT,
        FOREIGN KEY(property_id) REFERENCES properties(id)
      );

      CREATE TABLE IF NOT EXISTS appliances (
        id TEXT PRIMARY KEY,
        property_id TEXT,
        name TEXT,
        brand TEXT,
        model TEXT,
        purchase_date TEXT,
        warranty_start TEXT,
        warranty_end TEXT,
        insurance_covered TEXT,
        insurance_provider TEXT,
        last_service_date TEXT,
        status TEXT,
        contact_number TEXT,
        contractor_name TEXT,
        contractor_email TEXT,
        FOREIGN KEY(property_id) REFERENCES properties(id)
      );

      CREATE TABLE IF NOT EXISTS utilities (
        property_id TEXT PRIMARY KEY,
        electricity_provider TEXT,
        water_provider TEXT,
        trash_provider TEXT,
        elec_contact TEXT,
        water_contact TEXT,
        trash_contact TEXT,
        FOREIGN KEY(property_id) REFERENCES properties(id)
      );

      CREATE TABLE IF NOT EXISTS escrow (
        id TEXT PRIMARY KEY,
        property_id TEXT,
        agency_name TEXT,
        payment_year INTEGER,
        property_tax REAL,
        insurance REAL,
        hoa_fees REAL,
        payment_date TEXT,
        next_due_date TEXT,
        FOREIGN KEY(property_id) REFERENCES properties(id)
      );

      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        property_id TEXT,
        tenant_id TEXT,
        description TEXT,
        priority TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'pending',
        reported_date TEXT,
        assigned_contractor_id INTEGER,
        ai_summary TEXT,
        FOREIGN KEY(property_id) REFERENCES properties(id),
        FOREIGN KEY(tenant_id) REFERENCES tenants(id)
      );

      CREATE TABLE IF NOT EXISTS contractors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        specialty TEXT,
        phone TEXT,
        email TEXT
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        message TEXT,
        property_id TEXT,
        date_created TEXT,
        is_read INTEGER DEFAULT 0
      );
    `);
    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    throw error;
  }
};

// Seed Data
const seedData = () => {
  const check = db.prepare("SELECT count(*) as count FROM properties").get() as { count: number };
  if (check.count > 0) return;

  console.log("[DB] Seeding database with provided data...");

  // Properties
  const insertProp = db.prepare("INSERT INTO properties (id, name, address, city, state, zip, type, status, bed, bath, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const props = [
    ['PROP001', 'Sunset Villas', '123 Oak Street', 'Austin', 'TX', '78701', 'Apartment Building', 'Leased', 3, 2],
    ['PROP002', 'Maple Office Park', '456 Maple Ave', 'Chicago', 'IL', '60607', 'Commercial', 'Leased', 2, 2],
    ['PROP003', 'Riverside Lofts', '789 River Road', 'Denver', 'CO', '80202', 'Mixed-Use', 'Active', 3, 3],
    ['PROP004', 'Pine Residential', '101 Pine Lane', 'Atlanta', 'GA', '30308', 'Single Family', 'Leased', 4, 2],
    ['PROP005', 'Harbor View Plaza', '234 Harbor Drive', 'Seattle', 'WA', '98101', 'Retail', 'Active', 5, 3],
    ['PROP006', 'University Heights', '567 College Blvd', 'Boston', 'MA', '2115', 'Student Housing', 'Leased', 3, 2],
    ['PROP007', 'Industrial Park West', '890 Factory Street', 'Dallas', 'TX', '75201', 'Industrial', 'Leased', 2, 3],
    ['PROP008', 'Garden Apartments', '321 Garden Way', 'Phoenix', 'AZ', '85001', 'Multi-Family', 'Leased', 4, 2],
    ['PROP009', 'Tech Center One', '654 Innovation Dr', 'San Jose', 'CA', '95113', 'Office', 'Leased', 2, 2],
    ['PROP010', 'Mountain Retreat', '987 Summit Road', 'Salt Lake City', 'UT', '84101', 'Vacation Rental', 'Leased', 4, 2]
  ];
  props.forEach((p, i) => insertProp.run(...p, `https://picsum.photos/seed/${p[0]}/800/600`));

  // Tenants
  const insertTenant = db.prepare(`INSERT INTO tenants (id, property_id, name, phone, email, occupation, rent_amount, security_deposit, pet_deposit, lease_start, lease_end, lease_duration, pet_policy, renewal_status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const tenants = [
    ['TEN001', 'PROP001', 'John Smith', '(555) 123-4567', 'john.smith@email.com', 'Software Engineer', 3200, 3000, 0, '2023-06-01', '2024-05-31', 12, 'One small pet allowed', 'Pending', 'Paid'],
    ['TEN002', 'PROP002', 'Sarah Johnson', '(555) 234-5678', 'sarah.j@email.com', 'Marketing Director', 2900, 3000, 0, '2022-09-15', '2024-09-14', 24, 'No pets allowed', 'Renewed', 'Unpaid'],
    ['TEN003', 'PROP003', 'NONE', '', '', '', 2500, 2500, 0, '', '', 0, 'No pets allowed', '', ''],
    ['TEN004', 'PROP004', 'Fashion Retail LLC', '(555) 456-7890', 'contact@fashionretail.com', 'Retail Business', 3200, 3200, 0, '2023-01-01', '2025-12-31', 36, 'Not applicable', 'Signed', 'Paid'],
    ['TEN005', 'PROP005', 'NONE', '', '', '', 3800, 4000, 0, '', '', 0, 'Not applicable', '', ''],
    ['TEN006', 'PROP006', 'Michael Chen', '(555) 678-9012', 'm.chen@email.com', 'Data Analyst', 2950, 5000, 0, '2024-02-01', '2025-01-31', 12, 'No pets allowed', 'New', 'Unpaid'],
    ['TEN007', 'PROP007', 'Global Corp', '(555) 789-0123', 'realestate@globalcorp.com', 'Multinational Corp', 2900, 3000, 0, '2023-08-15', '2028-08-14', 60, 'Not applicable', 'Signed', 'Unpaid'],
    ['TEN008', 'PROP008', 'Emily Wilson', '(555) 890-1234', 'e.wilson@email.com', 'Nurse', 1800, 2000, 0, '2022-12-01', '2024-11-30', 24, 'Cats allowed only', 'Will not renew', 'Paid'],
    ['TEN009', 'PROP009', 'Robert Davis', '(555) 901-2345', 'rob.davis@email.com', 'Architect', 4200, 5000, 0, '2024-01-15', '2025-01-14', 12, 'No pets allowed', 'New', 'Paid'],
    ['TEN010', 'PROP010', 'Jessica Taylor', '(555) 012-3456', 'j.taylor@email.com', 'Teacher', 2750, 3000, 0, '2023-11-01', '2024-10-31', 12, 'Dogs allowed with deposit', 'Pending', 'Paid']
  ];
  tenants.forEach(t => insertTenant.run(...t));

  // Loans
  const insertLoan = db.prepare(`INSERT INTO loans (id, property_id, lender_name, loan_amount, interest_rate, start_date, tenure_months, emi_amount, emi_due_date, outstanding_balance, last_payment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const loans = [
    ['LOAN001', 'PROP001', 'City National Bank', 250000, 5.25, '2022-04-01', 360, 1200, '1900-01-15', 50000, '2024-02-15', 'Active'],
    ['LOAN002', 'PROP002', 'Chase Bank', 420000, 6.75, '2021-12-15', 240, 1800, '1900-01-01', 89000, '2024-03-01', 'Active'],
    ['LOAN003', 'PROP003', 'Wells Fargo', 185000, 4.5, '2020-08-01', 180, 900, '1900-01-05', 100000, '2024-02-05', 'Active'],
    ['LOAN004', 'PROP004', 'Bank of America', 75000, 5.75, '2022-10-01', 300, 1500, '1900-01-10', 1000000, '2024-03-10', 'Active'],
    ['LOAN005', 'PROP005', 'Goldman Sachs', 315000, 6.25, '2023-04-01', 240, 2000, '1900-01-20', 30000, '2024-02-20', 'Active'],
    ['LOAN006', 'PROP006', 'US Bank', 290000, 5, '2020-01-01', 180, 1200, '1900-01-12', 150000, '2024-02-12', 'Active'],
    ['LOAN007', 'PROP007', 'Morgan Stanley', 380000, 7.25, '2022-08-15', 360, 1400, '1900-01-25', 450000, '2024-03-25', 'Active'],
    ['LOAN008', 'PROP008', 'First National Bank', 220000, 5.5, '2023-02-01', 240, 1100, '1900-01-18', 100000, '2024-02-18', 'Active'],
    ['LOAN009', 'PROP009', 'PNC Bank', 525000, 6, '2021-06-01', 300, 2200, '1900-01-08', 21000, '2024-03-08', 'Active'],
    ['LOAN010', 'PROP010', 'SunTrust Bank', 165000, 5.25, '2023-03-01', 180, 1300, '1900-01-28', 69000, '2024-02-28', 'Active']
  ];
  loans.forEach(l => insertLoan.run(...l));

  // Utilities
  const insertUtil = db.prepare(`INSERT INTO utilities (property_id, electricity_provider, water_provider, trash_provider, elec_contact, water_contact, trash_contact) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const utils = [
    ['PROP001', 'PowerGrid Electric', 'AquaFlow Water Co.', 'CityWaste Services', '+1-212-555-0201', '+1-212-555-0301', '+1-212-555-0401'],
    ['PROP002', 'Bright Energy Inc.', 'ClearWater Supply', 'GreenBin Disposal', '+1-312-555-0202', '+1-312-555-0302', '+1-312-555-0402'],
    ['PROP003', 'Volt Connect', 'PureStream Water', 'TrashAway LLC', '+1-415-555-0203', '+1-415-555-0303', '+1-415-555-0403'],
    ['PROP004', 'SunGrid Power', 'BlueTap Utilities', 'WastePro Co.', '+1-713-555-0204', '+1-713-555-0304', '+1-713-555-0404'],
    ['PROP005', 'Metro Electric', 'FreshFlow Water', 'CleanHaul Inc.', '+1-305-555-0205', '+1-305-555-0305', '+1-305-555-0405'],
    ['PROP006', 'Apex Power Co.', 'CityWater Authority', 'BinMasters Ltd.', '+1-617-555-0206', '+1-617-555-0306', '+1-617-555-0406'],
    ['PROP007', 'TrueVolt Energy', 'AquaCity Supply', 'EcoWaste Group', '+1-404-555-0207', '+1-404-555-0307', '+1-404-555-0407'],
    ['PROP008', 'GridLine Electric', 'StreamPure Water', 'HaulRight Services', '+1-602-555-0208', '+1-602-555-0308', '+1-602-555-0408'],
    ['PROP009', 'CityPower Utilities', 'WaterWorks Co.', 'RapidWaste Inc.', '+1-503-555-0209', '+1-503-555-0309', '+1-503-555-0409'],
    ['PROP010', 'NovaSpark Energy', 'BlueLine Water', 'SwiftBin Disposal', '+1-702-555-0210', '+1-702-555-0310', '+1-702-555-0410']
  ];
  utils.forEach(u => insertUtil.run(...u));

  // Appliances
  const insertAppliance = db.prepare(`INSERT INTO appliances (id, property_id, name, brand, model, purchase_date, warranty_start, warranty_end, insurance_covered, insurance_provider, last_service_date, status, contact_number, contractor_name, contractor_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const appliances = [
    ['APPL001', 'PROP001', 'Central AC Unit', 'Trane', 'XVI8i TruComfort', '2022-05-10', '2022-05-10', '2027-05-09', 'Y', 'State Farm', '2024-01-15', 'Operational', '521-698-966', 'CoolAir Solutions', 'service@coolair.com'],
    ['APPL002', 'PROP002', 'Elevator System', 'Otis', 'Gen2 Super', '2021-11-20', '2021-11-20', '2026-11-19', 'Y', 'Allstate', '2024-02-10', 'Operational', '259-568-568', 'VerticalTech Elevators', 'support@verticaltech.com'],
    ['APPL003', 'PROP003', 'Commercial Boiler', 'Buderus', 'GB142', '2023-01-15', '2023-01-15', '2028-01-14', 'Y', 'Liberty Mutual', '2024-01-30', 'Operational', '125-569-897', 'HeatPro Services', 'info@heatproservices.com'],
    ['APPL004', 'PROP004', 'Dishwasher', 'KitchenAid', 'KDTE334GPS', '2023-08-05', '2023-08-05', '2026-08-04', 'Y', 'huhu mutual', '2024-01-26', 'Needs Repair', '458-568-789', 'ApplianceFix Co.', 'repairs@appliancefix.com'],
    ['APPL005', 'PROP005', 'Refrigeration System', 'Carrier', '30RB Chiller', '2022-09-12', '2022-09-12', '2027-09-11', 'Y', 'Travelers', '2023-12-05', 'Operational', '528-569-131', 'FrostLine Contractors', 'contact@frostline.com'],
    ['APPL006', 'PROP006', 'Laundry Machines', 'Whirlpool', 'Commercial WW', '2021-06-30', '2021-06-30', '2024-06-29', 'Y', 'jumjum mutual', '2024-02-01', 'Operational', '258-852-963', 'CleanTech Appliances', 'help@cleantechapp.com'],
    ['APPL007', 'PROP007', 'Industrial AC', 'York', 'YK Centrifugal', '2023-03-25', '2023-03-25', '2028-03-24', 'Y', 'Chubb', '2024-02-15', 'Operational', '456-789-123', 'ArcticBreeze HVAC', 'hvac@arcticbreeze.com'],
    ['APPL008', 'PROP008', 'Water Heater', 'Rheem', 'Performance Platinum', '2020-12-10', '2020-12-10', '2025-12-09', 'Y', 'Farmers', '2023-11-20', 'Operational', '454-565-898', 'AquaWarm Plumbing', 'plumbing@aquawarm.com'],
    ['APPL009', 'PROP009', 'Security System', 'Honeywell', 'ProSeries', '2022-07-18', '2022-07-18', '2027-07-17', 'Y', 'USAA', '2024-02-05', 'Operational', '121-232-252', 'SecureGuard Systems', 'support@secureguard.com'],
    ['APPL010', 'PROP010', 'Heat Pump', 'Mitsubishi', 'Hyper Heat', '2023-02-14', '2023-02-14', '2028-02-14', 'Y', 'Nationwide', '2024-01-20', 'Operational', '789-969-898', 'ThermalEdge HVAC', 'info@thermaledge.com']
  ];
  appliances.forEach(a => insertAppliance.run(...a));

  // Escrow
  const insertEscrow = db.prepare(`INSERT INTO escrow (id, property_id, agency_name, payment_year, property_tax, insurance, hoa_fees, payment_date, next_due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const escrow = [
    ['ESC001', 'PROP001', 'First Escrow Services', 2024, 4700, 1800, 1000, '2024-01-10', '2025-01-10'],
    ['ESC002', 'PROP002', 'Global Escrow Inc', 2024, 3200, 2000, 1200, '2024-01-05', '2025-01-05'],
    ['ESC003', 'PROP003', 'Metro Escrow Group', 2024, 4000, 3200, 1000, '2024-01-15', '2025-01-15'],
    ['ESC004', 'PROP004', 'Sunshine Escrow', 2024, 1200, 1300, 1200, '2024-01-08', '2025-01-08'],
    ['ESC005', 'PROP005', 'Coastal Escrow Services', 2024, 3000, 2500, 1200, '2024-01-12', '2025-01-12'],
    ['ESC006', 'PROP006', 'Campus Escrow', 2024, 3000, 2800, 1300, '2024-01-18', '2025-01-18'],
    ['ESC007', 'PROP007', 'Industrial Escrow Solutions', 2024, 2500, 3600, 1500, '2024-01-20', '2025-01-20'],
    ['ESC008', 'PROP008', 'Desert Escrow Agency', 2024, 3600, 2200, 1200, '2024-01-22', '2025-01-22'],
    ['ESC009', 'PROP009', 'Tech Escrow Partners', 2024, 3200, 1200, 1000, '2024-01-25', '2025-01-25'],
    ['ESC010', 'PROP010', 'Mountain Escrow', 2024, 2500, 1850, 1000, '2024-01-28', '2025-01-28']
  ];
  escrow.forEach(e => insertEscrow.run(...e));

  // Contractors (General)
  const insertContractor = db.prepare('INSERT INTO contractors (name, specialty, phone, email) VALUES (?, ?, ?, ?)');
  insertContractor.run('Mario Bros Plumbing', 'Plumbing', '555-0123', 'mario@example.com');
  insertContractor.run('Bob the Builder', 'General', '555-0456', 'bob@example.com');

  console.log("[DB] Database seeded successfully.");
};

async function startServer() {
  console.log("[Server] Starting initialization...");
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB before routes
  initDb();

  // API Routes
  console.log("Registering API routes...");
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Properties API (Expanded)
  app.get("/api/properties", (req, res) => {
    const props = db.prepare(`
      SELECT p.*, 
             l.outstanding_balance as current_principal, l.emi_amount as monthly_payment, l.lender_name as bank_name,
             t.name as tenant_name, t.rent_amount as monthly_rent, t.payment_status
      FROM properties p
      LEFT JOIN loans l ON p.id = l.property_id
      LEFT JOIN tenants t ON p.id = t.property_id
    `).all();
    res.json(props);
  });

  // Alerts API
  app.get("/api/alerts", (req, res) => {
    // 1. Fetch persistent alerts from DB
    const dbAlerts = db.prepare("SELECT * FROM alerts ORDER BY date_created DESC").all();
    
    // 2. Generate dynamic alerts based on current state
    const dynamicAlerts = [];
    const today = new Date();
    
    // Payment Overdue
    const overdueTenants = db.prepare("SELECT * FROM tenants WHERE payment_status = 'Unpaid'").all();
    overdueTenants.forEach((t: any) => {
      dynamicAlerts.push({ type: 'payment_overdue', message: `Rent overdue for ${t.name} (${t.property_id})`, date: new Date().toISOString() });
    });

    // Lease End (10, 20, 30 days)
    const tenants = db.prepare("SELECT * FROM tenants").all();
    tenants.forEach((t: any) => {
      if (!t.lease_end) return;
      const end = new Date(t.lease_end);
      const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if ([10, 20, 30].includes(diffDays)) {
        dynamicAlerts.push({ type: 'lease_end', message: `Lease ends in ${diffDays} days for ${t.name}`, date: new Date().toISOString() });
      }
    });

    // Loan EMI Due
    const loans = db.prepare("SELECT * FROM loans").all();
    loans.forEach((l: any) => {
      const dueDay = new Date(l.emi_due_date).getDate();
      if (today.getDate() === dueDay) {
        dynamicAlerts.push({ type: 'emi_due', message: `EMI of $${l.emi_amount} due today for ${l.property_id}`, date: new Date().toISOString() });
      }
    });

    // Escrow Due
    const escrows = db.prepare("SELECT * FROM escrow").all();
    escrows.forEach((e: any) => {
      if (!e.next_due_date) return;
      const due = new Date(e.next_due_date);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7 && diffDays >= 0) {
        dynamicAlerts.push({ type: 'escrow_due', message: `Escrow payment due in ${diffDays} days for ${e.property_id}`, date: new Date().toISOString() });
      }
    });

    // Warranty End
    const appliances = db.prepare("SELECT * FROM appliances").all();
    appliances.forEach((a: any) => {
      if (!a.warranty_end) return;
      const end = new Date(a.warranty_end);
      const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30 && diffDays > 0) {
        dynamicAlerts.push({ type: 'warranty_end', message: `Warranty for ${a.name} (${a.property_id}) ends in ${diffDays} days`, date: new Date().toISOString() });
      }
    });

    res.json([...dbAlerts, ...dynamicAlerts]);
  });

  // Tenant Payment API
  app.post("/api/tenants/:id/pay", (req, res) => {
    const { id } = req.params;
    const tenant = db.prepare("SELECT * FROM tenants WHERE id = ?").get(id) as any;
    
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Update status
    db.prepare("UPDATE tenants SET payment_status = 'Paid' WHERE id = ?").run(id);

    // Create Alert
    db.prepare("INSERT INTO alerts (type, message, property_id, date_created) VALUES (?, ?, ?, ?)").run(
      'rent_paid',
      `Tenant ${tenant.name} paid rent of $${tenant.rent_amount}`,
      tenant.property_id,
      new Date().toISOString()
    );

    res.json({ success: true });
  });

  // Contractors API
  app.get("/api/contractors", (req, res) => {
    const contractors = db.prepare("SELECT * FROM contractors").all();
    res.json(contractors);
  });

  // Maintenance API
  app.get("/api/maintenance", (req, res) => {
    const requests = db.prepare(`
      SELECT m.*, p.address, c.name as contractor_name
      FROM maintenance_requests m
      JOIN properties p ON m.property_id = p.id
      LEFT JOIN contractors c ON m.assigned_contractor_id = c.id
      ORDER BY m.reported_date DESC
    `).all();
    res.json(requests);
  });

  app.post("/api/maintenance", (req, res) => {
    const { property_id, tenant_id, description, priority } = req.body;
    const stmt = db.prepare(`
      INSERT INTO maintenance_requests (property_id, tenant_id, description, priority, reported_date, status)
      VALUES (?, ?, ?, ?, datetime('now'), 'pending')
    `);
    const info = stmt.run(property_id, tenant_id, description, priority || 'normal');
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/maintenance/:id/assign", (req, res) => {
    const { contractor_id } = req.body;
    const stmt = db.prepare(`
      UPDATE maintenance_requests 
      SET assigned_contractor_id = ?, status = 'scheduled' 
      WHERE id = ?
    `);
    stmt.run(contractor_id, req.params.id);
    res.json({ success: true });
  });

  // Financial Summary API
  app.get("/api/finance/summary", (req, res) => {
    try {
      const summary = db.prepare(`
        SELECT 
          COALESCE(SUM(t.rent_amount), 0) as total_rent,
          COALESCE(SUM(l.emi_amount), 0) as total_mortgage,
          COALESCE(SUM(l.outstanding_balance), 0) as total_debt,
          COALESCE(SUM(p.bed * 150000), 0) as total_asset_value
        FROM properties p
        LEFT JOIN loans l ON p.id = l.property_id
        LEFT JOIN tenants t ON p.id = t.property_id
      `).get();
      res.json(summary);
    } catch (error) {
      console.error("Finance summary error:", error);
      res.status(500).json({ error: "Failed to fetch finance summary" });
    }
  });

  // Consolidated Dashboard Data API
  app.get("/api/dashboard/data", (req, res) => {
    console.log("Fetching dashboard data...");
    try {
      const finance = db.prepare(`
        SELECT 
          COALESCE(SUM(t.rent_amount), 0) as total_rent,
          COALESCE(SUM(l.emi_amount), 0) as total_mortgage,
          COALESCE(SUM(l.outstanding_balance), 0) as total_debt,
          COALESCE(SUM(p.bed * 150000), 0) as total_asset_value
        FROM properties p
        LEFT JOIN loans l ON p.id = l.property_id
        LEFT JOIN tenants t ON p.id = t.property_id
      `).get();
      console.log("Finance summary:", finance);

      const properties = db.prepare(`
        SELECT p.*, 
               l.outstanding_balance as current_principal, l.emi_amount as monthly_payment, l.lender_name as bank_name,
               t.name as tenant_name, t.rent_amount as monthly_rent, t.payment_status
        FROM properties p
        LEFT JOIN loans l ON p.id = l.property_id
        LEFT JOIN tenants t ON p.id = t.property_id
      `).all();

      const maintenance = db.prepare(`
        SELECT m.*, p.address, c.name as contractor_name
        FROM maintenance_requests m
        JOIN properties p ON m.property_id = p.id
        LEFT JOIN contractors c ON m.assigned_contractor_id = c.id
        ORDER BY m.reported_date DESC
      `).all();

      const contractors = db.prepare("SELECT * FROM contractors").all();

      // Alerts generation logic (same as /api/alerts)
      const dbAlerts = db.prepare("SELECT * FROM alerts ORDER BY date_created DESC").all();
      const dynamicAlerts = [];
      const today = new Date();
      
      const overdueTenants = db.prepare("SELECT * FROM tenants WHERE payment_status = 'Unpaid'").all();
      overdueTenants.forEach((t: any) => {
        dynamicAlerts.push({ type: 'payment_overdue', message: `Rent overdue for ${t.name} (${t.property_id})`, date: new Date().toISOString() });
      });

      const tenants = db.prepare("SELECT * FROM tenants").all();
      tenants.forEach((t: any) => {
        if (!t.lease_end) return;
        const end = new Date(t.lease_end);
        const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if ([10, 20, 30].includes(diffDays)) {
          dynamicAlerts.push({ type: 'lease_end', message: `Lease ends in ${diffDays} days for ${t.name}`, date: new Date().toISOString() });
        }
      });

      const loans = db.prepare("SELECT * FROM loans").all();
      loans.forEach((l: any) => {
        const dueDay = new Date(l.emi_due_date).getDate();
        if (today.getDate() === dueDay) {
          dynamicAlerts.push({ type: 'emi_due', message: `EMI of $${l.emi_amount} due today for ${l.property_id}`, date: new Date().toISOString() });
        }
      });

      const escrows = db.prepare("SELECT * FROM escrow").all();
      escrows.forEach((e: any) => {
        if (!e.next_due_date) return;
        const due = new Date(e.next_due_date);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7 && diffDays >= 0) {
          dynamicAlerts.push({ type: 'escrow_due', message: `Escrow payment due in ${diffDays} days for ${e.property_id}`, date: new Date().toISOString() });
        }
      });

      const appliances = db.prepare("SELECT * FROM appliances").all();
      appliances.forEach((a: any) => {
        if (!a.warranty_end) return;
        const end = new Date(a.warranty_end);
        const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30 && diffDays > 0) {
          dynamicAlerts.push({ type: 'warranty_end', message: `Warranty for ${a.name} (${a.property_id}) ends in ${diffDays} days`, date: new Date().toISOString() });
        }
      });

      // Generate some historical data for charts
      const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
      const historical_finance = months.map((month, i) => {
        const baseRent = finance.total_rent || 25000;
        const baseMortgage = finance.total_mortgage || 15000;
        // Add some random variation
        const variance = (Math.random() - 0.5) * 2000;
        return {
          month,
          revenue: baseRent + variance,
          expenses: baseMortgage + (Math.random() * 1000),
          profit: (baseRent + variance) - (baseMortgage + (Math.random() * 1000))
        };
      });

      res.json({
        finance,
        properties,
        maintenance,
        contractors,
        historical_finance,
        alerts: [...dbAlerts, ...dynamicAlerts]
      });
    } catch (error) {
      console.error("Dashboard data error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware initialized.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
    console.log("[Server] Ready to handle requests.");
  });
}

startServer().catch(err => {
  console.error("Critical server startup error:", err);
  process.exit(1);
});
