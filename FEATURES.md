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
- Tanımlar: App.js, satırlar 303-347
- Görüntüleme: App.js, satırlar 813-834

### Mevcut Milestone'lar

#### 1. İlk 10 Gün Geride 🌱
- **Tetikleme Koşulu:** `gecenGunDisplay >= 10 && gecenGunDisplay < 30`
- **Başlık:** "İlk 10 Gün Geride 🌱"
- **Açıklama:** "İlk on günü başarıyla tamamladın! Alışma süreci başladı."

#### 2. 30. Gün Başarısı 🌟
- **Tetikleme Koşulu:** `gecenGunDisplay >= 30 && gecenGunDisplay < 100`
- **Başlık:** "30. Gün Başarısı 🌟"
- **Açıklama:** "Bir ay geride kaldı! Artık rutin oturdu, tempo devam!"

#### 3. 100. Gün Kutlu Olsun 🎉
- **Tetikleme Koşulu:** `gecenGunDisplay >= 100 && gecenGunDisplay < 150`
- **Başlık:** "100. Gün Kutlu Olsun 🎉"
- **Açıklama:** "Yüz gün geride kaldı; sabrın ve disiplinin için tebrikler!"

#### 4. 150 Gün - 5 Ay Tamamlandı 🏆
- **Tetikleme Koşulu:** `gecenGunDisplay >= 150`
- **Başlık:** "150 Gün - 5 Ay Tamamlandı 🏆"
- **Açıklama:** "Beş ay geride kaldı! İnanılmaz bir başarı, son hızla devam!"

#### 5. Yarısını Devirdin 💪
- **Tetikleme Koşulu:** `tamamlanmaYuzde >= 50 && kalanGunDisplay > 0`
- **Başlık:** "Yarısını Devirdin 💪"
- **Açıklama:** "Görevinin yarısı tamam. Aynı motivasyonla devam!"

#### 6. Son 10 Güne Girdin 🔥
- **Tetikleme Koşulu:** `kalanGunDisplay > 0 && kalanGunDisplay <= 10 && kalanGunDisplay > 9`
- **Başlık:** "Son 10 Güne Girdin 🔥"
- **Açıklama:** "Artık son 10 gün! Finish çizgisi çok yakın, biraz daha dayan!"

#### 7. Tek Hanelere Düştün 🎉
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

## 4. Animasyon Sistemi

**Konum:** App.js, satırlar 66-151

### Animasyon Değerleri

Uygulama, React Native'in Animated API'sini kullanarak şu animasyonları sağlar:

```javascript
const progressBarWidth = useRef(new Animated.Value(0)).current;
const milestoneOpacity = useRef(new Animated.Value(0)).current;
const milestoneScale = useRef(new Animated.Value(0.8)).current;
const circularPulse = useRef(new Animated.Value(1)).current;
```

### 4.1. Progress Bar Animasyonu

**Özellikler:**
- **Spring animasyon** ile yumuşak geçiş
- İlerleme yüzdesi değiştiğinde otomatik çalışır
- Native driver devre dışı (width animasyonu için gerekli)

**Parametreler:**
- `tension: 40` - Yay gerginliği
- `friction: 8` - Sürtünme katsayısı
- `useNativeDriver: false` - Width animasyonu için

### 4.2. Milestone Kartları Animasyonu

**Fade-in Efekti:**
- Opacity: 0 → 1
- Duration: 600ms
- Timing animasyonu

**Scale Efekti:**
- Scale: 0.8 → 1
- Spring animasyon
- `tension: 50`, `friction: 7`

**Davranış:**
- Kartlar görünür hale geldiğinde tetiklenir
- Paralel animasyon (fade + scale birlikte)
- Native driver aktif (transform ve opacity için)

### 4.3. Dairesel İlerleme Pulse Animasyonu

**Özellikler:**
- **Loop animasyon** - Sürekli tekrar eder
- Sequence kullanımı (büyüt → küçült)
- Hafif pulse efekti (1.0 → 1.05 → 1.0)

**Timing:**
- Büyüme: 2000ms
- Küçülme: 2000ms
- Toplam döngü: 4 saniye

**Davranış:**
- Kayıt yapıldığında başlar
- Component unmount olduğunda durur
- Her iki dairesel göstergeye uygulanır

### Animasyon Kod Örnekleri

#### Progress Bar Animasyonu
```javascript
useEffect(() => {
  if (kayitli && gecenGun !== null) {
    Animated.spring(progressBarWidth, {
      toValue: tamamlanmaYuzde,
      useNativeDriver: false,
      tension: 40,
      friction: 8
    }).start();
  }
}, [tamamlanmaYuzde, kayitli, gecenGun]);
```

#### Milestone Animasyonu
```javascript
Animated.parallel([
  Animated.timing(milestoneOpacity, {
    toValue: 1,
    duration: 600,
    useNativeDriver: true
  }),
  Animated.spring(milestoneScale, {
    toValue: 1,
    useNativeDriver: true,
    tension: 50,
    friction: 7
  })
]).start();
```

#### Circular Pulse
```javascript
Animated.loop(
  Animated.sequence([
    Animated.timing(circularPulse, {
      toValue: 1.05,
      duration: 2000,
      useNativeDriver: true
    }),
    Animated.timing(circularPulse, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true
    })
  ])
).start();
```

## 5. Gelişmiş Görsel Tasarım

### Milestone Bölümü Stilleri

**Yeni Özellikler:**
- Hafif mor arka plan: `rgba(102, 126, 234, 0.08)`
- Çerçeve border: 2px, hafif mor
- Border radius: 20px
- İç padding: 16px

**Başlık Stilleri:**
- Font boyutu: 18px
- Font ağırlığı: 900 (extra bold)
- Letter spacing: 2px
- Text shadow efekti

**Kart Stilleri:**
- 5px sol border (vurgu)
- Tüm kenarlarda 1px hafif border
- Daha büyük shadow (elevation: 6)
- Daha fazla padding (20px)
- Geliştirilmiş font boyutları

## Performans Optimizasyonları

### Native Driver Kullanımı

**Aktif:**
- Milestone opacity ve scale animasyonları
- Circular pulse animasyonu
- Transform ve opacity işlemleri

**Devre Dışı:**
- Progress bar width animasyonu (CSS property nedeniyle)

### useEffect Bağımlılıkları

Her animasyon sadece gerekli state değişikliklerinde tetiklenir:
- Progress bar: `tamamlanmaYuzde`, `kayitli`, `gecenGun`
- Milestone: `achievedMilestones.length`, `kayitli`
- Circular: `kayitli`

### Cleanup Functions

Loop animasyonları component unmount olduğunda düzgün şekilde durdurulur:
```javascript
return () => pulseAnimation.stop();
```

## Sonuç

Şafak Sayar uygulaması, askerlerin motivasyonunu yüksek tutmak için kapsamlı bir zaman ve ilerleme gösterim sistemine sahiptir.

### Özellik Özeti

✅ **7 farklı milestone** - İlk 10 günden tek haneli günlere kadar
✅ **3 animasyon türü** - Progress bar, milestone kartları, dairesel pulse
✅ **Gelişmiş görsel tasarım** - Gradient arka planlar, border efektleri, shadow
✅ **Performans optimizasyonu** - Native driver kullanımı, cleanup functions

Dairesel göstergeler, stat kartları, animasyonlu ilerleme çubuğu ve milestone kartları ile kullanıcıya görsel ve motivasyonel geri bildirim sağlanır.
