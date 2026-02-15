import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
    userId?: string;
    email?: string;
    name?: string;
    role?: string;
    isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
    isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
    password: process.env.AUTH_SECRET_KEY || "f3b9e5cd63acc57ab0fe4fb30348b65046c8fe0e2865b54ce1fbc5fda58d2d5915",
    cookieName: "docsbuilder_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
};

export async function getSession() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn) {
        session.userId = undefined;
        session.email = undefined;
        session.name = undefined;
        session.role = undefined;
        session.isLoggedIn = false;
    }

    return session;
}
