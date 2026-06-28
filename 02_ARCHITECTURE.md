# 02_ARCHITECTURE.md

# System Architecture Document

## Project

WhatsBiz CRM

Enterprise Multi-Tenant WhatsApp CRM SaaS

---

# Architecture Goals

The platform must support:

* 10,000+ tenants
* 1,000,000+ customers
* 10,000,000+ messages
* Horizontal scaling
* High availability
* Multi-region deployment ready
* Secure tenant isolation

---

# Architectural Principles

## Clean Architecture

Layers:

1. Presentation Layer
2. Application Layer
3. Domain Layer
4. Infrastructure Layer

Dependency Direction:

Presentation

↓

Application

↓

Domain

↓

Infrastructure

Domain must never depend on Infrastructure.

---

# DDD (Domain Driven Design)

Bounded Contexts:

Authentication

Tenant Management

CRM

Messaging

Orders

Invoices

Payments

Automation

Tasks

Reporting

Billing

Administration

---

# High Level Architecture

Client

↓

CDN

↓

Nginx Load Balancer

↓

Next.js Frontend

↓

API Gateway

↓

NestJS Backend

↓

Redis

↓

PostgreSQL

↓

BullMQ

↓

Worker Services

↓

WhatsApp Provider

---

# Frontend Architecture

Framework:

Next.js

Architecture:

Feature Based

---

# Frontend Folder Structure

src/

app/

components/

features/

hooks/

providers/

services/

store/

types/

utils/

lib/

styles/

---

# Feature Modules

auth/

crm/

customers/

orders/

payments/

invoices/

messaging/

automation/

reports/

billing/

settings/

---

# State Management

React Query

For:

Server State

Caching

Synchronization

---

Zustand

For:

UI State

Sidebar

Theme

Filters

Selections

---

# Form Management

React Hook Form

Zod Validation

---

# Backend Architecture

Framework:

NestJS

Architecture:

Modular Monolith

Microservice Ready

---

# Backend Folder Structure

src/

modules/

auth/

tenants/

users/

crm/

customers/

messaging/

orders/

invoices/

payments/

automation/

tasks/

reports/

billing/

common/

database/

config/

infrastructure/

---

# NestJS Module Structure

controller

service

repository

dto

entity

guard

interceptor

decorator

validator

events

listeners

---

# Multi Tenant Architecture

Strategy:

Shared Database

Shared Schema

Tenant Column

---

Every Table Contains

tenant_id

---

Example

customer

id

tenant_id

name

phone

email

---

Query Filtering

All database queries must include:

WHERE tenant_id = currentTenant

---

Tenant Resolution

Source Priority:

1. JWT
2. Subdomain
3. Custom Domain

---

Example

tenant1.whatsbiz.com

tenant2.whatsbiz.com

---

# Tenant Middleware

Responsibilities

Resolve tenant

Validate tenant

Inject tenant context

Prevent cross tenant access

---

# Database Architecture

Database

PostgreSQL

---

ORM

Prisma

---

Primary Key Strategy

UUID v7

Reason:

Better indexing

Chronological ordering

Horizontal scaling

---

# Database Naming Convention

snake_case

Example:

customer_messages

customer_orders

invoice_payments

---

# Core Database Tables

tenants

users

roles

permissions

user_roles

customers

tags

customer_tags

conversations

messages

attachments

orders

order_items

products

services

invoices

invoice_items

payments

tasks

task_comments

notifications

automations

automation_runs

audit_logs

subscriptions

plans

api_keys

webhooks

---

# Customer Module Schema

Customer

1:N Orders

1:N Invoices

1:N Payments

1:N Conversations

1:N Tasks

---

# Messaging Architecture

Entities

Conversation

Message

Attachment

Participant

Assignment

Label

Template

---

Conversation

Contains:

Customer

Assigned User

Status

Priority

Last Message

Unread Count

---

# Message Types

TEXT

IMAGE

VIDEO

DOCUMENT

VOICE

LOCATION

TEMPLATE

SYSTEM

---

# WhatsApp Integration Layer

Provider Adapter Pattern

---

Interface

MessagingProvider

Methods:

sendMessage()

sendImage()

sendDocument()

sendTemplate()

receiveWebhook()

verifyWebhook()

---

Provider Implementations

WhatsApp Cloud API

WhatsApp Business API

Future Providers

Twilio

360Dialog

WATI

---

# Webhook Architecture

WhatsApp

↓

Webhook Controller

↓

Message Processor

↓

Event Bus

↓

Conversation Update

↓

Realtime Notification

---

# Event Driven Architecture

Events

CustomerCreated

