"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";

export default function RegisterPage() {
  // eslint-disable-next-line
  const { data: session, status } = useSession();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiURL = process.env.API_BASE_URL;

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/portal");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Carregando..</p>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (confirmPassword !== password) {
      return;
    }

    try {
      const response = await fetch(`${apiURL}/api/users/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("credenciais erradas");
      } else {
        router.push("/portal");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex p-3 bg-black rounded-lg border-2   w-[500px] mt-20 flex-col items-center text-center">
      <h1 className="text-2xl mb-2 font-bold">realize seu cadastro!</h1>
      <p className="mb-3 px-4 text-neutral-400">
        após seu cadastro, será possivel utilizar as funcionalidades do site!
      </p>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <input
          className="border-2 mt-2 bg-neutral-800 p-3 rounded-md focus:outline-none w-[300px] mb-2"
          type="text"
          placeholder="Primeiro nome"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFirstName(e.target.value)
          }
          value={firstName}
        />
        <input
          className="bg-neutral-800 border-2 mt-2 p-3 rounded-md focus:outline-none w-[300px] mb-2"
          type="text"
          placeholder="Segundo nome"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setLastName(e.target.value)
          }
          value={lastName}
        />
        <input
          className="bg-neutral-800 border-2 mt-2 p-3 rounded-md focus:outline-none w-[300px] mb-2"
          type="text"
          placeholder="E-mail"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          value={email}
        />
        <p className="text-neutral-400 w-[300px]">
          Esse e-mail será utilizado para receber as notificacoes
        </p>
        <input
          className="bg-neutral-800 border-2 mt-2 p-3 mb-2 rounded-md focus:outline-none"
          type="password"
          placeholder="Senha"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          value={password}
        />
        <input
          className="bg-neutral-800 border-2 mt-2 p-3 mb-2 rounded-md focus:outline-none"
          type="password"
          placeholder="Confirme sua senha"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
          value={confirmPassword}
        />
        <button
          className="p-3 mb-2 border-2 mt-5 bg-black text-white rounded-xl hover:scale-105 transition-transform duration-200"
          type="submit"
        >
          Cadastro
        </button>
      </form>
      {error && <p className=" text-red-500 p-2 rounded-md">{error}</p>}
      <p>
        Já tem uma conta?{" "}
        <span className="font-bold">
          <Link href="/login">Entrar</Link>
        </span>
      </p>
    </div>
  );
}
