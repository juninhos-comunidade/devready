import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const curriculum = await prisma.curriculum.findUnique({
        where: { userId: session.user.id },
        select: { status: true },
    });

    if (!curriculum) {
        return NextResponse.json({error: "Curriculo não encontrado"}, {status: 404})
    }

    return NextResponse.json({status: curriculum.status})
}