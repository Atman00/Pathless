// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid payload. User ID and items are required.' }, { status: 400 });
    }

    // Kalkulasi total harga di backend (mencegah manipulasi harga dari sisi client)
    let totalAmount = 0;
    const transactionItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product ID ${item.productId} not found`);

      totalAmount += product.price * item.quantity;
      transactionItemsData.push({
        product_id: product.id,
        quantity: item.quantity,
        price_at_time: product.price // Syarat ketat 3NF: simpan harga historis
      });
    }

    // Tulis ke database menggunakan Prisma Interactive Transaction
    const transaction = await prisma.transaction.create({
      data: {
        user_id: Number(userId),
        total_amount: totalAmount,
        items: {
          create: transactionItemsData
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'TRANSACTION_AUTHORIZED',
      transactionId: transaction.id
    });

  } catch (error) {
    console.error("Checkout System Error:", error);
    return NextResponse.json({ error: 'Internal Server Error during checkout.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}