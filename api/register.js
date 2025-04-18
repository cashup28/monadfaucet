// pages/api/register.js
import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { solanaWallet, monadAddress } = req.body;

  // Validasyon
  if (!solanaWallet || !monadAddress) {
    return res.status(400).json({ error: 'Eksik bilgi' });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(monadAddress)) {
    return res.status(400).json({ error: 'Geçersiz Monad adresi' });
  }

  try {
    // Tekil kontrolü
    const walletQuery = query(collection(db, 'registrations'), 
      where("solanaWallet", "==", solanaWallet));
    const addressQuery = query(collection(db, 'registrations'),
      where("monadAddress", "==", monadAddress));

    const [walletSnapshot, addressSnapshot] = await Promise.all([
      getDocs(walletQuery),
      getDocs(addressQuery)
    ]);

    if (!walletSnapshot.empty) {
      return res.status(400).json({ error: 'Bu cüzdan zaten kayıtlı' });
    }

    if (!addressSnapshot.empty) {
      return res.status(400).json({ error: 'Bu adres zaten kullanılmış' });
    }

    // Yeni kayıt
    const userId = uuidv4();
    const docRef = await addDoc(collection(db, 'registrations'), {
      userId,
      solanaWallet,
      monadAddress,
      createdAt: new Date().toISOString(),
      status: 'active'
    });

    return res.status(200).json({ 
      success: true,
      userId,
      docId: docRef.id
    });

  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}