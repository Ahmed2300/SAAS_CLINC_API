# Clinic CRM — API Contract & Reference

**Version:** v1 · **Format:** REST / JSON · **Audience:** Frontend team, mobile team, and third-party integrators building on the Clinic CRM backend

This document is the full API contract for the Clinic Management System described in the project documentation guide: Patients, Appointments, Doctors, Medical Records, Billing, Inventory, Reports, and Roles & Permissions. Every endpoint below includes its method, path, required role(s), request shape, and response shape.

---

## 1. Conventions

### Base URL
```
https://api.[CLINIC_DOMAIN].com/v1
```
All paths in this document are relative to the base URL above.

### Headers
Every authenticated request must include:
```
Authorization: Bearer [ACCESS_TOKEN]
Content-Type: application/json
X-Clinic-Id: [CLINIC_ID]        // required for multi-clinic accounts; identifies which branch the request applies to
```

### Response Envelope
All successful responses are wrapped the same way:
```json
{
  "success": true,
  "data": { },
  "meta": { }
}
```
`meta` is omitted on single-resource responses and present on list responses (see Pagination below).

Errors always follow this shape (details in [Section 9 — Error Handling](#9-error-handling)):
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Patient with id 'pat_7c3f21' was not found.",
    "details": null
  }
}
```

### Pagination
List endpoints accept:

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number, 1-indexed |
| `limit` | integer | 20 | Items per page, max 100 |
| `sort` | string | `-created_at` | Field to sort by; prefix with `-` for descending |

List responses include:
```json
"meta": {
  "page": 1,
  "limit": 20,
  "total": 143,
  "total_pages": 8
}
```

### ID Format
Every resource ID is a prefixed string, e.g. `pat_7c3f21` (patient), `apt_5e2b18` (appointment). The prefix tells you the resource type at a glance — never parse or rely on the suffix format itself.

### Idempotency
`POST` requests that create financial records (`/invoices`, `/invoices/{id}/payments`) accept an optional header:
```
Idempotency-Key: [UNIQUE_CLIENT_GENERATED_KEY]
```
Replaying the same key returns the original response instead of creating a duplicate record.

---

## 2. Authentication & Roles

### Auth model
JWT bearer tokens. `access_token` is short-lived (15 minutes); `refresh_token` is long-lived (7 days) and single-use — each refresh call rotates it.

### Roles
| Role | Scope |
|---|---|
| `admin` | Full access across all clinics and modules |
| `clinic_manager` | Full access within their assigned clinic(s) |
| `doctor` | Own schedule, assigned appointments, consultations, prescriptions they authored |
| `nurse` | Patient vitals, appointment check-in, read-only medical records |
| `receptionist` | Patients, appointments, check-in, invoice creation |
| `accountant` | Invoices, payments, financial reports (no clinical data) |
| `patient` | Own profile, own appointments, own invoices, own prescriptions (read-only + booking) |

Each endpoint below lists the roles permitted to call it under **Roles**.

---

## 3. Data Models

These are the canonical shapes referenced throughout this document. Endpoint request/response bodies below use these fields unless stated otherwise.

### Patient
| Field | Type | Notes |
|---|---|---|
| `id` | string | `pat_` prefix |
| `full_name` | string | |
| `national_id` | string | Unique |
| `phone` | string | Unique |
| `email` | string \| null | |
| `date_of_birth` | string (date) | |
| `gender` | string | `male` \| `female` |
| `address` | string \| null | |
| `blood_type` | string \| null | e.g. `O+` |
| `allergies` | string[] | |
| `chronic_conditions` | string[] | |
| `emergency_contact` | object \| null | `{ name, phone, relation }` |
| `status` | string | `active` \| `archived` |
| `created_at` / `updated_at` | string (ISO 8601) | |

### Doctor
| Field | Type | Notes |
|---|---|---|
| `id` | string | `doc_` prefix |
| `user_id` | string | Linked staff account |
| `full_name` | string | |
| `specialty` | string | |
| `license_number` | string | Unique |
| `clinic_ids` | string[] | Clinics this doctor practices at |
| `consultation_fee` | number | |
| `bio` | string \| null | |
| `status` | string | `active` \| `on_leave` \| `inactive` |

### Appointment
| Field | Type | Notes |
|---|---|---|
| `id` | string | `apt_` prefix |
| `patient_id` | string | |
| `doctor_id` | string | |
| `clinic_id` | string | |
| `scheduled_at` | string (ISO 8601) | |
| `duration_minutes` | integer | Default 30 |
| `type` | string | `consultation` \| `follow_up` \| `procedure` |
| `status` | string | `scheduled` \| `confirmed` \| `checked_in` \| `in_progress` \| `completed` \| `cancelled` \| `no_show` |
| `reason` | string \| null | |
| `notes` | string \| null | |
| `created_by` | string | User id |

### Consultation (medical record entry)
| Field | Type | Notes |
|---|---|---|
| `id` | string | `cst_` prefix |
| `appointment_id` | string | |
| `patient_id` / `doctor_id` | string | |
| `chief_complaint` | string | |
| `diagnosis` | string | |
| `vitals` | object | `{ blood_pressure, heart_rate, temperature_c, weight_kg, height_cm }` |
| `notes` | string \| null | |
| `follow_up_required` | boolean | |
| `follow_up_date` | string (date) \| null | |

### Prescription
| Field | Type | Notes |
|---|---|---|
| `id` | string | `rx_` prefix |
| `consultation_id` | string | |
| `patient_id` / `doctor_id` | string | |
| `medications` | array | `[{ inventory_item_id, name, dosage, frequency, duration_days, instructions }]` |
| `status` | string | `active` \| `fulfilled` \| `cancelled` |
| `issued_at` | string (ISO 8601) | |

### Invoice
| Field | Type | Notes |
|---|---|---|
| `id` | string | `inv_` prefix |
| `patient_id` / `appointment_id` / `clinic_id` | string | |
| `items` | array | `[{ description, quantity, unit_price, total }]` |
| `subtotal` / `discount` / `tax` / `total` | number | |
| `amount_paid` / `balance_due` | number | |
| `status` | string | `draft` \| `pending` \| `partially_paid` \| `paid` \| `void` |
| `due_date` | string (date) | |

### Payment
| Field | Type | Notes |
|---|---|---|
| `id` | string | `pay_` prefix |
| `invoice_id` | string | |
| `amount` | number | |
| `method` | string | `cash` \| `card` \| `insurance` \| `wallet` |
| `reference_number` | string \| null | |
| `received_by` | string | User id |
| `paid_at` | string (ISO 8601) | |

### InventoryItem
| Field | Type | Notes |
|---|---|---|
| `id` | string | `itm_` prefix |
| `name` | string | |
| `category` | string | `medicine` \| `supply` |
| `unit` | string | e.g. `box`, `vial` |
| `quantity_in_stock` | integer | |
| `reorder_level` | integer | Triggers low-stock alert |
| `unit_cost` | number | |
| `expiry_date` | string (date) \| null | |
| `clinic_id` | string | |

---

## 4. Endpoint Summary

| Module | Method & Path | Description |
|---|---|---|
| **Auth** | `POST /auth/login` | Log in with email + password |
| | `POST /auth/refresh` | Rotate access token |
| | `POST /auth/logout` | Revoke refresh token |
| | `POST /auth/forgot-password` | Request reset email |
| | `POST /auth/reset-password` | Set new password |
| | `GET /auth/me` | Current user profile |
| **Users** | `GET /users` | List staff |
| | `POST /users` | Invite/create staff member |
| | `GET /users/{userId}` | Get staff member |
| | `PATCH /users/{userId}` | Update staff member |
| | `DELETE /users/{userId}` | Remove staff member |
| | `PATCH /users/{userId}/status` | Activate/deactivate |
| **Roles** | `GET /roles` | List roles |
| | `GET /roles/{roleId}` | Get role + permissions |
| | `PATCH /roles/{roleId}/permissions` | Update permission set |
| **Clinics** | `GET /clinics` | List branches |
| | `POST /clinics` | Create branch |
| | `GET /clinics/{clinicId}` | Get branch |
| | `PATCH /clinics/{clinicId}` | Update branch |
| | `DELETE /clinics/{clinicId}` | Deactivate branch |
| **Patients** | `GET /patients` | Search/list patients |
| | `POST /patients` | Register patient |
| | `GET /patients/{patientId}` | Get patient |
| | `PATCH /patients/{patientId}` | Update patient |
| | `DELETE /patients/{patientId}` | Archive patient |
| | `GET /patients/{patientId}/medical-history` | Full consultation + prescription history |
| | `GET /patients/{patientId}/appointments` | Patient's appointments |
| | `GET /patients/{patientId}/invoices` | Patient's invoices |
| **Doctors** | `GET /doctors` | List doctors |
| | `POST /doctors` | Add doctor |
| | `GET /doctors/{doctorId}` | Get doctor |
| | `PATCH /doctors/{doctorId}` | Update doctor |
| | `DELETE /doctors/{doctorId}` | Remove doctor |
| | `GET /doctors/{doctorId}/schedule` | Weekly availability |
| | `PUT /doctors/{doctorId}/schedule` | Replace availability |
| | `GET /doctors/{doctorId}/appointments` | Doctor's appointments |
| **Appointments** | `GET /appointments` | List/filter appointments |
| | `POST /appointments` | Book appointment |
| | `GET /appointments/{appointmentId}` | Get appointment |
| | `PATCH /appointments/{appointmentId}` | Reschedule/edit |
| | `DELETE /appointments/{appointmentId}` | Cancel appointment |
| | `PATCH /appointments/{appointmentId}/check-in` | Front-desk check-in |
| | `PATCH /appointments/{appointmentId}/status` | Transition status |
| | `GET /appointments/available-slots` | Free slot finder |
| **Consultations** | `GET /consultations` | List consultations |
| | `POST /consultations` | Record consultation |
| | `GET /consultations/{consultationId}` | Get consultation |
| | `PATCH /consultations/{consultationId}` | Amend consultation |
| **Prescriptions** | `GET /prescriptions` | List prescriptions |
| | `POST /prescriptions` | Issue prescription |
| | `GET /prescriptions/{prescriptionId}` | Get prescription |
| | `PATCH /prescriptions/{prescriptionId}` | Update prescription |
| | `DELETE /prescriptions/{prescriptionId}` | Cancel prescription |
| **Billing** | `GET /invoices` | List invoices |
| | `POST /invoices` | Create invoice |
| | `GET /invoices/{invoiceId}` | Get invoice |
| | `PATCH /invoices/{invoiceId}` | Edit draft invoice |
| | `DELETE /invoices/{invoiceId}` | Void invoice |
| | `POST /invoices/{invoiceId}/payments` | Record payment |
| | `GET /invoices/{invoiceId}/payments` | List payments on invoice |
| | `POST /invoices/{invoiceId}/refund` | Refund a payment |
| **Inventory** | `GET /inventory/items` | List stock items |
| | `POST /inventory/items` | Add stock item |
| | `GET /inventory/items/{itemId}` | Get item |
| | `PATCH /inventory/items/{itemId}` | Update item |
| | `DELETE /inventory/items/{itemId}` | Remove item |
| | `POST /inventory/items/{itemId}/stock-adjustments` | Adjust quantity |
| | `GET /inventory/low-stock` | Items at/below reorder level |
| **Notifications** | `GET /notifications` | List sent/queued notifications |
| | `POST /notifications/send` | Trigger manual notification |
| | `PATCH /notifications/{notificationId}/read` | Mark read (patient portal) |
| **Reports** | `GET /reports/revenue` | Revenue over time |
| | `GET /reports/appointments-summary` | Volume by status/doctor |
| | `GET /reports/no-show-rate` | No-show percentage |
| | `GET /reports/doctor-performance` | Per-doctor metrics |
| | `GET /reports/patients-growth` | New patients over time |
| **Audit Logs** | `GET /audit-logs` | List system activity |
| | `GET /audit-logs/{logId}` | Get single log entry |

---

## 5. Authentication

#### `POST /auth/login`
**Roles:** none (public)

Request:
```json
{
  "email": "dr.hassan@clinic.com",
  "password": "••••••••"
}
```
Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "8f3a1c9e-...",
    "expires_in": 900,
    "user": {
      "id": "usr_d4e5f6",
      "full_name": "Dr. Ahmed Hassan",
      "role": "doctor",
      "clinic_id": "cli_a1b2c3"
    }
  }
}
```
Errors: `401 INVALID_CREDENTIALS`, `403 ACCOUNT_INACTIVE`

