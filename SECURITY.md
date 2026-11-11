# Yönetici girişi

Yönetim sayfası ve giriş doğrulaması `server.js` üzerinden çalışır. Kimlik bilgileri tarayıcı JavaScript'ine yazılmaz; kullanıcı adı ve parola `.env` dosyasından okunur. Projeler ve araştırma notları MySQL'de `site_content` tablosunda saklanır.

1. `.env.example` dosyasını `.env` adıyla kopyala.
2. İlk yönetici hesabını oluşturmak için `.env` içindeki `ADMIN_USERNAME` ve `ADMIN_PASSWORD` değerlerini bir kez ayarla. Başlangıç sırasında parola salt ile scrypt hash olarak MySQL'e kaydedilir; ardından bu iki satırı `.env` dosyasından sil.
3. `.env` içindeki `DB_*` ve `MYSQL_ROOT_PASSWORD` ayarlarını benzersiz parolalarla doldur.
4. `docker compose up -d` komutuyla MySQL 8.4 veritabanını başlat. Sunucu ilk açılışta veritabanını oluşturur; site `site_content` tablosunu otomatik hazırlar.
5. `npm start` komutuyla siteyi başlat ve `http://localhost:3000` adresinden aç.
6. Farklı cihazların aynı içeriğe erişmesi için hem Node.js uygulama sunucusunu hem MySQL'i internete açık, güvenli bir barındırma ortamında çalıştır ve sunucuda `.env` değişkenlerini ayarla.
7. Yayına alırken HTTPS kullanan bir Node barındırma ortamı seç ve `NODE_ENV=production` ayarla. Bu durumda yönetici oturumu Secure, HttpOnly ve SameSite=Strict çereziyle tutulur.

Veritabanını düzenli olarak yedekle. `mysql-data` volume'u ve `.env` Git'e eklenmez.


Yönetici parolası MySQL'de düz metin yerine salt'lı scrypt hash olarak tutulur. Giriş denemeleri IP başına sınırlandırılır. Tek seferde bir yönetici oturumu açık kalabilir; yeni bir cihazdan başarılı giriş önceki oturumu geçersiz kılar. Açık yönetim sayfası oturumunu 10 saniyede bir kontrol eder. Oturumlar 30 dakika sonra sona erer ve sunucu yeniden başladığında geçersiz olur.
