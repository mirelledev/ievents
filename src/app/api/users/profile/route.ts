import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import { validateToken } from "@/app/utils/auth";

const prisma = new PrismaClient();
const apiURL = process.env.API_BASE_URL;
// eslint-disable-next-line
export async function GET(req: Request) {
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
    // Acessa a sessão atual
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
        { message: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Busca as informações do usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }, // Usa o userId da sessão
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Retorna os dados do usuário
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Erro ao processar requisição:", error); // Log do erro
    return NextResponse.json(
      { message: "Ocorreu um erro.", error },
      { status: 500 }
    );
  }
}
