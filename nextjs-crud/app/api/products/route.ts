import { products } from "./data";

export async function GET(request: Request) {
    const { searchParams} = new URL(request.url)
    const name = searchParams.get("name") || ""
    const minPrice = Number(searchParams.get("min")) || 0
    const maxPrice = Number(searchParams.get("max")) || Infinity

    const filteredproducts = products.filter((product) => {
        const searchMatched = product.name.toLowerCase().includes(name.toLowerCase())
        const priceMatched = product.price >= minPrice && product.price <= maxPrice

        return searchMatched && priceMatched
    })
    return Response.json(filteredproducts)
}

export async function POST(request: Request) {
    const body = await request.json()

    products.push(body)

    return Response.json({
        message: "Product qo'shildi",
        code: 201
    })
}