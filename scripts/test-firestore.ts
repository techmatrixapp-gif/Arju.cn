import { db, auth } from "../src/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

async function main() {
  console.log("Testing Firestore connection to project:", db.app.options.projectId);
  
  // 1. Try reading public doc
  try {
    const snap = await getDoc(doc(db, "menuCategories", "starters"));
    console.log("Read menuCategories/starters success, exists:", snap.exists());
  } catch (err: any) {
    console.error("Read failed:", err.code, err.message);
  }

  // 2. Try unauthenticated write
  try {
    await setDoc(doc(db, "test_col", "unauth_test"), { ts: new Date().toISOString() });
    console.log("Unauthenticated write succeeded!");
  } catch (err: any) {
    console.error("Unauthenticated write failed:", err.code, err.message);
  }

  // 3. Try anonymous sign-in
  try {
    const userCred = await signInAnonymously(auth);
    console.log("Anonymous sign-in succeeded! UID:", userCred.user.uid);
    await setDoc(doc(db, "test_col", "anon_test"), { ts: new Date().toISOString(), uid: userCred.user.uid });
    console.log("Authenticated write succeeded!");
  } catch (err: any) {
    console.error("Anonymous auth/write failed:", err.code, err.message);
  }
}

main().then(() => process.exit(0)).catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
