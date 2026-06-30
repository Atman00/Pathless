// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'INVALID_ID_FORMAT' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        category: true 
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'ASSET_NOT_FOUND' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("System Error (Product Detail API):", error);
    return NextResponse.json({ error: 'CRITICAL_CORE_FAILURE' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}