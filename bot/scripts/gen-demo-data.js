// Sinh dữ liệu demo (giả) cho lớp 12B1 theo data/schema.md, ghi CSV vào data/demo/.
// Có seed cố định nên chạy lại vẫn ra cùng dữ liệu. Chạy: node bot/scripts/gen-demo-data.js
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', '..', 'data', 'demo');
fs.mkdirSync(OUT, { recursive: true });

// PRNG có seed (mulberry32)
let seed = 20261027;
const rand = () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const clamp = (x) => Math.max(0, Math.min(10, x));
const round = (x) => Math.round(x * 4) / 4; // điểm lẻ 0.25

const csv = (rows) => {
  const cols = Object.keys(rows[0]);
  const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  return '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c] ?? '')).join(','))].join('\n') + '\n';
};
const write = (name, rows) => fs.writeFileSync(path.join(OUT, `${name}.csv`), csv(rows));

// Mỗi em có "hồ sơ năng lực" để dữ liệu có câu chuyện khi demo
const hocSinh = [
  { ma_hs: 'HS01', ho_ten: 'Củ Cải', ngay_sinh: '2009-03-14', gioi_tinh: 'Nam', base: 8.3, trend: 0, manh: 'Toán' },
  { ma_hs: 'HS02', ho_ten: 'Dinosaur', ngay_sinh: '2009-07-02', gioi_tinh: 'Nữ', base: 7.2, trend: -0.35, manh: 'Ngữ văn' }, // Toán đang tụt
  { ma_hs: 'HS03', ho_ten: 'Zin', ngay_sinh: '2009-11-25', gioi_tinh: 'Nam', base: 7.8, trend: 0.15, manh: 'Tiếng Anh' },
  { ma_hs: 'HS04', ho_ten: 'Lẩu', ngay_sinh: '2009-01-09', gioi_tinh: 'Nam', base: 6.4, trend: 0.25, manh: 'Lịch sử' }, // đang tiến bộ
  { ma_hs: 'HS05', ho_ten: 'Bánh Mì', ngay_sinh: '2009-05-30', gioi_tinh: 'Nữ', base: 7.0, trend: 0, manh: 'Hóa học' }, // chưa có PH liên kết
];
// Học sinh bổ sung sau khi dữ liệu đã lên Google Sheets: sinh bằng seed riêng và nối vào cuối,
// để không làm đổi các dòng (và mã D…/A…) đã có trong Sheets.
const hocSinhThem = [
  {
    ma_hs: 'HS06', ho_ten: 'Trái Đất', ngay_sinh: '2009-08-21', gioi_tinh: 'Nữ', base: 7.6, trend: 0, manh: 'Vật lí',
    hoat_dong: [
      ['2026-10-05', 'hoat_dong', 'Thành viên CLB Thiên văn của trường'],
      ['2026-10-21', 'khen', 'Thuyết trình môn Vật lí rất tốt, được cô bộ môn khen trước lớp'],
    ],
  },
  {
    ma_hs: 'HS07', ho_ten: 'Mặt Trăng', ngay_sinh: '2009-12-03', gioi_tinh: 'Nữ', base: 7.3, trend: 0, manh: 'Ngữ văn',
    giam: { mon: 'Tiếng Anh', moi_buoi: -0.9, nhan_xet: 'Còn nhầm thì của động từ, cần luyện thêm' }, // Tiếng Anh đang đi xuống
    hoat_dong: [
      ['2026-10-02', 'hoat_dong', 'Biên tập viên bản tin lớp tháng 10'],
      ['2026-10-16', 'vang', 'Nghỉ học có phép (việc gia đình)'],
      ['2026-10-23', 'khen', 'Bài văn nghị luận được chọn đọc trước lớp'],
    ],
  },
];
const MON = ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lí', 'Hóa học', 'Lịch sử'];
// Các buổi đánh giá thường xuyên đã diễn ra trong HK1 (đến 27/10/2026)
const LICH_TX = [
  ['2026-09-15', 'Miệng'], ['2026-09-29', '15 phút'], ['2026-10-08', 'Miệng'],
  ['2026-10-20', '15 phút'], ['2026-10-26', 'Miệng'],
];
const now = (d) => `${d} ${String(14 + Math.floor(rand() * 3)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`;

write('CauHinh', [
  { khoa: 'lop', gia_tri: '12B1' },
  { khoa: 'nam_hoc', gia_tri: '2026-2027' },
  { khoa: 'hoc_ky_hien_tai', gia_tri: 'HK1' },
  { khoa: 'gvcn_ten', gia_tri: 'cô chủ nhiệm' },
  { khoa: 'gvcn_sdt', gia_tri: '' }, // SĐT của GVCN: GVCN nhắn SĐT này cho bot là được nhận làm GVCN
  { khoa: 'gvcn_zalo_id', gia_tri: '' }, // bot tự điền khi GVCN liên kết
  { khoa: 'xac_minh_ngay_sinh', gia_tri: 'khong' }, // 'co': phụ huynh phải nhập thêm ngày sinh của con khi liên kết
]);

write('HocSinh', [...hocSinh, ...hocSinhThem].map(({ ma_hs, ho_ten, ngay_sinh, gioi_tinh }) => ({
  ma_hs, ho_ten, lop: '12B1', ngay_sinh, gioi_tinh, trang_thai: 'dang_hoc', ghi_chu: '',
})));

