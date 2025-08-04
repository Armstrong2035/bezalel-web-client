# Firebase Authentication with Zustand

This module provides Firebase authentication with Google sign-in and passwordless email authentication using Zustand for state management.

## Setup

1. Install zustand:

```bash
npm install zustand
```

2. Wrap your app with the AuthInitializer:

```jsx
import { AuthInitializer } from "@/firebase";

function App() {
  return <AuthInitializer>{/* Your app components */}</AuthInitializer>;
}
```

## Usage

### Basic Authentication State

```jsx
import { useAuthStore } from "@/firebase";

function MyComponent() {
  const { user, loading, error } = useAuthStore();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return user ? <div>Welcome, {user.email}!</div> : <div>Please sign in</div>;
}
```

### Google Sign In

```jsx
import { useAuthStore } from "@/firebase";

function GoogleSignInButton() {
  const { signInWithGoogle, error, clearError } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Success! User is now signed in
    } catch (error) {
      // Error is automatically set in the store
      console.error("Sign in failed:", error);
    }
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      {error && (
        <div>
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
```

### Passwordless Email Sign In

```jsx
import { useState } from "react";
import { useAuthStore } from "@/firebase";

function PasswordlessSignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { sendPasswordlessLink, error, clearError } = useAuthStore();

  const handleSendLink = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordlessLink(email);
      setSent(true);
    } catch (error) {
      console.error("Failed to send link:", error);
    }
  };

  if (sent) {
    return (
      <div>
        <p>Check your email for a sign-in link!</p>
        <button onClick={() => setSent(false)}>Send another link</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendLink}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Send Sign-in Link</button>
      {error && (
        <div>
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
    </form>
  );
}
```

### Complete Passwordless Sign In

Create a page at `/auth/verify` to handle the email link:

```jsx
// pages/auth/verify.js or app/auth/verify/page.js
import { useEffect, useState } from "react";
import { useAuthStore } from "@/firebase";

function VerifyEmail() {
  const [verifying, setVerifying] = useState(true);
  const { completePasswordlessSignIn, isSignInLink, getEmailForSignIn, error } =
    useAuthStore();

  useEffect(() => {
    const verifyEmail = async () => {
      if (isSignInLink()) {
        const email = getEmailForSignIn();
        if (email) {
          try {
            await completePasswordlessSignIn(email);
            // Redirect to dashboard or home page
            window.location.href = "/dashboard";
          } catch (error) {
            console.error("Verification failed:", error);
            setVerifying(false);
          }
        } else {
          setVerifying(false);
        }
      } else {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [completePasswordlessSignIn, isSignInLink, getEmailForSignIn]);

  if (verifying) {
    return <div>Verifying your email...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Verification failed: {error}</p>
        <a href="/">Go back to sign in</a>
      </div>
    );
  }

  return (
    <div>
      <p>Invalid or expired link</p>
      <a href="/">Go back to sign in</a>
    </div>
  );
}

export default VerifyEmail;
```

### Sign Out

```jsx
import { useAuthStore } from "@/firebase";

function SignOutButton() {
  const { signOut, error } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      // User is now signed out
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div>
      <button onClick={handleSignOut}>Sign Out</button>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### Update User Profile

```jsx
import { useState } from "react";
import { useAuthStore } from "@/firebase";

function ProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const { updateProfile, user, error } = useAuthStore();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ displayName });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  return (
    <form onSubmit={handleUpdateProfile}>
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Display name"
      />
      <button type="submit">Update Profile</button>
      {error && <div>Error: {error}</div>}
    </form>
  );
}
```

## Available Store Methods

### State

- `user` - Current user object (null if not signed in)
- `loading` - Boolean indicating if auth state is loading
- `error` - Current error message (null if no error)

### Actions

- `signInWithGoogle()` - Sign in with Google
- `sendPasswordlessLink(email)` - Send passwordless sign-in link
- `completePasswordlessSignIn(email)` - Complete passwordless sign-in
- `signOut()` - Sign out current user
- `updateProfile(profileData)` - Update user profile
- `clearError()` - Clear current error
- `initializeAuth()` - Initialize auth state listener

### Utilities

- `isSignInLink()` - Check if current URL is a sign-in link
- `getEmailForSignIn()` - Get email from localStorage
- `getCurrentUser()` - Get current user directly from Firebase

## Environment Variables

Make sure you have these environment variables set:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_DYNAMIC_LINK_DOMAIN=your_dynamic_link_domain
```
