import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import { validateToken } from "@/app/utils/auth";

const prisma = new PrismaClient();
// eslint-disable-next-line
export async function DELETE(req: Request) {
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
      { message: "Usuario nao autenticado" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "Usuario nao encontrado em nosso banco de dados",
      },
      { status: 404 }
    );
  }

  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json(
      {
        message: "id nao foi enviado",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const event = await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Evento deletado com sucesso", event },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao deletar evento", error },
      { status: 500 }
    );
  }
}
