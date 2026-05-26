'''
Step 1: Password hashing — completed
(i) Register a user with a password
(ii) Password is hashed using bcrypt ($2b$), check database

Step 2: Register / Login — completed
(i) Login via /login endpoint for a valid JWT token (Header.Payload.Signature)
-> Header (Base64URL encoding) : Algorithm (HS256) and token type (JWT)
-> Payload (Base64URL encoding) : Data (sub, user_id, exp)
-> Signature : HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), SECRET_KEY)

Step 3: JWT generation & expiry — completed
(i) Login via /login endpoint for a valid JWT token
(ii) Check the header of JWT algorithm (HS256) and token type (JWT) (refer to the first snippet)
(iii) Print decoded JWT token to get payload (refer to the second snippet)
-> Output should be username, user id and expiry (timestamp)
(iv) Check if token is valid or expired (refer to the third snippet)
(v) Generate an expired token to be rejected by protected endpoints (refer to the fourth snippet)
-> $TOKEN = "PASTE YOUR EXPIRED TOKEN"
-> Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/vote" -Headers @{Authorization = "Bearer $TOKEN"; "Content-Type" = "application/json"} -Body '{"candidate_id":1}'
-> Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/vote/encrypted" -Headers @{Authorization = "Bearer $TOKEN"; "Content-Type" = "application/json"} -Body '{"ciphertext":"test"}'

Step 4: Route protection — completed
(i) Login via /login endpoint for a valid JWT token
(ii) 401 Unauthorized on POST /vote without token
(iii) 200 OK or 400 Error:Bad Request on POST /vote with token
(iv) 401 Unauthorized on POST /vote/encrypted without token
(v) 200 OK or 400 Error:Bad Request on POST /vote/encrypted with token

Step 5: Tampered token rejection — completed
(i) Login via /login endpoint for a valid JWT token
(ii) Tamper with the signature (Output: 401 Unauthorized)
-> $TAMP = $TOKEN.Substring(0, $TOKEN.Length - 1) + "A"
(iii) Try tampering with the payload but generate a new signature using SECRET_KEY from .env (Output: 200/201 OK)

Step 6: Double-voting prevention — completed
(i) Register/ login only if has_voted is 0.
(ii) Cast a vote via POST /vote on Swagger UI (Output: 200 OK)
-> has_voted in vote.db flipped
-> votes has a new entry of candidate_id but NOT user_id or any reference to the user

Step 7: Anonymous-voting verification — completed
(i) This has been verified in Step 6.
-> ID of votes table may be confused as a reference to user, but try mixing up the order of registered voters while casting votes.

Step 8: Vote encryption verification — completed
Idea: Votes are encrypted using RSA (public key encryption), but decrypted at server using a private key (admin-only)
(i) RSA encryption on client side
python security_cli.py gen-keys --private keys/private.pem --public keys/public.pem
(ii) Encrypt any vote using the public key
python security_cli.py encrypt --public keys/public.pem --message '{"candidate_id":1}'
(iii) Get a valid JWT token via /login endpoint
(iv) POST /vote/encrypted (On Swagger UI or Invoke-RestMethod)
-> Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/vote/encrypted" -Headers @{Authorization = "Bearer $TOKEN"; "Content-Type" = "application/json"} -Body '{"ciphertext":"PASTE CIPHER TEXT"}'
(v) Decrypt using private key for admin only
-> python security_cli.py decrypt --private keys/private.pem --cipher "PASTE CIPHER TEXT"
(vi) Snippet for step 8 prints the receipt from step 8 (iv).

'''
# Run project : uvicorn main:app --reload

# Step 3: JWT generation & expiry
import jwt; print(jwt.get_unverified_header('PASTE YOUR TOKEN'))
import security; print(security.decode_access_token('PASTE YOUR TOKEN'))
import time; payload = {'sub': 'root', 'user_id': 1, 'exp': 1779738001}; print(payload['exp'] > time.time())
import security; t = security.create_access_token({"sub":"tmp","user_id":999}, expires_delta=0); print(t)

# Step 8: Vote encryption verification
import hashlib; c="PASTE CIPHER TEXT"; ts="PASTE TIMESTAMP FROM OUTPUT"; print(hashlib.sha256((c+ts).encode()).hexdigest())