import { statusCode } from "@/constant/response";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") as string;
  if (!id) {
    return NextResponse.json({
      message: "id is required",
      status: statusCode.BAD_REQUEST,
    });
  }

  try {
    const result = await fetch(
      `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${id}`
    );
    const dataBuffer = new Uint8Array(await result.arrayBuffer());

    if (!dataBuffer) {
      return NextResponse.json({
        message: "user not found",
        status: statusCode.NOTFOUND,
      });
    }

    return new Response(dataBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({
      message: "Internal Server Error",
      status: statusCode.INTERNT_ERROR,
    });
  }
}
