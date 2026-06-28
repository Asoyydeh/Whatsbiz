# 03_SECURITY.md

# Security Architecture & Hardening Guide

## Project

WhatsBiz CRM

Enterprise Multi-Tenant WhatsApp CRM SaaS

---

# Security Objectives

Primary Goals:

* Protect customer data
* Prevent tenant data leakage
* Prevent account takeover
* Prevent unauthorized access
* Protect payment information
* Protect WhatsApp integrations
* Maintain auditability
* Support future compliance requirements

---

# Security Principles

## Zero Trust

Never trust:

* Users
* Devices
* Networks
* APIs
* Internal Services

Always verify.

---

## Least Privilege

Users only receive permissions required to perform their tasks.

---

## Defense in Depth

Security must exist at:

* Network Layer
* Application Layer
* Authentication Layer
* Authorization Layer
* Database Layer
* Infrastructure Layer

---

## Secure By Default

Every new feature must:

* Deny access by default
* Require explicit authorization
* Produce audit logs

---

# Threat Model

## Critical Assets

Customer Data

Messages

Invoices

Payments

API Keys

User Accounts

Subscriptions

Audit Logs

---

# Threat Actors

External Attackers

Malicious Employees

Compromised Users

Competitors

Abusive Tenants

Automated Bots

---

# Security Domains

Authentication

Authorization

Tenant Isolation

Data Protection

Infrastructure Security

Application Security

Monitoring

Incident Response

Compliance

---

# Authentication Security

## Password Requirements

Minimum:

12 characters

Require:

Uppercase

Lowercase

Number

Special Character

---

## Password Storage

Use:

Argon2id

Never use:

MD5

SHA1

SHA256 only

bcrypt with weak cost

---

# Login Protection

Implement:

Rate Limiting

IP Tracking

Device Tracking

Risk Detection

Failed Login Monitoring

---

# Account Lockout

Example:

5 failed attempts

↓

Temporary lock

15 minutes

---

Repeated abuse

↓

Extended lock

---

# Session Security

Sessions stored securely.

Track:

User

Device

IP

Location

Login Time

Last Activity

---

# Refresh Token Rotation

Every refresh request:

Old Token Invalidated

New Token Generated

---

If reused:

Immediately revoke all sessions.

---

# Multi-Factor Authentication

Support:

TOTP

Recovery Codes

Future:

Passkeys

Hardware Keys

---

# Authorization Security

## RBAC

Role Based Access Control

---

Example

Owner

Can:

View All Customers

Delete Customers

Manage Billing

Manage Users

---

Staff

Can:

View Assigned Customers

Create Orders

Send Messages

Cannot:

Delete Customers

Manage Billing

---

# Permission Matrix

Every endpoint requires:

Role Check

Permission Check

Tenant Check

---

# Multi Tenant Security

## Critical Rule

Tenant A must NEVER access Tenant B data.

---

# Tenant Isolation Controls

Every table contains:

tenant_id

---

Every query must verify:

tenant_id

---

Every service must verify:

tenant_id

---

Every cache entry must include:

tenant_id

---

Every websocket room must include:

tenant_id

---

# Cross Tenant Attack Prevention

Prevent:

IDOR

Forced Browsing

UUID Enumeration

Broken Access Control

---

Example

GET

/customers/123

Must verify:

Customer belongs to current tenant.

---

# API Security

All APIs protected by:

JWT

RBAC

Tenant Validation

Input Validation

Rate Limiting

Audit Logging

---

# Rate Limiting

Anonymous

100 requests/hour

---

Authenticated

1000 requests/hour

---

Sensitive Endpoints

Password Reset

Login

MFA

API Key Creation

Additional limits required.

---

# Input Validation

Use:

Zod

Class Validator

DTO Validation

---

Reject:

Unexpected Fields

Malformed Data

Oversized Payloads

Invalid Types

---

# File Upload Security

Allowed Types:

PDF

PNG

JPG

WEBP

DOCX

XLSX

---

Disallowed:

Executable Files

Scripts

Archives

Unknown Types

---

# Upload Controls

Virus Scanning

File Type Validation

File Size Validation

Random File Names

Storage Isolation

---

# XSS Protection

Protect:

Messages

Customer Notes

Internal Notes

