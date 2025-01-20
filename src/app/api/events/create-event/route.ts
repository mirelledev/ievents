import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import { validateToken } from "@/app/utils/auth";

const prisma = new PrismaClient();
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, description, locate, date, time } = body;
    if (!title || !description || !locate || !date || !time) {
      return NextResponse.json(
        { message: "Todos os campos sao obrigatorios" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { message: "Digite uma data válida" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        locate,
        date: parsedDate.toISOString(),
        time,
        userId: user.id,
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          message: "Ocorreu um erro ao criar evento",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "evento criado com sucesso",
        event: {
          id: event.id,
          date: event.date,
          time: event.time,
          locate: event.locate,
          description: event.description,
          title: event.title,
          userId: user.id,
        },
      },
      { status: 200 }
    );
    // eslint-disable-next-line
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: "Erro ao criar evento.", error: error.message },
      { status: 500 }
    );
  }
}
