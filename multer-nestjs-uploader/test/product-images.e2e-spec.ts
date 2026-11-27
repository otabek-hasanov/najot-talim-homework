import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { basename, resolve } from "node:path";
import request from "supertest";
import { AppModule } from "../src/app.module.js";
import { AuthService } from "../src/auth/auth.service.js";
import { PrismaService } from "../src/prisma/prisma.service.js";

describe("Product images (e2e)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const ownerIds: number[] = [];
  const tokens: string[] = [];
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64",
  );

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication<NestExpressApplication>();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useStaticAssets(resolve("uploads"), { prefix: "/uploads/" });
    await app.init();
    prisma = app.get(PrismaService);
    for (const role of ["SELLER", "SELLER", "USER"] as const) {
      const user = await prisma.users.create({
        data: {
          name: "Upload test",
          email: `${randomUUID()}@example.com`,
          password: "!",
          role,
        },
      });
      ownerIds.push(user.id);
      tokens.push(app.get(AuthService).generateToken(user));
    }
  });

  afterAll(async () => {
    if (prisma) {
      const products = await prisma.product.findMany({
        where: { ownerId: { in: ownerIds } },
      });
      await prisma.product.deleteMany({ where: { ownerId: { in: ownerIds } } });
      await prisma.users.deleteMany({ where: { id: { in: ownerIds } } });
      await Promise.allSettled(
        products.flatMap((product) =>
          product.images.map((url) =>
            unlink(resolve("uploads/products", basename(url))),
          ),
        ),
      );
    }
    await app?.close();
  });

  it("uploads, lists and retrieves images, enforces ownership and rejects invalid uploads", async () => {
    const server = app.getHttpServer();
    const created = await request(server)
      .post("/products")
      .auth(tokens[0], { type: "bearer" })
      .field("title", "Upload test phone")
      .field("price", "599")
      .attach("images", png, {
        filename: "phone.png",
        contentType: "image/png",
      })
      .expect(201);
    const id = created.body.id as number;
    expect(created.body.ownerId).toBe(ownerIds[0]);
    expect(created.body.images).toHaveLength(1);
    expect(created.body.owner.password).toBeUndefined();
    const image = await request(server).get(created.body.images[0]).expect(200);
    expect(image.headers["content-type"]).toMatch(/image\/png/);
    expect(Buffer.compare(image.body, png)).toBe(0);

    const detail = await request(server).get(`/products/${id}`).expect(200);
    expect(detail.body.images).toEqual(created.body.images);
    const all = await request(server).get("/products").expect(200);
    expect(
      all.body.find((product: { id: number }) => product.id === id).images,
    ).toEqual(created.body.images);
    const images = await request(server).get("/products/images").expect(200);
    expect(images.body).toContainEqual({
      productId: id,
      url: created.body.images[0],
    });
    await request(server)
      .get(`/products/${id}/images`)
      .expect(200, { productId: id, images: created.body.images });

    const added = await request(server)
      .post(`/products/${id}/images`)
      .auth(tokens[0], { type: "bearer" })
      .attach("images", png, {
        filename: "second.png",
        contentType: "image/png",
      })
      .expect(201);
    expect(added.body.images).toHaveLength(2);
    await request(server)
      .post(`/products/${id}/images`)
      .auth(tokens[1], { type: "bearer" })
      .attach("images", png, "other.png")
      .expect(403);
    await request(server)
      .post(`/products/${id}/images`)
      .auth(tokens[2], { type: "bearer" })
      .attach("images", png, "user.png")
      .expect(403);
    await request(server)
      .post(`/products/${id}/images`)
      .attach("images", png, "anonymous.png")
      .expect(401);
    await request(server)
      .post(`/products/${id}/images`)
      .auth(tokens[0], { type: "bearer" })
      .expect(400);
    await request(server)
      .post(`/products/${id}/images`)
      .auth(tokens[0], { type: "bearer" })
      .attach("images", Buffer.from("fake image"), {
        filename: "fake.png",
        contentType: "image/png",
      })
      .expect(400);
    await request(server)
      .post(`/products/${id}/images`)
      .auth(tokens[0], { type: "bearer" })
      .attach("images", Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: "large.png",
        contentType: "image/png",
      })
      .expect(413);
    const tooMany = request(server)
      .post(`/products/${id}/images`)
      .auth(tokens[0], { type: "bearer" });
    for (let index = 0; index < 6; index++)
      tooMany.attach("images", png, `phone-${index}.png`);
    await tooMany.expect(400);
    await request(server).get("/products/2147483647").expect(404);
    await request(server).get("/products/2147483647/images").expect(404);
    await request(server).get("/products/invalid").expect(400);
    const unchanged = await request(server).get(`/products/${id}`).expect(200);
    expect(unchanged.body.images).toHaveLength(2);
  }, 30000);
});