---

#### `POST /auth/refresh`
**Roles:** none (requires valid refresh token)

Request:
```json
{ "refresh_token": "8f3a1c9e-..." }
```
Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "a91cf2b0-...",
    "expires_in": 900
  }
}
```
Errors: `401 INVALID_OR_EXPIRED_TOKEN`

---

#### `POST /auth/logout`
**Roles:** any authenticated user

Request: *(empty body)*
```json
{ "refresh_token": "8f3a1c9e-..." }
```
Response `204 No Content`

---

#### `POST /auth/forgot-password`
**Roles:** none (public)

Request:
```json
{ "email": "dr.hassan@clinic.com" }
```
Response `200 OK`:
```json
{ "success": true, "data": { "message": "If that email exists, a reset link has been sent." } }
```
Note: always returns 200 regardless of whether the email exists, to avoid account enumeration.

---

#### `POST /auth/reset-password`
**Roles:** none (requires valid reset token from email)

Request:
```json
{
  "reset_token": "9c2f-reset-token",
  "new_password": "NewSecurePass123!"
}
```
Response `200 OK`:
```json
{ "success": true, "data": { "message": "Password updated successfully." } }
```
Errors: `400 WEAK_PASSWORD`, `401 INVALID_OR_EXPIRED_TOKEN`

---

#### `GET /auth/me`
**Roles:** any authenticated user

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "usr_d4e5f6",
    "full_name": "Dr. Ahmed Hassan",
    "email": "dr.hassan@clinic.com",
    "role": "doctor",
    "clinic_id": "cli_a1b2c3",
    "status": "active"
  }
}
```

