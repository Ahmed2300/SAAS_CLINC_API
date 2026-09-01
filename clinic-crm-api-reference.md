# Delta Clinics CRM — REST API Contract & Reference

**Version:** v1.1 · **Format:** REST / JSON · **Architecture:** Multi-Database Multi-Tenancy (Stancl Tenancy) + HMVC Modules (Laravel 13 & PHP 8.5) · **Created & Maintained by:** DEVesters

This document is the official API specification and contract for the **Delta Clinics CRM** SaaS platform. It serves as the single source of truth across the Central SaaS Management Portal, Tenant Clinic Workspaces, Medical Staff Portals, Public Booking Interfaces, and Third-Party Integrations.

---

## 1. Architecture & Conventions

### Base URLs & Domain Routing

The platform operates on a **Subdomain-Driven Multi-Tenant Architecture** backed by isolated per-clinic databases:

| Scope | Base URL Format | Example | Description |
|---|---|---|---|
| **Central SaaS Platform** | `https://[CENTRAL_DOMAIN]/v1` | `https://api.delta-clinics.com/v1` or `http://localhost/v1` | System Administration, Plans, Offline Billing Approvals, SaaS Telemetry, Server Health |
| **Tenant Clinic API** | `https://[TENANT_SUBDOMAIN].[DOMAIN]/api/v1` | `https://elshifa.delta-clinics.com/api/v1` or `http://elshifa.localhost/api/v1` | Clinic Staff Dashboard, Doctors, Medical Records, Billing, Inventory, Clinic Settings |
| **Public Guest Booking** | `https://[TENANT_SUBDOMAIN].[DOMAIN]/api/v1/public` | `https://elshifa.delta-clinics.com/api/v1/public` | Public Branch Locator, Doctor Roster, Slot Discovery & Guest Booking with QR generation |

### Headers

#### Central Admin Requests
```http
Authorization: Bearer [SUPER_ADMIN_TOKEN]
Content-Type: application/json
```

#### Tenant Authenticated Requests
```http
Authorization: Bearer [TENANT_ACCESS_TOKEN]
Content-Type: application/json
X-Tenant: [TENANT_ID_OR_SLUG]       // Optional if calling via tenant subdomain; required if calling via central proxy
X-Domain: [TENANT_DOMAIN]           // Optional; resolves tenant context dynamically
```

#### Financial Write Operations (Idempotency)
```http
Idempotency-Key: [UNIQUE_CLIENT_UUID]
```
Supported on `POST /invoices` and `POST /invoices/{id}/payments`. Replaying the same key returns the original cached response rather than creating duplicate transactions.

---

### Response Envelope

All API endpoints return a standardized JSON response:

#### Success Envelope (Single Resource)
```json
{
  "success": true,
  "data": {
    "id": "res_7c3f21",
    "status": "confirmed"
  }
}
```

#### Success Envelope (Paginated List)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "total_pages": 8
  }
}
```

#### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "PLAN_LIMIT_EXCEEDED",
    "message": "Maximum doctor capacity reached for your active plan (limit: 5). Please upgrade your subscription or request an add-on.",
    "details": {
      "limit": 5,
      "current_usage": 5,
      "resource": "doctors"
    }
  }
}
```

---

### Pagination & Sorting

List endpoints accept standard query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | 1-indexed page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `-created_at` | Field to sort by; prefix with `-` for descending order |
| `search` | string | `null` | Keyword search across relevant entity columns |

---

### Prefixed Unique Resource IDs

Every entity in the database features a typed prefix string:

| Prefix | Entity | Example | Description |
|---|---|---|---|
| `usr_` | User / Staff / Admin | `usr_d4e5f6` | System Admins, Clinic Managers, Doctors, Nurses, Receptionists, Patients |
| `cli_` | Clinic / Branch | `cli_a1b2c3` | Physical branch location with coordinates |
| `doc_` | Doctor Profile | `doc_9f1a20` | Medical practitioner profile |
| `spec_`| Specialty | `spec_3b7a11` | Medical specialty (Dermatology, Cardiology, etc.) |
| `sch_` | Doctor Schedule | `sch_4e9b12` | Recurring weekly shift schedule |
| `slot_`| Time Slot | `slot_8c2d15` | Individual bookable time window |
| `res_` | Reservation / Booking | `res_5e2b18` | Appointment booking record |
| `pat_` | Patient Profile | `pat_7c3f21` | Patient clinical profile |
| `cst_` | Consultation | `cst_3d8f42` | EMR diagnosis & vital signs entry |
| `rx_`  | Prescription | `rx_6a1c90` | E-prescription & medication orders |
| `inv_` | Invoice | `inv_2f7e11` | Billing invoice |
| `ivi_` | Invoice Item | `ivi_1a2b3c` | Individual bill line item |
| `pay_` | Payment | `pay_8b4d33` | Settled payment transaction |
| `exp_` | Expense | `exp_9d4a12` | Clinic operational expense |
| `itm_` | Inventory Item | `itm_1a9c77` | Medical consumable / pharmacy stock item |
| `adj_` | Stock Adjustment | `adj_4e9b12` | Atomic inventory adjustment audit log |
| `ntf_` | Notification | `ntf_4c2e19` | User notification record |
| `pln_` | Subscription Plan | `pln_enterprise`| SaaS subscription tier |
| `sub_` | Subscription Request | `sub_8b1a44` | Offline payment receipt submission |
| `tik_` | Support Ticket | `tik_9a4f22` | Clinic-to-System Support ticket |
| `msg_` | Support / Chat Message | `msg_1b8e77` | Message inside ticket or reservation |
| `set_` | Tenant Settings | `set_main` | Clinic branding and configuration |

