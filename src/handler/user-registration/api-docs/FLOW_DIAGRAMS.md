# User Registration API - Endpoint Flow Diagram

## Complete API Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

PUBLIC ENDPOINTS (No Authentication Required)
═══════════════════════════════════════════════════════════════════════

┌──────────────────┐
│  1. Check NIPP   │  GET /check-nipp?employee_number=123456
└────────┬─────────┘
         │  Returns: user_registration_id, censored employee data
         │  Status: DRAFT
         ▼
┌────────────────────────────┐
│  2. Send Verification Code │  POST /send-verification-code
└────────┬───────────────────┘  Body: { user_registration_id }
         │  Sends: 6-digit OTP to email (valid 3 minutes)
         │  Updates: is_email_verified = false
         ▼
┌──────────────────┐
│  3. Verify OTP   │  POST /verify-otp
└────────┬─────────┘  Body: { user_registration_id, verification_code }
         │  Validates: OTP code
         │  Updates: is_email_verified = true (if valid)
         ▼
┌────────────────────┐
│  4. Create Password│  POST /create-password
└────────┬───────────┘  Body: { user_registration_id, password }
         │  Creates: Firebase account (disabled)
         │  Stores: firebase_account_uid
         │  Validates: Password requirements (12 chars, uppercase, number, special)
         ▼
┌────────────────────┐
│  5. Submit Request │  POST /submit-request (multipart/form-data)
└────────┬───────────┘  Files: profile_picture (PNG), id_card (PNG/JPG), decree (PDF)
         │  Uploads: Files to repository service
         │  Updates: Status DRAFT → SUBMITTED
         │  Creates: Audit log entry
         │
         ▼
    ┌─────────────────┐
    │   SUBMITTED     │
    │   (Pending)     │
    └────────┬────────┘
             │
             ▼

ADMIN ENDPOINTS (Authentication Required - kmsMiddleware)
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────┐
│ 6. Get List of Requests  │  GET /admin/list-request?page=1&size=10&search=name
└────────┬─────────────────┘  Returns: Paginated list of SUBMITTED requests
         │  Includes: user_registration_id, nipp, nama, submitted_at, etc.
         │
         ▼
┌──────────────────────────┐
│ 7. Get Request Detail    │  GET /admin/request-detail?user_registration_id=123
└────────┬─────────────────┘  Returns: Full uncensored details + file URLs
         │  Includes: Personal info, documents, supervisor info
         │
         ▼
    ┌──────────────────────────────────────┐
    │   ADMIN DECISION                     │
    └────────┬─────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌─────────────┐  ┌──────────────────┐
│  REJECT     │  │  ACCEPT          │
└─────┬───────┘  └──────────────────┘
      │          (Not yet implemented)
      ▼
┌──────────────────────────┐
│ 8. Reject Request        │  POST /admin/reject-request
└────────┬─────────────────┘  Body: { user_registration_id, rejection_notes }
         │  Updates: Status SUBMITTED → REJECTED
         │  Sends: Rejection email to user
         │  Creates: Audit log entry
         │  Records: rejected_by (admin user_id), rejected_at, rejection_notes
         │
         ▼
    ┌─────────────────┐
    │    REJECTED     │
    │  (Can restart)  │
    └─────────────────┘

┌──────────────────────────┐
│ 9. Request Analytics ⭐  │  GET /admin/request-analytics
└────────┬─────────────────┘  Returns: Statistics and percentages
         │  - total_request
         │  - total_accepted + accepted_percentage
         │  - total_rejected + rejected_percentage
         │  - total_submitted + submitted_percentage
         ▼
    ┌─────────────────────────────────┐
    │  Dashboard / Reporting View     │
    └─────────────────────────────────┘
