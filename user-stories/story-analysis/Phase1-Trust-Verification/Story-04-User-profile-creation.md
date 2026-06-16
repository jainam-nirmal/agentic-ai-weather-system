# User Profile Creation

## Trigger

After successful OTP verification.

## Actions

Create User Record

Fields:

* User ID
* Email
* Name
* Role
* Verified Status

## Profile Creation

Role Based

### NGO

Create Organisation Profile

### Donor

Create Donor Profile

## Default Values

```text
is_verified = true
is_kyc_approved = false
```

## Success Criteria

* User record created
* Profile record created
* User can login successfully
