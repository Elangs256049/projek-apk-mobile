import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { supabaseAdmin } from "./supabase"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken(userId)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await supabaseAdmin.from("user_sessions").insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
  })

  return token
}

export async function validateSession(token: string): Promise<string | null> {
  const { data } = await supabaseAdmin.from("user_sessions").select("user_id, expires_at").eq("token", token).single()

  if (!data || new Date(data.expires_at) < new Date()) {
    return null
  }

  return data.user_id
}
