# OmniPay Hub

MASTER DEVELOPMENT PROMPT — VTU MULTI-SERVICE PLATFORM

PROJECT TITLE

Build a complete, production-ready VTU Multi-Service Platform that allows users to purchase Airtime, Data, Electricity, Cable TV subscriptions, Examination PINs/results services, and NIN Verification services from a web application and/or mobile-responsive platform.

The platform must have a powerful Super Admin Dashboard that gives the administrator complete control over users, services, transactions, wallets, pricing, commissions, API providers, reports, settings, and system activity.

The system should be designed as a secure, scalable, modular VTU platform, where additional services and API providers can be added later without rebuilding the entire application.

1. TECHNOLOGY STACK

Use the following architecture:

Frontend

Modern responsive web application

Mobile-first design

React / Next.js or an equivalent modern framework

TypeScript

Tailwind CSS

Clean component-based architecture

Professional dashboard UI

Responsive on desktop, tablet and mobile

Backend

Use a secure server-side backend.

Preferred architecture:

Supabase

PostgreSQL database

Supabase Authentication

Supabase Storage

Server-side Edge Functions/API routes for sensitive operations

Do NOT expose API secret keys, payment gateway secret keys, or verification API credentials in frontend code.

Database

Use PostgreSQL with properly related tables, indexes, constraints and Row Level Security (RLS).

Authentication

Implement:

Email/password registration

Login

Logout

Password reset

Email verification

Session management

Optional 2FA

Role-based access control

Roles should include at minimum:

User

Agent

Super Admin

The architecture must allow additional roles to be added later.

2. MAIN USER APPLICATION

Create a professional user dashboard.

The user should be able to:

Register

Login

Complete profile

Complete required KYC where applicable

Fund wallet

View wallet balance

Purchase services

View transaction history

Download/view transaction receipts

Receive notifications

Contact support

Manage profile

Change password

View account activity

The dashboard should display:

Current wallet balance

Total transactions

Successful transactions

Failed transactions

Pending transactions

Quick service buttons

Recent transactions

Notifications

Promotional announcements where enabled

3. SERVICE MODULES

The system must contain the following service modules.

A. AIRTIME

Allow users to purchase airtime.

Supported features:

Select network

Enter phone number

Select amount

Confirm transaction

Deduct wallet balance

Send request to Airtime API

Receive provider response

Update transaction status

Generate transaction reference

Display receipt

Save transaction history

Support configurable networks such as:

MTN

Airtel

Glo

9mobile

Network availability must be controlled from the Admin Dashboard.

4. DATA

Create a complete Data Purchase module.

Features:

Select network

Enter phone number

Select data plan

Display plan name

Display price

Confirm purchase

Wallet deduction

API request

Transaction status

Receipt

Transaction history

Allow the administrator to configure:

Networks

Data plans

Selling prices

Provider prices

Profit margin

Service availability

Support different categories where the provider supports them:

SME

Gifting

Corporate

Direct data

The Admin should be able to enable/disable each category.

5. ELECTRICITY

Create an Electricity Payment module.

Features:

Select electricity provider

Enter meter number

Select meter type

Validate meter

Display customer information

Enter payment amount

Confirm transaction

Deduct wallet

Process payment through API

Receive token where applicable

Display receipt

Save transaction

Support:

Prepaid

Postpaid

Electricity providers and pricing must be configurable from the Admin Dashboard.

6. CABLE TV

Create Cable TV subscription functionality.

Support providers such as:

DSTV

GOtv

Startimes

Features:

Select provider

Enter smartcard/IUC number

Validate customer

Display customer information

Select package

Display package price

Confirm subscription

Process transaction

Update status

Generate receipt

Save transaction history

Allow Admin to control:

Providers

Packages

Prices

Commission/profit

Service status

7. EXAMINATION SERVICES

Create an Examination Services module.

The architecture must support:

WAEC

NECO

NABTEB

JAMB

Where supported by the selected API provider, provide:

PIN/token purchase

Result checker services

Token/PIN retrieval

Transaction status

Receipt

Transaction history

The Admin Dashboard must allow each examination service to be independently:

Enabled

Disabled

Configured

Priced

Connected to a specific API provider

Do not assume that every provider supports every examination service. The API integration layer must be modular.

8. NIN VERIFICATION

Create a secure NIN Verification module.

Possible services:

NIN verification

NIN slip-related services where supported

Identity verification

Customer demographic verification where legally and contractually permitted

Features:

Enter required verification information

Validate request

Display required consent/privacy notice

Process verification securely

Return verification result

