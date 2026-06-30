// app/api/recommendations/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get('userId'));
    const k = Number(searchParams.get('k')) || 3;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for algorithms to run.' }, { status: 400 });
    }

    const userInteractions = await prisma.userInteraction.findMany({
      where: { user_id: userId },
      include: { product: true }
    });

    const allProducts = await prisma.product.findMany({
      include: { category: true }
    });

    if (userInteractions.length === 0) {
      return NextResponse.json(allProducts.slice(0, k));
    }

    const interactedProductIds = userInteractions.map(ui => ui.product_id);
    const interactedProducts = userInteractions.map(ui => ui.product);

    const avgPrice = interactedProducts.reduce((sum, p) => sum + p.price, 0) / interactedProducts.length;
    
    const categoryCount: Record<number, number> = {};
    let dominantCategory = interactedProducts[0].category_id;
    let maxCount = 0;

    interactedProducts.forEach(p => {
      categoryCount[p.category_id] = (categoryCount[p.category_id] || 0) + 1;
      if (categoryCount[p.category_id] > maxCount) {
        maxCount = categoryCount[p.category_id];
        dominantCategory = p.category_id;
      }
    });

    const maxPrice = Math.max(...allProducts.map(p => p.price));

    const candidates = allProducts.filter(p => !interactedProductIds.includes(p.id));
    
    const distances = candidates.map(product => {
      const normTargetPrice = avgPrice / maxPrice;
      const normProductPrice = product.price / maxPrice;
      const priceDiff = normTargetPrice - normProductPrice;
      const categoryDiff = product.category_id === dominantCategory ? 0 : 1;
      const distance = Math.sqrt(Math.pow(priceDiff, 2) + Math.pow(categoryDiff, 2));

      return { product, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);
    const recommendations = distances.slice(0, k).map(d => d.product);

    return NextResponse.json(recommendations);

  } catch (error) {
    console.error("Engine Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}