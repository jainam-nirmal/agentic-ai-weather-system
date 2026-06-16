# QA Validation Checklist – Phase 1

## Signup Validation

* Valid email accepted
* Invalid email rejected
* Missing fields rejected
* Duplicate email rejected

## OTP Validation

* OTP generated
* OTP delivered
* OTP expires after 5 minutes
* OTP reuse prevented
* OTP attempts capped at 5

## User Creation

* User created after OTP verification
* Correct role assigned
* Profile created

## Token Validation

* JWT generated
* JWT expiry = 15 minutes
* Refresh token expiry = 7 days
* Token rotation works

## Logout Validation

* Refresh tokens revoked
* Access token expires naturally

## KYC Validation

* Upload successful
* S3 path correct
* Admin approval updates status

## Security Validation

* HTTPS enforced
* JWT signed correctly
* Rate limiting works
* CORS restrictions applied
