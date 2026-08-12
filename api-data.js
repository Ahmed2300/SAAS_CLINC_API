/**
 * Clinic CRM API Reference Data Structure
 * Contains full specification details extracted from clinic-crm-api-reference.md
 */

const API_DATA = {
  info: {
    title: "Clinic CRM — API Contract & Reference",
    version: "v1.0",
    format: "REST / JSON",
    audience: "Frontend team, mobile team, and third-party integrators",
    description: "Complete API contract for the Clinic Management System: Patients, Appointments, Doctors, Medical Records, Billing, Inventory, Reports, and Roles & Permissions.",
    baseUrl: "https://api.[CLINIC_DOMAIN].com/v1",
    defaultClinicId: "cli_a1b2c3"
  },

  conventions: {
    headers: [
      { name: "Authorization", value: "Bearer [ACCESS_TOKEN]", required: true, description: "JWT Access token required for authenticated endpoints" },
      { name: "Content-Type", value: "application/json", required: true, description: "Media type for request payload" },
      { name: "X-Clinic-Id", value: "[CLINIC_ID]", required: true, description: "Identifies target branch for multi-clinic accounts (e.g. cli_a1b2c3)" },
      { name: "Idempotency-Key", value: "[UNIQUE_CLIENT_GENERATED_KEY]", required: false, description: "Optional key for POST /invoices and /invoices/{id}/payments to avoid duplicate financial transactions" }
    ],
    idFormats: [
      { prefix: "pat_", entity: "Patient", example: "pat_7c3f21" },
      { prefix: "doc_", entity: "Doctor", example: "doc_9f1a20" },
      { prefix: "apt_", entity: "Appointment", example: "apt_5e2b18" },
      { prefix: "cst_", entity: "Consultation", example: "cst_3d8f42" },
      { prefix: "rx_", entity: "Prescription", example: "rx_6a1c90" },
      { prefix: "inv_", entity: "Invoice", example: "inv_2f7e11" },
      { prefix: "pay_", entity: "Payment", example: "pay_8b4d33" },
      { prefix: "itm_", entity: "Inventory Item", example: "itm_1a9c77" },
      { prefix: "usr_", entity: "User / Staff", example: "usr_d4e5f6" },
      { prefix: "cli_", entity: "Clinic Branch", example: "cli_a1b2c3" }
    ],
    pagination: [
      { param: "page", type: "integer", default: "1", description: "Page number (1-indexed)" },
      { param: "limit", type: "integer", default: "20", description: "Items per page (max 100)" },
      { param: "sort", type: "string", default: "-created_at", description: "Field to sort by; prefix with '-' for descending" }
    ],
    envelopes: {
      success: {
        success: true,
        data: {},
        meta: { page: 1, limit: 20, total: 143, total_pages: 8 }
      },
      error: {
        success: false,
        error: {
          code: "RESOURCE_NOT_FOUND",
          message: "Patient with id 'pat_7c3f21' was not found.",
          details: null
        }
      }
    }
  },

  roles: [
    { name: "admin", badge: "danger", description: "Full access across all clinics and modules" },
    { name: "clinic_manager", badge: "warning", description: "Full access within their assigned clinic(s)" },
    { name: "doctor", badge: "primary", description: "Own schedule, assigned appointments, consultations, prescriptions they authored" },
    { name: "nurse", badge: "info", description: "Patient vitals, appointment check-in, read-only medical records" },
    { name: "receptionist", badge: "success", description: "Patients, appointments, check-in, invoice creation" },
    { name: "accountant", badge: "secondary", description: "Invoices, payments, financial reports (no clinical data)" },
    { name: "patient", badge: "dark", description: "Own profile, own appointments, own invoices, own prescriptions" }
  ],

  models: {
    Patient: {
      description: "Patient profile and medical background record",
      fields: [
        { name: "id", type: "string", notes: "pat_ prefix" },
        { name: "full_name", type: "string", notes: "Required" },
        { name: "national_id", type: "string", notes: "Unique (14 digits)" },
        { name: "phone", type: "string", notes: "Unique" },
        { name: "email", type: "string | null", notes: "Optional" },
        { name: "date_of_birth", type: "string (date)", notes: "YYYY-MM-DD" },
        { name: "gender", type: "string", notes: "male | female" },
        { name: "address", type: "string | null", notes: "Street address" },
        { name: "blood_type", type: "string | null", notes: "e.g. O+, A-, AB+" },
        { name: "allergies", type: "string[]", notes: "List of known allergies" },
        { name: "chronic_conditions", type: "string[]", notes: "List of chronic conditions" },
        { name: "emergency_contact", type: "object | null", notes: "{ name, phone, relation }" },
        { name: "status", type: "string", notes: "active | archived" },
        { name: "created_at / updated_at", type: "string (ISO 8601)", notes: "Timestamps" }
      ],
      sample: {
        id: "pat_7c3f21",
        full_name: "Laila Ibrahim",
        national_id: "29501150123456",
        phone: "+201234567890",
        email: "laila.ibrahim@example.com",
        date_of_birth: "1995-01-15",
        gender: "female",
        blood_type: "O+",
        allergies: ["Penicillin"],
        chronic_conditions: [],
        emergency_contact: { name: "Omar Ibrahim", phone: "+201234500000", relation: "brother" },
        status: "active",
        created_at: "2025-11-02T08:30:00Z"
      }
    },
    Doctor: {
      description: "Physician profile linked to a staff user account",
      fields: [
        { name: "id", type: "string", notes: "doc_ prefix" },
        { name: "user_id", type: "string", notes: "Linked staff user account ID" },
        { name: "full_name", type: "string", notes: "Doctor full name" },
        { name: "specialty", type: "string", notes: "e.g. Dermatology, Cardiology" },
        { name: "license_number", type: "string", notes: "Unique license ID" },
        { name: "clinic_ids", type: "string[]", notes: "Assigned clinic branch IDs" },
        { name: "consultation_fee", type: "number", notes: "Standard fee amount" },
        { name: "bio", type: "string | null", notes: "Professional bio" },
        { name: "status", type: "string", notes: "active | on_leave | inactive" }
      ],
      sample: {
        id: "doc_9f1a20",
        user_id: "usr_d4e5f6",
        full_name: "Dr. Ahmed Hassan",
        specialty: "Dermatology",
        license_number: "EG-DERM-44821",
        clinic_ids: ["cli_a1b2c3"],
        consultation_fee: 350,
        bio: "10+ years in clinical dermatology.",
        status: "active"
      }
    },
    Appointment: {
      description: "Scheduled consultation, procedure, or follow-up slot",
      fields: [
        { name: "id", type: "string", notes: "apt_ prefix" },
        { name: "patient_id", type: "string", notes: "Target patient" },
        { name: "doctor_id", type: "string", notes: "Assigned doctor" },
        { name: "clinic_id", type: "string", notes: "Branch clinic" },
        { name: "scheduled_at", type: "string (ISO 8601)", notes: "Date & time UTC" },
        { name: "duration_minutes", type: "integer", notes: "Default 30 min" },
        { name: "type", type: "string", notes: "consultation | follow_up | procedure" },
        { name: "status", type: "string", notes: "scheduled | confirmed | checked_in | in_progress | completed | cancelled | no_show" },
        { name: "reason", type: "string | null", notes: "Visit reason" },
        { name: "notes", type: "string | null", notes: "Internal notes" },
        { name: "created_by", type: "string", notes: "Staff or patient user ID" }
      ],
      sample: {
        id: "apt_5e2b18",
        patient_id: "pat_7c3f21",
        doctor_id: "doc_9f1a20",
        clinic_id: "cli_a1b2c3",
        scheduled_at: "2026-08-15T11:30:00Z",
        duration_minutes: 30,
        type: "consultation",
        status: "scheduled",
        reason: "Follow-up on skin rash",
        created_by: "usr_7b1e90"
      }
    },
    Consultation: {
      description: "Clinical consultation record with diagnoses and vitals",
      fields: [
        { name: "id", type: "string", notes: "cst_ prefix" },
        { name: "appointment_id", type: "string", notes: "Linked appointment" },
        { name: "patient_id / doctor_id", type: "string", notes: "References" },
        { name: "chief_complaint", type: "string", notes: "Patient reported symptom" },
        { name: "diagnosis", type: "string", notes: "Medical diagnosis" },
        { name: "vitals", type: "object", notes: "{ blood_pressure, heart_rate, temperature_c, weight_kg, height_cm }" },
        { name: "notes", type: "string | null", notes: "Clinical advice & observations" },
        { name: "follow_up_required", type: "boolean", notes: "True if follow-up needed" },
        { name: "follow_up_date", type: "string (date) | null", notes: "Follow-up target date" }
      ],
      sample: {
        id: "cst_3d8f42",
        appointment_id: "apt_5e2b18",
        patient_id: "pat_7c3f21",
        doctor_id: "doc_9f1a20",
        chief_complaint: "Recurring itchy rash on forearm",
        diagnosis: "Contact dermatitis",
        vitals: { blood_pressure: "120/80", heart_rate: 72, temperature_c: 36.8, weight_kg: 68, height_cm: 170 },
        notes: "Advised to avoid the suspected detergent brand.",
        follow_up_required: true,
        follow_up_date: "2026-08-29"
      }
    },
    Prescription: {
      description: "Medication prescription issued during a consultation",
      fields: [
        { name: "id", type: "string", notes: "rx_ prefix" },
        { name: "consultation_id", type: "string", notes: "Linked consultation" },
        { name: "patient_id / doctor_id", type: "string", notes: "References" },
        { name: "medications", type: "array", notes: "[{ inventory_item_id, name, dosage, frequency, duration_days, instructions }]" },
        { name: "status", type: "string", notes: "active | fulfilled | cancelled" },
        { name: "issued_at", type: "string (ISO 8601)", notes: "Issuance timestamp" }
      ],
      sample: {
        id: "rx_6a1c90",
        consultation_id: "cst_3d8f42",
        patient_id: "pat_7c3f21",
        doctor_id: "doc_9f1a20",
        medications: [
          { inventory_item_id: "itm_1a9c77", name: "Cetirizine 10mg", dosage: "1 tablet", frequency: "once daily", duration_days: 10, instructions: "Take at night." }
        ],
        status: "active",
        issued_at: "2026-07-20T10:15:00Z"
      }
    },
    Invoice: {
      description: "Financial invoice for consultation, procedures, or medicines",
      fields: [
        { name: "id", type: "string", notes: "inv_ prefix" },
        { name: "patient_id / appointment_id / clinic_id", type: "string", notes: "References" },
        { name: "items", type: "array", notes: "[{ description, quantity, unit_price, total }]" },
        { name: "subtotal / discount / tax / total", type: "number", notes: "Financial totals" },
        { name: "amount_paid / balance_due", type: "number", notes: "Payment progress" },
        { name: "status", type: "string", notes: "draft | pending | partially_paid | paid | void" },
        { name: "due_date", type: "string (date)", notes: "Payment due date" }
      ],
      sample: {
        id: "inv_2f7e11",
        patient_id: "pat_7c3f21",
        appointment_id: "apt_5e2b18",
        clinic_id: "cli_a1b2c3",
        items: [{ description: "Dermatology consultation", quantity: 1, unit_price: 350, total: 350 }],
        subtotal: 350,
        discount: 0,
        tax: 0,
        total: 350,
        amount_paid: 0,
        balance_due: 350,
        status: "pending",
        due_date: "2026-08-22"
      }
    },
    Payment: {
      description: "Payment transaction applied against an invoice",
      fields: [
        { name: "id", type: "string", notes: "pay_ prefix" },
        { name: "invoice_id", type: "string", notes: "Target invoice" },
        { name: "amount", type: "number", notes: "Payment amount" },
        { name: "method", type: "string", notes: "cash | card | insurance | wallet" },
        { name: "reference_number", type: "string | null", notes: "Transaction reference" },
        { name: "received_by", type: "string", notes: "Staff user ID" },
        { name: "paid_at", type: "string (ISO 8601)", notes: "Transaction timestamp" }
      ],
      sample: {
        id: "pay_8b4d33",
        invoice_id: "inv_2f7e11",
        amount: 350,
        method: "card",
        reference_number: "TXN-8823410",
        received_by: "usr_7b1e90",
        paid_at: "2026-08-12T12:05:00Z"
      }
    },
    InventoryItem: {
      description: "Clinic pharmacy or supply stock item",
      fields: [
        { name: "id", type: "string", notes: "itm_ prefix" },
        { name: "name", type: "string", notes: "Item name" },
        { name: "category", type: "string", notes: "medicine | supply" },
        { name: "unit", type: "string", notes: "box | vial | bottle | pack" },
        { name: "quantity_in_stock", type: "integer", notes: "Current stock quantity" },
        { name: "reorder_level", type: "integer", notes: "Triggers low-stock alert" },
        { name: "unit_cost", type: "number", notes: "Cost per unit" },
        { name: "expiry_date", type: "string (date) | null", notes: "Expiration date" },
        { name: "clinic_id", type: "string", notes: "Branch clinic" }
      ],
      sample: {
        id: "itm_1a9c77",
        name: "Cetirizine 10mg",
        category: "medicine",
        unit: "box",
        quantity_in_stock: 120,
        reorder_level: 20,
        unit_cost: 45,
        expiry_date: "2027-03-01",
        clinic_id: "cli_a1b2c3"
      }
    }
  },

  modules: [
    {
      id: "auth",
      title: "Authentication",
      icon: "key",
      description: "User login, token refresh, password resets, and current session management",
      endpoints: [
        {
          id: "auth-login",
          method: "POST",
          path: "/auth/login",
          title: "Log in with email + password",
          roles: ["public"],
          description: "Authenticates a user with email and password, returning JWT access & refresh tokens.",
          parameters: [],
          requestBody: {
            email: "dr.hassan@clinic.com",
            password: "••••••••"
          },
          responses: [
            {
              status: 200,
              description: "200 OK — Authentication successful",
              body: {
                success: true,
                data: {
                  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  refresh_token: "8f3a1c9e-4b2a-4567-89ab-cdef01234567",
                  expires_in: 900,
                  user: {
                    id: "usr_d4e5f6",
                    full_name: "Dr. Ahmed Hassan",
                    role: "doctor",
                    clinic_id: "cli_a1b2c3"
                  }
                }
              }
            },
            {
              status: 401,
              description: "401 Unauthorized — Invalid credentials or inactive account",
              body: {
                success: false,
                error: {
                  code: "INVALID_CREDENTIALS",
                  message: "The email or password provided is incorrect.",
                  details: null
                }
              }
            }
          ]
        },
        {
          id: "auth-refresh",
          method: "POST",
          path: "/auth/refresh",
          title: "Rotate access token",
          roles: ["public"],
          description: "Exchanges a valid long-lived single-use refresh token for a new access token and rotated refresh token.",
          parameters: [],
          requestBody: {
            refresh_token: "8f3a1c9e-4b2a-4567-89ab-cdef01234567"
          },
          responses: [
            {
              status: 200,
              description: "200 OK — Tokens rotated successfully",
              body: {
                success: true,
                data: {
                  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new...",
                  refresh_token: "a91cf2b0-9e8d-7c6b-5a4f-3e2d1c0b9a8f",
                  expires_in: 900
                }
              }
            },
            {
              status: 401,
              description: "401 Unauthorized — Token expired or revoked",
              body: {
                success: false,
                error: {
                  code: "INVALID_OR_EXPIRED_TOKEN",
                  message: "The refresh token is invalid or has expired.",
                  details: null
                }
              }
            }
          ]
        },
        {
          id: "auth-logout",
          method: "POST",
          path: "/auth/logout",
          title: "Revoke refresh token",
          roles: ["authenticated"],
          description: "Invalidates the active refresh token, ending the session.",
          parameters: [],
          requestBody: {
            refresh_token: "8f3a1c9e-4b2a-4567-89ab-cdef01234567"
          },
          responses: [
            {
              status: 204,
              description: "204 No Content — Successfully logged out",
              body: null
            }
          ]
        },
        {
          id: "auth-forgot-password",
          method: "POST",
          path: "/auth/forgot-password",
          title: "Request password reset email",
          roles: ["public"],
          description: "Sends a password reset link to the email address. Always returns 200 to prevent user enumeration.",
          parameters: [],
          requestBody: {
            email: "dr.hassan@clinic.com"
          },
          responses: [
            {
              status: 200,
              description: "200 OK — Request received",
              body: {
                success: true,
                data: { message: "If that email exists, a reset link has been sent." }
              }
            }
          ]
        },
        {
          id: "auth-reset-password",
          method: "POST",
          path: "/auth/reset-password",
          title: "Set new password",
          roles: ["public"],
          description: "Resets the user password using a valid reset token received via email.",
          parameters: [],
          requestBody: {
            reset_token: "9c2f-reset-token-sample-string",
            new_password: "NewSecurePass123!"
          },
          responses: [
            {
              status: 200,
              description: "200 OK — Password updated",
              body: {
                success: true,
                data: { message: "Password updated successfully." }
              }
            },
            {
              status: 400,
              description: "400 Bad Request — Weak password or invalid token",
              body: {
                success: false,
                error: {
                  code: "WEAK_PASSWORD",
                  message: "Password must contain at least 8 characters, numbers, and symbols.",
                  details: null
                }
              }
            }
          ]
        },
        {
          id: "auth-me",
          method: "GET",
          path: "/auth/me",
          title: "Current user profile",
          roles: ["authenticated"],
          description: "Fetches details of the currently authenticated user session.",
          parameters: [],
          responses: [
            {
              status: 200,
              description: "200 OK — Session info",
              body: {
                success: true,
                data: {
                  id: "usr_d4e5f6",
                  full_name: "Dr. Ahmed Hassan",
                  email: "dr.hassan@clinic.com",
                  role: "doctor",
                  clinic_id: "cli_a1b2c3",
                  status: "active"
                }
              }
            }
          ]
        }
      ]
    },

    {
      id: "users",
      title: "Users & Staff",
      icon: "users",
      description: "Manage clinic staff accounts, invitations, profile updates, and active status",
      endpoints: [
        {
          id: "users-list",
          method: "GET",
          path: "/users",
          title: "List staff members",
          roles: ["admin", "clinic_manager"],
          description: "Retrieves a paginated list of staff members with optional filters.",
          parameters: [
            { name: "role", type: "query", dataType: "string", required: false, description: "Filter by role (e.g. doctor, receptionist)" },
            { name: "clinic_id", type: "query", dataType: "string", required: false, description: "Filter by clinic branch ID" },
            { name: "status", type: "query", dataType: "string", required: false, description: "active | pending | inactive" },
            { name: "search", type: "query", dataType: "string", required: false, description: "Search by name, email, or phone" },
            { name: "page", type: "query", dataType: "integer", required: false, default: "1", description: "Page number" },
            { name: "limit", type: "query", dataType: "integer", required: false, default: "20", description: "Items per page" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Staff list",
              body: {
                success: true,
                data: [
                  {
                    id: "usr_d4e5f6",
                    full_name: "Dr. Ahmed Hassan",
                    email: "dr.hassan@clinic.com",
                    phone: "+201012345678",
                    role: "doctor",
                    clinic_id: "cli_a1b2c3",
                    status: "active",
                    created_at: "2026-01-14T09:00:00Z"
                  }
                ],
                meta: { page: 1, limit: 20, total: 12, total_pages: 1 }
              }
            }
          ]
        },
        {
          id: "users-create",
          method: "POST",
          path: "/users",
          title: "Invite / create staff member",
          roles: ["admin", "clinic_manager"],
          description: "Sends an invitation email to a new staff member. Account is pending until invitation accepted.",
          parameters: [],
          requestBody: {
            full_name: "Mona Saeed",
            email: "mona.saeed@clinic.com",
            phone: "+201098765432",
            role: "receptionist",
            clinic_id: "cli_a1b2c3"
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Invitation sent",
              body: {
                success: true,
                data: {
                  id: "usr_7b1e90",
                  full_name: "Mona Saeed",
                  email: "mona.saeed@clinic.com",
                  role: "receptionist",
                  clinic_id: "cli_a1b2c3",
                  status: "pending",
                  created_at: "2026-08-12T10:15:00Z"
                }
              }
            },
            {
              status: 409,
              description: "409 Conflict — Email already registered",
              body: {
                success: false,
                error: { code: "EMAIL_ALREADY_EXISTS", message: "A user with this email already exists.", details: null }
              }
            }
          ]
        },
        {
          id: "users-get",
          method: "GET",
          path: "/users/{userId}",
          title: "Get staff member details",
          roles: ["admin", "clinic_manager", "self"],
          description: "Fetches details of a specific staff member by ID.",
          parameters: [
            { name: "userId", type: "path", dataType: "string", required: true, description: "Target staff user ID (e.g. usr_d4e5f6)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Staff details",
              body: {
                success: true,
                data: {
                  id: "usr_d4e5f6",
                  full_name: "Dr. Ahmed Hassan",
                  email: "dr.hassan@clinic.com",
                  phone: "+201012345678",
                  role: "doctor",
                  clinic_id: "cli_a1b2c3",
                  status: "active",
                  created_at: "2026-01-14T09:00:00Z"
                }
              }
            },
            {
              status: 404,
              description: "404 Not Found — Staff member not found",
              body: { success: false, error: { code: "USER_NOT_FOUND", message: "Staff member not found.", details: null } }
            }
          ]
        },
        {
          id: "users-update",
          method: "PATCH",
          path: "/users/{userId}",
          title: "Update staff member",
          roles: ["admin", "clinic_manager", "self"],
          description: "Updates fields of a staff profile. Self-users cannot change their own role.",
          parameters: [
            { name: "userId", type: "path", dataType: "string", required: true, description: "Target staff user ID" }
          ],
          requestBody: {
            phone: "+201099998888"
          },
          responses: [
            {
              status: 200,
              description: "200 OK — Staff updated",
              body: {
                success: true,
                data: {
                  id: "usr_7b1e90",
                  full_name: "Mona Saeed",
                  email: "mona.saeed@clinic.com",
                  phone: "+201099998888",
                  role: "receptionist",
                  clinic_id: "cli_a1b2c3",
                  status: "pending"
                }
              }
            }
          ]
        },
        {
          id: "users-delete",
          method: "DELETE",
          path: "/users/{userId}",
          title: "Remove staff member",
          roles: ["admin"],
          description: "Soft-deletes the staff account. Account is retained for audit trails but login is disabled.",
          parameters: [
            { name: "userId", type: "path", dataType: "string", required: true, description: "Target staff user ID" }
          ],
          responses: [
            { status: 204, description: "204 No Content — Staff soft-deleted", body: null }
          ]
        },
        {
          id: "users-status",
          method: "PATCH",
          path: "/users/{userId}/status",
          title: "Activate or deactivate staff member",
          roles: ["admin", "clinic_manager"],
          description: "Changes staff status between active and inactive.",
          parameters: [
            { name: "userId", type: "path", dataType: "string", required: true, description: "Target staff user ID" }
          ],
          requestBody: { status: "inactive" },
          responses: [
            {
              status: 200,
              description: "200 OK — Status updated",
              body: { success: true, data: { id: "usr_7b1e90", status: "inactive" } }
            }
          ]
        }
      ]
    },

    {
      id: "roles",
      title: "Roles & Permissions",
      icon: "shield-check",
      description: "Manage system access control roles and fine-grained permissions matrix",
      endpoints: [
        {
          id: "roles-list",
          method: "GET",
          path: "/roles",
          title: "List roles",
          roles: ["admin"],
          description: "Lists all standard and custom staff roles defined in the clinic system.",
          parameters: [],
          responses: [
            {
              status: 200,
              description: "200 OK — Roles list",
              body: {
                success: true,
                data: [
                  { id: "role_doctor", name: "doctor", description: "Clinical staff with prescribing rights" },
                  { id: "role_receptionist", name: "receptionist", description: "Front-desk operations" }
                ]
              }
            }
          ]
        },
        {
          id: "roles-get",
          method: "GET",
          path: "/roles/{roleId}",
          title: "Get role + permission keys",
          roles: ["admin"],
          description: "Fetches role definition along with assigned permission flags.",
          parameters: [
            { name: "roleId", type: "path", dataType: "string", required: true, description: "Target role identifier" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Role permissions",
              body: {
                success: true,
                data: {
                  id: "role_receptionist",
                  name: "receptionist",
                  permissions: [
                    "patients:read", "patients:create", "patients:update",
                    "appointments:read", "appointments:create", "appointments:check_in",
                    "invoices:create"
                  ]
                }
              }
            }
          ]
        },
        {
          id: "roles-update-permissions",
          method: "PATCH",
          path: "/roles/{roleId}/permissions",
          title: "Update permission set",
          roles: ["admin"],
          description: "Updates granted permissions for a specified role. Admin role cannot be modified.",
          parameters: [
            { name: "roleId", type: "path", dataType: "string", required: true, description: "Target role identifier" }
          ],
          requestBody: {
            permissions: [
              "patients:read", "patients:create", "patients:update",
              "appointments:read", "appointments:create", "appointments:check_in"
            ]
          },
          responses: [
            {
              status: 200,
              description: "200 OK — Permissions updated",
              body: {
                success: true,
                data: {
                  id: "role_receptionist",
                  name: "receptionist",
                  permissions: ["patients:read", "patients:create", "patients:update", "appointments:read", "appointments:create", "appointments:check_in"]
                }
              }
            }
          ]
        }
      ]
    },

    {
      id: "clinics",
      title: "Clinics (Multi-Branch)",
      icon: "building",
      description: "Manage multi-branch medical center locations, timezone settings, and status",
      endpoints: [
        {
          id: "clinics-list",
          method: "GET",
          path: "/clinics",
          title: "List clinic branches",
          roles: ["admin", "clinic_manager"],
          description: "Retrieves list of clinic branches. Non-admin users see only branches they are assigned to.",
          parameters: [
            { name: "page", type: "query", dataType: "integer", required: false, default: "1", description: "Page number" },
            { name: "limit", type: "query", dataType: "integer", required: false, default: "20", description: "Items per page" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Clinics list",
              body: {
                success: true,
                data: [
                  {
                    id: "cli_a1b2c3",
                    name: "Devesters Medical Center — Mansoura",
                    address: "12 El-Gomhoria St, Mansoura",
                    phone: "+205023456789",
                    timezone: "Africa/Cairo",
                    status: "active"
                  }
                ],
                meta: { page: 1, limit: 20, total: 3, total_pages: 1 }
              }
            }
          ]
        },
        {
          id: "clinics-create",
          method: "POST",
          path: "/clinics",
          title: "Create clinic branch",
          roles: ["admin"],
          description: "Registers a new clinic branch location.",
          parameters: [],
          requestBody: {
            name: "Devesters Medical Center — Talkha",
            address: "5 Nile Corniche, Talkha",
            phone: "+205019988776",
            timezone: "Africa/Cairo"
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Branch created",
              body: {
                success: true,
                data: {
                  id: "cli_e5f6g7",
                  name: "Devesters Medical Center — Talkha",
                  address: "5 Nile Corniche, Talkha",
                  phone: "+205019988776",
                  timezone: "Africa/Cairo",
                  status: "active"
                }
              }
            }
          ]
        },
        {
          id: "clinics-get",
          method: "GET",
          path: "/clinics/{clinicId}",
          title: "Get branch details",
          roles: ["admin", "clinic_manager"],
          description: "Fetches information for a single clinic branch.",
          parameters: [
            { name: "clinicId", type: "path", dataType: "string", required: true, description: "Clinic ID (e.g. cli_a1b2c3)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Branch details",
              body: {
                success: true,
                data: {
                  id: "cli_a1b2c3",
                  name: "Devesters Medical Center — Mansoura",
                  address: "12 El-Gomhoria St, Mansoura",
                  phone: "+205023456789",
                  timezone: "Africa/Cairo",
                  status: "active"
                }
              }
            }
          ]
        },
        {
          id: "clinics-update",
          method: "PATCH",
          path: "/clinics/{clinicId}",
          title: "Update clinic branch",
          roles: ["admin", "clinic_manager"],
          description: "Updates contact, address, or name details for a branch.",
          parameters: [
            { name: "clinicId", type: "path", dataType: "string", required: true, description: "Clinic ID" }
          ],
          requestBody: { phone: "+205011112222" },
          responses: [
            {
              status: 200,
              description: "200 OK — Branch updated",
              body: {
                success: true,
                data: {
                  id: "cli_a1b2c3",
                  name: "Devesters Medical Center — Mansoura",
                  address: "12 El-Gomhoria St, Mansoura",
                  phone: "+205011112222",
                  timezone: "Africa/Cairo",
                  status: "active"
                }
              }
            }
          ]
        },
        {
          id: "clinics-delete",
          method: "DELETE",
          path: "/clinics/{clinicId}",
          title: "Deactivate branch",
          roles: ["admin"],
          description: "Deactivates the branch. Historical records are preserved.",
          parameters: [
            { name: "clinicId", type: "path", dataType: "string", required: true, description: "Clinic ID" }
          ],
          responses: [
            { status: 204, description: "204 No Content — Branch deactivated", body: null },
            {
              status: 409,
              description: "409 Conflict — Clinic has active upcoming appointments",
              body: { success: false, error: { code: "CLINIC_HAS_ACTIVE_APPOINTMENTS", message: "Cannot deactivate branch with pending appointments.", details: null } }
            }
          ]
        }
      ]
    },

    {
      id: "patients",
      title: "Patients",
      icon: "user-heart",
      description: "Patient registration, profiles, medical history timeline, appointments, and billing records",
      endpoints: [
        {
          id: "patients-list",
          method: "GET",
          path: "/patients",
          title: "Search / list patients",
          roles: ["admin", "clinic_manager", "doctor", "nurse", "receptionist", "accountant"],
          description: "Retrieves a paginated list of patients with search filtering by name, phone, or national ID.",
          parameters: [
            { name: "search", type: "query", dataType: "string", required: false, description: "Search string matching name, phone, or national ID" },
            { name: "status", type: "query", dataType: "string", required: false, description: "active | archived" },
            { name: "gender", type: "query", dataType: "string", required: false, description: "male | female" },
            { name: "page", type: "query", dataType: "integer", required: false, default: "1", description: "Page number" },
            { name: "limit", type: "query", dataType: "integer", required: false, default: "20", description: "Items per page" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Patient list",
              body: {
                success: true,
                data: [
                  {
                    id: "pat_7c3f21",
                    full_name: "Laila Ibrahim",
                    national_id: "29501150123456",
                    phone: "+201234567890",
                    email: "laila.ibrahim@example.com",
                    date_of_birth: "1995-01-15",
                    gender: "female",
                    blood_type: "O+",
                    allergies: ["Penicillin"],
                    chronic_conditions: [],
                    status: "active",
                    created_at: "2025-11-02T08:30:00Z"
                  }
                ],
                meta: { page: 1, limit: 20, total: 386, total_pages: 20 }
              }
            }
          ]
        },
        {
          id: "patients-create",
          method: "POST",
          path: "/patients",
          title: "Register new patient",
          roles: ["admin", "clinic_manager", "receptionist"],
          description: "Creates a new patient profile with national ID uniqueness validation.",
          parameters: [],
          requestBody: {
            full_name: "Laila Ibrahim",
            national_id: "29501150123456",
            phone: "+201234567890",
            email: "laila.ibrahim@example.com",
            date_of_birth: "1995-01-15",
            gender: "female",
            address: "10 Talaat Harb St, Cairo",
            blood_type: "O+",
            allergies: ["Penicillin"],
            chronic_conditions: [],
            emergency_contact: { name: "Omar Ibrahim", phone: "+201234500000", relation: "brother" }
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Patient registered",
              body: {
                success: true,
                data: {
                  id: "pat_7c3f21",
                  full_name: "Laila Ibrahim",
                  national_id: "29501150123456",
                  phone: "+201234567890",
                  email: "laila.ibrahim@example.com",
                  date_of_birth: "1995-01-15",
                  gender: "female",
                  address: "10 Talaat Harb St, Cairo",
                  blood_type: "O+",
                  allergies: ["Penicillin"],
                  chronic_conditions: [],
                  emergency_contact: { name: "Omar Ibrahim", phone: "+201234500000", relation: "brother" },
                  status: "active",
                  created_at: "2026-08-12T11:00:00Z"
                }
              }
            },
            {
              status: 409,
              description: "409 Conflict — National ID already registered",
              body: { success: false, error: { code: "NATIONAL_ID_ALREADY_EXISTS", message: "Patient with this national ID already exists.", details: null } }
            }
          ]
        },
        {
          id: "patients-get",
          method: "GET",
          path: "/patients/{patientId}",
          title: "Get patient details",
          roles: ["admin", "clinic_manager", "doctor", "nurse", "receptionist", "accountant", "patient"],
          description: "Fetches full profile information for a specified patient ID.",
          parameters: [
            { name: "patientId", type: "path", dataType: "string", required: true, description: "Patient ID (e.g. pat_7c3f21)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Patient profile",
              body: {
                success: true,
                data: {
                  id: "pat_7c3f21",
                  full_name: "Laila Ibrahim",
                  national_id: "29501150123456",
                  phone: "+201234567890",
                  email: "laila.ibrahim@example.com",
                  date_of_birth: "1995-01-15",
                  gender: "female",
                  blood_type: "O+",
                  allergies: ["Penicillin"],
                  chronic_conditions: [],
                  emergency_contact: { name: "Omar Ibrahim", phone: "+201234500000", relation: "brother" },
                  status: "active",
                  created_at: "2025-11-02T08:30:00Z"
                }
              }
            }
          ]
        },
        {
          id: "patients-update",
          method: "PATCH",
          path: "/patients/{patientId}",
          title: "Update patient profile",
          roles: ["admin", "clinic_manager", "receptionist"],
          description: "Updates contact details, allergies, or chronic conditions.",
          parameters: [
            { name: "patientId", type: "path", dataType: "string", required: true, description: "Patient ID" }
          ],
          requestBody: {
            phone: "+201234567891",
            allergies: ["Penicillin", "Latex"]
          },
          responses: [
            {
              status: 200,
              description: "200 OK — Profile updated",
              body: {
                success: true,
                data: {
                  id: "pat_7c3f21",
                  full_name: "Laila Ibrahim",
                  phone: "+201234567891",
                  allergies: ["Penicillin", "Latex"],
                  status: "active"
                }
              }
            }
          ]
        },
        {
          id: "patients-delete",
          method: "DELETE",
          path: "/patients/{patientId}",
          title: "Archive patient",
          roles: ["admin", "clinic_manager"],
          description: "Soft deletes/archives a patient record. Medical records are retained for compliance.",
          parameters: [
            { name: "patientId", type: "path", dataType: "string", required: true, description: "Patient ID" }
          ],
          responses: [
            { status: 204, description: "204 No Content — Patient archived", body: null },
            {
              status: 409,
              description: "409 Conflict — Patient has active upcoming appointments",
              body: { success: false, error: { code: "PATIENT_HAS_UPCOMING_APPOINTMENTS", message: "Cannot archive patient with upcoming scheduled appointments.", details: null } }
            }
          ]
        },
        {
          id: "patients-medical-history",
          method: "GET",
          path: "/patients/{patientId}/medical-history",
          title: "Full consultation & prescription history",
          roles: ["admin", "doctor", "nurse", "patient"],
          description: "Fetches full medical timeline including consultations, vitals, diagnoses, and prescriptions.",
          parameters: [
            { name: "patientId", type: "path", dataType: "string", required: true, description: "Patient ID" },
            { name: "page", type: "query", dataType: "integer", required: false, default: "1", description: "Page number" },
            { name: "limit", type: "query", dataType: "integer", required: false, default: "20", description: "Items per page" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Medical history timeline",
              body: {
                success: true,
                data: {
                  patient_id: "pat_7c3f21",
                  consultations: [
                    {
                      id: "cst_3d8f42",
                      date: "2026-07-20T10:00:00Z",
                      doctor_name: "Dr. Ahmed Hassan",
                      diagnosis: "Seasonal allergic rhinitis",
                      prescriptions: ["rx_6a1c90"]
                    }
                  ]
                },
                meta: { page: 1, limit: 20, total: 4, total_pages: 1 }
              }
            }
          ]
        },
        {
          id: "patients-appointments",
          method: "GET",
          path: "/patients/{patientId}/appointments",
          title: "Patient's appointments list",
          roles: ["admin", "clinic_manager", "doctor", "receptionist", "patient"],
          description: "Retrieves list of appointments for a specified patient.",
          parameters: [
            { name: "patientId", type: "path", dataType: "string", required: true, description: "Patient ID" },
            { name: "status", type: "query", dataType: "string", required: false, description: "Filter by status" },
            { name: "date_from", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Appointments array",
              body: {
                success: true,
                data: [
                  {
                    id: "apt_5e2b18",
                    patient_id: "pat_7c3f21",
                    doctor_id: "doc_9f1a20",
                    clinic_id: "cli_a1b2c3",
                    scheduled_at: "2026-08-15T11:30:00Z",
                    status: "scheduled",
                    type: "consultation"
                  }
                ],
                meta: { page: 1, limit: 20, total: 5, total_pages: 1 }
              }
            }
          ]
        },
        {
          id: "patients-invoices",
          method: "GET",
          path: "/patients/{patientId}/invoices",
          title: "Patient's invoices list",
          roles: ["admin", "clinic_manager", "accountant", "patient"],
          description: "Retrieves billing invoices associated with a patient.",
          parameters: [
            { name: "patientId", type: "path", dataType: "string", required: true, description: "Patient ID" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Invoices array",
              body: {
                success: true,
                data: [
                  {
                    id: "inv_2f7e11",
                    patient_id: "pat_7c3f21",
                    total: 350,
                    balance_due: 350,
                    status: "pending"
                  }
                ],
                meta: { page: 1, limit: 20, total: 3, total_pages: 1 }
              }
            }
          ]
        }
      ]
    },

    {
      id: "doctors",
      title: "Doctors & Specialties",
      icon: "stethoscope",
      description: "Medical specialties, doctor profiles, weekly availability schedules, and appointments",
      endpoints: [
        {
          id: "specialties-list",
          method: "GET",
          path: "/specialties",
          title: "List medical specialties & active doctor counts",
          roles: ["public"],
          description: "Returns all medical specialties available in the clinic platform along with active doctor counts. Essential for step-by-step patient booking forms (Step 1: Specialty ➔ Step 2: Doctor ➔ Step 3: Available Slot).",
          parameters: [
            { name: "clinic_id", type: "query", dataType: "string", required: false, description: "Filter specialties available at a specific branch clinic ID (e.g. cli_a1b2c3)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Specialties list with doctor counts",
              body: {
                success: true,
                data: [
                  {
                    id: "spc_derm",
                    name: "Dermatology",
                    arabic_name: "الجلدية والتناسلية",
                    description: "Skin, hair, nail treatments and cosmetic procedures",
                    active_doctors_count: 5
                  },
                  {
                    id: "spc_card",
                    name: "Cardiology",
                    arabic_name: "أمراض القلب والأوعية الدموية",
                    description: "Heart disease diagnosis and cardiovascular care",
                    active_doctors_count: 3
                  },
                  {
                    id: "spc_dent",
                    name: "Dentistry",
                    arabic_name: "طب الأسنان",
                    description: "General dentistry, orthodontics, and oral surgery",
                    active_doctors_count: 4
                  }
                ]
              }
            }
          ]
        },
        {
          id: "specialties-create",
          method: "POST",
          path: "/specialties",
          title: "Create new medical specialty",
          roles: ["admin"],
          description: "Creates a new medical specialty category in the clinic system.",
          parameters: [],
          requestBody: {
            name: "Neurology",
            arabic_name: "أمراض المخ والأعصاب",
            description: "Brain, spinal cord, and nervous system disorders"
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Specialty created",
              body: {
                success: true,
                data: {
                  id: "spc_neuro",
                  name: "Neurology",
                  arabic_name: "أمراض المخ والأعصاب",
                  description: "Brain, spinal cord, and nervous system disorders",
                  active_doctors_count: 0
                }
              }
            },
            {
              status: 409,
              description: "409 Conflict — Specialty already exists",
              body: { success: false, error: { code: "SPECIALTY_ALREADY_EXISTS", message: "Specialty with this name already exists.", details: null } }
            }
          ]
        },
        {
          id: "doctors-list",
          method: "GET",
          path: "/doctors",
          title: "List doctors",
          roles: ["authenticated"],
          description: "Lists active doctors with filtering by specialty and branch.",
          parameters: [
            { name: "specialty", type: "query", dataType: "string", required: false, description: "Filter by specialty" },
            { name: "clinic_id", type: "query", dataType: "string", required: false, description: "Filter by clinic branch ID" },
            { name: "status", type: "query", dataType: "string", required: false, description: "active | on_leave | inactive" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Doctors list",
              body: {
                success: true,
                data: [
                  {
                    id: "doc_9f1a20",
                    user_id: "usr_d4e5f6",
                    full_name: "Dr. Ahmed Hassan",
                    specialty: "Dermatology",
                    license_number: "EG-DERM-44821",
                    clinic_ids: ["cli_a1b2c3"],
                    consultation_fee: 350,
                    status: "active"
                  }
                ],
                meta: { page: 1, limit: 20, total: 7, total_pages: 1 }
              }
            }
          ]
        },
        {
          id: "doctors-create",
          method: "POST",
          path: "/doctors",
          title: "Add doctor profile",
          roles: ["admin", "clinic_manager"],
          description: "Creates a doctor profile linked to an existing staff user account.",
          parameters: [],
          requestBody: {
            user_id: "usr_d4e5f6",
            specialty: "Dermatology",
            license_number: "EG-DERM-44821",
            clinic_ids: ["cli_a1b2c3"],
            consultation_fee: 350,
            bio: "10+ years in clinical dermatology."
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Doctor profile created",
              body: {
                success: true,
                data: {
                  id: "doc_9f1a20",
                  user_id: "usr_d4e5f6",
                  full_name: "Dr. Ahmed Hassan",
                  specialty: "Dermatology",
                  license_number: "EG-DERM-44821",
                  clinic_ids: ["cli_a1b2c3"],
                  consultation_fee: 350,
                  bio: "10+ years in clinical dermatology.",
                  status: "active"
                }
              }
            },
            {
              status: 409,
              description: "409 Conflict — License number already registered",
              body: { success: false, error: { code: "LICENSE_ALREADY_REGISTERED", message: "A doctor with this license number already exists.", details: null } }
            }
          ]
        },
        {
          id: "doctors-get",
          method: "GET",
          path: "/doctors/{doctorId}",
          title: "Get doctor details",
          roles: ["authenticated"],
          description: "Fetches details of a doctor profile.",
          parameters: [
            { name: "doctorId", type: "path", dataType: "string", required: true, description: "Doctor ID (e.g. doc_9f1a20)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Doctor details",
              body: {
                success: true,
                data: {
                  id: "doc_9f1a20",
                  user_id: "usr_d4e5f6",
                  full_name: "Dr. Ahmed Hassan",
                  specialty: "Dermatology",
                  license_number: "EG-DERM-44821",
                  clinic_ids: ["cli_a1b2c3"],
                  consultation_fee: 350,
                  status: "active"
                }
              }
            }
          ]
        },
        {
          id: "doctors-update",
          method: "PATCH",
          path: "/doctors/{doctorId}",
          title: "Update doctor profile",
          roles: ["admin", "clinic_manager", "self"],
          description: "Updates consultation fee, bio, or status (on leave).",
          parameters: [
            { name: "doctorId", type: "path", dataType: "string", required: true, description: "Doctor ID" }
          ],
          requestBody: { consultation_fee: 400, status: "on_leave" },
          responses: [
            {
              status: 200,
              description: "200 OK — Doctor updated",
              body: {
                success: true,
                data: {
                  id: "doc_9f1a20",
                  consultation_fee: 400,
                  status: "on_leave"
                }
              }
            }
          ]
        },
        {
          id: "doctors-delete",
          method: "DELETE",
          path: "/doctors/{doctorId}",
          title: "Remove doctor profile",
          roles: ["admin"],
          description: "Removes doctor profile. Doctor must not have upcoming appointments.",
          parameters: [
            { name: "doctorId", type: "path", dataType: "string", required: true, description: "Doctor ID" }
          ],
          responses: [
            { status: 204, description: "204 No Content — Doctor removed", body: null }
          ]
        },
        {
          id: "doctors-schedule-get",
          method: "GET",
          path: "/doctors/{doctorId}/schedule",
          title: "Get weekly availability",
          roles: ["authenticated"],
          description: "Returns regular weekly shifts and specific date exceptions for a doctor.",
          parameters: [
            { name: "doctorId", type: "path", dataType: "string", required: true, description: "Doctor ID" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Weekly schedule",
              body: {
                success: true,
                data: {
                  doctor_id: "doc_9f1a20",
                  weekly_availability: [
                    { day_of_week: "sunday", start_time: "10:00", end_time: "18:00" },
                    { day_of_week: "tuesday", start_time: "10:00", end_time: "18:00" }
                  ],
                  exceptions: [
                    { date: "2026-08-20", is_available: false, reason: "Conference" }
                  ]
                }
              }
            }
          ]
        },
        {
          id: "doctors-schedule-put",
          method: "PUT",
          path: "/doctors/{doctorId}/schedule",
          title: "Replace weekly availability",
          roles: ["admin", "clinic_manager", "self"],
          description: "Replaces the full weekly shift set for a doctor.",
          parameters: [
            { name: "doctorId", type: "path", dataType: "string", required: true, description: "Doctor ID" }
          ],
          requestBody: {
            weekly_availability: [
              { day_of_week: "sunday", start_time: "10:00", end_time: "18:00" },
              { day_of_week: "monday", start_time: "10:00", end_time: "16:00" }
            ]
          },
          responses: [
            {
              status: 200,
              description: "200 OK — Schedule updated",
              body: {
                success: true,
                data: {
                  doctor_id: "doc_9f1a20",
                  weekly_availability: [
                    { day_of_week: "sunday", start_time: "10:00", end_time: "18:00" },
                    { day_of_week: "monday", start_time: "10:00", end_time: "16:00" }
                  ]
                }
              }
            }
          ]
        },
        {
          id: "doctors-appointments",
          method: "GET",
          path: "/doctors/{doctorId}/appointments",
          title: "Doctor's appointments list",
          roles: ["admin", "clinic_manager", "receptionist", "self"],
          description: "Lists appointments scheduled with a doctor.",
          parameters: [
            { name: "doctorId", type: "path", dataType: "string", required: true, description: "Doctor ID" },
            { name: "date_from", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "status", type: "query", dataType: "string", required: false, description: "Appointment status" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Appointments list",
              body: {
                success: true,
                data: [
                  {
                    id: "apt_5e2b18",
                    patient_id: "pat_7c3f21",
                    doctor_id: "doc_9f1a20",
                    scheduled_at: "2026-08-15T11:30:00Z",
                    status: "scheduled"
                  }
                ],
                meta: { page: 1, limit: 20, total: 18, total_pages: 1 }
              }
            }
          ]
        }
      ]
    },

    {
      id: "appointments",
      title: "Appointments",
      icon: "calendar",
      description: "Booking, rescheduling, cancellation, front-desk check-in, and free slot finder",
      endpoints: [
        {
          id: "appointments-list",
          method: "GET",
          path: "/appointments",
          title: "List / filter appointments",
          roles: ["admin", "clinic_manager", "doctor", "nurse", "receptionist", "patient"],
          description: "Lists appointments across clinics. Patients see only their own.",
          parameters: [
            { name: "patient_id", type: "query", dataType: "string", required: false, description: "Filter by patient ID" },
            { name: "doctor_id", type: "query", dataType: "string", required: false, description: "Filter by doctor ID" },
            { name: "clinic_id", type: "query", dataType: "string", required: false, description: "Filter by clinic branch ID" },
            { name: "status", type: "query", dataType: "string", required: false, description: "scheduled | confirmed | checked_in | in_progress | completed | cancelled | no_show" },
            { name: "date_from", type: "query", dataType: "string", required: false, description: "Filter starting ISO date" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "Filter ending ISO date" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Appointments list",
              body: {
                success: true,
                data: [
                  {
                    id: "apt_5e2b18",
                    patient_id: "pat_7c3f21",
                    doctor_id: "doc_9f1a20",
                    clinic_id: "cli_a1b2c3",
                    scheduled_at: "2026-08-15T11:30:00Z",
                    duration_minutes: 30,
                    type: "consultation",
                    status: "scheduled",
                    reason: "Follow-up on skin rash",
                    created_by: "usr_7b1e90"
                  }
                ],
                meta: { page: 1, limit: 20, total: 58, total_pages: 3 }
              }
            }
          ]
        },
        {
          id: "appointments-create",
          method: "POST",
          path: "/appointments",
          title: "Book appointment",
          roles: ["admin", "clinic_manager", "receptionist", "patient"],
          description: "Books a new appointment slot for a patient. Checks slot availability.",
          parameters: [],
          requestBody: {
            patient_id: "pat_7c3f21",
            doctor_id: "doc_9f1a20",
            clinic_id: "cli_a1b2c3",
            scheduled_at: "2026-08-15T11:30:00Z",
            duration_minutes: 30,
            type: "consultation",
            reason: "Follow-up on skin rash"
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Appointment booked",
              body: {
                success: true,
                data: {
                  id: "apt_5e2b18",
                  patient_id: "pat_7c3f21",
                  doctor_id: "doc_9f1a20",
                  clinic_id: "cli_a1b2c3",
                  scheduled_at: "2026-08-15T11:30:00Z",
                  duration_minutes: 30,
                  type: "consultation",
                  status: "scheduled",
                  reason: "Follow-up on skin rash",
                  created_by: "usr_7b1e90"
                }
              }
            },
            {
              status: 409,
              description: "409 Conflict — Target slot unavailable",
              body: { success: false, error: { code: "SLOT_UNAVAILABLE", message: "Doctor already has an appointment at this time.", details: null } }
            }
          ]
        },
        {
          id: "appointments-get",
          method: "GET",
          path: "/appointments/{appointmentId}",
          title: "Get appointment details",
          roles: ["admin", "clinic_manager", "doctor", "nurse", "receptionist", "patient"],
          description: "Fetches details for a specific appointment ID.",
          parameters: [
            { name: "appointmentId", type: "path", dataType: "string", required: true, description: "Appointment ID (e.g. apt_5e2b18)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Appointment details",
              body: {
                success: true,
                data: {
                  id: "apt_5e2b18",
                  patient_id: "pat_7c3f21",
                  doctor_id: "doc_9f1a20",
                  clinic_id: "cli_a1b2c3",
                  scheduled_at: "2026-08-15T11:30:00Z",
                  duration_minutes: 30,
                  type: "consultation",
                  status: "scheduled",
                  reason: "Follow-up on skin rash"
                }
              }
            }
          ]
        },
        {
          id: "appointments-update",
          method: "PATCH",
          path: "/appointments/{appointmentId}",
          title: "Reschedule or edit appointment",
          roles: ["admin", "clinic_manager", "receptionist"],
          description: "Reschedules or edits appointment details. Changing scheduled_at re-checks slot availability.",
          parameters: [
            { name: "appointmentId", type: "path", dataType: "string", required: true, description: "Appointment ID" }
          ],
          requestBody: { scheduled_at: "2026-08-16T09:00:00Z" },
          responses: [
            {
              status: 200,
              description: "200 OK — Appointment updated",
              body: {
                success: true,
                data: {
                  id: "apt_5e2b18",
                  scheduled_at: "2026-08-16T09:00:00Z",
                  status: "scheduled"
                }
              }
            }
          ]
        },
        {
          id: "appointments-delete",
          method: "DELETE",
          path: "/appointments/{appointmentId}",
          title: "Cancel appointment",
          roles: ["admin", "clinic_manager", "receptionist", "patient"],
          description: "Sets appointment status to cancelled (retained for history).",
          parameters: [
            { name: "appointmentId", type: "path", dataType: "string", required: true, description: "Appointment ID" }
          ],
          responses: [
            { status: 204, description: "204 No Content — Appointment cancelled", body: null }
          ]
        },
        {
          id: "appointments-checkin",
          method: "PATCH",
          path: "/appointments/{appointmentId}/check-in",
          title: "Front-desk check-in",
          roles: ["admin", "clinic_manager", "receptionist", "nurse"],
          description: "Marks a patient as checked-in upon arrival at the clinic reception.",
          parameters: [
            { name: "appointmentId", type: "path", dataType: "string", required: true, description: "Appointment ID" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Checked in",
              body: {
                success: true,
                data: { id: "apt_5e2b18", status: "checked_in", checked_in_at: "2026-08-15T11:25:00Z" }
              }
            }
          ]
        },
        {
          id: "appointments-status",
          method: "PATCH",
          path: "/appointments/{appointmentId}/status",
          title: "Transition appointment status",
          roles: ["admin", "clinic_manager", "doctor", "receptionist"],
          description: "Updates state machine status (e.g. checked_in → in_progress → completed, or no_show).",
          parameters: [
            { name: "appointmentId", type: "path", dataType: "string", required: true, description: "Appointment ID" }
          ],
          requestBody: { status: "no_show" },
          responses: [
            {
              status: 200,
              description: "200 OK — Status updated",
              body: {
                success: true,
                data: { id: "apt_5e2b18", status: "no_show" }
              }
            }
          ]
        },
        {
          id: "appointments-slots",
          method: "GET",
          path: "/appointments/available-slots",
          title: "Free slot finder",
          roles: ["admin", "clinic_manager", "receptionist", "doctor", "patient"],
          description: "Finds open time slots for a doctor on a specific date.",
          parameters: [
            { name: "doctor_id", type: "query", dataType: "string", required: true, description: "Target doctor ID" },
            { name: "date", type: "query", dataType: "string", required: true, description: "Date in YYYY-MM-DD" },
            { name: "duration_minutes", type: "query", dataType: "integer", required: false, default: "30", description: "Slot length in minutes" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Open slots list",
              body: {
                success: true,
                data: {
                  doctor_id: "doc_9f1a20",
                  date: "2026-08-15",
                  slots: ["10:00", "10:30", "11:00", "14:00", "14:30"]
                }
              }
            }
          ]
        },
        {
          id: "appointments-qrcode-get",
          method: "GET",
          path: "/appointments/{appointmentId}/qr-code",
          title: "Get appointment QR code for patient",
          roles: ["admin", "clinic_manager", "receptionist", "doctor", "patient"],
          description: "Generates or retrieves a secure QR Code payload and renderable QR image URL for a booked appointment. The patient receives this QR code to present upon arrival at the clinic.",
          parameters: [
            { name: "appointmentId", type: "path", dataType: "string", required: true, description: "Target appointment ID (e.g. apt_5e2b18)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — QR Code payload & image URL",
              body: {
                success: true,
                data: {
                  appointment_id: "apt_5e2b18",
                  patient_name: "Laila Ibrahim",
                  qr_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.qr_apt_5e2b18_token_sample",
                  qr_image_url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAD...",
                  expires_at: "2026-08-15T23:59:59Z"
                }
              }
            },
            {
              status: 404,
              description: "404 Not Found — Appointment not found",
              body: { success: false, error: { code: "RESOURCE_NOT_FOUND", message: "Appointment with id 'apt_5e2b18' was not found.", details: null } }
            }
          ]
        },
        {
          id: "appointments-scan-qr",
          method: "POST",
          path: "/appointments/check-in/scan-qr",
          title: "Scan patient QR code & automatic check-in",
          roles: ["admin", "clinic_manager", "receptionist", "nurse"],
          description: "Scans and validates a patient's QR code via reception desk or kiosk camera scanner. Automatically marks the appointment as checked_in and logs arrival time without requiring manual dashboard lookup.",
          parameters: [],
          requestBody: {
            qr_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.qr_apt_5e2b18_token_sample"
          },
          responses: [
            {
              status: 200,
              description: "200 OK — Automatically checked in",
              body: {
                success: true,
                data: {
                  appointment_id: "apt_5e2b18",
                  patient_id: "pat_7c3f21",
                  patient_name: "Laila Ibrahim",
                  doctor_name: "Dr. Ahmed Hassan",
                  status: "checked_in",
                  checked_in_at: "2026-08-15T11:24:12Z",
                  message: "Patient Laila Ibrahim successfully checked in automatically via QR scan."
                }
              }
            },
            {
              status: 400,
              description: "400 Bad Request — Invalid or expired QR code token",
              body: { success: false, error: { code: "INVALID_OR_EXPIRED_QR_TOKEN", message: "The scanned QR token is invalid or expired.", details: null } }
            },
            {
              status: 409,
              description: "409 Conflict — Patient already checked in",
              body: { success: false, error: { code: "APPOINTMENT_ALREADY_CHECKED_IN", message: "Patient has already checked in for this appointment.", details: null } }
            }
          ]
        }
      ]
    },


    {
      id: "consultations",
      title: "Consultations (Medical Records)",
      icon: "file-medical",
      description: "Clinical documentation, vital signs, chief complaints, and diagnoses recorded by doctors",
      endpoints: [
        {
          id: "consultations-list",
          method: "GET",
          path: "/consultations",
          title: "List consultations",
          roles: ["admin", "doctor", "nurse"],
          description: "Lists clinical consultation entries with patient and date range filters.",
          parameters: [
            { name: "patient_id", type: "query", dataType: "string", required: false, description: "Filter by patient ID" },
            { name: "doctor_id", type: "query", dataType: "string", required: false, description: "Filter by doctor ID" },
            { name: "date_from", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Consultations list",
              body: {
                success: true,
                data: [
                  {
                    id: "cst_3d8f42",
                    appointment_id: "apt_5e2b18",
                    patient_id: "pat_7c3f21",
                    doctor_id: "doc_9f1a20",
                    chief_complaint: "Recurring itchy rash on forearm",
                    diagnosis: "Contact dermatitis"
                  }
                ],
                meta: { page: 1, limit: 20, total: 42, total_pages: 3 }
              }
            }
          ]
        },
        {
          id: "consultations-create",
          method: "POST",
          path: "/consultations",
          title: "Record consultation",
          roles: ["doctor"],
          description: "Records clinical findings against a checked_in/in_progress appointment, automatically completing it.",
          parameters: [],
          requestBody: {
            appointment_id: "apt_5e2b18",
            chief_complaint: "Recurring itchy rash on forearm",
            diagnosis: "Contact dermatitis",
            vitals: {
              blood_pressure: "120/80",
              heart_rate: 72,
              temperature_c: 36.8,
              weight_kg: 68,
              height_cm: 170
            },
            notes: "Advised to avoid the suspected detergent brand.",
            follow_up_required: true,
            follow_up_date: "2026-08-29"
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Consultation recorded",
              body: {
                success: true,
                data: {
                  id: "cst_3d8f42",
                  appointment_id: "apt_5e2b18",
                  patient_id: "pat_7c3f21",
                  doctor_id: "doc_9f1a20",
                  chief_complaint: "Recurring itchy rash on forearm",
                  diagnosis: "Contact dermatitis",
                  vitals: { blood_pressure: "120/80", heart_rate: 72, temperature_c: 36.8, weight_kg: 68, height_cm: 170 },
                  notes: "Advised to avoid the suspected detergent brand.",
                  follow_up_required: true,
                  follow_up_date: "2026-08-29"
                }
              }
            },
            {
              status: 409,
              description: "409 Conflict — Appointment not in checked_in or in_progress status",
              body: { success: false, error: { code: "APPOINTMENT_NOT_CHECKED_IN", message: "Consultation can only be started for checked-in appointments.", details: null } }
            }
          ]
        },
        {
          id: "consultations-get",
          method: "GET",
          path: "/consultations/{consultationId}",
          title: "Get consultation record",
          roles: ["admin", "doctor", "nurse", "patient"],
          description: "Fetches full consultation record with vitals and associated prescription IDs.",
          parameters: [
            { name: "consultationId", type: "path", dataType: "string", required: true, description: "Consultation ID (e.g. cst_3d8f42)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Consultation record",
              body: {
                success: true,
                data: {
                  id: "cst_3d8f42",
                  appointment_id: "apt_5e2b18",
                  patient_id: "pat_7c3f21",
                  doctor_id: "doc_9f1a20",
                  chief_complaint: "Recurring itchy rash on forearm",
                  diagnosis: "Contact dermatitis",
                  vitals: { blood_pressure: "120/80", heart_rate: 72, temperature_c: 36.8, weight_kg: 68, height_cm: 170 },
                  prescriptions: ["rx_6a1c90"]
                }
              }
            }
          ]
        },
        {
          id: "consultations-update",
          method: "PATCH",
          path: "/consultations/{consultationId}",
          title: "Amend consultation record",
          roles: ["admin", "doctor"],
          description: "Amends notes or details. Authoring doctors can amend within 24 hours of creation.",
          parameters: [
            { name: "consultationId", type: "path", dataType: "string", required: true, description: "Consultation ID" }
          ],
          requestBody: { notes: "Updated: symptoms improved after avoiding the detergent." },
          responses: [
            {
              status: 200,
              description: "200 OK — Consultation amended",
              body: {
                success: true,
                data: {
                  id: "cst_3d8f42",
                  notes: "Updated: symptoms improved after avoiding the detergent."
                }
              }
            },
            {
              status: 403,
              description: "403 Forbidden — Edit window expired (24 hours passed)",
              body: { success: false, error: { code: "EDIT_WINDOW_EXPIRED", message: "Consultations can only be edited within 24 hours of creation.", details: null } }
            }
          ]
        }
      ]
    },

    {
      id: "prescriptions",
      title: "Prescriptions",
      icon: "pills",
      description: "Issuing medication prescriptions, tracking fulfillment status, and cancellation",
      endpoints: [
        {
          id: "prescriptions-list",
          method: "GET",
          path: "/prescriptions",
          title: "List prescriptions",
          roles: ["admin", "doctor", "nurse", "patient"],
          description: "Lists prescriptions issued across the clinic system.",
          parameters: [
            { name: "patient_id", type: "query", dataType: "string", required: false, description: "Filter by patient ID" },
            { name: "doctor_id", type: "query", dataType: "string", required: false, description: "Filter by doctor ID" },
            { name: "status", type: "query", dataType: "string", required: false, description: "active | fulfilled | cancelled" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Prescriptions list",
              body: {
                success: true,
                data: [
                  {
                    id: "rx_6a1c90",
                    consultation_id: "cst_3d8f42",
                    patient_id: "pat_7c3f21",
                    doctor_id: "doc_9f1a20",
                    status: "active",
                    issued_at: "2026-07-20T10:15:00Z"
                  }
                ],
                meta: { page: 1, limit: 20, total: 19, total_pages: 1 }
              }
            }
          ]
        },
        {
          id: "prescriptions-create",
          method: "POST",
          path: "/prescriptions",
          title: "Issue prescription",
          roles: ["doctor"],
          description: "Issues a new prescription tied to a consultation record.",
          parameters: [],
          requestBody: {
            consultation_id: "cst_3d8f42",
            medications: [
              {
                inventory_item_id: "itm_1a9c77",
                name: "Cetirizine 10mg",
                dosage: "1 tablet",
                frequency: "once daily",
                duration_days: 10,
                instructions: "Take at night."
              }
            ]
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Prescription issued",
              body: {
                success: true,
                data: {
                  id: "rx_6a1c90",
                  consultation_id: "cst_3d8f42",
                  patient_id: "pat_7c3f21",
                  doctor_id: "doc_9f1a20",
                  medications: [
                    { inventory_item_id: "itm_1a9c77", name: "Cetirizine 10mg", dosage: "1 tablet", frequency: "once daily", duration_days: 10, instructions: "Take at night." }
                  ],
                  status: "active",
                  issued_at: "2026-08-12T12:00:00Z"
                }
              }
            }
          ]
        },
        {
          id: "prescriptions-get",
          method: "GET",
          path: "/prescriptions/{prescriptionId}",
          title: "Get prescription details",
          roles: ["admin", "doctor", "nurse", "patient"],
          description: "Fetches prescription details and medication instructions.",
          parameters: [
            { name: "prescriptionId", type: "path", dataType: "string", required: true, description: "Prescription ID (e.g. rx_6a1c90)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Prescription details",
              body: {
                success: true,
                data: {
                  id: "rx_6a1c90",
                  consultation_id: "cst_3d8f42",
                  patient_id: "pat_7c3f21",
                  doctor_id: "doc_9f1a20",
                  medications: [
                    { inventory_item_id: "itm_1a9c77", name: "Cetirizine 10mg", dosage: "1 tablet", frequency: "once daily", duration_days: 10, instructions: "Take at night." }
                  ],
                  status: "active",
                  issued_at: "2026-07-20T10:15:00Z"
                }
              }
            }
          ]
        },
        {
          id: "prescriptions-update",
          method: "PATCH",
          path: "/prescriptions/{prescriptionId}",
          title: "Update prescription status",
          roles: ["admin", "doctor"],
          description: "Updates prescription status (e.g. to fulfilled).",
          parameters: [
            { name: "prescriptionId", type: "path", dataType: "string", required: true, description: "Prescription ID" }
          ],
          requestBody: { status: "fulfilled" },
          responses: [
            {
              status: 200,
              description: "200 OK — Status updated",
              body: {
                success: true,
                data: { id: "rx_6a1c90", status: "fulfilled" }
              }
            }
          ]
        },
        {
          id: "prescriptions-delete",
          method: "DELETE",
          path: "/prescriptions/{prescriptionId}",
          title: "Cancel prescription",
          roles: ["admin", "doctor"],
          description: "Sets prescription status to cancelled (retained for medical audit trail).",
          parameters: [
            { name: "prescriptionId", type: "path", dataType: "string", required: true, description: "Prescription ID" }
          ],
          responses: [
            { status: 204, description: "204 No Content — Prescription cancelled", body: null }
          ]
        }
      ]
    },

    {
      id: "billing",
      title: "Billing & Invoices",
      icon: "credit-card",
      description: "Invoicing, payment processing, idempotency protection, and refunds",
      endpoints: [
        {
          id: "invoices-list",
          method: "GET",
          path: "/invoices",
          title: "List invoices",
          roles: ["admin", "clinic_manager", "accountant", "receptionist", "patient"],
          description: "Retrieves list of billing invoices.",
          parameters: [
            { name: "patient_id", type: "query", dataType: "string", required: false, description: "Filter by patient ID" },
            { name: "status", type: "query", dataType: "string", required: false, description: "draft | pending | partially_paid | paid | void" },
            { name: "date_from", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Invoices list",
              body: {
                success: true,
                data: [
                  {
                    id: "inv_2f7e11",
                    patient_id: "pat_7c3f21",
                    appointment_id: "apt_5e2b18",
                    clinic_id: "cli_a1b2c3",
                    items: [{ description: "Dermatology consultation", quantity: 1, unit_price: 350, total: 350 }],
                    subtotal: 350,
                    discount: 0,
                    tax: 0,
                    total: 350,
                    amount_paid: 0,
                    balance_due: 350,
                    status: "pending",
                    due_date: "2026-08-22"
                  }
                ],
                meta: { page: 1, limit: 20, total: 92, total_pages: 5 }
              }
            }
          ]
        },
        {
          id: "invoices-create",
          method: "POST",
          path: "/invoices",
          title: "Create invoice",
          roles: ["admin", "clinic_manager", "receptionist", "accountant"],
          description: "Creates an invoice record. Accepts optional Idempotency-Key header.",
          parameters: [
            { name: "Idempotency-Key", type: "header", dataType: "string", required: false, description: "Client unique key to prevent duplicate creation" }
          ],
          requestBody: {
            patient_id: "pat_7c3f21",
            appointment_id: "apt_5e2b18",
            clinic_id: "cli_a1b2c3",
            items: [{ description: "Dermatology consultation", quantity: 1, unit_price: 350 }],
            discount: 0,
            tax: 0,
            due_date: "2026-08-22"
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Invoice generated",
              body: {
                success: true,
                data: {
                  id: "inv_2f7e11",
                  patient_id: "pat_7c3f21",
                  appointment_id: "apt_5e2b18",
                  clinic_id: "cli_a1b2c3",
                  items: [{ description: "Dermatology consultation", quantity: 1, unit_price: 350, total: 350 }],
                  subtotal: 350,
                  discount: 0,
                  tax: 0,
                  total: 350,
                  amount_paid: 0,
                  balance_due: 350,
                  status: "pending",
                  due_date: "2026-08-22"
                }
              }
            }
          ]
        },
        {
          id: "invoices-get",
          method: "GET",
          path: "/invoices/{invoiceId}",
          title: "Get invoice details",
          roles: ["admin", "clinic_manager", "accountant", "receptionist", "patient"],
          description: "Fetches invoice line items and payment balance status.",
          parameters: [
            { name: "invoiceId", type: "path", dataType: "string", required: true, description: "Invoice ID (e.g. inv_2f7e11)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Invoice details",
              body: {
                success: true,
                data: {
                  id: "inv_2f7e11",
                  patient_id: "pat_7c3f21",
                  appointment_id: "apt_5e2b18",
                  clinic_id: "cli_a1b2c3",
                  items: [{ description: "Dermatology consultation", quantity: 1, unit_price: 350, total: 350 }],
                  subtotal: 350,
                  discount: 0,
                  tax: 0,
                  total: 350,
                  amount_paid: 0,
                  balance_due: 350,
                  status: "pending",
                  due_date: "2026-08-22"
                }
              }
            }
          ]
        },
        {
          id: "invoices-update",
          method: "PATCH",
          path: "/invoices/{invoiceId}",
          title: "Edit draft invoice",
          roles: ["admin", "clinic_manager", "accountant"],
          description: "Modifies invoice line items or discounts. Only invoices in draft status can be edited.",
          parameters: [
            { name: "invoiceId", type: "path", dataType: "string", required: true, description: "Invoice ID" }
          ],
          requestBody: { discount: 50 },
          responses: [
            {
              status: 200,
              description: "200 OK — Invoice updated",
              body: {
                success: true,
                data: { id: "inv_2f7e11", discount: 50, total: 300, balance_due: 300 }
              }
            },
            {
              status: 409,
              description: "409 Conflict — Invoice not in draft status",
              body: { success: false, error: { code: "INVOICE_NOT_EDITABLE", message: "Only draft invoices can be edited.", details: null } }
            }
          ]
        },
        {
          id: "invoices-delete",
          method: "DELETE",
          path: "/invoices/{invoiceId}",
          title: "Void invoice",
          roles: ["admin", "clinic_manager"],
          description: "Voids an unpaid invoice.",
          parameters: [
            { name: "invoiceId", type: "path", dataType: "string", required: true, description: "Invoice ID" }
          ],
          responses: [
            { status: 204, description: "204 No Content — Invoice voided", body: null }
          ]
        },
        {
          id: "invoices-payments-create",
          method: "POST",
          path: "/invoices/{invoiceId}/payments",
          title: "Record payment",
          roles: ["admin", "clinic_manager", "receptionist", "accountant"],
          description: "Records cash/card/insurance payment on an invoice, updating balance_due.",
          parameters: [
            { name: "invoiceId", type: "path", dataType: "string", required: true, description: "Invoice ID" },
            { name: "Idempotency-Key", type: "header", dataType: "string", required: false, description: "Client unique key" }
          ],
          requestBody: {
            amount: 350,
            method: "card",
            reference_number: "TXN-8823410"
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Payment recorded",
              body: {
                success: true,
                data: {
                  id: "pay_8b4d33",
                  invoice_id: "inv_2f7e11",
                  amount: 350,
                  method: "card",
                  reference_number: "TXN-8823410",
                  received_by: "usr_7b1e90",
                  paid_at: "2026-08-12T12:05:00Z"
                }
              }
            },
            {
              status: 409,
              description: "409 Conflict — Overpayment not allowed",
              body: { success: false, error: { code: "OVERPAYMENT_NOT_ALLOWED", message: "Payment amount exceeds remaining balance due.", details: null } }
            }
          ]
        },
        {
          id: "invoices-payments-list",
          method: "GET",
          path: "/invoices/{invoiceId}/payments",
          title: "List payments on invoice",
          roles: ["admin", "clinic_manager", "accountant", "receptionist", "patient"],
          description: "Lists all payment transactions recorded against a specific invoice.",
          parameters: [
            { name: "invoiceId", type: "path", dataType: "string", required: true, description: "Invoice ID" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Payment history array",
              body: {
                success: true,
                data: [
                  {
                    id: "pay_8b4d33",
                    invoice_id: "inv_2f7e11",
                    amount: 350,
                    method: "card",
                    reference_number: "TXN-8823410",
                    paid_at: "2026-08-12T12:05:00Z"
                  }
                ]
              }
            }
          ]
        },
        {
          id: "invoices-refund",
          method: "POST",
          path: "/invoices/{invoiceId}/refund",
          title: "Refund a payment",
          roles: ["admin", "clinic_manager"],
          description: "Processes a refund for a previously recorded payment transaction.",
          parameters: [
            { name: "invoiceId", type: "path", dataType: "string", required: true, description: "Invoice ID" }
          ],
          requestBody: {
            payment_id: "pay_8b4d33",
            amount: 350,
            reason: "Appointment cancelled after payment"
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Refund processed",
              body: {
                success: true,
                data: {
                  id: "rfd_5c1a02",
                  payment_id: "pay_8b4d33",
                  amount: 350,
                  reason: "Appointment cancelled after payment",
                  status: "processed",
                  processed_at: "2026-08-12T13:00:00Z"
                }
              }
            }
          ]
        }
      ]
    },

    {
      id: "inventory",
      title: "Inventory & Pharmacy",
      icon: "box-seam",
      description: "Stock management, reorder alerts, cost tracking, and stock level adjustments",
      endpoints: [
        {
          id: "inventory-list",
          method: "GET",
          path: "/inventory/items",
          title: "List stock items",
          roles: ["admin", "clinic_manager", "doctor", "nurse"],
          description: "Lists inventory items with stock levels, cost, and reorder threshold.",
          parameters: [
            { name: "category", type: "query", dataType: "string", required: false, description: "medicine | supply" },
            { name: "clinic_id", type: "query", dataType: "string", required: false, description: "Filter by clinic branch ID" },
            { name: "search", type: "query", dataType: "string", required: false, description: "Search by item name" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Inventory items list",
              body: {
                success: true,
                data: [
                  {
                    id: "itm_1a9c77",
                    name: "Cetirizine 10mg",
                    category: "medicine",
                    unit: "box",
                    quantity_in_stock: 120,
                    reorder_level: 20,
                    unit_cost: 45,
                    expiry_date: "2027-03-01",
                    clinic_id: "cli_a1b2c3"
                  }
                ],
                meta: { page: 1, limit: 20, total: 64, total_pages: 4 }
              }
            }
          ]
        },
        {
          id: "inventory-create",
          method: "POST",
          path: "/inventory/items",
          title: "Add stock item",
          roles: ["admin", "clinic_manager"],
          description: "Registers a new medicine or clinical supply item in stock.",
          parameters: [],
          requestBody: {
            name: "Cetirizine 10mg",
            category: "medicine",
            unit: "box",
            quantity_in_stock: 120,
            reorder_level: 20,
            unit_cost: 45,
            expiry_date: "2027-03-01",
            clinic_id: "cli_a1b2c3"
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Item registered",
              body: {
                success: true,
                data: {
                  id: "itm_1a9c77",
                  name: "Cetirizine 10mg",
                  category: "medicine",
                  unit: "box",
                  quantity_in_stock: 120,
                  reorder_level: 20,
                  unit_cost: 45,
                  expiry_date: "2027-03-01",
                  clinic_id: "cli_a1b2c3"
                }
              }
            }
          ]
        },
        {
          id: "inventory-get",
          method: "GET",
          path: "/inventory/items/{itemId}",
          title: "Get item details",
          roles: ["admin", "clinic_manager", "doctor", "nurse"],
          description: "Fetches details of a specific inventory item.",
          parameters: [
            { name: "itemId", type: "path", dataType: "string", required: true, description: "Item ID (e.g. itm_1a9c77)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Item details",
              body: {
                success: true,
                data: {
                  id: "itm_1a9c77",
                  name: "Cetirizine 10mg",
                  category: "medicine",
                  unit: "box",
                  quantity_in_stock: 120,
                  reorder_level: 20,
                  unit_cost: 45,
                  expiry_date: "2027-03-01",
                  clinic_id: "cli_a1b2c3"
                }
              }
            }
          ]
        },
        {
          id: "inventory-update",
          method: "PATCH",
          path: "/inventory/items/{itemId}",
          title: "Update item details",
          roles: ["admin", "clinic_manager"],
          description: "Updates reorder level, unit cost, or expiry date.",
          parameters: [
            { name: "itemId", type: "path", dataType: "string", required: true, description: "Item ID" }
          ],
          requestBody: { reorder_level: 30, unit_cost: 48 },
          responses: [
            {
              status: 200,
              description: "200 OK — Item updated",
              body: {
                success: true,
                data: { id: "itm_1a9c77", reorder_level: 30, unit_cost: 48 }
              }
            }
          ]
        },
        {
          id: "inventory-delete",
          method: "DELETE",
          path: "/inventory/items/{itemId}",
          title: "Remove item",
          roles: ["admin", "clinic_manager"],
          description: "Removes stock item. Item cannot be deleted if referenced in active prescriptions.",
          parameters: [
            { name: "itemId", type: "path", dataType: "string", required: true, description: "Item ID" }
          ],
          responses: [
            { status: 204, description: "204 No Content — Item removed", body: null },
            {
              status: 409,
              description: "409 Conflict — Item referenced by active prescriptions",
              body: { success: false, error: { code: "ITEM_REFERENCED_BY_ACTIVE_PRESCRIPTIONS", message: "Cannot delete item active in prescriptions.", details: null } }
            }
          ]
        },
        {
          id: "inventory-adjustments",
          method: "POST",
          path: "/inventory/items/{itemId}/stock-adjustments",
          title: "Adjust stock quantity",
          roles: ["admin", "clinic_manager", "nurse"],
          description: "Logs stock increase or decrease (usage, wastage, restock).",
          parameters: [
            { name: "itemId", type: "path", dataType: "string", required: true, description: "Item ID" }
          ],
          requestBody: {
            change_quantity: -5,
            reason: "usage"
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Stock adjusted",
              body: {
                success: true,
                data: {
                  id: "adj_4e9b12",
                  inventory_item_id: "itm_1a9c77",
                  change_quantity: -5,
                  reason: "usage",
                  adjusted_by: "usr_7b1e90",
                  resulting_quantity: 115,
                  created_at: "2026-08-12T12:30:00Z"
                }
              }
            }
          ]
        },
        {
          id: "inventory-low-stock",
          method: "GET",
          path: "/inventory/low-stock",
          title: "Items at / below reorder level",
          roles: ["admin", "clinic_manager"],
          description: "Returns stock items where quantity_in_stock <= reorder_level for quick reordering.",
          parameters: [],
          responses: [
            {
              status: 200,
              description: "200 OK — Low stock items list",
              body: {
                success: true,
                data: [
                  {
                    id: "itm_99a8b7",
                    name: "Surgical Gloves (M)",
                    category: "supply",
                    unit: "box",
                    quantity_in_stock: 12,
                    reorder_level: 25,
                    unit_cost: 65,
                    clinic_id: "cli_a1b2c3"
                  }
                ]
              }
            }
          ]
        }
      ]
    },

    {
      id: "notifications",
      title: "Notifications",
      icon: "bell",
      description: "SMS, WhatsApp, and email reminders, manual notification triggers, and read receipts",
      endpoints: [
        {
          id: "notifications-list",
          method: "GET",
          path: "/notifications",
          title: "List sent / queued notifications",
          roles: ["admin", "clinic_manager", "patient"],
          description: "Lists notifications sent via SMS, WhatsApp, or email.",
          parameters: [
            { name: "recipient_id", type: "query", dataType: "string", required: false, description: "Filter by recipient ID" },
            { name: "channel", type: "query", dataType: "string", required: false, description: "sms | whatsapp | email" },
            { name: "status", type: "query", dataType: "string", required: false, description: "queued | sent | failed | read" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Notifications list",
              body: {
                success: true,
                data: [
                  {
                    id: "ntf_4c2e19",
                    recipient_type: "patient",
                    recipient_id: "pat_7c3f21",
                    channel: "whatsapp",
                    template_key: "appointment_reminder_24h",
                    status: "sent",
                    scheduled_at: "2026-08-14T11:30:00Z",
                    sent_at: "2026-08-14T11:30:05Z"
                  }
                ],
                meta: { page: 1, limit: 20, total: 210, total_pages: 11 }
              }
            }
          ]
        },
        {
          id: "notifications-send",
          method: "POST",
          path: "/notifications/send",
          title: "Trigger manual notification",
          roles: ["admin", "clinic_manager", "receptionist"],
          description: "Triggers an immediate SMS or WhatsApp notification to a patient or staff member.",
          parameters: [],
          requestBody: {
            recipient_type: "patient",
            recipient_id: "pat_7c3f21",
            channel: "sms",
            template_key: "invoice_payment_due",
            context: { invoice_id: "inv_2f7e11" }
          },
          responses: [
            {
              status: 201,
              description: "201 Created — Notification queued",
              body: {
                success: true,
                data: {
                  id: "ntf_99x88y",
                  recipient_type: "patient",
                  recipient_id: "pat_7c3f21",
                  channel: "sms",
                  template_key: "invoice_payment_due",
                  status: "queued"
                }
              }
            }
          ]
        },
        {
          id: "notifications-read",
          method: "PATCH",
          path: "/notifications/{notificationId}/read",
          title: "Mark read (patient portal)",
          roles: ["patient"],
          description: "Marks a notification as read by the patient.",
          parameters: [
            { name: "notificationId", type: "path", dataType: "string", required: true, description: "Notification ID" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Marked read",
              body: { success: true, data: { id: "ntf_4c2e19", read_at: "2026-08-14T12:00:00Z" } }
            }
          ]
        }
      ]
    },

    {
      id: "reports",
      title: "Reports & Analytics",
      icon: "chart-bar",
      description: "Financial revenue reports, appointment volumes, no-show rates, and doctor performance",
      endpoints: [
        {
          id: "reports-revenue",
          method: "GET",
          path: "/reports/revenue",
          title: "Revenue over time",
          roles: ["admin", "clinic_manager", "accountant"],
          description: "Returns total revenue, collected payments, outstanding balances, and daily breakdown.",
          parameters: [
            { name: "date_from", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "clinic_id", type: "query", dataType: "string", required: false, description: "Filter by clinic ID" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Revenue report",
              body: {
                success: true,
                data: {
                  period: { from: "2026-07-01", to: "2026-07-31" },
                  total_revenue: 184500,
                  total_collected: 176200,
                  total_outstanding: 8300,
                  breakdown_by_day: [
                    { date: "2026-07-01", revenue: 6200 }
                  ]
                }
              }
            }
          ]
        },
        {
          id: "reports-appointments-summary",
          method: "GET",
          path: "/reports/appointments-summary",
          title: "Volume by status & doctor",
          roles: ["admin", "clinic_manager"],
          description: "Returns summary counts of appointments categorized by status and by doctor.",
          parameters: [
            { name: "date_from", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Appointments summary",
              body: {
                success: true,
                data: {
                  total_appointments: 412,
                  by_status: { completed: 340, cancelled: 28, no_show: 22, scheduled: 22 },
                  by_doctor: [
                    { doctor_id: "doc_9f1a20", doctor_name: "Dr. Ahmed Hassan", count: 96 }
                  ]
                }
              }
            }
          ]
        },
        {
          id: "reports-noshow-rate",
          method: "GET",
          path: "/reports/no-show-rate",
          title: "No-show percentage & trends",
          roles: ["admin", "clinic_manager"],
          description: "Calculates overall no-show rate percentage and monthly trend comparison.",
          parameters: [
            { name: "date_from", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — No-show metrics",
              body: {
                success: true,
                data: {
                  no_show_rate_percent: 5.3,
                  total_appointments: 412,
                  no_shows: 22,
                  trend: [
                    { month: "2026-06", rate_percent: 6.1 },
                    { month: "2026-07", rate_percent: 5.3 }
                  ]
                }
              }
            }
          ]
        },
        {
          id: "reports-doctor-performance",
          method: "GET",
          path: "/reports/doctor-performance",
          title: "Per-doctor metrics",
          roles: ["admin", "clinic_manager"],
          description: "Evaluates doctor performance metrics: completed consultations, revenue, average time.",
          parameters: [
            { name: "date_from", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Performance metrics",
              body: {
                success: true,
                data: [
                  {
                    doctor_id: "doc_9f1a20",
                    doctor_name: "Dr. Ahmed Hassan",
                    appointments_completed: 89,
                    average_consultation_minutes: 24,
                    revenue_generated: 31150,
                    patient_satisfaction_score: 4.7
                  }
                ]
              }
            }
          ]
        },
        {
          id: "reports-patients-growth",
          method: "GET",
          path: "/reports/patients-growth",
          title: "New patients acquisition over time",
          roles: ["admin", "clinic_manager"],
          description: "Measures patient growth and monthly registration figures.",
          parameters: [
            { name: "date_from", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Growth statistics",
              body: {
                success: true,
                data: {
                  new_patients_total: 58,
                  by_month: [
                    { month: "2026-06", new_patients: 26 },
                    { month: "2026-07", new_patients: 32 }
                  ]
                }
              }
            }
          ]
        }
      ]
    },

    {
      id: "audit",
      title: "Audit Logs",
      icon: "history",
      description: "Compliance audit logging for all patient, medical, and billing mutations",
      endpoints: [
        {
          id: "audit-logs-list",
          method: "GET",
          path: "/audit-logs",
          title: "List system activity logs",
          roles: ["admin"],
          description: "Retrieves complete audit trail logs for data modification actions.",
          parameters: [
            { name: "actor_id", type: "query", dataType: "string", required: false, description: "Filter by user ID" },
            { name: "resource_type", type: "query", dataType: "string", required: false, description: "patient | consultation | invoice | prescription" },
            { name: "resource_id", type: "query", dataType: "string", required: false, description: "Target resource ID" },
            { name: "date_from", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" },
            { name: "date_to", type: "query", dataType: "string", required: false, description: "YYYY-MM-DD" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Audit trail logs",
              body: {
                success: true,
                data: [
                  {
                    id: "log_9e3f01",
                    actor_id: "usr_7b1e90",
                    action: "invoice.payment_recorded",
                    resource_type: "invoice",
                    resource_id: "inv_2f7e11",
                    changes: { amount_paid: { from: 0, to: 350 } },
                    ip_address: "41.238.12.4",
                    created_at: "2026-08-12T12:05:03Z"
                  }
                ],
                meta: { page: 1, limit: 20, total: 1840, total_pages: 92 }
              }
            }
          ]
        },
        {
          id: "audit-logs-get",
          method: "GET",
          path: "/audit-logs/{logId}",
          title: "Get single audit log entry",
          roles: ["admin"],
          description: "Fetches full details of a specific audit log record.",
          parameters: [
            { name: "logId", type: "path", dataType: "string", required: true, description: "Log entry ID (e.g. log_9e3f01)" }
          ],
          responses: [
            {
              status: 200,
              description: "200 OK — Log entry details",
              body: {
                success: true,
                data: {
                  id: "log_9e3f01",
                  actor_id: "usr_7b1e90",
                  action: "invoice.payment_recorded",
                  resource_type: "invoice",
                  resource_id: "inv_2f7e11",
                  changes: { amount_paid: { from: 0, to: 350 } },
                  ip_address: "41.238.12.4",
                  created_at: "2026-08-12T12:05:03Z"
                }
              }
            }
          ]
        }
      ]
    }
  ],

  errors: [
    { status: 400, code: "MALFORMED_REQUEST", meaning: "Request body isn't valid JSON or is missing entirely", fix: "Check Content-Type header and body syntax" },
    { status: 401, code: "UNAUTHENTICATED", meaning: "Missing or invalid access token", fix: "Re-authenticate via /auth/login or /auth/refresh" },
    { status: 401, code: "INVALID_CREDENTIALS", meaning: "Wrong email/password on login", fix: "Verify credentials" },
    { status: 403, code: "FORBIDDEN", meaning: "Token is valid but role lacks permission for this action", fix: "Confirm user's role and required permission" },
    { status: 404, code: "RESOURCE_NOT_FOUND", meaning: "Requested {id} doesn't exist or isn't in scope for clinic", fix: "Confirm ID and X-Clinic-Id header" },
    { status: 409, code: "CONFLICT", meaning: "Request conflicts with current state (double-booked slot, duplicate ID, invalid state)", fix: "Read error.details for specific conflict" },
    { status: 422, code: "VALIDATION_ERROR", meaning: "Body failed schema validation", fix: "Read error.details for field-level errors" },
    { status: 429, code: "RATE_LIMITED", meaning: "Too many requests", fix: "Respect Retry-After header before retrying" },
    { status: 500, code: "INTERNAL_ERROR", meaning: "Unexpected server fault", fix: "Retry with backoff; contact support if it persists" }
  ]
};

if (typeof window !== "undefined") {
  window.API_DATA = API_DATA;
}
