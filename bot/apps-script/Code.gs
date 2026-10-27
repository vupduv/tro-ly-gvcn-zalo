/**
 * Trợ lý GVCN – cổng dữ liệu Google Sheets (Apps Script web app).
 *
 * Bot (plugin OpenClaw) gọi POST tới web app này với JSON:
 *   { secret, action, zalo_id, params }
 * - `zalo_id` do OpenClaw cung cấp (ID người gửi thật), KHÔNG do AI tự khai.
 * - Mọi kiểm tra quyền (phụ huynh chỉ thấy con mình, chỉ GVCN được ghi) nằm ở đây.
 *
 * Cài đặt: xem bot/apps-script/HUONG-DAN.md
 * Không cần cấu hình thêm: khoá SECRET tự lưu ở lần gọi đầu tiên từ plugin.
 */

const TZ = 'Asia/Ho_Chi_Minh';
const MAX_SAI = 3;

const ACTIONS = {
  vai_tro: vaiTro_,
  lien_ket: lienKet_,
  tra_cuu_con: traCuuCon_,
  gv_xem_lop: gvXemLop_,
  gv_ghi: gvGhi_,
};

function doPost(e) {
  let req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return out_({ ok: false, loi: 'Yêu cầu không phải JSON hợp lệ' });
  }
  // Khoá bí mật: lần gọi hợp lệ đầu tiên (từ plugin) tự lưu khoá; từ đó chỉ chấp nhận đúng khoá này.
  // Muốn đổi khoá: xoá thuộc tính SECRET trong Cài đặt dự án → Thuộc tính tập lệnh.
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('SECRET');
  if (!secret && typeof req.secret === 'string' && req.secret.length >= 24) {
    props.setProperty('SECRET', req.secret);
    secret = req.secret;
  }
  if (!secret || req.secret !== secret) return out_({ ok: false, loi: 'Sai khoá bí mật' });

  const zaloId = String(req.zalo_id || '').trim().toLowerCase();
  if (!/^[0-9a-z]{6,64}$/.test(zaloId)) return out_({ ok: false, loi: 'Thiếu hoặc sai zalo_id' });

  const fn = ACTIONS[req.action];
  if (!fn) return out_({ ok: false, loi: 'Hành động không hợp lệ: ' + req.action });
  try {
    THONG_BAO = [];
    const kq = fn(zaloId, req.params || {});
    const gv = THONG_BAO.length ? config_().gvcn_zalo_id : '';
    if (gv) kq.thong_bao_gvcn = THONG_BAO.map((text) => ({ chat_id: gv, text: '[Trợ lý GVCN] ' + text }));
    return out_(kq);
  } catch (err) {
    return out_({ ok: false, loi: String((err && err.message) || err) });
  }
}

// Cho phép kiểm tra nhanh web app đã chạy chưa (mở URL trên trình duyệt).
function doGet() {
  return out_({ ok: true, dich_vu: 'Trợ lý GVCN', thoi_gian: now_() });
}

// ---------- Hành động ----------

function vaiTro_(zaloId) {
  const r = role_(zaloId);
  return { ok: true, hom_nay: today_(), ...r };
}

