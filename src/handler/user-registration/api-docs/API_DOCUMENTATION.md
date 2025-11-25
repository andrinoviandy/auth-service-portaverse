# User Registration API Documentation

## Overview

This API provides endpoints for user self-registration and admin management of registration requests for the Portaverse system. The registration process includes NIPP verification, email OTP verification, password creation, document upload, and admin review.

## Base URL
```
/user-registration
```

## Authentication

- **Public Endpoints:** Endpoints 1-5 are public and do not require authentication
- **Admin Endpoints:** Endpoints 6-9 require authentication via `kmsMiddleware`

## User Registration Flow

```
User Flow:
1. Check NIPP (GET /check-nipp)
2. Send Verification Code (POST /send-verification-code)
3. Verify OTP (POST /verify-otp)
4. Create Password (POST /create-password)
5. Submit Request (POST /submit-request)

Admin Flow:
6. View List of Requests (GET /admin/list-request)
7. View Request Details (GET /admin/request-detail)
8. Accept Request (POST /admin/accept-request)
9. Reject Request (POST /admin/reject-request)
10. View Analytics (GET /admin/request-analytics)
```

---

## 1. Check NIPP

**Endpoint:** `GET /user-registration/check-nipp`

**Description:** Check employee number (NIPP) and initialize user registration.

**Authentication:** Not required (public endpoint)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| employee_number | string | Yes | Employee number (NIPP) |

**Request Examples:**
```bash
# cURL
curl -X GET "http://localhost:3000/user-registration/check-nipp?employee_number=123456"

# Browser/Query
GET /user-registration/check-nipp?employee_number=123456
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_registration_id": 123,
    "employee_name": "S********g P*****o M***i T******l",
    "employee_number": "123456",
    "email": "a***02@gmail.com",
    "work_unit": "D*******t I*********n T********y",
    "employee_status": "PERMANENT",
    "superior_employee_name": "J******n D******e",
    "superior_position_name": "D*******r",
    "status": "DRAFT"
  },
  "message": "Success"
}
```

**Error Responses:**
```json
// Missing parameter
{
  "success": false,
  "message": "employee_number is required"
}

// Invalid parameter
{
  "success": false,
  "message": "employee_number must be a valid string"
}

// Employee not found
{
  "success": false,
  "message": "Pekerja tidak ditemukan di dalam sistem"
}the 

// Already registered
{
  "success": false,
  "message": "NIPP Pekerja telah terdaftar di Portaverse. Silahkan hubungi admin."
}

// Registration pending
{
  "success": false,
  "message": "Permintaan aktivasi akun Anda sedang dalam proses review. Silahkan tunggu konfirmasi dari admin."
}
```

---

## 2. Send Verification Code

**Endpoint:** `POST /user-registration/send-verification-code`

**Description:** Send OTP verification code to user's email. The OTP is valid for 3 minutes.

**Authentication:** Not required (public endpoint)

**Content-Type:** `application/json`

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_registration_id | number | Yes | User registration ID |
| email | string | No | Optional email address (for testing/override purposes) |

**Request Example:**
```json
{
  "user_registration_id": 123
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Kode verifikasi telah dikirim ke email Anda",
    "email": "a***02@gmail.com"
  },
  "message": "Success"
}
```

**Error Responses:**
```json
// Missing parameter
{
  "success": false,
  "message": "user_registration_id is required"
}

// Invalid parameter
{
  "success": false,
  "message": "user_registration_id must be a valid number"
}

// Invalid registration
{
  "success": false,
  "message": "Gagal mengirim kode verifikasi"
}

// Already submitted
{
  "success": false,
  "message": "Permintaan aktivasi akun Anda sedang dalam proses review. Silahkan tunggu konfirmasi dari admin."
}

// Already accepted
{
  "success": false,
  "message": "NIPP Pekerja telah terdaftar di Portaverse. Silahkan hubungi admin."
}
```

**Notes:**
- OTP is a 6-digit random number
- OTP expires after 3 minutes
- Previous active OTP will be automatically deactivated when requesting a new one
- Email addresses are censored in responses for privacy
- Sending a new OTP will set `is_email_verified` to `false`

