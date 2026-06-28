# 01_PRD.md

# Product Requirements Document (PRD)

## Project Name

WhatsBiz CRM

---

# Version

v1.0

---

# Document Status

Draft for Enterprise SaaS Development

---

# Executive Summary

WhatsBiz CRM adalah platform SaaS berbasis cloud yang menggabungkan:

* CRM
* WhatsApp Omnichannel
* Order Management
* Invoicing
* Payment Tracking
* Customer Engagement
* Automation Engine
* Reporting & Analytics

Tujuan utama platform ini adalah membantu UMKM Indonesia mengelola seluruh siklus pelanggan dari prospek hingga pelanggan loyal melalui satu dashboard terintegrasi.

---

# Business Problem

Sebagian besar UMKM mengalami masalah berikut:

## Customer Management

* Data pelanggan tersebar
* Tidak ada histori komunikasi
* Sulit melakukan follow-up

## WhatsApp Management

* Chat bercampur
* Tidak ada assignment
* Tidak ada tracking performa

## Order Tracking

* Pesanan dicatat manual
* Sulit mengetahui status order

## Invoice & Payment

* Invoice dibuat manual
* Sulit melacak pembayaran

## Reporting

* Tidak ada data bisnis realtime
* Sulit mengukur performa

---

# Product Vision

Menjadi platform CRM dan WhatsApp Business Management paling mudah digunakan oleh UMKM Indonesia.

---

# Product Goals

## Goal 1

Meningkatkan retensi pelanggan.

### KPI

* Repeat Order Rate +20%

---

## Goal 2

Mengurangi kehilangan prospek.

### KPI

* Lead Conversion Rate +15%

---

## Goal 3

Mengurangi pekerjaan administratif.

### KPI

* Manual Work Reduction 50%

---

## Goal 4

Meningkatkan kecepatan respon pelanggan.

### KPI

* First Response Time < 5 menit

---

# Target Market

## Primary Market

UMKM Indonesia

### Segment

* Laundry
* Percetakan
* Bengkel
* Cafe
* Restoran
* Salon
* Barbershop
* Klinik
* Distributor
* Supplier
* Kontraktor

---

## Secondary Market

* Startup
* Agency
* Freelancer
* Konsultan

---

# User Personas

## Owner

Tujuan:

* Melihat performa bisnis
* Memantau karyawan
* Melihat laporan

Pain Points:

* Tidak tahu kondisi bisnis realtime
* Sulit memantau order

---

## Customer Service

Tujuan:

* Menjawab pelanggan
* Membuat order

Pain Points:

* Banyak chat masuk
* Sulit tracking status

---

## Sales

Tujuan:

* Mengubah lead menjadi customer

Pain Points:

* Follow-up tidak teratur

---

## Finance

Tujuan:

* Memantau pembayaran

Pain Points:

* Invoice dan pembayaran tidak sinkron

---

# Product Scope

## Included

CRM

WhatsApp Inbox

Order Management

Invoice Management

Payment Tracking

Task Management

Automation

Reporting

Analytics

Subscription Billing

Role Management

---

## Not Included (Phase 1)

Marketplace Integration

POS Hardware

Accounting ERP

Advanced Warehouse

Multi-Country Tax Engine

---

# Success Metrics

## Customer Metrics

* Total Customers
* New Customers
* Returning Customers
* Churn Rate
* Customer Lifetime Value

---

## Sales Metrics

* Revenue
* Conversion Rate
* Average Order Value
* Orders Per Customer

---

## Support Metrics

* First Response Time
* Resolution Time
* Closed Conversations

---

# Functional Requirements

# MODULE 1

# Authentication

## Features

### Register

Users can:

* Register company
* Register owner account

### Login

Support:

* Email
* Password

Future:

* Google OAuth
* Magic Link

### Password Reset

User receives reset link.

### Email Verification

Mandatory.

### Session Management

Show:

* Device
* Browser
* Login Date

---

# MODULE 2

# Tenant Management

Each company receives:

* Tenant ID
* Subscription Plan
* Isolated Data

Tenant data must never be visible to other tenants.

---

# MODULE 3

# User Management

## Create User

Fields:

* Name
* Email
* Role
* Department

