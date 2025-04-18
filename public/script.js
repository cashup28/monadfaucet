// Global değişkenler
let solanaWallet = null;
const connectWalletBtn = document.getElementById('connect-wallet');
const walletStatus = document.getElementById('wallet-status');
const monadAddressInput = document.getElementById('monad-address');
const registerBtn = document.getElementById('register-btn');
const messageDiv = document.getElementById('message');

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  initWallet();
  setupEventListeners();
});

// Event listeners
function setupEventListeners() {
  monadAddressInput.addEventListener('input', validateMonadAddress);
  registerBtn.addEventListener('click', handleRegistration);
}

// Monad adres validasyonu
function validateMonadAddress() {
  const address = monadAddressInput.value.trim();
  const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
  
  monadAddressInput.style.borderColor = isValid ? '#4CAF50' : '#f44336';
  registerBtn.disabled = !isValid || !solanaWallet;
  
  return isValid;
}

// Kayıt işlemi
async function handleRegistration() {
  if (!solanaWallet) {
    showMessage("Önce cüzdanı bağlayın", 'error');
    return;
  }

  const monadAddress = monadAddressInput.value.trim();
  if (!validateMonadAddress()) {
    showMessage("Geçersiz Monad adresi", 'error');
    return;
  }

  setLoading(registerBtn, true);
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        solanaWallet,
        monadAddress
      })
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Kayıt başarısız');

    showMessage("Kayıt başarıyla oluşturuldu!", 'success');
    showProfile({
      userId: data.userId,
      solanaWallet,
      monadAddress,
      createdAt: new Date().toISOString()
    });
    
    monadAddressInput.disabled = true;
    registerBtn.disabled = true;
  } catch (err) {
    console.error('Kayıt hatası:', err);
    showMessage(`Kayıt hatası: ${err.message}`, 'error');
  } finally {
    setLoading(registerBtn, false);
  }
}

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
    showMessage("Cüzdan başarıyla bağlandı", 'success');
  } catch (err) {
    console.error("Bağlantı hatası:", err);
    showMessage(`Bağlantı hatası: ${err.message}`, 'error');
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
    showMessage("Cüzdan bağlantısı kesildi", 'info');
  } catch (err) {
    console.error("Çıkış hatası:", err);
    showMessage(`Çıkış başarısız: ${err.message}`, 'error');
  } finally {
    setLoading(connectWalletBtn, false);
  }
}

// Cüzdan UI güncelleme
function updateWalletUI() {
  walletStatus.textContent = `Bağlı cüzdan: ${shortAddress(solanaWallet)}`;
  connectWalletBtn.textContent = "Bağlantıyı Kes";
  connectWalletBtn.classList.add('connected');
  monadAddressInput.disabled = false;
  monadAddressInput.focus();
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
  monadAddressInput.value = '';
  
  const profileCard = document.querySelector('.profile-card');
  if (profileCard) profileCard.remove();
}

// Mesaj gösterme
function showMessage(message, type) {
  messageDiv.textContent = message;
  messageDiv.className = `message-box ${type}`;
  setTimeout(() => messageDiv.classList.remove(type), 5000);
}

// Profil gösterme
function showProfile(data) {
  const profileHTML = `
    <div class="profile-card">
      <h3>Profil Bilgileri</h3>
      <div class="profile-info">
        <p><strong>Kullanıcı ID:</strong> ${data.userId}</p>
        <p><strong>Solana Cüzdan:</strong> ${shortAddress(data.solanaWallet)}</p>
        <p><strong>Monad Adres:</strong> ${shortAddress(data.monadAddress)}</p>
        <p><strong>Kayıt Tarihi:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
      </div>
    </div>
  `;
  document.getElementById('profile-display').innerHTML = profileHTML;
}

// Cüzdan başlatma
function initWallet() {
  monadAddressInput.disabled = true;
  registerBtn.disabled = true;
  
  if (window.solana?.isPhantom) {
    window.solana.on('connect', () => handleWalletConnect());
    window.solana.on('disconnect', () => resetWallet());
    
    if (window.solana.isConnected) {
      handleWalletConnect();
    }
  }
}