import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import { validateToken } from "@/app/utils/auth";

const prisma = new PrismaClient();
// eslint-disable-next-line
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Token nao fornecido" },
        { status: 401 }
      );
    }

    try {
      const decodedToken = await validateToken(token);
      if (!decodedToken) {
        console.log("Token inválido. Dados decodificados:", decodedToken);
      }
    } catch (error) {
      return NextResponse.json(
        { message: "Token inválido ou expirado", error },
        { status: 401 }
      );
    }

    if (!session || !session?.user) {
      return NextResponse.json(
        {
          message: "Usuario nao autenticado",
        },
        { status: 401 }
      );
    }

    const events = await prisma.event.findMany({
      where: { userId: session.user.id },
    });

    const sortedEvents = events.sort((a, b) => {
      const now = new Date();

      const dateA = new Date(a.date).setHours(0, 0, 0, 0);
      const dateB = new Date(b.date).setHours(0, 0, 0, 0);

      return (
        Math.abs(Number(dateA) - Number(now)) -
        Math.abs(Number(dateB) - Number(now))
      );
    });

    return NextResponse.json({ events: sortedEvents }, { status: 200 });
  } catch (error) {
    console.error("Erro ao processar requisição:", error); // Log do erro
    return NextResponse.json(
      { message: "Ocorreu um erro.", error },
      { status: 500 }
    );
  }
}
