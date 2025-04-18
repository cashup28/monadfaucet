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

    // Response'u kontrol et
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Kayıt başarısız');
    }

    showMessage("Kayıt başarıyla oluşturuldu!", 'success');
    showProfile({
      userId: data.userId,
      solanaWallet: data.solanaWallet,
      monadAddress: data.monadAddress,
      createdAt: data.createdAt
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