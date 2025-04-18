document.addEventListener('DOMContentLoaded', () => {
    const connectWalletBtn = document.getElementById('connect-wallet');
    const registerBtn = document.getElementById('register-btn');
    const walletStatus = document.getElementById('wallet-status');
    const monadAddressInput = document.getElementById('monad-address');
    const messageDiv = document.getElementById('message');
    
    let solanaWallet = null;
    
    // Cüzdan bağlama işlemi
    connectWalletBtn.addEventListener('click', async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                solanaWallet = response.publicKey.toString();
                walletStatus.textContent = `Bağlı cüzdan: ${solanaWallet.substring(0, 6)}...${solanaWallet.substring(solanaWallet.length - 4)}`;
                connectWalletBtn.textContent = "Cüzdan Bağlı";
                connectWalletBtn.disabled = true;
                registerBtn.disabled = false;
            } catch (err) {
                showMessage(`Cüzdan bağlanırken hata: ${err.message}`, 'error');
            }
        } else {
            showMessage("Phantom cüzdanı bulunamadı. Lütfen yükleyin.", 'error');
        }
    });
    
    // Kayıt işlemi
    registerBtn.addEventListener('click', async () => {
        const monadAddress = monadAddressInput.value.trim();
        
        if (!monadAddress || !monadAddress.startsWith('0x') || monadAddress.length !== 42) {
            showMessage("Geçersiz Monad EVM adresi", 'error');
            return;
        }
        
        try {
            // Burada backend'e istek atılacak
            showMessage("Kayıt işlemi başarılı!", 'success');
            
            // Örnek API isteği:
            /*
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    solanaWallet: solanaWallet,
                    monadAddress: monadAddress
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                showMessage("Kayıt işlemi başarılı!", 'success');
            } else {
                showMessage(`Hata: ${data.error}`, 'error');
            }
            */
        } catch (err) {
            showMessage(`Kayıt sırasında hata: ${err.message}`, 'error');
        }
    });
    
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = type;
    }
});