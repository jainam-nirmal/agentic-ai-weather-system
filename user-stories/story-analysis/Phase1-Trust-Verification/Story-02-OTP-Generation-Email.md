# OTP Generation and Email Delivery

## Purpose

Generate secure OTP and send it to the user's registered email.

## OTP Rules

* 6 digit numeric OTP
* Secure random generation
* Valid for 5 minutes

## OTP Storage

Stored as hash only.

Stored Information:

* Email
* OTP Hash
* Expiry Time
* Attempt Count
* Used Status

## Email Notification

Subject:

Grow+ Verification Code

Message:

Your verification code is XXXXXX.

Valid for 5 minutes.

## Success Response

HTTP 202

```json
{
  "message": "OTP sent to your email",
  "expires_in": 300
}
```

## Security Rules

* OTP not stored in plain text
* OTP expires after 5 minutes
* OTP cleanup job runs hourly

## User Story

As a user,

I want to receive a secure OTP,

So that I can verify ownership of my email.
