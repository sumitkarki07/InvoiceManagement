import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: await hashPassword('admin123'),
    },
  })

  console.log('Created admin user:', admin.email)

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
