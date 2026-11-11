(function () {
  "use strict";

  const LANGUAGE_KEY = "ibrahim-can-duven-language";
  const translations = {
    "İçeriğe geç": "Skip to content",
    "İbrahim Can Düven — Kişisel Web Sitesi": "İbrahim Can Düven — Personal Website",
    "Çalışmalar — İbrahim Can Düven": "Selected Work — İbrahim Can Düven",
    "İçerik Yönetimi — İbrahim Can Düven": "Content Management — İbrahim Can Düven",
    "İbrahim Can Düven'in teknoloji, bilim, düşünce ve kişisel üretim üzerine dijital alanı.": "The digital home of İbrahim Can Düven: technology, science, ideas and personal work.",
    "İbrahim Can Düven'in proje ve araştırma notları.": "Projects and research notes by İbrahim Can Düven.",
    "Teknoloji, bilim ve insan üzerine düşünen; öğrenmeye ve üretmeye odaklanan bir kişisel alan.": "A personal space for exploring technology, science and people through learning and making.",
    "Ana navigasyon": "Main navigation",
    "İbrahim Can Düven — ana sayfa": "İbrahim Can Düven — homepage",
    "Ana Sayfa": "Home",
    "Hakkımda": "About",
    "İlgi Alanlarım": "Interests",
    "Projeler": "Projects",
    "Notlar": "Notes",
    "İletişim": "Contact",
    "Menü": "Menu",
    "KİŞİSEL WEB SİTESİ ": "PERSONAL WEBSITE ",
    "KİŞİSEL WEB SİTESİ": "PERSONAL WEBSITE",
    "Teknoloji, bilim ve insan üzerine düşünen; öğrenmeye, üretmeye ve kendini geliştirmeye odaklanan bir zihin.": "A curious mind exploring technology, science and people through continuous learning and making.",
    "Farklı disiplinleri keşfediyor, teknolojiyi anlamaya çalışıyor ve kendi profesyonel yolumu inşa ediyorum.": "I explore different disciplines, seek to understand technology and build my own professional path.",
    "Hakkımda": "About",
    "Çalışmalarım": "Selected work",
    "İletişime Geç": "Get in touch",
    "İbrahim Can Düven, Paris'te Eyfel Kulesi önünde": "İbrahim Can Düven in front of the Eiffel Tower in Paris",
    "TÜRKİYE": "TURKEY",
    "MERAKLA ÖĞRENMEYE DEVAM": "ALWAYS LEARNING",
    "PROFİL": "PROFILE",
    "MERAK HARİTASI": "MAP OF CURIOSITY",
    "ÜRETİM": "MAKING",
    "DİJİTAL ARŞİV": "DIGITAL ARCHIVE",
    "ZAMAN İÇİNDE": "OVER TIME",
    "İLERİYE DOĞRU": "LOOKING AHEAD",
    "İLETİŞİM": "CONTACT",
    "YÖNETİM": "MANAGEMENT",
    "ÇALIŞMALAR": "WORK",
    "VERİ": "DATA",
    "İÇERİK": "CONTENT",
    "PROFİL": "PROFILE",
    "Hakkımda": "About me",
    "Teknik bir eğitim, farklı kültürlerle karşılaşma ve insanlarla kurulan gündelik temas; bugün nasıl düşündüğümü şekillendiren parçalar.": "A technical education, encounters with different cultures and everyday interactions all shape how I think today.",
    "Eğitim ve geçmiş": "Education & background",
    "Bilgisayar Programcılığı ön lisans eğitimi aldım. Üniversite dönemimde Litvanya'da bir yıl Erasmus deneyimi yaşadım; bu süreçte Avrupa'nın 13 farklı ülkesini keşfettim. Farklı kültürlerle bir arada yaşamak, bağımsız hareket etmeyi ve olaylara başka açılardan bakmayı öğretti.": "I earned an associate degree in Computer Programming. During university, I spent a year in Lithuania on Erasmus and visited 13 European countries. Living among different cultures taught me independence and helped me see things from new perspectives.",
    "Profesyonel hayat": "Professional life",
    "Şu anda çağrı merkezi sektöründe asistan olarak çalışıyorum. Günlük işim iletişim, disiplin ve operasyonel süreçlerle iç içe. Bilgisayar programcılığı geçmişimle birleşen bu deneyimi, teknoloji ve dijital üretim alanlarında ilerlemek için bir temel olarak görüyorum.": "I currently work as an assistant in the call-centre sector. My day-to-day work involves communication, discipline and operational processes. Alongside my programming background, this experience provides a foundation for pursuing technology and digital work.",
    "Düşünce yapım": "How I think",
    "Bir konunun yalnızca sonucunu değil, nasıl ve neden ortaya çıktığını da anlamaya çalışırım. Teknolojiden felsefeye uzanan farklı alanları birlikte okumak, bağlantılar kurmama ve düşüncemi sınamama yardımcı oluyor. Öğrenmeyi bitmiş bir hedef değil, devam eden bir süreç olarak görüyorum.": "I try to understand not only what happens, but how and why. Reading across fields—from technology to philosophy—helps me make connections and question my own thinking. I see learning as an ongoing process, not a finished goal.",
    "MERAK HARİTASI": "MAP OF CURIOSITY",
    "İlgi alanlarım": "Areas of interest",
    "Bunlar uzmanlık iddiası değil; zaman ayırdığım, okuduğum ve üzerine düşünmeye devam ettiğim alanlar.": "These are not claims of expertise, but subjects I spend time exploring, reading about and reflecting on.",
    "A — TEKNOLOJİ": "A — TECHNOLOGY",
    "Sistemler ve üretim": "Systems & making",
    "Yazılım ve Programlama": "Software & Programming",
    "Yapay Zekâ": "Artificial Intelligence",
    "Bilgisayar Bilimleri": "Computer Science",
    "Ağ Bilimi": "Network Science",
    "Dijital Sistemler": "Digital Systems",
    "B — BİLİM": "B — SCIENCE",
    "Doğa ve evren": "Nature & the universe",
    "Astronomi": "Astronomy",
    "Nörobilim": "Neuroscience",
    "Fizik": "Physics",
    "Bilim Tarihi": "History of Science",
    "Yaşamın Kökeni": "Origins of Life",
    "C — DÜŞÜNCE": "C — THOUGHT",
    "Zihin ve anlam": "Mind & meaning",
    "Felsefe": "Philosophy",
    "Psikoloji": "Psychology",
    "İnsan Davranışı": "Human Behaviour",
    "Bilişsel Bilimler": "Cognitive Science",
    "D — KÜLTÜR VE KEŞİF": "D — CULTURE & DISCOVERY",
    "İnsanların kurduğu dünya": "The world people build",
    "Havacılık": "Aviation",
    "Müzik Tarihi": "Music History",
    "Avrupa Kültürü": "European Culture",
    "Tarih": "History",
    "Seyahat": "Travel",
    "ÜRETİM": "MAKING",
    "Fikirden ürüne uzanan çalışmalar. Her projenin mevcut durumu olduğu gibi belirtilir.": "Work in progress, from ideas toward products. Each project is presented at its current stage.",
    "DİJİTAL ARŞİV": "DIGITAL ARCHIVE",
    "Araştırmalar ve notlar": "Research & notes",
    "Okuduklarımdan, araştırdıklarımdan ve zaman içinde geliştirdiğim sorulardan kalanlar.": "A record of what I read, research and the questions I develop along the way.",
    "ARŞİV / 00": "ARCHIVE / 00",
    "Bu arşiv henüz ilk notunu bekliyor.": "This archive is waiting for its first note.",
    "Yeni araştırma ve yazılar zamanla burada yer alacak.": "New research and writing will appear here over time.",
    "Şu anda listelenecek bir proje yok.": "There are no projects to display yet.",
    "ZAMAN İÇİNDE": "OVER TIME",
    "Deneyim ve yolculuk": "Experience & journey",
    "Kronoloji, kesin tarihleri bilmediğim yerlerde tarih uydurmadan; dönüm noktaları üzerinden anlatılıyor.": "This timeline focuses on milestones; dates are left unspecified where I do not know them.",
    "TARİH EKLENECEK": "DATE TO BE ADDED",
    "Bilgisayar Programcılığı": "Computer Programming",
    "Bilgisayar Programcılığı ön lisans eğitimimi tamamladım.": "I completed an associate degree in Computer Programming.",
    "Litvanya'da Erasmus": "Erasmus in Lithuania",
    "Üniversite döneminde bir yıl Litvanya'da yaşadım ve eğitimime uluslararası bir deneyim ekledim.": "I spent a year in Lithuania during university, adding an international dimension to my education.",
    "BU DÖNEMDE": "DURING THIS PERIOD",
    "Avrupa'da keşif": "Exploring Europe",
    "Erasmus dönemim boyunca 13 farklı ülkeyi ziyaret ederek farklı kültürleri yakından tanıdım.": "During Erasmus, I visited 13 countries and experienced a range of cultures firsthand.",
    "DEVAM EDİYOR": "ONGOING",
    "Profesyonel çalışma hayatı": "Professional life",
    "Çağrı merkezi sektöründe asistan olarak çalışıyor; iletişim ve operasyon deneyimi kazanıyorum.": "I work as an assistant in the call-centre sector, gaining experience in communication and operations.",
    "Kişisel projeler ve gelişim": "Personal projects & growth",
    "Teknoloji alanındaki bilgimi geliştirmeye ve kendi dijital proje fikirlerimi olgunlaştırmaya devam ediyorum.": "I continue to develop my technology skills and shape ideas for my own digital projects.",
    "İLERİYE DOĞRU": "LOOKING AHEAD",
    "Gelecek hedeflerim": "Looking ahead",
    "Henüz ulaşılmış sonuçlar değil; yönümü belirleyen, üzerinde çalıştığım hedefler.": "These are goals I am working toward, not achievements already reached.",
    "Uluslararası bir kariyer inşa etmek; Avrupa'da yaşama ve çalışma olanağı yaratmak.": "Build an international career and create the opportunity to live and work in Europe.",
    "Yazılım ve teknoloji alanlarında düzenli öğrenmeyle teknik yetkinliğimi geliştirmek.": "Strengthen my technical skills through consistent learning in software and technology.",
    "Kendi dijital proje fikirlerimi çalışan, kullanılabilir ürünlere dönüştürmek.": "Turn my digital project ideas into working, useful products.",
    "Disiplinler arası merakımı daha derin ve tutarlı bir bilgi birikimine taşımak.": "Develop my interdisciplinary curiosity into a deeper, more connected body of knowledge.",
    "Bir konu üzerine": "Let's talk",
    "konuşalım.": "about an idea.",
    "Teknoloji, projeler veya ortak ilgi alanlarımız hakkında iletişim kurmak istersen, bağlantı bilgilerini buraya ekleyeceğim.": "If you would like to talk about technology, projects or shared interests, you can reach me through the links below.",
    "E-posta": "Email",
    "LinkedIn": "LinkedIn",
    "GitHub": "GitHub",
    "Instagram": "Instagram",
    "Diğer": "Other",
    "Adres eklenmedi": "Not provided",
    "Profil eklenmedi": "Not provided",
    "Bağlantı eklenmedi": "Not provided",
    "İçerik yönetimi": "Content editor",
    "Siteye dön": "Back to site",
    "YÖNETİM ": "MANAGEMENT ",
    "İçerik yönetimi": "Content management",
    "İngilizce çeviriler ": "English translations ",
    "İngilizce çeviriler": "English translations",
    "Projeleri ve araştırma notlarını buradan ekleyip düzenleyebilirsin. Değişiklikler merkezi MySQL veritabanına kaydedilir.": "Add and edit projects and research notes here. Changes are saved to the central MySQL database.",
    "Statik site notu": "About this static site",
    "Bu sürümde içerikler yalnızca düzenleme yaptığın tarayıcıda görünür; ziyaretçilere otomatik yayımlanmaz. Yedekle ile JSON dosyası indirip içeriğini saklayabilirsin. Herkese açık ortak yayın için sunucu tabanlı bir CMS veya depolama hizmeti gerekir.": "In this version, changes are stored only in this browser and are not published to visitors. Use Backup to download a JSON copy. Publishing shared content requires a server-based CMS or storage service.",
    "Çalışmalar": "WORK",
    "Yeni proje ekle ": "Add project ",
    "Yeni proje ekle": "Add project",
    "Araştırma notları": "Research notes",
    "Yeni not ekle ": "Add note ",
    "Yeni not ekle": "Add note",
    "Veri": "DATA",
    "Yedekle ve geri yükle": "Back up & restore",
    "Proje ve notlarını JSON olarak dışa aktar veya daha önce aldığın yedeği içe aktar.": "Export projects and notes as JSON or import an existing backup.",
    "Yedekle ": "Back up ",
    "Yedeği içe aktar ": "Import backup ",
    "Henüz proje eklenmedi.": "No projects yet.",
    "Henüz not eklenmedi.": "No notes yet.",
    "Düzenle": "Edit",
    "Sil": "Delete",
    "Proje ekle": "Add project",
    "Not ekle": "Add note",
    "Projeyi düzenle": "Edit project",
    "Notu düzenle": "Edit note",
    "Proje adı": "Project name",
    "Alt başlık": "Subtitle",
    "Bağlantı kimliği": "URL identifier",
    "Kategori": "Category",
    "Durum": "Status",
    "Tarih ": "Date ",
    "(isteğe bağlı)": "(optional)",
    "İsteğe bağlı": "Optional",
    "Örn. DİJİTAL ÜRÜN FİKRİ": "e.g. DIGITAL PRODUCT CONCEPT",
    "Örn. Fikir aşamasında": "e.g. At idea stage",
    "Örn. 5 dk okuma": "e.g. 5 min read",
    "Kısa açıklama": "Short description",
    "Detaylı açıklama": "Full description",
    "Temel yaklaşım ": "Core principles ",
    "(her satıra bir madde)": "(one item per line)",
    "Kaydet": "Save",
    "Vazgeç": "Cancel",
    "Başlık": "Title",
    "Kategori seç": "Choose a category",
    "Yayın tarihi ": "Publication date ",
    "(GG.AA.YYYY)": "(DD.MM.YYYY)",
    "Okuma süresi": "Reading time",
    "Yazı içeriği ": "Article text ",
    "(paragraflar arasında boş satır bırak)": "(leave a blank line between paragraphs)",
    "Yedekle": "Back up",
    "Yedeği içe aktar": "Import backup",
    "Bu sayfa mevcut değil.": "This page is unavailable.",
    "İçerik kaldırılmış veya bağlantı değişmiş olabilir.": "The content may have been removed or the link may have changed.",
    "İçerik bulunamadı": "CONTENT NOT FOUND",
    "← Ana sayfaya dön": "← Back to homepage",
    "← Tüm projeler": "← All projects",
    "← Tüm notlar": "← All notes",
    "← Listeye dön": "← Back to list",
    "Temel yaklaşım": "Core principles",
    "Fikir aşamasında": "At idea stage",
    "DİJİTAL ÜRÜN FİKRİ": "DIGITAL PRODUCT CONCEPT",
    "Sosyal medya akışını ve içerik üzerindeki kontrolü yeniden düşünmeye yönelik kişisel bir platform fikri.": "A personal platform concept exploring a different approach to social feeds and control over content.",
    "PULSE, sosyal medya deneyiminin kullanıcı tarafından daha fazla yönlendirilebildiği bir platform fikri. Popülerlik sinyallerinin ötesinde içerik keşfini, içerik sahibinin kontrolünü ve gizliliği ürünün temel kararları olarak ele alıyor. Çalışma henüz fikir aşamasında; bu sayfa mevcut yaklaşımı ve üzerinde düşünülen ilkeleri kayıt altına alıyor.": "PULSE is a platform concept in which people have more say over their social media experience. It places discovery beyond popularity signals, creator control and privacy at the centre of its design. The project is still at the idea stage; this page records the current approach and principles under consideration.",
    "Kullanıcının akışını kendi tercihleriyle kontrol edebilmesi.": "Users can shape their feeds according to their own preferences.",
    "İçerik sahibinin içeriğini yönetebilmesi ve sahiplenebilmesi.": "Creators can manage and retain ownership of their content.",
    "Popülerlik ölçütlerinin dışında kalan içeriklerin de keşfedilebilmesi.": "Content can be discovered beyond popularity metrics.",
    "Gizliliğin sonradan eklenen bir özellik değil, tasarımın parçası olması.": "Privacy is part of the design, not an afterthought.",
    "Tarih eklenmedi": "Date not provided",
    "Süre eklenmedi": "Not specified",
    "Bilim ve Teknoloji": "Science & Technology",
    "Felsefe ve Psikoloji": "Philosophy & Psychology",
    "Tarih ve Kültür": "History & Culture",
    "Havacılık ve Astronomi": "Aviation & Astronomy",
    "Yazılım ve Dijital Dünya": "Software & the Digital World",
    "Bilgisayar Programcılığı": "Computer Programming",
    "İçerik bu tarayıcıya kaydedildi.": "Changes saved in this browser.",
    "İçerik tarayıcıya kaydedilemedi.": "Could not save changes in this browser.",
    "İçerik yedeği indirildi.": "Content backup downloaded.",
    "Yedek içe aktarılamadı. JSON biçimini kontrol et.": "Could not import backup. Check that the JSON file is valid.",
    "Dosya okunamadı. Başka bir JSON dosyası dene.": "Could not read the file. Try another JSON file.",
    "İçerik silinsin mi?": "Delete this content?",
    "Bu bağlantı kimliği başka bir projede kullanılıyor.": "This URL identifier is already used by another project.",
    "Bu bağlantı kimliği başka bir notta kullanılıyor.": "This URL identifier is already used by another note.",
    "projesini incele": "View project",
    "yazısını oku": "Read article",
    "İçerik kaydedildi.": "Content saved.",
    "İçerik silinsin mi?": "Delete this content?",
    "Bu bağlantı kimliği başka bir projede kullanılıyor.": "This URL identifier is already used by another project.",
    "Bu bağlantı kimliği başka bir notta kullanılıyor.": "This URL identifier is already used by another note.",
    "İçerik bu tarayıcıya kaydedildi.": "Content saved in this browser.",
    "İçerik tarayıcıya kaydedilemedi.": "Content could not be saved in this browser.",
    "İçerik yedeği indirildi.": "Content backup downloaded.",
    "Yedek içe aktarılamadı. JSON biçimini kontrol et.": "Could not import backup. Check that the file is valid JSON.",
    "Dosya okunamadı. Başka bir JSON dosyası dene.": "Could not read the file. Try another JSON file."
  };

  let language = window.localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "tr";
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();

  function translate(text) {
    if (language === "tr") return text;
    return translations[text.trim()] || text;
  }

  function translateNode(node) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const trimmed = source.trim();
    if (!trimmed) return;
    const leading = source.match(/^\s*/)[0];
    const trailing = source.match(/\s*$/)[0];
    node.nodeValue = leading + translate(trimmed) + trailing;
  }

  function apply() {
    document.documentElement.lang = language;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateNode(node);

    document.querySelectorAll("[aria-label], [title], [placeholder]").forEach(function (element) {
      ["aria-label", "title", "placeholder"].forEach(function (attribute) {
        if (!element.hasAttribute(attribute)) return;
        if (!originalAttributes.has(element)) originalAttributes.set(element, {});
        const values = originalAttributes.get(element);
        if (!(attribute in values)) values[attribute] = element.getAttribute(attribute);
        element.setAttribute(attribute, translate(values[attribute]));
      });
    });

    document.querySelectorAll("[data-language-toggle]").forEach(function (button) {
      button.textContent = language === "tr" ? "EN" : "TR";
      button.setAttribute("aria-label", language === "tr" ? "Switch language to English" : "Dili Türkçe yap");
      button.setAttribute("title", language === "tr" ? "Switch language to English" : "Dili Türkçe yap");
    });
    const title = document.querySelector("title");
    if (title) {
      if (!originalAttributes.has(title)) originalAttributes.set(title, {});
      const values = originalAttributes.get(title);
      if (!("text" in values)) values.text = title.textContent;
      title.textContent = translate(values.text);
    }
    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach(function (meta) {
      if (!originalAttributes.has(meta)) originalAttributes.set(meta, {});
      const values = originalAttributes.get(meta);
      if (!("content" in values)) values.content = meta.getAttribute("content");
      meta.setAttribute("content", translate(values.content));
    });
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-language-toggle]");
    if (!button) return;
    language = language === "tr" ? "en" : "tr";
    window.localStorage.setItem(LANGUAGE_KEY, language);
    apply();
    document.dispatchEvent(new CustomEvent("site-language-change", { detail: { language: language } }));
  });

  window.SiteI18n = {
    get language() { return language; },
    t: translate,
    apply: apply
  };

  apply();
}());
