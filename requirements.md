# 🔧 Tamirci Müşteri Takip Sistemi — Proje Spesifikasyonu
 
## Proje Özeti
 
Tek kullanıcılı (tamirci), web tabanlı bir müşteri ve tamir kaydı takip uygulaması.
Tamirci, sahaya çıktığında müşteri bilgilerini kayıt eder; tamir sürecini takip eder; işi tamamlayınca kaydı kapatır.
 
---
 
## Tech Stack
 
- **Frontend:** Next.js 14+ (App Router) + TailwindCSS
- **Backend/DB:** Supabase (PostgreSQL + Auth)
- **Auth:** Supabase Auth (email + şifre, tek kullanıcı)
- **Deploy:** Vercel
 
---
 
## Kimlik Doğrulama (Auth)
 
- Uygulama **yalnızca 1 kullanıcı** tarafından kullanılacak (tamirci)
- Giriş: **email + şifre** ile Supabase Auth
- Tüm sayfalar login olmadan erişilemez — middleware ile koruma
- "Beni hatırla" / oturum kalıcılığı desteklenecek
- Şifremi unuttum akışı opsiyonel (istersen eklenebilir)
 
---
 
## Veri Modeli
 
### `customers` Tablosu
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
full_name     text NOT NULL          -- Müşteri adı soyadı
phone         text NOT NULL          -- Telefon numarası
address       text NOT NULL          -- Adres (gidilecek konum)
notes         text                   -- Ek notlar (isteğe bağlı)
created_at    timestamptz DEFAULT now()
```
 
### `repairs` Tablosu
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
customer_id     uuid REFERENCES customers(id) ON DELETE CASCADE
machine_info    text NOT NULL       -- Makine bilgisi (marka, model, seri no vb.)
problem_desc    text NOT NULL       -- Arıza / şikayet açıklaması
status          text DEFAULT 'open' -- 'open' | 'closed'
repair_notes    text                -- Yapılan işlemler (güncellenebilir)
opened_at       timestamptz DEFAULT now()
closed_at       timestamptz         -- Kapatılınca doldurulur
```
 
---
 
## Sayfalar ve Özellikler
 
### 1. `/login` — Giriş Sayfası
- Email + şifre formu
- Hatalı giriş mesajı
- Başarılı girişte `/dashboard`'a yönlendirme
 
---
 
### 2. `/dashboard` — Ana Panel
- Açık tamir kayıtları listesi (en yeni üstte)
- Her kayıtta: müşteri adı, telefon, makine bilgisi, açılış tarihi, durum badge'i
- "Yeni Tamir Kaydı Aç" butonu
- Arama / filtreleme: müşteri adına veya telefona göre
- Durum filtresi: Tümü / Açık / Kapalı
 
---
 
### 3. `/repairs/new` — Yeni Tamir Kaydı
 
**İki seçenek:**
- **Yeni müşteri:** Ad, telefon, adres alanlarını doldur → müşteri oluştur → tamir kaydı aç
- **Mevcut müşteri:** Telefon numarasıyla ara → bulunan müşteriyi seç → tamir kaydı aç
 
**Tamir formu alanları:**
- Makine bilgisi (marka, model, seri no vb.)
- Arıza / şikayet açıklaması
- Notlar (isteğe bağlı)
 
---
 
### 4. `/repairs/[id]` — Tamir Kaydı Detayı
 
**Görüntülenen bilgiler:**
- Müşteri: Ad, telefon, adres
- Makine bilgisi
- Arıza açıklaması
- Yapılan işlemler (düzenlenebilir metin alanı)
- Durum: Açık / Kapalı
- Açılış tarihi, kapanış tarihi
 
**Aksiyonlar:**
- "Kaydı Güncelle" — repair_notes ve diğer alanları güncelle
- "Tamiri Kapat" — status = 'closed', closed_at = now() olarak güncelle
- Kapalı kayıtlar yeniden açılabilir ("Yeniden Aç" butonu)
 
---
 
### 5. `/customers` — Müşteri Listesi *(opsiyonel ama önerilir)*
- Tüm müşteriler listesi
- Her müşterinin geçmiş tamir kayıtları
- Müşteri bilgilerini düzenleme
 
---
 
## UI/UX Gereksinimleri
 
- **Mobil öncelikli** tasarım — tamirci sahadayken telefon ile kullanacak
- Sade, hızlı, okunabilir arayüz
- Durum renk kodlaması: Açık = sarı/turuncu, Kapalı = yeşil
- Form validasyonu (boş alan bırakılamaz, telefon formatı vb.)
- Yükleme durumları (loading spinner / skeleton)
- Başarı ve hata toast bildirimleri
 
---
 
## Güvenlik
 
- Supabase Row Level Security (RLS) aktif olacak
- Tüm tablolar: sadece authenticated user erişebilir
- Middleware: login olmadan hiçbir sayfaya erişilemez
 
---
 
## Klasör Yapısı (Önerilen)
 
```
/app
  /login          → giriş sayfası
  /dashboard      → ana panel
  /repairs
    /new          → yeni kayıt formu
    /[id]         → kayıt detay & düzenleme
  /customers      → müşteri listesi (opsiyonel)
/components
  /ui             → butonlar, input, badge, modal vb.
  /repairs        → RepairCard, RepairForm vb.
  /customers      → CustomerSearch, CustomerForm vb.
/lib
  /supabase.ts    → supabase client
  /types.ts       → TypeScript tipleri
/middleware.ts    → auth koruması
```
 
---
 
## Supabase Kurulum Notları
 
1. Supabase'de `customers` ve `repairs` tablolarını oluştur (yukarıdaki şemaya göre)
2. RLS politikaları: `auth.uid() IS NOT NULL` — sadece giriş yapmış kullanıcı
3. `.env.local` dosyasına ekle:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. Supabase Auth'ta bir kullanıcı manuel oluştur (tamirci hesabı)
 
---
 
## Geliştirme Öncelik Sırası
 
1. Auth (login / middleware)
2. Yeni tamir kaydı açma (müşteri + tamir formu)
3. Dashboard — açık kayıtlar listesi
4. Tamir detay — güncelleme ve kapatma
5. Arama / filtreleme
6. Müşteri listesi sayfası
 
---
 
## Notlar
 
- Başlangıçta admin panel veya çoklu kullanıcı **gerekmez**
- İlk versiyonda fatura / ödeme takibi **gerekmez**, ileride eklenebilir
- Fotoğraf yükleme özelliği (makine fotoğrafı) ileride Supabase Storage ile eklenebilir
 