Save transaction/reference information

Store only necessary data

Protect sensitive information

Provide appropriate audit logging

Sensitive identity information must NOT be unnecessarily exposed in the frontend, logs, URLs or error messages.

Use approved verification APIs and comply with applicable Nigerian data protection and identity-verification requirements.

9. WALLET SYSTEM

Create a complete internal wallet system.

Each user should have a wallet.

Wallet features:

Wallet balance

Fund wallet

Transaction history

Wallet ledger

Debit

Credit

Refund

Reversal

Transaction reference

Payment reference

Every wallet transaction must have:

Unique transaction ID

User ID

Amount

Transaction type

Previous balance

New balance

Status

Reference

Timestamp

Description

Use database transactions/atomic operations to prevent double deductions and race conditions.

Never trust wallet balances calculated solely on the frontend.

The backend must be the source of truth.

10. WALLET FUNDING

Integrate payment gateways using a secure server-side architecture.

Preferred gateways:

Monnify

Flutterwave

PalmPay where an approved API/service is available

Do NOT use Paystack for this project.

Payment gateway credentials must be stored securely using environment variables/secrets.

Features:

Generate payment request

Redirect/open payment interface

Payment callback/webhook

Verify payment server-side

Credit wallet only after verified payment

Prevent duplicate wallet credits

Record payment reference

Store gateway response safely

Display funding history

Implement webhook idempotency.

A payment must never be credited twice because the gateway sends the webhook more than once.

11. TRANSACTION ENGINE

Create a centralized transaction engine.

Every service should use a common transaction architecture.

Example flow:

USER
↓
SELECT SERVICE
↓
VALIDATE REQUEST
↓
CHECK WALLET
↓
CREATE PENDING TRANSACTION
↓
RESERVE/DEBIT FUNDS SAFELY
↓
SEND REQUEST TO API PROVIDER
↓
RECEIVE PROVIDER RESPONSE
↓
PROCESS RESPONSE
↓
SUCCESS / FAILED / PENDING
↓
UPDATE WALLET
↓
SAVE PROVIDER REFERENCE
↓
NOTIFY USER
↓
GENERATE RECEIPT

The transaction engine must support:

Pending

Processing

Successful

Failed

Reversed

Refunded

Do not immediately mark a transaction successful simply because an API request was sent.

12. API INTEGRATION LAYER

Create a separate API Integration Layer.

The platform should not directly hard-code individual API providers inside every service.

Instead create adapters/providers.

Example architecture:

Service
→ Service Engine
→ Provider Adapter
→ API Provider

For example:

Airtime
→ VTU Provider Adapter
→ VTpass API

Data
→ VTU Provider Adapter
→ VTpass API

Electricity
→ VTU Provider Adapter
→ VTpass API

Cable TV
→ VTU Provider Adapter
→ VTpass API

Exams
→ Examination Provider Adapter
→ Selected Provider API

NIN
→ NIN Verification Adapter
→ Approved Verification API

This architecture allows the administrator/developer to replace an API provider later without rebuilding the whole system.

13. VTUPASS INTEGRATION

Where applicable, integrate VTpass for:

Airtime

Data

Electricity

Cable TV

Examination services where supported

Create server-side functions for:

API authentication

Service lookup

Airtime purchase

Data purchase

Electricity validation/payment

Cable validation/subscription

Examination services

Transaction status checking

Use environment variables for:

API username

API password/key

API secret

Sandbox/live URLs

The Admin Dashboard must show the current API provider configuration without exposing secret credentials.

14. API FAILURE HANDLING

Implement robust API failure handling.

If a provider:

Times out

Returns an unknown response

Returns pending

Returns insufficient provider balance

Returns invalid customer

Returns duplicate transaction

Returns service unavailable

The system must handle the response appropriately.

Do not automatically deduct money permanently if the transaction has not been confirmed.

Create a transaction reconciliation mechanism for pending transactions.

Allow the system to check provider status later.

15. ADMIN DASHBOARD

Create a powerful Super Admin Dashboard.

The Admin Dashboard should have:

Dashboard Overview

Display:

Total users

Active users

Total agents

Total transactions

Successful transactions

Failed transactions

Pending transactions

Total sales

Total profit

Wallet funding

Service usage

Today's transactions

Monthly statistics

Include charts and analytics.

16. USER MANAGEMENT

Admin can:

View users

Search users

Filter users

Create users

Edit users

Suspend users

Activate users

View user wallet

View transactions

View KYC status

View account activity

Reset appropriate account settings

Do not allow administrators to casually view sensitive credentials or authentication passwords.

