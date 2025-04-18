// DOM Elementleri
const connectWalletBtn = document.getElementById('connect-wallet');
const walletStatus = document.getElementById('wallet-status');
const monadAddressInput = document.getElementById('monad-address');
const registerBtn = document.getElementById('register-btn');
const messageDiv = document.getElementById('message');
const profileDiv = document.getElementById('profile');

let solanaWallet = null;

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    await initWallet();
    setupEventListeners();
});

// Cüzdan Başlatma
async function initWallet() {
    // Phantom Wallet kontrolü
    if (window.solana?.isPhantom) {
        try {
            // Otomatik bağlantıyı kontrol et
            if (window.solana.isConnected) {
                const response = await window.solana.connect();
                solanaWallet = response.publicKey.toString();
                updateUI();
            }
            
            // Event listener'ları ayarla
            window.solana.on('connect', () => {
                solanaWallet = window.solana.publicKey.toString();
                updateUI();
            });
            
            window.solana.on('disconnect', () => {
                solanaWallet = null;
                updateUI();
            });
            
        } catch (err) {
            showMessage(`Cüzdan bağlantı hatası: ${err.message}`, 'error');
        }
    } else {
        showMessage("Phantom Wallet yüklü değil", 'error');
        connectWalletBtn.textContent = "Phantom Yükle";
        connectWalletBtn.onclick = () => window.open('https://phantom.app/', '_blank');
    }
}

// Cüzdan Bağlantı Butonu
connectWalletBtn.addEventListener('click', async () => {
    try {
        if (!window.solana) {
            throw new Error("Phantom Wallet bulunamadı");
        }
        
        if (solanaWallet) {
            await window.solana.disconnect();
        } else {
            const response = await window.solana.connect();
            solanaWallet = response.publicKey.toString();
            updateUI();
            showMessage("Cüzdan başarıyla bağlandı", 'success');
        }
    } catch (err) {
        console.error("Cüzdan işlemi hatası:", err);
        showMessage(`Hata: ${err.message}`, 'error');
    }
});

// Monad Adres Validasyonu
monadAddressInput.addEventListener('input', () => {
    validateMonadAddress();
});

function validateMonadAddress() {
    const address = monadAddressInput.value.trim();
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    registerBtn.disabled = !isValid || !solanaWallet;
    monadAddressInput.style.borderColor = isValid ? '#4CAF50' : '#f44336';
    return isValid;
}

// Kayıt Butonu
registerBtn.addEventListener('click', async () => {
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solanaWallet, monadAddress })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Kayıt başarısız');
        }

        showProfile(data);
        showMessage("Kayıt başarılı!", 'success');
        monadAddressInput.disabled = true;
        registerBtn.disabled = true;
    } catch (err) {
        console.error('Kayıt hatası:', err);
        showMessage(`Kayıt hatası: ${err.message}`, 'error');
    } finally {
        setLoading(registerBtn, false);
    }
});

// UI Güncelleme
function updateUI() {
    if (solanaWallet) {
        walletStatus.textContent = `Bağlı cüzdan: ${shortAddress(solanaWallet)}`;
        connectWalletBtn.textContent = "Bağlantıyı Kes";
        monadAddressInput.disabled = false;
        registerBtn.disabled = !validateMonadAddress();
    } else {
        walletStatus.textContent = "Solana cüzdanı bağlı değil";
        connectWalletBtn.textContent = "Cüzdanı Bağla";
        monadAddressInput.disabled = true;
        monadAddressInput.value = "";
        registerBtn.disabled = true;
        profileDiv.innerHTML = "";
    }
}

// Yardımcı Fonksiyonlar
function shortAddress(address, start = 4, end = 4) {
    return address ? `${address.substring(0, start)}...${address.substring(address.length - end)}` : '';
}

function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = type;
    setTimeout(() => messageDiv.textContent = '', 5000);
}

function setLoading(element, isLoading) {
    element.disabled = isLoading;
    if (isLoading) {
        element.dataset.originalText = element.textContent;
        element.innerHTML = `<span class="loading-spinner"></span> İşleniyor...`;
    } else {
        element.textContent = element.dataset.originalText;
    }
}

function showProfile(data) {
    profileDiv.innerHTML = `
        <div class="profile-card">
            <h3>Profil Bilgileri</h3>
            <p><strong>Solana:</strong> ${shortAddress(data.solanaWallet)}</p>
            <p><strong>Monad:</strong> ${shortAddress(data.monadAddress)}</p>
            <p><strong>Kayıt Tarihi:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
        </div>
    `;
}

// Event Listener Setup
function setupEventListeners() {
    // Diğer event listener'lar zaten tanımlı
}