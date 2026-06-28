# 13_API_SPECIFICATION.md

# WhatsBiz CRM — API Specification

---

# OVERVIEW

This document defines the complete REST API contract for WhatsBiz CRM.

System supports:

* Multi-tenant SaaS
* WhatsApp messaging integration
* CRM operations
* Order & invoice management
* Automation engine
* Real-time updates (Socket.IO)

---

# BASE URL

```
Production: https://api.whatsbiz.com
Staging: https://staging-api.whatsbiz.com
Local: http://localhost:3000
```

---

# AUTHENTICATION

## JWT Bearer Token

All protected endpoints require:

```
Authorization: Bearer <token>
```

---

## TOKEN PAYLOAD

```json id="jwt1"
{
  "user_id": "uuid",
  "tenant_id": "uuid",
  "role": "OWNER",
  "exp": 1710000000
}
```

---

# STANDARD RESPONSE FORMAT

## SUCCESS

```json id="res1"
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

---

## ERROR

```json id="res2"
{
  "success": false,
  "message": "Error message",
  "error_code": "VALIDATION_ERROR"
}
```

---

# ERROR CODES

| Code             | Description                 |
| ---------------- | --------------------------- |
| AUTH_FAILED      | Invalid credentials         |
| UNAUTHORIZED     | No access                   |
| VALIDATION_ERROR | Invalid input               |
| NOT_FOUND        | Data not found              |
| TENANT_MISMATCH  | Cross-tenant access blocked |
| RATE_LIMITED     | Too many requests           |

---

# AUTH MODULE

## Register Tenant

```
POST /auth/register
```

### Request

```json id="auth1"
{
  "company_name": "Toko Maju",
  "email": "admin@toko.com",
  "password": "secure123"
}
```

---

## Login

```
POST /auth/login
```

### Response

```json id="auth2"
{
  "access_token": "jwt",
  "refresh_token": "jwt"
}
```

---

## Refresh Token

```
POST /auth/refresh
```

---

# CUSTOMER MODULE (CRM)

## Get Customers

```
GET /customers
```

### Query Params

* page
* limit
* search

---

## Create Customer

```
POST /customers
```

### Request

```json id="cust1"
{
  "name": "Budi",
  "phone": "08123456789",
  "email": "budi@mail.com"
}
```

---

## Update Customer

```
PATCH /customers/:id
```

---

## Delete Customer

```
DELETE /customers/:id
```

---

# WHATSAPP MODULE

## Send Message

```
POST /messages/send
```

### Request

```json id="msg1"
{
  "conversation_id": "uuid",
  "message": "Halo, bagaimana kabarnya?",
  "type": "TEXT"
}
```

---

## Webhook Receiver

```
POST /webhook/whatsapp
```

### Purpose:

Receive incoming WhatsApp messages

---

## Message Flow

1. Validate signature
2. Store message
3. Update conversation
4. Emit Socket event
5. Trigger automation

---

# CONVERSATION MODULE

## Get Conversations

```
GET /conversations
```

---

## Get Messages

```
GET /conversations/:id/messages
```

---

# ORDER MODULE

## Create Order

```
POST /orders
```

### Request

```json id="ord1"
{
  "customer_id": "uuid",
  "items": [
    {
      "name": "Cuci AC",
      "quantity": 1,
      "price": 75000
    }
  ]
}
```

---

## Update Order Status

```
PATCH /orders/:id/status
```

---

# INVOICE MODULE

## Generate Invoice

```
POST /invoices/generate/:order_id
```

---

## Send Invoice via WhatsApp

```
POST /invoices/send/:id
```

---

# PAYMENT MODULE

## Record Payment

```
POST /payments
```

```json id="pay1"
{
  "invoice_id": "uuid",
  "amount": 75000,
  "method": "QRIS"
}
```

---

# AUTOMATION MODULE

## Create Automation Flow

```
POST /automation
```

### Example:

```json id="auto1"
{
  "name": "Welcome Flow",
  "trigger": "NEW_CUSTOMER",
  "actions": [
    {
      "type": "SEND_WHATSAPP",
      "message": "Selamat datang!"
    }
  ]
}
```

---

## Trigger Types

* NEW_CUSTOMER
* NEW_MESSAGE
* NEW_ORDER
* PAYMENT_RECEIVED

---

# REPORTING MODULE

## Get Dashboard Stats

```
GET /reports/dashboard
```

---

# REALTIME EVENTS (SOCKET.IO)

## Events List

### Incoming:

* message:new
* order:update
* notification:new

---

### Outgoing:

* conversation:updated
* message:sent
* automation:triggered

---

# RATE LIMITING

* 100 requests / minute (default)
* 1000 requests / minute (enterprise)

---

# MULTI-TENANT RULES (CRITICAL)

Every request must:

* include tenant_id from JWT
* never access other tenant data
* enforce at service layer + DB layer

---

# SECURITY HEADERS

* X-Content-Type-Options: nosniff
* X-Frame-Options: DENY
* Authorization required
* Webhook signature validation

---

# WEBHOOK SECURITY

WhatsApp webhook must validate:

* signature hash (HMAC SHA256)
* timestamp
* payload integrity

---

# PAGINATION FORMAT

```json id="page1"
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

# FINAL NOTES

This API specification is designed for:

* Scalable SaaS backend
* Multi-tenant isolation
* Real-time WhatsApp system
* AI automation integration
* Production-grade deployment

---

# END OF SPECIFICATION
