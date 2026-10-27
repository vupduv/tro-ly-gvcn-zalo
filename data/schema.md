# Cấu trúc dữ liệu – Hồ sơ học sinh số (Google Sheets)

Mỗi lớp dùng **một file Google Sheets** gồm các tab bên dưới. Khi nhân rộng, trường khác chỉ cần sao chép file mẫu này.

Nguyên tắc:
- **Dạng "mỗi sự kiện một dòng"** cho điểm, hoạt động và nhật ký: bot ghi thêm một dòng rất đơn giản, lọc theo học sinh hoặc theo ngày dễ dàng ("hôm nay con có gì?"), và giữ được lịch sử.
- Tên cột viết `snake_case` không dấu để code đọc ổn định. Nội dung bên trong cột viết tiếng Việt có dấu.
- Ngày theo dạng `YYYY-MM-DD`, giờ theo dạng `HH:mm`.
- `ma_hs` là khoá nối giữa các tab. Không dùng họ tên làm khoá, vì có thể trùng tên.

## Các tab

### `CauHinh`: thông tin chung của lớp (dạng khoá – giá trị)

| khoa | gia_tri (ví dụ) | Ghi chú |
| --- | --- | --- |
| `lop` | 12B1 | |
| `nam_hoc` | 2026-2027 | |
| `hoc_ky_hien_tai` | HK1 | |
| `gvcn_ten` | cô Thủy | Cách bot gọi GVCN |
| `gvcn_sdt` | 09xxxxxxxx | GVCN nhắn số này cho bot thì được nhận là GVCN |
| `gvcn_zalo_id` | (hex 20 ký tự) | Bot tự điền khi GVCN liên kết. Dùng để phân quyền GVCN và gửi thông báo cho GVCN |
| `xac_minh_ngay_sinh` | khong / co | `co`: khi liên kết, phụ huynh phải nhập thêm ngày sinh của con |

### `HocSinh`

| Cột | Ví dụ | Ghi chú |
| --- | --- | --- |
| `ma_hs` | HS01 | Khoá |
| `ho_ten` | Củ Cải | |
| `lop` | 12B1 | |
| `ngay_sinh` | 2009-03-14 | Dùng làm câu hỏi xác minh khi phụ huynh liên kết (nếu nhóm chốt bật) |
| `gioi_tinh` | Nam/Nữ | |
| `trang_thai` | dang_hoc | `dang_hoc` / `chuyen_truong` |
| `ghi_chu` | | Chỉ GVCN thấy |

### `PhuHuynh`: GVCN điền sẵn, bot tự điền `zalo_id` khi phụ huynh liên kết

| Cột | Ví dụ | Ghi chú |
| --- | --- | --- |
| `ma_hs` | HS01 | Một học sinh có thể có nhiều dòng (bố, mẹ...) |
| `ten_phu_huynh` | Vũ | |
| `xung_ho` | anh / chị | Để bot chào "Chào anh Vũ" |
| `quan_he` | bố / mẹ / người giám hộ | |
| `sdt` | 09xxxxxxxx | Chuẩn hoá: chỉ chữ số, đầu số 0 |
| `zalo_id` | (trống) | Bot ghi khi liên kết thành công |
| `ngay_lien_ket` | | |
| `trang_thai` | cho_lien_ket | `cho_lien_ket` / `da_lien_ket` / `khoa` |

Một phụ huynh có hai con trong lớp thì viết hai dòng, cùng SĐT. Khi liên kết, bot gắn `zalo_id` vào cả hai dòng.

### `Diem`

| Cột | Ví dụ | Ghi chú |
| --- | --- | --- |
| `id` | D0001 | |
| `ma_hs` | HS01 | |
| `mon` | Toán | |
| `loai` | TX / GK / CK | Thường xuyên / giữa kỳ / cuối kỳ (theo Thông tư 22) |
| `hinh_thuc` | Miệng / 15 phút / Thực hành / Dự án / Giữa kỳ | |
| `diem` | 8.5 | Thang 10 |
| `ngay` | 2026-10-20 | |
| `hoc_ky` | HK1 | |
| `nhan_xet` | Tiến bộ phần hàm số | Có thể để trống |
| `nguoi_ghi` | gvcn / nhap_excel | Nguồn của dòng điểm |
| `thoi_gian_ghi` | 2026-10-20 15:02 | |

Điểm trung bình môn học kỳ được **tính bằng công thức**, không lưu: ĐTB = (tổng điểm TX + 2×GK + 3×CK) / (số bài TX + 5). Bot chỉ báo ĐTB khi đã có đủ điểm GK và CK.

### `HoatDong`: những gì xảy ra với từng em (ngoài điểm)

| Cột | Ví dụ | Ghi chú |
| --- | --- | --- |
| `id` | A0001 | |
| `ma_hs` | HS02 | |
| `ngay` | 2026-10-22 | |
| `loai` | khen / nhac_nho / hoat_dong / vang | |
| `noi_dung` | Đi muộn 10 phút | |
| `nguoi_ghi`, `thoi_gian_ghi` | | |

### `SuKien`: lịch chung của lớp và của trường

| Cột | Ví dụ |
| --- | --- |
| `id` | E001 |
| `ngay`, `gio` | 2026-11-14, 08:00 |
| `tieu_de` | Họp phụ huynh giữa học kỳ I |
| `mo_ta` | Tại phòng 12B1, … |
| `pham_vi` | lop / truong |

### `NhatKy`: nhật ký mọi thao tác của bot (cũng là nguồn **số liệu minh chứng** cho bài dự thi)

| Cột | Ví dụ |
| --- | --- |
| `thoi_gian` | 2026-10-30 21:15 |
| `zalo_id` | |
| `vai_tro` | phu_huynh / gvcn / chua_lien_ket |
| `hanh_dong` | lien_ket / lien_ket_that_bai / tra_cuu / ghi_diem / ghi_hoat_dong / bao_cao |
| `ma_hs` | |
| `chi_tiet` | Tóm tắt ngắn, không chép nguyên câu trả lời |

Từ tab này đếm được: số lượt phụ huynh tra cứu, số lượt tra cứu ngoài giờ hành chính, số lần GVCN ghi qua chat. Đây là các số liệu nêu trong mục "Số liệu sẽ thu" của kế hoạch.

## Quyền truy cập theo vai trò (ép bằng code trong plugin tool, không dựa vào lời nhắc AI)

| Vai trò | Đọc | Ghi |
| --- | --- | --- |
| Phụ huynh đã liên kết | Dòng có `ma_hs` của con mình trong `HocSinh` (trừ `ghi_chu`), `Diem`, `HoatDong`; toàn bộ `SuKien` | Không |
| Chưa liên kết | Không gì cả | Chỉ thao tác liên kết (khớp SĐT) |
| GVCN | Tất cả | `Diem`, `HoatDong`, `SuKien`, có bước xác nhận trước khi ghi |

## Dữ liệu demo

- Dữ liệu giả: [demo/](demo/) (sinh bằng `node bot/scripts/gen-demo-data.js`). Học sinh và điểm đều ngẫu nhiên.
- SĐT thật của phụ huynh thử nghiệm: `data/private/PhuHuynh.csv`. File này **nằm trong .gitignore, không chia sẻ**.