17. SERVICE MANAGEMENT

Admin must be able to control every service.

For each service:

Enable

Disable

Set price

Set markup

Set commission

Configure provider

Set limits

View service statistics

Example:

Airtime
[Enabled]

Data
[Enabled]

Electricity
[Enabled]

Cable TV
[Enabled]

Exams
[Enabled]

NIN Verification
[Disabled]

When a service is disabled, users should immediately see that the service is unavailable.

18. PRICING MANAGEMENT

Create a pricing management system.

Admin can configure:

Provider cost

Selling price

User price

Agent price

Commission

Service charge

Minimum transaction amount

Maximum transaction amount

Pricing should be database-driven.

Do not hard-code prices into frontend components.

19. AGENT SYSTEM

Create an optional Agent system.

Agents can:

Login

Fund wallet

Purchase services

View transactions

Receive commission

View commission history

View sales reports

Admin can:

Create agents

Suspend agents

Configure agent pricing

Configure commissions

View agent sales

View agent profit

Manage agent wallets

The architecture should support future agent levels/plans.

20. COMMISSION SYSTEM

Create a flexible commission engine.

Commission can be configured based on:

Service

Network

Product

Agent level

Transaction amount

Example:

Data transaction
→ Provider cost
→ Selling price
→ Commission
→ Platform profit

Every commission transaction should be recorded in a ledger.

21. TRANSACTION MANAGEMENT

Admin must have complete transaction management.

Features:

Search by transaction ID

Search by user

Search by phone number

Filter by service

Filter by status

Filter by date

View provider reference

View payment reference

View transaction details

View API response status

Reconcile pending transaction

Refund where authorized

Reverse transaction where authorized

Sensitive provider responses must be protected from unnecessary exposure.

22. REPORTS AND ANALYTICS

Create reporting functionality.

Reports:

Daily sales

Weekly sales

Monthly sales

Yearly sales

Service performance

User transactions

Agent transactions

Profit report

Commission report

Wallet funding report

Failed transactions

Pending transactions

Refund report

Allow export where appropriate:

CSV

Excel

PDF

23. NOTIFICATION SYSTEM

Create a centralized notification engine.

Support:

In-app notifications

Email

SMS

Possible SMS provider:

Termii

Notifications should be sent for:

Successful transaction

Failed transaction

Wallet funding

Refund

Account registration

Password reset

Important announcements

Admin should be able to configure notification settings.

24. RECEIPT SYSTEM

Create professional digital receipts.

Receipt should include:

Business/platform name

Transaction reference

Service

Customer information where appropriate

Amount

Status

Date/time

Provider reference where appropriate

Support contact

QR/reference verification where useful

Users should be able to view and download receipts.

25. DATABASE STRUCTURE

Create a normalized PostgreSQL database.

Recommended core tables:

users

id

email

phone

full_name

role

status

created_at

updated_at

profiles

user_id

address

profile information

KYC status

created_at

updated_at

wallets

id

user_id

balance

currency

status

created_at

updated_at

wallet_transactions

id

wallet_id

user_id

type

amount

previous_balance

new_balance

reference

status

description

created_at

service_transactions

id

user_id

service_type

provider

amount

cost

profit

commission

status

customer_reference

provider_reference

transaction_reference

request_metadata

response_metadata

created_at

updated_at

services

id

name

code

description

enabled

provider

created_at

updated_at

service_products

id

service_id

product_code

name

provider_cost

selling_price

agent_price

commission

enabled

agents

id

user_id

agent_level

status

commission_plan

commissions

id

agent_id

transaction_id

amount

status

created_at

payment_transactions

id

user_id

gateway

amount

payment_reference

gateway_reference

status

metadata

created_at

api_providers

id

name

service_type

status

configuration

created_at

Secrets must NOT be stored as plain text in ordinary database fields unless appropriately encrypted/secured.

notifications

id

user_id

type

title

message

read

created_at

audit_logs

id

admin/user_id

action

resource

resource_id

metadata

IP information where appropriate

created_at

26. DATABASE SECURITY

Implement Supabase Row Level Security.

Users should only access their own:

Profile

Wallet

Wallet transactions

Service transactions

Notifications

Receipts

Agents should only access authorized agent information.

Only authorized administrators should access:

All users

All transactions

Service configuration

Pricing

API configuration

Reports

System settings

Never rely only on frontend route protection.

All authorization must also be enforced server-side/database-side.

27. SECURITY REQUIREMENTS

Implement:

HTTPS/SSL

Secure authentication

Role-based access control

