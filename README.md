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

## Yedekleme

İçerik veritabanını düzenli olarak yedekle ve yedek dosyalarını güvenli bir yerde sakla.