---

## Update User

Owner can update users.

---

## Disable User

Owner can disable account access.

---

# MODULE 4

# CRM

## Customer Fields

First Name

Last Name

Phone Number

WhatsApp Number

Email

Address

City

Province

Country

Tags

Source

Notes

Status

Created Date

Last Contact Date

---

## Customer Status

Lead

Prospect

Customer

VIP

Inactive

Lost

---

## Customer Features

Create

Update

Delete

Import

Export

Search

Filter

Tagging

Bulk Actions

---

# Customer Profile

Must display:

Timeline

Messages

Orders

Invoices

Payments

Tasks

Internal Notes

Activities

---

# MODULE 5

# Sales Pipeline

Stages:

Lead

Qualified

Proposal

Negotiation

Won

Lost

---

# Pipeline Features

Kanban Board

Drag & Drop

Stage Movement

Probability

Forecast Value

Expected Closing Date

Activity Logs

---

# MODULE 6

# WhatsApp Omnichannel

## Inbox

Features:

Realtime Chat

Customer Assignment

Internal Notes

Search

Labels

Conversation Status

Conversation Priority

---

## Conversation Status

Open

Pending

Resolved

Closed

---

## Conversation Priority

Low

Medium

High

Urgent

---

## Message Types

Text

Image

Video

Audio

Document

Location

Template Message

---

## Quick Replies

Admin can create:

* Greeting
* Payment Reminder
* Order Complete
* Thank You Message

---

# MODULE 7

# Order Management

## Order Fields

Order Number

Customer

Items

Subtotal

Tax

Discount

Grand Total

Status

Notes

Assigned Staff

Created Date

Updated Date

---

## Order Status

Draft

Pending

Confirmed

Processing

Completed

Delivered

Cancelled

Refunded

---

## Order Actions

Create

Update

Cancel

Duplicate

Print

Export

Convert to Invoice

---

# MODULE 8

# Invoice Management

Invoice Number

Customer

Issue Date

Due Date

Status

Amount

Balance

---

## Invoice Status

Draft

Sent

Partially Paid

Paid

Overdue

Cancelled

---

## Features

Generate PDF

Send WhatsApp

Send Email

Print

Download

Recurring Invoice

---

# MODULE 9

# Payment Tracking

Methods:

Cash

Transfer

QRIS

E-Wallet

---

Features:

Record Payment

Partial Payment

Refund

Payment History

Outstanding Balance

---

# MODULE 10

# Task Management

Task Name

Description

Assignee

Priority

Due Date

Status

---

Statuses:

Pending

In Progress

Blocked

Completed

Archived

---

# MODULE 11

# Automation Engine

Triggers:

New Lead

New Customer

New Order

Order Completed

Invoice Overdue

Customer Birthday

Inactive Customer

---

Actions:

Send WhatsApp

Create Task

Assign User

Add Tag

Create Notification

Send Email

---

# MODULE 12

# Reporting

## Executive Dashboard

Revenue

Orders

Customers

Messages

Conversion

---

## Revenue Report

Daily

Weekly

Monthly

Yearly

---

## Customer Report

New Customers

Returning Customers

Lost Customers

---

## Staff Report

Orders Processed

Messages Handled

Response Time

---

# Non Functional Requirements

Availability

99.9%

---

Performance

Average Response Time:

<300ms

---

Scalability

10000+ Tenants

1000000+ Customers

10000000+ Messages

---

Security

OWASP Top 10 Compliance

RBAC

Audit Logging

Encryption

Secure Authentication

---

Compliance

GDPR Ready

PDPA Ready

Audit Ready

---

# Release Plan

## Phase 1

Authentication

CRM

WhatsApp Inbox

Orders

Invoices

Payments

Reports

---

## Phase 2

Automation

Task Management

Advanced Analytics

---

## Phase 3

AI Assistant

Chatbot Builder

Predictive Analytics

Advanced Integrations

---

# Acceptance Criteria

The product is considered successful when:

* Multi-tenant isolation verified
* WhatsApp messaging operational
* Orders and invoices connected
* Reports generated accurately
* Subscription plans enforced correctly
* Security audit passed
* Load testing completed successfully
