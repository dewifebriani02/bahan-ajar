# 📊 Dataset Skala Besar Latihan Applied Data Analytics (ADA) — Pertemuan 02
**Topik:** pandas Essentials (Indexing loc/iloc, Boolean Filtering, Groupby, Aggregasi, & Merge/Join)
**Universitas Tazkia · Semester Ganjil 2026/2027**

Dataset ini disintesis dari **kasus nyata bisnis & lembaga syariah** dengan **seluruh nama entitas, produk, dan individu disamarkan (fiktif & dummy)**. Skala data mencapai **55.000+ baris** untuk melatih mahasiswa melakukan *data manipulation*, *exploratory data analysis (EDA)*, dan *business intelligence* menggunakan pustaka `pandas`.

---

### 📂 Pembagian 7 Kelompok Kasus & Daftar File:

| No | Kelompok | Studi Kasus / Domain Bisnis | Berkas CSV | Jumlah Baris | Fokus Analisis Utama |
|---|---|---|---|---|---|
| 1 | **Kelompok 1** | **RS Islam As-Syifa** (Layanan Medis & RS Syariah) | `kel1_rs_transaksi_layanan.csv`<br>`kel1_rs_master_poli.csv` | **8.500 Baris**<br>8 Baris (Master) | `pd.merge()` transaksi dengan master poli, `groupby` poli & penjamin (BPJS vs Swasta), filtering klaim tertolak. |
| 2 | **Kelompok 2** | **Barakah Artisan Bakery & Cafe** (F&B / Bakery Halal) | `kel2_fnb_transaksi_kasir.csv`<br>`kel2_fnb_master_menu.csv` | **10.000 Baris**<br>10 Baris (Master) | Analisis margin laba kotor per varian cake, filtering promo/diskon, `groupby` outlet & jam penjualan teramai. |
| 3 | **Kelompok 3** | **Amanah Griya Property Syariah** (Developer Properti) | `kel3_property_kontrak_unit.csv` | **5.500 Baris** | Analisis margin developer per tipe rumah, kelancaran angsuran piutang, filtering skema akad (*Murabahah/Istishna/IMBT*). |
| 4 | **Kelompok 4** | **Pesantren Teknologi Al-Fatih** (Boarding School & IT) | `kel4_pesantren_keuangan_santri.csv` | **8.000 Baris** | Agregasi penerimaan SPP & katering per jurusan/tingkat, filtering santri beasiswa vs mandiri, rasio tunggakan. |
| 5 | **Kelompok 5** | **Lembaga Tahfizh Qur'an Al-Bayan** (Halaqah Qur'an) | `kel5_tahfizh_setoran_halaqah.csv` | **7.500 Baris** | Analisis rata-rata skor kelancaran & tajwid per musyrif, `groupby` juz setoran, tingkat kelulusan mutqin. |
| 6 | **Kelompok 6** | **Koperasi Santri Berkah Bersama** (Minimarket Santri) | `kel6_kopontren_transaksi_retail.csv` | **9.500 Baris** | Omset & margin laba per kategori produk, loyalitas anggota santri/asatidz untuk perhitungan SHU tahunan. |
| 7 | **Kelompok 7** | **Mawaddah Syariah Financial Advisory** (Konsultan Keuangan) | `kel7_konsultan_keuangan_syariah.csv` | **6.000 Baris** | Revenue per konsultan, rating kepuasan klien (CSAT), segmentasi layanan waris/keluarga/sertifikasi per kota. |

---

### 💡 Contoh Kode Pembuka di Google Colab / Jupyter Notebook:

```python
import pandas as pd

# Contoh Membaca Dataset Kelompok 1 (RS Islam As-Syifa)
df_rs = pd.read_csv('datasets/kel1_rs_transaksi_layanan.csv')
df_poli = pd.read_csv('datasets/kel1_rs_master_poli.csv')

# 1. Merge transaksi dengan master poli
df_merged = pd.merge(df_rs, df_poli, on='kode_poli', how='left')

# 2. Boolean Filtering: Pasien BPJS dengan total tagihan > 1 Juta
df_bpjs_tinggi = df_merged[(df_merged['penjamin'] == 'BPJS Kesehatan') & (df_merged['total_tagihan'] > 1000000)]

# 3. Groupby & Aggregasi: Total revenue dan jumlah pasien per poli
rekap_poli = df_merged.groupby('nama_poli').agg(
    total_pasien=('id_transaksi', 'count'),
    total_pendapatan=('total_tagihan', 'sum'),
    rata_biaya_obat=('biaya_obat_farmasi', 'mean')
).reset_index()

print(rekap_poli)
```
