/* =====================================================================
   KOMIPA — DATA JADWAL RUTIN, LIGA MIPA, DAN ATLET MIPA
   Ubah isi file ini untuk memperbarui halaman Rutin, Liga MIPA, dan Atlet.
   Setelah mengubah, naikkan angka ?v= untuk liga.js di komipa/index.html.

   Format tanggal: "2027-03-14" (tahun-bulan-tanggal), jam: "15.30".
   Bulan saja: "2027-03".

   rutin: sesi KOMIPA Rutin (2 minggu sekali, cabor bergilir)
     { tanggal, jam: "15.30", selesai: "17.30", cabor: "Futsal" | "Badminton" | "Voli" | "Basket" | "Lari" | "Senam",
       tempat, pelatih: "Nama pelatih (mahasiswa FIK)" atau kosong = latihan mandiri,
       catatan: "Bawa sepatu futsal", batal: true (kalau sesi dibatalkan) }

   libur: masa tanpa kegiatan (UTS, UAS)
     { judul: "UTS", mulai: "2027-03-22", selesai: "2027-03-27" }

   komunitas: komunitas per cabor dan koordinatornya
     { cabor: "Futsal", nama: "FMIPA Futsal", koordinator: "Nama", whatsapp: "08xxx", isi: "Kumpul tiap ..." }

   liga: Liga MIPA
     nama, musim, final: { tanggal, jam, tempat, isi }
     cabor: [{ id, nama, kategori, satuan: "gol" | "set" | "gim", poin: { menang, seri, kalah } }]
     pertandingan: [{ cabor: "futsal", pekan: 1 | "Final", tanggal, jam, tempat,
                      tim: ["Matematika", "Fisika"], skor: [3, 1] (kosong = belum main),
                      pencetak: [{ nama, tim: "Matematika", jumlah: 2 }] (khusus futsal → top skor),
                      mvp: { nama, tim } }]
     Klasemen dihitung otomatis dari pertandingan yang sudah ada skornya (selain final).

   atlet: rubrik "Atlet MIPA Bulan Ini"
     { bulan: "2027-03", nama, departemen, angkatan, cabor, klub, prestasi: ["Juara 1 ...", ...],
       cerita: "Kutipan / cerita singkat", foto: "link gambar", instagram: "username" }
   ===================================================================== */