---

## 2. Roles & Comprehensive RBAC Matrix

The system implements strict **Role-Based Access Control (RBAC)** across two isolation layers:

### Platform-Level Roles (Central Scope)
- `super_admin`: Full root platform access across all tenant databases, server hardware telemetry, plan CRUD, tenant provisioning, and billing approvals.
- `support_admin`: Platform technical support. Manages clinic onboarding, handles support tickets, and troubleshoots tenant configurations without root financial keys.
- `finance_admin`: Platform accountant. Reviews subscription payments, manages plan pricing, and inspects MRR/ARR analytics.

### Clinic-Level Roles (Tenant Scope)
- `admin` / `clinic_manager`: Full administrative management within the clinic tenant (branches, doctors, staff, inventory, billing, settings, support).
- `doctor`: Medical practitioner. Manages own schedule, conducts consultations, writes e-prescriptions, and views assigned patient records.
- `nurse`: Clinical support. Records patient vitals, conducts appointment check-in, adjusts medical consumable inventory, and views medical records.
- `receptionist`: Front-desk operator. Manages reservations, performs QR camera check-in, collects invoice payments, and registers patients.
- `accountant`: Financial controller. Full access to billing, invoices, expenses, payment methods, and financial reporting.
- `patient`: Clinic client. Public/self-booking, access to personal appointment QR tickets, prescription history, and invoice settlement.

---

### Detailed RBAC Permission Matrix Across Modules

| Module / Feature | `super_admin` | `support_admin` | `clinic_manager` | `doctor` | `receptionist` | `nurse` | `accountant` | `patient` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Server Health & Telemetry** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **SaaS Plans & MRR Analytics** | ✅ Full | 👁️ Read | 👁️ Read | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tenant Provisioning & Database** | ✅ Full | ✅ Onboard | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Subscription Requests & Approvals** | ✅ Approve | 👁️ Read | ✍️ Submit | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Platform Support Tickets** | ✅ Full | ✅ Full | ✍️ Submit/Chat | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Internal Admin Ticket Notes** | ✅ Private | ✅ Private | ❌ Hidden | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tenant Settings & Theming** | ✅ Full | 👁️ Read | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Branches & Geolocation** | ✅ Full | ✅ Setup | ✅ Full | 👁️ Read | 👁️ Read | 👁️ Read | 👁️ Read | 👁️ Read |
| **Staff & User Management** | ✅ Full | ✅ Setup | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Doctor Profiles & Shifts** | ✅ Full | ✅ Setup | ✅ Full | ✏️ Own Schedule | 👁️ Read | 👁️ Read | ❌ | 👁️ Read |
| **Reservations & QR Check-in** | ✅ Full | ✅ Support | ✅ Full | 👁️ Own | ✅ Scan / Check-in | ✅ Scan / Check-in | ❌ | ✏️ Self Book / QR |
| **In-Booking Patient Chat** | ❌ | ❌ | ✅ Moderate | ✍️ Direct Chat | ✍️ Direct Chat | ❌ | ❌ | ✍️ Own Chat |
| **Consultations & Vitals** | ✅ Full | ❌ | 👁️ Read | ✍️ Author | ❌ | ✏️ Vitals Only | ❌ | 👁️ Self Records |
| **Prescriptions & E-Pharmacy** | ✅ Full | ❌ | 👁️ Read | ✍️ Author | ❌ | 👁️ Read | ❌ | 👁️ Self Rx |
| **Invoices, Payments & Refunds** | ✅ Full | ❌ | ✅ Full | ❌ | ✅ Create / Collect | ❌ | ✅ Full | 👁️ Self Invoices |
| **Inventory & Stock Adjustments**| ✅ Full | ❌ | ✅ Full | 👁️ Read | ❌ | ✏️ Adjust Stock | ❌ | ❌ |
| **Queued Notifications & WS** | ✅ Full | ❌ | ✅ Dispatch | 👁️ Self | 👁️ Self | 👁️ Self | 👁️ Self | 👁️ Self |
| **Financial & SaaS Telemetry** | ✅ Platform | ❌ | 💵 Branch | 👁️ Self Perf | ❌ | ❌ | 💵 Financial | ❌ |
| **Audit Logs** | ✅ Full | 👁️ Read | 👁️ Branch | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Data Models

