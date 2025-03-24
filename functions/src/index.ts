import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// ✅ Optional HTTP function
export const helloWorld = functions.https.onRequest((req, res) => {
  res.send("🌍 Hello from Firebase!");
});

// ✅ Secure Callable Function – Admin Verification
export const checkAdminStatus = functions.https.onCall((data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }

  const uid = context.auth.uid;
  const isAdmin = context.auth.token?.admin === true;

  // Deny if not an admin
  if (!isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Admins only.");
  }

  // Return response if admin is verified
  return {
    message: `✅ Admin verified for UID: ${uid}`,
    isAdmin: true,
  };
});
