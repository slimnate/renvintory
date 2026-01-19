PRAGMA foreign_keys = ON;

-- DROP TABLES

DROP TABLE IF EXISTS "locations";
DROP TABLE IF EXISTS "inventorys";
DROP TABLE IF EXISTS "items";
DROP TABLE IF EXISTS "containers";
DROP TABLE IF EXISTS "counts";
DROP TABLE IF EXISTS "inventory_counts";
DROP TABLE IF EXISTS "location_items";
DROP TABLE IF EXISTS "item_containers";

-- CREATE TABLES

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

CREATE TABLE "items" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT,
  "price" INTEGER
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

-- INSERT DATA

-- Locations
INSERT INTO locations (id, name) VALUES (1, 'Dragon');
INSERT INTO locations (id, name) VALUES (2, 'Wizard');
INSERT INTO locations (id, name) VALUES (3, 'Pig and Whistle');

-- Containers
INSERT INTO containers (id, size) VALUES (1, 1);
INSERT INTO containers (id, size) VALUES (2, 4);
INSERT INTO containers (id, size) VALUES (3, 6);
INSERT INTO containers (id, size) VALUES (4, 12);
INSERT INTO containers (id, size) VALUES (5, 24);
INSERT INTO containers (id, size) VALUES (6, 70);
INSERT INTO containers (id, size) VALUES (7, 90);
INSERT INTO containers (id, size) VALUES (8, 420);
INSERT INTO containers (id, size) VALUES (9, 2520);
INSERT INTO containers (id, size) VALUES (10, 8);

-- Items
INSERT INTO items (id, name, price) VALUES (1, 'Miller Lite', 8);
INSERT INTO items (id, name, price) VALUES (2, 'Coors Light', 8);
INSERT INTO items (id, name, price) VALUES (3, 'Blue Moon', 12);
INSERT INTO items (id, name, price) VALUES (4, 'Blue Moon Light', 7);
INSERT INTO items (id, name, price) VALUES (5, 'Blue Moon N/A', 6);
INSERT INTO items (id, name, price) VALUES (6, 'Summer Shandy', 7);
INSERT INTO items (id, name, price) VALUES (7, 'Coors Banquet', 8);
INSERT INTO items (id, name, price) VALUES (8, 'Topo Chico', 7);
INSERT INTO items (id, name, price) VALUES (9, 'Callsign IPA', 8);
INSERT INTO items (id, name, price) VALUES (10, 'Happy Thursday', 7);
INSERT INTO items (id, name, price) VALUES (11, 'Arnold Palmer', 13);
INSERT INTO items (id, name, price) VALUES (12, 'Simply Spiked', 13);
INSERT INTO items (id, name, price) VALUES (13, 'Guinness', 11);
INSERT INTO items (id, name, price) VALUES (14, 'Harp', 8);
INSERT INTO items (id, name, price) VALUES (15, 'Smithwicks', 8);
INSERT INTO items (id, name, price) VALUES (16, 'Woodchuck Amber', 8);
INSERT INTO items (id, name, price) VALUES (17, 'Woodchuck Granny Smith', 8);
INSERT INTO items (id, name, price) VALUES (18, 'Wine', 8);
INSERT INTO items (id, name, price) VALUES (19, '5oz Cups', 10);
INSERT INTO items (id, name, price) VALUES (20, '12 Oz Cups', 7);
INSERT INTO items (id, name, price) VALUES (21, '12 Oz Cups', 8);
INSERT INTO items (id, name, price) VALUES (22, '12 Oz Cups', 9);