---

## 3. Verify OTP

**Endpoint:** `POST /user-registration/verify-otp`

**Description:** Verify the OTP code sent to user's email. On successful verification, the email will be marked as verified.

**Authentication:** Not required (public endpoint)

**Content-Type:** `application/json`

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_registration_id | number | Yes | User registration ID |
| verification_code | string | Yes | 6-digit OTP code received via email |

**Request Example:**
```json
{
  "user_registration_id": 123,
  "verification_code": "123456"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "message": "Email berhasil diverifikasi"
  },
  "message": "Success"
}
```

**Failed Verification Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "verified": false,
    "message": "Kode verifikasi tidak valid"
  },
  "message": "Success"
}
```

**Error Responses:**
```json
// Missing parameter
{
  "success": false,
  "message": "user_registration_id is required"
}

{
  "success": false,
  "message": "verification_code is required"
}

// Invalid parameter
{
  "success": false,
  "message": "user_registration_id must be a valid number"
}

{
  "success": false,
  "message": "verification_code must be a valid string"
}

// Registration not found
{
  "success": false,
  "message": "Data registrasi tidak ditemukan"
}

// No active OTP
{
  "success": false,
  "message": "Kode verifikasi tidak ditemukan atau sudah kadaluarsa"
}

// Email mismatch
{
  "success": false,
  "message": "Email tidak sesuai dengan data registrasi. Silahkan hubungi admin."
}
```

**Notes:**
- OTP must be verified within 3 minutes of being sent
- On successful verification, `is_email_verified` in `tb_user_registration` is set to `true`
- On failed verification, `is_email_verified` in `tb_user_registration` is set to `false`
- The verification status in `tb_user_registration_otp` is updated to either `SUCCESS` or `FAILED`
- Each OTP can only be used once
- The email in the OTP record must match the email in the user registration record

---

## 4. Create Password

**Endpoint:** `POST /user-registration/create-password`

**Description:** Create or update a password for the user registration. Requires that the user's email is verified via OTP and that a successful OTP record exists.

**Authentication:** Not required (public endpoint)

**Content-Type:** `application/json`

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_registration_id | number | Yes | User registration ID |
| password | string | Yes | Password to set (must follow password rules below) |

**Password Rules:**
- Minimal 12 karakter
- Mengandung huruf kapital
- Mengandung angka
- Mengandung simbol atau karakter spesial (!, @, $, %, ^, &, *, +, #)

**Request Example:**
```json
{
  "user_registration_id": 123,
  "password": "Str0ngP@ssw0rd!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Password berhasil dibuat",
    "firebase_uid": "some-firebase-uid"
  },
  "message": "Success"
}
```

**Error Responses:**
```json
// Missing parameter
{
  "success": false,
  "message": "user_registration_id is required"
}

{
  "success": false,
  "message": "password is required"
}

// Invalid parameter
{
  "success": false,
  "message": "user_registration_id must be a valid number"
}

{
  "success": false,
  "message": "password must be a valid string"
}

// Email not verified or no successful OTP
{
  "success": false,
  "message": "Email belum diverifikasi. Silahkan verifikasi email terlebih dahulu."
}

// Email already exists in Firebase but not linked to registration
{
  "success": false,
  "message": "Email sudah digunakan. Silahkan hubungi admin."
}

