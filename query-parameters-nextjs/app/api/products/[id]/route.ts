import { products } from "../data";

export async function GET(request: Request, { params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const product = products.find((p) => p.id === Number(id))

    if (!product) {
        return Response.json({ message: "Product topilmadi" }, { status: 404 })
    }

    return Response.json(product)
}

export async function DELETE(request: Request, { params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const index = products.findIndex((p) => p.id === Number(id))

    if (index === -1) {
        return Response.json({ message: "Product topilmadi" }, { status: 404 })
    }

    products.splice(index, 1)

    return Response.json({ message: "Product o'chirildi" })
}
