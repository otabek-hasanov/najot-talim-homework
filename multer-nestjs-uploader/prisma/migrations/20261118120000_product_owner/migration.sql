ALTER TABLE "Product" ADD COLUMN "ownerId" INTEGER;

INSERT INTO "Users" ("name", "email", "password", "role")
SELECT 'Demo Seller', 'phones.demo@example.com', '!', 'SELLER'::"Role"
WHERE EXISTS (SELECT 1 FROM "Product")
ON CONFLICT ("email") DO NOTHING;

UPDATE "Product"
SET "ownerId" = (SELECT "id" FROM "Users" WHERE "email" = 'phones.demo@example.com')
WHERE "ownerId" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "ownerId" SET NOT NULL;

CREATE INDEX "Product_ownerId_idx" ON "Product"("ownerId");

ALTER TABLE "Product" ADD CONSTRAINT "Product_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
