import admin from 'firebase-admin'

if (admin.getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.cert(JSON.parse(serviceAccount)),
    })
  } else {
    admin.initializeApp({
      projectId: 'poker-tracker-52df8',
    })
  }
}

export default admin
