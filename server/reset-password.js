/**
 * Developer Password Reset Utility
 * Just change the two variables below, then run: node reset-password.js
 */

const EMAIL = 'user@example.com'       // ← change this
const NEW_PASSWORD = 'NewPass@1234'     // ← change this

// ─────────────────────────────────────────────────────────
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { User } = require('./src/models/EnhancedUser')

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not set in .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected to MongoDB')

  const user = await User.findOne({ email: EMAIL.toLowerCase().trim() })
  if (!user) {
    console.error(`❌ No user found with email: ${EMAIL}`)
    await mongoose.disconnect()
    process.exit(1)
  }

  user.passwordHash = await bcrypt.hash(NEW_PASSWORD, 12)
  user.refreshTokenHash = null  // Invalidates all active sessions
  await user.save()

  console.log(`✅ Password reset for: ${user.name} (${user.email}) — Role: ${user.role}`)
  console.log('   All active sessions have been invalidated.')
  await mongoose.disconnect()
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
