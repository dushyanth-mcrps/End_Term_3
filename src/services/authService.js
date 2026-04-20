import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase'

function normalizeCredentials(credentials) {
  const email = String(credentials?.email ?? '').trim()
  const password = String(credentials?.password ?? '').trim()

  if (!email || !password) {
    throw new Error('Email and password are required.')
  }

  return { email, password }
}

export async function signupUser(credentials) {
  const { email, password } = normalizeCredentials(credentials)
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function loginUser(credentials) {
  const { email, password } = normalizeCredentials(credentials)
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function logoutUser() {
  await signOut(auth)
}