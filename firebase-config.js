// =====================================================================
// FIREBASE CONFIG — Rooty
// =====================================================================
// 1) اذهب إلى console.firebase.google.com → مشروعك → Project Settings (⚙️)
// 2) في أسفل الصفحة، قسم "Your apps"، انسخ كائن firebaseConfig بالكامل
// 3) استبدل القيم أدناه بالقيم الخاصة بك (كلها بين علامتي تنصيص "")
// =====================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCliyQjOWTMQkkDznAiHSXAHGxbbLCTeRw",
  authDomain: "rooty-498fa.firebaseapp.com",
  projectId: "rooty-498fa",
  storageBucket: "rooty-498fa.firebasestorage.app",
  messagingSenderId: "805666557960",
  appId: "1:805666557960:web:f37d9763f97d4b17a241bd"
};

// تهيئة Firebase (compat SDK — أبسط للاستخدام المباشر بـ <script> بدون أدوات بناء)
firebase.initializeApp(firebaseConfig);

// مراجع الخدمات التي سنستخدمها في كل الصفحات
const auth = firebase.auth();
const db   = firebase.firestore();

// =====================================================================
// فحص أمان: يتأكد أنك استبدلت القيم الافتراضية بقيمك الحقيقية.
// إذا نسيت تعديل firebaseConfig أعلاه، ستظهر رسالة واضحة في الصفحة
// بدل أن يفشل كل شيء بصمت بدون أي تفسير.
// =====================================================================
(function checkFirebaseConfig() {
  const stillDefault = Object.values(firebaseConfig).some(
    v => typeof v === 'string' && v.includes('PASTE_YOUR')
  );
  if (stillDefault) {
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#DC2626;color:white;' +
      'padding:14px 20px;text-align:center;font-family:sans-serif;font-size:14px;z-index:99999;';
    banner.innerHTML = '⚠️ Firebase non configuré : ouvrez <code>js/firebase-config.js</code> et remplacez les valeurs PASTE_YOUR_... par votre vrai firebaseConfig (Console Firebase → ⚙️ Paramètres du projet → Vos applications).';
    document.body.prepend(banner);
    console.error('[Rooty] firebase-config.js contient encore les valeurs par défaut. Remplacez-les par votre configuration Firebase réelle.');
  }
})();

// =====================================================================
// أسماء المجموعات (Collections) في Firestore — مرجع موحّد لتجنب الأخطاء الإملائية
// =====================================================================
const COL_DRIVERS  = "drivers";   // بيانات أصحاب الشاحنات
const COL_REQUESTS = "requests";  // طلبات النقل
