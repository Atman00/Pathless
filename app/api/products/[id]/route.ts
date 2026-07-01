// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// READ: Detail produk berdasarkan ID
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
      include: { category: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'ASSET_NOT_FOUND' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("System Error (Product Detail GET API):", error);
    return NextResponse.json({ error: 'CRITICAL_CORE_FAILURE' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// UPDATE: Ubah data produk via CMS Admin
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);
    const body = await request.json();
    const { name, price, category_id } = body;

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'INVALID_ID_FORMAT' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name ? name.toUpperCase() : undefined,
        price: price ? Number(price) : undefined,
        category_id: category_id ? Number(category_id) : undefined
      }
    });

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("System Error (Product Detail PUT API):", error);
    return NextResponse.json({ error: 'DATABASE_WRITE_FAILURE // PRODUCT NOT FOUND OR INVALID DATA' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Hapus produk dari sistem inventory
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'INVALID_ID_FORMAT' }, { status: 400 });
    }

    // Catatan Keamanan: Menghapus produk secara cascading bisa merusak integritas data transaksi historis.
    // Namun untuk struktur dasar CMS ini, kita eksekusi delete langsung.
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ success: true, message: 'ASSET_DELETED_FROM_INVENTORY' });
  } catch (error) {
    console.error("System Error (Product Detail DELETE API):", error);
    return NextResponse.json({ error: 'DELETE_REJECTED // PRODUCT CONTAINS TRANSACTION HISTORY OR DOES NOT EXIST' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}