# İbrahim Can Düven — Merakın İzinde

Teknoloji, bilim ve insan üzerine merakla düşünen İbrahim Can Düven'in kişisel sitesi. Projeler, araştırma yazıları ve öğrenme yolculuğu bu sitede yer alır.

## Teknoloji

- Node.js ile çalışan web sunucusu ve API
- MySQL 8.4 veritabanı
- Yönetim panelinde proje ve araştırma yazısı ekleme, düzenleme, silme ve yedekleme
- Duyarlı tasarım ve Türkçe/İngilizce arayüz

Proje ve araştırma içerikleri merkezi MySQL veritabanında tutulur. Tarayıcı, içerikleri `/api/content` uç noktasından alır. Yönetim panelindeki kaydetme işlemleri bu veritabanına yazılır; tarayıcılar arasında ortak içerik için Node.js sunucusunun ve MySQL'in erişilebilir olması gerekir.

## Gereksinimler

- Node.js 20.6 veya üzeri
- Docker Desktop ve Docker Compose

## İlk kurulum

1. Proje klasöründe `.env.example` dosyasını `.env` adıyla kopyala.
2. `.env` içindeki `DB_PASSWORD` ve `MYSQL_ROOT_PASSWORD` alanlarına birbirinden farklı, güçlü parolalar yaz. `DB_HOST`, `DB_PORT` ve `DB_NAME` değerlerini kullanacağın MySQL ortamına göre ayarla.
3. İlk yönetici hesabı için `ADMIN_USERNAME` ve `ADMIN_PASSWORD` alanlarını doldur. Bu değerler yalnızca veritabanında ilk yönetici hesabı oluşturulurken kullanılır.
4. MySQL'i başlat:

   ```powershell
   docker compose up -d
   ```

5. Site sunucusunu başlat:

   ```powershell
   npm install
   npm start
   ```

6. Siteyi `http://localhost:3000` adresinde aç. Yönetim ekranına sitenin altındaki **İçerik yönetimi** bağlantısından ulaş.
7. İlk başarılı başlatmadan sonra `.env` dosyasındaki `ADMIN_USERNAME` ve `ADMIN_PASSWORD` satırlarını sil. Parola veritabanında salt eklenmiş scrypt hash olarak saklanır.

Site, `site_content` ve `admin_credentials` tablolarını otomatik oluşturur. SQL şeması ayrıca `schema.sql` dosyasındadır.

## Komutlar

```powershell
# MySQL servisini başlat
docker compose up -d

# MySQL durumunu görüntüle
docker compose ps

# Web uygulamasını başlat
npm start

# MySQL servisini durdur (veriler kalıcı volume'da korunur)
docker compose stop
```

`docker-compose.yml` içindeki `name: elsewhere` değerini değiştirme; mevcut Docker veri volume'unun adını sabit tutar. MySQL verileri `mysql-data` adlı kalıcı Docker volume'unda saklanır.

## Yönetim ve oturum güvenliği

- Yönetici parolası düz metin olarak saklanmaz; salt eklenmiş scrypt hash kullanılır.
- Giriş denemeleri IP adresine göre sınırlandırılır.
- Bir seferde tek yönetici oturumu açık kalır. Yeni başarılı giriş önceki cihazdaki oturumu geçersiz kılar.
- Oturum 30 dakika sonra sona erer; açık yönetim ekranı oturumu 10 saniyede bir doğrular.
- `.env` dosyasını ve veritabanı parolalarını Git'e veya herkese açık depolara ekleme.

## Yayına alma

Statik dosya yükleme tek başına yeterli değildir. Yayında Node.js sunucusu/API ve MySQL veritabanı aynı uygulama altyapısında veya birbirine güvenli biçimde erişebilen sunucularda çalışmalıdır. HTTPS kullan; üretim ortamında `NODE_ENV=production` ayarla ve MySQL bağlantı bilgilerini barındırma ortamının gizli değişkenleri olarak tanımla. Yerel `.env` değerlerini kaynak koda ekleme.

## Yedekleme

Yönetim panelindeki **Yedekle** düğmesi projeleri ve araştırma yazılarını JSON olarak indirir. Bu dosyayı güvenli bir yerde sakla; **Yedeği içe aktar** ile geri yükleyebilirsin.