// UID mismatch or other integrity issue
{
  "success": false,
  "message": "Terjadi ketidaksesuaian data. Silahkan hubungi admin."
}
```

**Notes:**
- Endpoint will check that `is_email_verified` is true and that there is a successful OTP (`verification_status = 'SUCCESS'`) for the given `user_registration_id` and email.
- If `firebase_account_uid` is present in `tb_user_registration`, the Firebase user will be updated with the new password and the account remains disabled until admin approval.
- If `firebase_account_uid` is not present, the endpoint will create a new Firebase user with `disabled: true` and `emailVerified: true`, then store the Firebase UID in `tb_user_registration`.
- If a Firebase user exists with the same email but is not linked to this registration, the endpoint will return an error to prevent possible account hijacking.
- The endpoint expects requests over HTTPS. Passwords are not additionally encrypted in the request body; rely on TLS for transport security.

---

## 5. Submit Request

**Endpoint:** `POST /user-registration/submit-request`

**Description:** Submit user registration request with required file uploads (profile picture, ID card, and decree). This endpoint uploads files to the repository service, updates the registration status to SUBMITTED, and creates an audit log entry.

**Authentication:** Not required (public endpoint)

**Content-Type:** `multipart/form-data`

**Form Data Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_registration_id | number | Yes | User registration ID |
| profile_picture | file | Yes | Profile picture (PNG format only, max 10MB) |
| id_card | file | Yes | ID card image (PNG or JPG format, max 10MB) |
| decree | file | Yes | Decree/SK document (PDF format only, max 10MB) |

**Request Example (using curl):**
```bash
curl -X POST http://localhost:3000/user-registration/submit-request \
  -F "user_registration_id=123" \
  -F "profile_picture=@/path/to/profile.png" \
  -F "id_card=@/path/to/idcard.jpg" \
  -F "decree=@/path/to/decree.pdf"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Pengajuan berhasil disubmit",
    "data": {
      "user_registration_id": 123,
      "status": "SUBMITTED",
      "submitted_at": "2025-10-13T10:30:00.000Z",
      "profile_picture_file_id": 456,
      "id_card_file_id": 789,
      "sk_file_id": 101
    }
  },
  "message": "Success"
}
```

**Error Responses:**
```json
// Missing parameter
{
  "success": false,
  "message": "user_registration_id is required"
}

{
  "success": false,
  "message": "Files are required"
}

// Invalid parameter
{
  "success": false,
  "message": "user_registration_id must be a valid number"
}

// No files uploaded
{
  "success": false,
  "message": "Files are required"
}

// Missing one or more required files
{
  "success": false,
  "message": "All three files are required: profile_picture, id_card, decree"
}

// Invalid file format
{
  "success": false,
  "message": "Profile picture harus berformat PNG"
}

{
  "success": false,
  "message": "ID Card harus berformat PNG atau JPG"
}

{
  "success": false,
  "message": "Decree harus berformat PDF"
}

// Registration not found
{
  "success": false,
  "message": "Data registrasi tidak ditemukan"
}

// Email not verified
{
  "success": false,
  "message": "Email belum diverifikasi. Silahkan verifikasi email terlebih dahulu."
}

// Invalid status
{
  "success": false,
  "message": "Pengajuan hanya dapat dilakukan pada tahap draft. Status saat ini: SUBMITTED"
}

// Firebase account not created
{
  "success": false,
  "message": "Firebase account belum dibuat. Silahkan buat password terlebih dahulu."
}

// Firebase account not found
{
  "success": false,
  "message": "Firebase account tidak ditemukan. Silahkan ajukan ulang registrasi."
}

// Email mismatch
{
  "success": false,
  "message": "Email tidak sesuai dengan Firebase account. Silahkan ajukan ulang registrasi."
}

// File upload failed
{
  "success": false,
  "message": "Gagal mengupload file. Silahkan coba lagi. [error details]"
}
```

**Notes:**
- All three files (profile_picture, id_card, decree) are required
- File size limit is 10MB per file
- File format validation:
  - Profile picture: PNG only
  - ID card: PNG or JPG/JPEG
  - Decree/SK: PDF only
- Prerequisites before submission:
  1. Email must be verified (`is_email_verified = true`)
  2. Status must be DRAFT
  3. OTP verification must be successful
  4. Firebase account must be created (via create-password endpoint)
  5. Firebase email must match database email
- On successful submission:
  - Files are uploaded to the repository service
  - `status` is changed from `DRAFT` to `SUBMITTED`
  - `submitted_at` timestamp is recorded
  - File IDs (`profile_picture_file_id`, `id_card_file_id`, `sk_file_id`) are stored
  - `last_step` is set to 4
  - An entry is created in `tb_user_registration_log` for audit purposes
- The entire operation is wrapped in a database transaction to ensure data consistency
- If any step fails, all changes are rolled back

**Workflow:**
1. Check NIPP → 2. Send Verification Code → 3. Verify OTP → 4. Create Password → **5. Submit Request** → (Admin Review)

---

## 6. Admin Get List Request

**Endpoint:** `GET /user-registration/admin/list-request`

**Description:** Get list of submitted user registration requests with pagination and search functionality (admin endpoint). Requires authentication via kmsMiddleware.

**Authentication:** Required (kmsMiddleware)

**Query Parameters:**
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| page | number | No | Page number | 1 |
| size | number | No | Items per page | 10 |
| search | string | No | Search term for employee name | "" (empty string) |

**Request Examples:**
```bash
# cURL
curl -X GET "http://localhost:3000/user-registration/admin/list-request?page=1&size=10&search=John" \
  -H "smartkmsystem-authorization: Bearer YOUR_TOKEN"

