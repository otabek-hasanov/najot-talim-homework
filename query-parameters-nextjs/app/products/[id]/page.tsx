"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Product = {
    id: number;
    name: string;
    price: number;
}

export default function ProductPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [product, setProduct] = useState<Product | null>(null)

    useEffect(() => {
        fetch(`/api/products/${id}`)
            .then((res) => res.json())
            .then((data) => setProduct(data))
    }, [id])

    async function handleDelete() {
        await fetch(`/api/products/${id}`, { method: "DELETE" })
        router.push("/products")
        router.refresh()
    }

    if (!product) return <p>Yuklanmoqda...</p>

    return (
        <div className="flex flex-col gap-3">
            <Link href="/products" className="text-sm underline">
                ← Orqaga
            </Link>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p>ID: {product.id}</p>
            <p>Narxi: ${product.price}</p>
            <button onClick={handleDelete} className="border p-2 w-fit">
                O'chirish
            </button>
        </div>
    );
}
