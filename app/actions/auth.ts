'use server'

import { login as authLogin, deleteSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const result = await authLogin(email, password)
  if (!result.success) {
    return { error: result.error }
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  await deleteSession()
  redirect('/login')
}
