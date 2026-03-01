# Capstone Project – Task List for Grade 1 (MVP)

## Context

**Course:** DATA.DB.300 – Database Systems: NoSQL (Tampere University)  
**Business domain:** Tobak Express – Online Snus Store (see `docs/tobak-express.md`)  
**Chosen DBMS:** MongoDB (already set up via Docker, see `docs/docker-environment.md`)

> **Important:** Your domain must NOT be about movies — the movie domain is the example in the slides. Tobak Express (snus store) is your domain. ✅

---

## Grade 1 Requirements (from lecture slides, slide 95)

1. Choose a business domain and write a brief description
2. Choose one DBMS covered in the course
3. Design 10 typical use-cases (access patterns) — must include both reads AND writes
4. Design and implement the database structure
5. Implement both read and write operations for all use-cases
6. Follow best practices and prepare for scaling

---

## Tasks

### 1. Write the Business Domain Description
- [ ] Expand `docs/tobak-express.md` to include **all** required points:
  - **What the domain is about:** online snus marketplace (already started)
  - **Geographic scope:** primarily Sweden, but also Nordic countries and international customers
  - **End-users description:** who uses it (casual buyers, regular snus users, resellers, etc.)
  - **Concurrency / scale:** estimated number of concurrent users during peak hours (e.g., hundreds)
  - **Read/write ratio:** e.g., mostly read-heavy (browsing products) with occasional writes (orders, reviews, registration)

### 2. Design 10 Use-Cases (Access Patterns)
- [ ] Define 10 access patterns (queries/operations) that cover the core functionality. Mix of reads and writes. Example use-cases for Tobak Express:

| #   | Use-Case                                | Type  |
|-----|-----------------------------------------|-------|
| Q1  | Get all products by category (e.g., "portion snus", "loose snus") | Read  |
| Q2  | Get product details by product ID       | Read  |
| Q3  | Search products by brand (e.g., "General", "Ettan") | Read  |
| Q4  | Get reviews for a product               | Read  |
| Q5  | Get all orders for a customer           | Read  |
| Q6  | Get customer by ID                      | Read  |
| Q7  | Register a new customer                 | Write |
| Q8  | Place a new order                       | Write |
| Q9  | Add a review for a product              | Write |
| Q10 | Update customer information (e.g., address) | Write |

- [ ] Adjust these to match your vision — they must make sense for Tobak Express

### 3. Design the MongoDB Database Structure
- [ ] Based on the 10 use-cases, design your collections. Consider:
  - When to **embed** vs. when to **reference** (follow MongoDB best practices)
  - Bounded vs. unbounded data (e.g., reviews are unbounded → separate collection)
  - Keep the use-cases in mind: each query should be efficient (1–2 queries max)
- [ ] Example collections to consider:
  - `products` — snus products with details (brand, category, nicotine strength, flavor, price, etc.)
  - `customers` — registered users with name, email, address, country
  - `orders` — orders with embedded order items (bounded per order)
  - `reviews` — product reviews (potentially unbounded → separate collection)
- [ ] Write the collection designs as sample JSON documents

### 4. Implement the Database (create-db.js)
- [ ] Write `mongodb/create-db.js` to create the database and collections
  - Use `use tobak_express` to switch to your database
  - Create collections with any necessary validation rules (optional for grade 1)

### 5. Add Seed Data (seed-data.js)
- [ ] Write `mongodb/seed-data.js` with `insertMany()` calls to populate:
  - At least a few sample products (different categories and brands)
  - At least a few sample customers
  - At least a few sample orders
  - At least a few sample reviews
  - (For grade 1, you don't need 10+ records per collection — that's grade 2)

### 6. Implement All 10 Use-Case Queries (queries-for-use-cases.js)
- [ ] Write `mongodb/queries-for-use-cases.js` with all 10 operations:
  - Each query should have a comment explaining which use-case it implements
  - Read operations use `find()`, `findOne()`, etc.
  - Write operations use `insertOne()`, `updateOne()`, etc.
  - All queries should work against the seed data

### 7. Test Everything
- [ ] Start the MongoDB container: `docker compose up -d`
- [ ] Connect to mongosh: `docker exec -it mongo_lab mongosh`
- [ ] Run `create-db.js` (or run commands manually)
- [ ] Run `seed-data.js` to insert data
- [ ] Run each query from `queries-for-use-cases.js` and verify results
- [ ] Make sure both reads return data and writes modify data correctly

### 8. Prepare for Submission
- [ ] Ensure repository is clean and well-organized
- [ ] Make sure all files are committed to the repo
- [ ] Submit via Moodle (compressed files or GitHub link)

---

## Summary of Deliverables for Grade 1

| Deliverable | File(s) |
|---|---|
| Business domain description | `docs/tobak-express.md` |
| 10 use-cases (access patterns) | documented in `tobak-express.md` or a separate doc |
| Database design (collection schemas) | documented + `mongodb/create-db.js` |
| Seed data | `mongodb/seed-data.js` |
| Read & write operations for all use-cases | `mongodb/queries-for-use-cases.js` |

---

## What Grade 1 Does NOT Require (but higher grades do)

- ❌ Indices (grade 2)
- ❌ 10+ records per collection (grade 2)
- ❌ Second DBMS or expanded features (grade 3)
- ❌ Complex queries like aggregation pipelines (grade 4)
- ❌ Database distribution design (grade 4)
- ❌ Proof-of-concept UI application (grade 5)