function lienKet_(zaloId, p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const props = PropertiesService.getScriptProperties();
    const failKey = 'sai_' + zaloId;
    const sai = Number(props.getProperty(failKey) || 0);
    if (sai >= MAX_SAI) {
      return { ok: false, loi: 'Tài khoản này đã bị tạm khoá vì nhập sai nhiều lần. Vui lòng liên hệ cô chủ nhiệm.' };
    }
    const daCo = role_(zaloId);
    if (daCo.vai_tro !== 'chua_lien_ket') return { ok: true, thong_bao: 'Tài khoản đã được liên kết từ trước', ...daCo };

    const sdt = normPhone_(p.so_dien_thoai);
    if (!sdt) return { ok: false, loi: 'Số điện thoại không hợp lệ. Vui lòng nhập 10 số, ví dụ 09xxxxxxxx.' };

    const cfg = config_();
    const fail = (lyDo) => {
      props.setProperty(failKey, String(sai + 1));
      log_(zaloId, 'chua_lien_ket', 'lien_ket_that_bai', '', lyDo);
      return { ok: false, loi: lyDo, so_lan_con_lai: MAX_SAI - sai - 1 };
    };

    // GVCN tự liên kết bằng SĐT khai ở CauHinh.gvcn_sdt
    if (cfg.gvcn_sdt && normPhone_(cfg.gvcn_sdt) === sdt) {
      if (cfg.gvcn_zalo_id && cfg.gvcn_zalo_id !== zaloId) return fail('Số điện thoại GVCN đã được liên kết với tài khoản Zalo khác.');
      setConfig_('gvcn_zalo_id', zaloId);
      props.deleteProperty(failKey);
      log_(zaloId, 'gvcn', 'lien_ket', '', 'GVCN liên kết');
      return { ok: true, ...role_(zaloId) };
    }

    const t = table_('PhuHuynh');
    const khop = t.rows.filter((r) => normPhone_(r.sdt) === sdt && r.trang_thai !== 'khoa');
    if (!khop.length) return fail('Không tìm thấy số điện thoại này trong danh sách phụ huynh của lớp.');

    if (cfg.xac_minh_ngay_sinh === 'co') {
      const ns = normDate_(p.ngay_sinh_con);
      const hs = table_('HocSinh').rows;
      const dung = khop.some((r) => hs.some((h) => h.ma_hs === r.ma_hs && normDate_(h.ngay_sinh) === ns));
      if (!ns || !dung) return fail('Ngày sinh của con không khớp với hồ sơ.');
    }

    const xungDot = khop.find((r) => r.zalo_id && String(r.zalo_id).toLowerCase() !== zaloId);
    if (xungDot) {
      log_(zaloId, 'chua_lien_ket', 'lien_ket_that_bai', xungDot.ma_hs, 'SĐT đã gắn với Zalo khác');
      notifyGvcn_(`Cảnh báo: có tài khoản Zalo khác vừa thử liên kết bằng SĐT ${maskPhone_(sdt)} (phụ huynh em ${tenHs_(xungDot.ma_hs)}). SĐT này đã được liên kết trước đó.`);
      return { ok: false, loi: 'Số điện thoại này đã được liên kết với một tài khoản Zalo khác. Cô chủ nhiệm đã được thông báo.' };
    }

    for (const r of khop) {
      t.set(r, 'zalo_id', zaloId);
      t.set(r, 'ngay_lien_ket', today_());
      t.set(r, 'trang_thai', 'da_lien_ket');
    }
    props.deleteProperty(failKey);
    const tenCon = khop.map((r) => tenHs_(r.ma_hs)).join(', ');
    log_(zaloId, 'phu_huynh', 'lien_ket', khop.map((r) => r.ma_hs).join(','), '');
    notifyGvcn_(`Phụ huynh ${khop[0].xung_ho || ''} ${khop[0].ten_phu_huynh || ''} (SĐT ${maskPhone_(sdt)}) vừa liên kết Zalo với hồ sơ em ${tenCon}.`);
    return { ok: true, ...role_(zaloId) };
  } finally {
    lock.releaseLock();
  }
}

function traCuuCon_(zaloId, p) {
  const r = role_(zaloId);
  if (r.vai_tro !== 'phu_huynh') return { ok: false, loi: 'Tài khoản chưa liên kết với học sinh nào.', vai_tro: r.vai_tro };
  let dsCon = r.con.map((c) => c.ma_hs);
  if (p.ma_hs) {
    if (!dsCon.includes(p.ma_hs)) return { ok: false, loi: 'Không có quyền xem học sinh này.' };
    dsCon = [p.ma_hs];
  }
  const cfg = config_();
  const ketQua = dsCon.map((ma) => hoSo_(ma, cfg, false));
  log_(zaloId, 'phu_huynh', 'tra_cuu', dsCon.join(','), p.chu_de || '');
  return { ok: true, hom_nay: today_(), phu_huynh: r.phu_huynh, ho_so: ketQua, su_kien: suKien_(cfg) };
}

