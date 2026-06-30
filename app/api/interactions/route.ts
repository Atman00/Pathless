// app/api/interactions/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId, type } = body;

    if (!userId || !productId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, productId, or type.' }, 
        { status: 400 }
      );
    }

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