---

## 6. Users & Staff

#### `GET /users`
**Roles:** `admin`, `clinic_manager`

Query params: `role`, `clinic_id`, `status`, `search` — plus standard pagination.

Response `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "usr_d4e5f6",
      "full_name": "Dr. Ahmed Hassan",
      "email": "dr.hassan@clinic.com",
      "phone": "+201012345678",
      "role": "doctor",
      "clinic_id": "cli_a1b2c3",
      "status": "active",
      "created_at": "2026-01-14T09:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12, "total_pages": 1 }
}
```

---

#### `POST /users`
**Roles:** `admin`, `clinic_manager`

Sends an invitation email; the account is `pending` until the invite is accepted.

Request:
```json
{
  "full_name": "Mona Saeed",
  "email": "mona.saeed@clinic.com",
  "phone": "+201098765432",
  "role": "receptionist",
  "clinic_id": "cli_a1b2c3"
}
```
Response `201 Created`:
```json
{
  "success": true,
  "data": {
    "id": "usr_7b1e90",
    "full_name": "Mona Saeed",
    "email": "mona.saeed@clinic.com",
    "role": "receptionist",
    "clinic_id": "cli_a1b2c3",
    "status": "pending",
    "created_at": "2026-08-12T10:15:00Z"
  }
}
```
Errors: `409 EMAIL_ALREADY_EXISTS`, `422 VALIDATION_ERROR`

---

#### `GET /users/{userId}`
**Roles:** `admin`, `clinic_manager`, self

Response `200 OK`: same shape as list item above.
Errors: `404 USER_NOT_FOUND`

---

#### `PATCH /users/{userId}`
**Roles:** `admin`, `clinic_manager`, self (self cannot change `role`)

Request (send only fields to change):
```json
{ "phone": "+201099998888" }
```
Response `200 OK`: updated user object.
Errors: `403 FORBIDDEN_FIELD`, `404 USER_NOT_FOUND`

---

#### `DELETE /users/{userId}`
**Roles:** `admin`

Soft-deletes the account (retained for audit trail; login disabled).

Response `204 No Content`
Errors: `404 USER_NOT_FOUND`, `409 CANNOT_DELETE_LAST_ADMIN`

---

#### `PATCH /users/{userId}/status`
**Roles:** `admin`, `clinic_manager`

Request:
```json
{ "status": "inactive" }
```
Response `200 OK`:
```json
{ "success": true, "data": { "id": "usr_7b1e90", "status": "inactive" } }
```

---

## 7. Roles & Permissions

#### `GET /roles`
**Roles:** `admin`

Response `200 OK`:
```json
{
  "success": true,
  "data": [
    { "id": "role_doctor", "name": "doctor", "description": "Clinical staff with prescribing rights" },
    { "id": "role_receptionist", "name": "receptionist", "description": "Front-desk operations" }
  ]
}
```

