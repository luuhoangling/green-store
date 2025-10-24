const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Đọc .env file thủ công
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');
    process.env[key] = value;
  }
}

async function createAdmin() {
  try {
    // Load environment variables
    loadEnv();
    
    // Thông tin admin
    const email = 'admin@greenstore.com';
    const password = '123456';
    const name = 'Administrator';
    const role = 'admin';

    // Kết nối database
    const sql = neon(process.env.DATABASE_URL);

    // Kiểm tra xem admin đã tồn tại chưa
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      console.log('❌ User with this email already exists!');
      console.log('User ID:', existingUsers[0].id);
      return;
    }

    // Hash password với bcrypt (salt rounds = 12, giống như trong register route)
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 12);

    // Tạo admin user
    console.log('📝 Creating admin account...');
    const newUsers = await sql`
      INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
      VALUES (${email}, ${passwordHash}, ${name}, ${role}, NOW(), NOW())
      RETURNING id, email, name, role
    `;

    const admin = newUsers[0];

    console.log('✅ Admin account created successfully!');
    console.log('-----------------------------------');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('User ID:', admin.id);
    console.log('-----------------------------------');
    console.log('⚠️  Remember to keep this password secure!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    process.exit();
  }
}

// Chạy hàm tạo admin
createAdmin();
