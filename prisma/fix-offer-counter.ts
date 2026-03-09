import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const year = new Date().getFullYear()

  // You currently have 3 offers and want the next to be number 4,
  // so we set the counter to 3 for the current year.
  const targetCount = 3

  const counter = await prisma.counter.upsert({
    where: {
      type_year: {
        type: 'OFFER',
        year,
      },
    },
    create: {
      type: 'OFFER',
      year,
      count: targetCount,
    },
    update: {
      count: targetCount,
    },
  })

  console.log(
    `Offer counter fixed for year ${year}. type=${counter.type}, count=${counter.count}`
  )
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

