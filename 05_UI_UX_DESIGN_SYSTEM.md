# 05_UI_UX_DESIGN_SYSTEM.md

# WhatsBiz CRM — UI/UX Design System

---

# Product Identity

## Name

WhatsBiz CRM

## Positioning

Modern CRM + WhatsApp Inbox + Order Management untuk UMKM Indonesia

## UX Goal

Membuat sistem yang:

* cepat dipahami UMKM
* minim learning curve
* mirip aplikasi sehari-hari (WhatsApp, Trello)
* tidak terasa seperti software enterprise yang rumit

---

# UX PRINCIPLES

## 1. Simplicity First

UI harus bisa digunakan tanpa training.

---

## 2. Familiarity

Gunakan pola dari:

* WhatsApp Web
* Google Sheets
* Trello
* Notion

---

## 3. Speed Over Complexity

Semua action harus ≤ 3 klik.

---

## 4. Mobile First

70% UMKM pakai HP.

---

## 5. Context Awareness

Setiap halaman harus menampilkan data relevan tanpa harus pindah halaman.

---

# DESIGN SYSTEM

## Color Palette

Primary:

* Emerald 500 (#10B981)

Secondary:

* Blue 500 (#3B82F6)

Success:

* Green 500

Warning:

* Amber 500

Danger:

* Red 500

Neutral:

* Gray 50–900

---

## Dark Mode

Background:

* #0B0F14

Card:

* #111827

Text:

* #E5E7EB

---

## Typography

Font Family:

* Inter
* Geist (optional modern SaaS feel)

Hierarchy:

H1: 32px / Bold
H2: 24px / Semibold
H3: 20px / Medium
Body: 14–16px
Caption: 12px

---

## Spacing System

4px base system:

* 4
* 8
* 12
* 16
* 24
* 32
* 48

---

## Border Radius

* Small: 6px
* Medium: 10px
* Large: 16px
* Full: 999px (badges, avatars)

---

## Shadows

* Soft: low elevation cards
* Medium: modals
* Strong: dropdowns

---

# LAYOUT SYSTEM

## Global Layout

```
+--------------------------------------+
| Topbar                              |
+--------------------------------------+
| Sidebar | Main Content              |
|         |                          |
|         |                          |
+--------------------------------------+
```

---

## Sidebar Menu

* Dashboard
* CRM
* WhatsApp Inbox
* Orders
* Invoices
* Payments
* Automation
* Reports
* Settings

---

# CORE PAGES UX

# 1. DASHBOARD

## UX Concept

"Business overview in 10 seconds"

---

## Components

### KPI Cards

* Revenue
* Active Orders
* Unread Chats
* New Customers

---

### Charts

* Revenue Trend
* Order Volume
* Customer Growth

---

### Activity Feed

Real-time business updates:

* New order created
* Payment received
* New chat incoming

---

# 2. CRM PAGE

## UX Concept

"Like Notion meets HubSpot"

---

## Layout

```
Left: Customer List
Right: Customer Detail
```

---

## Features

* Search bar sticky
* Tag filters
* Quick actions

---

## Customer Detail Panel

* Profile info
* Order history
* WhatsApp history
* Notes
* Tasks

---

# 3. WHATSAPP INBOX

## UX Concept

"WhatsApp Web + Intercom"

---

## Layout

```
Inbox | Chat | Customer Info
```

---

## Inbox Panel

* Conversation list
* Unread badge
* Assigned agent
* Status label

---

## Chat Panel

* Message bubbles
* Media support
* Quick replies
* Templates

---

## Customer Panel

* Name
* Tags
* Lifetime value
* Total orders
* Notes

---

# 4. ORDER MANAGEMENT

## UX Concept

"Trello for orders"

---

## Kanban Board

Columns:

* Draft
* Pending
* Processing
* Completed

---

## Order Card

* Customer name
* Total price
* Status badge
* Assigned staff

---

## Interaction

* Drag & drop
* Quick edit modal

---

# 5. AUTOMATION BUILDER

## UX Concept

"Zapier simplified"

---

## Flow UI

```
Trigger → Condition → Action
```

---

## Example

```
New Customer
   ↓
Send WhatsApp
   ↓
Assign Staff
```

---

## UI Features

* Drag nodes
* Connect lines
* Simple rule editor

---

# 6. CUSTOMER 360 VIEW

## UX Concept

"All customer data in one screen"

---

## Layout

* Profile header
* KPI summary
* Tabs:

  * Orders
  * Chats
  * Payments
  * Tasks

---

## KPI Cards

* Customer Score
* Lifetime Value
* Total Orders
* Last Activity

---

# COMPONENT LIBRARY

## Buttons

Primary
Secondary
Ghost
Danger

---

## Badges

* Status badges
* Tags
* Priority labels

---

## Cards

* KPI card
* Customer card
* Order card

---

## Tables

* Sortable
* Filterable
* Paginated

---

## Modals

* Create customer
* Create order
* Send message

---

# MOBILE UX

## Priorities

1. WhatsApp Inbox
2. Dashboard
3. Orders

---

## Mobile Layout

* Bottom navigation
* Swipe between tabs
* Floating action button

---

# MICRO INTERACTIONS

* Message sent animation
* Order status transition
* Notification toast
* Typing indicator

---

# UX DIFFERENTIATORS

## 1. Context Panel

Always show customer info beside chat

---

## 2. One-click actions

* Create order from chat
* Send invoice from order
* Follow-up from customer

---

## 3. Smart suggestions

* Suggested replies
* Suggested actions

---

# ACCESSIBILITY

* Keyboard navigation
* High contrast mode
* Screen reader support

---

# PERFORMANCE UX

* Skeleton loading
* Optimistic UI
* Lazy loading

---

# SUCCESS UX METRICS

* Time to first action < 30 seconds
* Order creation < 1 minute
* Response time < 5 seconds interaction feeling

---

# FINAL UX GOAL

User should feel:

"This feels like WhatsApp, but for running my business."
