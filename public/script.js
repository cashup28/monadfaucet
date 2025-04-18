// Global değişkenler
let solanaWallet = null;
const connectWalletBtn = document.getElementById('connect-wallet');
const walletStatus = document.getElementById('wallet-status');
const monadAddressInput = document.getElementById('monad-address');
const registerBtn = document.getElementById('register-btn');
const messageDiv = document.getElementById('message');

// Sayfa yüklendiğinde cüzdan durumunu kontrol et
document.addEventListener('DOMContentLoaded', () => {
  initWallet();
});

// Cüzdan başlatma
async function initWallet() {
  if (window.solana?.isPhantom) {
    window.solana.on('connect', () => {
      console.log("Cüzdan otomatik bağlandı");
      handleWalletConnect();
    });
    
    window.solana.on('disconnect', () => {
      console.log("Cüzdan bağlantısı kesildi");
      resetWallet();
    });
    
    // Eğer önceden bağlıysa
    if (window.solana.isConnected) {
      await handleWalletConnect();
    }
  }
}

// Cüzdan bağlantı/çıkış butonu
connectWalletBtn.addEventListener('click', async () => {
  try {
    if (solanaWallet) {
      await handleWalletDisconnect();
    } else {
      await handleWalletConnect();
    }
  } catch (err) {
    console.error('Cüzdan işlemi hatası:', err);
    showMessage(`Hata: ${err.message}`, 'error');
  }
});

// Bağlantı fonksiyonu
async function handleWalletConnect() {
  if (!window.solana) {
    showMessage("Phantom Wallet bulunamadı. Lütfen yükleyin.", 'error');
    window.open('https://phantom.app/', '_blank');
    return;
  }

  setLoading(connectWalletBtn, true);
  try {
    const response = await window.solana.connect();
    solanaWallet = response.publicKey.toString();
    updateWalletUI();
    await checkExistingRegistration();
    showMessage("Cüzdan başarıyla bağlandı", 'success');
  } catch (err) {
    console.error("Bağlantı hatası:", err);
    showMessage(`Bağlantı başarısız: ${err.message}`, 'error');
  } finally {
    setLoading(connectWalletBtn, false);
  }
}

// Çıkış fonksiyonu
async function handleWalletDisconnect() {
  setLoading(connectWalletBtn, true);
  try {
    await window.solana.disconnect();
    resetWallet();
    showMessage("Cüzdan bağlantısı kesildi", 'info');
  } catch (err) {
    console.error("Çıkış hatası:", err);
    showMessage(`Çıkış başarısız: ${err.message}`, 'error');
  } finally {
    setLoading(connectWalletBtn, false);
  }
}
// Cüzdan bağlantı/çıkış butonu işleyicisi
connectWalletBtn.addEventListener('click', async () => {
  try {
    if (solanaWallet) {
      await handleWalletDisconnect();
    } else {
      await handleWalletConnect();
    }
  } catch (err) {
    console.error('Cüzdan işlemi hatası:', err);
    showMessage(`İşlem başarısız: ${err.message}`, 'error');
  }
});

// Cüzdan bağlantı fonksiyonu
async function handleWalletConnect() {
  if (!window.solana?.isPhantom) {
    showMessage("Phantom cüzdanı yüklü değil. Lütfen yükleyin.", 'error');
    window.open('https://phantom.app/', '_blank');
    return;
  }

  setLoading(connectWalletBtn, true);
  try {
    const response = await window.solana.connect();
    solanaWallet = response.publicKey.toString();
    updateWalletUI();
    await checkExistingRegistration();
  } finally {
    setLoading(connectWalletBtn, false);
  }
}

// Cüzdan çıkış fonksiyonu
async function handleWalletDisconnect() {
  setLoading(connectWalletBtn, true);
  try {
    await window.solana.disconnect();
    resetWallet();
    showMessage("Cüzdan bağlantısı kesildi", 'success');
  } finally {
    setLoading(connectWalletBtn, false);
  }
}

// Cüzdan UI güncelleme
function updateWalletUI() {
  walletStatus.textContent = `Bağlı cüzdan: ${shortAddress(solanaWallet)}`;
  connectWalletBtn.textContent = "Cüzdanı Bağlantısını Kes";
  connectWalletBtn.classList.add('connected');
}

// Kayıt kontrol fonksiyonu (gelişmiş versiyon)
async function checkExistingRegistration() {
  try {
    setLoading(registerBtn, true);
    monadAddressInput.disabled = true;
    
    const response = await fetch(`/api/check?solanaWallet=${encodeURIComponent(solanaWallet)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.registered) {
      showProfile(data.registration);
      registerBtn.disabled = true;
      showMessage("Daha önce kayıt olunmuş", 'info');
    } else {
      monadAddressInput.disabled = false;
      registerBtn.disabled = false;
      showMessage("Yeni kayıt oluşturabilirsiniz", 'info');
    }
  } catch (err) {
    console.error('Kayıt kontrol hatası:', err);
    showMessage("Kayıt bilgileri alınamadı", 'error');
    // Kullanıcıya devam etme şansı ver
    monadAddressInput.disabled = false;
    registerBtn.disabled = false;
  } finally {
    setLoading(registerBtn, false);
  }
}

// Kısa adres formatı
function shortAddress(address, start = 4, end = 4) {
  return address 
    ? `${address.substring(0, start)}...${address.substring(address.length - end)}`
    : '';
}

// Yükleme durumu fonksiyonu
function setLoading(element, isLoading) {
  if (!element) return;
  
  element.disabled = isLoading;
  if (isLoading) {
    element.dataset.originalText = element.textContent;
    element.innerHTML = `<span class="loading-spinner"></span> ${element.textContent}`;
  } else {
    element.textContent = element.dataset.originalText || element.textContent;
  }
}

// Cüzdan sıfırlama
function resetWallet() {
  solanaWallet = null;
  walletStatus.textContent = "Cüzdan bağlı değil";
  connectWalletBtn.textContent = "Cüzdanı Bağla";
  connectWalletBtn.classList.remove('connected');
  monadAddressInput.disabled = true;
  registerBtn.disabled = true;
  
  // Profili temizle
  const profileCard = document.querySelector('.profile-card');
  if (profileCard) profileCard.remove();
}