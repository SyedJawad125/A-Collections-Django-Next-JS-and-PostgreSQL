<!-- You are a Senior Software Architect, Technical Writer, and Open Source Maintainer.

Write a professional, detailed, GitHub-quality README.md for my Full Stack E-Commerce Platform.

The README should look like a production-level open-source project maintained by a senior software engineer.

========================================
PROJECT OVERVIEW
========================================

Project Name:
E-Commerce Platform

Backend:
- Django
- Django REST Framework
- PostgreSQL

Frontend:
- Next.js
- React
- Tailwind CSS

Database:
- PostgreSQL

Authentication:
- JWT Authentication
- OTP Verification
- Email Verification
- Password Reset via OTP
- Secure Login
- Role Based Access Control (RBAC)

Architecture:
- REST API
- Modular Django Apps
- Clean Architecture
- Repository Pattern where required
- Service Layer
- PostgreSQL
- Media Storage
- Production Ready

========================================
USER MANAGEMENT
========================================

The system uses a completely custom User model.

Features include:

• Custom Authentication
• Username Login
• Email Support
• Mobile Number
• Profile Image Upload
• Email Verification
• OTP Activation
• OTP Password Reset
• Password Reset Link Token
• User Blocking
• Login Attempt Tracking
• Active/Inactive Users
• Staff Users
• Superusers
• Customers
• Employees

Role Based Access Control includes:

• Roles
• Permissions
• Permission Groups
• Module Permissions

Employee Management includes:

• Invite Employees
• Employee Status
• Employee Accounts

Push Notification Device Tokens are stored.

========================================
PRODUCT MODULE
========================================

Product system supports:

Categories

Products

Product Images

Product Variants

Colors

Materials

Sizes

Inventory Management

Product Tags

Sales Products

Discount Products

Product Ratings

Product Reviews

Average Rating Calculation

SKU Generation

Stock Quantity

Low Stock Detection

Inventory Reorder Point

Maximum Stock

Minimum Stock

========================================
SHOPPING FEATURES
========================================

Shopping Cart

Guest Cart

Authenticated Cart

Wishlist

Coupons

Discount Codes

Shipping Methods

Delivery Address

Saved Addresses

Order Placement

Checkout

Payment Tracking

Multiple Payment Methods

Cash on Delivery

JazzCash

EasyPaisa

PayPal

Credit Card

Debit Card

Order History

Order Details

Return Requests

Refund Management

Delivery Tracking

========================================
PAYMENT MODULE
========================================

Payment Model supports:

Transaction IDs

Payment Status

Gateway Responses

Refunds

Audit Logs

Payment Gateways

========================================
ORDER MANAGEMENT
========================================

Order Lifecycle:

Pending

Booked

Processing

Delivered

Cancelled

Each order stores:

Customer

Delivery Address Snapshot

Shipping Method

Coupon

Discount

Shipping Cost

Payment Status

Order Details

========================================
CUSTOMER FEATURES
========================================

Customer can:

Register

Verify Account

Login

Forgot Password

Reset Password

Browse Products

Search Products

Filter Products

View Categories

Add to Cart

Update Cart

Remove Cart Items

Add Wishlist

Remove Wishlist

Checkout

Apply Coupons

Place Orders

Track Orders

Review Products

Rate Products

Request Returns

Manage Addresses

Update Profile

========================================
ADMIN FEATURES
========================================

Admin Dashboard

Manage Users

Manage Employees

Manage Roles

Manage Permissions

Manage Products

Manage Categories

Manage Inventory

Manage Orders

Manage Payments

Manage Coupons

Manage Shipping

Manage Reviews

Manage Return Requests

Manage Email Templates

Manage Media

========================================
EMAIL SYSTEM
========================================

Supports dynamic Email Templates.

Templates include:

Account Activation

Password Reset

Order Confirmation

Welcome Email

OTP Verification

Notifications

========================================
MEDIA MANAGEMENT
========================================

Image Categories

Image Library

Product Images

Profile Images

Media Upload

========================================
DATABASE
========================================

Database is PostgreSQL.

Use proper indexing.

Optimized relationships.

Foreign Keys

OneToOne

ManyToMany

Computed Properties

Constraints

Validation

========================================
SECURITY FEATURES
========================================

JWT Authentication

OTP Authentication

Email Verification

Password Hashing

Custom Validators

RBAC

Permission Based Authorization

Secure Password Reset

Login Attempt Tracking

Account Blocking

Input Validation

CSRF Protection

XSS Protection

SQL Injection Protection

========================================
API FEATURES
========================================

REST APIs

Pagination

Filtering

Searching

Sorting

Validation

Serializer Layer

Custom Permissions

Error Handling

Reusable Responses

========================================
PROJECT STRUCTURE
========================================

Generate a beautiful folder tree like:

backend/
    apps/
    authentication/
    ecommerce/
    media/
    utils/
    config/
    requirements.txt

frontend/
    app/
    components/
    services/
    hooks/
    context/
    styles/

========================================
README SHOULD INCLUDE
========================================

Create the README with these sections:

# Project Banner

# Introduction

# Features

# Technologies Used

# System Architecture

# Backend Stack

# Frontend Stack

# Database

# Authentication Flow

# Role Based Access Control

# User Management

# Product Management

# Inventory Management

# Shopping Cart

# Wishlist

# Orders

# Payments

# Coupons

# Shipping

# Reviews

# Returns

# Email Templates

# API Features

# Folder Structure

# Installation

Backend Installation

Frontend Installation

Environment Variables

Database Setup

Migration Commands

Run Backend

Run Frontend

========================================
Include commands such as:

python -m venv venv

pip install -r requirements.txt

python manage.py migrate

python manage.py createsuperuser

python manage.py runserver

npm install

npm run dev

========================================

Add an example .env file.

Include:

SECRET_KEY

DEBUG

DATABASE_URL

DB_NAME

DB_USER

DB_PASSWORD

DB_HOST

DB_PORT

EMAIL_HOST

EMAIL_PORT

EMAIL_USER

EMAIL_PASSWORD

JWT_SECRET

========================================

Add API documentation section.

Example endpoints:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/verify-otp

POST /api/auth/forgot-password

POST /api/auth/reset-password

GET /api/products

GET /api/categories

POST /api/cart

GET /api/orders

POST /api/reviews

========================================

Include deployment section.

Deployment using:

Docker

Nginx

Gunicorn

PostgreSQL

Ubuntu

========================================

Include future enhancements:

Redis

Celery

RabbitMQ

WebSockets

Stripe

ElasticSearch

AI Product Recommendation

Recommendation Engine

Image Search

Microservices

Kubernetes

========================================

Include contribution guidelines.

Include coding standards.

Include license section.

Include acknowledgements.

========================================

Formatting Requirements:

- Use GitHub Markdown.
- Use emojis for section headings.
- Use tables wherever useful.
- Use badges at the top (Python, Django, DRF, Next.js, PostgreSQL, Tailwind CSS, JWT).
- Include architecture diagrams using Mermaid.
- Include API flow diagrams using Mermaid.
- Include authentication sequence diagrams.
- Include database relationship overview (high-level).
- Make it look like a top 1% GitHub repository.
- The README should be approximately 6,000–10,000 words.
- Use professional, concise, and polished technical documentation suitable for recruiters, hiring managers, and open-source contributors. -->





<!-- <div align="center">

# 🛍️ E-Commerce Platform

### A Production-Ready, Full-Stack E-Commerce System

