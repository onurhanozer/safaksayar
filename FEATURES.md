# Şafak Sayar - Zaman ve İlerleme Özellikleri

Bu belge, uygulamada bulunan zaman ve ilerleme gösterim özelliklerini detaylıca açıklamaktadır.

## 1. Kalan / Geçen Süre Sunumu

### Dairesel İlerleme Göstergeleri
**Konum:** App.js, satırlar 640-676

İki adet yan yana dairesel ilerleme göstergesi:
- **Kalan Süre:** Sol tarafta, kalan günleri gösterir
- **Geçen Süre:** Sağ tarafta, geçen günleri gösterir

Her iki gösterge de:
- Animasyonlu halka grafik kullanır
- Merkeze gün sayısını yazar
- Yüzdeye göre doluluk gösterir

### Stat Kartları
**Konum:** App.js, satırlar 686-698

İki büyük kart halinde gösterim:
```
┌─────────────┐  ┌─────────────┐
│   KALAN     │  │   GEÇEN     │
│    180      │  │      0      │
└─────────────┘  └─────────────┘
      180 kaldı / 0 bitti
```

**Özellikler:**
- `heroStatCard` stil komponenti ile tasarlanmış
- Kalan gün kartı vurgulanmış (`heroStatCardPrimary`)
- Altında özet metin: "X kaldı / Y bitti"

### Veri Hesaplaması
**Konum:** App.js, satırlar 166-201

```javascript
const kalan = Math.ceil(kalanMs / (1000 * 60 * 60 * 24));
const gecen = Math.floor(gecenMs / (1000 * 60 * 60 * 24));
```

## 2. Yüzde İlerleme Çubuğu

**Konum:** App.js, satırlar 678-684

### Görsel Tasarım
- Başlık: "İlerleme Durumu"
- Yatay çubuk grafik
- Beyaz dolgu rengi ile tamamlanma gösterimi
- Altında yüzde metni: "%12 tamamlandı"

### Hesaplama
**Konum:** App.js, satırlar 254-261

```javascript
const toplamGun = parseInt(askerlikSuresi || 6) * 30;
const hamTamamlanma = toplamGun > 0 ? Math.round((gecenGun / toplamGun) * 100) : 0;
const tamamlanmaYuzde = Math.min(100, Math.max(0, hamTamamlanma));
const tamamlanmaMetni = `%${tamamlanmaYuzde} tamamlandı`;
```

**Özellikler:**
- 0-100 arası sınırlı
- Toplam güne göre hesaplama
- Ceza günleri dahil

## 3. Milestone (Dönüm Noktası) Kartları

**Konum:**
- Tanımlar: App.js, satırlar 303-323
- Görüntüleme: App.js, satırlar 740-752

### Mevcut Milestone'lar

#### 1. 100. Gün Kutlu Olsun 🎉
- **Tetikleme Koşulu:** `gecenGunDisplay >= 100`
- **Başlık:** "100. Gün Kutlu Olsun 🎉"
- **Açıklama:** "Yüz gün geride kaldı; sabrın ve disiplinin için tebrikler!"

#### 2. Yarısını Devirdin 💪
- **Tetikleme Koşulu:** `tamamlanmaYuzde >= 50 && kalanGunDisplay > 0`
- **Başlık:** "Yarısını Devirdin 💪"
- **Açıklama:** "Görevinin yarısı tamam. Aynı motivasyonla devam!"

#### 3. Tek Hanelere Düştün 🎉
- **Tetikleme Koşulu:** `kalanGunDisplay > 0 && kalanGunDisplay <= 9`
- **Başlık:** "Tek Hanelere Düştün 🎉"
- **Açıklama:** "Son düzlüğe girdin; şafak sayende sökecek!"

### Milestone Mantığı

```javascript
const milestoneDefinitions = [
  {
    key: 'hundred-days',
    condition: gecenGunDisplay >= 100,
    title: '100. Gün Kutlu Olsun 🎉',
    description: 'Yüz gün geride kaldı; sabrın ve disiplinin için tebrikler!'
  },
  // ... diğer milestone'lar
];

const achievedMilestones = milestoneDefinitions.filter(item => item.condition);
```