Row Level Security

Server-side API calls

Input validation

SQL injection protection

XSS protection

CSRF protection where applicable

Rate limiting

API request validation

Secure cookies/session handling

Webhook signature verification where supported

Payment idempotency

Transaction idempotency

Audit logging

Secure file upload validation

Backup strategy

Error handling without exposing secrets

Never display:

API secret keys

Payment secret keys

Passwords

Private tokens

Sensitive verification data

in frontend source code, logs, URLs or client-visible errors.

28. ADMIN SECURITY

The Super Admin Dashboard must have additional protection.

Implement:

Admin authentication

Role verification

Optional 2FA

Session timeout

Audit logs

Login activity

Failed login monitoring

Permission checks

Every important administrative action should be logged.

Examples:

Changed service price

Disabled service

Enabled API provider

Suspended user

Approved refund

Changed commission

Modified system settings

29. UI/UX DESIGN

The interface should look like a modern professional Nigerian fintech/VTU platform.

Design principles:

Premium

Minimal

Clean

Professional

Fast

Mobile responsive

Easy navigation

Consistent spacing

Clear typography

Professional icons

Avoid unnecessary emojis

Use cards, tables, charts and dashboards appropriately

Main navigation:

Dashboard
Airtime
Data
Electricity
Cable TV
Exams
NIN Verification
Wallet
Transactions
Notifications
Support
Profile

Admin navigation:

Dashboard
Users
Agents
Services
Products
Pricing
Transactions
Wallets
Payments
Commissions
API Providers
Reports
Notifications
Settings
Audit Logs

30. LANDING PAGE

Create a professional public landing page.

Sections:

Hero section

Platform benefits

Available services

How it works

Wallet/payment explanation

Security section

Frequently Asked Questions

Contact/support

Login/Register buttons

Services displayed:

Airtime
Data
Electricity
Cable TV
Exams
NIN Verification

31. ADMIN CONTROL OF THE ENTIRE PLATFORM

The most important requirement is that the Super Admin must have centralized control.

The administrator should be able to:

Manage users

Manage agents

Enable/disable services

Configure service providers

Manage prices

Manage commissions

Manage wallet settings

Manage payment gateways

Manage API providers

Manage transaction settings

View reports

Manage notifications

Manage system settings

View audit logs

The system should be modular so that disabling one service does not affect the other services.

32. ERROR HANDLING

Create user-friendly error messages.

Examples:

Instead of:

"500 Internal Server Error"

show:

"Unable to process your transaction at the moment. Please try again."

However, detailed technical errors should be recorded securely in server logs for administrators/developers.

33. TRANSACTION STATUS SYSTEM

Use standardized statuses:

INITIATED

PENDING

PROCESSING

SUCCESS

FAILED

REVERSED

REFUNDED

Make sure all services use the same status architecture.

34. RECONCILIATION

Create a reconciliation system for:

Payment gateways

VTU providers

Wallet transactions

Service transactions

The system should be able to identify:

Wallet debited but provider failed

Provider successful but local status pending

Duplicate transaction

Payment received but wallet not credited

Payment credited twice

Unknown provider response

Admin should be able to investigate and resolve these cases.

35. CONFIGURATION SYSTEM

Do not hard-code important business settings.

Create Admin-configurable settings for:

Platform name

Logo

Contact email

Support phone

Service charges

Minimum wallet funding

Maximum wallet funding

Transaction limits

Maintenance mode

Service availability

Notification settings

API providers

Payment gateways

36. MAINTENANCE MODE

Create a maintenance mode.

Admin can activate maintenance mode globally or for individual services.

Example:

"Data Service is temporarily unavailable. Please try again later."

Other services should continue working if they are not affected.

37. API HEALTH MONITORING

Create an API/provider monitoring section.

Admin should see:

Provider status

Last successful request

Last failed request

Response time

Error count

Pending transactions

Provider availability

Where possible, provide a "Test Connection" function that performs a safe server-side health check.

38. PERFORMANCE

Optimize the application for:

Fast page loading

Database indexes

Pagination

Lazy loading

API caching where appropriate

Background jobs

Queue processing

Efficient database queries

Do not load thousands of transactions at once.

Use pagination and server-side filtering.

39. RESPONSIVE DESIGN

The entire system must work properly on:

Desktop

Laptop

Tablet

Android phones

iPhone

Admin dashboard should also be responsive.

40. DEVELOPMENT ENVIRONMENTS

Support:

Development

Local development

Sandbox APIs

Test payments

Test transactions

Production

Live APIs

Live payment gateways

