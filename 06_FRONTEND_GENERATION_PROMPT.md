# 06_FRONTEND_ANTIGRAVITY_PROMPT.md

# WhatsBiz CRM — Frontend Generation Prompt (Antigravity)

---

# ROLE

You are a Senior Frontend Architect and UI Engineer.

Your task is to generate a production-ready frontend for a SaaS application called:

# WhatsBiz CRM

A WhatsApp CRM + Order Management System for UMKM Indonesia.

You must build a **fully working Next.js application UI** using:

* Next.js (App Router)
* TypeScript
* TailwindCSS
* Shadcn UI
* React Query
* Zustand
* React Hook Form + Zod
* Socket.IO Client

---

# IMPORTANT GOAL

Build a UI that feels like:

* WhatsApp Web
* Notion
* HubSpot
* Intercom
* Trello

BUT simplified for UMKM.

---

# DESIGN SYSTEM (MANDATORY)

Use design system from `05_UI_UX_DESIGN_SYSTEM.md`.

---

# GLOBAL LAYOUT

## Structure

* Sidebar (left)
* Topbar (top)
* Main content (center)
* Context panel (right optional)

---

## Layout Example

```
Sidebar | Main Content | Context Panel
```

---

# REQUIRED PAGES

You MUST generate these pages:

---

## 1. DASHBOARD PAGE

Route:

/dashboard

### Components:

* KPI Cards:

  * Revenue
  * Active Orders
  * Unread WhatsApp Messages
  * New Customers

* Charts:

  * Revenue trend
  * Order trend

* Activity Feed:

  * Real-time updates

---

## 2. CRM PAGE

Route:

/crm

### Layout:

Split layout:

Left:

* Customer list
* Search bar
* Filters

Right:

* Customer detail panel

---

### Customer Detail Tabs:

* Overview
* Orders
* Messages
* Payments
* Tasks

---

## 3. WHATSAPP INBOX PAGE

Route:

/inbox

### Layout:

3 Columns:

```
Inbox | Chat | Customer Info
```

---

### Inbox:

* Conversation list
* Unread badge
* Assigned agent
* Last message preview

---

### Chat Panel:

* Message bubbles
* Media support
* Quick replies
* Templates
* Typing indicator

---

### Customer Panel:

* Name
* Phone
* Tags
* Lifetime value
* Orders summary

---

## 4. ORDER MANAGEMENT PAGE

Route:

/orders

### Layout:

Kanban Board (Trello style)

Columns:

* Draft
* Pending
* Processing
* Completed

---

### Order Card:

* Customer name
* Total price
* Status badge
* Assigned staff

---

## 5. INVOICE PAGE

Route:

/invoices

### Features:

* Invoice list table
* Status badge
* PDF export button
* Send via WhatsApp button

---

## 6. AUTOMATION BUILDER PAGE

Route:

/automation

### UI Style:

Visual flow builder like:

* Zapier
* n8n

---

### Flow Structure:

Trigger → Condition → Action

---

### Example Flow:

```
New Customer → Send WhatsApp → Assign Staff
```

---

## 7. REPORTS PAGE

Route:

/reports

### Sections:

* Revenue analytics
* Customer analytics
* Order analytics
* Export buttons

---

# COMPONENT REQUIREMENTS

## Sidebar

Must include:

* Dashboard
* CRM
* Inbox
* Orders
* Invoices
* Automation
* Reports
* Settings

---

## Topbar

Must include:

* Search bar (global search)
* Notification icon
* User profile menu

---

## Context Panel (Important UX Feature)

On CRM and Inbox pages:

Show:

* Customer profile
* Orders summary
* Notes
* Tags
* Quick actions

---

# STATE MANAGEMENT

## Zustand

Use for:

* Sidebar state
* Selected customer
* UI state

---

## React Query

Use for:

* API data
* caching
* server sync

---

# REALTIME SYSTEM

Use Socket.IO client for:

* Incoming messages
* Live chat updates
* Order updates
* Notifications

---

# UI/UX REQUIREMENTS

## Must feel:

* Fast
* Lightweight
* Modern SaaS
* Mobile responsive

---

## Animations:

* Smooth page transitions
* Message bubble animation
* Toast notifications
* Loading skeletons

---

# MOBILE RESPONSIVENESS

## Mobile behavior:

* Sidebar becomes bottom nav
* Inbox becomes single column
* Chat fullscreen mode

---

# PERFORMANCE REQUIREMENTS

* Lazy load pages
* Skeleton loaders
* Optimistic UI updates
* Avoid unnecessary re-renders

---

# SECURITY UI RULES

* Hide admin-only menus based on role
* Protect routes using middleware
* No sensitive data in frontend logs

---

# API INTEGRATION

Assume backend REST API exists:

Base URL:

/api

---

## Required API modules:

* /auth
* /customers
* /orders
* /messages
* /invoices
* /payments
* /automation
* /reports

---

# FILE STRUCTURE (MANDATORY)

```
src/
  app/
  components/
  features/
  hooks/
  lib/
  store/
  services/
  types/
  utils/
```

---

# FEATURE MODULE STRUCTURE

```
features/
  dashboard/
  crm/
  inbox/
  orders/
  invoices/
  automation/
  reports/
```

---

# SOCKET EVENTS

Listen to:

* message:new
* conversation:update
* order:update
* notification:new

---

# UX DIFFERENTIATORS (IMPORTANT FOR COMPETITION)

## 1. WhatsApp-like Inbox

Most important page

---

## 2. Customer 360 Context Panel

Always visible

---

## 3. Kanban Orders

Drag and drop orders

---

## 4. Automation Builder

Visual workflow

---

## 5. One-click actions

* Create order from chat
* Send invoice from order
* Assign staff instantly

---

# FINAL OUTPUT REQUIREMENT

Generate:

* Full Next.js frontend project
* Working UI components
* Page routing
* Layout system
* Mock API integration layer
* Responsive design
* Production-ready structure

NO dummy UI.

NO static HTML only.

Everything must be structured like a real SaaS product.
