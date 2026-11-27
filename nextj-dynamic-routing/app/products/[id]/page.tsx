import Link from "next/link";
import { notFound } from "next/navigation";

type Product = {
    id: number;
    name: string;
    price: number;
}

async function getProduct(id: string): Promise<Product | null> {
    const res = await fetch(`http://localhost:3000/api/products/${id}`)
    if (!res.ok) return null
    return res.json()
}

export default async function ProductPage({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const product = await getProduct(id)

    if (!product) notFound()

    return (
        <div className="flex flex-col gap-3">
            <Link href="/products" className="text-sm underline">
                ← Orqaga
            </Link>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p>ID: {product.id}</p>
            <p>Narxi: ${product.price}</p>
        </div>
    );
}
