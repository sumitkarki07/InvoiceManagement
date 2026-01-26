'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getItemsAction(): Promise<Array<{ id: string; description: string; price: number }>> {
  await requireAuth()
  const items = await (prisma as any).item.findMany({
    orderBy: { description: 'asc' },
  })
  return items as Array<{ id: string; description: string; price: number }>
}

export async function createItemAction(formData: FormData) {
  await requireAuth()

  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)

  if (!description || isNaN(price)) {
    return { error: 'Description and price are required' }
  }

  try {
    const item = await (prisma as any).item.create({
      data: {
        description,
        price,
      },
    })

    revalidatePath('/items')
    return { success: true, item }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create item' }
  }
}

export async function updateItemAction(id: string, formData: FormData) {
  await requireAuth()

  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)

  if (!description || isNaN(price)) {
    return { error: 'Description and price are required' }
  }

  try {
    const item = await (prisma as any).item.update({
      where: { id },
      data: {
        description,
        price,
      },
    })

    revalidatePath('/items')
    return { success: true, item }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update item' }
  }
}

export async function deleteItemAction(id: string) {
  await requireAuth()

  try {
    await (prisma as any).item.delete({
      where: { id },
    })

    revalidatePath('/items')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete item' }
  }
}