function gvXemLop_(zaloId, p) {
  const r = role_(zaloId);
  if (r.vai_tro !== 'gvcn') return { ok: false, loi: 'Chỉ GVCN được dùng chức năng này.' };
  const cfg = config_();
  const hs = table_('HocSinh').rows.filter((h) => h.trang_thai !== 'chuyen_truong');
  const chon = p.ma_hs ? hs.filter((h) => h.ma_hs === p.ma_hs) : hs;
  const ph = table_('PhuHuynh').rows;
  const ho_so = chon.map((h) => ({
    ...hoSo_(h.ma_hs, cfg, true, p.tu_ngay),
    phu_huynh: ph.filter((x) => x.ma_hs === h.ma_hs).map((x) => ({ ten: `${x.xung_ho} ${x.ten_phu_huynh}`.trim(), trang_thai: x.trang_thai })),
  }));
  log_(zaloId, 'gvcn', 'xem_lop', p.ma_hs || '', '');
  return { ok: true, hom_nay: today_(), lop: cfg.lop, ho_so, su_kien: suKien_(cfg), thong_ke: thongKe_() };
}

/**
 * Ghi 2 bước: lần 1 (không có ma_xac_nhan) trả bản xem trước + mã; lần 2 gửi kèm mã mới ghi thật.
 * params: { bang: 'Diem'|'HoatDong'|'SuKien', du_lieu: {...}, ma_xac_nhan? }
 */
function gvGhi_(zaloId, p) {
  const r = role_(zaloId);
  if (r.vai_tro !== 'gvcn') return { ok: false, loi: 'Chỉ GVCN được ghi dữ liệu.' };
  const cache = CacheService.getScriptCache();

  if (p.ma_xac_nhan) {
    const raw = cache.get('xn_' + p.ma_xac_nhan);
    if (!raw) return { ok: false, loi: 'Mã xác nhận không đúng hoặc đã hết hạn (10 phút). Hãy tạo lại bản xem trước.' };
    const pending = JSON.parse(raw);
    if (pending.zaloId !== zaloId) return { ok: false, loi: 'Mã xác nhận không thuộc tài khoản này.' };
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const t = table_(pending.bang);
      const row = { ...pending.row, id: nextId_(t, { Diem: 'D', HoatDong: 'A', SuKien: 'E' }[pending.bang]) };
      t.append(row);
      cache.remove('xn_' + p.ma_xac_nhan);
      log_(zaloId, 'gvcn', 'ghi_' + pending.bang, row.ma_hs || '', row.id);
      return { ok: true, da_ghi: row };
    } finally {
      lock.releaseLock();
    }
  }

  const row = chuanHoaBanGhi_(p.bang, p.du_lieu || {});
  if (row.loi) return { ok: false, loi: row.loi, goi_y: row.goi_y };
  const ma = Utilities.getUuid().slice(0, 8);
  cache.put('xn_' + ma, JSON.stringify({ zaloId, bang: p.bang, row }), 600);
  return { ok: true, can_xac_nhan: true, ma_xac_nhan: ma, ban_xem_truoc: { bang: p.bang, ...row, ho_ten: row.ma_hs ? tenHs_(row.ma_hs) : undefined } };
}

// ---------- Nghiệp vụ ----------

