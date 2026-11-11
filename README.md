# İbrahim Can Düven — Merakın İzinde

Teknoloji, bilim ve insan üzerine merakla düşünen İbrahim Can Düven'in kişisel sitesi. Projeler, araştırma yazıları ve öğrenme yolculuğu bu sitede yer alır.

## Teknoloji

- Node.js ile çalışan web sunucusu ve API
- MySQL 8.4 veritabanı
- Duyarlı tasarım ve Türkçe/İngilizce arayüz

Proje ve araştırma içerikleri merkezi MySQL veritabanında tutulur. Tarayıcı, yayımlanan içerikleri uygulama sunucusundan alır. Sunucu ve MySQL erişilebilir olmalıdır.

## Gereksinimler

- Node.js 20.6 veya üzeri
- Docker Desktop ve Docker Compose

## İlk kurulum

1. Proje klasöründe `.env.example` dosyasını `.env` adıyla kopyala.
2. `.env` içindeki `DB_PASSWORD` ve `MYSQL_ROOT_PASSWORD` alanlarına birbirinden farklı, güçlü parolalar yaz. `DB_HOST`, `DB_PORT` ve `DB_NAME` değerlerini kullanacağın MySQL ortamına göre ayarla.
3. MySQL'i başlat:

   ```powershell
   docker compose up -d
   ```

4. Bağımlılıkları kur:

   ```powershell
   npm install
   ```

5. Site sunucusunu başlat ve `http://localhost:3000` adresini aç:

   ```powershell
   npm start
   ```

Site gerekli MySQL tablolarını otomatik oluşturur. SQL şeması ayrıca `schema.sql` dosyasındadır.

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

## Yayına alma

Statik dosya yükleme tek başına yeterli değildir. Yayında Node.js sunucusu/API ve MySQL veritabanı aynı uygulama altyapısında veya birbirine güvenli biçimde erişebilen sunucularda çalışmalıdır. HTTPS kullan; üretim ortamında `NODE_ENV=production` ayarla ve MySQL bağlantı bilgilerini barındırma ortamının gizli değişkenleri olarak tanımla. Yerel `.env` değerlerini kaynak koda ekleme.

## Yedekleme

İçerik veritabanını düzenli olarak yedekle ve yedek dosyalarını güvenli bir yerde sakla.
