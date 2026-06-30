// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// PAKSA MODE DINAMIS AGAR DATABASE TIDAK DIKUERI SAAT PROSES BUILD
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { 
        category: true 
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("System Error (Products API):", error);
    return NextResponse.json({ error: 'Internal Server Error fetching catalog.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}