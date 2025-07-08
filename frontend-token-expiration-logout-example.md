# Frontend Token Expiration and Auto Logout Example for Sukimoko-Admin

This document provides example code snippets and guidance to implement token expiration detection and automatic logout in the frontend (sukimoko-admin).

## 1. Decode JWT Token to Get Expiration Time

You can decode the JWT token payload to get the expiration time (`exp` claim). Example using `atob`:

```javascript
function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}
```

## 2. Set Timer to Auto Logout on Token Expiration

Example React hook to set a timer that logs out the user when the token expires:

```javascript
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function useTokenExpirationLogout(token, logout) {
  useEffect(() => {
    if (!token) return;

    const payload = parseJwt(token);
    if (!payload || !payload.exp) return;

    const expirationTime = payload.exp * 1000; // convert to ms
    const timeout = expirationTime - Date.now();

    if (timeout <= 0) {
      logout();
      return;
    }

    const timerId = setTimeout(() => {
      logout();
    }, timeout);

    return () => clearTimeout(timerId);
  }, [token, logout]);
}
```

## 3. Intercept API Responses to Catch 401 Unauthorized

If using axios, you can intercept responses to detect 401 errors and logout:

```javascript
import axios from 'axios';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      logout();
    }
    return Promise.reject(error);
  }
);
```

## 4. Optional: Implement Token Refresh

Use the backend `/auth/refresh` endpoint to refresh tokens before expiration to keep the session alive.

---

Implementing these steps in your frontend will ensure that when the token expires, the admin is automatically logged out and prompted to log in again.

If you want, I can help you integrate this into your frontend codebase.
