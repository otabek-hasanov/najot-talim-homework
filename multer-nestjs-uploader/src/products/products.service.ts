import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateProductDto, UpdateProductDto } from "./dto/products.dto.js";

const ownerSelection = { select: { id: true, name: true, email: true } };
const uploadDirectory = resolve("uploads/products");

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      orderBy: { id: "asc" },
      include: { owner: ownerSelection },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { owner: ownerSelection },
    });
    if (!product) throw new NotFoundException("Product topilmadi");
    return product;
  }

  async findAllImages() {
    const products = await this.prisma.product.findMany({
      orderBy: { id: "asc" },
      select: { id: true, images: true },
    });
    return products.flatMap((product) =>
      product.images.map((url) => ({ productId: product.id, url })),
    );
  }

  async findImages(id: number) {
    const product = await this.findOne(id);
    return { productId: product.id, images: product.images };
  }

  async create(
    data: CreateProductDto,
    ownerId: number,
    files: Express.Multer.File[] = [],
  ) {
    const owner = await this.prisma.users.findUnique({
      where: { id: ownerId },
    });
    if (!owner) throw new UnauthorizedException("Foydalanuvchi topilmadi");
    const images = await this.saveImages(files);
    try {
      return await this.prisma.product.create({
        data: { title: data.title, price: data.price, ownerId, images },
        include: { owner: ownerSelection },
      });
    } catch (error) {
      await this.removeImages(images);
      throw error;
    }
  }

  async addImages(id: number, ownerId: number, files: Express.Multer.File[]) {
    const product = await this.findOne(id);
    if (product.ownerId !== ownerId)
      throw new ForbiddenException("Faqat product egasi rasm yuklay oladi");
    if (!files.length)
      throw new BadRequestException("Kamida bitta rasm yuboring");
    const images = await this.saveImages(files);
    try {
      return await this.prisma.product.update({
        where: { id },
        data: { images: { push: images } },
        include: { owner: ownerSelection },
      });
    } catch (error) {
      await this.removeImages(images);
      throw error;
    }
  }

  async update(
    id: number,
    ownerId: number,
    data: UpdateProductDto,
    files: Express.Multer.File[] = [],
  ) {
    const product = await this.findOne(id);
    if (product.ownerId !== ownerId)
      throw new ForbiddenException("Faqat product egasi o'zgartira oladi");
    const images = await this.saveImages(files);
    try {
      const updated = await this.prisma.product.update({
        where: { id },
        data: {
          title: data.title,
          price: data.price,
          images: images.length ? images : undefined,
        },
        include: { owner: ownerSelection },
      });
      if (images.length) await this.removeImages(product.images);
      return updated;
    } catch (error) {
      await this.removeImages(images);
      throw error;
    }
  }

  private imageExtension(file: Express.Multer.File) {
    const bytes = file.buffer;
    if (
      file.mimetype === "image/png" &&
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      return "png";
    if (
      file.mimetype === "image/jpeg" &&
      bytes[0] === 255 &&
      bytes[1] === 216 &&
      bytes[2] === 255
    )
      return "jpg";
    if (
      file.mimetype === "image/webp" &&
      bytes.subarray(0, 4).toString() === "RIFF" &&
      bytes.subarray(8, 12).toString() === "WEBP"
    )
      return "webp";
    if (
      file.mimetype === "image/gif" &&
      ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString())
    )
      return "gif";
    throw new BadRequestException(
      "Faqat PNG, JPEG, WEBP yoki GIF rasm yuklang",
    );
  }

  private async saveImages(files: Express.Multer.File[]) {
    const prepared = files.map((file) => ({
      file,
      name: `${randomUUID()}.${this.imageExtension(file)}`,
    }));
    if (!prepared.length) return [];
    await mkdir(uploadDirectory, { recursive: true });
    const images: string[] = [];
    try {
      for (const { file, name } of prepared) {
        const url = `/uploads/products/${name}`;
        images.push(url);
        await writeFile(resolve(uploadDirectory, name), file.buffer, {
          flag: "wx",
        });
      }
      return images;
    } catch (error) {
      await this.removeImages(images);
      throw error;
    }
  }

  private async removeImages(images: string[]) {
    await Promise.allSettled(
      images.map((url) => unlink(resolve(uploadDirectory, basename(url)))),
    );
  }
}
