import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  // ... önceki kontroller

  try {
    // Aynı cüzdan için kayıt kontrolü
    const q = query(
      collection(db, 'registrations'),
      where("solanaWallet", "==", solanaWallet)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return res.status(400).json({ error: 'Bu cüzdan zaten kayıtlı' });
    }

    // Aynı Monad adresi kontrolü
    const monadQuery = query(
      collection(db, 'registrations'),
      where("monadAddress", "==", monadAddress)
    );
    const monadSnapshot = await getDocs(monadQuery);

    if (!monadSnapshot.empty) {
      return res.status(400).json({ error: 'Bu Monad adresi zaten kullanılmış' });
    }

    // Yeni kayıt oluştur
    const userId = uuidv4(); // Benzersiz kullanıcı ID
    const docRef = await addDoc(collection(db, 'registrations'), {
      userId,
      solanaWallet,
      monadAddress,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    return res.status(200).json({ 
      success: true,
      userId,
      docId: docRef.id
    });

  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
}