### 1. Tenant (Central)
```typescript
interface Tenant {
  id: string;                      // e.g. "elshifa"
  tenancy_db_name: string;         // e.g. "tenant_elshifa"
  status: "active" | "trial" | "suspended" | "paused";
  plan_id: string;                 // e.g. "pln_growth"
  subscription_expires_at: string; // ISO 8601
  max_doctors: number;
  max_branches: number;
  max_specialties: number;
  max_staff: number;
  extra_doctors: number;
  extra_branches: number;
  extra_staff: number;
  domains: Array<{ domain: string }>;
  created_at: string;
}
```

### 2. Plan (Central)
```typescript
interface Plan {
  id: string;                      // pln_ prefix
  name: string;                    // "Growth Plan", "Enterprise"
  slug: string;                    // "growth", "enterprise"
  price: number;                   // Monthly price in EGP / USD
  price_before_discount: number | null;
  is_featured: boolean;
  billing_cycle: "monthly" | "yearly";
  max_doctors: number;
  max_branches: number;
  max_specialties: number;
  max_staff: number;
  extra_doctor_price: number;
  extra_branch_price: number;
  extra_staff_price: number;
  features: string[];              // JSON array of feature bullets
  is_trial: boolean;
  trial_days: number;
  status: "active" | "inactive";
}
```

### 3. SubscriptionRequest (Central)
```typescript
interface SubscriptionRequest {
  id: string;                      // sub_ prefix
  tenant_id: string;
  plan_id: string;
  type: "plan_upgrade" | "plan_renewal" | "addon_doctor" | "addon_branch" | "addon_staff";
  quantity: number;
  amount: number;
  payment_method: "instapay" | "vodafone_cash" | "bank_transfer" | "manual";
  transaction_reference: string;
  receipt_url: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  admin_notes: string | null;
  processed_by: string | null;     // Super Admin User ID
  processed_at: string | null;
  created_at: string;
}
```

### 4. SupportTicket & SupportMessage (Central & Real-Time)
```typescript
interface SupportTicket {
  id: string;                      // tik_ prefix
  tenant_id: string;
  user_id: string;                 // Submitting Clinic User ID
  subject: string;
  status: "open" | "pending" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  last_message_at: string;
  messages: SupportMessage[];
}

interface SupportMessage {
  id: string;                      // msg_ prefix
  support_ticket_id: string;
  sender_type: "system_admin" | "tenant_user";
  sender_id: string;
  sender_name: string;
  message: string;
  attachment_url: string | null;
  is_internal: boolean;            // Private note for system admins
  read_at: string | null;
  created_at: string;
}
```

### 5. TenantSetting (Tenant)
```typescript
interface TenantSetting {
  id: "set_main";
  tenant_name: string;
  logo_url: string | null;
  phone: string;
  email: string;
  address: string;
  timezone: string;
  currency: string;
  primary_color: string;           // Hex code (e.g. #059669)
  secondary_color: string;         // Hex code
  accent_color: string;            // Hex code
  accent_soft_color: string;       // Hex code
  bg_color: string;                // Hex code
  card_bg_color: string;           // Hex code
  theme_preset_id: "emerald" | "sapphire" | "cyan" | "teal" | "violet" | "ruby" | "custom";
}
```

### 6. Reservation / Appointment (Tenant & Public)
```typescript
interface Reservation {
  id: string;                      // res_ prefix
  patient_id: string;              // usr_ or pat_ ID
  doctor_id: string;               // doc_ prefix
  clinic_id: string;               // cli_ prefix (branch)
  time_slot_id: string;            // slot_ prefix
  reservation_date: string;        // YYYY-MM-DD
  status: "pending" | "accepted" | "confirmed" | "completed" | "cancelled";
  reservation_type: "consultation" | "follow_up" | "procedure" | "emergency";
  notes: string | null;
  qr_code_token: string;           // Secure token for camera check-in
  created_at: string;
}
```

---

## 4. Central SaaS & Super Admin Endpoints (`/v1`)

### Authentication (`/v1/admin/auth` or `/v1/auth`)

#### `POST /v1/admin/auth/login`
Authenticates a Central System Administrator.

- **Roles:** `public`
- **Request Body:**
  ```json
  {
    "email": "superadmin@delta-clinics.com",
    "password": "password123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "access_token": "1|admin_token_hash",
      "expires_in": 900,
      "user": {
        "id": "usr_superadmin",
        "full_name": "Platform Super Admin",
        "email": "superadmin@delta-clinics.com",
        "role": "super_admin"
      }
    }
  }
  ```

