# MBG Media Monitoring

Sistem Media Monitoring dan Analisis Sentimen Publik berbasis kecerdasan komputasi untuk memantau, mengagregasi, dan menganalisis percakapan masyarakat seputar program nasional **Makan Bergizi Gratis (MBG)** lintas 4 platform media sosial utama: **YouTube, TikTok, Instagram, dan Facebook**.

---

## Gambaran Umum

Program **Makan Bergizi Gratis (MBG)** menghasilkan volume diskusi publik yang sangat masif di ruang digital. Diskusi ini mencakup berbagai spektrum sentimen, mulai dari apresiasi menu bergizi, tanggapan positif siswa dan guru, hingga kritik konstruktif serta isu sensitif seperti kasus keracunan makanan, keterlambatan pengiriman ompreng makanan, kelayakan vendor katering, dan transparansi alokasi anggaran.

**MBG Media Monitoring** hadir sebagai dashboard analitik cerdas yang dirancang untuk:
1. **Deteksi Dini Krisis & Isu Reputasi**: Mendeteksi lonjakan percakapan bernuansa negatif, dugaan makanan basi, atau kasus keracunan di wilayah tertentu secara cepat (*early warning system*).
2. **Pemetaan Sentimen Publik**: Mengukur rasio sentimen Positif, Negatif, dan Netral menggunakan klasifikasi NLP dengan deteksi ambiguitas dan sarkasme.
3. **Agregasi Multi-Platform Terpadu**: Mengumpulkan konten viral dan ribuan komentar netizen dari YouTube, TikTok, Instagram, dan Facebook ke dalam satu platform analitik sentral.
4. **Dasar Pengambilan Kebijakan**: Menyajikan data statistik akurat untuk evaluasi berkala bagi pemangku kebijakan, pengawas sekolah, dan pengelola program MBG.

---

## Modul & Fitur Utama

### 1. Dashboard Utama
* **Ringkasan Kartu KPI**: Total konten terpantau, total komentar dianalisis, rasio sentimen positif, negatif, dan netral beserta indikator pertumbuhan mingguan.
* **Grafik Tren Sentimen (*Sentiment Trend Chart*)**: Visualisasi kurva temporal 7 harian dengan skala persentase 0% - 100%, garis kisi horizontal, penanda data point interaktif, serta gradasi area lembut untuk kurva sentimen negatif.
* **Grafik Jumlah Konten per Platform (*Platform Bar Chart*)**: Diagram batang proporsional 4 platform dengan sudut melengkung modern, label angka tebal di atas batang, serta ikon logo resmi dan label teks platform.
* **Distribusi Sentimen (*Sentiment Donut Chart*)**: Diagram donat interaktif yang menampilkan komposisi persentase total komentar yang dianalisis.
* **Konten Terpopuler 4 Platform**: Cuplikan Top 5 video/postingan per platform lengkap dengan thumbnail video, nama kreator/media berita, jumlah tayangan, komentar, dan tanggal unggah.
* **Topik Sering Dibahas & Word Cloud**: Tabulasi peringkat topik utama dan kanvas kata kunci populer dengan filter kategori sentimen.

### 2. Manajemen Konten (*Content Monitoring*)
* **Multi-View Mode**: Pilihan tampilan Grid Card interaktif atau Tabel Kompak (*Compact List*).
* **Filter Isu Tematik**: Pengelompokan konten berdasarkan isu krusial: *Semua*, *Keracunan / Makanan Basi*, *Anggaran & Transparansi*, *Distribusi Katering*, dan *Gizi & Porsi*.
* **Sinkronisasi Langsung YouTube API v3**: Penarikan video publik YouTube terbaru secara dinamis menggunakan YouTube Data API v3 berdasarkan filter kata kunci isu.
* **Instagram Scraper Pipeline**: Integrasi data postingan media berita publik Instagram (@kompascom, @tribunnews, @narasinewsroom, dll) secara langsung tanpa ketergantungan API key maupun kredensial login pribadi.

### 3. Analisis Komentar (*Comment Insights & NLP*)
* **Klasifikasi Sentimen Per Komentar**: Analisis teks komentar publik dengan label sentimen Positif, Negatif, atau Netral beserta persentase *confidence score*.
* **Deteksi Sarkasme & Perlunya Review**: Flag khusus otomatis untuk komentar bernuansa ironi/sarkasme atau yang memiliki skor keyakinan model rendah (<70%) guna memfasilitasi verifikasi manual.
* **Filter Platform & Sentimen**: Penyaringan thread komentar berdasarkan platform (YouTube, TikTok, Instagram, Facebook) dan tipe sentimen.
* **Pencarian Cerdas**: Fitur pencarian instan pada isi komentar dan nama akun pengunggah.

