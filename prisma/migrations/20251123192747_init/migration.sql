-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "destination" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "budget" INTEGER NOT NULL,
    "vibe" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "departTime" TEXT NOT NULL,
    "arriveTime" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "stopovers" INTEGER NOT NULL,
    CONSTRAINT "Flight_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricePerNight" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "location" TEXT NOT NULL,
    CONSTRAINT "Hotel_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "jsonData" TEXT NOT NULL,
    CONSTRAINT "Itinerary_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_tripId_key" ON "Itinerary"("tripId");
