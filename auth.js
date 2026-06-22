// =====================================================================
// AUTH.JS — التسجيل، تسجيل الدخول، وإدارة جلسة السائق (Firebase Auth + Firestore)
// =====================================================================
// يجب تحميل هذا الملف بعد firebase-config.js في كل صفحة تحتاج التوثيق.

/**
 * تسجيل سائق جديد:
 * 1) ينشئ حساب في Firebase Authentication (email + password)
 * 2) يخزّن باقي البيانات (الاسم، الهاتف، الشاحنة...) في Firestore
 *    تحت collection "drivers" بنفس uid الخاص بالحساب
 */
async function inscrireDriverFirebase(data) {
  const { email, password, ...profile } = data;

  // 1) إنشاء الحساب في Authentication
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const uid = userCredential.user.uid;

  // 2) تخزين بيانات البروفيل في Firestore (بدون كلمة المرور أبداً)
  const driverDoc = {
    ...profile,
    email,
    rating: 0,
    totalRatings: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  await db.collection(COL_DRIVERS).doc(uid).set(driverDoc);

  return uid;
}

/**
 * تسجيل الدخول بالبريد وكلمة المرور.
 * Firebase Auth يتولى التحقق من كلمة المرور تلقائياً (لا حاجة لمقارنتها يدوياً).
 */
async function seConnecterFirebase(email, password) {
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  return userCredential.user.uid;
}

/** تسجيل الخروج */
async function seDeconnecterFirebase() {
  await auth.signOut();
}

/** جلب بيانات بروفيل السائق الحالي من Firestore عبر uid */
async function getDriverProfile(uid) {
  const docSnap = await db.collection(COL_DRIVERS).doc(uid).get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Guard للصفحات المحمية (مثل dashboard.html):
 * onAuthStateChanged ينتظر Firebase حتى يتأكد من حالة الجلسة (مهم لأن الفحص ليس فورياً).
 * يُرجع Promise يحتوي بيانات السائق، أو يحوّل المستخدم لصفحة الدخول إذا لم يكن متصلاً.
 */
function requireAuth() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = "connexion.html";
        return;
      }
      const profile = await getDriverProfile(user.uid);
      if (!profile) {
        // حساب موجود في Auth لكن بدون بروفيل في Firestore (حالة نادرة) — أمان إضافي
        await seDeconnecterFirebase();
        window.location.href = "connexion.html";
        return;
      }
      resolve(profile);
    });
  });
}

/** ترجمة أكواد أخطاء Firebase الإنجليزية إلى رسائل عربية/فرنسية مفهومة للمستخدم */
function translateFirebaseError(error) {
  const map = {
    "auth/email-already-in-use": "Un compte existe déjà avec cet email.",
    "auth/invalid-email": "Adresse email invalide.",
    "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
    "auth/user-not-found": "Aucun compte trouvé avec cet email.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "Email ou mot de passe incorrect.",
    "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard.",
    "auth/network-request-failed": "Problème de connexion réseau."
  };
  return map[error.code] || "Une erreur est survenue. Veuillez réessayer.";
}
