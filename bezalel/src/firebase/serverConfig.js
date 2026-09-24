import admin from "firebase-admin";
import { initializeFirestore } from "firebase-admin/firestore";
// Next.js loads .env files once, before importing server modules.

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Construct service account from environment variables
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw new Error("Firebase Admin configuration is invalid.", { cause: error });
  }
}

// Use HTTP/1.1 REST for server-side Firestore. This avoids a gRPC-only
// connection requirement in restricted deployment and local environments.
const db = initializeFirestore(admin.app(), { preferRest: true });

// Get Auth instance
const auth = admin.auth();

export { admin, db, auth };