### 4. Analisis Mendalam (*Deep Analytics & Risk Index*)
* **Indeks Sentimen Publik (Public Sentiment Index / PSI)**: Indeks skor komposit pada skala -100 s/d +100 untuk mengukur arah tendensi opini publik secara ilmiah.
* **Indeks Risiko Isu Reputasi**: Algoritma penghitungan risiko berbasis bobot multi-parameter:
  * Rasio Komentar Negatif (Bobot 40%)
  * Kenaikan Isu Mingguan (Bobot 25%)
  * Tingkat Viralitas Konten Kritis (Bobot 20%)
  * Kluster Isu Sensitif terhadap Kesehatan Anak (Bobot 15%)
* **Perbandingan Sentimen Lintas Platform**: Analisis komparatif pola respon warganet di tiap platform.
* **Faktor Pendorong Sentimen Negatif**: Klasterisasi akar masalah utama yang mendominasi kritik netizen.
* **Pola Waktu Aktivitas Puncak**: Analisis jam sibuk netizen saat mengunggah dan mendiskusikan menu MBG (misal jam makan siang sekolah vs jam santai malam orang tua).

### 5. Analisis Topik (*Topic Breakdown*)
* **Klasifikasi Ganda**: Membedakan antara Topik Bawaan Sistem (*System Topics*) dan Topik Terdeteksi Otomatis (*Auto-Detected Topics*).
* **Drill-Down Analitik Topik**: Mengukur jumlah sebutan (*mention volume*), persentase kenaikan mingguan, dan rasio sentimen di setiap kluster topik.
* **Panel Bukti Konten**: Menampilkan cuplikan video dan komentar terkait secara langsung saat topik tertentu dipilih.

### 6. Eksplorasi Kata Kunci (*Keyword Analytics*)
* **Interaktif Word Cloud**: Pemetaan ukuran kata kunci berdasarkan frekuensi sebutan di media sosial.
* **Drill-Down Kata Kunci**: Mengidentifikasi kluster topik induk, kategori sentimen, serta contoh konten dan komentar yang memuat kata kunci terpilih.

### 7. Laporan Eksekutif (*Executive Reports*)
* **Ringkasan Eksekutif Berkala**: Dokumen laporan analitik periodik siap cetak (mingguan/bulanan).
* **Indikator Kinerja**: Ringkasan rasio sentimen, platform dengan sentimen paling positif/kritis, serta rekomendasi mitigasi isu untuk pengelola MBG.

### 8. Pengaturan Sistem & Infrastruktur Data (*System Settings*)
* **Status Supabase PostgreSQL**: Pemantauan kesehatan koneksi database cloud, status tabel, dan pooler database.
* **Manajemen Cache Sistem (In-Memory / Redis)**: Pemantauan rasio cache hit rate, ukuran memori, dan tombol *Clear Cache* untuk memaksa query langsung ke database.
* **Status Koneksi Platform**: Pemantauan latensi dan konsumsi kuota API harian untuk seluruh platform media sosial.

---

## Arsitektur & Teknologi

* **Frontend Framework**: React 19, TypeScript
* **Build Tooling & Bundler**: Vite 8 (HMR secepat kilat)
* **Styling & UI Design**: Tailwind CSS v4 (Desain modern, proporsional, border radius tegas tanpa elemen berlebihan)
* **Icon System**: Lucide React & FontAwesome Icons (SVG-only, 100% bebas emoji unicode)
* **Database**: Supabase PostgreSQL Cloud
* **Data Pipelines**:
  * YouTube Data API v3 untuk video dan thread komentar publik
  * Instagram Public Open Graph Parser untuk monitoring akun media berita
* **Code Quality**: Oxlint (Linter super cepat dengan 0 warning & 0 error), TypeScript strict mode

---

## Lisensi & Atribusi

Proyek ini dikembangkan secara independen sebagai platform pemantauan opini publik terbuka berbasis agregasi media sosial. Data yang disajikan dikumpulkan dari konten dan komentar publik untuk kepentingan analisis sentimen dan evaluasi informasi.
