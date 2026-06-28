# 08_PRISMA_SCHEMA_FULL.md

# WhatsBiz CRM — Prisma Schema (Enterprise Multi-Tenant SaaS)

---

# OVERVIEW

This Prisma schema is designed for:

* Multi-tenant SaaS
* WhatsApp CRM system
* Order management system
* Invoice & payment system
* Automation engine
* Real-time messaging system
* Audit logging system

---

# DESIGN PRINCIPLES

## 1. Multi-Tenant First

Every table contains:

tenant_id

---

## 2. Soft Delete

Use:

deleted_at (nullable)

---

## 3. UUID Primary Keys

Use:

UUID v7 (or UUID v4 fallback)

---

## 4. Indexing Strategy

* tenant_id index on all tables
* composite indexes for search-heavy tables
* message & conversation optimized indexes

---

# ENUMS

```prisma
enum UserRole {
  SUPER_ADMIN
  OWNER
  MANAGER
  STAFF
  SALES
  FINANCE
}

enum CustomerStatus {
  LEAD
  PROSPECT
  CUSTOMER
  VIP
  INACTIVE
  LOST
}

enum OrderStatus {
  DRAFT
  PENDING
  CONFIRMED
  PROCESSING
  COMPLETED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum InvoiceStatus {
  DRAFT
  SENT
  PARTIALLY_PAID
  PAID
  OVERDUE
  CANCELLED
}

enum MessageType {
  TEXT
  IMAGE
  VIDEO
  AUDIO
  DOCUMENT
  TEMPLATE
  SYSTEM
}

enum ConversationStatus {
  OPEN
  PENDING
  RESOLVED
  CLOSED
}

enum PaymentMethod {
  CASH
  TRANSFER
  QRIS
  EWALLET
  GATEWAY
}

enum AutomationTrigger {
  NEW_CUSTOMER
  NEW_MESSAGE
  NEW_ORDER
  INVOICE_OVERDUE
  PAYMENT_RECEIVED
}
```

---

# CORE TABLES

## TENANTS

```prisma
model Tenant {
  id          String   @id @default(uuid())
  name        String
  domain      String?  @unique
  plan        String
  is_active   Boolean  @default(true)

  users       User[]
  customers   Customer[]

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}
```

---

## USERS

```prisma
model User {
  id            String   @id @default(uuid())
  tenant_id     String
  tenant        Tenant   @relation(fields: [tenant_id], references: [id])

  name          String
  email         String
  password      String
  role          UserRole

  is_active     Boolean  @default(true)

  last_login    DateTime?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  @@index([tenant_id])
  @@index([email])
}
```

---

## CUSTOMERS

```prisma
model Customer {
  id            String   @id @default(uuid())
  tenant_id     String
  tenant        Tenant   @relation(fields: [tenant_id], references: [id])

  name          String
  phone         String
  email         String?
  address       String?

  status        CustomerStatus @default(LEAD)

  tags          CustomerTag[]

  total_orders  Int      @default(0)
  total_spent   Float    @default(0)

  last_contact  DateTime?

  deleted_at    DateTime?

  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  @@index([tenant_id])
  @@index([phone])
}
```

---

## CUSTOMER TAGS

```prisma
model CustomerTag {
  id          String   @id @default(uuid())
  tenant_id   String

  customer_id String
  customer    Customer @relation(fields: [customer_id], references: [id])

  tag         String

  @@index([tenant_id])
}
```

---

## CONVERSATIONS

```prisma
model Conversation {
  id            String   @id @default(uuid())
  tenant_id     String

  customer_id   String
  customer      Customer @relation(fields: [customer_id], references: [id])

  assigned_to   String?

  status        ConversationStatus @default(OPEN)

  last_message  String?
  unread_count  Int @default(0)

  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  @@index([tenant_id])
  @@index([customer_id])
}
```

---

## MESSAGES