#### `GET /v1/admin/auth/me`
- **Roles:** `super_admin`, `support_admin`, `finance_admin`
- **Response `200 OK`:** Current authenticated administrator details.

#### `POST /v1/admin/auth/logout`
- **Roles:** `super_admin`, `support_admin`, `finance_admin`
- **Response `200 OK`:** `{ "success": true, "data": { "message": "Logged out successfully." } }`

---

### System Admin Accounts & Central Roles

#### `GET /v1/admin/users`
List all central system administrators.
- **Roles:** `super_admin`

#### `POST /v1/admin/users`
Create a new platform administrator.
- **Roles:** `super_admin`
- **Request Body:**
  ```json
  {
    "name": "Sarah Mansour",
    "email": "sarah.support@delta-clinics.com",
    "phone": "+201011112233",
    "password": "SecurePassword123!",
    "role": "support_admin"
  }
  ```

#### `PATCH /v1/admin/users/{id}/status`
Toggle platform administrator active state (`status: "active" | "inactive"`).
- **Roles:** `super_admin`

#### `GET /v1/admin/roles` & `GET /v1/admin/permissions`
List central RBAC roles and permissions.
- **Roles:** `super_admin`

#### `PATCH /v1/admin/roles/{id}/permissions`
Synchronize permission keys for a central role.
- **Roles:** `super_admin`
- **Request Body:** `{ "permissions": ["plans:create", "plans:update", "subscriptions:approve"] }`

---

### Tenant Provisioning & Clinic Management

#### `GET /v1/clinics/check-availability/{id}`
Verify whether a tenant subdomain/slug is available.
- **Roles:** `public`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "slug": "elshifa",
      "is_available": true
    }
  }
  ```

#### `GET /v1/clinics`
List all registered clinic tenants with active subscriber metrics and domain bindings.
- **Roles:** `super_admin`, `support_admin`

#### `POST /v1/clinics`
Provision a new clinic tenant, create an isolated tenant MySQL database, run tenant migrations, and seed initial admin credentials.
- **Roles:** `super_admin`, `support_admin`
- **Request Body:**
  ```json
  {
    "id": "elshifa",
    "name": "El Shifa Specialized Clinics",
    "plan_id": "pln_growth",
    "domain": "elshifa.delta-clinics.com",
    "admin_name": "Dr. Tarek Hegazi",
    "admin_email": "admin@elshifa.com",
    "admin_phone": "+201099887766",
    "admin_password": "ClinicAdminPassword123!",
    "trial_days": 14
  }
  ```
- **Response `201 Created`:** Provisioned tenant details, assigned database `tenant_elshifa`, and seeded admin account.

#### `PATCH /v1/clinics/{id}`
Update clinic status (`active`, `suspended`, `paused`) or domain bindings.
- **Roles:** `super_admin`

#### `DELETE /v1/clinics/{id}`
Decommission clinic tenant and drop isolated database.
- **Roles:** `super_admin`

#### `POST /v1/clinics/{id}/logo`
Upload and update clinic brand logo.
- **Roles:** `super_admin`, `support_admin`

---

### Subscription Plans & Analytics

#### `GET /v1/plans`
List all SaaS subscription plans with feature limits and addon pricing.
- **Roles:** `public` (for landing page) / `super_admin`

#### `POST /v1/plans`
Create a new subscription tier.
- **Roles:** `super_admin`
- **Request Body:**
  ```json
  {
    "name": "Professional Tier",
    "slug": "professional",
    "price": 1200,
    "price_before_discount": 1500,
    "is_featured": true,
    "billing_cycle": "monthly",
    "max_doctors": 10,
    "max_branches": 3,
    "max_specialties": 8,
    "max_staff": 15,
    "extra_doctor_price": 100,
    "extra_branch_price": 300,
    "extra_staff_price": 50,
    "features": [
      "Unlimited Patient Records",
      "Full EMR & E-Prescriptions",
      "QR Camera Check-in",
      "Financial Invoicing & Payment Tracking",
      "Medical Inventory & Stock Logs",
      "Real-Time WebSocket Notifications"
    ],
    "is_trial": false,
    "trial_days": 0,
    "status": "active"
  }
  ```

#### `GET /v1/plans/{id}`
Retrieve plan details alongside real-time subscriber and revenue analytics.
- **Roles:** `super_admin`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "id": "pln_professional",
      "name": "Professional Tier",
      "price": 1200,
      "analytics": {
        "total_subscribers": 42,
        "active_subscribers": 38,
        "trial_subscribers": 4,
        "estimated_mrr": 45600,
        "total_revenue_generated": 547200
      }
    }
  }
  ```

---

