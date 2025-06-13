import { type NextRequest, NextResponse } from "next/server"
import { validateSession } from "./auth"

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = await validateSession(token)
  if (!userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  return userId
}
