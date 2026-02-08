import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function main() {
  // Admin: use real credentials from env in production (e.g. Vercel)
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminEmail && adminPassword) {
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: await hashPassword(adminPassword) },
      create: {
        email: adminEmail,
        password: await hashPassword(adminPassword),
      },
    })
    console.log('Created/updated admin user:', admin.email)
  } else if (process.env.NODE_ENV !== 'production') {
    // Development fallback: default admin (do not use in production)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: await hashPassword('admin123'),
      },
    })
    console.log('Created dev admin user:', admin.email)
  } else {
    console.warn(
      'No ADMIN_EMAIL/ADMIN_PASSWORD set. Set them in Vercel Environment Variables, then run: npm run db:seed'
    )
  }

  // Reset invoice and offer number counters for fresh start (real use)
  const deletedCounters = await prisma.counter.deleteMany({})
  console.log('Reset document counters (invoice/offer numbers will start from 1):', deletedCounters.count, 'counter(s) removed')

  // Create sample client
  const client = await prisma.client.upsert({
    where: { id: 'sample-client-1' },
    update: {},
    create: {
      id: 'sample-client-1',
      name: 'Sample Client',
      email: 'contact@sampleclient.com',
      phone: '+31 20 1234567',
      address: '123 Main Street',
      street: '123 Main Street',
      city: 'Amsterdam',
      zipCode: '1000 AA',
      postcode: '1000 AA',
      country: 'Netherlands',
      vatNumber: 'NL123456789B01',
    },
  })

  console.log('Created sample client:', client.name)

  // Create sample items
  const items = await Promise.all([
    prisma.item.upsert({
      where: { id: 'item-cement' },
      update: {},
      create: {
        id: 'item-cement',
        description: 'Portland Cement (50kg bag)',
        price: 450,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-sand' },
      update: {},
      create: {
        id: 'item-sand',
        description: 'Sand (per cubic meter)',
        price: 1200,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-labor' },
      update: {},
      create: {
        id: 'item-labor',
        description: 'Labor (per day)',
        price: 2500,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-tiles' },
      update: {},
      create: {
        id: 'item-tiles',
        description: 'Floor Tiles (per sq meter)',
        price: 800,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-paint' },
      update: {},
      create: {
        id: 'item-paint',
        description: 'Interior Paint (per liter)',
        price: 350,
      },
    }),
  ])

  console.log(`Created ${items.length} sample items`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