-- Location items for Wizard (location_id = 2)
INSERT INTO location_items (location_id, item_id) VALUES (2, 1);
INSERT INTO location_items (location_id, item_id) VALUES (2, 2);
INSERT INTO location_items (location_id, item_id) VALUES (2, 3);
INSERT INTO location_items (location_id, item_id) VALUES (2, 4);
INSERT INTO location_items (location_id, item_id) VALUES (2, 5);
INSERT INTO location_items (location_id, item_id) VALUES (2, 6);
INSERT INTO location_items (location_id, item_id) VALUES (2, 7);
INSERT INTO location_items (location_id, item_id) VALUES (2, 8);
INSERT INTO location_items (location_id, item_id) VALUES (2, 9);
INSERT INTO location_items (location_id, item_id) VALUES (2, 10);
INSERT INTO location_items (location_id, item_id) VALUES (2, 11);
INSERT INTO location_items (location_id, item_id) VALUES (2, 13);
INSERT INTO location_items (location_id, item_id) VALUES (2, 14);
INSERT INTO location_items (location_id, item_id) VALUES (2, 15);
INSERT INTO location_items (location_id, item_id) VALUES (2, 16);
INSERT INTO location_items (location_id, item_id) VALUES (2, 17);
INSERT INTO location_items (location_id, item_id) VALUES (2, 18);
INSERT INTO location_items (location_id, item_id) VALUES (2, 19);

-- TODO: Update item containers fr each item depending on what packages the items come in

-- Item containers
-- For items 1..17: containers 1,2,3,4,5
INSERT INTO item_containers (item_id, container_id) VALUES (1, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (1, 3);
INSERT INTO item_containers (item_id, container_id) VALUES (1, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (2, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (2, 3);
INSERT INTO item_containers (item_id, container_id) VALUES (2, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (3, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (3, 2);
INSERT INTO item_containers (item_id, container_id) VALUES (3, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (4, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (4, 4);
INSERT INTO item_containers (item_id, container_id) VALUES (4, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (5, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (5, 3);
INSERT INTO item_containers (item_id, container_id) VALUES (5, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (6, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (6, 4);
INSERT INTO item_containers (item_id, container_id) VALUES (6, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (7, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (7, 3);
INSERT INTO item_containers (item_id, container_id) VALUES (7, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (8, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (8, 4);
INSERT INTO item_containers (item_id, container_id) VALUES (8, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (9, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (9, 3);
INSERT INTO item_containers (item_id, container_id) VALUES (9, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (10, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (10, 4);
INSERT INTO item_containers (item_id, container_id) VALUES (10, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (11, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (11, 4);

INSERT INTO item_containers (item_id, container_id) VALUES (12, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (12, 4);

INSERT INTO item_containers (item_id, container_id) VALUES (13, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (13, 10);
INSERT INTO item_containers (item_id, container_id) VALUES (13, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (14, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (14, 2);
INSERT INTO item_containers (item_id, container_id) VALUES (14, 3);
INSERT INTO item_containers (item_id, container_id) VALUES (14, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (15, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (15, 2);
INSERT INTO item_containers (item_id, container_id) VALUES (15, 3);
INSERT INTO item_containers (item_id, container_id) VALUES (15, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (16, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (16, 3);
INSERT INTO item_containers (item_id, container_id) VALUES (16, 5);

INSERT INTO item_containers (item_id, container_id) VALUES (17, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (17, 3);
INSERT INTO item_containers (item_id, container_id) VALUES (17, 5);

-- Wines (item 18): containers 1,2,5
INSERT INTO item_containers (item_id, container_id) VALUES (18, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (18, 2);
INSERT INTO item_containers (item_id, container_id) VALUES (18, 5);

-- 5 oz cups (item 19): containers 1,7,9
INSERT INTO item_containers (item_id, container_id) VALUES (19, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (19, 7);
INSERT INTO item_containers (item_id, container_id) VALUES (19, 9);

-- 12 oz cups (item 20): containers 1,6,8
INSERT INTO item_containers (item_id, container_id) VALUES (20, 1);
INSERT INTO item_containers (item_id, container_id) VALUES (20, 6);
INSERT INTO item_containers (item_id, container_id) VALUES (20, 8);

-- CREATE VIEWS

CREATE VIEW "inventory_counts_view" AS
SELECT 
  ic.id as inventory_count_id,
  i.id as item_id,
  i.name,
  i.price,
  c.container_id,
  COALESCE(c.count, 0) as count,
  cont.size as container_size
FROM inventory_counts ic
JOIN counts c ON c.id = ic.count_id
JOIN items i ON i.id = c.item_id
JOIN containers cont ON cont.id = c.container_id
WHERE ic.inventory_id = ?
ORDER BY i.name, cont.size