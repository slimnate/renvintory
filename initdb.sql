PRAGMA foreign_keys = ON;

CREATE TABLE "locations" (
  "id" INTEGER PRIMARY KEY,
  "name" INTEGER,
  "created_at" TEXT
);

CREATE TABLE "inventorys" (
  "id" INTEGER PRIMARY KEY,
  "location_id" INTEGER,
  "date" TEXT,
  "time_of_day" TEXT, 
  "created_at" TEXT,
  FOREIGN KEY ("location_id") REFERENCES "locations" ("id")
);

CREATE TABLE "containers" (
  "id" INTEGER PRIMARY KEY,
  "size" INTEGER
);

CREATE TABLE "counts" (
  "id" INTEGER PRIMARY KEY,
  "item_id" INTEGER,
  "container_id" INTEGER,
  "count" INTEGER,
  FOREIGN KEY ("item_id") REFERENCES "items" ("id"),
  FOREIGN KEY ("container_id") REFERENCES "containers" ("id")
);

CREATE TABLE "inventory_counts" (
  "id" INTEGER PRIMARY KEY,
  "inventory_id" INTEGER,
  "count_id" INTEGER,
  "count" TEXT,
  FOREIGN KEY ("inventory_id") REFERENCES "inventorys" ("id"),
  FOREIGN KEY ("count_id") REFERENCES "counts" ("id")
);

CREATE TABLE "items" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT,
  "price" INTEGER
);

CREATE TABLE "location_items" (
  "id" INTEGER PRIMARY KEY,
  "location_id" INTEGER,
  "item_id" INTEGER,
  FOREIGN KEY ("location_id") REFERENCES "locations" ("id"),
  FOREIGN KEY ("item_id") REFERENCES "items" ("id")
);

CREATE TABLE "item_containers" (
  "id" INTEGER PRIMARY KEY,
  "item_id" INTEGER,
  "container_id" INTEGER,
  FOREIGN KEY ("item_id") REFERENCES "items" ("id"),
  FOREIGN KEY ("container_id") REFERENCES "containers" ("id")
);