// =====================================================================
// REQUESTS.JS — إنشاء وقراءة وتحديث طلبات النقل (Firestore)
// =====================================================================
// يجب تحميل هذا الملف بعد firebase-config.js في كل صفحة تتعامل مع الطلبات.

/**
 * إنشاء طلب نقل جديد في Firestore.
 * يُستخدم في صفحة demande.html — لا يتطلب تسجيل دخول (العميل ليس مستخدماً مسجلاً).
 */
async function creerDemandeFirebase(data) {
  const docRef = await db.collection(COL_REQUESTS).add({
    ...data,
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return docRef.id;
}

/**
 * جلب كل الطلبات بحالة معيّنة (pending / accepted / rejected)، الأحدث أولاً.
 * يُستخدم في dashboard.html لعرض القوائم.
 */
async function getRequestsByStatus(status) {
  const snapshot = await db.collection(COL_REQUESTS)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * الاستماع المباشر (Real-time) للطلبات بحالة معيّنة.
 * كل تغيير في Firestore (طلب جديد، قبول، رفض من سائق آخر متصل في نفس الوقت)
 * يُحدّث الواجهة فوراً بدون إعادة تحميل الصفحة.
 * يُرجع دالة "unsubscribe" لإيقاف الاستماع عند تغيير التبويب أو مغادرة الصفحة.
 */
function listenRequestsByStatus(status, callback) {
  return db.collection(COL_REQUESTS)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(requests);
    }, (error) => {
      console.error("Erreur d'écoute Firestore:", error);
    });
}

/** جلب إحصائيات عامة (عدد الطلبات بكل حالة) لعرضها في أعلى لوحة التحكم */
async function getRequestsStats() {
  const snapshot = await db.collection(COL_REQUESTS).get();
  const all = snapshot.docs.map(doc => doc.data());
  return {
    total:    all.length,
    pending:  all.filter(r => r.status === "pending").length,
    accepted: all.filter(r => r.status === "accepted").length,
    rejected: all.filter(r => r.status === "rejected").length
  };
}

/**
 * تحديث حالة طلب (قبول أو رفض)، مع تسجيل أي سائق قام بالإجراء.
 * driverId / driverName اختياريان لكن يُنصح بهما لمعرفة "من قَبِل ماذا" لاحقاً.
 */
async function updateRequestStatus(requestId, status, driverInfo = {}) {
  await db.collection(COL_REQUESTS).doc(requestId).update({
    status,
    handledBy: driverInfo.id || null,
    handledByName: driverInfo.name || null,
    handledAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}
