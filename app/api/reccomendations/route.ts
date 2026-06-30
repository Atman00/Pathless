// app/api/recommendations/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get('userId'));
    const k = Number(searchParams.get('k')) || 3;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for algorithms to run.' }, { status: 400 });
    }

    // 1. Ambil data interaksi user & produk yang pernah diinteraksi
    const userInteractions = await prisma.userInteraction.findMany({
      where: { user_id: userId },
      include: { product: true }
    });

    // 2. Ambil semua katalog produk untuk dikalkulasi
    const allProducts = await prisma.product.findMany({
      include: { category: true }
    });

    if (userInteractions.length === 0) {
      // Fallback: Jika tidak ada interaksi, kembalikan produk teratas
      return NextResponse.json(allProducts.slice(0, k));
    }

    const interactedProductIds = userInteractions.map(ui => ui.product_id);
    const interactedProducts = userInteractions.map(ui => ui.product);

    // 3. Bangun Profil Preferensi User (Centroid)
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

    // 4. Proses K-Nearest Neighbors (Euclidean Distance)
    const candidates = allProducts.filter(p => !interactedProductIds.includes(p.id));
    
    const distances = candidates.map(product => {
      // Normalisasi harga (0 - 1)
      const normTargetPrice = avgPrice / maxPrice;
      const normProductPrice = product.price / maxPrice;
      const priceDiff = normTargetPrice - normProductPrice;

      // Bobot Kategori (0 jika identik, 1 jika berbeda)
      const categoryDiff = product.category_id === dominantCategory ? 0 : 1;

      // Jarak Euclidean
      const distance = Math.sqrt(Math.pow(priceDiff, 2) + Math.pow(categoryDiff, 2));

      return { product, distance };
    });

    // 5. Urutkan berdasarkan jarak terdekat dan potong sebanyak K
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