window.KOMIPA = {
  instagram: "", // contoh: "komipa.fmipaum" → tombol "Ikuti di Instagram"

  rutin: [],
  libur: [],
  komunitas: [],

  liga: {
    nama: "Liga MIPA",
    musim: "2027",
    departemen: ["Matematika", "Fisika", "Kimia", "Biologi"],
    final: null,
    cabor: [
      { id: "futsal", nama: "Futsal", kategori: "Putra", satuan: "gol", poin: { menang: 3, seri: 1, kalah: 0 } },
      { id: "voli", nama: "Voli", kategori: "Putri", satuan: "set", poin: { menang: 3, seri: 1, kalah: 0 } },
      { id: "badminton", nama: "Badminton", kategori: "Ganda campuran", satuan: "gim", poin: { menang: 3, seri: 1, kalah: 0 } }
    ],
    pertandingan: []
  },

  atlet: [],

  /* Data contoh: HANYA tampil di mode demo (situs tanpa database) supaya
     tampilan halaman bisa dicoba sebelum data asli diisi. Tanggalnya dibuat
     relatif terhadap hari ini. Jangan isi data asli di sini. */
  contoh: function () {
    const pad = (n) => String(n).padStart(2, "0");
    const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    // Sabtu terdekat sebelum/sesudah hari ini
    const sabtu = (geserMinggu) => { const d = new Date(now); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7) + geserMinggu * 7); return d; };
    const tgl = (d, plus) => { const x = new Date(d); x.setDate(x.getDate() + (plus || 0)); return iso(x); };

    const urutan = ["Futsal", "Badminton", "Voli", "Basket", "Lari", "Senam"];
    const tempat = { Futsal: "Lapangan futsal FIK", Badminton: "GOR FIK", Voli: "Lapangan voli FIK", Basket: "Lapangan basket UM", Lari: "Stadion UM", Senam: "Plaza FMIPA" };
    const rutin = [];
    for (let i = -3; i <= 5; i++) {
      const c = urutan[(i + 3) % urutan.length];
      const d = new Date(now); d.setDate(d.getDate() + i * 14 + ((5 - d.getDay() + 7) % 7)); // Jumat
      rutin.push({ tanggal: iso(d), jam: "15.30", selesai: "17.30", cabor: c, tempat: tempat[c],
        pelatih: i === 2 ? "" : "Contoh: Mahasiswa FIK " + c, catatan: c === "Futsal" ? "Bawa sepatu futsal dan air minum." : "" });
    }
    const libur = [{ judul: "UAS (contoh)", mulai: tgl(now, 30), selesai: tgl(now, 37) }];
    const komunitas = [
      { cabor: "Futsal", nama: "FMIPA Futsal", koordinator: "Contoh: Raka (Fisika 2025)", whatsapp: "", isi: "Main bareng di luar jadwal rutin, biasanya Rabu malam." },
      { cabor: "Badminton", nama: "FMIPA Badminton", koordinator: "Contoh: Salsa (Kimia 2024)", whatsapp: "", isi: "Sewa lapangan patungan, terbuka untuk pemula." },
      { cabor: "Voli", nama: "FMIPA Voli", koordinator: "Contoh: Nadia (Biologi 2025)", whatsapp: "", isi: "Latihan dasar passing dan servis untuk persiapan Liga MIPA." }
    ];

    const D = ["Matematika", "Fisika", "Kimia", "Biologi"];
    const jadwal = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
    const hasil = {
      futsal: [[[3, 1], [2, 2]], [[1, 4], [0, 2]]],
      voli: [[[2, 1], [0, 2]], [[2, 0], [1, 2]]],
      badminton: [[[2, 0], [1, 2]], [[0, 2], [2, 1]]]
    };
    const nama = { Matematika: ["Dimas", "Fajar", "Yoga"], Fisika: ["Raka", "Bima", "Ilham"], Kimia: ["Arif", "Galih", "Rizky"], Biologi: ["Hafiz", "Naufal", "Tegar"] };
    const pertandingan = [];
    ["futsal", "voli", "badminton"].forEach((c, ci) => {
      jadwal.forEach((pekan, p) => {
        pekan.forEach(([a, b], k) => {
          const sk = hasil[c][p] && hasil[c][p][k];
          const m = { cabor: c, pekan: p + 1, tanggal: tgl(sabtu(p - 2)), jam: ["08.00", "10.00", "13.00"][ci].replace(/^(\d+)/, (h) => pad(+h + k)), tempat: { futsal: "Lapangan futsal FIK", voli: "Lapangan voli FIK", badminton: "GOR FIK" }[c], tim: [D[a], D[b]] };
          if (sk) {
            m.skor = sk;
            if (c === "futsal") {
              m.pencetak = [];
              [0, 1].forEach((s) => { for (let g = 0; g < sk[s]; g++) { const n = "Contoh: " + nama[m.tim[s]][(g + p) % 3]; const ada = m.pencetak.find((x) => x.nama === n); ada ? ada.jumlah++ : m.pencetak.push({ nama: n, tim: m.tim[s], jumlah: 1 }); } });
            }
            const menang = sk[0] >= sk[1] ? 0 : 1;
            m.mvp = { nama: c === "futsal" ? "Contoh: " + nama[m.tim[menang]][p % 3] : "Contoh: Pemain " + m.tim[menang], tim: m.tim[menang] };
          }
          pertandingan.push(m);
        });
      });
      pertandingan.push({ cabor: c, pekan: "Final", tanggal: tgl(sabtu(2)), jam: ["13.00", "14.30", "16.00"][ci], tempat: "GOR FIK", tim: ["Juara 1", "Juara 2"] });
    });

    const bln = (geser) => { const d = new Date(now.getFullYear(), now.getMonth() + geser, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
    const atlet = [
      { bulan: bln(0), nama: "Contoh: Aulia Rahma", departemen: "Biologi", angkatan: "2024", cabor: "Pencak silat", klub: "Perguruan Contoh Malang",
        prestasi: ["Contoh: Juara 1 Kejuaraan Pencak Silat Antar-Mahasiswa se-Jawa Timur", "Contoh: Atlet Porprov Jawa Timur"],
        cerita: "Latihan pagi sebelum kuliah, laprak dikerjakan malam. Kuncinya jadwal yang jelas dan teman sekelas yang mau membantu waktu aku izin lomba." },
      { bulan: bln(-1), nama: "Contoh: Bagas Pratama", departemen: "Matematika", angkatan: "2023", cabor: "Bulu tangkis", klub: "PB Contoh",
        prestasi: ["Contoh: Juara 2 tunggal putra turnamen tingkat kota"], cerita: "Matematika dan bulu tangkis sama-sama soal membaca pola." },
      { bulan: bln(-2), nama: "Contoh: Citra Ayu", departemen: "Kimia", angkatan: "2025", cabor: "Lari 10K", klub: "Komunitas lari Contoh",
        prestasi: ["Contoh: Finisher 10K kategori pelajar/mahasiswa, 5 besar putri"], cerita: "Lari jadi caraku melepas penat setelah praktikum." }
    ];
    const final = { tanggal: tgl(sabtu(2)), jam: "13.00", tempat: "GOR FIK", isi: "Final ketiga cabor dalam satu hari, dengan penampilan Seniora dan cabor hiburan tarik tambang antar-departemen." };
    return { rutin, libur, komunitas, atlet, liga: { pertandingan, final } };
  }
};
