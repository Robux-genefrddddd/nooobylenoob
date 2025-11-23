let admin: any = null;
let initialized = false;

async function getFirebaseAdmin() {
  if (admin) return admin;
  try {
    admin = await import("firebase-admin");
    return admin;
  } catch (err) {
    console.warn("Firebase Admin SDK not available:", err);
    return null;
  }
}

export async function initializeFirebaseAdmin() {
  if (initialized) return;

  if (
    !process.env.FIREBASE_PRIVATE_KEY ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.VITE_FIREBASE_PROJECT_ID
  ) {
    console.warn("Firebase Admin SDK credentials not fully configured");
    return;
  }

  try {
    const adminModule = await getFirebaseAdmin();
    if (!adminModule) return;

    if (adminModule.apps && adminModule.apps.length > 0) {
      initialized = true;
      return;
    }

    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || "service_account",
      project_id: process.env.VITE_FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };

    adminModule.initializeApp({
      credential: adminModule.credential.cert(serviceAccount),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });

    initialized = true;
  } catch (err) {
    console.error("Failed to initialize Firebase Admin SDK:", err);
  }
}

export async function getAdminAuth() {
  await initializeFirebaseAdmin();
  const adminModule = await getFirebaseAdmin();
  return adminModule && adminModule.apps && adminModule.apps.length > 0
    ? adminModule.auth()
    : null;
}

export async function getAdminDb() {
  await initializeFirebaseAdmin();
  const adminModule = await getFirebaseAdmin();
  return adminModule && adminModule.apps && adminModule.apps.length > 0
    ? adminModule.firestore()
    : null;
}

export const adminAuth = null;
export const adminDb = null;