---

#### `GET /roles/{roleId}`
**Roles:** `admin`

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "role_receptionist",
    "name": "receptionist",
    "permissions": [
      "patients:read", "patients:create", "patients:update",
      "appointments:read", "appointments:create", "appointments:check_in",
      "invoices:create"
    ]
  }
}
```

---

#### `PATCH /roles/{roleId}/permissions`
**Roles:** `admin`

Request:
```json
{
  "permissions": [
    "patients:read", "patients:create", "patients:update",
    "appointments:read", "appointments:create", "appointments:check_in"
  ]
}
```
Response `200 OK`: updated role object.
Errors: `400 UNKNOWN_PERMISSION_KEY`, `403 CANNOT_MODIFY_ADMIN_ROLE`

---

## 8. Clinics (Multi-Branch)

#### `GET /clinics`
**Roles:** `admin`; scoped list for others (only clinics they belong to)

Response `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "cli_a1b2c3",
      "name": "Devesters Medical Center — Mansoura",
      "address": "12 El-Gomhoria St, Mansoura",
      "phone": "+205023456789",
      "timezone": "Africa/Cairo",
      "status": "active"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3, "total_pages": 1 }
}
```

---

#### `POST /clinics`
**Roles:** `admin`

Request:
```json
{
  "name": "Devesters Medical Center — Talkha",
  "address": "5 Nile Corniche, Talkha",
  "phone": "+205019988776",
  "timezone": "Africa/Cairo"
}
```
Response `201 Created`: created clinic object.
Errors: `422 VALIDATION_ERROR`

---

#### `GET /clinics/{clinicId}`
**Roles:** `admin`, staff of that clinic

Response `200 OK`: clinic object.
Errors: `404 CLINIC_NOT_FOUND`

---

#### `PATCH /clinics/{clinicId}`
**Roles:** `admin`, `clinic_manager` (own clinic only)

Request:
```json
{ "phone": "+205011112222" }
```
Response `200 OK`: updated clinic object.

---

#### `DELETE /clinics/{clinicId}`
**Roles:** `admin`

Deactivates the branch; does not delete historical records.

Response `204 No Content`
Errors: `409 CLINIC_HAS_ACTIVE_APPOINTMENTS`

---

## 9. Patients

#### `GET /patients`
**Roles:** `admin`, `clinic_manager`, `doctor`, `nurse`, `receptionist`, `accountant`

Query params: `search` (name/phone/national_id), `status`, `gender` — plus standard pagination.

Response `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "pat_7c3f21",
      "full_name": "Laila Ibrahim",
      "national_id": "29501150123456",
      "phone": "+201234567890",
      "email": "laila.ibrahim@example.com",
      "date_of_birth": "1995-01-15",
      "gender": "female",
      "blood_type": "O+",
      "allergies": ["Penicillin"],
      "chronic_conditions": [],
      "status": "active",
      "created_at": "2025-11-02T08:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 386, "total_pages": 20 }
}
```

---

#### `POST /patients`
**Roles:** `admin`, `clinic_manager`, `receptionist`

Request:
```json
{
  "full_name": "Laila Ibrahim",
  "national_id": "29501150123456",
  "phone": "+201234567890",
  "email": "laila.ibrahim@example.com",
  "date_of_birth": "1995-01-15",
  "gender": "female",
  "address": "10 Talaat Harb St, Cairo",
  "blood_type": "O+",
  "allergies": ["Penicillin"],
  "chronic_conditions": [],
  "emergency_contact": { "name": "Omar Ibrahim", "phone": "+201234500000", "relation": "brother" }
}
```
Response `201 Created`: created patient object (see [Patient model](#3-data-models)).
Errors: `409 NATIONAL_ID_ALREADY_EXISTS`, `422 VALIDATION_ERROR`

---

#### `GET /patients/{patientId}`
**Roles:** `admin`, `clinic_manager`, `doctor`, `nurse`, `receptionist`, `accountant`, self (patient portal)

Response `200 OK`: patient object.
Errors: `404 PATIENT_NOT_FOUND`

---

#### `PATCH /patients/{patientId}`
**Roles:** `admin`, `clinic_manager`, `receptionist`

Request (partial):
```json
{ "phone": "+201234567891", "allergies": ["Penicillin", "Latex"] }
```
Response `200 OK`: updated patient object.

---

#### `DELETE /patients/{patientId}`
**Roles:** `admin`, `clinic_manager`

Archives the patient (soft delete — medical records are retained for legal compliance).

Response `204 No Content`
Errors: `409 PATIENT_HAS_UPCOMING_APPOINTMENTS`

---

#### `GET /patients/{patientId}/medical-history`
**Roles:** `admin`, `doctor`, `nurse` (own clinic), self

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "patient_id": "pat_7c3f21",
    "consultations": [
      {
        "id": "cst_3d8f42",
        "date": "2026-07-20T10:00:00Z",
        "doctor_name": "Dr. Ahmed Hassan",
        "diagnosis": "Seasonal allergic rhinitis",
        "prescriptions": ["rx_6a1c90"]
      }
    ]
  },
  "meta": { "page": 1, "limit": 20, "total": 4, "total_pages": 1 }
}
```

---

#### `GET /patients/{patientId}/appointments`
**Roles:** `admin`, `clinic_manager`, `doctor`, `receptionist`, self

Query params: `status`, `date_from`, `date_to`.

