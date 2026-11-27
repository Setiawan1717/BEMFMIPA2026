/* =====================================================================
   Science Entrepreneur — KATALOG UNIT USAHA
   Ubah daftar produk & harga di file ini. Harga dalam rupiah (angka saja).
   Semua harga di bawah masih SEMENTARA (contoh), ganti dengan harga asli.

   Aturan poin SE (dipakai di halaman Unit Usaha & Member):
     - setiap pesanan dapat cashback poin = CASHBACK × harga (1 poin = Rp1)
     - poin hanya bisa ditukar untuk unit "sewa", tidak untuk beli/cetak
     - kartu member Rp15.000, langsung dapat 15.000 poin
   ===================================================================== */
window.SE_KATALOG = {
  CASHBACK: 0.10,
  KARTU: { harga: 15000, poinAwal: 15000 },
  // Nomor WhatsApp admin SE untuk pesanan. Kosongkan untuk memakai kontak di bso-config.js.
  whatsapp: "",

  unit: [
    {
      id: "beli",
      nama: "Beli Kebutuhan Acara",
      singkat: "Beli",
      ikon: "heart",
      deskripsi: "Perlengkapan dan suvenir yang langsung jadi milikmu: figura, plakat, buket, dan lainnya.",
      tukarPoin: false,
      produk: [
        { nama: "Figura A4", harga: 35000, satuan: "pcs", ket: "Bingkai kayu minimalis untuk sertifikat atau foto." },
        { nama: "Figura A3", harga: 55000, satuan: "pcs", ket: "Cocok untuk kenang-kenangan pemateri." },
        { nama: "Plakat akrilik", harga: 85000, satuan: "pcs", ket: "Plakat bening dengan cetak UV, termasuk desain sederhana." },
        { nama: "Buket wisuda", harga: 75000, satuan: "pcs", ket: "Buket bunga kering atau snack, pilih warna sesuai acara." },
        { nama: "Medali acara", harga: 15000, satuan: "pcs", ket: "Medali logam dengan pita, minimal 20 pcs." },
        { nama: "Goodie bag", harga: 8000, satuan: "pcs", ket: "Tas spunbond untuk peserta, minimal 30 pcs." }
      ]
    },
    {
      id: "sewa",
      nama: "Sewa Perlengkapan Acara",
      singkat: "Sewa",
      ikon: "camera",
      deskripsi: "Peralatan acara yang bisa dipinjam per hari. Unit ini juga bisa dibayar pakai poin SE.",
      tukarPoin: true,
      produk: [
        { nama: "Kamera DSLR", harga: 100000, satuan: "hari", ket: "Kamera + lensa kit 18–55 mm, baterai cadangan, memori 32 GB." },
        { nama: "Proyektor", harga: 75000, satuan: "hari", ket: "Proyektor 3.500 lumen, kabel HDMI 5 m." },
        { nama: "Layar proyektor", harga: 40000, satuan: "hari", ket: "Layar tripod 70 inci, mudah dipasang." },
        { nama: "Sound portable + mic", harga: 120000, satuan: "hari", ket: "Speaker aktif dengan 2 mic wireless." },
        { nama: "Tripod", harga: 25000, satuan: "hari", ket: "Tripod kamera atau HP, tinggi sampai 1,7 m." },
        { nama: "HT (sepasang)", harga: 30000, satuan: "hari", ket: "Handy talky untuk koordinasi panitia." }
      ]
    },
    {
      id: "cetak",
      nama: "Cetak Kebutuhan Acara",
      singkat: "Cetak",
      ikon: "cards",
      deskripsi: "Cetak identitas dan media publikasi acara: lanyard, banner, sertifikat, dan lainnya.",
      tukarPoin: false,
      produk: [
        { nama: "Lanyard + ID card", harga: 12000, satuan: "pcs", ket: "Tali sablon 2 sisi dan ID card PVC, minimal 20 pcs." },
        { nama: "Banner 1 × 3 m", harga: 45000, satuan: "pcs", ket: "Flexi 280 g, finishing mata ayam." },
        { nama: "X-banner 60 × 160 cm", harga: 65000, satuan: "pcs", ket: "Termasuk rangka X-banner." },
        { nama: "Sertifikat A4", harga: 2000, satuan: "lembar", ket: "Art paper 260 g, cetak full color." },
        { nama: "Stiker", harga: 1500, satuan: "pcs", ket: "Stiker vinyl potong 5 × 5 cm." },
        { nama: "Kaos panitia", harga: 75000, satuan: "pcs", ket: "Cotton combed 30s, sablon 1 sisi." }
      ]
    }
  ]
};
