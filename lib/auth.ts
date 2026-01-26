import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionId) return null

  // Verify user still exists
  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true },
  })

  return user?.id || null
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<string> {
  const userId = await getSession()
  if (!userId) {
    redirect('/login')
  }
  return userId
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return { success: false, error: 'Invalid email or password' }
  }

  await createSession(user.id)
  return { success: true }
}