const diem = [];
let di = 1;
const sinhDiem = (hs) => {
  for (const mon of MON) {
    // mỗi môn chỉ có 3–4 buổi TX được chấm trên tổng lịch
    const buoi = LICH_TX.filter(() => rand() < 0.7).slice(0, 4);
    buoi.forEach(([ngay, hinh_thuc], i) => {
      const bonus = mon === hs.manh ? 1 : 0;
      const trend = mon === 'Toán' || hs.trend > 0 ? hs.trend * i : 0;
      const giam = hs.giam && hs.giam.mon === mon ? hs.giam.moi_buoi * i : 0;
      const d = round(clamp(hs.base + bonus + trend + giam + (rand() - 0.5) * 2));
      let nhan_xet = '';
      if (giam && i >= 2) nhan_xet = hs.giam.nhan_xet;
      if (hs.ma_hs === 'HS02' && mon === 'Toán' && i >= 2) nhan_xet = 'Chưa nắm chắc phần đạo hàm, cần ôn lại';
      if (hs.ma_hs === 'HS04' && i === buoi.length - 1 && d >= 7) nhan_xet = 'Tiến bộ rõ so với đầu kỳ';
      diem.push({
        id: `D${String(di++).padStart(4, '0')}`, ma_hs: hs.ma_hs, mon, loai: 'TX', hinh_thuc,
        diem: d, ngay, hoc_ky: 'HK1', nhan_xet, nguoi_ghi: 'nhap_excel', thoi_gian_ghi: now(ngay),
      });
    });
  }
};
hocSinh.forEach(sinhDiem);
diem.sort((a, b) => a.ngay.localeCompare(b.ngay) || a.ma_hs.localeCompare(b.ma_hs));
diem.forEach((r, i) => (r.id = `D${String(i + 1).padStart(4, '0')}`));

const hd = [
  ['HS01', '2026-09-20', 'khen', 'Đạt giải Nhì cuộc thi Toán Olympic cấp trường'],
  ['HS01', '2026-10-15', 'hoat_dong', 'Tham gia CLB Robotics, chuẩn bị cho Techday'],
  ['HS02', '2026-10-06', 'nhac_nho', 'Quên làm bài tập Toán về nhà'],
  ['HS02', '2026-10-22', 'nhac_nho', 'Đi muộn 10 phút'],
  ['HS02', '2026-10-24', 'hoat_dong', 'Dẫn chương trình buổi sinh hoạt lớp'],
  ['HS03', '2026-10-01', 'hoat_dong', 'Thành viên đội tuyển tranh biện tiếng Anh của trường'],
  ['HS03', '2026-10-19', 'vang', 'Nghỉ học có phép (ốm)'],
  ['HS04', '2026-10-12', 'khen', 'Hăng hái phát biểu môn Lịch sử, được thầy bộ môn khen'],
  ['HS04', '2026-10-26', 'hoat_dong', 'Tham gia đội bóng đá của lớp, giải khối 12'],
  ['HS05', '2026-10-09', 'hoat_dong', 'Trực nhật lớp, hoàn thành tốt'],
  ['HS05', '2026-10-23', 'nhac_nho', 'Dùng điện thoại trong giờ học'],
];
const hoatDong = hd.map(([ma_hs, ngay, loai, noi_dung], i) => ({
  id: `A${String(i + 1).padStart(4, '0')}`, ma_hs, ngay, loai, noi_dung, nguoi_ghi: 'gvcn', thoi_gian_ghi: now(ngay),
}));

// Học sinh bổ sung: seed riêng, mã nối tiếp, không sắp xếp lại dữ liệu cũ
seed = 20261028;
for (const hs of hocSinhThem) {
  const truoc = diem.length;
  sinhDiem(hs);
  diem.slice(truoc).forEach((r, i) => (r.id = `D${String(truoc + i + 1).padStart(4, '0')}`));
  for (const [ngay, loai, noi_dung] of hs.hoat_dong) {
    hoatDong.push({ id: `A${String(hoatDong.length + 1).padStart(4, '0')}`, ma_hs: hs.ma_hs, ngay, loai, noi_dung, nguoi_ghi: 'gvcn', thoi_gian_ghi: now(ngay) });
  }
}
write('Diem', diem);
write('HoatDong', hoatDong);

write('SuKien', [
  { id: 'E001', ngay: '2026-11-02', gio: '', tieu_de: 'Bắt đầu tuần kiểm tra giữa học kỳ I', mo_ta: 'Từ 02/11 đến 07/11, lịch chi tiết từng môn sẽ gửi sau', pham_vi: 'truong' },
  { id: 'E002', ngay: '2026-11-14', gio: '08:00', tieu_de: 'Họp phụ huynh giữa học kỳ I', mo_ta: 'Tại phòng học 12B1. Phụ huynh vui lòng đến đúng giờ', pham_vi: 'lop' },
  { id: 'E003', ngay: '2026-11-16', gio: '13:30', tieu_de: 'Techday cấp trường', mo_ta: 'Học sinh tham gia gian trưng bày dự án', pham_vi: 'truong' },
  { id: 'E004', ngay: '2026-11-20', gio: '07:30', tieu_de: 'Lễ kỷ niệm Ngày Nhà giáo Việt Nam', mo_ta: 'Học sinh mặc đồng phục, có mặt tại sân trường', pham_vi: 'truong' },
]);

// NhatKy: chỉ có dòng tiêu đề, bot sẽ ghi dần
fs.writeFileSync(path.join(OUT, 'NhatKy.csv'), '﻿thoi_gian,zalo_id,vai_tro,hanh_dong,ma_hs,chi_tiet\n');

console.log(`Đã ghi vào ${OUT}: ${hocSinh.length + hocSinhThem.length} học sinh, ${diem.length} điểm, ${hoatDong.length} hoạt động.`);
