/**
 * DATABASE BLUEPRINT
 * ------------------
 * The application currently runs on an in-memory repository (see src/repositories).
 * Each repository implements an interface from src/repositories/types, which keeps
 * the service layer completely decoupled from the persistence layer.
 *
 * To enable PostgreSQL/Prisma later:
 *   1. Run `npm i @prisma/client && npm i -D prisma`
 *   2. `npx prisma init` and paste the schema below.
 *   3. Set DATABASE_URL + PRISMA_ENABLED=true in .env
 *   4. Create `src/repositories/prisma/*.repository.ts` implementing the same
 *      interfaces and register them in `src/repositories/index.ts`.
 *
 * No controller or service change is required.
 */
export const prismaSchemaBlueprint = /* prisma */ `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  CUSTOMER
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model User {
  id             String        @id @default(cuid())
  email          String        @unique
  passwordHash   String
  firstName      String
  lastName       String
  phone          String?
  role           Role          @default(CUSTOMER)
  isActive       Boolean       @default(true)
  refreshToken   String?
  addresses      Address[]
  orders         Order[]
  wishlist       Wishlist[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([email])
}

model Address {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  label      String
  line1      String
  line2      String?
  city       String
  state      String
  postalCode String
  country    String   @default("US")
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  description String?
  imageUrl  String?
  sortOrder Int       @default(0)
  products  Product[]
  createdAt DateTime  @default(now())
}

model Product {
  id            String         @id @default(cuid())
  name          String
  slug          String         @unique
  description   String
  longDescription String?
  categoryId    String
  category      Category       @relation(fields: [categoryId], references: [id])
  brand         String
  price         Decimal        @db.Decimal(10, 2)
  compareAtPrice Decimal?      @db.Decimal(10, 2)
  images        String[]
  sku           String         @unique
  stock         Int            @default(0)
  material      String?
  color         String?
  dimensions    Json
  weight        Decimal?       @db.Decimal(10, 2)
  featured      Boolean        @default(false)
  isActive      Boolean        @default(true)
  rating        Float          @default(0)
  reviewCount   Int            @default(0)
  tags          String[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([categoryId])
  @@index([featured])
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}

model Coupon {
  id          String     @id @default(cuid())
  code        String     @unique
  type        String     // PERCENTAGE | FIXED
  value       Decimal    @db.Decimal(10, 2)
  minSubtotal Decimal    @db.Decimal(10, 2)
  maxDiscount Decimal?   @db.Decimal(10, 2)
  expiresAt   DateTime?
  isActive    Boolean    @default(true)
  usageLimit  Int?
  usedCount   Int        @default(0)
  orders      Order[]
}

model Order {
  id             String        @id @default(cuid())
  userId         String
  user           User          @relation(fields: [userId], references: [id])
  items          OrderItem[]
  subtotal       Decimal       @db.Decimal(10, 2)
  shipping       Decimal       @db.Decimal(10, 2)
  discount       Decimal       @db.Decimal(10, 2) @default(0)
  tax            Decimal       @db.Decimal(10, 2) @default(0)
  total          Decimal       @db.Decimal(10, 2)
  couponCode     String?
  coupon         Coupon?       @relation(fields: [couponCode], references: [code])
  status         OrderStatus   @default(PENDING)
  paymentStatus  PaymentStatus @default(PENDING)
  shippingAddress Json
  billingAddress  Json
  contact        Json
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([userId])
  @@index([status])
}

model OrderItem {
  id         String  @id @default(cuid())
  orderId    String
  order      Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId  String
  product    Product @relation(fields: [productId], references: [id])
  name       String
  image      String
  sku        String
  unitPrice  Decimal @db.Decimal(10, 2)
  quantity   Int
  subtotal   Decimal @db.Decimal(10, 2)
}

model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}

model Testimonial {
  id        String   @id @default(cuid())
  name      String
  role      String?
  content   String
  rating    Int      @default(5)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}
`;
