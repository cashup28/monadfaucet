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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ solanaWallet, monadAddress })
      });

      // Önce yanıtı text olarak al
      const responseText = await response.text();
      let data;
      
      try {
          data = JSON.parse(responseText); // JSON'a çevirmeyi dene
      } catch (e) {
          // JSON parse hatası durumunda
          console.error("JSON Parse Hatası:", e);
          console.error("Sunucu Yanıtı:", responseText);
          throw new Error(`Sunucu geçersiz yanıt verdi: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
          throw new Error(data.error || `HTTP Hatası: ${response.status}`);
      }

      if (!data.success) {
          throw new Error(data.error || 'Kayıt başarısız');
      }

      showProfile(data);
      showMessage("Kayıt başarılı!", 'success');
      monadAddressInput.disabled = true;
      registerBtn.disabled = true;

  } catch (err) {
      console.error('Kayıt Hatası:', err);
      showMessage(`Kayıt başarısız: ${err.message}`, 'error');
  } finally {
      setLoading(registerBtn, false);
  }
}