### Offline Subscription Requests & Approvals

#### `GET /v1/subscription-requests`
List all payment receipt submissions across tenant clinics.
- **Roles:** `super_admin`, `finance_admin`
- **Query Params:** `status` (`pending`, `approved`, `rejected`), `tenant_id`, `date_from`, `date_to`.

#### `PATCH /v1/subscription-requests/{id}/approve`
Approve an offline payment receipt, upgrade tenant plan, reset trial mode, extend expiration date, and sync resource limits.
- **Roles:** `super_admin`, `finance_admin`
- **Request Body:**
  ```json
  {
    "admin_notes": "Instapay transaction verified against bank account."
  }
  ```
- **Response `200 OK`:** Updated subscription request object and updated tenant limits.

#### `PATCH /v1/subscription-requests/{id}/reject`
Reject invalid payment receipt with administrative feedback.
- **Roles:** `super_admin`, `finance_admin`
- **Request Body:**
  ```json
  {
    "admin_notes": "Receipt reference number not found in bank statement. Please re-upload."
  }
  ```

---

### Central Support Desk & Real-Time Ticketing

#### `GET /v1/support-tickets`
List all support tickets opened by clinics.
- **Roles:** `super_admin`, `support_admin`
- **Query Params:** `status` (`open`, `pending`, `in_progress`, `resolved`, `closed`), `priority`, `tenant_id`.

#### `GET /v1/support-tickets/{id}`
Retrieve full message thread for a support ticket.
- **Roles:** `super_admin`, `support_admin`

#### `POST /v1/support-tickets/{id}/messages`
Reply to a support ticket as a System Administrator. Supports public customer replies and private internal notes.
- **Roles:** `super_admin`, `support_admin`
- **Request Body:**
  ```json
  {
    "message": "We have adjusted your database memory pool. Please retry the booking flow.",
    "is_internal": false,
    "attachment": null
  }
  ```
  *(Set `"is_internal": true` to leave a private collaborative note visible only to System Admins).*

#### `PATCH /v1/support-tickets/{id}/status`
Update support ticket lifecycle state (`open`, `in_progress`, `resolved`, `closed`).
- **Roles:** `super_admin`, `support_admin`

---

### Executive SaaS Analytics & Tenant Health Telemetry

#### `GET /v1/reports/executive-dashboard`
Retrieve high-level business performance metrics for the platform.
- **Roles:** `super_admin`, `finance_admin`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "mrr": 185400,
      "arr": 2224800,
      "arpu": 1287.50,
      "active_clinics": 144,
      "logo_churn_rate_percent": 1.4,
      "plan_distribution": {
        "starter": 45,
        "professional": 72,
        "enterprise": 27
      }
    }
  }
  ```

#### `GET /v1/reports/tenant-health`
Returns real-time health scores (0-100) and churn risk classification for every tenant clinic.
- **Roles:** `super_admin`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "tenant_id": "elshifa",
        "tenant_name": "El Shifa Specialized Clinics",
        "health_score": 94,
        "risk_tier": "healthy",
        "utilization": {
          "doctors_used": 8,
          "doctors_limit": 10,
          "utilization_percent": 80.0
        },
        "reservations_30d": 340,
        "open_tickets": 0,
        "upsell_recommendations": []
      },
      {
        "tenant_id": "alhayah",
        "tenant_name": "Al Hayah Medical Center",
        "health_score": 58,
        "risk_tier": "at_risk",
        "utilization": {
          "doctors_used": 10,
          "doctors_limit": 10,
          "utilization_percent": 100.0
        },
        "reservations_30d": 12,
        "open_tickets": 3,
        "upsell_recommendations": [
          "Clinic is at 100% doctor capacity. Recommend Extra Doctor Addon or Plan Upgrade."
        ]
      }
    ]
  }
  ```

---

### Server Infrastructure Health & Telemetry

*Prefix: `/v1/server` · Roles: `super_admin`*

| Endpoint | Method | Description |
|---|:---:|---|
| `/v1/server/health` | `GET` | Live CPU %, load averages (1/5/15m), RAM metrics, and Disk storage usage |
| `/v1/server/system-info` | `GET` | Hostname, OS kernel, uptime, PHP 8.5 & Laravel 13 engine versions |
| `/v1/server/services` | `GET` | Service daemon status for Nginx, MySQL, Redis, Octane FrankenPHP, and Queue |
| `/v1/server/processes` | `GET` | Top background processes sorted by CPU and RAM consumption |
| `/v1/server/databases` | `GET` | List Central + all Tenant MySQL databases with row counts & size in MB |
| `/v1/server/databases/{db}/tables`| `GET` | Table-level storage breakdown (data size, index size, collation, engine) |
| `/v1/server/cache/clear` | `POST` | Purges framework configuration, route, view, and application cache |
| `/v1/server/queue/restart` | `POST` | Broadcasts restart signal to background queue workers |

