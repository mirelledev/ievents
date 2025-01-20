import { authOptions } from "../../../../../lib/authOptions";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { validateToken } from "@/app/utils/auth";

const prisma = new PrismaClient();
const apiURL = process.env.API_BASE_URL;

export async function PUT(req: Request) {
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

  const session = await getServerSession(authOptions);

  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Token nao fornecido" }, { status: 401 });
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
        message: "usuario nao autenticado",
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, ...updateFields } = body;
    if (!id) {
      return NextResponse.json(
        {
          message: "o id é obrigatorio",
        },
        {
          status: 400,
        }
      );
    }

    const updatedItem = await prisma.event.update({
      where: { id: id },
      data: updateFields,
    });

    return NextResponse.json(
      {
        message: "Recurso atualizado com sucesso!",
        data: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "ocorreu um erro,",
        error,
      },
      { status: 500 }
    );
  }
}
