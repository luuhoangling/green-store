import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  try {
    // Thay đổi thông tin admin tại đây
    const email = 'admin@greenstore.com'
    const password = '123456'  // Mật khẩu của bạn
    const name = 'Administrator'
    const role = 'admin'

    // Kiểm tra xem admin đã tồn tại chưa
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      console.log('❌ User with this email already exists!')
      console.log('User ID:', existingUsers[0].id)
      return
    }

    // Hash password với bcrypt (salt rounds = 12, giống như trong register route)
    const passwordHash = await bcrypt.hash(password, 12)

    // Tạo admin user
    const newUsers = await sql`
      INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
      VALUES (${email}, ${passwordHash}, ${name}, ${role}, NOW(), NOW())
      RETURNING id, email, name, role
    `

    const admin = newUsers[0]

    console.log('✅ Admin account created successfully!')
    console.log('-----------------------------------')
    console.log('Email:', admin.email)
    console.log('Password:', password)
    console.log('Name:', admin.name)
    console.log('Role:', admin.role)
    console.log('User ID:', admin.id)
    console.log('-----------------------------------')
    console.log('⚠️  Remember to keep this password secure!')

  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    process.exit()
  }
}

// Chạy hàm tạo admin
createAdmin()
