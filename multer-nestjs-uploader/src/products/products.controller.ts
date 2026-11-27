import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { ProductsService } from "./products.service.js";
import { CreateProductDto, UpdateProductDto } from "./dto/products.dto.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { RoleGuard } from "../auth/guards/role.guard.js";
import { Role } from "../auth/guards/role.decorator.js";

const imageUpload = () =>
  FilesInterceptor("images", 5, {
    limits: { fileSize: 5 * 1024 * 1024, files: 5, fields: 2, parts: 7 },
  });
const imagesSchema = {
  type: "array" as const,
  maxItems: 5,
  items: { type: "string" as const, format: "binary" },
};

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get("images")
  findAllImages() {
    return this.productsService.findAllImages();
  }

  @Get(":id/images")
  findImages(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.findImages(id);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["title", "price"],
      properties: {
        title: { type: "string" },
        price: { type: "number", minimum: 0 },
        images: imagesSchema,
      },
    },
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role("SELLER")
  @UseInterceptors(imageUpload())
  @Post()
  create(
    @Body() body: CreateProductDto,
    @Req() req: { user: { id: number } },
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.productsService.create(body, req.user.id, files);
  }

  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        price: { type: "number", minimum: 0 },
        images: imagesSchema,
      },
    },
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role("SELLER")
  @UseInterceptors(imageUpload())
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
    @Req() req: { user: { id: number } },
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.productsService.update(id, req.user.id, body, files);
  }

  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["images"],
      properties: { images: imagesSchema },
    },
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role("SELLER")
  @UseInterceptors(imageUpload())
  @Post(":id/images")
  addImages(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { user: { id: number } },
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.productsService.addImages(id, req.user.id, files);
  }
}
