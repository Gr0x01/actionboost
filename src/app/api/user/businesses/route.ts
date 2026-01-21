import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getUserBusinesses } from "@/lib/business";

/**
 * GET /api/user/businesses
 * Returns all businesses for the authenticated user
 */
export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser?.publicUserId) {
      // Return empty array for unauthenticated users
      return NextResponse.json({ businesses: [] });
    }

    const businesses = await getUserBusinesses(sessionUser.publicUserId);
    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("[API] Failed to fetch businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}