ConversationCreated

MessageReceived

MessageSent

OrderCreated

InvoiceGenerated

PaymentReceived

SubscriptionExpired

TaskCreated

---

# Event Flow

MessageReceived

↓

Save Message

↓

Update Conversation

↓

Emit Socket Event

↓

Trigger Automation

↓

Generate Audit Log

---

# Queue System

Technology:

BullMQ

Redis

---

Queues

message_queue

invoice_queue

email_queue

automation_queue

notification_queue

report_queue

analytics_queue

---

Benefits

Retry

Scheduling

Delayed Jobs

Rate Limiting

Scalability

---

# Redis Architecture

Use Cases

Caching

Sessions

Rate Limiting

Queue Backend

Realtime Presence

---

Cache Examples

Customer Profile

Dashboard Metrics

Reports

Subscription Data

Permissions

---

# Realtime Architecture

Socket.IO

---

Realtime Features

New Messages

Typing Indicators

Unread Counts

Notifications

Order Updates

Task Updates

---

# Order Management Architecture

Order

↓

Order Items

↓

Invoice

↓

Payment

---

Status Workflow

Draft

Pending

Confirmed

Processing

Completed

Delivered

Cancelled

Refunded

---

# Invoice Architecture

Invoice

↓

Invoice Items

↓

Payment Records

↓

Outstanding Balance

---

Invoice States

Draft

Sent

Partially Paid

Paid

Overdue

Cancelled

---

# Payment Architecture

Methods

Cash

Transfer

QRIS

E-Wallet

Gateway

---

Gateway Adapters

Midtrans

Xendit

Stripe

---

# Automation Engine

Architecture

Trigger

↓

Condition

↓

Action

---

Trigger Examples

New Customer

New Message

Order Completed

Invoice Overdue

Birthday

No Activity

---

Action Examples

Send WhatsApp

Create Task

Send Email

Assign User

Add Tag

Update Score

---

# Search Architecture

PostgreSQL Full Text Search

---

Search Targets

Customers

Orders

Invoices

Messages

Tasks

---

Indexes

GIN Index

Trigram Index

Composite Index

---

# Analytics Architecture

Source

Operational Database

↓

Aggregation Jobs

↓

Analytics Tables

↓

Dashboard

---

Materialized Views

Daily Revenue

Monthly Revenue

Customer LTV

Customer Retention

Message Statistics

---

# Audit Logging

Track:

Login

Logout

Message Sent

Message Deleted

Customer Updated

Invoice Created

Payment Added

Role Changed

Subscription Changed

---

Audit Schema

user_id

tenant_id

resource

action

timestamp

ip_address

user_agent

metadata

---

# File Storage Architecture

Provider

MinIO

S3 Compatible

---

Storage Types

Images

Videos

Invoices

Documents

Attachments

Exports

Backups

---

# Security Architecture

Authentication

JWT

Refresh Token

2FA

Argon2 Password Hashing

---

Authorization

RBAC

Permission Matrix

Tenant Isolation

---

API Protection

Rate Limiting

Input Validation

CSRF

Secure Headers

CORS

---

# Scalability Strategy

Phase 1

Single Node

---

Phase 2

Load Balanced

Multiple Backend Nodes

---

Phase 3

Dedicated Workers

Dedicated Redis

Read Replicas

---

Phase 4

Multi Region Deployment

Global CDN

Database Clustering

---

# Monitoring Architecture

Prometheus

Metrics Collection

---

Grafana

Visualization

---

Loki

Centralized Logs

---

Health Checks

API

Database

Redis

Queue

Storage

WhatsApp Provider

---

# Backup Strategy

Database

Daily Incremental

Weekly Full Backup

---

Storage

Nightly Backup

---

Retention

30 Days

90 Days

365 Days

---

# Disaster Recovery

RPO

15 Minutes

RTO

1 Hour

---

# CI/CD Architecture

GitHub

↓

GitHub Actions

↓

Build

↓

Tests

↓

Docker Image

↓

Registry

↓

Production Deployment

---

# Production Environment

Frontend

Next.js Container

---

Backend

NestJS Container

---

Database

PostgreSQL

---

Cache

Redis

---

Queue

BullMQ

---

Storage

MinIO

---

Reverse Proxy

Nginx

---

Monitoring

Grafana

Prometheus

Loki

---

# Future Architecture Roadmap

Phase 2

AI Assistant

Chatbot Builder

Voice AI

---

Phase 3

Marketplace Integration

Shopee

Tokopedia

TikTok Shop

---

Phase 4

ERP Integration

Accounting Integration

Warehouse Management

Business Intelligence Platform
