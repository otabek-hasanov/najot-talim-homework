"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: Date.now(),
                name,
                price: Number(price)
            })
        })

        router.push("/products")
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold">Product qo'shish</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nomi"
                    className="border p-2"
                    required
                />
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Narxi"
                    className="border p-2"
                    required
                />
                <button type="submit" className="border p-2">
                    Qo'shish
                </button>
            </form>
        </div>
    );
}