# Browser/Query
GET /user-registration/admin/list-request?page=1&size=10&search=John
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "user_registration_id": 123,
        "nipp": "123456",
        "nama": "John Doe",
        "submitted_at": "2025-10-13T10:30:00.000Z",
        "status_pekerja": "PERMANENT",
        "unit_kerja": "Department Information Technology",
        "jabatan_atasan_langsung": "Director",
        "profile_picture": "https://example.com/files/123"
      }
    ],
    "dataCount": 100,
    "pageCount": 10
  },
  "message": "Success"
}
```

**Error Responses:**
```json
// Unauthorized (no authentication)
{
  "success": false,
  "message": "Unauthorized"
}
```

**Notes:**
- Only returns requests with status `SUBMITTED`
- Excludes soft-deleted records (`deletedAt IS NULL`)
- Results are ordered by `submitted_at` descending
- Profile picture URL is generated from the file repository service
- Search is case-insensitive and uses LIKE matching on employee name

---

## 7. Admin Get Request Detail

**Endpoint:** `GET /user-registration/admin/request-detail`

**Description:** Get detailed information of a specific user registration request (admin endpoint). Requires authentication via kmsMiddleware.

**Authentication:** Required (kmsMiddleware)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_registration_id | string or number | Yes | User registration ID |

**Request Examples:**
```bash
# cURL
curl -X GET "http://localhost:3000/user-registration/admin/request-detail?user_registration_id=123" \
  -H "smartkmsystem-authorization: Bearer YOUR_TOKEN"

# Browser/Query
GET /user-registration/admin/request-detail?user_registration_id=123
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_registration_id": 123,
    "nipp": "123456",
    "nama": "John Doe",
    "email": "john.doe@example.com",
    "tempat_lahir": "Jakarta",
    "tanggal_lahir": "1990-01-01",
    "nomor_telepon": "081234567890",
    "jabatan_atasan": "Director",
    "nama_atasan_langsung": "Jane Smith",
    "nipp_atasan_langsung": "654321",
    "unit": "Department Information Technology",
    "status": "SUBMITTED",
    "status_pekerja": "Aktif",
    "profile_picture": "https://example.com/files/123",
    "id_card": "https://example.com/files/124",
    "decree": "https://example.com/files/125"
  },
  "message": "Success"
}
```

**Error Responses:**
```json
// Missing parameter
{
  "success": false,
  "statusCode": 400,
  "message": "User registration ID is required"
}

// Not found or not in SUBMITTED status
{
  "success": false,
  "message": "User registration request not found or not in SUBMITTED status"
}

// Unauthorized
{
  "success": false,
  "message": "Unauthorized"
}
```

**Notes:**
- Only returns request with status `SUBMITTED`
- Excludes soft-deleted records
- File URLs (profile_picture, id_card, decree) are generated from the file repository service
- All personal information is returned uncensored for admin review

---

## 8. Admin Accept Request

**Endpoint:** `POST /user-registration/admin/accept-request`

**Description:** Accept a user registration request and activate the user account (admin endpoint). This endpoint performs several critical operations including verifying email, checking Firebase account, enabling the account, creating user and employee records, and sending acceptance email. Requires authentication via kmsMiddleware.

**Authentication:** Required (kmsMiddleware)

**Content-Type:** `application/json`

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_registration_id | number | Yes | User registration ID to accept |

**Request Example:**
```json
{
  "user_registration_id": 123
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Permintaan registrasi berhasil diterima",
    "data": {
      "user_registration_id": 123,
      "status": "ACCEPTED",
      "accepted_at": "2025-10-13T11:00:00.000Z",
      "accepted_by": 456,
      "user_id": 789,
      "employee_id": 321
    }
  },
  "message": "Success"
}
```

**Error Responses:**
```json
// Missing parameter
{
  "success": false,
  "message": "user_registration_id is required"
}

