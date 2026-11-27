import Link from "next/link";

type Product = {
    id: number;
    name: string;
    price: number;
}

async function getProducts(name: string, min: string, max: string): Promise<Product[]> {
    const params = new URLSearchParams()
    if (name) params.append("name", name)
    if (min) params.append("min", min)
    if (max) params.append("max", max)
    const res = await fetch(`http://localhost:3000/api/products?${params.toString()}`)
    return res.json()
}

export default async function ProductsPage({ searchParams }: {
    searchParams: Promise<{
        name?: string;
        min?: string;
        max?: string;
    }>
}) {
    const { name = "", min = "", max = "" } = await searchParams;
    const products = await getProducts(name, min, max);

    return (


        
        <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold">Productlar</h1>
            <Link href="/products/add" className="underline">
                + Product qo'shish
            </Link>
            <form className="flex gap-2">
                <input name="name" defaultValue={name} placeholder="Nomi" className="border p-2" />
                <input name="min" type="number" defaultValue={min} placeholder="Min narx" className="border p-2" />
                <input name="max" type="number" defaultValue={max} placeholder="Max narx" className="border p-2" />
                <button type="submit" className="border px-4">
                    Qidirish
                </button>
            </form>
            {products.length === 0 && <p>Product topilmadi</p>}
            {products.map((product) => (
                <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="border p-4"
                >
                    <p className="font-semibold">{product.name}</p>
                    <p>${product.price}</p>
                </Link>
            ))}
        </div>
    );
}
