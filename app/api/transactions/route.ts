// app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      },
      orderBy: {
        transaction_date: 'desc'
      }
    });
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("System Error (Transactions API):", error);
    return NextResponse.json({ error: 'Internal Server Error fetching transactions.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}