Response `200 OK`: array of [Appointment](#3-data-models) objects, paginated.

---

#### `GET /patients/{patientId}/invoices`
**Roles:** `admin`, `clinic_manager`, `accountant`, self

Response `200 OK`: array of [Invoice](#3-data-models) objects, paginated.

---

## 10. Doctors

#### `GET /doctors`
**Roles:** all authenticated roles

Query params: `specialty`, `clinic_id`, `status`.

Response `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_9f1a20",
      "user_id": "usr_d4e5f6",
      "full_name": "Dr. Ahmed Hassan",
      "specialty": "Dermatology",
      "license_number": "EG-DERM-44821",
      "clinic_ids": ["cli_a1b2c3"],
      "consultation_fee": 350,
      "status": "active"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 7, "total_pages": 1 }
}
```

---

#### `POST /doctors`
**Roles:** `admin`, `clinic_manager`

Creates a doctor profile linked to an existing (or newly invited) staff user.

Request:
```json
{
  "user_id": "usr_d4e5f6",
  "specialty": "Dermatology",
  "license_number": "EG-DERM-44821",
  "clinic_ids": ["cli_a1b2c3"],
  "consultation_fee": 350,
  "bio": "10+ years in clinical dermatology."
}
```
Response `201 Created`: created doctor object.
Errors: `409 LICENSE_ALREADY_REGISTERED`, `422 VALIDATION_ERROR`

---

#### `GET /doctors/{doctorId}`
**Roles:** all authenticated roles

Response `200 OK`: doctor object.
Errors: `404 DOCTOR_NOT_FOUND`

---

#### `PATCH /doctors/{doctorId}`
**Roles:** `admin`, `clinic_manager`, self

Request (partial):
```json
{ "consultation_fee": 400, "status": "on_leave" }
```
Response `200 OK`: updated doctor object.

---

#### `DELETE /doctors/{doctorId}`
**Roles:** `admin`

Response `204 No Content`
Errors: `409 DOCTOR_HAS_UPCOMING_APPOINTMENTS`

---

#### `GET /doctors/{doctorId}/schedule`
**Roles:** all authenticated roles

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "doctor_id": "doc_9f1a20",
    "weekly_availability": [
      { "day_of_week": "sunday", "start_time": "10:00", "end_time": "18:00" },
      { "day_of_week": "tuesday", "start_time": "10:00", "end_time": "18:00" }
    ],
    "exceptions": [
      { "date": "2026-08-20", "is_available": false, "reason": "Conference" }
    ]
  }
}
```

---

#### `PUT /doctors/{doctorId}/schedule`
**Roles:** `admin`, `clinic_manager`, self

Replaces the full weekly availability set.

Request:
```json
{
  "weekly_availability": [
    { "day_of_week": "sunday", "start_time": "10:00", "end_time": "18:00" },
    { "day_of_week": "monday", "start_time": "10:00", "end_time": "16:00" }
  ]
}
```
Response `200 OK`: updated schedule object.
Errors: `400 INVALID_TIME_RANGE`

---

#### `GET /doctors/{doctorId}/appointments`
**Roles:** `admin`, `clinic_manager`, `receptionist`, self

Query params: `date_from`, `date_to`, `status`.

Response `200 OK`: array of [Appointment](#3-data-models) objects, paginated.

---

## 11. Appointments

#### `GET /appointments`
**Roles:** `admin`, `clinic_manager`, `doctor`, `nurse`, `receptionist`; patients see only their own

Query params: `patient_id`, `doctor_id`, `clinic_id`, `status`, `date_from`, `date_to`.

Response `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "apt_5e2b18",
      "patient_id": "pat_7c3f21",
      "doctor_id": "doc_9f1a20",
      "clinic_id": "cli_a1b2c3",
      "scheduled_at": "2026-08-15T11:30:00Z",
      "duration_minutes": 30,
      "type": "consultation",
      "status": "scheduled",
      "reason": "Follow-up on skin rash",
      "created_by": "usr_7b1e90"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 58, "total_pages": 3 }
}
```

---

#### `POST /appointments`
**Roles:** `admin`, `clinic_manager`, `receptionist`; `patient` (self-booking on their own record)

Request:
```json
{
  "patient_id": "pat_7c3f21",
  "doctor_id": "doc_9f1a20",
  "clinic_id": "cli_a1b2c3",
  "scheduled_at": "2026-08-15T11:30:00Z",
  "duration_minutes": 30,
  "type": "consultation",
  "reason": "Follow-up on skin rash"
}
```
Response `201 Created`: created appointment object, `status: "scheduled"`.
Errors: `409 SLOT_UNAVAILABLE`, `422 VALIDATION_ERROR`

---

#### `GET /appointments/{appointmentId}`
**Roles:** `admin`, `clinic_manager`, `doctor`, `nurse`, `receptionist`, involved patient

Response `200 OK`: appointment object.
Errors: `404 APPOINTMENT_NOT_FOUND`

---

#### `PATCH /appointments/{appointmentId}`
**Roles:** `admin`, `clinic_manager`, `receptionist`

Used to reschedule or edit reason/notes. Changing `scheduled_at` re-validates slot availability.

Request:
```json
{ "scheduled_at": "2026-08-16T09:00:00Z" }
```
Response `200 OK`: updated appointment object.
Errors: `409 SLOT_UNAVAILABLE`

---

#### `DELETE /appointments/{appointmentId}`
**Roles:** `admin`, `clinic_manager`, `receptionist`, involved patient

Cancels the appointment (sets `status: "cancelled"`; record is retained, not hard-deleted).

Response `204 No Content`
Errors: `409 APPOINTMENT_ALREADY_COMPLETED`

---

#### `PATCH /appointments/{appointmentId}/check-in`
**Roles:** `admin`, `clinic_manager`, `receptionist`, `nurse`

Request: *(empty body)*
Response `200 OK`:
```json
{ "success": true, "data": { "id": "apt_5e2b18", "status": "checked_in", "checked_in_at": "2026-08-15T11:25:00Z" } }
```
Errors: `409 INVALID_STATUS_TRANSITION`

---

#### `PATCH /appointments/{appointmentId}/status`
**Roles:** `admin`, `clinic_manager`, `doctor`, `receptionist`

Request:
```json
{ "status": "no_show" }
```
Valid transitions: `scheduled → confirmed → checked_in → in_progress → completed`, or any state `→ cancelled` / `→ no_show` (only from `scheduled`/`confirmed`).

Response `200 OK`: updated appointment object.
Errors: `409 INVALID_STATUS_TRANSITION`

---

#### `GET /appointments/available-slots`
**Roles:** `admin`, `clinic_manager`, `receptionist`, `doctor`, `patient`

Query params (required): `doctor_id`, `date`. Optional: `duration_minutes` (default 30).

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "doctor_id": "doc_9f1a20",
    "date": "2026-08-15",
    "slots": ["10:00", "10:30", "11:00", "14:00", "14:30"]
  }
}
```