```prisma
model Message {
  id              String   @id @default(uuid())
  tenant_id       String

  conversation_id String
  conversation    Conversation @relation(fields: [conversation_id], references: [id])

  sender_id       String?

  type            MessageType
  content         String

  media_url       String?

  status          String @default("sent")

  created_at      DateTime @default(now())

  @@index([tenant_id])
  @@index([conversation_id])
}
```

---

## ORDERS

```prisma
model Order {
  id            String   @id @default(uuid())
  tenant_id     String

  customer_id   String
  customer      Customer @relation(fields: [customer_id], references: [id])

  order_number  String
  status        OrderStatus @default(PENDING)

  subtotal      Float
  tax           Float
  discount      Float
  total         Float

  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  @@index([tenant_id])
  @@index([order_number])
}
```

---

## ORDER ITEMS

```prisma
model OrderItem {
  id          String @id @default(uuid())
  tenant_id   String

  order_id    String
  order       Order @relation(fields: [order_id], references: [id])

  name        String
  quantity    Int
  price       Float

  @@index([tenant_id])
}
```

---

## INVOICES

```prisma
model Invoice {
  id            String @id @default(uuid())
  tenant_id     String

  order_id      String
  order         Order @relation(fields: [order_id], references: [id])

  invoice_number String

  status        InvoiceStatus

  total         Float
  paid_amount   Float @default(0)

  due_date      DateTime?

  created_at    DateTime @default(now())

  @@index([tenant_id])
}
```

---

## PAYMENTS

```prisma
model Payment {
  id            String @id @default(uuid())
  tenant_id     String

  invoice_id    String
  invoice       Invoice @relation(fields: [invoice_id], references: [id])

  method        PaymentMethod

  amount        Float

  created_at    DateTime @default(now())

  @@index([tenant_id])
}
```

---

## AUTOMATIONS

```prisma
model Automation {
  id            String @id @default(uuid())
  tenant_id     String

  name          String
  trigger       String

  is_active     Boolean @default(true)

  created_at    DateTime @default(now())
}
```

---

## TASKS

```prisma
model Task {
  id            String @id @default(uuid())
  tenant_id     String

  title         String
  description   String?

  assigned_to   String?

  status        String @default("pending")

  due_date      DateTime?

  created_at    DateTime @default(now())

  @@index([tenant_id])
}
```

---

## NOTIFICATIONS

```prisma
model Notification {
  id          String @id @default(uuid())
  tenant_id   String

  user_id     String

  title       String
  message     String

  is_read     Boolean @default(false)

  created_at  DateTime @default(now())

  @@index([tenant_id])
}
```

---

## AUDIT LOGS

```prisma
model AuditLog {
  id          String @id @default(uuid())
  tenant_id   String

  user_id     String

  action      String
  resource    String

  ip_address  String?

  metadata    Json?

  created_at  DateTime @default(now())

  @@index([tenant_id])
}
```

---

## SUBSCRIPTIONS

```prisma
model Subscription {
  id          String @id @default(uuid())
  tenant_id   String

  plan        String
  status      String

  start_date  DateTime
  end_date    DateTime?

  created_at  DateTime @default(now())
}
```

---

# INDEXING STRATEGY

Critical indexes:

* tenant_id (ALL TABLES)
* customer.phone
* order.order_number
* message.conversation_id
* invoice.invoice_number

---

# PERFORMANCE NOTES

* Use pagination on all queries
* Avoid deep nested joins
* Use selective fields (select not include)
* Cache customer + dashboard metrics in Redis

---

# RELATIONSHIP SUMMARY

Tenant
→ Users
→ Customers
→ Orders
→ Conversations
→ Invoices

Customer
→ Orders
→ Conversations

Order
→ OrderItems
→ Invoice
→ Payments

Conversation
→ Messages

Invoice
→ Payments

---

# FINAL NOTE

This schema is designed for:

* High scalability SaaS
* Multi-tenant isolation
* WhatsApp message volume at scale
* Production billing system
* Real-world UMKM usage

DO NOT simplify this schema in implementation.
