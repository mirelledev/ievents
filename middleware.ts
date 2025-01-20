import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const apiURL = process.env.API_BASE_URL;

  response.headers.set("Access-Control-Allow-Origin", `${apiURL}`);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (request.method === "OPTIONS") {
    return response;
  }

  return response;
}