**Özellikler:**
- Otomatik filtreleme (sadece koşulu sağlayanlar gösterilir)
- Her milestone benzersiz `key` ile tanımlı
- Emoji destekli başlıklar
- Açıklayıcı mesajlar

### Görsel Tasarım
- Beyaz kartlar üzerine
- Sol kenarda mor çizgi (`borderLeftColor: '#667eea'`)
- Gölge efekti ile 3D görünüm
- Başlık altında açıklama metni

## Sayfa Yapısı

Özellikler 3 sayfalı yatay kaydırma yapısında organize edilmiştir:

### Sayfa 1: Ana Dashboard (Hero Page)
- Dairesel ilerleme göstergeleri
- Stat kartları (Kalan/Geçen)
- İlerleme çubuğu
- Plaka gösterimi

### Sayfa 2: Motivasyon Sayfası
- Motivasyon kartı
- Günün sözü
- **Milestone kartları** (buradadır!)
- Zaman dilimleri kartı

### Sayfa 3: Detay Bilgileri
- Esprili bakış açıları
- Tarih bilgileri
- İzin durumu

## Teknik Detaylar

### State Yönetimi
```javascript
const [kalanGun, setKalanGun] = useState(null);
const [gecenGun, setGecenGun] = useState(null);
```

### Güncelleme Mantığı
- Kayıt yapıldığında `hesapla()` fonksiyonu çağrılır
- Her açılışta `yukle()` ile AsyncStorage'dan veri yüklenir
- Ayarlar değiştiğinde otomatik yeniden hesaplama

### Stil Bileşenleri
- `progressContainer` - Dairesel göstergeler için
- `barContainer` - İlerleme çubuğu için
- `milestoneCard` - Milestone kartları için
- `heroStatCard` - Stat kartları için

## Motivasyon Sistemi

İlerleme özelliklerine ek olarak, dinamik motivasyon mesajları da bulunur:

**Konum:** App.js, satırlar 271-300

Motivasyon mesajları kalan/geçen güne göre değişir:
- 0-7 gün geçti: "Yeni Başlangıç"
- 7-14 gün geçti: "Bir Hafta"
- 30+ gün geçti: "Bir Ay Geçti"
- 30 gün kaldı: "Torun Geliyor"
- 9 gün kaldı: "Tek Hanelere Düştün"
- vb.

## Öneriler

### Gelecek Geliştirmeler
1. Milestone'lara ses efekti eklenebilir
2. Milestone başarıldığında bir kere gösterme (tekrar gösterilmeme)
3. Özel milestone tarihleri (tatil günleri, özel günler)
4. Milestone paylaşma özelliği
5. Animasyonlu geçişler
6. Bildirim entegrasyonu

### Yeni Milestone Önerileri
- 30. Gün Kutlama
- 150. Gün (5 ay)
- İlk 10 gün
- Son 10 gün
- Her 50 günde bir kutlama

## Kod Örnekleri

### Yeni Milestone Eklemek

```javascript
const milestoneDefinitions = [
  // Mevcut milestone'lar...
  {
    key: 'thirty-days',
    condition: gecenGunDisplay >= 30,
    title: '30. Gün Başarıldı 🌟',
    description: 'İlk ay geride kaldı! Artık rutin oturdu.'
  }
];
```

### Stil Özelleştirme

```javascript
milestoneCard: {
  backgroundColor: '#fff',
  borderRadius: 18,
  padding: 18,
  marginBottom: 12,
  borderLeftWidth: 4,
  borderLeftColor: '#667eea', // Buradan renk değiştirilebilir
}
```

## Sonuç

Şafak Sayar uygulaması, askerlerin motivasyonunu yüksek tutmak için kapsamlı bir zaman ve ilerleme gösterim sistemine sahiptir. Dairesel göstergeler, stat kartları, ilerleme çubuğu ve milestone kartları ile kullanıcıya görsel ve motivasyonel geri bildirim sağlanır.