---

## 12. Consultations (Medical Records)

#### `GET /consultations`
**Roles:** `admin`, `doctor`, `nurse` (read-only)

Query params: `patient_id`, `doctor_id`, `date_from`, `date_to`.

Response `200 OK`: array of consultation objects (see [model](#3-data-models)), paginated.

---

#### `POST /consultations`
**Roles:** `doctor`

Created against a `checked_in` or `in_progress` appointment; automatically transitions the appointment to `completed` once submitted.

Request:
```json
{
  "appointment_id": "apt_5e2b18",
  "chief_complaint": "Recurring itchy rash on forearm",
  "diagnosis": "Contact dermatitis",
  "vitals": {
    "blood_pressure": "120/80",
    "heart_rate": 72,
    "temperature_c": 36.8,
    "weight_kg": 68,
    "height_cm": 170
  },
  "notes": "Advised to avoid the suspected detergent brand.",
  "follow_up_required": true,
  "follow_up_date": "2026-08-29"
}
```
Response `201 Created`: created consultation object.
Errors: `409 APPOINTMENT_NOT_CHECKED_IN`, `422 VALIDATION_ERROR`

---

#### `GET /consultations/{consultationId}`
**Roles:** `admin`, `doctor`, `nurse`, involved patient

Response `200 OK`: consultation object, with nested `prescriptions: [rx_...]` ids.
Errors: `404 CONSULTATION_NOT_FOUND`

---

#### `PATCH /consultations/{consultationId}`
**Roles:** `admin`, the authoring `doctor` (within 24 hours of creation)

Request (partial):
```json
{ "notes": "Updated: symptoms improved after avoiding the detergent." }
```
Response `200 OK`: updated consultation object.
Errors: `403 EDIT_WINDOW_EXPIRED`

---

## 13. Prescriptions

#### `GET /prescriptions`
**Roles:** `admin`, `doctor`, `nurse`; involved patient sees own

Query params: `patient_id`, `doctor_id`, `status`.

Response `200 OK`: array of prescription objects, paginated.

---

#### `POST /prescriptions`
**Roles:** `doctor`

Request:
```json
{
  "consultation_id": "cst_3d8f42",
  "medications": [
    {
      "inventory_item_id": "itm_1a9c77",
      "name": "Cetirizine 10mg",
      "dosage": "1 tablet",
      "frequency": "once daily",
      "duration_days": 10,
      "instructions": "Take at night."
    }
  ]
}
```
Response `201 Created`: created prescription object, `status: "active"`.
Errors: `422 VALIDATION_ERROR`

---

#### `GET /prescriptions/{prescriptionId}`
**Roles:** `admin`, `doctor`, `nurse`, involved patient

Response `200 OK`: prescription object.
Errors: `404 PRESCRIPTION_NOT_FOUND`

---

#### `PATCH /prescriptions/{prescriptionId}`
**Roles:** `admin`, the authoring `doctor`

Request:
```json
{ "status": "fulfilled" }
```
Response `200 OK`: updated prescription object.

---

#### `DELETE /prescriptions/{prescriptionId}`
**Roles:** `admin`, the authoring `doctor`

Sets `status: "cancelled"` (not hard-deleted — required for medical audit trail).

Response `204 No Content`

---

## 14. Billing & Invoices

#### `GET /invoices`
**Roles:** `admin`, `clinic_manager`, `accountant`, `receptionist`; involved patient sees own

Query params: `patient_id`, `status`, `date_from`, `date_to`.

Response `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "inv_2f7e11",
      "patient_id": "pat_7c3f21",
      "appointment_id": "apt_5e2b18",
      "clinic_id": "cli_a1b2c3",
      "items": [
        { "description": "Dermatology consultation", "quantity": 1, "unit_price": 350, "total": 350 }
      ],
      "subtotal": 350,
      "discount": 0,
      "tax": 0,
      "total": 350,
      "amount_paid": 0,
      "balance_due": 350,
      "status": "pending",
      "due_date": "2026-08-22"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 92, "total_pages": 5 }
}
```

---

#### `POST /invoices`
**Roles:** `admin`, `clinic_manager`, `receptionist`, `accountant`

Request:
```json
{
  "patient_id": "pat_7c3f21",
  "appointment_id": "apt_5e2b18",
  "clinic_id": "cli_a1b2c3",
  "items": [
    { "description": "Dermatology consultation", "quantity": 1, "unit_price": 350 }
  ],
  "discount": 0,
  "tax": 0,
  "due_date": "2026-08-22"
}
```
Response `201 Created`: created invoice object, `status: "pending"`, `total` computed server-side.
Errors: `422 VALIDATION_ERROR`

---

#### `GET /invoices/{invoiceId}`
**Roles:** `admin`, `clinic_manager`, `accountant`, `receptionist`, involved patient

Response `200 OK`: invoice object.
Errors: `404 INVOICE_NOT_FOUND`

---

#### `PATCH /invoices/{invoiceId}`
**Roles:** `admin`, `clinic_manager`, `accountant`

Only invoices in `draft` status can be edited.

Request:
```json
{ "discount": 50 }
```
Response `200 OK`: updated invoice object.
Errors: `409 INVOICE_NOT_EDITABLE`

---

#### `DELETE /invoices/{invoiceId}`
**Roles:** `admin`, `clinic_manager`

Voids the invoice (sets `status: "void"`; retained for audit).

Response `204 No Content`
Errors: `409 INVOICE_HAS_PAYMENTS`

---

#### `POST /invoices/{invoiceId}/payments`
**Roles:** `admin`, `clinic_manager`, `receptionist`, `accountant`

Request:
```json
{
  "amount": 350,
  "method": "card",
  "reference_number": "TXN-8823410"
}
```
Response `201 Created`:
```json
{
  "success": true,
  "data": {
    "id": "pay_8b4d33",
    "invoice_id": "inv_2f7e11",
    "amount": 350,
    "method": "card",
    "reference_number": "TXN-8823410",
    "received_by": "usr_7b1e90",
    "paid_at": "2026-08-12T12:05:00Z"
  }
}
```
The invoice's `amount_paid`, `balance_due`, and `status` (→ `paid` or `partially_paid`) update automatically.

Errors: `409 OVERPAYMENT_NOT_ALLOWED`, `422 VALIDATION_ERROR`

---

#### `GET /invoices/{invoiceId}/payments`
**Roles:** `admin`, `clinic_manager`, `accountant`, `receptionist`, involved patient

Response `200 OK`: array of [Payment](#3-data-models) objects.

---

#### `POST /invoices/{invoiceId}/refund`
**Roles:** `admin`, `clinic_manager`

Request:
```json
{
  "payment_id": "pay_8b4d33",
  "amount": 350,
  "reason": "Appointment cancelled after payment"
}
```
Response `201 Created`:
```json
{
  "success": true,
  "data": {
    "id": "rfd_5c1a02",
    "payment_id": "pay_8b4d33",
    "amount": 350,
    "reason": "Appointment cancelled after payment",
    "status": "processed",
    "processed_at": "2026-08-12T13:00:00Z"
  }
}
```
Errors: `409 REFUND_EXCEEDS_PAYMENT`

---

## 15. Inventory

#### `GET /inventory/items`
**Roles:** `admin`, `clinic_manager`, `doctor`, `nurse`

Query params: `category`, `clinic_id`, `search`.

Response `200 OK`: array of [InventoryItem](#3-data-models) objects, paginated.

---

#### `POST /inventory/items`
**Roles:** `admin`, `clinic_manager`

Request:
```json
{
  "name": "Cetirizine 10mg",
  "category": "medicine",
  "unit": "box",
  "quantity_in_stock": 120,
  "reorder_level": 20,
  "unit_cost": 45,
  "expiry_date": "2027-03-01",
  "clinic_id": "cli_a1b2c3"
}
```
Response `201 Created`: created inventory item object.

---

#### `GET /inventory/items/{itemId}`
**Roles:** `admin`, `clinic_manager`, `doctor`, `nurse`

Response `200 OK`: inventory item object.
Errors: `404 ITEM_NOT_FOUND`

---

#### `PATCH /inventory/items/{itemId}`
**Roles:** `admin`, `clinic_manager`

Request (partial):
```json
{ "reorder_level": 30, "unit_cost": 48 }
```
Response `200 OK`: updated inventory item object.

---

#### `DELETE /inventory/items/{itemId}`
**Roles:** `admin`, `clinic_manager`

Response `204 No Content`
Errors: `409 ITEM_REFERENCED_BY_ACTIVE_PRESCRIPTIONS`

---

#### `POST /inventory/items/{itemId}/stock-adjustments`
**Roles:** `admin`, `clinic_manager`, `nurse`

Request:
```json
{
  "change_quantity": -5,
  "reason": "usage"
}
```
Response `201 Created`:
```json
{
  "success": true,
  "data": {
    "id": "adj_4e9b12",
    "inventory_item_id": "itm_1a9c77",
    "change_quantity": -5,
    "reason": "usage",
    "adjusted_by": "usr_7b1e90",
    "resulting_quantity": 115,
    "created_at": "2026-08-12T12:30:00Z"
  }
}
```
Errors: `409 INSUFFICIENT_STOCK`

---

#### `GET /inventory/low-stock`
**Roles:** `admin`, `clinic_manager`

Response `200 OK`: array of items where `quantity_in_stock <= reorder_level`, paginated.

---

## 16. Notifications

#### `GET /notifications`
**Roles:** `admin`, `clinic_manager`; patients see own

Query params: `recipient_id`, `channel`, `status`.

Response `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "ntf_4c2e19",
      "recipient_type": "patient",
      "recipient_id": "pat_7c3f21",
      "channel": "whatsapp",
      "template_key": "appointment_reminder_24h",
      "status": "sent",
      "scheduled_at": "2026-08-14T11:30:00Z",
      "sent_at": "2026-08-14T11:30:05Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 210, "total_pages": 11 }
}
```

---

#### `POST /notifications/send`
**Roles:** `admin`, `clinic_manager`, `receptionist`

Manually triggers a notification outside the automated reminder schedule.

Request:
```json
{
  "recipient_type": "patient",
  "recipient_id": "pat_7c3f21",
  "channel": "sms",
  "template_key": "invoice_payment_due",
  "context": { "invoice_id": "inv_2f7e11" }
}
```
Response `201 Created`: created notification object, `status: "queued"`.
Errors: `422 UNKNOWN_TEMPLATE_KEY`

---

#### `PATCH /notifications/{notificationId}/read`
**Roles:** involved patient (patient portal)

Request: *(empty body)*
Response `200 OK`:
```json
{ "success": true, "data": { "id": "ntf_4c2e19", "read_at": "2026-08-14T12:00:00Z" } }
```

---

## 17. Reports & Analytics

All report endpoints share these query params unless noted: `date_from`, `date_to`, `clinic_id`.

**Roles for this entire module:** `admin`, `clinic_manager`, `accountant` (financial reports only — `no-show-rate`, `appointments-summary`, `doctor-performance`, `patients-growth` are also visible to `clinic_manager`).

#### `GET /reports/revenue`
**Roles:** `admin`, `clinic_manager`, `accountant`

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "period": { "from": "2026-07-01", "to": "2026-07-31" },
    "total_revenue": 184500,
    "total_collected": 176200,
    "total_outstanding": 8300,
    "breakdown_by_day": [
      { "date": "2026-07-01", "revenue": 6200 }
    ]
  }
}
```

---

#### `GET /reports/appointments-summary`
**Roles:** `admin`, `clinic_manager`

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "total_appointments": 412,
    "by_status": { "completed": 340, "cancelled": 28, "no_show": 22, "scheduled": 22 },
    "by_doctor": [
      { "doctor_id": "doc_9f1a20", "doctor_name": "Dr. Ahmed Hassan", "count": 96 }
    ]
  }
}
```

---

#### `GET /reports/no-show-rate`
**Roles:** `admin`, `clinic_manager`

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "no_show_rate_percent": 5.3,
    "total_appointments": 412,
    "no_shows": 22,
    "trend": [
      { "month": "2026-06", "rate_percent": 6.1 },
      { "month": "2026-07", "rate_percent": 5.3 }
    ]
  }
}
```

---

#### `GET /reports/doctor-performance`
**Roles:** `admin`, `clinic_manager`

Response `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "doctor_id": "doc_9f1a20",
      "doctor_name": "Dr. Ahmed Hassan",
      "appointments_completed": 89,
      "average_consultation_minutes": 24,
      "revenue_generated": 31150,
      "patient_satisfaction_score": 4.7
    }
  ]
}
```

---

#### `GET /reports/patients-growth`
**Roles:** `admin`, `clinic_manager`

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "new_patients_total": 58,
    "by_month": [
      { "month": "2026-06", "new_patients": 26 },
      { "month": "2026-07", "new_patients": 32 }
    ]
  }
}
```