---

## 5. Public & Guest Patient Booking (`/api/v1/public`)

*No authentication required. Accessible from patient portal or clinic landing website.*

#### `GET /api/v1/public/clinics`
List active physical branches with optional Haversine geolocation proximity filtering.
- **Query Params:** `latitude`, `longitude`, `radius_km` (e.g. `?latitude=30.0444&longitude=31.2357&radius_km=15`).
- **Response `200 OK`:** Array of branch locations with addresses, phone numbers, and calculated distance in km.

#### `GET /api/v1/public/specialties`
List medical specialties with active practicing doctor counts.

#### `GET /api/v1/public/doctors`
List doctor roster.
- **Query Params:** `specialty_id`, `clinic_id` (branch).

#### `GET /api/v1/public/doctors/{id}/clinics`
Retrieve branches where a doctor practices alongside branch-specific consultation fees.

#### `GET /api/v1/public/time-slots`
Find available open appointment slots.
- **Query Params:** `doctor_id` (required), `clinic_id` (required), `date` (YYYY-MM-DD).
- **Response `200 OK`:** Array of available `slot_` objects with `start_time` and `end_time`.

#### `POST /api/v1/public/reservations`
Submit guest patient booking. Automatically registers/links patient profile, claims the time slot, and returns printable QR ticket payload.
- **Request Body:**
  ```json
  {
    "full_name": "Mohamed Ibrahim",
    "national_id": "29010150102345",
    "phone": "+201023456789",
    "email": "mohamed.ibrahim@example.com",
    "gender": "male",
    "date_of_birth": "1990-10-15",
    "doctor_id": "doc_9f1a20",
    "clinic_id": "cli_a1b2c3",
    "time_slot_id": "slot_8c2d15",
    "reservation_date": "2026-09-10",
    "reservation_type": "consultation",
    "notes": "First visit for general dermatology checkup."
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "id": "res_5e2b18",
      "status": "pending",
      "reservation_date": "2026-09-10",
      "doctor_name": "Dr. Ahmed Hassan",
      "clinic_name": "Nasr City Branch",
      "time_slot": "10:30 - 11:00",
      "qr_code_token": "qr_tok_9b2e8a11cf8842",
      "qr_ticket_payload": "https://elshifa.delta-clinics.com/ticket/res_5e2b18?token=qr_tok_9b2e8a11cf8842"
    }
  }
  ```

#### `PATCH /api/v1/public/reservations/{id}/status`
Update reservation lifecycle state from reception dashboard (`accepted`, `confirmed`, `completed`, `cancelled`).

---

## 6. Tenant Clinic Core Endpoints (`/api/v1`)

### Tenant Auth & User Profile

#### `POST /api/v1/auth/login`
- **Roles:** `public`
- **Request Body:** `{ "email": "admin@elshifa.com", "password": "password123" }`
- **Response `200 OK`:** Tenant `access_token` (15 min) and `user` object.

#### `POST /api/v1/auth/refresh`
Rotate short-lived access token.
- **Request Body:** `{ "refresh_token": "ref_8a1c90..." }`

#### `GET /api/v1/auth/me`
Retrieve currently authenticated tenant user, assigned roles, permissions, and branch associations.

---

### Clinic Settings, Branding & Theming

