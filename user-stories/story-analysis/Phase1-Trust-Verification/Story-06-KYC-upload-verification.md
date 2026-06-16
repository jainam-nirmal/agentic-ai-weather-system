# KYC Upload and Approval

## Purpose

Allow verified users to submit KYC documents.

## Endpoint

POST /auth/kyc/upload

## Process

1. User uploads document
2. File stored in AWS S3
3. Submission record created
4. Admin reviews submission
5. Approval/Rejection decision

## Approval Result

```text
users.is_kyc_approved = true
```

## User Story

As a verified NGO,

I want to upload KYC documents,

So that I can become a trusted organization on the platform.