**Django REST Framework · Next.js · PostgreSQL · JWT Authentication**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.15-A30000?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#-license)

[Features](#-features) • [Architecture](#-system-architecture) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Deployment](#-deployment) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Introduction](#-introduction)
- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [System Architecture](#-system-architecture)
- [Backend Stack](#-backend-stack)
- [Frontend Stack](#-frontend-stack)
- [Database](#-database)
- [Authentication Flow](#-authentication-flow)
- [Role Based Access Control](#-role-based-access-control-rbac)
- [User Management](#-user-management)
- [Product Management](#-product-management)
- [Inventory Management](#-inventory-management)
- [Shopping Cart](#-shopping-cart)
- [Wishlist](#-wishlist)
- [Orders](#-orders)
- [Payments](#-payments)
- [Coupons](#-coupons)
- [Shipping](#-shipping)
- [Reviews](#-reviews--ratings)
- [Returns & Refunds](#-returns--refunds)
- [Email Templates](#-email-system)
- [API Features](#-api-features)
- [Folder Structure](#-folder-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [Coding Standards](#-coding-standards)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 📌 Introduction

**E-Commerce Platform** is a modular, production-grade full-stack application built to power modern online retail businesses. It combines a **Django REST Framework** backend with a **Next.js / React** frontend, backed by **PostgreSQL** for relational data integrity.

The system is designed around **clean architecture principles** — a clear separation between the API layer, service layer, and data layer — making it easy to extend, test, and scale. It supports the complete e-commerce lifecycle: from user registration and OTP verification, through product discovery and cart management, to checkout, multi-gateway payments, order fulfillment, and post-purchase returns.

This project is intended as both a **reference implementation** for building enterprise-grade commerce platforms and a **launchpad** for teams that need a solid, secure, and extensible foundation rather than starting from scratch.

**Who is this for?**

| Audience | Why it matters |
|---|---|
| 🚀 Startups | A ready-made, secure commerce backend + storefront to launch on |
| 🏢 Enterprises | Modular architecture that fits into existing microservice ecosystems |
| 👨‍💻 Developers | Clean, well-documented codebase to learn production Django/Next.js patterns |
| 🎓 Recruiters / Hiring Managers | A demonstration of full-stack architectural competency |

---

## ✨ Features

<table>
<tr><td width="50%" valign="top">

### 🔐 Authentication & Security
- JWT-based authentication (access + refresh tokens)
- OTP verification (registration & password reset)
- Email verification workflow
- Secure password hashing (PBKDF2 / Argon2)
- Login attempt tracking & account blocking
- Role-Based Access Control (RBAC)
- CSRF / XSS / SQL Injection protections

### 👥 User Management
- Custom user model (username, email, mobile)
- Profile image uploads
- Staff, superuser, customer & employee roles
- Employee invitations & status management
- Push notification device token storage

### 🛒 Shopping Experience
- Guest & authenticated cart
- Wishlist management
- Product search, filter & sort
- Coupons & discount codes
- Multiple saved delivery addresses

</td><td width="50%" valign="top">

### 📦 Product Catalog
- Categories, variants, colors, sizes, materials
- SKU generation & inventory tracking
- Low stock detection & reorder points
- Product ratings & average rating computation
- Sales & discount pricing

### 💳 Payments & Orders
- Multiple gateways: JazzCash, EasyPaisa, PayPal, COD, Cards
- Full order lifecycle state machine
- Payment audit logs & gateway response storage
- Delivery tracking & shipment snapshots

### 🛠️ Admin & Operations
- Full admin dashboard for all modules
- Dynamic, editable email templates
- Media library for product & profile images
- Return & refund request management

</td></tr>
</table>

---

## 🧰 Technologies Used

| Layer | Technology |
|---|---|
| **Backend Framework** | Django 5.x, Django REST Framework |
| **Frontend Framework** | Next.js 14 (App Router), React 18 |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL 16 |
| **Authentication** | JWT (SimpleJWT), OTP, Email Verification |
| **Task Queue (Future)** | Celery + Redis + RabbitMQ |
| **Media Storage** | Django Storages (local / S3-compatible) |
| **Containerization** | Docker & Docker Compose |
| **Web Server** | Gunicorn + Nginx |
| **CI/CD Ready** | GitHub Actions compatible |

---

## 🏗️ System Architecture

The platform follows a **layered, modular architecture**: presentation (Next.js) → API (DRF) → service layer (business logic) → repository/data layer (PostgreSQL). This separation keeps business rules out of views and serializers, improving testability and long-term maintainability.

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        A[Next.js / React SPA]
        A1[Tailwind UI Components]
        A2[API Service Hooks]
    end

    subgraph Gateway["🌐 API Gateway"]
        B[Nginx Reverse Proxy]
    end

    subgraph Backend["⚙️ Application Layer - Django"]
        C[DRF API Views]
        D[Serializers]
        E[Service Layer]
        F[Permission / RBAC Layer]
        G[Repository Layer]
    end

    subgraph Data["🗄️ Data Layer"]
        H[(PostgreSQL)]
        I[Media Storage]
    end

    subgraph External["🔌 External Services"]
        J[Email Provider - SMTP]
        K[Payment Gateways]
        L[Push Notification Service]
    end

    A --> A1 --> A2 --> B
    B --> C --> F --> D --> E --> G --> H
    E --> I
    E --> J
    E --> K
    E --> L
```

### Architectural Principles

- **Modular Django Apps** — Each domain (users, products, orders, payments) is an isolated Django app with its own models, serializers, and views.
- **Service Layer** — Business logic (e.g., stock deduction, order state transitions) lives in service classes, not in views.
- **Repository Pattern (where applicable)** — Complex queries are abstracted behind repository functions to decouple ORM logic from business logic.
- **Stateless API** — JWT-based authentication keeps the backend horizontally scalable.
- **Clean Boundaries** — The frontend never talks to the database directly; all access is mediated through versioned REST endpoints.

---

## ⚙️ Backend Stack

The backend is built with **Django** and **Django REST Framework**, structured as a collection of modular apps under a single Django project.

| Component | Purpose |
|---|---|
| `authentication/` | JWT auth, OTP, email verification, password reset |
| `users/` | Custom user model, profiles, roles, employees |
| `products/` | Catalog, variants, categories, inventory |
| `cart/` | Guest & authenticated cart logic |
| `orders/` | Order lifecycle, checkout, snapshots |
| `payments/` | Gateway integration, transaction logs |
| `shipping/` | Shipping methods & delivery tracking |
| `reviews/` | Ratings & review moderation |
| `coupons/` | Discount code validation & application |
| `notifications/` | Email templates & push tokens |
| `media/` | Image library & upload handling |

Key backend design choices include **class-based API views**, **custom permission classes** for RBAC enforcement, **DRF serializers** with explicit validation, and **PostgreSQL constraints** to enforce data integrity at the database level, not just in application code.

---

## 🎨 Frontend Stack

The frontend is a **Next.js 14** application using the App Router, styled with **Tailwind CSS**, and structured around reusable components, hooks, and context providers for state management (auth state, cart state, wishlist state).

| Component | Purpose |
|---|---|
| `app/` | Route-based pages (App Router) |
| `components/` | Reusable UI components (buttons, cards, modals) |
| `services/` | API client wrappers (Axios/Fetch abstractions) |
| `hooks/` | Custom hooks (`useAuth`, `useCart`, `useWishlist`) |
| `context/` | Global state providers (Auth, Cart, Theme) |
| `styles/` | Tailwind configuration & global styles |

The frontend communicates exclusively through the versioned REST API, with JWT access tokens attached via an Axios interceptor and automatic refresh-token rotation handled in a dedicated auth service.

---

## 🗄️ Database

**PostgreSQL** is used as the primary data store, chosen for its strong consistency guarantees, native JSON support, and mature indexing capabilities.

### Key Practices

- Proper **indexing** on frequently filtered/sorted fields (SKU, category, price, created_at)
- **Foreign Keys**, **OneToOne**, and **ManyToMany** relationships modeled explicitly
- **Computed properties** (e.g., average rating, current stock status) calculated at the model or query level
- **Database-level constraints** (unique constraints, check constraints) to prevent invalid states
- **Validation** at both serializer and model level for defense in depth

### High-Level Entity Relationship Overview

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ ADDRESS : owns
    USER ||--o{ REVIEW : writes
    USER ||--o{ CART : owns
    USER ||--o{ WISHLIST : owns
    ROLE ||--o{ USER : assigned_to
    CATEGORY ||--o{ PRODUCT : contains
    PRODUCT ||--o{ PRODUCT_VARIANT : has
    PRODUCT ||--o{ PRODUCT_IMAGE : has
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT_VARIANT ||--o{ INVENTORY : tracked_by
    CART ||--o{ CART_ITEM : contains
    PRODUCT ||--o{ CART_ITEM : referenced_by
    ORDER ||--o{ ORDER_ITEM : contains
    ORDER ||--|| PAYMENT : has
    ORDER ||--|| SHIPPING_METHOD : uses
    ORDER ||--o| COUPON : applies
    ORDER ||--o{ RETURN_REQUEST : may_have
    PRODUCT ||--o{ ORDER_ITEM : referenced_by
```

---

## 🔑 Authentication Flow

Authentication combines **JWT tokens** with an **OTP verification layer** for sensitive actions such as registration and password resets.

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (Next.js)
    participant A as Auth API (DRF)
    participant D as Database
    participant E as Email Service

    U->>F: Submit registration form
    F->>A: POST /api/auth/register
    A->>D: Create inactive user
    A->>E: Send OTP email
    E-->>U: OTP Code
    U->>F: Enter OTP
    F->>A: POST /api/auth/verify-otp
    A->>D: Activate user account
    A-->>F: Success response

    U->>F: Submit login credentials
    F->>A: POST /api/auth/login
    A->>D: Validate credentials
    A-->>F: Access Token + Refresh Token
    F->>F: Store tokens (memory/http-only cookie)

    Note over F,A: Subsequent requests
    F->>A: GET /api/products (Authorization: Bearer <token>)
    A->>A: Validate JWT & permissions
    A-->>F: Protected resource response
```

### Password Reset via OTP

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant E as Email Service

    U->>F: Request password reset
    F->>A: POST /api/auth/forgot-password
    A->>E: Send OTP / reset token
    E-->>U: OTP / Reset Link
    U->>F: Submit OTP + new password
    F->>A: POST /api/auth/reset-password
    A-->>F: Password updated confirmation
```

---

## 🛡️ Role Based Access Control (RBAC)

Access control is enforced through a combination of **Roles**, **Permissions**, and **Permission Groups**, checked at the DRF permission-class level on every request.

| Concept | Description |
|---|---|
| **Roles** | High-level identities: Superuser, Staff, Employee, Customer |
| **Permissions** | Granular action rights (e.g., `can_manage_products`, `can_view_orders`) |
| **Permission Groups** | Reusable bundles of permissions assigned to roles |
| **Module Permissions** | Per-module access control (Products, Orders, Payments, etc.) |

```mermaid
flowchart LR
    A[User] --> B[Role]
    B --> C[Permission Group]
    C --> D[Permission 1]
    C --> E[Permission 2]
    C --> F[Module Permission]
    F --> G{Access Granted?}
    G -->|Yes| H[Proceed to View]
    G -->|No| I[403 Forbidden]
```

---

## 👤 User Management

The platform uses a **fully custom User model** rather than Django's default, allowing flexible authentication and rich profile data.

**Core capabilities:**

- Username-based login with email and mobile number support
- Profile image upload
- Email verification & OTP-based account activation
- Password reset via OTP and secure token links
- Login attempt tracking with automatic account blocking on repeated failures
- Distinct handling for active/inactive, staff, superuser, customer, and employee accounts
- Employee invitation workflow with status tracking (invited, active, suspended)
- Push notification device token storage for mobile/web push integration

---

## 📦 Product Management

The product module is the catalog backbone, supporting rich variant modeling and merchandising features.

| Feature | Description |
|---|---|
| Categories | Hierarchical product categorization |
| Products | Core product entity with descriptions, pricing, metadata |
| Product Images | Multiple images per product with ordering |
| Product Variants | Combinations of color, size, material |
| Tags | Freeform tagging for discovery & filtering |
| Sales Products | Time-boxed sale pricing |
| Discount Products | Percentage/fixed discounts |
| Ratings & Reviews | Customer feedback with average rating computation |
| SKU Generation | Automatic, unique SKU assignment per variant |

---

## 📊 Inventory Management

Inventory is tracked at the **variant level**, with automated stock-health signals to prevent overselling and stockouts.

- **Stock Quantity** — real-time available units per variant
- **Low Stock Detection** — automatic flagging below a threshold
- **Reorder Point** — configurable trigger for restocking workflows
- **Minimum / Maximum Stock** — enforced bounds for inventory planning

---

## 🛒 Shopping Cart

Supports both **guest carts** (session-based) and **authenticated carts** (user-linked), with automatic cart merging on login.

- Add / update / remove cart items
- Quantity validation against live stock
- Price recalculation on every mutation
- Persisted server-side for authenticated users

---

## ❤️ Wishlist

Authenticated users can save products for later, independent of cart state, with simple add/remove endpoints and duplicate prevention.

---

## 📦 Orders

Orders move through a well-defined lifecycle and capture **immutable snapshots** of relevant data at the time of purchase (address, shipping method, pricing) so historical orders remain accurate even if the underlying data changes later.

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Booked: Payment Initiated
    Booked --> Processing: Payment Confirmed
    Processing --> Delivered: Shipment Completed
    Processing --> Cancelled: Cancelled by Admin/Customer
    Pending --> Cancelled: Cancelled before Payment
    Delivered --> [*]
    Cancelled --> [*]
```

**Each order stores:**

- Customer reference
- Delivery address snapshot
- Shipping method & cost
- Applied coupon & discount
- Payment status
- Full line-item order details

---

## 💳 Payments

The payment module abstracts multiple gateways behind a unified interface, with full auditability.

| Field | Description |
|---|---|
| Transaction ID | Unique gateway transaction reference |
| Payment Status | Pending / Success / Failed / Refunded |
| Gateway Response | Raw response stored for audit/debugging |
| Refunds | Linked refund records |
| Audit Logs | Immutable log of payment state changes |

**Supported payment methods:**

`Cash on Delivery` · `JazzCash` · `EasyPaisa` · `PayPal` · `Credit Card` · `Debit Card`

---

## 🎟️ Coupons

- Percentage or fixed-value discount codes
- Usage limits & expiry dates
- Minimum order value validation
- Applied at checkout, stored on the order for historical accuracy

---

## 🚚 Shipping

- Multiple configurable shipping methods
- Per-method cost calculation
- Delivery address selection from saved addresses
- Delivery tracking status updates

---

## ⭐ Reviews & Ratings

- Customers can rate and review purchased products
- Average rating is computed and cached on the product record
- Review moderation available via the admin dashboard

---

## 🔄 Returns & Refunds

- Customers can submit return requests against delivered orders
- Admins review, approve/reject, and process refunds
- Refunds are linked back to the original payment transaction for auditability

---

## 📧 Email System

Dynamic, database-driven email templates power all transactional communication.

| Template | Trigger |
|---|---|
| Account Activation | User registration |
| OTP Verification | Registration / password reset |
| Password Reset | Forgot password flow |
| Order Confirmation | Successful checkout |
| Welcome Email | Post-activation |
| Notifications | General system events |

---

## 🖼️ Media Management

- Centralized **Image Library** with categorization
- Dedicated handling for product images vs. profile images
- Upload validation (file type, size limits)

---

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| Authentication | JWT + OTP + Email Verification |
| Password Storage | Salted hashing (never plaintext) |
| Authorization | RBAC + Permission-based checks on every endpoint |
| Abuse Prevention | Login attempt tracking, account lockout |
| Input Safety | Serializer-level validation, custom validators |
| Web Security | CSRF protection, XSS mitigation, SQL injection protection via ORM |

---

## 🔌 API Features

- RESTful resource design with consistent URL conventions
- Pagination on all list endpoints
- Filtering, searching, and sorting via query parameters
- Centralized serializer validation layer
- Custom, composable DRF permission classes
- Standardized error handling & reusable response envelopes

```mermaid
flowchart LR
    A[Client Request] --> B[Nginx]
    B --> C[Django URL Router]
    C --> D[Authentication Middleware]
    D --> E[Permission Check - RBAC]
    E -->|Denied| F[403 Response]
    E -->|Allowed| G[Serializer Validation]
    G -->|Invalid| H[400 Response]
    G -->|Valid| I[Service Layer]
    I --> J[Repository / ORM]
    J --> K[(PostgreSQL)]
    K --> I
    I --> L[Serialized Response]
    L --> M[Client]
```

---

## 📁 Folder Structure

```
ecommerce-platform/
│
├── backend/
│   ├── apps/
│   │   ├── authentication/       # JWT, OTP, email verification
│   │   ├── users/                # Custom user model, roles, employees
│   │   ├── products/             # Catalog, variants, inventory
│   │   ├── cart/                 # Guest & authenticated cart
│   │   ├── orders/                # Order lifecycle & checkout
│   │   ├── payments/              # Gateway integrations
│   │   ├── shipping/              # Shipping methods & tracking
│   │   ├── reviews/               # Ratings & reviews
│   │   ├── coupons/                # Discount codes
│   │   └── notifications/          # Email templates, push tokens
│   ├── ecommerce/                 # Django project settings
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── media/                      # Uploaded media files
│   ├── utils/                      # Shared helpers, mixins, validators
│   ├── config/                     # Environment/config loaders
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (auth)/
│   │   ├── (shop)/
│   │   ├── (checkout)/
│   │   └── (dashboard)/
│   ├── components/                 # Reusable UI components
│   │   ├── ui/
│   │   ├── product/
│   │   ├── cart/
│   │   └── layout/
│   ├── services/                   # API client wrappers
│   ├── hooks/                      # useAuth, useCart, useWishlist
│   ├── context/                    # Global providers
│   ├── styles/                     # Tailwind config & globals
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Git

### Backend Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ecommerce-platform.git
cd ecommerce-platform/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (see below)
cp .env.example .env

# Run database migrations
python manage.py migrate

# Create a superuser account
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

### Frontend Installation

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

The backend will be available at `http://localhost:8000` and the frontend at `http://localhost:3000`.

### Database Setup

```bash
# Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE ecommerce_db;"

# Apply migrations
python manage.py migrate

# (Optional) Load seed/fixture data
python manage.py loaddata fixtures/initial_data.json
```

### Common Migration Commands

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations
python manage.py migrate <app_name> <migration_number>   # rollback/target migration
```

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Django Core
SECRET_KEY=your-django-secret-key
DEBUG=True

# Database
DATABASE_URL=postgres://user:password@localhost:5432/ecommerce_db
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-app-password

# JWT
JWT_SECRET=your-jwt-secret-key
```

> ⚠️ **Never commit your `.env` file.** Ensure it is listed in `.gitignore`.

---

## 📚 API Documentation

All endpoints are prefixed with `/api/` and return JSON. Authenticated endpoints require an `Authorization: Bearer <access_token>` header.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate and receive JWT tokens |
| `POST` | `/api/auth/verify-otp` | Verify OTP for account activation |
| `POST` | `/api/auth/forgot-password` | Request a password reset OTP |
| `POST` | `/api/auth/reset-password` | Reset password using OTP/token |
| `POST` | `/api/auth/refresh` | Refresh an expired access token |

### Products & Categories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List products (paginated, filterable) |
| `GET` | `/api/products/{id}` | Retrieve a single product |
| `GET` | `/api/categories` | List all categories |

### Cart & Orders

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/cart` | Add item to cart |
| `GET` | `/api/cart` | Retrieve current cart |
| `GET` | `/api/orders` | List user's orders |
| `POST` | `/api/orders` | Place a new order |

### Reviews

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reviews` | Submit a product review |
| `GET` | `/api/products/{id}/reviews` | List reviews for a product |

> Full interactive API documentation (Swagger/OpenAPI) is available at `/api/docs/` when the backend is running in development mode.

---

## 🐳 Deployment

The platform is designed to be deployed via **Docker**, fronted by **Nginx**, and served by **Gunicorn**, on **Ubuntu** servers with **PostgreSQL** as the managed database.

```mermaid
flowchart LR
    subgraph Server["Ubuntu Server"]
        N[Nginx] --> G[Gunicorn]
        G --> D[Django App - Docker Container]
        D --> P[(PostgreSQL - Docker Container)]
        N --> F[Next.js - Docker Container]
    end
    U[Users] --> N
```

### Example `docker-compose.yml` outline

```yaml
version: "3.9"
services:
  backend:
    build: ./backend
    command: gunicorn ecommerce.wsgi:application --bind 0.0.0.0:8000
    env_file: ./backend/.env
    depends_on:
      - db
  frontend:
    build: ./frontend
    command: npm run start
    ports:
      - "3000:3000"
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: ecommerce_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend

volumes:
  pgdata:
```

### Deployment Steps

```bash
# Build and start all services
docker-compose up -d --build

# Run migrations inside the backend container
docker-compose exec backend python manage.py migrate

# Create a superuser
docker-compose exec backend python manage.py createsuperuser
```

---

## 🔮 Future Enhancements

| Enhancement | Purpose |
|---|---|
| Redis | Caching & session storage |
| Celery + RabbitMQ | Async task processing (emails, reports) |
| WebSockets | Real-time order & notification updates |
| Stripe | Additional global payment gateway |
| ElasticSearch | High-performance product search |
| AI Product Recommendations | Personalized recommendation engine |
| Visual/Image Search | Search products by uploaded image |
| Microservices Migration | Decompose monolith for independent scaling |
| Kubernetes | Container orchestration for production scale |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request describing your changes

Please ensure all new features include appropriate tests and documentation updates.

---

## 📏 Coding Standards

- **Python**: Follow PEP 8; format with `black`, lint with `flake8`/`ruff`
- **JavaScript/TypeScript**: Follow the project's ESLint + Prettier configuration
- **Commits**: Use clear, conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Testing**: New backend logic should include unit tests (`pytest` / Django `TestCase`)
- **API Changes**: Any endpoint change must be reflected in this README's API documentation section

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Django](https://www.djangoproject.com/) & [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js](https://nextjs.org/) & [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL](https://www.postgresql.org/)
- The open-source community for continuous inspiration

---

<div align="center">

**Built with ❤️ for developers who care about clean architecture.**

⭐ If you find this project useful, consider giving it a star!

</div> -->





<div align="center">

# 🛍️ E-Commerce Platform

### A Production-Ready, Full-Stack E-Commerce System

**Django REST Framework · Next.js · PostgreSQL · Redis · Docker · JWT Authentication**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.15-A30000?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#-license)

[Features](#-features) • [Architecture](#-system-architecture) • [Apps & Models](#-django-apps--models) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📖 Table of Contents

- [Introduction](#-introduction)
- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [System Architecture](#-system-architecture)
- [Django Apps & Models](#-django-apps--models)
- [Reusable Base Classes & Soft Delete](#-reusable-base-classes--soft-delete)
- [Custom Validators & Enums](#-custom-validators--enums)
- [Generic API Layer (BaseView)](#-generic-api-layer-baseview)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Database](#-database)
- [Authentication Flow](#-authentication-flow)
- [Product Catalog & Sales Products](#-product-catalog--sales-products)
- [Inventory Management](#-inventory-management)
- [Media & Gallery](#-media--gallery)
- [Cart, Wishlist & Coupons](#-cart-wishlist--coupons)
- [Orders, Shipping & Payments](#-orders-shipping--payments)
- [Returns & Refunds](#-returns--refunds)
- [Reviews](#-reviews)
- [Dynamic Email Templates](#-dynamic-email-templates)
- [Frontend: Admin Dashboard](#-frontend-admin-dashboard)
- [Frontend: Public Storefront](#-frontend-public-storefront)
- [Folder Structure](#-folder-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Coding Standards](#-coding-standards)
- [License](#-license)

---

## 📌 Introduction

**E-Commerce Platform** is a modular, production-grade full-stack application for modern online retail. It pairs a **Django REST Framework** backend with a **Next.js (App Router)** frontend, backed by **PostgreSQL** for relational integrity and **Redis** for caching.

Rather than a single monolithic app, the backend is split into focused Django apps: a custom **`users`** app (authentication, roles, permissions, employees), a **`ecommerce`** app (the full commerce domain — catalog, cart, orders, payments, shipping, coupons, reviews, returns), a lightweight **media/gallery** app (a general-purpose, categorized image library independent of product images), and a **notifications** app for database-driven, editable **email templates**.

Every model in the system inherits from shared base classes (`TimeStamps` / `TimeUserStamps`) that standardize timestamps, audit fields, and **soft deletion** — nothing is ever hard-deleted from the primary business tables, and every query throughout the codebase explicitly filters `deleted=False`.

On the frontend, the **admin dashboard** already has full, working CRUD screens wired end-to-end against every backend module — products, product variants, inventory, sales products and their own variant/inventory tracks, categories, colors, tags, coupons, shipping methods, customer addresses, orders (including mixed regular + sale-priced line items), and return-request review/approval — alongside a **public storefront** for browsing categories and products.

---

## ✨ Features

<table>
<tr><td width="50%" valign="top">

### 🔐 Authentication & Security
- Custom `User` model (username-based login, separate email/mobile)
- OTP-based registration activation & password reset (no token-link flow)
- Login attempt tracking with automatic account blocking
- Role → Permission RBAC, enforced per-endpoint via a `permission_required` decorator
- Soft-delete everywhere — no destructive deletes on business data

### 👥 User Management
- Custom user model with profile image upload
- `Role` and `Permission` models (many-to-many), seeded via a management script
- `Employee` model with an invite → active → deactivated lifecycle
- Push-notification device token storage (`UserToken`)

### 🛒 Shopping Experience
- Guest & authenticated cart (stock-checked on every mutation)
- Wishlist with duplicate prevention
- Multiple saved delivery addresses per user, with a single default
- Coupon codes (percentage or flat, usage-limited, date-bounded)

</td><td width="50%" valign="top">

### 📦 Catalog
- Categories, tags, colors, product variants (size/color/material)
- Automatic, collision-safe SKU generation per variant
- **Two parallel product lines**: regular `Product`/`ProductVariant`/`Inventory` and a fully independent `SalesProduct`/`SalesProductVariant`/`SalesInventory` track for discounted merchandise
- Per-variant low-stock and reorder-point detection

### 💳 Orders & Payments
- Orders can mix regular products and sale-priced products in one order
- Multiple payment methods (COD, cards, PayPal, JazzCash, EasyPaisa)
- Configurable shipping methods with per-method cost & lead time
- Full `Payment` audit trail, decoupled from `Order.payment_status`

### 🛠️ Admin & Operations
- Admin dashboard for every module listed above — already built and wired
- Return-request review workflow (approve/reject, refund amount)
- Database-driven, editable transactional email templates
- Categorized image/media library, separate from product image uploads

</td></tr>
</table>

---

## 🧰 Technologies Used

| Layer | Technology |
|---|---|
| **Backend Framework** | Django 5.x, Django REST Framework |
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript/JSX |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL 16 |
| **Caching** | Redis |
| **Authentication** | JWT (SimpleJWT) + OTP-based verification/reset |
| **Media Storage** | Django `ImageField`/`FileField` (local disk / S3-compatible) |
| **Containerization** | Docker & Docker Compose |
| **Version Control** | Git |
| **Web Server** | Gunicorn + Nginx |

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        A[Next.js App Router]
        A1[Admin Dashboard]
        A2[Public Storefront]
    end

    subgraph Gateway["🌐 Gateway"]
        B[Nginx Reverse Proxy]
    end

    subgraph Backend["⚙️ Django Apps"]
        U[users — auth, RBAC, employees]
        E[ecommerce — catalog, cart, orders, payments]
        M[media/gallery — categorized image library]
        N[notifications — email templates]
        BV[utils.base_api.BaseView — generic CRUD]
        PD[utils.decorator.permission_required]
    end

    subgraph Data["🗄️ Data Layer"]
        PG[(PostgreSQL)]
        RD[(Redis Cache)]
        FS[Media Storage]
    end

    A --> A1 --> B
    A --> A2 --> B
    B --> PD --> BV
    BV --> U
    BV --> E
    BV --> M
    BV --> N
    U --> PG
    E --> PG
    M --> PG
    N --> PG
    BV --> RD
    E --> FS
    M --> FS
```

### Architectural Principles

- **App-per-domain** — `users`, `ecommerce`, the media/gallery app, and the email-template app are independent Django apps with their own models, serializers, filters, and views.
- **One generic API base, many concrete views** — nearly every list/create/update/delete endpoint is built on a shared `BaseView` (`utils.base_api`) so pagination, response shape, and filtering behave identically across all 25+ resources instead of being reimplemented per view.
- **Permission-gated, not just authenticated** — `IsAuthenticated` alone is rarely sufficient; most write/read actions are additionally wrapped in `@permission_required([...])`, checked against the requesting user's `Role.permissions`.
- **Soft delete as policy** — every model extends `TimeUserStamps`, which carries a `deleted` flag. Nothing queries the raw manager without an explicit `.filter(deleted=False)`; "deleting" a category, coupon, or variant never breaks historical orders that reference it.
- **Stateless API** — JWT keeps the backend horizontally scalable; Redis backs caching/rate-limiting concerns independent of any single app instance.

---

## 🗂️ Django Apps & Models

### `users` — Authentication, RBAC, Employees

| Model | Purpose |
|---|---|
| `User` | Custom `AbstractBaseUser`. Login via `username`; `email`/`mobile` optional and separately validated. OTP fields for registration activation and password reset. `login_attempts` + `is_blocked` for brute-force protection. `type` (`customer` / `employee`) and an optional `role` FK. |
| `Role` | Named role (`code_name` unique, validated) with a many-to-many `permissions` set. |
| `Permission` | Granular action right — `code_name` (e.g. `create_product`, `read_return`) is what `@permission_required([...])` checks against, plus `module_name`/`module_label` for grouping in an admin permissions UI. |
| `UserToken` | Push-notification device tokens, one-to-many per user. |
| `Employee` | `OneToOne` to `User`, with an `invited → active → deactivated` status lifecycle for staff onboarding. |

### `ecommerce` — The Full Commerce Domain

| Group | Models |
|---|---|
| **Catalog** | `Category`, `ProductTag`, `Color`, `Product`, `ProductImage`, `ProductVariant`, `Inventory` |
| **Sales / Discount line** *(fully parallel to the catalog above)* | `SalesProduct`, `SalesProductImage`, `SalesProductColor`, `SalesProductVariant`, `SalesInventory` |
| **Customer** | `Address` (multiple per user, one default, snapshotted onto orders) |
| **Checkout** | `ShippingMethod`, `Coupon` |
| **Orders** | `Order`, `OrderDetail` (each line references *either* `Product` *or* `SalesProduct`, never both) |
| **Payments** | `Payment` — full audit trail, separate from `Order.payment_status` |
| **Cart / Wishlist** | `Cart`, `CartItem`, `Wishlist`, `WishlistItem` |
| **Post-purchase** | `ReturnRequest` (only valid against `delivered` orders; verified to belong to the requesting user) |
| **Engagement** | `Review` (rating + comment, against a `Product` *or* `SalesProduct`), `Contact` |

> **Why two parallel product lines?** `SalesProduct` isn't just "`Product` with a discount field" — it's a fully independent model tree (`SalesProductVariant`, `SalesInventory`, its own SKU generation, its own stock tracking) so time-boxed sale merchandise can be managed, priced, and stocked completely separately from the standard catalog, while `OrderDetail` and `Cart`/`WishlistItem` accept a reference to either.

### Media/Gallery App — Categorized Image Library

| Model | Purpose |
|---|---|
| `Categories` | Simple named category for organizing library images (distinct from `ecommerce.Category`, which is product-specific). |
| `Images` | A general-purpose image entry — name, description, bullet-point description, category — with `is_active` and `is_public` flags controlling internal vs. public-site visibility. Used for content that isn't tied to a specific product (banners, editorial imagery, etc.). |

### Notifications App — Dynamic Email Templates

| Model | Purpose |
|---|---|
| `EmailTemplate` | Database-driven transactional email content — `subject`, `html_template`, a plaintext `alternative_text` fallback, and a `code_name` the sending code looks up by (e.g. `order_confirmation`, `password_reset_otp`), so templates are editable without a deploy. |

---

## ♻️ Reusable Base Classes & Soft Delete

Every model in the project extends one of two shared abstract base classes from `utils.reusable_classes`:

- **`TimeStamps`** — adds `created_at` / `updated_at`, auto-managed.
- **`TimeUserStamps`** *(extends `TimeStamps`)* — additionally adds `created_by` / `updated_by` (FKs to `User`) and a `deleted` boolean flag for soft deletion.

This is why every serializer and view in the codebase is full of patterns like:

```python
obj.images.filter(deleted=False)
Category.objects.filter(name__iexact=value, deleted=False)
```

Deleting a `Category`, `Coupon`, or `ProductVariant` through the API sets `deleted=True` rather than issuing a `DELETE` at the database level — so a product that referenced a since-"deleted" category, or an order line that referenced a since-"deleted" variant, keeps rendering correctly instead of throwing `DoesNotExist`. It also means uniqueness constraints that would otherwise be enforced at the database level (e.g. a coupon code, a variant's `product` + `size` + `material` combination) have to be — and are — enforced in each serializer's `validate()` against non-deleted rows only, since a DB-level `unique_together` would ignore the soft-delete flag and permanently block reusing a value.

---

## ✅ Custom Validators & Enums

`utils.validators` centralizes field-level validation used across models:

| Validator | Applied to | Purpose |
|---|---|---|
| `val_name` | `User.first_name`, `User.last_name`, `Role.name` | Restricts to valid name characters |
| `val_mobile` | `User.mobile` | Enforces a valid mobile number format |
| `val_code_name` | `Role.code_name`, `Permission.code_name` | Restricts to a safe, lookup-friendly identifier format (used directly by `permission_required`) |

`utils.enums` centralizes choice constants shared across models instead of redefining tuples per-model:

```python
CUSTOMER, EMPLOYEE          # User.type choices
INVITED, ACTIVE, DEACTIVATED # Employee.status choices
```

---

## ⚙️ Generic API Layer (`BaseView`)

Rather than hand-rolling list/create/update/delete logic per resource, the large majority of views (colors, tags, categories, shipping methods, coupons, inventory, product/sales variants, and more) subclass `utils.base_api.BaseView` and simply declare a `serializer_class` and `filterset_class`:

```python
class ColorView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ColorSerializer
    filterset_class    = ColorFilter

    @permission_required(['create_color'])
    def post(self, request):   return super().post_(request)
    @permission_required(['read_color'])
    def get(self, request):    return super().get_(request)
    @permission_required(['update_color'])
    def patch(self, request):  return super().patch_(request)
    @permission_required(['delete_color'])
    def delete(self, request): return super().delete_(request)
```

`BaseView`'s generic `get_` handles pagination via `utils.helpers.paginate_data` and returns a consistent `{ "count": N, "data": [...] }` envelope across every list endpoint — which is exactly the shape the Next.js admin components (`records`, `pagination.totalCount`, etc.) are built to consume. `create_response` / `get_first_error` / `get_first_error_message` similarly standardize success/error payload shape so the frontend's error-handling logic doesn't need per-endpoint special cases.

Where a resource needs bespoke behavior — file uploads with a hard image-count limit (`Product`, `SalesProduct`), mixed-type nested order items (`Order`), or ownership checks before mutation (`Address`, `ReturnRequest`, `Cart`) — the view overrides the relevant method directly instead of using the generic path.

---

## 🛡️ Role-Based Access Control (RBAC)

```mermaid
flowchart LR
    A[User] --> B[Role]
    B --> C[Permission — M2M]
    C --> D["code_name, e.g. create_product"]
    D --> E{permission_required decorator}
    E -->|Role has it| F[View executes]
    E -->|Role lacks it| G[403 Forbidden]
```

- **`Permission`** rows are seeded via a management script (one row per `code_name`, grouped by `module_name`/`module_label`) and cover every gated action across both product lines, orders, shipping, coupons, payments, returns, reviews, and more — for example `create_sales_product_variant`, `read_sales_inventory`, `update_return`, `read_payment`.
- **`Role`** bundles a set of `Permission`s; a `User.role` FK determines what that user can do.
- Every gated view method is annotated `@permission_required(['exact_code_name'])` — the string **must** match a seeded `Permission.code_name` exactly, or every user (including admins) is silently locked out of that action.
- Some endpoints are intentionally *not* permission-gated beyond `IsAuthenticated` — e.g. a customer managing their own `Address`, `Cart`, or `Wishlist` — since those are scoped to `request.user` rather than being an admin capability.
- A handful of actions layer an additional **ownership check** on top of RBAC: filing a `ReturnRequest` requires the order actually belong to the requesting user (or the user be staff), independent of whether they hold `create_order` or any other permission.

---

## 🗄️ Database

**PostgreSQL** is the primary data store. Key practices in this codebase specifically:

- Every FK from an order-facing model back to a mutable catalog entity uses `on_delete=models.SET_NULL` (e.g. `OrderDetail.product`, `Order.customer`, `Order.rider`) rather than `CASCADE`, so a user or product being removed doesn't cascade-delete historical order data.
- `unique_together`/DB-level `unique=True` is deliberately **avoided** wherever soft-delete applies (variant SKUs aside), since it would otherwise permanently block reusing a coupon code or variant combination after a soft delete — uniqueness is instead enforced in the serializer against `deleted=False` rows.
- `CheckConstraint`s enforce "exactly one of A or B" invariants at the database level where soft-delete uniqueness games don't apply — e.g. a `CartItem`/`WishlistItem`/`Review` must reference *either* a regular product *or* a sale product, never both, never neither.

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ ADDRESS : owns
    USER ||--o{ REVIEW : writes
    USER ||--o| CART : owns
    USER ||--o| WISHLIST : owns
    ROLE ||--o{ USER : assigned_to
    ROLE }o--o{ PERMISSION : grants
    CATEGORY ||--o{ PRODUCT : contains
    PRODUCT ||--o{ PRODUCT_VARIANT : has
    PRODUCT_VARIANT ||--|| INVENTORY : tracked_by
    SALES_PRODUCT ||--o{ SALES_PRODUCT_VARIANT : has
    SALES_PRODUCT_VARIANT ||--|| SALES_INVENTORY : tracked_by
    CART ||--o{ CART_ITEM : contains
    ORDER ||--o{ ORDER_DETAIL : contains
    ORDER ||--|| PAYMENT : has
    ORDER ||--o| SHIPPING_METHOD : uses
    ORDER ||--o{ RETURN_REQUEST : may_have
    PRODUCT ||--o{ ORDER_DETAIL : referenced_by
    SALES_PRODUCT ||--o{ ORDER_DETAIL : referenced_by
```

---

## 🔑 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (Next.js)
    participant A as Auth API (DRF)
    participant D as Database

    U->>F: Submit registration form
    F->>A: POST /api/auth/register
    A->>D: Create inactive User
    A-->>U: OTP sent
    U->>F: Enter OTP
    F->>A: POST /api/auth/verify-otp
    A->>D: is_verified = True
    A-->>F: Success

    U->>F: Login (username + password)
    F->>A: POST /api/auth/login
    A->>D: Validate credentials, check is_blocked
    A-->>F: Access + Refresh JWT

    Note over F,A: Every subsequent request
    F->>A: Authorization: Bearer <token>
    A->>A: permission_required checks Role.permissions
    A-->>F: 200 or 403
```

Failed logins increment `User.login_attempts`; hitting `MAX_LOGIN_ATTEMPTS` sets `is_blocked = True` automatically. Password reset is OTP-only — there is deliberately no separate reset-link-token email flow to keep the surface area smaller.

---

## 📦 Product Catalog & Sales Products

Both product lines share the same modeling pattern:

| Concern | Regular line | Sales line |
|---|---|---|
| Base entity | `Product` | `SalesProduct` |
| Images | `ProductImage` | `SalesProductImage` |
| Variants | `ProductVariant` (size/color/material, auto SKU) | `SalesProductVariant` (identical shape) |
| Stock | `Inventory` (min/max/reorder point) | `SalesInventory` (identical shape) |
| Pricing | flat `price` | `original_price` + `discount_percent` → auto-computed `final_price` (recalculated on every save via a `pre_save` signal) |

`Order`/`OrderDetail`, `Cart`/`CartItem`, `Wishlist`/`WishlistItem`, and `Review` all accept a reference to *either* line, resolved by which FK is populated — the admin order form lets a single order mix both freely.

---

## 📊 Inventory Management

Tracked at the **variant level** for both product lines, with the same computed-property pattern on `Inventory` and `SalesInventory`:

- `is_low_stock` → `current_stock <= minimum_stock_level`
- `needs_reorder` → `current_stock <= reorder_point`

The admin dashboard's Product Inventory and Sales Inventory screens surface both flags as status badges directly in the listing table.

---

## 🖼️ Media & Gallery

A general-purpose, categorized image library (`Categories` + `Images`) that's intentionally decoupled from `ProductImage`/`SalesProductImage` — this is for content like banners or editorial imagery that isn't attached to a specific product. `Images.is_active` controls whether an entry is considered live at all, and `Images.is_public` independently controls whether it's exposed on the public site versus admin-only.

---

## 🛒 Cart, Wishlist & Coupons

- **Cart** — one per authenticated user; adding an already-present item increments quantity rather than duplicating a row, with stock validated on every increment (not just on first add).
- **Wishlist** — one per user; duplicate add attempts are rejected outright rather than silently ignored.
- **Coupon** — percentage or flat discount, optional per-product restriction (empty = applies to all), `min_order_amount`, `max_uses`/`used_count`, and a `valid_from`/`valid_to` window, validated server-side at checkout via a dedicated coupon-validation endpoint before ever touching order totals.

---

## 📦 Orders, Shipping & Payments

`Order` snapshots delivery details (`delivery_address` as text) rather than a live FK-only reference, so editing or deleting a saved `Address` later never rewrites history. `OrderDetail` similarly snapshots `unit_price` at the time of purchase.

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Booked
    Booked --> InProcess: in_process
    InProcess --> Delivered
    Pending --> Cancelled
    Booked --> Cancelled
    Delivered --> [*]
    Cancelled --> [*]
```

`ShippingMethod` is a simple admin-configurable list (name, estimated days, cost, active flag) surfaced publicly at checkout. `Payment` is a separate audit-trail model — one-to-one with `Order` — carrying gateway, transaction ID, and raw gateway response, deliberately kept independent of the simpler `Order.payment_status` boolean used for quick admin filtering.

---

## 🔄 Returns & Refunds

`ReturnRequest` ties an order line (`OrderDetail`) to a reason, description, and admin-set `refund_amount`. Two integrity rules are enforced at both the model (`clean()`) and serializer level:

1. Returns can only be filed against orders with `status == 'delivered'`.
2. The referenced `order_detail` must actually belong to the referenced `order` — rejecting mismatched pairs rather than trusting client-supplied IDs.

Filing a return requires no special permission (any authenticated user can file one — but only for their own orders, or if staff); reviewing/approving one requires `update_return`.

---

## ⭐ Reviews

`Review` supports both authenticated users (`user` FK, name/email hidden) and guest reviewers (`name`/`email` required instead), rated 1–5, against either product line, with a `CheckConstraint` guaranteeing exactly one target is set.

---

## 📧 Dynamic Email Templates

`EmailTemplate` rows are looked up by `code_name` at send-time rather than templates being hardcoded into the codebase, so subject lines and HTML content for things like OTP delivery or order confirmation can be edited without a deploy. `alternative_text` provides a plaintext fallback for clients that don't render HTML email.

---

## 🖥️ Frontend: Admin Dashboard

Built in Next.js (App Router) with Tailwind, using a consistent per-module pattern: a paginated table/grid, client-side search, an add/edit modal or dedicated form page, and permission-gated action buttons driven by the logged-in user's `Role.permissions` via `AuthContext`. Modules with full CRUD screens already wired against the live API:

- **Products** — listing, add/edit with up to 5 images, category/tag/group assignment
- **Product Variants** & **Product Inventory** — size/color/material/stock management, low-stock badges
- **Sales Products** — mirrors the Product screen with original price + discount %, dedicated nav buttons to its own Variant and Inventory screens
- **Sales Product Variants** & **Sales Inventory** — fully independent CRUD, same UX pattern as the regular line
- **Shipping Methods** & **Coupons** — simple admin CRUD forms
- **Addresses** — self-service CRUD (scoped to the logged-in account, matching the backend's per-user `AddressView`)
- **Return Requests** — list + approve/reject/complete workflow (no create/delete, matching the backend's exposed methods)
- **Orders** — create and update, supporting mixed regular + sale-product line items, rider assignment, delivery-date estimation, and live total calculation client-side before submit

## 🌐 Frontend: Public Storefront

- Category carousel + paginated, searchable product grid (`PublicProducts`)
- Responsive image handling with graceful fallback to a default placeholder on load failure
- Pagination with configurable page size and a compact page-number strip with ellipsis for large result sets

---

## 📁 Folder Structure

```
ecommerce-platform/
│
├── backend/
│   ├── apps/
│   │   ├── users/                  # Custom User, Role, Permission, Employee, UserToken
│   │   ├── ecommerce/              # Catalog, sales line, cart, orders, payments,
│   │   │                           # shipping, coupons, reviews, returns, contact
│   │   ├── gallery/                # Categories + Images (general media library)
│   │   └── notifications/          # EmailTemplate
│   ├── config/                     # Settings, environment loaders
│   ├── utils/
│   │   ├── reusable_classes.py     # TimeStamps, TimeUserStamps
│   │   ├── validators.py           # val_name, val_mobile, val_code_name
│   │   ├── enums.py                # CUSTOMER, EMPLOYEE, INVITED, ACTIVE, DEACTIVATED
│   │   ├── base_api.py             # BaseView generic CRUD
│   │   ├── decorator.py            # permission_required
│   │   ├── helpers.py              # create_response, paginate_data, get_first_error(_message)
│   │   └── response_messages.py    # Standard message constants
│   ├── media/                      # Uploaded media files
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── admin/                  # Admin dashboard route group — one folder per module
│   │   └── (public routes)
│   ├── components/                 # Admin + public page components (.jsx/.tsx)
│   ├── context/                    # AuthContext (user, permissions)
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Redis
- Git

### Backend

```bash
git clone https://github.com/your-username/ecommerce-platform.git
cd ecommerce-platform/backend

python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env

python manage.py migrate

# Seed RBAC permissions (create_product, read_order, update_return, ...)
python manage.py shell < scripts/populate_permissions.py

python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

Backend: `http://localhost:8000` · Frontend: `http://localhost:3000`

### Docker (all services)

```bash
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

---

## 🔧 Environment Variables

```env
# Django Core
SECRET_KEY=your-django-secret-key
DEBUG=True

# Database
DATABASE_URL=postgres://user:password@localhost:5432/ecommerce_db
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email (SMTP) — content itself is sourced from EmailTemplate rows
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-app-password

# JWT
JWT_SECRET=your-jwt-secret-key

# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

> ⚠️ Never commit your `.env` file — ensure it's listed in `.gitignore`.

---

## 📚 API Documentation

All endpoints are prefixed `/api/` and return JSON. Authenticated endpoints require `Authorization: Bearer <access_token>`. List endpoints consistently return `{ "count": N, "data": [...] }` via the shared `paginate_data` helper.

### Catalog

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/myapp/v1/public/product/` | Public product listing (paginated) |
| `GET/POST/PATCH/DELETE` | `/api/myapp/v1/product/` | Admin product CRUD (`?id=` for update/delete) |
| `GET/POST/PATCH/DELETE` | `/api/myapp/v1/product/variant/` | Product variant CRUD |
| `GET/POST/PATCH/DELETE` | `/api/myapp/v1/inventory/` | Inventory CRUD |
| `GET/POST/PATCH/DELETE` | `/api/myapp/v1/sales/product/` | Sales product CRUD |
| `GET/POST/PATCH/DELETE` | `/api/myapp/v1/sales/product/variant/` | Sales product variant CRUD |
| `GET/POST/PATCH/DELETE` | `/api/myapp/v1/sales/inventory/` | Sales inventory CRUD |

### Checkout & Orders

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/myapp/v1/cart/`, `/api/myapp/v1/cart/item/` | Cart & cart items |
| `GET/POST/DELETE` | `/api/myapp/v1/wishlist/`, `/api/myapp/v1/wishlist/item/` | Wishlist |
| `POST` | `/api/myapp/v1/public/coupon/validate/` | Validate a coupon at checkout |
| `GET/POST/PATCH/DELETE` | `/api/myapp/v1/order/` | Order CRUD (mixed product/sales_product line items, `?id=` for update/delete) |
| `GET/POST/PATCH/DELETE` | `/api/myapp/v1/return/` | Return requests (list/review as admin, file as customer) |

### Account

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST/PATCH/DELETE` | `/api/myapp/v1/address/` | Self-service saved addresses (`?id=`) |
| `GET/PATCH` | `/api/myapp/v1/payment/` | Payment records (admin) |

> Full interactive API documentation (Swagger/OpenAPI) is available at `/api/docs/` in development.

---

## 🐳 Deployment

```mermaid
flowchart LR
    subgraph Server["Ubuntu Server"]
        N[Nginx] --> G[Gunicorn]
        G --> D[Django — Docker Container]
        D --> P[(PostgreSQL)]
        D --> R[(Redis)]
        N --> F[Next.js — Docker Container]
    end
    U[Users] --> N
```

```yaml
version: "3.9"
services:
  backend:
    build: ./backend
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    env_file: ./backend/.env
    depends_on: [db, redis]
  frontend:
    build: ./frontend
    command: npm run start
    ports: ["3000:3000"]
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: ecommerce_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
  nginx:
    image: nginx:latest
    ports: ["80:80"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf"]
    depends_on: [backend, frontend]

volumes:
  pgdata:
```

---

## 🔮 Roadmap

| Enhancement | Purpose |
|---|---|
| Celery + Redis | Async email/report processing |
| WebSockets | Real-time order & delivery status updates |
| Stripe | Additional global payment gateway |
| ElasticSearch | High-performance product search |
| In-place order-item editing | Replace the current soft-delete-and-recreate update strategy for `OrderDetail` with true row-level updates |
| Kubernetes | Container orchestration for production scale |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit: `git commit -m "feat: your feature description"`
4. Push and open a Pull Request

---

## 📏 Coding Standards

- **Python** — PEP 8; format with `black`, lint with `ruff`/`flake8`
- **JavaScript/TypeScript** — project ESLint + Prettier config
- **Commits** — Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- **New endpoints** — must reuse `BaseView` where the resource fits the generic CRUD shape, and must be reflected in this README's API section
- **New models** — must extend `TimeUserStamps` unless there's a specific reason not to soft-delete

---

## 📄 License

Licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for developers who care about clean architecture.**

⭐ If you find this project useful, consider giving it a star!

</div>