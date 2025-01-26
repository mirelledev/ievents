"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  // eslint-disable-next-line
  const { data: session, status } = useSession();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/portal");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="items-center justify-center">
        <div className="flex flex-col mt-[400px]">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    setLoading(true);
    e.preventDefault();

    if (email === "" || password === "") {
      setError("Preencha todos os campos para fazer login.");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Digite um e-mail válido.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setLoading(false);
      setError("Credenciais Erradas.");
    } else {
      router.push("/portal");
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="flex p-3 bg-black rounded-lg border-2  w-[500px] mt-10 flex-col items-center text-center">
      <h1 className="text-2xl font-bold mt-2">entrar na conta</h1>
      <p className="text-neutral-400 px-3 mb-4">
        após a realizaçao do login, será possível utilizar as funcionalidades do
        site
      </p>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <input
          className=" bg-neutral-800  border-2 mt-2 mb-2 w-[300px] p-3 rounded-md focus:outline-none"
          type="email"
          placeholder="E-mail"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          value={email}
        />
        <input
          className="bg-neutral-800 border-2 mt-2 p-3 mb-2 rounded-md focus:outline-none"
          type="password"
          placeholder="Senha"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          value={password}
        />
        {loading ? (
          <Button disabled>
            <Loader2 className="animate-spin" />
            Aguarde..
          </Button>
        ) : (
          <Button
            className="p-3 mb-2 border-2 mt-5 bg-white hover:text-white text-black rounded-xl hover:scale-105 transition-transform duration-200"
            type="submit"
          >
            Entrar
          </Button>
        )}
      </form>
      {error && <p className="text-red-500 mt-2 mb-2 font-bold">{error}</p>}
      <p>
        Ainda nao possui uma conta?{" "}
        <Link href="/register">
          <span className="font-bold">Registrar</span>
        </Link>{" "}
      </p>
    </div>
  );
}
