// DOM Elementleri
const connectWalletBtn = document.getElementById('connect-wallet');
const walletStatus = document.getElementById('wallet-status');
const monadAddressInput = document.getElementById('monad-address');
const registerBtn = document.getElementById('register-btn');
const messageDiv = document.getElementById('message');
const profileDiv = document.getElementById('profile');

let solanaWallet = null;

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    initWallet();
});

// Cüzdan Başlatma
function initWallet() {
    // Phantom Wallet kontrolü
    if (window.solana && window.solana.isPhantom) {
        setupWalletEvents();
    } else {
        showMessage("Phantom Wallet yüklü değil. Lütfen yükleyin.", 'error');
        connectWalletBtn.textContent = "Phantom Yükle";
        connectWalletBtn.onclick = () => window.open('https://phantom.app/', '_blank');
    }
}

// Cüzdan Event'leri
function setupWalletEvents() {
    window.solana.on('connect', () => {
        solanaWallet = window.solana.publicKey.toString();
        updateUI();
    });

    window.solana.on('disconnect', () => {
        solanaWallet = null;
        updateUI();
    });

    // Eğer önceden bağlıysa
    if (window.solana.isConnected) {
        solanaWallet = window.solana.publicKey.toString();
        updateUI();
    }
}

// Cüzdan Bağlantı Butonu
connectWalletBtn.addEventListener('click', async () => {
    try {
        if (solanaWallet) {
            await window.solana.disconnect();
        } else {
            await window.solana.connect();
        }
    } catch (err) {
        showMessage(`Hata: ${err.message}`, 'error');
    }
});

// Monad Adres Validasyonu
monadAddressInput.addEventListener('input', () => {
    const address = monadAddressInput.value.trim();
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    registerBtn.disabled = !isValid;
    monadAddressInput.style.borderColor = isValid ? '#4CAF50' : '#f44336';
});

// Kayıt Butonu
registerBtn.addEventListener('click', async () => {
    if (!solanaWallet || !monadAddressInput.value) return;

    setLoading(registerBtn, true);
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                solanaWallet,
                monadAddress: monadAddressInput.value.trim()
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Kayıt başarısız');

        showProfile(data);
        showMessage("Kayıt başarılı!", 'success');
    } catch (err) {
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
    return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
}

function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = type;
    setTimeout(() => messageDiv.textContent = '', 5000);
}

function setLoading(element, isLoading) {
    element.disabled = isLoading;
    element.innerHTML = isLoading 
        ? `<span class="loading-spinner"></span> İşleniyor...` 
        : element.dataset.originalText;
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