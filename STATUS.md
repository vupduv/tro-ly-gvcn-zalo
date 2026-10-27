# STATUS – Trợ lý GVCN trên Zalo

Cập nhật: 2026-10-27 (cuối ngày bring-up). Người làm bring-up sẽ bàn giao cho người khác phát triển tiếp.

File này chỉ giữ **hiện trạng, việc tiếp theo và quyết định đã chốt**. Lịch sử từng bước và lý do: [docs/nhat-ky-bring-up.md](docs/nhat-ky-bring-up.md). Cách cài và vận hành: [README.md](README.md).

## Hiện trạng

**Mốc cuộc thi:** nộp tóm tắt (< 250 từ) + video (≤ 3 phút) vào **2/11/2026**; BGK chọn 6 bài trước 10/11; Educamp cấp trường 16/11. Rubric và quy định: [AGENTS.md](AGENTS.md).

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| Zalo Bot test "Bot Củ Cải" (`bot.RNHMCTeM`) | Chạy | Polling, chat 1-1 |
| OpenClaw 2026.10.7 + plugin `tro-ly-gvcn` | Chạy | Trên máy Windows của người làm bring-up, chưa 24/7 |
| Google Sheets + Apps Script | Chạy | File demo 7 học sinh giả, 6 phụ huynh thử (SĐT thật trong `data/private/`). Chia sẻ file cần đặt "Bị hạn chế" |
| Liên kết phụ huynh bằng SĐT | Đã thử, đạt | Tài khoản thử đã liên kết làm PH em Lẩu và em Củ Cải |
| Phụ huynh tra cứu | Đã thử, đạt | Trả đúng số liệu (vd. điểm gần nhất, sự kiện) |
| Phân quyền (chưa liên kết / sai khoá / không phải GVCN) | Đã thử, đạt | Gọi thẳng Apps Script với ID giả: bị từ chối đúng |
| GVCN ghi điểm 2 bước | **Chưa thử** | Có code. Chưa kiểm việc chặn xác nhận trong cùng lượt khi chạy thật |
| Báo cáo họp phụ huynh | **Chưa thử** | Có quy tắc trong `bot/workspace/AGENTS.md` |
| Model AI | Tạm ổn | `zai/glm-4.5-flash` miễn phí, 3–5 giây/lượt. Z.ai đã báo **sắp ngừng** model này. Dự phòng: `cerebras/qwen-3.8-27b` (trả phí, còn khoảng 5 USD credit), `google/gemini-3.1-flash-lite` (20 lần/ngày) |
| Lỗi model hiện cho người dùng | **Lỗi** | Thông báo 429 / quá tải bằng tiếng Anh lộ ra Zalo |
| Markdown | **Lỗi nhẹ** | Model đôi khi chèn `**`, Zalo hiện nguyên |
| Tài liệu | Xong | README, báo cáo [report/kien-truc-he-thong.html](report/kien-truc-he-thong.html), kịch bản thử [bot/KICH-BAN-THU.md](bot/KICH-BAN-THU.md) |

**Vai trò dữ liệu demo hiện tại** (tab `CauHinh` / `PhuHuynh` trên Sheets): GVCN = cô Vân (`036****025`); Dinosaur và Bánh Mì không có phụ huynh liên kết được; anh Vũ (`096****808`) là PH Củ Cải. Chi tiết: [bot/KICH-BAN-THU.md](bot/KICH-BAN-THU.md).

## Việc tiếp theo (theo thứ tự ưu tiên)

Mỗi việc có tiêu chí "xong". Việc nào cần quyết định của con người thì ghi rõ.

1. **Chốt nguồn model cho tuần thí điểm** *(cần quyết định của nhóm/BGH: ngân sách nhỏ)*.
   - Phương án: xin voucher FPT AI Marketplace / Token Factory (hợp tiêu chí bản sắc FPT), hoặc nạp vài USD Z.ai `glm-5.3-flash` (khoảng 0,01 USD/tin), DeepSeek `deepseek-flash`. Chi tiết: [research/api-credit-programs.md](research/api-credit-programs.md).
   - Xong khi: có model trả lời ổn định < 10 giây, đủ cho khoảng 10 phụ huynh × vài tin/ngày trong 1 tuần, và đã đặt bằng `openclaw models set`.
2. **Chạy hết kịch bản thử** [bot/KICH-BAN-THU.md](bot/KICH-BAN-THU.md), nhất là phần C (GVCN ghi điểm, báo cáo họp phụ huynh).
   - Xong khi: mọi dòng có kết quả Đạt/Không đạt; lỗi đã sửa hoặc ghi vào đây.
