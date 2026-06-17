import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth/users";
import { verifyUserPassword } from "@/lib/auth/password";
import { mustChangePasswordOnLogin } from "@/lib/auth/user-flags";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "נא למלא אימייל וסיסמה" },
        { status: 400 }
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "פרטי התחברות שגויים" },
        { status: 401 }
      );
    }

    const valid = await verifyUserPassword(user.id, password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "פרטי התחברות שגויים" },
        { status: 401 }
      );
    }

    const mustChangeOnFirstLogin = mustChangePasswordOnLogin(user.id);
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      mustChangeOnFirstLogin,
    });

    const response = NextResponse.json({
      success: true,
      mustChangeOnFirstLogin,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "שגיאת שרת. נסו שוב מאוחר יותר." },
      { status: 500 }
    );
  }
}