```

---

## Status Flow Diagram

```
                ┌─────────────────────────────────────┐
                │  User checks NIPP                   │
                │  (New or after REJECTED)            │
                └───────────────┬─────────────────────┘
                                ▼
                        ┌───────────────┐
                        │     DRAFT     │◄─────────┐
                        └───────┬───────┘          │
                                │                  │
                    User completes steps           │
                    (OTP, Password, Upload)        │
                                │                  │
                                ▼                  │
                        ┌───────────────┐          │
                        │   SUBMITTED   │          │
                        └───────┬───────┘          │
                                │                  │
                        Admin reviews              │
                                │                  │
                    ┌───────────┴───────────┐      │
                    ▼                       ▼      │
            ┌───────────────┐       ┌───────────────┐
            │   ACCEPTED    │       │   REJECTED    │
            │   (Final)     │       └───────┬───────┘
            └───────────────┘               │
                                            │
                                User can    │
                                restart ────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Express Router      │
                    │   user-registration   │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            Public Routes              Admin Routes
                    │                       │
                    │               ┌───────▼───────┐
                    │               │ kmsMiddleware │
                    │               │ (Auth Check)  │
                    │               └───────┬───────┘
                    │                       │
                    └───────────┬───────────┘
                                ▼
                    ┌───────────────────────┐
                    │      HANDLER          │
                    │  - Request validation │
                    │  - Error handling     │
                    │  - Response formatting│
                    └───────────┬───────────┘
                                ▼
                    ┌───────────────────────┐
                    │      SERVICE          │
                    │  - Business logic     │
                    │  - Validation rules   │
                    │  - External calls     │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌───────▼───────┐       ┌───────▼───────┐
            │  REPOSITORY   │       │  EXTERNAL     │
            │  - DB queries │       │  - Firebase   │
            │  - SQL logic  │       │  - SMTP       │
            └───────┬───────┘       │  - Repository │
                    │               │    Service    │
                    ▼               └───────────────┘
        ┌───────────────────────┐
        │      DATABASE         │
        │  tb_user_registration │
        │  tb_user_registration │
        │    _otp               │
        │  tb_user_registration │
        │    _log               │
        │  tb_file              │
        └───────────────────────┘
```

---

## Authentication Flow

```
PUBLIC ENDPOINTS                     ADMIN ENDPOINTS
════════════════                     ═══════════════

Client Request                       Client Request
      │                                    │
      │                                    │
      ▼                                    ▼
┌──────────┐                        ┌──────────────┐
│  No Auth │                        │ Check Header │
│ Required │                        │ 'smartkm-... │
└────┬─────┘                        │ authorization│
     │                              └──────┬───────┘
     │                                     │
     │                              Verify JWT Token
     │                                     │
     │                              Extract user_id
     │                                     │
     │                              Set res.locals
     │                                     │
     ▼                                     ▼
┌──────────┐                        ┌──────────────┐
│ Handler  │                        │   Handler    │
│          │                        │ (has access  │
│          │                        │ to user_id)  │
└──────────┘                        └──────────────┘
```

---

## File Upload Flow (Submit Request)

```
1. Client sends multipart/form-data
   ┌────────────────────────────────┐
   │ user_registration_id: 123      │
   │ profile_picture: [PNG file]    │
   │ id_card: [PNG/JPG file]        │
   │ decree: [PDF file]             │
   └────────────┬───────────────────┘
                ▼
2. Storage Middleware (uploadMiddleware)
   ┌────────────────────────────────┐
   │ Processes files to memory      │
   │ Attaches to req.files array    │
   └────────────┬───────────────────┘
                ▼
3. Handler validates file formats
   ┌────────────────────────────────┐
   │ PNG for profile_picture        │
   │ PNG/JPG for id_card            │
   │ PDF for decree                 │
   └────────────┬───────────────────┘
                ▼
4. Service uploads to Repository Service
   ┌────────────────────────────────┐
   │ HTTP POST to repository API    │
   │ Returns file_id for each       │
   └────────────┬───────────────────┘
                ▼
5. Service updates database
   ┌────────────────────────────────┐
   │ Store file_ids                 │
   │ Change status to SUBMITTED     │
   │ Create audit log               │
   └────────────────────────────────┘
```

---

## New Analytics Endpoint Data Flow ⭐

```
GET /admin/request-analytics
         │
         ▼
┌────────────────────────┐
│ kmsMiddleware (Auth)   │
└────────┬───────────────┘
         ▼
┌────────────────────────┐
│ Handler                │
│ - No params needed     │
└────────┬───────────────┘
         ▼
┌────────────────────────┐
│ Service                │
│ - Pass to repository   │
└────────┬───────────────┘
         ▼
┌────────────────────────┐
│ Repository             │
│ SQL: SELECT COUNT(*)   │
│ SUM(CASE WHEN...)      │
│ FROM tb_user_          │
│   registration         │
│ WHERE deletedAt IS NULL│
└────────┬───────────────┘
         ▼
┌────────────────────────┐
│ Calculate Percentages  │
│ accepted % = (accepted │
│   / total) * 100       │
│ Same for rejected,     │
│   submitted            │
└────────┬───────────────┘
         ▼
┌────────────────────────┐
│ Return JSON            │
│ {                      │
│   total_request,       │
│   total_accepted,      │
│   accepted_percentage, │
│   total_rejected,      │
│   rejected_percentage, │
│   total_submitted,     │
│   submitted_percentage │
│ }                      │
└────────────────────────┘
```