#### `GET /api/v1/settings`
Retrieve tenant branding configuration and theme colors.
- **Roles:** `public` / `authenticated`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "tenant_name": "El Shifa Clinics",
      "logo_url": "https://storage.delta-clinics.com/tenants/elshifa/logo.png",
      "phone": "+20224567890",
      "email": "info@elshifa.com",
      "address": "15 Abbas El Akkad, Nasr City, Cairo",
      "timezone": "Africa/Cairo",
      "currency": "EGP",
      "primary_color": "#059669",
      "secondary_color": "#047857",
      "accent_color": "#10b981",
      "accent_soft_color": "#d1fae5",
      "bg_color": "#f8fafc",
      "card_bg_color": "#ffffff",
      "theme_preset_id": "emerald"
    }
  }
  ```

#### `PATCH /api/v1/settings` or `POST /api/v1/settings`
Update clinic branding, theme presets (Emerald, Sapphire, Cyan, Teal, Violet, Ruby, Custom), and upload clinic logo.
- **Roles:** `admin`, `clinic_manager`

---

### Tenant Subscription Payments & Addons

#### `GET /api/v1/subscription-requests`
List subscription payment receipts submitted by the clinic.
- **Roles:** `admin`, `clinic_manager`

#### `POST /api/v1/subscription-requests`
Submit an offline payment receipt for subscription renewal, plan upgrade, or addon capacity.
- **Roles:** `admin`, `clinic_manager`
- **Request Body:**
  ```json
  {
    "plan_id": "pln_professional",
    "type": "plan_upgrade",
    "amount": 1200,
    "payment_method": "instapay",
    "transaction_reference": "INSTA-992144810",
    "receipt_url": "https://storage.delta-clinics.com/receipts/rec_81239.jpg",
    "notes": "Upgraded from Starter to Professional via Instapay."
  }
  ```

---

### Tenant Support Chat

#### `GET /api/v1/support-tickets`
List support tickets opened by the clinic.
- **Roles:** `admin`, `clinic_manager`

#### `POST /api/v1/support-tickets`
Open a new support ticket with DEVesters System Support.
- **Roles:** `admin`, `clinic_manager`
- **Request Body:**
  ```json
  {
    "subject": "Invoicing printer integration issue",
    "priority": "high",
    "message": "Thermal receipts are truncating patient names on branch 2.",
    "attachment": null
  }
  ```

#### `POST /api/v1/support-tickets/{id}/messages`
Send a reply message inside a ticket thread with file attachment support.
- **Roles:** `admin`, `clinic_manager`

---

### Branches & Staff Management

#### `GET /api/v1/branches` & `POST /api/v1/branches`
Manage physical clinic branches. Creating a new branch enforces `TenantPlanFeatureGuard::ensureCanAddBranch`.
- **Roles:** `admin`, `clinic_manager`

#### `GET /api/v1/users` & `POST /api/v1/users`
Manage staff user accounts (Doctors, Receptionists, Nurses, Accountants). Creating staff enforces `TenantPlanFeatureGuard::ensureCanAddStaff`.
- **Roles:** `admin`, `clinic_manager`

#### `PATCH /api/v1/users/{id}/status`
Toggle staff member active state.
- **Roles:** `admin`, `clinic_manager`

---

### Doctors, Specialties & Shifts

#### `GET /api/v1/specialties` & `POST /api/v1/specialties`
Specialties catalog. Creating specialty enforces `TenantPlanFeatureGuard::ensureCanAddSpecialty`.
- **Roles:** `admin`, `clinic_manager`

#### `GET /api/v1/doctors` & `POST /api/v1/doctors`
Doctor profiles CRUD. Creating doctor enforces `TenantPlanFeatureGuard::ensureCanAddDoctor`.
- **Roles:** `admin`, `clinic_manager`

#### `POST /api/v1/doctors/{id}/clinics`
Link doctor to multiple branches with custom consultation prices per branch.
- **Roles:** `admin`, `clinic_manager`
- **Request Body:**
  ```json
  {
    "clinics": [
      { "clinic_id": "cli_nasr_city", "price": 400 },
      { "clinic_id": "cli_maadi", "price": 500 }
    ]
  }
  ```

#### `PUT /api/v1/doctors/{id}/schedule`
Synchronize doctor weekly shift schedule.
- **Roles:** `admin`, `clinic_manager`, the involved `doctor`
- **Request Body:**
  ```json
  {
    "schedules": [
      {
        "clinic_id": "cli_nasr_city",
        "day_of_week": 1,
        "start_time": "10:00",
        "end_time": "16:00",
        "slot_duration_minutes": 30,
        "is_available": true
      },
      {
        "clinic_id": "cli_maadi",
        "day_of_week": 3,
        "start_time": "14:00",
        "end_time": "20:00",
        "slot_duration_minutes": 30,
        "is_available": true
      }
    ]
  }
  ```

---

### Appointments, Reservations & Chat

#### `GET /api/v1/reservations`
List reservations with date, status, doctor, branch, and patient filters.
- **Roles:** `admin`, `clinic_manager`, `receptionist`, `doctor`, `nurse`

#### `POST /api/v1/reservations`
Book a reservation internally by reception staff.
- **Roles:** `admin`, `clinic_manager`, `receptionist`

#### `PATCH /api/v1/reservations/{id}/accept` & `PATCH /api/v1/reservations/{id}/cancel`
Accept or cancel appointment.
- **Roles:** `admin`, `clinic_manager`, `receptionist`, `doctor`

#### `GET /api/v1/reservations/{id}/messages` & `POST /api/v1/reservations/{id}/messages`
Two-way chat thread attached directly to a booking (e.g. pre-consultation instructions, medical inquiries).
- **Roles:** `admin`, `receptionist`, assigned `doctor`, involved `patient`

---

### Electronic Medical Records (EMR) & Prescriptions

#### `GET /api/v1/consultations` & `POST /api/v1/consultations`
Record patient consultation, chief complaint, ICD diagnosis, vital signs, and clinical notes.
- **Roles:** `doctor` (Author), `nurse` (Vitals), `admin` (Read)

#### `GET /api/v1/prescriptions` & `POST /api/v1/prescriptions`
Generate e-prescriptions with itemized medications, dosage, frequency, and pharmacy inventory link.
- **Roles:** `doctor` (Author), `nurse` / `receptionist` (Read), `patient` (Own)

---

### Billing, Invoicing & Expenses

#### `GET /api/v1/invoices` & `POST /api/v1/invoices`
Generate patient invoices with line items, discount, and tax calculations.
- **Roles:** `admin`, `clinic_manager`, `accountant`, `receptionist`

#### `POST /api/v1/invoices/{id}/payments`
Record invoice settlement (Supports partial and full payments across `cash`, `credit_card`, `insurance`, `bank_transfer`, `instapay`, `vodafone_cash`).
- **Roles:** `admin`, `clinic_manager`, `accountant`, `receptionist`

#### `POST /api/v1/invoices/{id}/refund`
Process payment refund with mandatory reason.
- **Roles:** `admin`, `clinic_manager`, `accountant`

#### `GET /api/v1/reports/financial` or `GET /api/v1/clinics/report`
Comprehensive financial statement: Gross revenue, expenses, net profit, outstanding balances, status breakdown, and payment method summaries.
- **Roles:** `admin`, `clinic_manager`, `accountant`

---

### Inventory & Stock Adjustments

#### `GET /api/v1/inventory` & `POST /api/v1/inventory`
Medical supplies & pharmacy catalog.
- **Roles:** `admin`, `clinic_manager`, `pharmacist`, `inventory_manager`, `nurse`

#### `GET /api/v1/inventory/low-stock`
Filter items where current stock <= reorder threshold.

#### `POST /api/v1/inventory/{id}/adjustments`
Atomic inventory adjustment with audit log.
- **Roles:** `admin`, `clinic_manager`, `nurse`, `pharmacist`
- **Request Body:**
  ```json
  {
    "quantity": -2,
    "type": "dispensing",
    "notes": "Dispensed for procedure in Room 3."
  }
  ```
  *(Types: `addition`, `deduction`, `dispensing`, `damage`, `expired`, `correction`).*

---

### Asynchronous Queued Notifications & WebSockets

#### `GET /api/v1/notifications`
List authenticated user's notifications.

#### `GET /api/v1/notifications/unread-count`
Retrieve badge count of unread notifications.

#### `POST /api/v1/notifications/mark-all-read`
Mark all user notifications as read.

#### `POST /api/v1/notifications`
Dispatch custom notification (Dispatched via `SendNotificationJob` off-lifecycle queue).
- **Roles:** `admin`, `clinic_manager`

#### Real-Time WebSocket Channels (Laravel Reverb)
- Private User Channel: `App.Models.User.{tenant_id}.{user_id}` (Instant booking alerts, reminders)
- Private Ticket Channel: `Support.Ticket.{id}` & `SystemAdmin.Support.Ticket.{id}` (Support desk live chat)
- Private Reservation Chat Channel: `Reservation.Chat.{id}` (In-booking live messages)

---

## 7. Error Codes & Resource Guards

| HTTP Status | Error Code | Description | Corrective Action |
|:---:|---|---|---|
| `400` | `MALFORMED_REQUEST` | Invalid JSON syntax or missing required headers | Validate JSON payload and `Content-Type` |
| `401` | `UNAUTHENTICATED` | Bearer token is missing, expired, or invalid | Re-authenticate via `/auth/login` or refresh token |
| `403` | `FORBIDDEN` | Authenticated user lacks permission for this action | Check user's assigned RBAC role |
| `403` | `PLAN_LIMIT_EXCEEDED` | Tenant has reached plan limits (`max_doctors`, `max_branches`, etc.) | Submit subscription upgrade or purchase add-on |
| `403` | `TENANT_SUSPENDED` | Tenant account is inactive or subscription is expired | Renew subscription via `/subscription-requests` |
| `404` | `TENANT_NOT_FOUND` | Specified subdomain or `X-Tenant` does not exist | Verify clinic URL or tenant slug |
| `404` | `RESOURCE_NOT_FOUND` | Requested entity ID does not exist in current tenant DB | Verify ID prefix and scope |
| `409` | `SLOT_ALREADY_BOOKED` | Target time slot has already been claimed | Refresh `/public/time-slots` and select another time |
| `409` | `OVERPAYMENT_NOT_ALLOWED` | Payment amount exceeds invoice balance due | Adjust payment amount |
| `422` | `VALIDATION_ERROR` | Request failed schema validation rules | Inspect `error.details` for field-specific errors |
| `429` | `RATE_LIMITED` | Rate limit threshold exceeded | Respect `Retry-After` response header |
| `500` | `INTERNAL_SERVER_ERROR` | Unhandled server exception | Check application logs or contact System Support |

---
*Delta Clinics CRM API Specification · Documented for Backend, Frontend, and Mobile Engineering Teams.*
