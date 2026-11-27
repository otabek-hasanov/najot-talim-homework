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
