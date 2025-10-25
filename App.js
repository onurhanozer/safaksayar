import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Animated,
  Modal,
  Alert,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const turkiyeIlleri = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
  "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta",
  "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt",
  "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak",
  "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman",
  "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export default function App() {
  const [adSoyad, setAdSoyad] = useState('');
  const [sulusGun, setSulusGun] = useState('');
  const [sulusAy, setSulusAy] = useState('');
  const [sulusYil, setSulusYil] = useState('');
  const [askerlikYeri, setAskerlikYeri] = useState('');
  const [askerlikSuresi, setAskerlikSuresi] = useState('6');
  const [toplamIzin, setToplamIzin] = useState('6');
  const [kullanilanIzin, setKullanilanIzin] = useState('0');
  const [alinanCeza, setAlinanCeza] = useState('0');
  const [memleket, setMemleket] = useState('');
  const [kuvvet, setKuvvet] = useState('');
  const [rutbe, setRutbe] = useState('');
  const [sinif, setSinif] = useState('');

  const [kayitli, setKayitli] = useState(false);
  const [kalanGun, setKalanGun] = useState(null);
  const [gecenGun, setGecenGun] = useState(null);
  const [guncelIl, setGuncelIl] = useState('');
  const [guncelPlaka, setGuncelPlaka] = useState('');
  const [terhisTarihi, setTerhisTarihi] = useState('');
  const [ayarlarAcik, setAyarlarAcik] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateInput, setDateInput] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(0);
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 44;
  const bottomSafeHeight = Platform.OS === 'android' ? 42 : 24;
  const heroBottomPadding = bottomSafeHeight + 120;

  // Animasyon değerleri
  const progressBarWidth = useRef(new Animated.Value(0)).current;
  const milestoneOpacity = useRef(new Animated.Value(0)).current;
  const milestoneScale = useRef(new Animated.Value(0.8)).current;
  const circularPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    yukle();
  }, []);

  useEffect(() => {
    console.log('Modal durumu:', ayarlarAcik);
  }, [ayarlarAcik]);

  useEffect(() => {
    console.log('DatePicker görünürlük:', showDatePicker);
    // Modal açıldığında, eğer tarih varsa takvimi o aya götür
    if (showDatePicker && sulusAy && sulusYil) {
      setSelectedMonth(parseInt(sulusAy) - 1);
      setSelectedYear(parseInt(sulusYil));
      // Input'u da güncelle
      if (sulusGun) {
        const gunStr = sulusGun.padStart(2, '0');
        const ayStr = sulusAy.padStart(2, '0');
        setDateInput(`${gunStr}.${ayStr}.${sulusYil}`);
      }
    }
  }, [showDatePicker]);

  // Progress bar animasyonu
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

  // Milestone kartları animasyonu - kalanGun ve gecenGun değiştiğinde tetiklenir
  useEffect(() => {
    if (kayitli && (kalanGun !== null || gecenGun !== null)) {
      milestoneOpacity.setValue(0);
      milestoneScale.setValue(0.8);

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
    }
  }, [kalanGun, gecenGun, kayitli]);

  // Dairesel ilerleme pulse animasyonu
  useEffect(() => {
    const pulseAnimation = Animated.loop(
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
    );

    if (kayitli) {
      pulseAnimation.start();
    }

    return () => pulseAnimation.stop();
  }, [kayitli]);

  const selectDate = (gun, ay, yil) => {
    setSulusGun(gun.toString());
    setSulusAy(ay.toString());
    setSulusYil(yil.toString());
    setShowDatePicker(false);
    // Takvimi güncelle
    setSelectedMonth(ay - 1);
    setSelectedYear(yil);
    // Input'u güncelle
    const gunStr = gun.toString().padStart(2, '0');
    const ayStr = ay.toString().padStart(2, '0');
    setDateInput(`${gunStr}.${ayStr}.${yil}`);
    console.log('Tarih seçildi:', gun, ay, yil);
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const ayIsimleri = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const gunIsimleri = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  const moralMesajlari = [
    "Her yeni gün, terhise bir adım daha yakınsın! 💪",
    "Zor günler geçiyor, güçlü askerler kalıyor! 🎖️",
    "Memleket seni bekliyor, azim seni taşıyor! 🇹🇷",
    "Bu da geçecek, hepsi güzel anı olacak! ⭐",
    "Sabır acıdır ama meyvesi tatlıdır! 🍀",
    "Zorluklar geçici, hatıralar kalıcı! 📸",
    "Her gün yeni bir başarı hikayesi! 🏆",
    "Vatan sağolsun! Sen daha da güçlüsün! 💙",
    "Ailene dönüş için sayılı günler kaldı! ❤️",
    "Bu süreç seni daha güçlü yapacak! 🔥",
  ];

  const getGununSozu = () => {
    const gunIndex = new Date().getDate();
    return moralMesajlari[gunIndex % moralMesajlari.length];
  };

  const yukle = async () => {
    try {
      const data = await AsyncStorage.getItem('askerlikData');
      if (data) {
        const parsed = JSON.parse(data);
        setAdSoyad(parsed.adSoyad || '');
        setAskerlikYeri(parsed.askerlikYeri || '');
        setAskerlikSuresi(parsed.askerlikSuresi || '6');
        setToplamIzin(parsed.toplamIzin || '6');
        setKullanilanIzin(parsed.kullanilanIzin || '0');
        setAlinanCeza(parsed.alinanCeza || '0');
        setMemleket(parsed.memleket || '');
        setKuvvet(parsed.kuvvet || '');
        setRutbe(parsed.rutbe || '');
        setSinif(parsed.sinif || '');
        
        const sulusTarih = parsed.sulusTarihi;
        if (sulusTarih) {
          const [yil, ay, gun] = sulusTarih.split('-');
          setSulusYil(yil);
          setSulusAy(ay);
          setSulusGun(gun);
        }
        
        setKayitli(true);
        hesapla(parsed);
      }
    } catch (error) {
      console.log('Yükleme hatası:', error);
    }
  };

  const hesapla = (data) => {
    const sulusTarihi = new Date(`${data.sulusTarihi || sulusYil + '-' + sulusAy + '-' + sulusGun}`);
    const askerlikGun = parseInt(data.askerlikSuresi || askerlikSuresi) * 30;
    const cezaGun = parseInt(data.alinanCeza || alinanCeza);
    
    const terhis = new Date(sulusTarihi);
    terhis.setDate(terhis.getDate() + askerlikGun + cezaGun);
    
    const simdi = new Date();
    const kalanMs = terhis - simdi;
    const gecenMs = simdi - sulusTarihi;
    
    const kalan = Math.ceil(kalanMs / (1000 * 60 * 60 * 24));
    const gecen = Math.floor(gecenMs / (1000 * 60 * 60 * 24));
    
    setKalanGun(kalan > 0 ? kalan : 0);
    setGecenGun(gecen > 0 ? gecen : 0);
    setTerhisTarihi(terhis.toLocaleDateString('tr-TR'));
    
    if (kalan > 0 && kalan <= 81) {
      setGuncelIl(turkiyeIlleri[kalan - 1]);
      setGuncelPlaka(kalan.toString().padStart(2, '0'));
    } else if (kalan > 81 && kalan <= 100) {
      setGuncelIl('ŞAFAK KARANLIGI');
      setGuncelPlaka('🌅');
    } else if (kalan > 100 && kalan <= 150) {
      setGuncelIl('UZAK GELECEKTESİN');
      setGuncelPlaka('🚀');
    } else if (kalan > 150) {
      setGuncelIl('DAHA YENİSİN');
      setGuncelPlaka('🆕');
    } else {
      setGuncelIl('TERHİS!');
      setGuncelPlaka('🎉');
    }
  };

  const kaydet = async () => {
    const data = {
      adSoyad,
      sulusTarihi: `${sulusYil}-${sulusAy.padStart(2, '0')}-${sulusGun.padStart(2, '0')}`,
      askerlikYeri,
      askerlikSuresi,
      toplamIzin,
      kullanilanIzin,
      alinanCeza,
      memleket,
      kuvvet,
      rutbe,
      sinif
    };
    
    console.log('Kaydedilen veri:', data);
    
    try {
      await AsyncStorage.setItem('askerlikData', JSON.stringify(data));
      setKayitli(true);
      hesapla(data);
      console.log('Kayıt başarılı, hesaplama yapıldı');
    } catch (error) {
      console.log('Kaydetme hatası:', error);
    }
  };

  const sifirla = async () => {
    try {
      await AsyncStorage.removeItem('askerlikData');
      setAdSoyad('');
      setSulusGun('');
      setSulusAy('');
      setSulusYil('');
      setAskerlikYeri('');
      setAskerlikSuresi('6');
      setToplamIzin('6');
      setKullanilanIzin('0');
      setAlinanCeza('0');
      setMemleket('');
      setKuvvet('');
      setRutbe('');
      setSinif('');
      setKayitli(false);
    } catch (error) {
      console.log('Sıfırlama hatası:', error);
    }
  };

  const kalanIzin = parseInt(toplamIzin || 0) - parseInt(kullanilanIzin || 0);
  const yolIzni = kalanGun > 0 ? Math.floor(kalanGun / 30) : 0;
  const toplamGun = parseInt(askerlikSuresi || 6) * 30;
  const hamTamamlanma = toplamGun > 0 ? Math.round((gecenGun / toplamGun) * 100) : 0;
  const tamamlanmaYuzde = Math.min(100, Math.max(0, hamTamamlanma));
  const kalanYuzde = Math.max(0, 100 - tamamlanmaYuzde);
  const kalanGunDisplay = typeof kalanGun === 'number' ? Math.max(0, kalanGun) : 0;
  const gecenGunDisplay = typeof gecenGun === 'number' ? Math.max(0, gecenGun) : 0;
  const kalanGecenOzet = `${kalanGunDisplay} kaldı / ${gecenGunDisplay} bitti`;
  const tamamlanmaMetni = `%${tamamlanmaYuzde} tamamlandı`;

  // Esprili zaman hesaplamaları
  const kalanAy = kalanGun > 0 ? Math.floor(kalanGun / 30) : 0;
  const kalanGunAydan = kalanGun > 0 ? kalanGun % 30 : 0;
  const kalanHafta = kalanGun > 0 ? Math.floor(kalanGun / 7) : 0;
  const kalanSaat = kalanGun > 0 ? kalanGun * 24 : 0;
  const kalanDakika = kalanGun > 0 ? kalanGun * 24 * 60 : 0;

  // Motivasyon mesajları - kalan ve geçen güne göre
  const getMotivasyonMesaji = () => {
    if (gecenGun >= toplamGun) {
      return { emoji: '🎉', baslik: 'TERHİS!', mesaj: 'Tebrikler asker! Artık sivil hayata dönüş zamanı!' };
    } else if (kalanGun <= 30) {
      return { emoji: '👴', baslik: 'TORUN GELİYOR!', mesaj: 'Az kaldı asker! Son 30 gün, dayan biraz daha!' };
    } else if (kalanGun <= 60) {
      return { emoji: '🔥', baslik: 'SON İKİ AY!', mesaj: 'Artık gün sayıyorsun! Finish çizgisi görünüyor!' };
    } else if (kalanGun <= 90) {
      return { emoji: '💪', baslik: 'SON 3 AY!', mesaj: 'Torun yolda! Şimdi en zor dönem, ama sen yaparsın!' };
    } else if (kalanGun <= 120) {
      return { emoji: '🎯', baslik: 'SON 4 AY!', mesaj: 'Artık sayılı günler kaldı! Memleket seni bekliyor!' };
    } else if (kalanGun <= 150) {
      return { emoji: '⭐', baslik: 'SON 5 AY!', mesaj: 'Yarıyı geçtin bile! Şimdi hız kesme, devam!' };
    } else if (kalanGun <= 180) {
      return { emoji: '💫', baslik: 'YARI YOLDA!', mesaj: '6 ay kaldı! Yarıyı geçiyorsun, moral bozma!' };
    } else if (gecenGun >= 90) {
      return { emoji: '🏆', baslik: '3 AY GEÇTİ!', mesaj: 'Çeyrek yolu geçtin! Alışma süreci bitti, tempo devam!' };
    } else if (gecenGun >= 60) {
      return { emoji: '📈', baslik: '2 AY GEÇTİ!', mesaj: 'İki ay geride kaldı! Artık rutin oturdu, devam et!' };
    } else if (gecenGun >= 30) {
      return { emoji: '🌟', baslik: 'BİR AY GEÇTİ!', mesaj: 'İlk ay geride! Alışma süreci bitti, şimdi tempo tuttur!' };
    } else if (gecenGun >= 14) {
      return { emoji: '🌱', baslik: 'İKİ HAFTA!', mesaj: 'İlk iki hafta geride! Artık işlerin yoluna girdi.' };
    } else if (gecenGun >= 7) {
      return { emoji: '🚀', baslik: 'BİR HAFTA!', mesaj: 'İlk hafta bitti! Alışıyorsun, devam et asker!' };
    } else if (gecenGun < 7) {
      return { emoji: '🆕', baslik: 'YENİ BAŞLANGIÇ!', mesaj: 'Hoş geldin asker! Her şey yeni şimdi, alışacaksın.' };
    }
    return { emoji: '⚔️', baslik: 'DEVAM!', mesaj: 'Sen yaparsın asker! Her gün bir adım daha yakınsın!' };
  };

  const motivasyon = getMotivasyonMesaji();
  const milestoneDefinitions = [
    {
      key: 'first-ten-days',
      condition: gecenGunDisplay >= 10 && gecenGunDisplay < 30,
      title: 'İlk 10 Gün Geride 🌱',
      description: 'İlk on günü başarıyla tamamladın! Alışma süreci başladı.'
    },
    {
      key: 'thirty-days',
      condition: gecenGunDisplay >= 30 && gecenGunDisplay < 100,
      title: '30. Gün Başarısı 🌟',
      description: 'Bir ay geride kaldı! Artık rutin oturdu, tempo devam!'
    },
    {
      key: 'hundred-days',
      condition: gecenGunDisplay >= 100 && gecenGunDisplay < 150,
      title: '100. Gün Kutlu Olsun 🎉',
      description: 'Yüz gün geride kaldı; sabrın ve disiplinin için tebrikler!'
    },
    {
      key: 'five-months',
      condition: gecenGunDisplay >= 150,
      title: '150 Gün - 5 Ay Tamamlandı 🏆',
      description: 'Beş ay geride kaldı! İnanılmaz bir başarı, son hızla devam!'
    },
    {
      key: 'halfway',
      condition: tamamlanmaYuzde >= 50 && kalanGunDisplay > 0,
      title: 'Yarısını Devirdin 💪',
      description: 'Görevinin yarısı tamam. Aynı motivasyonla devam!'
    },
    {
      key: 'last-ten-days',
      condition: kalanGunDisplay > 0 && kalanGunDisplay <= 10 && kalanGunDisplay > 9,
      title: 'Son 10 Güne Girdin 🔥',
      description: 'Artık son 10 gün! Finish çizgisi çok yakın, biraz daha dayan!'
    },
    {
      key: 'single-digits',
      condition: kalanGunDisplay > 0 && kalanGunDisplay <= 9,
      title: 'Tek Hanelere Düştün 🎉',
      description: 'Son düzlüğe girdin; şafak sayende sökecek!'
    }
  ];
  const achievedMilestones = kayitli ? milestoneDefinitions.filter(item => item.condition) : [];

  if (!kayitli) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={[styles.safeTop, { height: statusBarHeight }]} />
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.kayitHeader}
        >
          <Text style={styles.kayitLogo}>🎖️</Text>
          <Text style={styles.kayitTitle}>Şafak Sayar</Text>
          <Text style={styles.kayitSubtitle}>Askerlik Geri Sayım Uygulaması</Text>
        </LinearGradient>

        <ScrollView style={styles.kayitScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Hoş Geldin! 👋</Text>
            <Text style={styles.welcomeText}>
              Askerlik sürecini takip etmek için sadece birkaç temel bilgiye ihtiyacımız var.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formRow}>
              <View style={styles.formFull}>
                <Text style={styles.formLabel}>Ad Soyad</Text>
                <TextInput
                  style={styles.formInput}
                  value={adSoyad}
                  onChangeText={setAdSoyad}
                  placeholder="Mehmet Yılmaz"
                  placeholderTextColor="#adb5bd"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formFull}>
                <Text style={styles.formLabel}>Sülüş Tarihi</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => {
                    console.log('Tarih seçici butonu tıklandı');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.datePickerIcon}>📅</Text>
                  <Text style={styles.datePickerText}>
                    {sulusGun && sulusAy && sulusYil 
                      ? `${sulusGun.padStart(2, '0')}.${sulusAy.padStart(2, '0')}.${sulusYil}`
                      : 'Tarih Seç'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>


            <View style={styles.formRow}>
              <View style={styles.formFull}>
                <Text style={styles.formLabel}>Askerlik Süresi</Text>
                <View style={styles.durationButtons}>
                  <TouchableOpacity 
                    style={[styles.durationButton, askerlikSuresi === '6' && styles.durationButtonActive]}
                    onPress={() => setAskerlikSuresi('6')}
                  >
                    <Text style={[styles.durationButtonText, askerlikSuresi === '6' && styles.durationButtonTextActive]}>
                      6 Ay
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.durationButton, askerlikSuresi === '12' && styles.durationButtonActive]}
                    onPress={() => setAskerlikSuresi('12')}
                  >
                    <Text style={[styles.durationButtonText, askerlikSuresi === '12' && styles.durationButtonTextActive]}>
                      12 Ay
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                💡 Diğer detayları (izin, ceza, vb.) daha sonra ayarlardan ekleyebilirsin.
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.kaydetButton, (!adSoyad || !sulusGun || !sulusAy || !sulusYil) && styles.kaydetButtonDisabled]}
              onPress={kaydet}
              disabled={!adSoyad || !sulusGun || !sulusAy || !sulusYil}
            >
              <Text style={styles.kaydetButtonText}>Başlayalım 🚀</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={[styles.safeBottom, { height: bottomSafeHeight }]} />

        <Modal
          visible={showDatePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.dateModalOverlay}>
            <View style={styles.dateModalBody}>
              <View style={styles.dateModalHeader}>
                <Text style={styles.dateModalTitle}>📅 Sülüş Tarihi Seç</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={{flex: 1, padding: 20, backgroundColor: '#fff'}} showsVerticalScrollIndicator={false}>
                {/* Ay/Yıl Navigasyon */}
                <View style={styles.calendarNav}>
                  <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => {
                      if (selectedMonth === 0) {
                        setSelectedMonth(11);
                        setSelectedYear(selectedYear - 1);
                      } else {
                        setSelectedMonth(selectedMonth - 1);
                      }
                    }}
                  >
                    <Text style={styles.navButtonText}>◀</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.monthYearText}>
                    {ayIsimleri[selectedMonth]} {selectedYear}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => {
                      if (selectedMonth === 11) {
                        setSelectedMonth(0);
                        setSelectedYear(selectedYear + 1);
                      } else {
                        setSelectedMonth(selectedMonth + 1);
                      }
                    }}
                  >
                    <Text style={styles.navButtonText}>▶</Text>
                  </TouchableOpacity>
                </View>

                {/* Hafta Günleri */}
                <View style={styles.weekDays}>
                  {gunIsimleri.map((gun, i) => (
                    <Text key={i} style={styles.weekDayText}>{gun}</Text>
                  ))}
                </View>

                {/* Takvim Grid */}
                <View style={styles.calendarGrid}>
                  {Array.from({ length: getFirstDayOfMonth(selectedMonth, selectedYear) }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dayCell} />
                  ))}
                  {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }).map((_, i) => {
                    const day = i + 1;
                    const today = new Date();
                    const isToday = day === today.getDate() && selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
                    const isSelected = day.toString() === sulusGun && (selectedMonth + 1).toString() === sulusAy && selectedYear.toString() === sulusYil;
                    
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayCell,
                          isToday && styles.todayCell,
                          isSelected && styles.selectedCell
                        ]}
                        onPress={() => selectDate(day, selectedMonth + 1, selectedYear)}
                      >
                        <Text style={[
                          styles.dayText,
                          isToday && styles.todayText,
                          isSelected && styles.selectedText
                        ]}>{day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Veya */}
                <Text style={styles.orText}>veya</Text>

                {/* Tek Satır Input */}
                <View style={styles.singleInputContainer}>
                  <Text style={styles.inputLabel}>Tarih Yaz (otomatik nokta eklenir)</Text>
                  <TextInput
                    style={styles.singleDateInput}
                    value={dateInput}
                    onChangeText={(text) => {
                      // Sadece rakamları al
                      const numbers = text.replace(/[^0-9]/g, '');
                      let formatted = '';
                      
                      // İlk 2 rakam (gün)
                      if (numbers.length > 0) {
                        formatted = numbers.substring(0, 2);
                      }
                      
                      // Nokta ve sonraki 2 rakam (ay)
                      if (numbers.length > 2) {
                        formatted += '.' + numbers.substring(2, 4);
                      }
                      
                      // Nokta ve son 4 rakam (yıl)
                      if (numbers.length > 4) {
                        formatted += '.' + numbers.substring(4, 8);
                      }
                      
                      setDateInput(formatted);
                      
                      // Tam format dolduğunda state'i güncelle
                      if (numbers.length >= 8) {
                        const gun = numbers.substring(0, 2);
                        const ay = numbers.substring(2, 4);
                        const yil = numbers.substring(4, 8);
                        setSulusGun(gun);
                        setSulusAy(ay);
                        setSulusYil(yil);
                        // Takvimi de güncelle
                        setSelectedMonth(parseInt(ay) - 1);
                        setSelectedYear(parseInt(yil));
                      }
                    }}
                    placeholder="12.06.2024"
                    keyboardType="numeric"
                    placeholderTextColor="#adb5bd"
                    maxLength={10}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      if (sulusGun && sulusAy && sulusYil) {
                        setShowDatePicker(false);
                      }
                    }}
                  />
                  {sulusGun && sulusAy && sulusYil && dateInput.length === 10 && (
                    <TouchableOpacity 
                      style={styles.confirmDateBtn}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.confirmDateText}>✓ Tamam</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Bugün Butonu */}
                <TouchableOpacity 
                  style={styles.todayBtn}
                  onPress={() => {
                    const t = new Date();
                    selectDate(t.getDate(), t.getMonth() + 1, t.getFullYear());
                    const gun = t.getDate().toString().padStart(2, '0');
                    const ay = (t.getMonth() + 1).toString().padStart(2, '0');
                    const yil = t.getFullYear().toString();
                    setDateInput(`${gun}.${ay}.${yil}`);
                  }}
                >
                  <Text style={styles.todayBtnText}>📅 Bugün</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={[styles.safeTop, { height: statusBarHeight }]} />
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{flex: 1}}
        onMomentumScrollEnd={({ nativeEvent }) => {
          const index = Math.round(nativeEvent.contentOffset.x / width);
          setCurrentPage(index);
        }}
        nestedScrollEnabled={true}
      >
        <View style={{ width, flex: 1 }}>
          <View 
            style={styles.heroPage}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb']}
              style={[styles.heroSection, { paddingBottom: heroBottomPadding }]}
            >
              <View style={styles.heroHeader}>
                <View style={styles.heroLogo}>
                  <Text style={styles.heroLogoText}>🎖️</Text>
                </View>
                <View style={styles.heroTitleContainer}>
                  <Text style={styles.heroTitle}>Şafak Sayar v3.1</Text>
                  <Text style={styles.heroName}>{adSoyad}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.settingsButton}
                  onPress={() => {
                    console.log('Ayarlar butonu tıklandı');
                    setAyarlarAcik(true);
                  }}
                >
                  <Text style={styles.settingsButtonText}>⚙️</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressItem}>
                  <Animated.View
                    style={[
                      styles.progressCircle,
                      { transform: [{ scale: circularPulse }] }
                    ]}
                  >
                    <View style={[styles.progressRing, {
                      borderColor: '#fff',
                      transform: [{ rotate: `${(kalanYuzde * 3.6) - 90}deg` }]
                    }]} />
                    <View style={[styles.progressRing, {
                      borderColor: 'rgba(255,255,255,0.35)',
                      opacity: 0.35
                    }]} />
                    <View style={styles.progressCenter}>
                      <Text style={styles.progressNumber}>{kalanGun}</Text>
                      <Text style={styles.progressLabel}>Gün</Text>
                    </View>
                  </Animated.View>
                  <Text style={styles.progressTitle}>Kalan Süre</Text>
                </View>

                <View style={styles.progressItem}>
                  <Animated.View
                    style={[
                      styles.progressCircle,
                      { transform: [{ scale: circularPulse }] }
                    ]}
                  >
                    <View style={[styles.progressRing, {
                      borderColor: '#fff',
                      transform: [{ rotate: `${(tamamlanmaYuzde * 3.6) - 90}deg` }]
                    }]} />
                    <View style={[styles.progressRing, {
                      borderColor: 'rgba(255,255,255,0.35)',
                      opacity: 0.35
                    }]} />
                    <View style={styles.progressCenter}>
                      <Text style={styles.progressNumber}>{gecenGun}</Text>
                      <Text style={styles.progressLabel}>Gün</Text>
                    </View>
                  </Animated.View>
                  <Text style={styles.progressTitle}>Geçen Süre</Text>
                </View>
              </View>

              <View style={styles.barContainer}>
                <Text style={styles.barLabel}>İlerleme Durumu</Text>
                <View style={styles.barTrack}>
                  <Animated.View
                    style={[
                      styles.barFill,
                      {
                        width: progressBarWidth.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%']
                        })
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barPercent}>{tamamlanmaMetni}</Text>
              </View>

              <View style={styles.bigNumberContainer}>
                <View style={styles.heroStatsRow}>
                  <View style={[styles.heroStatCard, styles.heroStatCardPrimary]}>
                    <Text style={styles.heroStatLabel}>KALAN</Text>
                    <Text style={styles.heroStatNumber}>{kalanGunDisplay}</Text>
                  </View>
                  <View style={styles.heroStatCard}>
                    <Text style={styles.heroStatLabel}>GEÇEN</Text>
                    <Text style={styles.heroStatNumber}>{gecenGunDisplay}</Text>
                  </View>
                </View>
                <Text style={styles.heroStatSummary}>{kalanGecenOzet}</Text>
                <Text style={styles.bigNumberSubLabel}>Doğan Güneş</Text>
              </View>

              <View style={styles.plakaContainer}>
                <View style={styles.plakaBox}>
                  {kalanGun <= 81 ? (
                    <View style={styles.plakaFlag}>
                      <Text style={styles.plakaFlagText}>TR</Text>
                    </View>
                  ) : null}
                  <Text style={styles.plakaNumber}>
                    {kalanGun <= 81 ? `${guncelPlaka} ` : `${guncelPlaka} `}
                    {guncelIl.toUpperCase()}
                  </Text>
                </View>
              </View>
            </LinearGradient>

          </View>
        </View>

        <View style={{ width, flex: 1 }}>
          <View 
            style={{flex: 1}}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.motivasyonCard}
            >
              <Text style={styles.motivasyonEmoji}>{motivasyon.emoji}</Text>
              <Text style={styles.motivasyonBaslik}>{motivasyon.baslik}</Text>
              <Text style={styles.motivasyonMesaj}>{motivasyon.mesaj}</Text>
            </LinearGradient>

            <View style={styles.dailyQuoteCard}>
              <Text style={styles.dailyQuoteIcon}>💭</Text>
              <Text style={styles.dailyQuoteTitle}>Günün Sözü</Text>
              <Text style={styles.dailyQuoteText}>{getGununSozu()}</Text>
            </View>

            {achievedMilestones && achievedMilestones.length > 0 && (
              <View style={styles.milestoneSection}>
                <Text style={styles.milestoneSectionTitle}>Dönüm Noktaların</Text>
                {achievedMilestones.map((milestone, index) => (
                  <Animated.View
                    key={milestone.key}
                    style={[
                      styles.milestoneCard,
                      {
                        opacity: milestoneOpacity,
                        transform: [{ scale: milestoneScale }]
                      }
                    ]}
                  >
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    {milestone.description ? (
                      <Text style={styles.milestoneText}>{milestone.description}</Text>
                    ) : null}
                  </Animated.View>
                ))}
              </View>
            )}

            {kalanGun > 81 ? (
              <View style={styles.funCard}>
                <Text style={styles.funCardTitle}>⏰ Zaman Dilimleri</Text>
                <View style={styles.funGrid}>
                  <View style={styles.funItem}>
                    <Text style={styles.funNumber}>{kalanAy}</Text>
                    <Text style={styles.funLabel}>Ay {kalanGunAydan} Gün</Text>
                  </View>
                  <View style={styles.funItem}>
                    <Text style={styles.funNumber}>{kalanHafta}</Text>
                    <Text style={styles.funLabel}>Hafta</Text>
                  </View>
                  <View style={styles.funItem}>
                    <Text style={styles.funNumber}>{kalanSaat.toLocaleString()}</Text>
                    <Text style={styles.funLabel}>Saat</Text>
                  </View>
                  <View style={styles.funItem}>
                    <Text style={styles.funNumber}>{kalanDakika.toLocaleString()}</Text>
                    <Text style={styles.funLabel}>Dakika</Text>
                  </View>
                </View>
                <Text style={styles.funNote}>
                  💡 Henüz şehir sayımına başlamadık, biraz daha sabır!
                </Text>
              </View>
            ) : null}

          </View>
        </View>

        <View style={{ width, flex: 1 }}>
          <View 
            style={{flex: 1}}
          >
            <View style={styles.funCountdownCard}>
              <Text style={styles.funCountdownTitle}>🎯 Farklı Bakış Açıları</Text>
              <Text style={styles.funCountdownSubtitle}>Aynı süre, farklı ifadeler 😄</Text>

              <View style={styles.funCountdownGrid}>
                <View style={styles.funCountdownItem}>
                  <Text style={styles.funCountdownEmoji}>☕</Text>
                  <Text style={styles.funCountdownNumber}>{kalanGun * 3}</Text>
                  <Text style={styles.funCountdownLabel}>Kahvaltı</Text>
                </View>

                <View style={styles.funCountdownItem}>
                  <Text style={styles.funCountdownEmoji}>😴</Text>
                  <Text style={styles.funCountdownNumber}>{kalanGun}</Text>
                  <Text style={styles.funCountdownLabel}>Uyku</Text>
                </View>

                <View style={styles.funCountdownItem}>
                  <Text style={styles.funCountdownEmoji}>🌙</Text>
                  <Text style={styles.funCountdownNumber}>{Math.ceil(kalanGun / 3)}</Text>
                  <Text style={styles.funCountdownLabel}>Nöbet</Text>
                </View>

                <View style={styles.funCountdownItem}>
                  <Text style={styles.funCountdownEmoji}>📺</Text>
                  <Text style={styles.funCountdownNumber}>{Math.floor(kalanGun / 7)}</Text>
                  <Text style={styles.funCountdownLabel}>Hafta Sonu</Text>
                </View>

                <View style={styles.funCountdownItem}>
                  <Text style={styles.funCountdownEmoji}>📱</Text>
                  <Text style={styles.funCountdownNumber}>{Math.floor(kalanSaat / 2)}</Text>
                  <Text style={styles.funCountdownLabel}>Telefon Süresi</Text>
                </View>

                <View style={styles.funCountdownItem}>
                  <Text style={styles.funCountdownEmoji}>🍽️</Text>
                  <Text style={styles.funCountdownNumber}>{kalanGun * 3}</Text>
                  <Text style={styles.funCountdownLabel}>Yemek</Text>
                </View>
              </View>

              <Text style={styles.funCountdownNote}>
                💬 Arkadaşlarınla paylaş, hep birlikte gülün!
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sülüş Tarihi</Text>
                <Text style={styles.infoValue}>{sulusGun}.{sulusAy}.{sulusYil}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Terhis Tarihi</Text>
                <Text style={styles.infoValue}>{terhisTarihi}</Text>
              </View>
            </View>

            {askerlikYeri ? (
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📍 Askerlik Yeri</Text>
                  <Text style={styles.infoValue}>{askerlikYeri}</Text>
                </View>
              </View>
            ) : null}

            {memleket ? (
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>🏠 Memleket</Text>
                  <Text style={styles.infoValue}>{memleket}</Text>
                </View>
              </View>
            ) : null}

            {kuvvet ? (
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>⚔️ Kuvvet</Text>
                  <Text style={styles.infoValue}>{kuvvet}</Text>
                </View>
              </View>
            ) : null}

            {rutbe || sinif ? (
              <View style={styles.infoCard}>
                {rutbe ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🎖️ Rütbe</Text>
                    <Text style={styles.infoValue}>{rutbe}</Text>
                  </View>
                ) : null}
                {rutbe && sinif ? <View style={styles.infoDivider} /> : null}
                {sinif ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>👤 Sınıf</Text>
                    <Text style={styles.infoValue}>{sinif}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={styles.infoCardHighlight}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabelWhite}>📅 Kalan İzin</Text>
                <Text style={styles.infoValueHighlight}>{kalanIzin} Gün</Text>
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
      <View style={[styles.safeBottom, { height: bottomSafeHeight }]} />

      <View pointerEvents="none" style={[styles.storyIndicator, { top: statusBarHeight + 8 }]}>
        {[0,1,2].map(i => (
          <View key={i} style={[styles.storyDot, currentPage === i && styles.storyDotActive]} />
        ))}
      </View>
      
      <Modal
        visible={ayarlarAcik}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAyarlarAcik(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setAyarlarAcik(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚙️ Ayarlar</Text>
              <TouchableOpacity onPress={() => setAyarlarAcik(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              bounces={true}
            >
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Genel Bilgiler</Text>
                
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Askerlik Yeri</Text>
                  <TextInput
                    style={styles.settingsInput}
                    value={askerlikYeri}
                    onChangeText={setAskerlikYeri}
                    placeholder="Ankara"
                    placeholderTextColor="#adb5bd"
                  />
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Memleket</Text>
                  <TextInput
                    style={styles.settingsInput}
                    value={memleket}
                    onChangeText={setMemleket}
                    placeholder="İstanbul"
                    placeholderTextColor="#adb5bd"
                  />
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Kuvvet</Text>
                  <TextInput
                    style={styles.settingsInput}
                    value={kuvvet}
                    onChangeText={setKuvvet}
                    placeholder="Kara Kuvvetleri"
                    placeholderTextColor="#adb5bd"
                  />
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Rütbe</Text>
                  <TextInput
                    style={styles.settingsInput}
                    value={rutbe}
                    onChangeText={setRutbe}
                    placeholder="Er"
                    placeholderTextColor="#adb5bd"
                  />
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Sınıf</Text>
                  <TextInput
                    style={styles.settingsInput}
                    value={sinif}
                    onChangeText={setSinif}
                    placeholder="Piyade"
                    placeholderTextColor="#adb5bd"
                  />
                </View>
              </View>

              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>İzin ve Ceza</Text>
                
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Toplam İzin (Gün)</Text>
                  <TextInput
                    style={styles.settingsInput}
                    value={toplamIzin}
                    onChangeText={setToplamIzin}
                    placeholder="6"
                    keyboardType="numeric"
                    placeholderTextColor="#adb5bd"
                  />
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Kullanılan İzin (Gün)</Text>
                  <TextInput
                    style={styles.settingsInput}
                    value={kullanilanIzin}
                    onChangeText={setKullanilanIzin}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#adb5bd"
                  />
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Alınan Ceza (Gün)</Text>
                  <TextInput
                    style={styles.settingsInput}
                    value={alinanCeza}
                    onChangeText={setAlinanCeza}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#adb5bd"
                  />
                </View>

              </View>

              <TouchableOpacity 
                style={styles.saveSettingsButton}
                onPress={async () => {
                  await kaydet();
                  setAyarlarAcik(false);
                }}
              >
                <Text style={styles.saveSettingsButtonText}>💾 Kaydet</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    '⚠️ Yeniden Başla',
                    'Tüm veriler silinecek ve baştan başlayacaksın. Emin misin?',
                    [
                      {
                        text: 'İptal',
                        style: 'cancel'
                      },
                      {
                        text: 'Evet, Sil',
                        style: 'destructive',
                        onPress: () => {
                          setAyarlarAcik(false);
                          setTimeout(() => sifirla(), 300);
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.deleteButtonText}>🗑️ Yeniden Başla</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeTop: {
    backgroundColor: '#000',
    width: '100%',
  },
  safeBottom: {
    backgroundColor: '#000',
    width: '100%',
  },
  kayitHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  kayitLogo: {
    fontSize: 64,
    marginBottom: 15,
  },
  kayitTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  kayitSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontWeight: '500',
  },
  kayitScroll: {
    flex: 1,
    marginTop: -20,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#212529',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 15,
    color: '#6c757d',
    lineHeight: 22,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  formFull: {
    flex: 1,
  },
  formHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: 13,
    color: '#667eea',
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#f8f9fa',
    color: '#212529',
    fontWeight: '500',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#f8f9fa',
  },
  datePickerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  datePickerText: {
    fontSize: 15,
    color: '#212529',
    fontWeight: '500',
    flex: 1,
  },
  formInputDisabled: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#e9ecef',
  },
  formInputDisabledText: {
    fontSize: 15,
    color: '#6c757d',
    fontWeight: '600',
  },
  tarihRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tarihInputSmall: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    color: '#212529',
    fontWeight: '600',
  },
  tarihInputYear: {
    flex: 1.5,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    color: '#212529',
    fontWeight: '600',
  },
  tarihSlash: {
    fontSize: 20,
    color: '#667eea',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  yardimButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  yardimButtonText: {
    color: '#667eea',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  kaydetButton: {
    flex: 2,
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  kaydetButtonDisabled: {
    backgroundColor: '#adb5bd',
    shadowOpacity: 0,
  },
  kaydetButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  durationButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
  },
  durationButtonTextActive: {
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  infoBoxText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    fontWeight: '500',
  },
  heroPage: {
    flex: 1,
    backgroundColor: '#5b4acb',
  },
  heroSection: {
    paddingTop: 50,
    paddingBottom: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 25,
  },
  storyIndicator: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 12 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  storyDot: {
    height: 4,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    marginHorizontal: 4,
  },
  storyDotActive: {
    backgroundColor: '#fff',
  },
  heroLogo: {
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 16,
  },
  heroLogoText: {
    fontSize: 36,
  },
  heroTitleContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroName: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  bigNumberContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  bigNumberSubLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 1,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
    paddingHorizontal: 24,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroStatCardPrimary: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroStatLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  heroStatNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroStatSummary: {
    marginTop: 14,
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  plakaContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  plakaBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  plakaFlag: {
    backgroundColor: '#003399',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  plakaFlagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  plakaNumber: {
    color: '#212529',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 10,
  },
  progressItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 16,
    borderRadius: 20,
    minWidth: 140,
  },
  progressCircle: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
  },
  progressCenter: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  progressLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  progressTitle: {
    marginTop: 12,
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  barContainer: {
    paddingHorizontal: 32,
    marginTop: 28,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  barTrack: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  barPercent: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '900',
    marginTop: 10,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  infoScroll: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  motivasyonCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  motivasyonEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  motivasyonBaslik: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  motivasyonMesaj: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    opacity: 0.95,
  },
  funCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  funCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 16,
    textAlign: 'center',
  },
  funGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderColor: '#667eea',
  },
  funItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  funNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#667eea',
    marginBottom: 4,
  },
  funLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
  },
  funNote: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoCardHighlight: {
    backgroundColor: '#667eea',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoLabelWhite: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 17,
    color: '#212529',
    fontWeight: '800',
  },
  infoValueHighlight: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '800',
  },
  bottomSpacer: {
    height: 100,
  },
  resetBtn: {
    backgroundColor: '#667eea',
    marginHorizontal: 20,
    marginVertical: 24,
    marginBottom: 32,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  settingsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 22,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: height * 0.85,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#212529',
  },
  modalClose: {
    fontSize: 28,
    color: '#6c757d',
    fontWeight: '300',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  settingsSection: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsRow: {
    marginBottom: 16,
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#f8f9fa',
    color: '#212529',
    fontWeight: '500',
  },
  saveSettingsButton: {
    backgroundColor: '#667eea',
    margin: 24,
    marginTop: 8,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveSettingsButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deleteButton: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 24,
    marginTop: 0,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dc3545',
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.7,
    paddingBottom: 20,
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dateModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#212529',
  },
  dateModalScroll: {
    flex: 1,
  },
  dateModalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    padding: 20,
    paddingBottom: 16,
    textAlign: 'center',
  },
  quickDateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickDateButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickDateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  dateModalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#495057',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  manualDateInputs: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  manualDateItem: {
    flex: 1,
  },
  manualDateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
  },
  manualDateInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#212529',
    fontWeight: '600',
    textAlign: 'center',
  },
  dateModalConfirm: {
    backgroundColor: '#667eea',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dateModalConfirmText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateModalBody: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  calendarNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarNavButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: 44,
    alignItems: 'center',
  },
  calendarNavText: {
    fontSize: 18,
    color: '#667eea',
    fontWeight: '700',
  },
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: '800',
    color: '#212529',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#6c757d',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  calendarDayEmpty: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
  },
  calendarDayToday: {
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
  },
  calendarDayTodayText: {
    color: '#0066cc',
    fontWeight: '800',
  },
  calendarDaySelected: {
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  calendarDaySelectedText: {
    color: '#fff',
    fontWeight: '800',
  },
  todayButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
    width: 44,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 20,
    color: '#667eea',
    fontWeight: '700',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#212529',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#6c757d',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
  },
  todayCell: {
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
  },
  todayText: {
    color: '#0066cc',
    fontWeight: '800',
  },
  selectedCell: {
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '800',
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 15,
    fontWeight: '600',
  },
  singleInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 8,
    fontWeight: '600',
  },
  singleDateInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
  },
  todayBtn: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  todayBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  confirmDateBtn: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmDateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  funCountdownCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  funCountdownTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212529',
    marginBottom: 4,
    textAlign: 'center',
  },
  funCountdownSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  funCountdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  funCountdownItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  funCountdownEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  funCountdownNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 4,
  },
  funCountdownLabel: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '600',
    textAlign: 'center',
  },
  funCountdownNote: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  dailyQuoteCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  dailyQuoteIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  dailyQuoteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 12,
  },
  dailyQuoteText: {
    fontSize: 15,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  milestoneSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    borderRadius: 20,
    padding: 16,
    paddingTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  milestoneSectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#667eea',
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(102, 126, 234, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  milestoneCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#667eea',
    borderRightWidth: 1,
    borderRightColor: 'rgba(102, 126, 234, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 126, 234, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(102, 126, 234, 0.1)',
  },
  milestoneTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#212529',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  milestoneText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
    fontWeight: '500',
  },
});