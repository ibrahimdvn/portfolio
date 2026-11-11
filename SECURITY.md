# Yönetici girişi

Yönetim sayfası ve giriş doğrulaması `server.js` üzerinden çalışır. Kimlik bilgileri tarayıcı JavaScript'ine veya depoya yazılmaz; parola MySQL'de salt'lı scrypt hash olarak saklanır. Projeler ve araştırma notları MySQL'de `site_content` tablosunda saklanır.

1. `.env.example` dosyasını `.env` adıyla kopyala ve içindeki MySQL ayarlarını doldur.
2. `docker compose up -d` komutuyla MySQL 8.4 veritabanını başlat.
3. `npm install` ve `npm run admin:create` komutlarını çalıştır. Yönetici bilgileri yalnızca yerel terminalde girilir; parola salt'lı scrypt hash olarak MySQL'e kaydedilir.
4. `npm start` komutuyla siteyi başlat ve `http://localhost:3000` adresinden aç.
5. Farklı cihazların aynı içeriğe erişmesi için hem Node.js uygulama sunucusunu hem MySQL'i internete açık, güvenli bir barındırma ortamında çalıştır ve sunucuda gizli `.env` değerlerini ayarla.
6. Yayına alırken HTTPS kullanan bir Node barındırma ortamı seç ve `NODE_ENV=production` ayarla. Bu durumda yönetici oturumu Secure, HttpOnly ve SameSite=Strict çereziyle tutulur.

Veritabanını düzenli olarak yedekle. `mysql-data` volume'u ve `.env` Git'e eklenmez.


Yönetici parolası MySQL'de düz metin yerine salt'lı scrypt hash olarak tutulur. Giriş denemeleri IP başına sınırlandırılır. Tek seferde bir yönetici oturumu açık kalabilir; yeni bir cihazdan başarılı giriş önceki oturumu geçersiz kılar. Açık yönetim sayfası oturumunu 10 saniyede bir kontrol eder. Oturumlar 30 dakika sonra sona erer ve sunucu yeniden başladığında geçersiz olur.
