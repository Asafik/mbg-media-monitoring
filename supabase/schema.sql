-- ==============================================================================
-- MBG MONITOR - DATABASE SCHEMA & SEED DATA UNTUK SUPABASE
-- Project: asafik (https://iyruoqteedkyljqbneap.supabase.co)
-- ==============================================================================

-- 1. TABEL KONTEN (contents)
CREATE TABLE IF NOT EXISTS public.contents (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    rank INT DEFAULT 1,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    views TEXT NOT NULL,
    numeric_views BIGINT DEFAULT 0,
    comments TEXT NOT NULL,
    numeric_comments INT DEFAULT 0,
    shares TEXT NOT NULL,
    time_ago TEXT NOT NULL,
    sentiment TEXT NOT NULL, -- 'positif' | 'negatif' | 'netral'
    comment_sentiment_label TEXT,
    thumbnail_url TEXT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL KOMENTAR (comments)
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    anonymized_author TEXT,
    platform TEXT NOT NULL,
    text TEXT NOT NULL,
    sentiment TEXT NOT NULL, -- 'positif' | 'negatif' | 'netral'
    confidence_score NUMERIC(4, 2) DEFAULT 0.90,
    is_sarcasm_or_needs_review BOOLEAN DEFAULT FALSE,
    time_ago TEXT NOT NULL,
    likes INT DEFAULT 0,
    source_content_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL TOPIK (topics)
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'sistem' | 'otomatis'
    mention_count TEXT NOT NULL,
    growth_percentage TEXT NOT NULL,
    is_trending_up BOOLEAN DEFAULT TRUE,
    positive_ratio INT DEFAULT 50,
    negative_ratio INT DEFAULT 30,
    neutral_ratio INT DEFAULT 20,
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL KATA KUNCI (keywords)
CREATE TABLE IF NOT EXISTS public.keywords (
    text TEXT PRIMARY KEY,
    parent_topic TEXT NOT NULL,
    count INT DEFAULT 0,
    sentiment TEXT NOT NULL, -- 'positif' | 'negatif' | 'netral'
    growth TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AKTIFKAN ROW LEVEL SECURITY (RLS) DENGAN AKSES BACA PUBLIK
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read contents" ON public.contents FOR SELECT USING (true);
CREATE POLICY "Allow public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Allow public read keywords" ON public.keywords FOR SELECT USING (true);

-- SEED DATA AWAL (20 KONTEN TOP 5 MBG)
INSERT INTO public.contents (id, platform, rank, title, author, views, numeric_views, comments, numeric_comments, shares, time_ago, sentiment, comment_sentiment_label, thumbnail_url, url)
VALUES
('yt-1', 'YouTube', 1, 'Keracunan massal usai makan MBG di salah satu SD, Dinkes turun tangan', 'Kabar Nusantara TV', '1.4M views', 1400000, '12K komentar', 12000, '4.8K share', '2 hari lalu', 'negatif', 'Sentimen Komentar: Negatif 68%', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=240&auto=format&fit=crop&q=80', 'https://youtube.com'),
('yt-2', 'YouTube', 2, 'Apa kata ahli gizi tentang MBG? Kupas tuntas menu dan nutrisi anak', 'Dunia Medika ID', '980K views', 980000, '8.1K komentar', 8100, '2.9K share', '3 hari lalu', 'positif', 'Sentimen Komentar: Positif 74%', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=240&auto=format&fit=crop&q=80', 'https://youtube.com'),
('tt-1', 'TikTok', 1, 'Anak sekolah senang banget dapat paket makan bergizi gratis hari ini! 😍', '@guru_ceria_id', '2.8M views', 2800000, '21K komentar', 21000, '18K share', '1 hari lalu', 'positif', 'Sentimen Komentar: Positif 82%', 'https://images.unsplash.com/photo-1577308856961-8e9ec50d0c67?w=240&auto=format&fit=crop&q=80', 'https://tiktok.com'),
('tt-2', 'TikTok', 2, 'Menu MBG hari ini di sekolah: Ada ayam suwir, tumis buncis & semangka 🍉', '@sekolah_negeri_1', '1.7M views', 1700000, '14K komentar', 14000, '7.5K share', '2 hari lalu', 'positif', 'Sentimen Komentar: Positif 78%', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=240&auto=format&fit=crop&q=80', 'https://tiktok.com'),
('ig-1', 'Instagram', 1, 'Distribusi MBG di wilayah 3T kepulauan terpencil mulai berjalan lancar', '@kemendikbud_update', '900K views', 900000, '6.4K komentar', 6400, '3.1K share', '1 hari lalu', 'positif', 'Sentimen Komentar: Positif 79%', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=240&auto=format&fit=crop&q=80', 'https://instagram.com'),
('fb-1', 'Facebook', 1, 'Warga dan wali murid apresiasi program MBG membantu asupan nutrisi anak', 'Komunitas Peduli Pendidikan', '820K views', 820000, '4.9K komentar', 4900, '2.2K share', '1 hari lalu', 'positif', 'Sentimen Komentar: Positif 69%', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=240&auto=format&fit=crop&q=80', 'https://facebook.com')
ON CONFLICT (id) DO NOTHING;

-- SEED DATA AWAL KOMENTAR DENGAN SARKASME & REVIW FLAG
INSERT INTO public.comments (id, author, anonymized_author, platform, text, sentiment, confidence_score, is_sarcasm_or_needs_review, time_ago, likes, source_content_title)
VALUES
('cm-1', 'Pengguna YouTube', '@ri***92', 'YouTube', 'Semoga pengawasan kualitas dapur dan higienitas makanannya benar-benar ditingkatkan. Jangan sampai ada kasus basi lagi!', 'negatif', 0.94, false, '35 menit lalu', 342, 'Keracunan massal usai makan MBG di salah satu SD...'),
('cm-2', 'Pengguna TikTok', '@bu***23', 'TikTok', 'Alhamdulillah anak saya di sekolah makannya jadi lahap. Menunya berganti-ganti setiap hari, buahnya segar.', 'positif', 0.98, false, '1 jam lalu', 1280, 'Anak sekolah senang banget dapat paket makan bergizi gratis...'),
('cm-sarcasm-1', 'Pengguna TikTok', '@fe***71', 'TikTok', 'Mantap banget MBG-nya, sampai masuk rumah sakit sekolahan. Program terbaik sedunia deh pokoknya!', 'negatif', 0.58, true, '1 jam lalu', 642, 'Waduh nasinya keras dan sayurnya agak layu hari ini...')
ON CONFLICT (id) DO NOTHING;