function role_(zaloId) {
  const cfg = config_();
  if (cfg.gvcn_zalo_id && cfg.gvcn_zalo_id.toLowerCase() === zaloId) {
    return { vai_tro: 'gvcn', ten: cfg.gvcn_ten || 'GVCN', lop: cfg.lop };
  }
  const links = table_('PhuHuynh').rows.filter((r) => String(r.zalo_id).toLowerCase() === zaloId && r.trang_thai === 'da_lien_ket');
  if (!links.length) return { vai_tro: 'chua_lien_ket', xac_minh_ngay_sinh: cfg.xac_minh_ngay_sinh === 'co' };
  return {
    vai_tro: 'phu_huynh',
    phu_huynh: { ten: links[0].ten_phu_huynh, xung_ho: links[0].xung_ho },
    con: links.map((l) => ({ ma_hs: l.ma_hs, ho_ten: tenHs_(l.ma_hs), quan_he: l.quan_he })),
  };
}

function hoSo_(maHs, cfg, choGv, tuNgay) {
  const h = table_('HocSinh').rows.find((x) => x.ma_hs === maHs) || {};
  const hocSinh = { ma_hs: h.ma_hs, ho_ten: h.ho_ten, lop: h.lop, gioi_tinh: h.gioi_tinh };
  if (choGv) hocSinh.ghi_chu = h.ghi_chu;
  let diem = table_('Diem').rows.filter((d) => d.ma_hs === maHs && (!cfg.hoc_ky_hien_tai || d.hoc_ky === cfg.hoc_ky_hien_tai));
  const tongHop = tongHopDiem_(diem);
  if (tuNgay) diem = diem.filter((d) => d.ngay >= normDate_(tuNgay));
  diem = diem
    .sort((a, b) => (a.ngay < b.ngay ? -1 : 1))
    .map((d) => ({ mon: d.mon, loai: d.loai, hinh_thuc: d.hinh_thuc, diem: Number(d.diem), ngay: d.ngay, nhan_xet: d.nhan_xet }));
  const hoatDong = table_('HoatDong').rows
    .filter((a) => a.ma_hs === maHs && (!tuNgay || a.ngay >= normDate_(tuNgay)))
    .sort((a, b) => (a.ngay < b.ngay ? -1 : 1))
    .map((a) => ({ ngay: a.ngay, loai: a.loai, noi_dung: a.noi_dung }));
  return { hoc_sinh: hocSinh, hoc_ky: cfg.hoc_ky_hien_tai, tong_hop_diem: tongHop, diem, hoat_dong: hoatDong };
}

// Theo Thông tư 22: ĐTB môn = (tổng TX + 2*GK + 3*CK) / (số TX + 5), chỉ tính khi đủ GK và CK.
function tongHopDiem_(diem) {
  const theoMon = {};
  for (const d of diem) {
    const m = (theoMon[d.mon] = theoMon[d.mon] || { tx: [], gk: null, ck: null });
    const v = Number(d.diem);
    if (isNaN(v)) continue;
    if (d.loai === 'GK') m.gk = v;
    else if (d.loai === 'CK') m.ck = v;
    else m.tx.push(v);
  }
  return Object.keys(theoMon).map((mon) => {
    const m = theoMon[mon];
    const tongTx = m.tx.reduce((s, x) => s + x, 0);
    const kq = { mon, so_bai_tx: m.tx.length, tb_tx: m.tx.length ? round2_(tongTx / m.tx.length) : null, gk: m.gk, ck: m.ck };
    kq.dtb_mon = m.gk != null && m.ck != null ? round2_((tongTx + 2 * m.gk + 3 * m.ck) / (m.tx.length + 5)) : null;
    return kq;
  });
}

function suKien_(cfg) {
  const homNay = today_();
  const tuan = Utilities.formatDate(new Date(Date.now() - 7 * 864e5), TZ, 'yyyy-MM-dd');
  return table_('SuKien').rows
    .filter((e) => e.ngay >= tuan && (e.pham_vi !== 'lop' || !e.lop || e.lop === cfg.lop))
    .sort((a, b) => (a.ngay < b.ngay ? -1 : 1))
    .map((e) => ({ ngay: e.ngay, gio: e.gio, tieu_de: e.tieu_de, mo_ta: e.mo_ta, da_qua: e.ngay < homNay }));
}