Task Comments

Templates

Automation Content

---

Use:

Output Encoding

Sanitization

CSP

---

# CSRF Protection

Required for:

Browser Sessions

Sensitive Actions

Billing Actions

User Management

---

# SQL Injection Protection

Use:

Prisma ORM

Parameterized Queries

Prepared Statements

Never use raw queries unless absolutely necessary.

---

# Security Headers

Required:

HSTS

CSP

X-Frame-Options

Referrer-Policy

X-Content-Type-Options

Permissions-Policy

---

# CORS Policy

Only trusted origins.

No wildcard origins in production.

---

# WhatsApp Security

## Webhook Verification

Verify:

Signature

Timestamp

Provider Secret

---

Reject:

Invalid Signature

Expired Request

Unknown Source

---

# Message Security

Validate:

Sender

Payload Structure

Media Types

Message Size

---

# Template Protection

Only approved templates may be sent.

Prevent:

Spam

Phishing

Mass Abuse

---

# API Keys

Generate:

Cryptographically Secure Keys

---

Store:

Hashed API Keys

Never plaintext.

---

Display key only once.

---

# Encryption

## Data In Transit

TLS 1.3

HTTPS Only

---

## Data At Rest

Encrypt:

API Keys

OAuth Tokens

Secrets

Webhook Secrets

Provider Credentials

---

# Secret Management

Never store secrets in:

Source Code

Git Repositories

Frontend Bundles

Logs

---

Store in:

Environment Variables

Secret Manager

Vault

---

# Logging Security

Never log:

Passwords

Tokens

Credit Card Data

OTP Codes

Secrets

---

# Audit Logging

Track:

User Login

User Logout

Permission Changes

Role Changes

Customer Changes

Message Actions

Order Changes

Payment Changes

Subscription Changes

---

# Audit Log Fields

Timestamp

User

Tenant

Resource

Action

IP Address

User Agent

Metadata

---

# Fraud Prevention

Detect:

Mass Messaging

Spam Campaigns

API Abuse

Credential Stuffing

Account Sharing

Bot Activity

---

# Anomaly Detection

Alert on:

Login From New Country

Mass Exports

Mass Deletions

Privilege Escalation

Excessive API Usage

---

# Backup Security

Encrypt Backups

---

Separate Storage

---

Access Restricted

---

Retention Policy

30 Days

90 Days

365 Days

---

# Disaster Recovery

Recovery Objectives

RPO:

15 Minutes

RTO:

1 Hour

---

# Infrastructure Security

## Containers

Run as Non-Root

Read Only Filesystem

Resource Limits

Security Profiles

---

# Database Security

Private Network Only

No Public Access

Strong Credentials

Encrypted Connections

Read Replicas

Backup Validation

---

# Redis Security

Authentication Required

Private Network Only

Disable Dangerous Commands

---

# Nginx Security

Rate Limiting

DDoS Protection

Security Headers

TLS Enforcement

Request Filtering

---

# Monitoring

Monitor:

Authentication Events

Authorization Failures

Webhook Failures

Database Errors

Queue Failures

API Abuse

---

# Security Alerts

Critical

Immediate Notification

---

High

Within 15 Minutes

---

Medium

Within 24 Hours

---

# Vulnerability Management

Monthly:

Dependency Scan

Container Scan

Secret Scan

Infrastructure Scan

---

Quarterly:

Penetration Testing

Architecture Review

Threat Modeling

---

# Security Testing Requirements

Mandatory Tests

Authentication Testing

Authorization Testing

Tenant Isolation Testing

IDOR Testing

Rate Limit Testing

Webhook Testing

File Upload Testing

XSS Testing

SQL Injection Testing

CSRF Testing

Business Logic Testing

---

# OWASP Compliance

OWASP Top 10

OWASP ASVS

OWASP API Security Top 10

OWASP SaaS Security Guidance

---

# Security Acceptance Criteria

Release Blockers:

Cross-Tenant Access

Critical Authentication Issues

Privilege Escalation

Sensitive Data Exposure

Broken Authorization

Remote Code Execution

---

Product cannot enter production until:

* Tenant isolation verified
* Security audit passed
* Penetration test completed
* Critical findings resolved
* Logging operational
* Monitoring operational
* Backup validation completed
