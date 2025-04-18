import { db } from '../../lib/firebase';
import { collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { solanaWallet, monadAddress } = req.body;

  if (!solanaWallet || !monadAddress) {
    return res.status(400).json({ error: 'Eksik bilgi' });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(monadAddress)) {
    return res.status(400).json({ error: 'Geçersiz Monad adresi' });
  }

  try {
    const docRef = await addDoc(collection(db, 'registrations'), {
      userId: uuidv4(),
      solanaWallet,
      monadAddress,
      createdAt: new Date().toISOString()
    });

    return res.status(200).json({ 
      success: true,
      userId: docRef.id,
      solanaWallet,
      monadAddress,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}