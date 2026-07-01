// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// READ: Ambil semua produk untuk katalog dan CMS
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
    console.error("System Error (Products GET API):", error);
    return NextResponse.json({ error: 'Internal Server Error fetching catalog.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// CREATE: Tambah produk baru via CMS Admin
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, category_id } = body;

    if (!name || !price || !category_id) {
      return NextResponse.json({ error: 'INCOMPLETE_PAYLOAD // NAME, PRICE, AND CATEGORY_ID REQUIRED' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name.toUpperCase(), // Sinkronisasi gaya huruf kapital Pathless
        price: Number(price),
        category_id: Number(category_id)
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    console.error("System Error (Products POST API):", error);
    return NextResponse.json({ error: 'Internal Server Error creating product.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}