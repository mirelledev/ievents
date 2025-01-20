import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    host: "smtp.gmail.com",
    port: 456,
    secure: true,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("E-mail enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
};
// eslint-disable-next-line
export async function GET(req: Request) {
  try {
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        date: {
          lte: now,
        },
        sentEmail: false,
      },
    });

    if (events.length === 0) {
      return NextResponse.json({
        message: "Nenhum evento pendente para envio de e-mails.",
      });
    }

    for (const event of events) {
      const user = await prisma.user.findUnique({
        where: { id: event.userId },
      });

      if (user) {
        const subject = `Lembrete do seu evento: ${event.title}`;
        const text = `Olá ${user.firstName},\n\nSeu evento "${
          event.title
        }" está chegando!\n\nDescrição: ${event.description}\nLocalização: ${
          event.locate
        }\nData: ${new Date(event.date).toLocaleDateString(
          "pt-BR"
        )}\nHorário: ${event.time}`;

        await sendEmail(user.email, subject, text);

        await prisma.event.update({
          where: { id: event.id },
          data: { sentEmail: true },
        });
      }
    }

    return NextResponse.json({
      message: "E-mails enviados com sucesso!",
    });
    // eslint-disable-next-line
  } catch (error: any) {
    console.error("Erro ao enviar e-mails:", error);
    return NextResponse.json(
      { error: "Erro ao enviar e-mails.", message: error.message },
      { status: 500 }
    );
  }
}