// Invalid parameter
{
  "success": false,
  "message": "user_registration_id must be a valid number"
}

// Registration not found
{
  "success": false,
  "message": "Data registrasi tidak ditemukan"
}

// Invalid status
{
  "success": false,
  "message": "Penerimaan hanya dapat dilakukan pada status SUBMITTED. Status saat ini: DRAFT"
}

// Email not verified
{
  "success": false,
  "message": "Email belum terverifikasi. Tidak dapat menerima permintaan registrasi."
}

// Firebase UID not in database
{
  "success": false,
  "message": "Firebase UID tidak ditemukan di database."
}

// Firebase account not found
{
  "success": false,
  "message": "Akun Firebase tidak ditemukan."
}

// User already exists
{
  "success": false,
  "message": "User dengan email tersebut sudah terdaftar di sistem."
}

// Firebase operation failed
{
  "success": false,
  "message": "Gagal mengaktifkan akun Firebase: [error details]"
}

// Unauthorized
{
  "success": false,
  "message": "Unauthorized"
}
```

**Notes:**
- Only requests with status `SUBMITTED` can be accepted
- The endpoint performs multiple validation checks in sequence:
  1. Verifies status is `SUBMITTED`
  2. Checks email is verified (`is_email_verified = true`)
  3. Verifies Firebase UID exists in database
  4. Confirms Firebase account exists in Firebase
  5. Checks if user with email already exists (prevents duplicates)
- If Firebase account is disabled, it will be enabled automatically
- Creates the following records in the database:
  - **tb_user**: Main user record with Firebase UID, email, phone, and role code "USER"
  - **tb_employee**: Employee record linked to user with profile picture file_id
  - **tb_user_role_code**: Role code assignment record with role "USER"
- Updates user registration:
  - Status changed to `ACCEPTED`
  - Records acceptance timestamp (`accepted_at`)
  - Records admin who accepted (`accepted_by`)
  - Stores created user ID (`success_user_id`)
  - Stores created employee ID (`success_employee_id`)
- Creates audit log entry in `tb_user_registration_log`
- Sends acceptance email to user's email address
- The entire operation is wrapped in a database transaction
- Admin ID is obtained from `res.locals.user_id` set by kmsMiddleware
- Employee ID (if available) is obtained from `res.locals.employee_id`

**Email Content:**
- Subject: "Permintaan Pembuatan Akun Portaverse Diterima"
- Contains employee name, confirmation of account activation, and login instructions

**Default Values in Created Records:**
- **tb_user**:
  - `role_code`: "USER"
  - `is_email_otp_required`: 1 (enabled)
- **tb_employee**:
  - `group_id`: 1 (default group)
  - `manager_id`: 0 (will be updated later)
  - `coach_id`: 0 (will be updated later)
  - `file_id`: From `profile_picture_file_id`
  - `status_worker`: From registration `employee_status` or "ACTIVE"
  - `created_by`: Admin user ID who accepted

---

## 9. Admin Reject Request

**Endpoint:** `POST /user-registration/admin/reject-request`

**Description:** Reject a user registration request with rejection notes (admin endpoint). Sends rejection email to the user. Requires authentication via kmsMiddleware.

**Authentication:** Required (kmsMiddleware)

**Content-Type:** `application/json`

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_registration_id | number | Yes | User registration ID to reject |
| rejection_notes | string | Yes | Reason/notes for rejection |

**Request Example:**
```json
{
  "user_registration_id": 123,
  "rejection_notes": "Dokumen SK tidak lengkap. Silahkan upload ulang dengan dokumen yang sesuai."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Permintaan registrasi berhasil ditolak",
    "data": {
      "user_registration_id": 123,
      "status": "REJECTED",
      "rejected_at": "2025-10-13T11:00:00.000Z",
      "rejected_by": 456,
      "rejection_notes": "Dokumen SK tidak lengkap. Silahkan upload ulang dengan dokumen yang sesuai."
    }
  },
  "message": "Success"
}
```

**Error Responses:**
```json
// Missing parameter
{
  "success": false,
  "message": "user_registration_id is required"
}

