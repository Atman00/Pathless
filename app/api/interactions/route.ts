// app/api/interactions/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId, type } = body;

    // Validasi data masuk
    if (!userId || !productId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, productId, or type.' }, 
        { status: 400 }
      );
    }

    // Catat interaksi ke database
    const interaction = await prisma.userInteraction.create({
      data: {
        user_id: Number(userId),
        product_id: Number(productId),
        interaction_type: type,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Interaction recorded. KNN Engine data updated.',
      data: interaction 
    });
  } catch (error) {
    console.error("System Error (Interactions API):", error);
    return NextResponse.json({ error: 'Internal Server Error recording interaction.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}