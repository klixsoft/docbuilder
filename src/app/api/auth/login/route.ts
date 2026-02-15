import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        const session = await getSession();
        session.userId = user.id;
        session.email = user.email;
        session.name = user.name || "";
        session.role = user.role;
        session.isLoggedIn = true;
        await session.save();

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