function thongKe_() {
  const log = table_('NhatKy').rows;
  const ph = table_('PhuHuynh').rows;
  const traCuu = log.filter((l) => l.hanh_dong === 'tra_cuu');
  const ngoaiGio = traCuu.filter((l) => {
    const d = new Date(String(l.thoi_gian).replace(' ', 'T') + ':00+07:00');
    const gio = d.getUTCHours() + 7;
    const thu = new Date(d.getTime() + 7 * 36e5).getUTCDay();
    return thu === 0 || thu === 6 || gio % 24 < 7 || gio % 24 >= 17;
  });
  return {
    phu_huynh_da_lien_ket: ph.filter((r) => r.trang_thai === 'da_lien_ket').length,
    tong_phu_huynh: ph.length,
    luot_tra_cuu: traCuu.length,
    luot_tra_cuu_ngoai_gio: ngoaiGio.length,
    luot_gvcn_ghi: log.filter((l) => String(l.hanh_dong).indexOf('ghi_') === 0).length,
  };
}

function chuanHoaBanGhi_(bang, d) {
  const now = now_();
  const timHs = () => {
    if (d.ma_hs) {
      const h = table_('HocSinh').rows.find((x) => x.ma_hs === d.ma_hs);
      return h ? { ma: h.ma_hs } : { loi: 'Không có mã học sinh ' + d.ma_hs };
    }
    const ten = String(d.ho_ten || '').trim().toLowerCase();
    if (!ten) return { loi: 'Thiếu tên hoặc mã học sinh' };
    const ds = table_('HocSinh').rows.filter((x) => String(x.ho_ten).toLowerCase() === ten || String(x.ho_ten).toLowerCase().endsWith(' ' + ten));
    if (ds.length === 1) return { ma: ds[0].ma_hs };
    if (!ds.length) return { loi: 'Không tìm thấy học sinh tên "' + d.ho_ten + '"' };
    return { loi: 'Có nhiều học sinh tên "' + d.ho_ten + '"', goi_y: ds.map((x) => x.ma_hs + ' ' + x.ho_ten) };
  };

  if (bang === 'Diem') {
    const hs = timHs();
    if (hs.loi) return hs;
    const v = Number(String(d.diem).replace(',', '.'));
    if (isNaN(v) || v < 0 || v > 10) return { loi: 'Điểm phải là số từ 0 đến 10' };
    if (!d.mon) return { loi: 'Thiếu tên môn' };
    const loai = ['TX', 'GK', 'CK'].includes(d.loai) ? d.loai : 'TX';
    return {
      ma_hs: hs.ma, mon: d.mon, loai, hinh_thuc: d.hinh_thuc || (loai === 'TX' ? 'Miệng' : loai === 'GK' ? 'Giữa kỳ' : 'Cuối kỳ'),
      diem: v, ngay: normDate_(d.ngay) || today_(), hoc_ky: d.hoc_ky || config_().hoc_ky_hien_tai,
      nhan_xet: d.nhan_xet || '', nguoi_ghi: 'gvcn', thoi_gian_ghi: now,
    };
  }
  if (bang === 'HoatDong') {
    const hs = timHs();
    if (hs.loi) return hs;
    if (!d.noi_dung) return { loi: 'Thiếu nội dung' };
    const loai = ['khen', 'nhac_nho', 'hoat_dong', 'vang'].includes(d.loai) ? d.loai : 'hoat_dong';
    return { ma_hs: hs.ma, ngay: normDate_(d.ngay) || today_(), loai, noi_dung: d.noi_dung, nguoi_ghi: 'gvcn', thoi_gian_ghi: now };
  }
  if (bang === 'SuKien') {
    if (!d.tieu_de || !normDate_(d.ngay)) return { loi: 'Sự kiện cần có tiêu đề và ngày' };
    return { ngay: normDate_(d.ngay), gio: d.gio || '', tieu_de: d.tieu_de, mo_ta: d.mo_ta || '', pham_vi: d.pham_vi === 'truong' ? 'truong' : 'lop' };
  }
  return { loi: 'Bảng không hợp lệ: ' + bang };
}

