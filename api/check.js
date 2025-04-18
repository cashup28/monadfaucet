import { db } from '../../lib/firebase';
import { query, where, getDocs, collection } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { solanaWallet } = req.query;

  if (!solanaWallet) {
    return res.status(400).json({ error: 'Solana wallet required' });
  }

  try {
    const q = query(
      collection(db, 'registrations'),
      where("solanaWallet", "==", solanaWallet)
    );
    
    const querySnapshot = await getDocs(q);
    const registrations = [];
    
    querySnapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({
      registered: registrations.length > 0,
      registration: registrations[0] || null
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
}