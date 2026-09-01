/**
 * Delta Clinics CRM — Production REST API Reference Data Structure
 * Contains full specification details matching the Multi-Tenant Architecture
 * Created & Maintained by DEVesters
 */

const API_DATA = {
  info: {
    title: "Delta Clinics CRM — REST API Contract & Reference",
    version: "v1.1",
    format: "REST / JSON",
    audience: "Frontend team, mobile team, and third-party integrators",
    description: "Complete API specification for the Delta Clinics CRM SaaS platform: Central Platform Management, Subscription Plans, Offline Receipts, Support Desk, Server Telemetry, Multi-Branch Clinics, Public QR Booking, Doctors, Medical Records, Billing, Inventory, and Queued Notifications.",
    baseUrl: "https://api.delta-clinics.com/v1",
    tenantBaseUrl: "https://[tenant].delta-clinics.com/api/v1",
    defaultClinicId: "cli_a1b2c3",
    defaultTenant: "elshifa"
  },

  conventions: {
    headers: [
      { name: "Authorization", value: "Bearer [ACCESS_TOKEN]", required: true, description: "JWT Access token required for authenticated endpoints" },
      { name: "Content-Type", value: "application/json", required: true, description: "Media type for request payload" },
      { name: "X-Tenant", value: "[TENANT_ID_OR_SLUG]", required: false, description: "Identifies tenant database context if calling via central proxy (e.g. elshifa)" },
      { name: "X-Domain", value: "[TENANT_DOMAIN]", required: false, description: "Dynamic subdomain resolution header (e.g. elshifa.delta-clinics.com)" },
      { name: "X-Clinic-Id", value: "[CLINIC_ID]", required: false, description: "Identifies branch location within tenant database (e.g. cli_a1b2c3)" },
      { name: "Idempotency-Key", value: "[UNIQUE_CLIENT_GENERATED_KEY]", required: false, description: "Optional UUID on POST /invoices and /payments to prevent duplicate financial transactions" }
    ],
    idFormats: [
      { prefix: "usr_", entity: "User / Staff / Admin", example: "usr_d4e5f6" },
      { prefix: "cli_", entity: "Clinic / Branch", example: "cli_a1b2c3" },
      { prefix: "doc_", entity: "Doctor Profile", example: "doc_9f1a20" },
      { prefix: "spec_", entity: "Medical Specialty", example: "spec_3b7a11" },
      { prefix: "sch_", entity: "Doctor Schedule", example: "sch_4e9b12" },
      { prefix: "slot_", entity: "Time Slot", example: "slot_8c2d15" },
      { prefix: "res_", entity: "Reservation / Booking", example: "res_5e2b18" },
      { prefix: "pat_", entity: "Patient Profile", example: "pat_7c3f21" },
      { prefix: "cst_", entity: "Consultation (EMR)", example: "cst_3d8f42" },
      { prefix: "rx_", entity: "Prescription", example: "rx_6a1c90" },
      { prefix: "inv_", entity: "Invoice", example: "inv_2f7e11" },
      { prefix: "ivi_", entity: "Invoice Item", example: "ivi_1a2b3c" },
      { prefix: "pay_", entity: "Payment", example: "pay_8b4d33" },
      { prefix: "exp_", entity: "Clinic Expense", example: "exp_9d4a12" },
      { prefix: "itm_", entity: "Inventory Item", example: "itm_1a9c77" },
      { prefix: "adj_", entity: "Stock Adjustment", example: "adj_4e9b12" },
      { prefix: "ntf_", entity: "Notification", example: "ntf_4c2e19" },
      { prefix: "pln_", entity: "Subscription Plan", example: "pln_professional" },
      { prefix: "sub_", entity: "Subscription Request", example: "sub_8b1a44" },
      { prefix: "tik_", entity: "Support Ticket", example: "tik_9a4f22" },
      { prefix: "msg_", entity: "Chat / Support Message", example: "msg_1b8e77" },
      { prefix: "set_", entity: "Tenant Settings", example: "set_main" }
    ],
    pagination: [
      { param: "page", type: "integer", default: "1", description: "Page number (1-indexed)" },
      { param: "limit", type: "integer", default: "20", description: "Items per page (max 100)" },
      { param: "sort", type: "string", default: "-created_at", description: "Field to sort by; prefix with '-' for descending" },
      { param: "search", type: "string", default: "null", description: "Search query string across relevant columns" }
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
          code: "PLAN_LIMIT_EXCEEDED",
          message: "Maximum doctor capacity reached for your active plan (limit: 5). Please upgrade your subscription or request an add-on.",
          details: { limit: 5, current_usage: 5, resource: "doctors" }
        }
      }
    }
  },

  roles: [
    { name: "super_admin", badge: "danger", description: "Full root access across all tenant databases, server hardware telemetry, plans, and offline billing approvals" },
    { name: "support_admin", badge: "warning", description: "Platform technical support. Onboards clinics, handles support tickets, and troubleshoots tenant issues" },
    { name: "finance_admin", badge: "secondary", description: "Platform accountant. Reviews subscription payments, manages plan pricing, and inspects MRR/ARR analytics" },
    { name: "admin", badge: "danger", description: "Full administrative management within the clinic tenant" },
    { name: "clinic_manager", badge: "warning", description: "Full management across branches, doctors, staff, inventory, and billing within the tenant" },
    { name: "doctor", badge: "primary", description: "Own schedule, assigned appointments, consultations, prescriptions authored" },
    { name: "nurse", badge: "info", description: "Patient vitals, appointment check-in, read-only medical records, and medical consumable inventory adjustments" },
    { name: "receptionist", badge: "success", description: "Front-desk operations, reservations management, camera QR check-in, and invoice payments" },
    { name: "accountant", badge: "secondary", description: "Invoices, payments, refunds, clinic expenses, and financial reports" },
    { name: "patient", badge: "dark", description: "Public guest booking, personal appointment QR tickets, prescription history, and invoice settlement" }
  ],

  models: {
    Tenant: {
      description: "Central SaaS tenant clinic registration and database routing entity",
      fields: [
        { name: "id", type: "string", notes: "Tenant slug/identifier (e.g. elshifa)" },
        { name: "tenancy_db_name", type: "string", notes: "Isolated database name (e.g. tenant_elshifa)" },
        { name: "status", type: "string", notes: "active | trial | suspended | paused" },
        { name: "plan_id", type: "string", notes: "pln_ prefix" },
        { name: "subscription_expires_at", type: "string (ISO 8601)", notes: "Expiration timestamp" },
        { name: "max_doctors", type: "integer", notes: "Base plan doctor limit" },
        { name: "max_branches", type: "integer", notes: "Base plan branch limit" },
        { name: "max_specialties", type: "integer", notes: "Base plan specialty limit" },
        { name: "max_staff", type: "integer", notes: "Base plan staff limit" },
        { name: "extra_doctors", type: "integer", notes: "Approved doctor add-on capacity" },
        { name: "extra_branches", type: "integer", notes: "Approved branch add-on capacity" },
        { name: "extra_staff", type: "integer", notes: "Approved staff add-on capacity" },
        { name: "domains", type: "array", notes: "Bound domain names" }
      ],
      sample: {
        id: "elshifa",
        tenancy_db_name: "tenant_elshifa",
        status: "active",
        plan_id: "pln_growth",
        subscription_expires_at: "2027-08-30T00:00:00Z",
        max_doctors: 10,
        max_branches: 3,
        max_specialties: 8,
        max_staff: 15,
        extra_doctors: 2,
        extra_branches: 0,
        extra_staff: 5,
        domains: [{ domain: "elshifa.delta-clinics.com" }]
      }
    },

    Plan: {
      description: "Central SaaS subscription plan tier with resource limits and add-on pricing",
      fields: [
        { name: "id", type: "string", notes: "pln_ prefix" },
        { name: "name", type: "string", notes: "Tier name (e.g. Growth Plan)" },
        { name: "slug", type: "string", notes: "URL-friendly slug" },
        { name: "price", type: "number", notes: "Monthly billing price" },
        { name: "price_before_discount", type: "number | null", notes: "Original price for strikethrough display" },
        { name: "is_featured", type: "boolean", notes: "Highlighted pricing card badge" },
        { name: "billing_cycle", type: "string", notes: "monthly | yearly" },
        { name: "max_doctors", type: "integer", notes: "Doctor seat limit" },
        { name: "max_branches", type: "integer", notes: "Branch locations limit" },
        { name: "max_specialties", type: "integer", notes: "Specialties catalog limit" },
        { name: "max_staff", type: "integer", notes: "Staff accounts limit" },
        { name: "extra_doctor_price", type: "number", notes: "Add-on fee per extra doctor" },
        { name: "extra_branch_price", type: "number", notes: "Add-on fee per extra branch" },
        { name: "extra_staff_price", type: "number", notes: "Add-on fee per extra staff" },
        { name: "features", type: "string[]", notes: "List of plan capabilities" },
        { name: "is_trial", type: "boolean", notes: "Whether plan is a free trial" },
        { name: "trial_days", type: "integer", notes: "Trial duration in days" },
        { name: "status", type: "string", notes: "active | inactive" }
      ],
      sample: {
        id: "pln_growth",
        name: "Growth Plan",
        slug: "growth",
        price: 1200,
        price_before_discount: 1500,
        is_featured: true,
        billing_cycle: "monthly",
        max_doctors: 10,
        max_branches: 3,
        max_specialties: 8,
        max_staff: 15,
        extra_doctor_price: 100,
        extra_branch_price: 300,
        extra_staff_price: 50,
        features: ["Unlimited Patient Records", "Full EMR & Prescriptions", "QR Camera Check-in", "Billing & Invoicing", "Medical Inventory", "Real-Time WebSockets"],
        is_trial: false,
        trial_days: 0,
        status: "active"
      }
    },

    SubscriptionRequest: {
      description: "Offline subscription payment receipt submitted by a clinic for manual review",
      fields: [
        { name: "id", type: "string", notes: "sub_ prefix" },
        { name: "tenant_id", type: "string", notes: "Tenant ID" },
        { name: "plan_id", type: "string", notes: "Requested Plan ID" },
        { name: "type", type: "string", notes: "plan_upgrade | plan_renewal | addon_doctor | addon_branch | addon_staff" },
        { name: "quantity", type: "integer", notes: "Addon quantity (1 for plan renewals)" },
        { name: "amount", type: "number", notes: "Total amount paid" },
        { name: "payment_method", type: "string", notes: "instapay | vodafone_cash | bank_transfer | manual" },
        { name: "transaction_reference", type: "string", notes: "Bank or wallet reference number" },
        { name: "receipt_url", type: "string", notes: "Uploaded receipt file/image URL" },
        { name: "status", type: "string", notes: "pending | approved | rejected" },
        { name: "notes", type: "string | null", notes: "Clinic notes" },
        { name: "admin_notes", type: "string | null", notes: "Super admin review feedback" },
        { name: "processed_by", type: "string | null", notes: "Reviewing Super Admin ID" },
        { name: "processed_at", type: "string (ISO 8601) | null", notes: "Approval timestamp" }
      ],
      sample: {
        id: "sub_8b1a44",
        tenant_id: "elshifa",
        plan_id: "pln_growth",
        type: "plan_upgrade",
        quantity: 1,
        amount: 1200,
        payment_method: "instapay",
        transaction_reference: "INSTA-992144810",
        receipt_url: "https://storage.delta-clinics.com/receipts/rec_81239.jpg",
        status: "pending",
        notes: "Paid via Instapay on 01/09/2026",
        admin_notes: null,
        processed_by: null,
        processed_at: null
      }
    },

    SupportTicket: {
      description: "Two-way support desk ticket between Clinic Admins and System Admins",
      fields: [
        { name: "id", type: "string", notes: "tik_ prefix" },
        { name: "tenant_id", type: "string", notes: "Originating Tenant ID" },
        { name: "user_id", type: "string", notes: "Submitting User ID" },
        { name: "subject", type: "string", notes: "Ticket subject" },
        { name: "status", type: "string", notes: "open | pending | in_progress | resolved | closed" },
        { name: "priority", type: "string", notes: "low | medium | high | urgent" },
        { name: "last_message_at", type: "string (ISO 8601)", notes: "Last interaction timestamp" }
      ],
      sample: {
        id: "tik_9a4f22",
        tenant_id: "elshifa",
        user_id: "usr_d4e5f6",
        subject: "Thermal printer margin adjustment",
        status: "in_progress",
        priority: "high",
        last_message_at: "2026-09-01T14:22:00Z"
      }
    },

    TenantSetting: {
      description: "Tenant branding, logos, dynamic colors, and medical theme presets",
      fields: [
        { name: "id", type: "string", notes: "set_main" },
        { name: "tenant_name", type: "string", notes: "Clinic display name" },
        { name: "logo_url", type: "string | null", notes: "Clinic brand logo" },
        { name: "phone", type: "string", notes: "Contact phone" },
        { name: "email", type: "string", notes: "Contact email" },
        { name: "address", type: "string", notes: "Main headquarters address" },
        { name: "timezone", type: "string", notes: "Timezone (e.g. Africa/Cairo)" },
        { name: "currency", type: "string", notes: "Currency code (e.g. EGP)" },
        { name: "primary_color", type: "string", notes: "Primary brand hex code" },
        { name: "secondary_color", type: "string", notes: "Secondary brand hex code" },
        { name: "accent_color", type: "string", notes: "Accent brand hex code" },
        { name: "accent_soft_color", type: "string", notes: "Soft accent background hex code" },
        { name: "bg_color", type: "string", notes: "Body background hex code" },
        { name: "card_bg_color", type: "string", notes: "Card surface hex code" },
        { name: "theme_preset_id", type: "string", notes: "emerald | sapphire | cyan | teal | violet | ruby | custom" }
      ],
      sample: {
        id: "set_main",
        tenant_name: "El Shifa Specialized Clinics",
        logo_url: "https://storage.delta-clinics.com/tenants/elshifa/logo.png",
        phone: "+20224567890",
        email: "info@elshifa.com",
        address: "15 Abbas El Akkad, Nasr City, Cairo",
        timezone: "Africa/Cairo",
        currency: "EGP",
        primary_color: "#059669",
        secondary_color: "#047857",
        accent_color: "#10b981",
        accent_soft_color: "#d1fae5",
        bg_color: "#f8fafc",
        card_bg_color: "#ffffff",
        theme_preset_id: "emerald"
      }
    },

    Reservation: {
      description: "Appointment booking linking patient, doctor, branch, and time slot with QR check-in",
      fields: [
        { name: "id", type: "string", notes: "res_ prefix" },
        { name: "patient_id", type: "string", notes: "Patient User ID" },
        { name: "doctor_id", type: "string", notes: "Doctor ID" },
        { name: "clinic_id", type: "string", notes: "Branch Clinic ID" },
        { name: "time_slot_id", type: "string", notes: "Time Slot ID" },
        { name: "reservation_date", type: "string (date)", notes: "YYYY-MM-DD" },
        { name: "status", type: "string", notes: "pending | accepted | confirmed | completed | cancelled" },
        { name: "reservation_type", type: "string", notes: "consultation | follow_up | procedure | emergency" },
        { name: "notes", type: "string | null", notes: "Clinical visit notes" },
        { name: "qr_code_token", type: "string", notes: "Secure check-in token for receptionist scanner" }
      ],
      sample: {
        id: "res_5e2b18",
        patient_id: "usr_pat_7c3f21",
        doctor_id: "doc_9f1a20",
        clinic_id: "cli_a1b2c3",
        time_slot_id: "slot_8c2d15",
        reservation_date: "2026-09-10",
        status: "confirmed",
        reservation_type: "consultation",
        notes: "Dermatology initial consultation",
        qr_code_token: "qr_tok_9b2e8a11cf8842"
      }
    },

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
        { name: "status", type: "string", notes: "active | archived" }
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
        status: "active"
      }
    },

    Doctor: {
      description: "Medical practitioner profile linked to staff account and specialty",
      fields: [
        { name: "id", type: "string", notes: "doc_ prefix" },
        { name: "user_id", type: "string", notes: "Linked staff user account ID" },
        { name: "full_name", type: "string", notes: "Doctor full name" },
        { name: "specialty_id", type: "string", notes: "Specialty ID (spec_ prefix)" },
        { name: "license_number", type: "string", notes: "Unique medical license ID" },
        { name: "bio", type: "string | null", notes: "Professional bio" },
        { name: "status", type: "string", notes: "active | on_leave | inactive" }
      ],
      sample: {
        id: "doc_9f1a20",
        user_id: "usr_d4e5f6",
        full_name: "Dr. Ahmed Hassan",
        specialty_id: "spec_3b7a11",
        license_number: "MED-EG-2018-4421",
        bio: "Consultant Dermatologist with 12+ years experience.",
        status: "active"
      }
    },

    Invoice: {
      description: "Billing invoice with multi-item calculations and payment tracking",
      fields: [
        { name: "id", type: "string", notes: "inv_ prefix" },
        { name: "patient_id", type: "string", notes: "Target patient user ID" },
        { name: "appointment_id", type: "string | null", notes: "Linked appointment" },
        { name: "clinic_id", type: "string", notes: "Branch clinic ID" },
        { name: "subtotal", type: "number", notes: "Gross items sum" },
        { name: "discount", type: "number", notes: "Applied discount" },
        { name: "tax", type: "number", notes: "Applied tax" },
        { name: "total", type: "number", notes: "Net total (subtotal - discount + tax)" },
        { name: "amount_paid", type: "number", notes: "Total amount collected" },
        { name: "balance_due", type: "number", notes: "Remaining balance" },
        { name: "status", type: "string", notes: "draft | issued | partially_paid | paid | void | cancelled" },
        { name: "due_at", type: "string (date)", notes: "Payment due date" }
      ],
      sample: {
        id: "inv_2f7e11",
        patient_id: "pat_7c3f21",
        appointment_id: "res_5e2b18",
        clinic_id: "cli_a1b2c3",
        subtotal: 450,
        discount: 50,
        tax: 0,
        total: 400,
        amount_paid: 400,
        balance_due: 0,
        status: "paid",
        due_at: "2026-09-10"
      }
    },

    InventoryItem: {
      description: "Medical supply item with stock tracking and reorder threshold",
      fields: [
        { name: "id", type: "string", notes: "itm_ prefix" },
        { name: "name", type: "string", notes: "Item name" },
        { name: "sku", type: "string", notes: "Unique SKU identifier" },
        { name: "quantity", type: "integer", notes: "Current quantity on hand" },
        { name: "reorder_level", type: "integer", notes: "Threshold triggering low-stock alert" },
        { name: "unit_price", type: "number", notes: "Cost per unit" },
        { name: "status", type: "string", notes: "active | discontinued" }
      ],
      sample: {
        id: "itm_1a9c77",
        name: "Sterile Gauze Pads 10x10",
        sku: "MED-GZ-100",
        quantity: 120,
        reorder_level: 25,
        unit_price: 15.50,
        status: "active"
      }
    }
  },

  modules: [
    {
      id: "central-auth",
      title: "Central Admin Authentication",
      icon: "shield-alt",
      description: "Platform Super Admin login, token lifecycle, and session identity",
      endpoints: [
        {
          id: "central-auth-login",
          method: "POST",
          path: "/v1/admin/auth/login",
          title: "Super Admin Login",
          roles: ["public"],
          description: "Authenticates a platform system administrator, returning central Sanctum bearer tokens.",
          parameters: [],
          requestBody: {
            email: "superadmin@delta-clinics.com",
            password: "password123"
          },
          responses: [
            {
              code: 200,
              description: "Login successful",
              body: {
                success: true,
                data: {
                  access_token: "1|admin_token_hash",
                  expires_in: 900,
                  user: {
                    id: "usr_superadmin",
                    full_name: "Platform Super Admin",
                    email: "superadmin@delta-clinics.com",
                    role: "super_admin"
                  }
                }
              }
            },
            {
              code: 422,
              description: "Validation error / invalid credentials",
              body: {
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Invalid credentials provided.",
                  details: { email: ["These credentials do not match our records."] }
                }
              }
            }
          ]
        },
        {
          id: "central-auth-me",
          method: "GET",
          path: "/v1/admin/auth/me",
          title: "Current Admin Profile",
          roles: ["super_admin", "support_admin", "finance_admin"],
          description: "Returns currently authenticated system admin user profile and central permissions.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Admin profile returned",
              body: {
                success: true,
                data: {
                  id: "usr_superadmin",
                  full_name: "Platform Super Admin",
                  email: "superadmin@delta-clinics.com",
                  role: "super_admin",
                  permissions: ["plans:*", "subscriptions:*", "server:*", "support:*"]
                }
              }
            }
          ]
        },
        {
          id: "central-auth-logout",
          method: "POST",
          path: "/v1/admin/auth/logout",
          title: "Super Admin Logout",
          roles: ["super_admin", "support_admin", "finance_admin"],
          description: "Revokes current administrator access token.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Logged out",
              body: { success: true, data: { message: "Logged out successfully." } }
            }
          ]
        }
      ]
    },

    {
      id: "central-clinics",
      title: "Tenant Provisioning & Clinics",
      icon: "hospital",
      description: "Provision new clinic tenants, spawn isolated databases, manage domains, and monitor subscribers",
      endpoints: [
        {
          id: "central-clinics-check-availability",
          method: "GET",
          path: "/v1/clinics/check-availability/{slug}",
          title: "Check Subdomain Availability",
          roles: ["public"],
          description: "Checks if a requested clinic subdomain or slug is available for onboarding.",
          parameters: [
            { name: "slug", in: "path", required: true, type: "string", description: "Subdomain slug (e.g. elshifa)" }
          ],
          responses: [
            {
              code: 200,
              description: "Availability status",
              body: { success: true, data: { slug: "elshifa", is_available: true } }
            }
          ]
        },
        {
          id: "central-clinics-list",
          method: "GET",
          path: "/v1/clinics",
          title: "List All Tenant Clinics",
          roles: ["super_admin", "support_admin"],
          description: "Lists all tenant clinics registered on the SaaS platform with plan and database metrics.",
          parameters: [
            { name: "status", in: "query", required: false, type: "string", description: "Filter by status: active, trial, suspended" },
            { name: "page", in: "query", required: false, type: "integer", description: "Page number" }
          ],
          responses: [
            {
              code: 200,
              description: "Clinics list",
              body: {
                success: true,
                data: [
                  {
                    id: "elshifa",
                    name: "El Shifa Specialized Clinics",
                    status: "active",
                    plan_id: "pln_growth",
                    subscription_expires_at: "2027-08-30T00:00:00Z",
                    domains: [{ domain: "elshifa.delta-clinics.com" }],
                    created_at: "2026-01-15T08:00:00Z"
                  }
                ],
                meta: { page: 1, limit: 20, total: 1, total_pages: 1 }
              }
            }
          ]
        },
        {
          id: "central-clinics-create",
          method: "POST",
          path: "/v1/clinics",
          title: "Provision New Clinic Tenant",
          roles: ["super_admin", "support_admin"],
          description: "Creates a new clinic tenant, automatically initializes its isolated database, runs migrations, and seeds the initial admin account.",
          parameters: [],
          requestBody: {
            id: "elshifa",
            name: "El Shifa Specialized Clinics",
            plan_id: "pln_growth",
            domain: "elshifa.delta-clinics.com",
            admin_name: "Dr. Tarek Hegazi",
            admin_email: "admin@elshifa.com",
            admin_phone: "+201099887766",
            admin_password: "ClinicAdminPassword123!",
            trial_days: 14
          },
          responses: [
            {
              code: 201,
              description: "Clinic tenant provisioned",
              body: {
                success: true,
                data: {
                  id: "elshifa",
                  name: "El Shifa Specialized Clinics",
                  tenancy_db_name: "tenant_elshifa",
                  status: "trial",
                  domain: "elshifa.delta-clinics.com"
                }
              }
            }
          ]
        },
        {
          id: "central-clinics-update",
          method: "PATCH",
          path: "/v1/clinics/{id}",
          title: "Update Clinic Tenant",
          roles: ["super_admin"],
          description: "Updates tenant metadata, status (active/suspended/paused), or domain bindings.",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Tenant slug (e.g. elshifa)" }
          ],
          requestBody: {
            status: "suspended",
            name: "El Shifa Medical Center"
          },
          responses: [
            {
              code: 200,
              description: "Clinic updated",
              body: { success: true, data: { id: "elshifa", status: "suspended" } }
            }
          ]
        },
        {
          id: "central-clinics-delete",
          method: "DELETE",
          path: "/v1/clinics/{id}",
          title: "Delete / Drop Clinic Tenant",
          roles: ["super_admin"],
          description: "Decommissions a clinic tenant and drops its isolated tenant database.",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Tenant slug" }
          ],
          responses: [
            {
              code: 200,
              description: "Tenant dropped",
              body: { success: true, data: { message: "Tenant and database deleted successfully." } }
            }
          ]
        }
      ]
    },

    {
      id: "plans",
      title: "Subscription Plans & MRR Analytics",
      icon: "tags",
      description: "Manage subscription tiers, feature limits, add-on pricing, and inspect real-time MRR analytics",
      endpoints: [
        {
          id: "plans-list",
          method: "GET",
          path: "/v1/plans",
          title: "List All Subscription Plans",
          roles: ["public", "super_admin"],
          description: "Lists all SaaS subscription plans with feature limits, trial settings, and addon prices.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Plans list",
              body: {
                success: true,
                data: [
                  {
                    id: "pln_growth",
                    name: "Growth Plan",
                    slug: "growth",
                    price: 1200,
                    price_before_discount: 1500,
                    is_featured: true,
                    billing_cycle: "monthly",
                    max_doctors: 10,
                    max_branches: 3,
                    max_specialties: 8,
                    max_staff: 15,
                    extra_doctor_price: 100,
                    extra_branch_price: 300,
                    extra_staff_price: 50,
                    features: ["Unlimited Patient Records", "Full EMR", "Billing", "Inventory", "QR Check-in"],
                    is_trial: false,
                    trial_days: 0,
                    status: "active"
                  }
                ]
              }
            }
          ]
        },
        {
          id: "plans-create",
          method: "POST",
          path: "/v1/plans",
          title: "Create Subscription Plan",
          roles: ["super_admin"],
          description: "Creates a new subscription plan tier with resource limits and addon pricing.",
          parameters: [],
          requestBody: {
            name: "Enterprise Tier",
            slug: "enterprise",
            price: 2500,
            price_before_discount: 3000,
            is_featured: true,
            billing_cycle: "monthly",
            max_doctors: 30,
            max_branches: 10,
            max_specialties: 20,
            max_staff: 50,
            extra_doctor_price: 80,
            extra_branch_price: 250,
            extra_staff_price: 40,
            features: ["Custom Domain", "Dedicated Database Backup", "24/7 SLA Support", "Full Telemetry"],
            is_trial: false,
            trial_days: 0,
            status: "active"
          },
          responses: [
            {
              code: 201,
              description: "Plan created",
              body: { success: true, data: { id: "pln_enterprise", name: "Enterprise Tier", price: 2500 } }
            }
          ]
        },
        {
          id: "plans-get-analytics",
          method: "GET",
          path: "/v1/plans/{id}",
          title: "Get Plan & Real-Time Analytics",
          roles: ["super_admin"],
          description: "Retrieves a subscription plan along with live subscriber count and estimated MRR generated.",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Plan ID (pln_...)" }
          ],
          responses: [
            {
              code: 200,
              description: "Plan details with analytics",
              body: {
                success: true,
                data: {
                  id: "pln_growth",
                  name: "Growth Plan",
                  price: 1200,
                  analytics: {
                    total_subscribers: 42,
                    active_subscribers: 38,
                    trial_subscribers: 4,
                    estimated_mrr: 45600,
                    total_revenue_generated: 547200
                  }
                }
              }
            }
          ]
        }
      ]
    },

    {
      id: "subscriptions",
      title: "Offline Receipts & Plan Approvals",
      icon: "file-invoice-dollar",
      description: "Manage offline subscription receipts (Instapay, Vodafone Cash, Bank Transfer) and manual plan approvals",
      endpoints: [
        {
          id: "subscriptions-list",
          method: "GET",
          path: "/v1/subscription-requests",
          title: "List All Payment Requests",
          roles: ["super_admin", "finance_admin"],
          description: "Lists all offline subscription renewal and upgrade receipt submissions.",
          parameters: [
            { name: "status", in: "query", required: false, type: "string", description: "pending | approved | rejected" },
            { name: "tenant_id", in: "query", required: false, type: "string", description: "Filter by clinic tenant" }
          ],
          responses: [
            {
              code: 200,
              description: "Requests list",
              body: {
                success: true,
                data: [
                  {
                    id: "sub_8b1a44",
                    tenant_id: "elshifa",
                    plan_id: "pln_growth",
                    type: "plan_upgrade",
                    amount: 1200,
                    payment_method: "instapay",
                    transaction_reference: "INSTA-992144810",
                    receipt_url: "https://storage.delta-clinics.com/receipts/rec_81239.jpg",
                    status: "pending",
                    created_at: "2026-09-01T12:00:00Z"
                  }
                ]
              }
            }
          ]
        },
        {
          id: "subscriptions-approve",
          method: "PATCH",
          path: "/v1/subscription-requests/{id}/approve",
          title: "Approve Payment & Activate Plan",
          roles: ["super_admin", "finance_admin"],
          description: "Approves receipt, atomically updates tenant plan ID, disables trial mode, extends expiry date, and syncs resource limits.",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Subscription request ID" }
          ],
          requestBody: {
            admin_notes: "Instapay transaction verified against bank account."
          },
          responses: [
            {
              code: 200,
              description: "Receipt approved and plan upgraded",
              body: {
                success: true,
                data: {
                  id: "sub_8b1a44",
                  status: "approved",
                  processed_at: "2026-09-01T12:30:00Z",
                  tenant: {
                    id: "elshifa",
                    plan_id: "pln_growth",
                    status: "active",
                    subscription_expires_at: "2027-09-01T00:00:00Z"
                  }
                }
              }
            }
          ]
        },
        {
          id: "subscriptions-reject",
          method: "PATCH",
          path: "/v1/subscription-requests/{id}/reject",
          title: "Reject Payment Receipt",
          roles: ["super_admin", "finance_admin"],
          description: "Rejects invalid offline payment receipt with administrative feedback.",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Subscription request ID" }
          ],
          requestBody: {
            admin_notes: "Transaction reference was not found in bank statement. Please re-upload."
          },
          responses: [
            {
              code: 200,
              description: "Receipt rejected",
              body: { success: true, data: { id: "sub_8b1a44", status: "rejected" } }
            }
          ]
        }
      ]
    },

    {
      id: "support-tickets",
      title: "Support Desk & Real-Time Chat",
      icon: "headset",
      description: "Two-way support ticketing system between Clinic Managers and System Support with internal admin notes and WebSockets",
      endpoints: [
        {
          id: "support-tickets-list",
          method: "GET",
          path: "/v1/support-tickets",
          title: "List Support Tickets",
          roles: ["super_admin", "support_admin"],
          description: "Lists all support tickets across all clinics with priority and status filters.",
          parameters: [
            { name: "status", in: "query", required: false, type: "string", description: "open, in_progress, resolved, closed" },
            { name: "priority", in: "query", required: false, type: "string", description: "low, medium, high, urgent" }
          ],
          responses: [
            {
              code: 200,
              description: "Tickets list",
              body: {
                success: true,
                data: [
                  {
                    id: "tik_9a4f22",
                    tenant_id: "elshifa",
                    subject: "Printer alignment issue on branch 2",
                    status: "in_progress",
                    priority: "high",
                    last_message_at: "2026-09-01T14:22:00Z"
                  }
                ]
              }
            }
          ]
        },
        {
          id: "support-tickets-reply",
          method: "POST",
          path: "/v1/support-tickets/{id}/messages",
          title: "Send Reply / Internal Note",
          roles: ["super_admin", "support_admin"],
          description: "Sends a reply message on the ticket. Supports file attachments and private internal notes visible only to System Admins.",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Support ticket ID" }
          ],
          requestBody: {
            message: "We have updated the thermal printer configuration template for your clinic.",
            is_internal: false,
            attachment: null
          },
          responses: [
            {
              code: 201,
              description: "Message sent and broadcasted",
              body: {
                success: true,
                data: {
                  id: "msg_1b8e77",
                  support_ticket_id: "tik_9a4f22",
                  sender_type: "system_admin",
                  sender_name: "Sarah Mansour",
                  message: "We have updated the thermal printer configuration template for your clinic.",
                  is_internal: false,
                  created_at: "2026-09-01T14:25:00Z"
                }
              }
            }
          ]
        }
      ]
    },

    {
      id: "executive-reports",
      title: "Executive Analytics & Health Telemetry",
      icon: "chart-line",
      description: "Platform-level executive KPIs: MRR, ARR, ARPU, Logo Churn, Clinic Health Scoring, and Churn Risk Telemetry",
      endpoints: [
        {
          id: "reports-executive-dashboard",
          method: "GET",
          path: "/v1/reports/executive-dashboard",
          title: "Executive SaaS Dashboard",
          roles: ["super_admin", "finance_admin"],
          description: "Calculates real-time MRR (Base Plan + Addons), ARR, ARPU, active subscriber counts, and logo churn rate.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Executive metrics",
              body: {
                success: true,
                data: {
                  mrr: 185400,
                  arr: 2224800,
                  arpu: 1287.50,
                  active_clinics: 144,
                  logo_churn_rate_percent: 1.4,
                  plan_distribution: { starter: 45, growth: 72, enterprise: 27 }
                }
              }
            }
          ]
        },
        {
          id: "reports-tenant-health",
          method: "GET",
          path: "/v1/reports/tenant-health",
          title: "Tenant Health & Churn Risk Telemetry",
          roles: ["super_admin"],
          description: "Calculates 0-100 health scores, risk tiering (healthy, at_risk, critical), and automated upsell triggers.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Tenant health scores",
              body: {
                success: true,
                data: [
                  {
                    tenant_id: "elshifa",
                    tenant_name: "El Shifa Specialized Clinics",
                    health_score: 94,
                    risk_tier: "healthy",
                    utilization: { doctors_used: 8, doctors_limit: 10, utilization_percent: 80.0 },
                    reservations_30d: 340,
                    open_tickets: 0,
                    upsell_recommendations: []
                  }
                ]
              }
            }
          ]
        }
      ]
    },

    {
      id: "server-health",
      title: "Server Infrastructure Telemetry",
      icon: "server",
      description: "Hardware telemetry, CPU/RAM/Disk metrics, MySQL database breakdown, daemon monitoring, and cache tools",
      endpoints: [
        {
          id: "server-health-metrics",
          method: "GET",
          path: "/v1/server/health",
          title: "Real-Time Hardware Metrics",
          roles: ["super_admin"],
          description: "Inspects server CPU %, load averages (1/5/15m), RAM consumption, and Disk storage usage.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Server hardware metrics",
              body: {
                success: true,
                data: {
                  cpu: { usage_percent: 14.5, cores: 8, load_avg_1m: 0.35, load_avg_5m: 0.42, load_avg_15m: 0.40 },
                  memory: { total_mb: 32768, used_mb: 12450, free_mb: 20318, usage_percent: 38.0 },
                  disk: { total_gb: 512, used_gb: 128, free_gb: 384, usage_percent: 25.0 }
                }
              }
            }
          ]
        },
        {
          id: "server-services",
          method: "GET",
          path: "/v1/server/services",
          title: "Infrastructure Services Status",
          roles: ["super_admin"],
          description: "Checks running daemon health for Nginx, MySQL, Redis, Octane FrankenPHP, and background Queue workers.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Services status",
              body: {
                success: true,
                data: {
                  nginx: "running",
                  mysql: "running",
                  redis: "running",
                  octane: "running",
                  queue_workers: "running"
                }
              }
            }
          ]
        },
        {
          id: "server-databases",
          method: "GET",
          path: "/v1/server/databases",
          title: "Tenant Databases Telemetry",
          roles: ["super_admin"],
          description: "Lists all MySQL databases (Central + all Tenant databases) with row counts and disk sizes in MB.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Databases list",
              body: {
                success: true,
                data: [
                  { database: "delta_clinics_central", tables_count: 24, size_mb: 48.2 },
                  { database: "tenant_elshifa", tables_count: 28, size_mb: 112.5 }
                ]
              }
            }
          ]
        },
        {
          id: "server-cache-clear",
          method: "POST",
          path: "/v1/server/cache/clear",
          title: "Purge Server & App Cache",
          roles: ["super_admin"],
          description: "Purges framework configuration, route, view, and application caches.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Cache cleared",
              body: { success: true, data: { message: "All application caches purged successfully." } }
            }
          ]
        }
      ]
    },

    {
      id: "public-booking",
      title: "Public Guest Booking & QR Tickets",
      icon: "qrcode",
      description: "Public branch locator with geolocation filtering, doctor roster, available slot finder, and instant QR ticket booking",
      endpoints: [
        {
          id: "public-clinics-list",
          method: "GET",
          path: "/api/v1/public/clinics",
          title: "Find Nearby Branches",
          roles: ["public"],
          description: "Lists clinic branches with optional Haversine geolocation proximity radius filtering.",
          parameters: [
            { name: "latitude", in: "query", required: false, type: "number", description: "Patient latitude (e.g. 30.0444)" },
            { name: "longitude", in: "query", required: false, type: "number", description: "Patient longitude (e.g. 31.2357)" },
            { name: "radius_km", in: "query", required: false, type: "number", description: "Radius in kilometers (e.g. 15)" }
          ],
          responses: [
            {
              code: 200,
              description: "Branches list with distance",
              body: {
                success: true,
                data: [
                  {
                    id: "cli_nasr_city",
                    name: "Nasr City Main Branch",
                    phone: "+20224567890",
                    address: "15 Abbas El Akkad, Cairo",
                    latitude: 30.0588,
                    longitude: 31.3412,
                    distance_km: 2.4
                  }
                ]
              }
            }
          ]
        },
        {
          id: "public-time-slots",
          method: "GET",
          path: "/api/v1/public/time-slots",
          title: "Find Available Time Slots",
          roles: ["public"],
          description: "Finds open, unbooked appointment slots for a specific doctor, branch, and date.",
          parameters: [
            { name: "doctor_id", in: "query", required: true, type: "string", description: "Doctor ID (doc_...)" },
            { name: "clinic_id", in: "query", required: true, type: "string", description: "Branch Clinic ID (cli_...)" },
            { name: "date", in: "query", required: true, type: "string", description: "Date YYYY-MM-DD" }
          ],
          responses: [
            {
              code: 200,
              description: "Available slots",
              body: {
                success: true,
                data: [
                  { id: "slot_101", start_time: "10:00", end_time: "10:30", status: "available" },
                  { id: "slot_102", start_time: "10:30", end_time: "11:00", status: "available" }
                ]
              }
            }
          ]
        },
        {
          id: "public-reservations-book",
          method: "POST",
          path: "/api/v1/public/reservations",
          title: "Guest Patient Booking",
          roles: ["public"],
          description: "Submits guest patient booking, automatically creates/links patient profile, locks slot, and generates printable QR check-in ticket.",
          parameters: [],
          requestBody: {
            full_name: "Mohamed Ibrahim",
            national_id: "29010150102345",
            phone: "+201023456789",
            email: "mohamed.ibrahim@example.com",
            gender: "male",
            date_of_birth: "1990-10-15",
            doctor_id: "doc_9f1a20",
            clinic_id: "cli_a1b2c3",
            time_slot_id: "slot_8c2d15",
            reservation_date: "2026-09-10",
            reservation_type: "consultation",
            notes: "First visit for general dermatology checkup."
          },
          responses: [
            {
              code: 201,
              description: "Booking confirmed with QR payload",
              body: {
                success: true,
                data: {
                  id: "res_5e2b18",
                  status: "pending",
                  reservation_date: "2026-09-10",
                  doctor_name: "Dr. Ahmed Hassan",
                  clinic_name: "Nasr City Branch",
                  time_slot: "10:30 - 11:00",
                  qr_code_token: "qr_tok_9b2e8a11cf8842",
                  qr_ticket_payload: "https://elshifa.delta-clinics.com/ticket/res_5e2b18?token=qr_tok_9b2e8a11cf8842"
                }
              }
            }
          ]
        }
      ]
    },

    {
      id: "tenant-settings",
      title: "Clinic Branding & Theming",
      icon: "palette",
      description: "Manage clinic brand identity, logo, 6 medical color presets (Emerald, Sapphire, Cyan, Teal, Violet, Ruby) and custom tokens",
      endpoints: [
        {
          id: "tenant-settings-get",
          method: "GET",
          path: "/api/v1/settings",
          title: "Get Clinic Branding Settings",
          roles: ["public", "admin", "clinic_manager"],
          description: "Retrieves clinic branding colors, logo URL, contact details, timezone, and currency.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Settings returned",
              body: {
                success: true,
                data: {
                  tenant_name: "El Shifa Specialized Clinics",
                  logo_url: "https://storage.delta-clinics.com/tenants/elshifa/logo.png",
                  phone: "+20224567890",
                  email: "info@elshifa.com",
                  address: "15 Abbas El Akkad, Nasr City, Cairo",
                  timezone: "Africa/Cairo",
                  currency: "EGP",
                  primary_color: "#059669",
                  secondary_color: "#047857",
                  accent_color: "#10b981",
                  accent_soft_color: "#d1fae5",
                  bg_color: "#f8fafc",
                  card_bg_color: "#ffffff",
                  theme_preset_id: "emerald"
                }
              }
            }
          ]
        },
        {
          id: "tenant-settings-update",
          method: "PATCH",
          path: "/api/v1/settings",
          title: "Update Branding & Theme Presets",
          roles: ["admin", "clinic_manager"],
          description: "Updates theme colors, theme preset (emerald, sapphire, cyan, teal, violet, ruby), and clinic identity.",
          parameters: [],
          requestBody: {
            tenant_name: "El Shifa Specialized Clinics",
            theme_preset_id: "sapphire",
            primary_color: "#2563eb",
            secondary_color: "#1d4ed8",
            accent_color: "#3b82f6",
            accent_soft_color: "#dbeafe"
          },
          responses: [
            {
              code: 200,
              description: "Settings updated",
              body: { success: true, data: { theme_preset_id: "sapphire", primary_color: "#2563eb" } }
            }
          ]
        }
      ]
    },

    {
      id: "doctors",
      title: "Doctors, Specialties & Schedules",
      icon: "user-md",
      description: "Manage medical specialties, doctor profiles, multi-branch practice pricing, and weekly shift schedules",
      endpoints: [
        {
          id: "specialties-list",
          method: "GET",
          path: "/api/v1/specialties",
          title: "List Medical Specialties",
          roles: ["public", "admin", "clinic_manager", "doctor", "receptionist"],
          description: "Lists all medical specialties with active practicing doctor counts.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Specialties list",
              body: {
                success: true,
                data: [
                  { id: "spec_3b7a11", name: "Dermatology", description: "Skin and aesthetic care", active_doctors_count: 4 }
                ]
              }
            }
          ]
        },
        {
          id: "doctors-list",
          method: "GET",
          path: "/api/v1/doctors",
          title: "List Doctors Roster",
          roles: ["public", "admin", "clinic_manager", "doctor", "receptionist", "nurse"],
          description: "Lists all doctor profiles with assigned specialties and branch pricing.",
          parameters: [
            { name: "specialty_id", in: "query", required: false, type: "string", description: "Filter by specialty" },
            { name: "clinic_id", in: "query", required: false, type: "string", description: "Filter by branch location" }
          ],
          responses: [
            {
              code: 200,
              description: "Doctors list",
              body: {
                success: true,
                data: [
                  {
                    id: "doc_9f1a20",
                    full_name: "Dr. Ahmed Hassan",
                    specialty_name: "Dermatology",
                    license_number: "MED-EG-2018-4421",
                    status: "active"
                  }
                ]
              }
            }
          ]
        },
        {
          id: "doctors-sync-schedule",
          method: "PUT",
          path: "/api/v1/doctors/{id}/schedule",
          title: "Sync Weekly Shift Schedule",
          roles: ["admin", "clinic_manager", "doctor"],
          description: "Replaces doctor's weekly recurring shift schedule and auto-generates booking slots.",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Doctor ID (doc_...)" }
          ],
          requestBody: {
            schedules: [
              { clinic_id: "cli_a1b2c3", day_of_week: 1, start_time: "10:00", end_time: "16:00", slot_duration_minutes: 30, is_available: true },
              { clinic_id: "cli_a1b2c3", day_of_week: 3, start_time: "14:00", end_time: "20:00", slot_duration_minutes: 30, is_available: true }
            ]
          },
          responses: [
            {
              code: 200,
              description: "Schedule synchronized",
              body: { success: true, data: { message: "Doctor schedule updated successfully." } }
            }
          ]
        }
      ]
    },

    {
      id: "reservations",
      title: "Appointments & In-Booking Chat",
      icon: "calendar-check",
      description: "Manage clinic reservations, acceptance/cancellation workflows, camera QR check-in, and patient-doctor chat threads",
      endpoints: [
        {
          id: "reservations-list",
          method: "GET",
          path: "/api/v1/reservations",
          title: "List Clinic Reservations",
          roles: ["admin", "clinic_manager", "receptionist", "doctor", "nurse"],
          description: "Lists all patient reservations with date, branch, doctor, and status filters.",
          parameters: [
            { name: "status", in: "query", required: false, type: "string", description: "pending, accepted, confirmed, completed, cancelled" },
            { name: "doctor_id", in: "query", required: false, type: "string", description: "Filter by doctor" },
            { name: "date", in: "query", required: false, type: "string", description: "Filter by reservation date YYYY-MM-DD" }
          ],
          responses: [
            {
              code: 200,
              description: "Reservations list",
              body: {
                success: true,
                data: [
                  {
                    id: "res_5e2b18",
                    patient_name: "Laila Ibrahim",
                    doctor_name: "Dr. Ahmed Hassan",
                    reservation_date: "2026-09-10",
                    status: "confirmed",
                    time_slot: "10:30 - 11:00"
                  }
                ]
              }
            }
          ]
        },
        {
          id: "reservations-accept",
          method: "PATCH",
          path: "/api/v1/reservations/{id}/accept",
          title: "Accept Reservation",
          roles: ["admin", "clinic_manager", "receptionist", "doctor"],
          description: "Transitions a pending reservation to accepted status.",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Reservation ID (res_...)" }
          ],
          responses: [
            {
              code: 200,
              description: "Reservation accepted",
              body: { success: true, data: { id: "res_5e2b18", status: "accepted" } }
            }
          ]
        },
        {
          id: "reservations-messages",
          method: "POST",
          path: "/api/v1/reservations/{id}/messages",
          title: "Send In-Booking Chat Message",
          roles: ["admin", "receptionist", "doctor", "patient"],
          description: "Sends a direct message attached to an appointment booking thread (e.g. pre-visit guidelines).",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Reservation ID" }
          ],
          requestBody: {
            message: "Please arrive 15 minutes before your slot with previous lab test results."
          },
          responses: [
            {
              code: 201,
              description: "Message sent",
              body: {
                success: true,
                data: {
                  id: "msg_441290",
                  reservation_id: "res_5e2b18",
                  sender_name: "Reception Desk",
                  message: "Please arrive 15 minutes before your slot with previous lab test results.",
                  created_at: "2026-09-02T10:00:00Z"
                }
              }
            }
          ]
        }
      ]
    },

    {
      id: "billing",
      title: "Billing, Invoices & Financials",
      icon: "cash-register",
      description: "Manage patient invoices, itemized bills, payment settlements (Cash, Card, Instapay, Vodafone Cash), refunds, and branch financial statements",
      endpoints: [
        {
          id: "invoices-list",
          method: "GET",
          path: "/api/v1/invoices",
          title: "List Invoices",
          roles: ["admin", "clinic_manager", "accountant", "receptionist"],
          description: "Lists patient invoices with payment status, outstanding balance, and date range filters.",
          parameters: [
            { name: "status", in: "query", required: false, type: "string", description: "draft, issued, paid, partially_paid, void" },
            { name: "patient_id", in: "query", required: false, type: "string", description: "Filter by patient" }
          ],
          responses: [
            {
              code: 200,
              description: "Invoices list",
              body: {
                success: true,
                data: [
                  {
                    id: "inv_2f7e11",
                    patient_id: "pat_7c3f21",
                    total: 400,
                    amount_paid: 400,
                    balance_due: 0,
                    status: "paid",
                    due_at: "2026-09-10"
                  }
                ]
              }
            }
          ]
        },
        {
          id: "invoices-record-payment",
          method: "POST",
          path: "/api/v1/invoices/{id}/payments",
          title: "Record Payment Settlement",
          roles: ["admin", "clinic_manager", "accountant", "receptionist"],
          description: "Records a payment against an invoice. Supports partial payments, full settlement, and multiple payment methods.",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Invoice ID (inv_...)" }
          ],
          requestBody: {
            amount: 400,
            method: "instapay",
            transaction_reference: "TXN-8823410",
            notes: "Settled via Instapay"
          },
          responses: [
            {
              code: 201,
              description: "Payment recorded",
              body: {
                success: true,
                data: {
                  id: "pay_8b4d33",
                  invoice_id: "inv_2f7e11",
                  amount: 400,
                  method: "instapay",
                  paid_at: "2026-09-02T10:15:00Z"
                }
              }
            }
          ]
        },
        {
          id: "reports-financial",
          method: "GET",
          path: "/api/v1/reports/financial",
          title: "Clinic Financial Statement",
          roles: ["admin", "clinic_manager", "accountant"],
          description: "Generates comprehensive financial reporting: gross revenue, operational expenses, net profit, unpaid balances, and payment method breakdown.",
          parameters: [
            { name: "date_from", in: "query", required: false, type: "string", description: "YYYY-MM-DD" },
            { name: "date_to", in: "query", required: false, type: "string", description: "YYYY-MM-DD" }
          ],
          responses: [
            {
              code: 200,
              description: "Financial statement",
              body: {
                success: true,
                data: {
                  gross_revenue: 124500,
                  total_expenses: 32000,
                  net_profit: 92500,
                  outstanding_balance: 8200,
                  payment_methods: { cash: 60000, card: 35000, instapay: 20000, vodafone_cash: 9500 }
                }
              }
            }
          ]
        }
      ]
    },

    {
      id: "inventory",
      title: "Medical Inventory & Stock Logs",
      icon: "boxes",
      description: "Track medical consumables, pharmacy items, low stock alerts, and atomic stock adjustments (Addition, Deduction, Dispensing, Damage)",
      endpoints: [
        {
          id: "inventory-list",
          method: "GET",
          path: "/api/v1/inventory",
          title: "List Inventory Items",
          roles: ["admin", "clinic_manager", "pharmacist", "inventory_manager", "nurse"],
          description: "Lists all medical items and consumables with real-time stock counts.",
          parameters: [
            { name: "search", in: "query", required: false, type: "string", description: "Search by item name or SKU" }
          ],
          responses: [
            {
              code: 200,
              description: "Inventory items",
              body: {
                success: true,
                data: [
                  { id: "itm_1a9c77", name: "Sterile Gauze Pads 10x10", sku: "MED-GZ-100", quantity: 120, reorder_level: 25, unit_price: 15.50 }
                ]
              }
            }
          ]
        },
        {
          id: "inventory-adjust",
          method: "POST",
          path: "/api/v1/inventory/{id}/adjustments",
          title: "Record Atomic Stock Adjustment",
          roles: ["admin", "clinic_manager", "nurse", "pharmacist"],
          description: "Records an atomic adjustment to item stock (addition, deduction, dispensing, damage, expired, correction) with an audit trail.",
          parameters: [
            { name: "id", in: "path", required: true, type: "string", description: "Inventory Item ID" }
          ],
          requestBody: {
            quantity: -5,
            type: "dispensing",
            notes: "Dispensed for procedure in Room 2."
          },
          responses: [
            {
              code: 201,
              description: "Stock adjusted",
              body: {
                success: true,
                data: {
                  id: "adj_4e9b12",
                  inventory_item_id: "itm_1a9c77",
                  quantity_change: -5,
                  resulting_quantity: 115,
                  type: "dispensing",
                  created_at: "2026-09-02T10:30:00Z"
                }
              }
            }
          ]
        }
      ]
    },

    {
      id: "notifications",
      title: "Queued Notifications & WebSockets",
      icon: "bell",
      description: "Asynchronous queued notification dispatch via SendNotificationJob and real-time private channel WebSocket broadcasting",
      endpoints: [
        {
          id: "notifications-list",
          method: "GET",
          path: "/api/v1/notifications",
          title: "List User Notifications",
          roles: ["admin", "clinic_manager", "doctor", "receptionist", "nurse", "accountant", "patient"],
          description: "Lists notifications for the authenticated user.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Notifications list",
              body: {
                success: true,
                data: [
                  {
                    id: "ntf_4c2e19",
                    title: "New Booking Received",
                    body: "Patient Mohamed Ibrahim booked an appointment for 10/09/2026.",
                    read_at: null,
                    created_at: "2026-09-02T09:00:00Z"
                  }
                ]
              }
            }
          ]
        },
        {
          id: "notifications-unread-count",
          method: "GET",
          path: "/api/v1/notifications/unread-count",
          title: "Get Unread Badge Count",
          roles: ["admin", "clinic_manager", "doctor", "receptionist", "nurse", "accountant", "patient"],
          description: "Returns count of unread notifications for badge counters.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "Unread count",
              body: { success: true, data: { unread_count: 3 } }
            }
          ]
        },
        {
          id: "notifications-mark-all-read",
          method: "POST",
          path: "/api/v1/notifications/mark-all-read",
          title: "Mark All As Read",
          roles: ["admin", "clinic_manager", "doctor", "receptionist", "nurse", "accountant", "patient"],
          description: "Marks all notifications for the authenticated user as read.",
          parameters: [],
          responses: [
            {
              code: 200,
              description: "All marked as read",
              body: { success: true, data: { message: "All notifications marked as read." } }
            }
          ]
        }
      ]
    }
  ]
};

if (typeof window !== "undefined") {
  window.API_DATA = API_DATA;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = API_DATA;
}