{
  "success": false,
  "message": "rejection_notes is required"
}

// Invalid parameter
{
  "success": false,
  "message": "user_registration_id must be a valid number"
}

{
  "success": false,
  "message": "rejection_notes must be a valid string"
}

// Registration not found
{
  "success": false,
  "message": "Data registrasi tidak ditemukan"
}

// Invalid status
{
  "success": false,
  "message": "Penolakan hanya dapat dilakukan pada status SUBMITTED. Status saat ini: DRAFT"
}

// Unauthorized
{
  "success": false,
  "message": "Unauthorized"
}
```

**Notes:**
- Only requests with status `SUBMITTED` can be rejected
- Status will be changed to `REJECTED`
- Rejection timestamp (`rejected_at`) and admin ID (`rejected_by`) are recorded
- An entry is created in `tb_user_registration_log` for audit purposes
- A rejection email is automatically sent to the user's email address
- The entire operation is wrapped in a database transaction
- Admin ID is obtained from `res.locals.user_id` set by kmsMiddleware

**Email Content:**
- Subject: "Permintaan Pembuatan Akun Portaverse Ditolak"
- Contains employee name, rejection reason, and instructions to resubmit

---

## 10. Admin Get Request Analytics

**Endpoint:** `GET /user-registration/admin/request-analytics`

**Description:** Get analytics/statistics of user registration requests including total counts and percentages (admin endpoint). Requires authentication via kmsMiddleware.

**Authentication:** Required (kmsMiddleware)

**Query Parameters:** None

**Request Examples:**
```bash
# cURL
curl -X GET "http://localhost:3000/user-registration/admin/request-analytics" \
  -H "smartkmsystem-authorization: Bearer YOUR_TOKEN"

