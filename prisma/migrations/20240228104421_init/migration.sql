-- CreateEnum
CREATE TYPE "auction_status" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "bid_status" AS ENUM ('OUTBID', 'WINNING', 'WON');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startingPrice" INTEGER NOT NULL,
    "closedPrice" INTEGER,
    "status" "auction_status" NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "bid_status" NOT NULL,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_bids" (
    "id" TEXT NOT NULL,
    "incrementAmount" INTEGER NOT NULL,
    "maxAmount" INTEGER NOT NULL,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auto_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_bids" ADD CONSTRAINT "auto_bids_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_bids" ADD CONSTRAINT "auto_bids_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