3. **Câu báo lỗi thân thiện** khi model lỗi (429, quá tải, timeout) thay cho thông báo tiếng Anh.
   - Hướng làm: tìm hook / cấu hình thông báo lỗi của OpenClaw (`docs/concepts/messages`, `model-failover`), hoặc xử lý ở tầng plugin.
   - Xong khi: tắt khoá model rồi nhắn bot, phụ huynh nhận câu tiếng Việt lịch sự.
4. **Lọc Markdown** trong câu trả lời gửi Zalo (bỏ `**`, `#`, bảng), hoặc bật `parse_mode` nếu kênh zalo hỗ trợ.
5. **Sẵn sàng thí điểm với phụ huynh thật** *(cần BGH đồng ý dùng dữ liệu)*: file Sheets thật của lớp, chia sẻ "Bị hạn chế", máy chạy bot bật liên tục trong khung giờ đã báo phụ huynh. Bắt đầu đo số liệu "trước" (thời gian GVCN trả lời phụ huynh/tuần).
6. **Hồ sơ nộp 2/11** *(người)*: tóm tắt 250 từ, video 3 phút, nêu rõ công cụ AI đã dùng (Phụ lục 2 của đề). Sửa sơ đồ trong `plan/*.docx` (ô GVCN còn ghi "Gửi Excel"). Có thể nhờ agent `rubric-reviewer` chấm thử.
7. **Sau 2/11:** chạy 24/7 (máy chủ + webhook), bộ nhập dữ liệu theo định dạng xuất thật của trường (mẫu ở `sample-input/` trên máy bring-up, không có trong repo), cảnh báo sớm khi điểm tụt, nhiều lớp.

## Cần chốt (từ kế hoạch, chưa có câu trả lời)

- [ ] Tên chính thức của sản phẩm
- [ ] Lớp thí điểm và 5–10 phụ huynh tham gia
- [ ] Nơi chạy bot lâu dài, nguồn model, ai chi trả (xem việc 1)
- [ ] Phân công giữa Vân và Thủy
- [x] Trường xuất được dữ liệu Excel: có (tab "Tiết học", "Nhận xét học sinh"; xem quyết định bên dưới)

## Quyết định đã chốt

- **Nhập điểm:** GVCN dán Excel thẳng vào Google Sheets; điểm lẻ, hoạt động, sự kiện thì nhắn bot (ghi 2 bước có xác nhận). Lý do: Zalo Bot không nhận file (đã thử). Nhập qua link Sheets hoặc ảnh chụp để sau 2/11.
- **Liên kết phụ huynh:** GVCN điền sẵn SĐT phụ huynh trong tab `PhuHuynh`, phụ huynh tự nhắn SĐT để liên kết (không có hàng chờ duyệt). Sai 3 lần thì khoá; SĐT đã gắn Zalo khác thì từ chối và báo GVCN. Xác minh thêm ngày sinh con là tuỳ chọn (`CauHinh.xac_minh_ngay_sinh`, đang tắt).
- **GVCN** cũng tự liên kết bằng SĐT trong `CauHinh.gvcn_sdt`. Đổi GVCN: sửa `gvcn_sdt` **và xoá** `gvcn_zalo_id`.
- **Truy cập Sheets qua Apps Script web app** (không dùng service account): trường khác chỉ cần sao chép file mẫu và bấm Triển khai, cộng điểm tiêu chí nhân rộng.
- **Một agent OpenClaw**, quyền ép ở Apps Script theo Zalo ID người gửi (không dùng binding nhiều agent).
- **Không chạy model trên máy cá nhân** (máy dùng cho việc khác). Chỉ dùng model online.
- **`sample-input/` chứa dữ liệu thật** (họ tên, mã HS, vắng, nhận xét GV, email GV lớp 11B2): luôn gitignore. File cho thấy định dạng xuất thật của trường: tab "Tiết học" (lớp, môn, GV, ngày, tiết, điểm danh, nhận xét lớp, syllabus) và tab "Nhận xét học sinh" (mã HS dạng `FHL…`, họ tên, nhận xét gộp theo tiết).
- **Repo GitHub để private**: có thể lệ nội bộ (`info-request/`) và bản lưu tài liệu Zalo (`zalo-doc/`). Chuyển public thì gỡ hai thư mục này trước.

## Để sau (ngoài phạm vi 2/11)

Đăng ký phụ huynh bằng mã học sinh (khi nhiều lớp); nhập điểm qua link Sheets hoặc ảnh; cảnh báo sớm; nề nếp, ngoại khoá, nhắc lịch; nhóm chat lớp; máy chủ riêng của trường.
