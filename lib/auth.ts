import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE_NAME = 'admin_session'

/** In production, SESSION_SECRET must be set in env (e.g. Vercel). */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('SESSION_SECRET is required in production. Set it in Vercel Environment Variables.')
  }
  return secret || 'change-me-in-development-only'
}

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

/** Comma-separated list of allowed admin emails. If set, only these can log in. */
function getAllowedAdminEmails(): string[] | null {
  const raw = process.env.ALLOWED_ADMIN_EMAILS
  if (!raw || raw.trim() === '') return null
  return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // Enforce SESSION_SECRET in production
  getSessionSecret()

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    return { success: false, error: 'Invalid email or password' }
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }

  // Production: restrict to allowed admin list if set
  const allowed = getAllowedAdminEmails()
  if (allowed !== null && !allowed.includes(normalizedEmail)) {
    return { success: false, error: 'Access denied. This account is not an admin.' }
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return { success: false, error: 'Invalid email or password' }
  }

  await createSession(user.id)
  return { success: true }
}
