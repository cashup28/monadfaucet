// pages/api/register.js
import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  // CORS headers ekleyelim
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
        error: 'Solana cüzdanı ve Monad adresi gereklidir' 
      });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(monadAddress)) {
      return res.status(400).json({ 
        success: false,
        error: 'Geçersiz Monad adresi formatı' 
      });
    }

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
      return res.status(400).json({ 
        success: false,
        error: 'Bu cüzdan zaten kayıtlı' 
      });
    }

    if (!addressSnapshot.empty) {
      return res.status(400).json({ 
        success: false,
        error: 'Bu Monad adresi zaten kullanılmış' 
      });
    }

    // Yeni kayıt oluştur
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
      docId: docRef.id,
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