// ---------- Truy cập Sheets ----------

function table_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('Thiếu tab ' + name);
  const values = sh.getDataRange().getValues();
  const header = values[0].map((h) => String(h).trim());
  const rows = values.slice(1).map((v, i) => {
    const o = { _row: i + 2 };
    header.forEach((h, j) => (o[h] = cell_(h, v[j])));
    return o;
  }).filter((o) => header.some((h) => o[h] !== ''));
  return {
    rows,
    set(row, col, value) {
      const j = header.indexOf(col);
      if (j < 0) throw new Error(`Tab ${name} thiếu cột ${col}`);
      sh.getRange(row._row, j + 1).setValue(value);
      row[col] = value;
    },
    append(obj) {
      sh.appendRow(header.map((h) => (obj[h] === undefined ? '' : obj[h])));
    },
  };
}

function cell_(header, v) {
  if (v instanceof Date) {
    if (header === 'gio') return Utilities.formatDate(v, TZ, 'HH:mm');
    if (header.indexOf('thoi_gian') === 0) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd HH:mm');
    return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  }
  return typeof v === 'string' ? v.trim() : v;
}

function config_() {
  const cfg = {};
  for (const r of table_('CauHinh').rows) cfg[r.khoa] = String(r.gia_tri || '').trim();
  return cfg;
}

function setConfig_(khoa, giaTri) {
  const t = table_('CauHinh');
  const r = t.rows.find((x) => x.khoa === khoa);
  if (r) t.set(r, 'gia_tri', giaTri);
  else t.append({ khoa, gia_tri: giaTri });
}

function nextId_(t, prefix) {
  const max = t.rows.reduce((m, r) => Math.max(m, Number(String(r.id || '').replace(/\D/g, '')) || 0), 0);
  return prefix + String(max + 1).padStart(prefix === 'E' ? 3 : 4, '0');
}

function log_(zaloId, vaiTro, hanhDong, maHs, chiTiet) {
  const sh = SpreadsheetApp.getActive().getSheetByName('NhatKy');
  if (sh) sh.appendRow([now_(), zaloId, vaiTro, hanhDong, maHs, String(chiTiet || '').slice(0, 200)]);
}

// Thông báo cho GVCN được trả về trong `thong_bao_gvcn`; plugin sẽ gửi qua Zalo (Apps Script không giữ token bot).
let THONG_BAO = [];
function notifyGvcn_(text) {
  THONG_BAO.push(text);
}

// ---------- Tiện ích ----------

function tenHs_(maHs) {
  const h = table_('HocSinh').rows.find((x) => x.ma_hs === maHs);
  return h ? h.ho_ten : maHs;
}

function normPhone_(s) {
  let d = String(s || '').replace(/\D/g, '');
  if (d.indexOf('84') === 0 && d.length === 11) d = '0' + d.slice(2);
  if (d.length === 9 && d[0] !== '0') d = '0' + d;
  return /^0\d{9}$/.test(d) ? d : '';
}

function maskPhone_(sdt) {
  return sdt.slice(0, 3) + '****' + sdt.slice(-3);
}

// Nhận 'YYYY-MM-DD', 'DD/MM/YYYY', 'D/M/YYYY' hoặc Date; trả 'YYYY-MM-DD' hoặc ''.
function normDate_(v) {
  if (!v) return '';
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
}

function today_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
}

function now_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm');
}

function round2_(x) {
  return Math.round(x * 100) / 100;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