# Browser/Query
GET /user-registration/admin/request-analytics
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_request": 150,
    "total_accepted": 80,
    "accepted_percentage": 53.33,
    "total_rejected": 30,
    "rejected_percentage": 20.00,
    "total_submitted": 40,
    "submitted_percentage": 26.67
  },
  "message": "Success"
}
```

**Error Responses:**
```json
// Unauthorized
{
  "success": false,
  "message": "Unauthorized"
}
```

**Notes:**
- Returns aggregate statistics from all non-deleted user registration records
- `total_request` includes all records regardless of status (DRAFT, SUBMITTED, ACCEPTED, REJECTED)
- Percentages are calculated based on `total_request`
- Percentages are rounded to 2 decimal places
- Excludes soft-deleted records (`deletedAt IS NULL`)
- If no records exist, all values return 0

**Calculation:**
- `accepted_percentage = (total_accepted / total_request) × 100`
- `rejected_percentage = (total_rejected / total_request) × 100`
- `submitted_percentage = (total_submitted / total_request) × 100`

---

## Common Error Codes

**Validation Errors (400 Bad Request):**
- Missing required parameters
- Invalid parameter types
- Invalid file formats or sizes

**Client Errors (400 Bad Request):**
- Business logic violations
- Invalid state transitions
- Data not found

**Server Errors (500 Internal Server Error):**
- Database errors
- External service failures
- Unexpected exceptions

---

## Status Values

The `status` field in user registration can have the following values:

| Status | Description |
|--------|-------------|
| DRAFT | Initial state when NIPP is checked. User is in the registration process. |
| SUBMITTED | User has completed all steps and submitted the request. Waiting for admin review. |
| ACCEPTED | Admin has approved the registration request. User account is activated. |
| REJECTED | Admin has rejected the registration request. User can start over. |

**Status Transitions:**
- `DRAFT → SUBMITTED` (via `/submit-request`)
- `SUBMITTED → ACCEPTED` (via `/admin/accept-request`)
- `SUBMITTED → REJECTED` (via `/admin/reject-request`)
- `REJECTED → DRAFT` (automatically when user checks NIPP again after rejection)

---

## Data Censoring

For security and privacy, certain endpoints return censored data:

**Check NIPP Endpoint:**
- Employee name: Shows first and last characters with asterisks in between (e.g., "S********g P*****o")
- Email: Shows first character and domain with asterisks (e.g., "a***02@gmail.com")
- Work unit: Censored similar to employee name
- Superior name: Censored similar to employee name
- Position name: Censored similar to employee name

**Send Verification Code Endpoint:**
- Email: Shows first character and domain with asterisks

**Admin Endpoints:**
- No censoring - full data is visible for review

---

## File Upload Specifications

**Supported Formats:**
- **Profile Picture:** PNG (image/png)
- **ID Card:** PNG (image/png), JPG/JPEG (image/jpeg)
- **Decree/SK:** PDF (application/pdf)

**Size Limits:**
- Maximum file size per file: 10MB
- Total maximum upload size: 30MB (all three files combined)

**Recommendations:**
- Compress images to reduce file size while maintaining quality
- Use standard image resolutions (e.g., 1024x1024 for profile pictures)
- Ensure PDFs are not password-protected

---

## Database Transactions

The following endpoints use database transactions to ensure data consistency:

1. **Check NIPP** - Creates or updates registration record with audit logging
2. **Send Verification Code** - Creates OTP record and updates email verification status
3. **Verify OTP** - Updates OTP verification status and email verification flag
4. **Create Password** - Creates/updates Firebase user and stores UID
5. **Submit Request** - Uploads files, updates status, and creates audit log
6. **Admin Accept Request** - Enables Firebase account, creates user/employee records, and sends email
7. **Admin Reject Request** - Updates status, creates audit log, and sends email

If any step fails within these operations, all changes are rolled back to maintain database integrity.

---

## Audit Logging

The system maintains an audit trail in `tb_user_registration_log` for the following actions:

1. **Check NIPP** (if existing registration found):
   - Logs the previous state before resetting to DRAFT
   
2. **Submit Request**:
   - Logs when user submits their registration with all documents

3. **Admin Accept Request**:
   - Logs the acceptance with admin ID and created user/employee IDs
   
4. **Admin Reject Request**:
   - Logs the rejection with admin ID and rejection notes

Each log entry contains:
- All fields from the user registration record
- Timestamp of the action
- User/Admin ID who performed the action (when applicable)
- Employee ID (when applicable)

---

## Email Notifications

The system sends automated emails for:

1. **OTP Verification** (`/send-verification-code`):
   - Subject: "Kode Verifikasi Portaverse"
   - Contains 6-digit OTP code
   - Valid for 3 minutes

2. **Acceptance Notification** (`/admin/accept-request`):
   - Subject: "Permintaan Pembuatan Akun Portaverse Diterima"
   - Contains confirmation and login instructions

3. **Rejection Notification** (`/admin/reject-request`):
   - Subject: "Permintaan Pembuatan Akun Portaverse Ditolak"
   - Contains rejection reason
   - Instructions to resubmit

**SMTP Configuration Required:**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`

---

## Security Considerations