Secure environment variables

Production database

Production domain

Never mix sandbox credentials with production credentials.

41. ENVIRONMENT VARIABLES

Create a secure environment configuration.

Examples:

DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

VTPASS_API_URL
VTPASS_API_KEY
VTPASS_SECRET

MONNIFY_API_KEY
MONNIFY_SECRET_KEY
MONNIFY_CONTRACT_CODE

FLUTTERWAVE_PUBLIC_KEY
FLUTTERWAVE_SECRET_KEY

PALMPAY_API_CONFIGURATION

TERMII_API_KEY

NIN_API_CONFIGURATION

Never commit secret environment variables to GitHub.

Create a .env.example file containing placeholder names only.

42. TESTING

Before production, test:

Authentication

Registration

Login

Logout

Password reset

Authorization

Wallet

Funding

Successful funding

Failed funding

Duplicate webhook

Wallet debit

Refund

Airtime

Successful transaction

Failed transaction

Invalid number

Insufficient balance

Data

Successful purchase

Failed purchase

Invalid plan

Provider timeout

Electricity

Meter validation

Payment

Token response

Failed payment

Cable TV

Customer validation

Subscription

Failed subscription

Exams

PIN/token purchase

Failed request

Provider pending

NIN

Verification request

Invalid details

API failure

Secure handling of sensitive data

Admin

User management

Service control

Pricing

API configuration

Reports

Audit logs

43. IMPORTANT BUSINESS RULE

The platform must NEVER assume that an external API transaction is successful simply because the request was submitted.

The transaction should only become SUCCESS after receiving an appropriate successful response or verified status from the provider.

If the provider returns an uncertain/pending response, mark the transaction as PENDING and perform reconciliation/status checking.

44. PROJECT STRUCTURE

Use a clean modular architecture.

Suggested structure:

/app
/components
/features
/services
/api
/lib
/hooks
/types
/database
/supabase
/functions
/admin
/user
/auth
/utils

Separate:

UI

Business logic

API integration

Database access

Authentication

Admin functionality

Service modules

Do not place the entire application in one large file.

45. DELIVERABLES

The completed project must include:

Public landing page

User registration/login

User dashboard

Airtime module

Data module

Electricity module

Cable TV module

Examination module

NIN Verification module

Wallet system

Payment gateway integration architecture

Transaction engine

API integration layer

Admin Dashboard

User management

Agent management

Service management

Pricing management

Commission management

Transaction management

Reports and analytics

Notification system

Receipt system

Audit logs

Security controls

Database schema

RLS policies

Environment configuration

Error handling

Testing structure

Production deployment documentation

46. DEVELOPMENT APPROACH

Build the system in phases.

PHASE 1 — FOUNDATION

Project setup

Database

Authentication

User roles

Admin roles

UI design system

PHASE 2 — WALLET

Wallet database

Wallet ledger

Funding

Payment gateway

Webhooks

Idempotency

PHASE 3 — SERVICES

Build:

Airtime

Data

Electricity

Cable TV

Exams

NIN Verification

PHASE 4 — ADMIN

Dashboard

Users

Services

Pricing

Transactions

APIs

Reports

Settings

PHASE 5 — SECURITY

RLS

RBAC

Rate limiting

Audit logs

Secure API handling

Webhook security

PHASE 6 — TESTING

Test every service using sandbox/test credentials before enabling production transactions.

PHASE 7 — PRODUCTION

Production environment

Live API credentials

Domain

SSL

Database backup

Monitoring

Final security review

47. FINAL REQUIREMENT

Do not create a simple demo or static frontend.

Build this as a real modular VTU platform architecture where the frontend, backend, database, wallet, transaction engine, API integrations and Super Admin Dashboard are connected.

All important business operations must happen securely on the backend.

The system must be designed so that:

USER
→ selects service
→ submits request
→ backend validates request
→ wallet is checked
→ transaction is created
→ service provider API is called
→ provider response is processed
→ transaction status is updated
→ wallet is reconciled
→ receipt is generated
→ user is notified
→ transaction appears in Admin Dashboard.

The Super Admin must have centralized control over the entire platform without needing to modify source code for normal operations such as enabling/disabling services, changing prices, managing users, managing commissions, viewing transactions, configuring approved providers, and viewing reports.

Build the system cleanly, securely, modularly and production-ready, with future expansion in mind. please i hope you understand this project well but i dont want the any agent dashboard itz only users and admin dashboard and this is the client logo please make it very professional that impresss everyone see it

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3b4e7777-9e85-440a-bdb0-346d4062314e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
