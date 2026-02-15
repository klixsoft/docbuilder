import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return NextResponse.json({ isLoggedIn: false }, { status: 401 });
    }
    return NextResponse.json(session);
}