1. **Password Requirements:**
   - Minimum 12 characters
   - Must contain uppercase letters
   - Must contain numbers
   - Must contain special characters (!, @, $, %, ^, &, *, +, #)

2. **OTP Security:**
   - OTP is hashed using bcrypt before storage
   - Configurable salt rounds via `USER_REGISTRATION_SALT_ROUNDS` environment variable
   - Default salt rounds: 10

3. **Firebase Account Protection:**
   - New accounts are created with `disabled: true`
   - Accounts remain disabled until admin approval
   - Email hijacking prevention checks

4. **Authentication:**
   - Admin endpoints require JWT token via `kmsMiddleware`
   - Token passed in `smartkmsystem-authorization` header or cookies

5. **Soft Deletes:**
   - All queries exclude soft-deleted records (`deletedAt IS NULL`)
   - Data is never permanently deleted for audit purposes

---

## Environment Variables

Required environment variables for this module:

```
# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=noreply@example.com
SMTP_PASSWORD=your_password

# Security
USER_REGISTRATION_SALT_ROUNDS=10

# API Security
API_KEY=your_api_key
```

---

## Response Format

All endpoints follow a consistent response format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Success"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Optional error details"
}
```

---

## Change Log

### Version 1.1.0
- Added Admin Accept Request endpoint
- Enhanced documentation with complete endpoint details
- Added audit logging for acceptance operations
- Implemented acceptance email notifications

### Version 1.0.0
- Initial API implementation
- User self-registration flow (Check NIPP → OTP → Password → Submit)
- Admin review endpoints (List, Detail, Reject)
- Admin analytics endpoint
- Email notifications for OTP and rejection
- Audit logging system
- File upload to repository service

---

## Future Enhancements

Planned features not yet implemented:

1. **Resend OTP** endpoint (currently uses send-verification-code)
   
2. **Edit Registration** endpoint
   - Allow users to update their information before submission
   
3. **Cancel Registration** endpoint
   - Allow users to cancel their registration request

4. **Admin Bulk Actions**
   - Approve/reject multiple requests at once

5. **File Preview** endpoint
   - Allow admins to preview uploaded documents directly

---

## API Testing Examples

### cURL Examples

#### Public Endpoints (No Authentication Required)

**1. Check NIPP:**
```bash
curl -X GET "http://localhost:3000/user-registration/check-nipp?employee_number=123456"
```

**2. Send Verification Code:**
```bash
curl -X POST "http://localhost:3000/user-registration/send-verification-code" \
  -H "Content-Type: application/json" \
  -d '{"user_registration_id": 123}'

# With optional email parameter
curl -X POST "http://localhost:3000/user-registration/send-verification-code" \
  -H "Content-Type: application/json" \
  -d '{"user_registration_id": 123, "email": "test@example.com"}'
```

**3. Verify OTP:**
```bash
curl -X POST "http://localhost:3000/user-registration/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"user_registration_id": 123, "verification_code": "123456"}'
```

**4. Create Password:**
```bash
curl -X POST "http://localhost:3000/user-registration/create-password" \
  -H "Content-Type: application/json" \
  -d '{"user_registration_id": 123, "password": "SecureP@ssw0rd123"}'
```

**5. Submit Request:**
```bash
curl -X POST "http://localhost:3000/user-registration/submit-request" \
  -F "user_registration_id=123" \
  -F "profile_picture=@profile.png" \
  -F "id_card=@idcard.jpg" \
  -F "decree=@decree.pdf"
```

---

#### Admin Endpoints (Authentication Required)

**Note:** All admin endpoints require the `smartkmsystem-authorization` header with a valid JWT token.

**6. Admin Get List:**
```bash
curl -X GET "http://localhost:3000/user-registration/admin/list-request?page=1&size=10" \
  -H "smartkmsystem-authorization: Bearer YOUR_TOKEN"

# With search parameter
curl -X GET "http://localhost:3000/user-registration/admin/list-request?page=1&size=10&search=John" \
  -H "smartkmsystem-authorization: Bearer YOUR_TOKEN"
```

**7. Admin Get Detail:**
```bash
curl -X GET "http://localhost:3000/user-registration/admin/request-detail?user_registration_id=123" \
  -H "smartkmsystem-authorization: Bearer YOUR_TOKEN"
```

**8. Admin Accept:**
```bash
curl -X POST "http://localhost:3000/user-registration/admin/accept-request" \
  -H "Content-Type: application/json" \
  -H "smartkmsystem-authorization: Bearer YOUR_TOKEN" \
  -d '{"user_registration_id": 123}'
```

**9. Admin Reject:**
```bash
curl -X POST "http://localhost:3000/user-registration/admin/reject-request" \
  -H "Content-Type: application/json" \
  -H "smartkmsystem-authorization: Bearer YOUR_TOKEN" \
  -d '{"user_registration_id": 123, "rejection_notes": "Incomplete documents"}'
```

**10. Admin Analytics:**
```bash
curl -X GET "http://localhost:3000/user-registration/admin/request-analytics" \
  -H "smartkmsystem-authorization: Bearer YOUR_TOKEN"
```

---

**End of Documentation**
