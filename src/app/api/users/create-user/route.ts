import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const apiURL = process.env.API_BASE_URL;
export async function POST(req: Request) {
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", `${apiURL}`);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body;
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Todos os campos sao obrigatorios" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "E-mail já utilizado, utilize outro" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    const token = await new SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    return NextResponse.json(
      {
        message: "Usuario criado com sucesso!",
        user: { id: user.id, fistName: user.firstName, email: user.email },
        token,
      },
      { status: 201 }
    );
    // eslint-disable-next-line
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro ao criar usuário.", error: error.message },
      { status: 500 }
    );
  }
}
