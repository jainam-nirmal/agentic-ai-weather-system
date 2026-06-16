# 09_API_Contract_Validation.md

# API Contract Validation – Phase 1 (Trust & Verification)

## Purpose

This document defines the API contract validation requirements for the Trust & Verification flow.

The objective is to ensure:

* API request structure remains unchanged
* API response structure remains unchanged
* Required fields are always present
* Data types are consistent
* Error responses follow standard format
* Backward compatibility is maintained across releases

---

# APIs Covered

| API                   | Purpose           |
| --------------------- | ----------------- |
| POST /auth/signup     | User Registration |
| POST /auth/verify-otp | OTP Verification  |
| POST /auth/refresh    | Refresh Token     |
| POST /auth/logout     | Logout            |
| POST /auth/kyc/upload | KYC Upload        |

---

# Contract Validation Strategy

Validation Layers:

1. Request Contract Validation
2. Response Contract Validation
3. Schema Validation
4. Header Validation
5. Authentication Validation
6. Error Contract Validation
7. Backward Compatibility Validation

---

# API 1 – Signup API

## Endpoint

POST /auth/signup

## Request Contract

### Mandatory Fields

```json
{
  "email": "user@ngo.org",
  "name": "Shweta Kumar",
  "organisation": "TRDSW",
  "role": "ngo"
}
```

### Validation Rules

| Field        | Type   | Required |
| ------------ | ------ | -------- |
| email        | string | Yes      |
| name         | string | Yes      |
| organisation | string | Yes      |
| role         | string | Yes      |

### Accepted Role Values

```text
ngo
donor
```

---

## Success Response Contract

HTTP 202

```json
{
  "message": "OTP sent to your email",
  "expires_in": 300
}
```

### Response Schema

```json
{
  "type": "object",
  "required": [
    "message",
    "expires_in"
  ]
}
```

---

## Error Response Contract

HTTP 400

```json
{
  "error": "Invalid email format"
}
```

HTTP 409

```json
{
  "error": "User already exists"
}
```

---

## Validation Checklist

* Email field exists
* Name field exists
* Organisation field exists
* Role field exists
* No unexpected field accepted
* Correct status code returned

---

# API 2 – Verify OTP

## Endpoint

POST /auth/verify-otp

## Request Contract

```json
{
  "email": "user@ngo.org",
  "otp": "123456"
}
```

---

## Success Response

HTTP 200

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<opaque>",
  "expires_in": 900,
  "user": {
    "id": "<uuid>",
    "email": "user@ngo.org",
    "role": "ngo"
  }
}
```

---

## Response Validation

### Required Fields

```text
access_token
refresh_token
expires_in
user
```

### User Object Validation

```text
id
email
role
```

---

## Data Type Validation

| Field         | Type    |
| ------------- | ------- |
| access_token  | string  |
| refresh_token | string  |
| expires_in    | integer |
| user.id       | string  |
| user.email    | string  |
| user.role     | string  |

---

## Negative Contract Validation

### Invalid OTP

HTTP 401

```json
{
  "error": "Invalid OTP"
}
```

### Expired OTP

HTTP 401

```json
{
  "error": "OTP expired"
}
```

### Maximum Attempts Reached

HTTP 429

```json
{
  "error": "Too many attempts"
}
```

---

# API 3 – Refresh Token

## Endpoint

POST /auth/refresh

## Request

```json
{
  "refresh_token": "<token>"
}
```

---

## Success Response

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<new-token>",
  "expires_in": 900
}
```

---

## Validation Rules

* New access token generated
* New refresh token generated
* Previous refresh token revoked
* Expiry time equals 900 seconds

---

## Negative Scenarios

| Scenario      | Status |
| ------------- | ------ |
| Missing Token | 400    |
| Expired Token | 401    |
| Revoked Token | 401    |
| Reused Token  | 401    |

---

# API 4 – Logout

## Endpoint

POST /auth/logout

## Header

```text
Authorization: Bearer <JWT>
```

---

## Success Response

HTTP 200

```json
{
  "message": "Logged out successfully"
}
```

---

## Validation

* User session invalidated
* Refresh token revoked
* User cannot refresh token after logout

---

# API 5 – KYC Upload

## Endpoint

POST /auth/kyc/upload

## Content Type

```text
multipart/form-data
```

---

## Request Validation

| Validation         | Expected Result |
| ------------------ | --------------- |
| File Exists        | Success         |
| Empty File         | 400             |
| Unsupported Format | 400             |
| Oversized File     | 413             |

---

## Success Response

HTTP 202

```json
{
  "submission_id": "<uuid>",
  "status": "PENDING_REVIEW"
}
```

---

# Security Contract Validation

## Authorization Header

Format:

```text
Bearer <JWT>
```

Validation:

* Missing header → 401
* Invalid token → 401
* Expired token → 401

---

# Common Error Response Contract

All APIs must follow:

```json
{
  "error": "<message>"
}
```

Schema:

```json
{
  "type": "object",
  "required": [
    "error"
  ]
}
```

---

# Backward Compatibility Validation

The following fields must never be removed without versioning:

Signup Response

```text
message
expires_in
```

Verify OTP Response

```text
access_token
refresh_token
expires_in
user
```

Refresh Response

```text
access_token
refresh_token
expires_in
```

KYC Response

```text
submission_id
status
```

---

# Automation Validation Strategy

## API Automation

Recommended Tool:

* Playwright API Testing
* Supertest
* Pact Contract Testing

---

## Validation Assertions

Validate:

* Status Code
* Response Schema
* Response Time
* Headers
* Authentication
* Mandatory Fields
* Optional Fields
* Data Types
* Business Rules

---

# CI/CD Contract Validation

Execute During:

* Pull Request
* Merge to Main
* Release Deployment
* Smoke Testing

Pipeline Validation:

1. Execute API Contract Tests
2. Validate JSON Schema
3. Compare Against Baseline Contract
4. Fail Build On Breaking Changes

---

# Exit Criteria

All APIs must satisfy:

* 100% Contract Validation Pass
* No Schema Breaking Change
* No Mandatory Field Missing
* No Security Contract Violation
* Backward Compatibility Maintained
