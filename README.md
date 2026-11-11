# İbrahim Can Düven — Merakın İzinde

Teknoloji, bilim ve insan üzerine merakla düşünen İbrahim Can Düven'in kişisel sitesi. Projeler, araştırma yazıları ve öğrenme yolculuğu bu sitede yer alır.

## Altyapı

- Netlify üzerinde statik site ve serverless Functions
- Netlify Database üzerinden PostgreSQL
- İçerik ve yönetici oturumları merkezi veritabanında saklanır

Netlify dağıtımı için Netlify Database etkinleştirilmiş, veritabanı bağlantısı projeye bağlanmış olmalıdır. `netlify/database/migrations/` altındaki SQL geçişi proje ilk kez bağlandığında gerekli tabloları ve mevcut herkese açık site içeriğini oluşturur. Yönetici parolası depoya eklenmez; yönetici bilgileri yalnızca Netlify proje ortam değişkenlerinde tutulur.

## Yerel geliştirme

Node.js 22.12 veya üzeri gerekir.

```sh
npm install
npm run build
docker compose up -d
npm start
```

Yerel site `http://localhost:3000` adresinde açılır. PostgreSQL bağlantısı ve yönetici hesabı `.env` dosyasından okunur; gizli değerleri depoya ekleme. Yerel PostgreSQL verileri `portfolio-postgres-data` Docker volume'unda saklanır.

## Dağıtım

Netlify projesini GitHub deposuna bağla. `netlify.toml` derleme komutunu ve yayın klasörünü tanımlar. Derleme, sadece tarayıcıda kullanılması gereken izinli site dosyalarını `dist/` içine kopyalar; sunucu kodu, SQL geçişleri, dokümantasyon ve ortam dosyaları statik olarak yayınlanmaz.

Netlify Functions `netlify/functions/` dizininden `/api/content`, `/api/login`, `/api/session` ve `/api/logout` yollarına sunulur. `netlify/database/migrations/` altındaki geçişler PostgreSQL şemasını kurar ve mevcut site içeriklerini başlangıç verisi olarak ekler. Yönetici parolası/veritabanı bağlantısı gizli değerlerini GitHub'a koyma.

## İçerik yedeği

Yönetim ekranından eklenen veya düzenlenen içerikler merkezi PostgreSQL veritabanına yazılır. Veritabanı için Netlify Database'in desteklediği dışa aktarma/yedekleme yöntemlerini düzenli kullan.