---

## 18. Audit Logs

#### `GET /audit-logs`
**Roles:** `admin`

Query params: `actor_id`, `resource_type`, `resource_id`, `date_from`, `date_to`.

Response `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "log_9e3f01",
      "actor_id": "usr_7b1e90",
      "action": "invoice.payment_recorded",
      "resource_type": "invoice",
      "resource_id": "inv_2f7e11",
      "changes": { "amount_paid": { "from": 0, "to": 350 } },
      "ip_address": "41.238.12.4",
      "created_at": "2026-08-12T12:05:03Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1840, "total_pages": 92 }
}
```

---

#### `GET /audit-logs/{logId}`
**Roles:** `admin`

Response `200 OK`: single audit log entry.
Errors: `404 LOG_NOT_FOUND`

---

## 9. Error Handling

### Global error codes

| HTTP Status | Code | Meaning | Fix |
|---|---|---|---|
| 400 | `MALFORMED_REQUEST` | Request body isn't valid JSON or is missing entirely | Check `Content-Type` header and body syntax |
| 401 | `UNAUTHENTICATED` | Missing or invalid access token | Re-authenticate via `/auth/login` or `/auth/refresh` |
| 401 | `INVALID_CREDENTIALS` | Wrong email/password on login | Verify credentials |
| 403 | `FORBIDDEN` | Token is valid but the role lacks permission for this action | Confirm the user's role and required permission |
| 404 | `RESOURCE_NOT_FOUND` | The requested `{id}` doesn't exist or isn't in scope for this user's clinic | Confirm the ID and that the resource belongs to `X-Clinic-Id` |
| 409 | `CONFLICT` | Request conflicts with current resource state (double-booked slot, duplicate ID, invalid status transition) | Read `error.details` for the specific conflict and adjust |
| 422 | `VALIDATION_ERROR` | Body failed schema validation | Read `error.details` for the field-level errors |
| 429 | `RATE_LIMITED` | Too many requests | Respect the `Retry-After` header before retrying |
| 500 | `INTERNAL_ERROR` | Unexpected server fault | Retry with backoff; contact support if it persists |

### Validation error shape
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      { "field": "national_id", "issue": "must be exactly 14 digits" },
      { "field": "date_of_birth", "issue": "must be a valid past date" }
    ]
  }
}
```

### Retry guidance
- Retryable: `429`, `500`, `503` — use exponential backoff starting at 1s, capped at 30s.
- Not retryable: `400`, `401`, `403`, `404`, `409`, `422` — fix the request before resending.

---

## Notes for the implementing team

- Every write to `patients`, `consultations`, `prescriptions`, and `invoices` must produce an [audit log](#18-audit-logs) entry — this is a compliance requirement given the sensitivity of medical and billing data, not an optional feature.
- `national_id` and `license_number` uniqueness should be enforced at the database level, not just in application code, to avoid race conditions under concurrent registration.
- Consider soft-delete (status flags) over hard deletes across every clinical and financial table — this contract assumes that pattern throughout (`archived`, `void`, `cancelled` states rather than `DELETE FROM`).
