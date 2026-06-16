# JWT and Refresh Token

## Access Token

Type: JWT

Validity: 15 Minutes

Claims:

* user_id
* role
* issued_at
* expiry

## Refresh Token

Validity: 7 Days

Characteristics:

* Opaque Token
* SHA256 Hashed
* Stored in Database
* Rotated on Usage

## Refresh Flow

1. User sends refresh token
2. Validate token
3. Revoke old token
4. Generate new token pair
5. Return updated tokens

## Logout

Endpoint:

POST /auth/logout

Action:

Revoke all active refresh tokens.

## Security

* Token rotation
* Token reuse detection
* Forced logout support
