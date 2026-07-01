// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("System Error (Categories GET API):", error);
    return NextResponse.json({ error: 'Internal Server Error fetching categories.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}