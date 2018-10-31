import * as admin from 'firebase-admin';
import firebaseCert from '../firebase-credentials';

admin.initializeApp({
  credential: admin.credential.cert(firebaseCert as admin.ServiceAccount),
});
admin.firestore().settings({
  timestampsInSnapshots: true,
});

export default admin.firestore();
