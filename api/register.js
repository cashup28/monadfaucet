import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { solanaWallet, monadAddress } = req.body;

    // Validasyon
    if (!solanaWallet || !monadAddress) {
      return res.status(400).json({ 
        success: false,
        error: 'Eksik bilgi: Cüzdan ve adres gereklidir' 
      });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(monadAddress)) {
      return res.status(400).json({ 
        success: false,
        error: 'Geçersiz Monad adresi formatı' 
      });
    }

    // Tekil kontrolü
    const q = query(collection(db, 'registrations'), where("solanaWallet", "==", solanaWallet));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return res.status(400).json({ 
        success: false,
        error: 'Bu cüzdan zaten kayıtlı' 
      });
    }

    // Yeni kayıt
    const docRef = await addDoc(collection(db, 'registrations'), {
      userId: uuidv4(),
      solanaWallet,
      monadAddress,
      createdAt: new Date().toISOString(),
      status: 'active'
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
    return res.status(500).json({ 
      success: false,
      error: 'Sunucu hatası: ' + err.message 
    });
  }
}