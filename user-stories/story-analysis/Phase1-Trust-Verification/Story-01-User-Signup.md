# User Signup Requirement

## Endpoint

POST /auth/signup

## Request Payload

```json
{
  "email": "user@ngo.org",
  "name": "Shweta Kumar",
  "organisation": "TRDSW",
  "role": "ngo"
}
```

## Business Rules

### Mandatory Fields

* Email
* Name
* Organisation
* Role

### Accepted Roles

* ngo
* donor

### Email Validation

Must follow RFC 5322 standard.

### Duplicate Validation

Email must not already exist.

## Validation Rules

| Validation    | Expected Result |
| ------------- | --------------- |
| Valid Email   | Proceed         |
| Invalid Email | HTTP 400        |
| Missing Field | HTTP 400        |
| Existing User | HTTP 409        |

## User Story

As a new NGO user,

I want to register using my email,

So that I can access Grow+ services after verification.
