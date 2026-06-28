# 07_BACKEND_NESTJS_ANTIGRAVITY_PROMPT.md

# WhatsBiz CRM — Backend Generation Prompt (NestJS)

---

# ROLE

You are a Staff-Level Backend Engineer and System Architect.

Build a production-ready backend system for:

# WhatsBiz CRM

A Multi-Tenant WhatsApp CRM + Order Management SaaS for UMKM Indonesia.

---

# CORE REQUIREMENT

You must build a **scalable, secure, event-driven backend** using:

* NestJS (TypeScript)
* PostgreSQL
* Prisma ORM
* Redis
* BullMQ
* Socket.IO
* JWT Authentication

---

# ARCHITECTURE STYLE

Must follow:

* Clean Architecture
* Modular Monolith (microservice-ready)
* Domain Driven Design (DDD)
* Event Driven Architecture

---

# MULTI-TENANT SYSTEM (CRITICAL)

Every table MUST include:

tenant_id

---

## RULES

* No query allowed without tenant filtering
* Middleware must inject tenant context
* JWT must include tenant_id
* Prevent cross-tenant data access completely

---

## TENANT RESOLUTION

Priority:

1. JWT token
2. Subdomain
3. Request header

---

# MODULES REQUIRED

You MUST implement these modules:

---

## 1. AUTH MODULE

Features:

* Register company
* Login
* Logout
* Refresh token rotation
* Password reset
* Email verification
* Session tracking

---

Security:

* Argon2 password hashing
* JWT access token
* Refresh token stored in DB
* Device tracking

---

---

## 2. USER & RBAC MODULE

Roles:

* Super Admin
* Owner
* Manager
* Staff
* Finance
* Sales

---

Permissions system:

* role-based + permission-based
* dynamic permission assignment

Example permissions:

* customer.read
* customer.write
* order.manage
* invoice.manage
* message.send

---

---

## 3. TENANT MODULE

Features:

* Create tenant
* Update tenant
* Subscription plan management
* Feature flags per tenant

---

---

## 4. CRM MODULE

Entities:

* Customer
* Tags
* Customer Notes
* Customer Timeline

---

Features:

* CRUD customer
* Search customer (full text search)
* Tagging system
* Customer scoring (basic logic)
* Import/export CSV

---

---

## 5. WHATSAPP INTEGRATION MODULE

Support:

* WhatsApp Cloud API
* WhatsApp Business API

---

### Core Features:

* Webhook receiver
* Message parser
* Message sender
* Media handling
* Template messaging

---

### Webhook Flow:

WhatsApp Webhook
→ Validate signature
→ Normalize message
→ Save to DB
→ Emit event
→ Push via Socket.IO

---

---

## 6. MESSAGING MODULE

Entities:

* Conversation
* Message
* Attachment

---

Features:

* Real-time messaging
* Conversation assignment
* Message history
* Message status tracking

---

---

## 7. ORDER MODULE

Entities:

* Order
* OrderItem

---

Features:

* Create order from chat
* Update order status
* Order timeline tracking
* Link order to customer

---

Statuses:

* draft
* pending
* confirmed
* processing
* completed
* cancelled

---

---

## 8. INVOICE MODULE

Features:

* Auto generate invoice from order
* PDF generation
* Send via WhatsApp
* Track payment status

---

Statuses:

* draft
* sent
* paid
* overdue

---

---

## 9. PAYMENT MODULE

Features:

* Manual payment entry
* Partial payments
* Payment history
* Balance tracking

---

---

## 10. AUTOMATION MODULE

Event-driven automation engine.

---

### Structure:

Trigger → Condition → Action

---

### Triggers:

* new_customer
* new_message
* new_order
* invoice_overdue
* payment_received

---

### Actions:

* send_whatsapp
* create_task
* assign_user
* update_tag

---

---

## 11. TASK MODULE

Features:

* Task creation
* Assignment
* Due dates
* Status tracking

---

Statuses:

* pending
* in_progress
* blocked
* completed

---

---

## 12. NOTIFICATION MODULE

Real-time notifications via Socket.IO

Events:

* message:new
* order:update
* invoice:update
* payment:received

---

---

## 13. REPORTING MODULE

Features:

* Revenue report
* Customer report
* Order report
* Staff performance

---

Supports:

* daily
* weekly
* monthly

---

---

## 14. AUDIT LOG MODULE

Must log:

* login/logout
* data updates
* permission changes
* payment actions

---

Fields:

* user_id
* tenant_id
* action
* resource
* timestamp
* ip_address

---

---

# DATABASE DESIGN (PRISMA)

Must include:

* UUID v7 primary keys
* Soft deletes (deleted_at)
* tenant_id indexing
* composite indexes

---

## REQUIRED TABLES:

* tenants
* users
* roles
* permissions
* customers
* customer_tags
* conversations
* messages
* orders
* order_items
* invoices
* payments
* tasks
* notifications
* automations
* automation_logs
* audit_logs
* subscriptions

---

---

# REALTIME SYSTEM

Use Socket.IO for:

* chat messages
* order updates
* notifications
* typing indicators

---

---

# QUEUE SYSTEM

Use BullMQ + Redis

Queues:

* message_queue
* automation_queue
* notification_queue
* report_queue
* invoice_queue

---

---

# WHATSAPP EVENT FLOW

Incoming Message:

Webhook
→ Validate signature
→ Store message
→ Update conversation
→ Emit Socket event
→ Trigger automation
→ Log audit

---

Outgoing Message:

API Request
→ Validate tenant
→ Store message
→ Send to WhatsApp API
→ Update status
→ Emit Socket event

---

---

# SECURITY REQUIREMENTS

Must implement:

* JWT authentication
* RBAC authorization
* Tenant isolation middleware
* Rate limiting
* Input validation (class-validator)
* CSRF protection
* Secure headers
* Webhook signature verification

---

---

# PERFORMANCE REQUIREMENTS

Must support:

* 10M+ messages
* 1M+ customers
* 10K+ tenants

---

Optimizations:

* Redis caching
* Indexed queries
* Pagination
* Background jobs

---

---

# API STRUCTURE

REST API:

/auth
/customers
/orders
/messages
/invoices
/payments
/automation
/reports
/tenants

---

Swagger documentation required.

---

---

# FILE STRUCTURE

src/
modules/
auth/
tenants/
users/
crm/
messaging/
orders/
invoices/
payments/
automation/
tasks/
reports/
notifications/
audit/

common/
config/
database/
guards/
interceptors/
middleware/
utils/

---

---

# DEPLOYMENT

Must include:

* Dockerfile
* Docker Compose
* Nginx config
* Environment variables
* CI/CD pipeline (GitHub Actions)

---

---

# FINAL OUTPUT REQUIREMENT

Generate:

* Full NestJS backend project
* Prisma schema
* Event-driven architecture
* Webhook system
* Realtime system
* Queue workers
* Production-ready structure

NO mock-only implementation.

NO pseudo code only.

Must be production-grade SaaS backend.
