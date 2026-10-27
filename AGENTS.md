# AGENTS.md – Trợ lý GVCN trên Zalo (AI Educamp 2026)

Hướng dẫn chung cho mọi AI agent làm việc trong repo này. Trao đổi và viết tài liệu bằng **tiếng Việt**.

## Dự án là gì

Bài dự thi **AI Educamp 2026** (cấp trường, THPT FPT Hà Nội, chủ đề "Trường học số"). Nhóm tác giả: Vân và Thủy.

Sản phẩm: một **AI agent trên Zalo** giữ hồ sơ số của từng học sinh, phục vụ hai nhóm người dùng:

1. **GVCN cập nhật**: nhắn một câu (hoặc nhập file điểm) về điểm, hoạt động lớp, sự kiện. Bot hỏi lại để xác nhận rồi mới ghi.
2. **Phụ huynh tra cứu**: hỏi bằng lời thường, bot trả lời từ dữ liệu mới nhất của **đúng con mình**.
3. **Báo cáo họp phụ huynh**: GVCN nhắn một câu, bot tổng hợp số liệu cả lớp và từng em (bản demo).

Kiến trúc: GVCN / Phụ huynh ⇄ **Zalo Bot** (Zalo Bot Creator) ⇄ **OpenClaw agent** ⇄ **Google Sheets** (hồ sơ học sinh). Claude hỗ trợ vibe coding.

## Mốc thời gian (năm 2026)

| Ngày | Việc |
| --- | --- |
| 27/10 – 2/11 | Dựng bot, thí điểm với 5–10 phụ huynh, quay video |
| **2/11** | **Hạn nộp**: tóm tắt **dưới 250 từ** + video thuyết minh **tối đa 3 phút**, nộp vào thư mục Drive của BTC |
| 3/11 – 10/11 | BGK chấm và chọn 6 sản phẩm. Nhóm mở rộng thí điểm, đo hiệu quả, viết hướng dẫn nhân rộng |
| 16/11 | Educamp cấp trường chọn 2 sản phẩm vào vòng cấp khối (dự kiến tháng 1/2027) |

## Rubric chấm (100 điểm). Mọi quyết định nên soi vào đây

| Tiêu chí | % | Để đạt mức Xuất sắc cần |
| --- | --- | --- |
| Tác động & minh chứng thực tiễn | 30 | Dùng thật tại trường, có số liệu **so sánh trước–sau**, minh chứng kiểm chứng được |
| Giá trị Trường học số & bản sắc đơn vị | 25 | Bản sắc thể hiện trong **chức năng** (vd. theo cách đánh giá của THPT FPT), không chỉ ở logo; gắn với chiến lược của trường và của Khối |
| Khả năng nhân rộng | 20 | Có **bộ hướng dẫn triển khai**: yêu cầu dữ liệu, hạ tầng, nhân lực, chi phí, phương án bảo trì; tốt nhất là đã thử chuyển giao |
| Sáng tạo & ứng dụng AI | 15 | Giải thích được vai trò của AI, **cách kiểm tra và điều chỉnh đầu ra** |
| Chất lượng kỹ thuật | 10 | Chạy được, ổn định, trải nghiệm hợp lý |

Quy định đáng chú ý (Phụ lục 2 của đề): sản phẩm do chính nhóm làm; phải **nêu rõ các công cụ AI đã dùng** và phạm vi hỗ trợ; minh chứng phải trung thực và kiểm chứng được. Đề đầy đủ ở [info-request/](info-request/).

## Cấu trúc thư mục

| Đường dẫn | Nội dung | Ghi chú |
| --- | --- | --- |
| [info-request/](info-request/) | Thể lệ và rubric cuộc thi (PDF) | Chỉ đọc |
| [plan/](plan/) | Kế hoạch dự thi (.md là bản chính; .docx có thêm 2 sơ đồ) | Sửa kế hoạch thì sửa file .md |
| [zalo-doc/](zalo-doc/) | Bản lưu doc Zalo Bot Platform, kênh Zalo của OpenClaw và các SDK | **Đọc [zalo-doc/README.md](zalo-doc/README.md) trước**: có mục lục và các ràng buộc kỹ thuật |
| [STATUS.md](STATUS.md) | **File trạng thái dự án**: hiện trạng, việc tiếp theo, quyết định đã chốt | Đọc đầu tiên. Cập nhật sau mỗi phiên |
| [README.md](README.md) | Kiến trúc, cài đặt từ đầu, vận hành, những chỗ dễ vấp | Tài liệu bàn giao |
| [bot/](bot/) | Plugin OpenClaw, Apps Script, cấu hình OpenClaw, workspace của bot, script, kịch bản thử | **Lưu ý:** `bot/workspace/AGENTS.md` là quy tắc của chính con bot Zalo (OpenClaw đọc), khác hẳn file bạn đang đọc |
| [data/](data/) | `schema.md` (cấu trúc Sheets) và `demo/` (dữ liệu giả) | `data/private/` có SĐT thật, đã gitignore |
| [research/](research/) | Ghi chú nghiên cứu, mỗi chủ đề một file, có nguồn | |
| [docs/](docs/) | Nhật ký bring-up chi tiết (lịch sử, không phải trạng thái hiện tại) | |
| [report/](report/) | Báo cáo kỹ thuật dạng HTML tĩnh | Cập nhật khi kiến trúc đổi |

Các thư mục sẽ tạo khi cần (giữ đúng tên): `submission/` (tóm tắt 250 từ, kịch bản video, hướng dẫn nhân rộng), `evidence/` (số liệu trước–sau, phản hồi phụ huynh, ảnh chụp đã che thông tin cá nhân).

Không có trong repo, chỉ nằm trên máy bring-up: `.env`, `data/private/`, `bot/logs/`, `sample-input/` (file xuất thật của trường, có dữ liệu học sinh thật: **không bao giờ commit**).

## Ràng buộc kỹ thuật đã kiểm chứng

Danh sách đầy đủ ở README, mục "Những điều đã biết". Các điểm quan trọng nhất:

- Dùng **kênh `zalo` chính thức của OpenClaw** (`@openclaw/zalo`) với Bot Token từ Zalo Bot Creator. Không dùng My ClawBot (chỉ chat với chủ sở hữu), không dùng plugin Zalo cộng đồng (tài khoản cá nhân).
- Bot **không nhận được file** (.xlsx). Ảnh, chữ, sticker, tin thoại thì nhận được. Tin gửi lúc bot tắt bị mất.
- Zalo user ID là **chuỗi hex 20 ký tự**. Bot API không trả SĐT người nhắn. Zalo hiển thị văn bản thuần (không Markdown), tối đa 2000 ký tự/tin.
- Chỉ dùng chat 1-1 (nhóm chat của Zalo Bot còn thử nghiệm nội bộ).
- **Quyền được ép ở Apps Script** theo `ctx.requesterSenderId`. Tool của plugin phải đăng ký dạng factory. Agent dùng `profile: minimal` + `alsoAllow`, không dùng `allow`.

## Quy tắc dữ liệu và an toàn (bắt buộc)

- **Không đưa dữ liệu học sinh thật vào repo**: không tên, điểm, Zalo ID hay số điện thoại thật. Dữ liệu mẫu phải ẩn danh. Ngoại lệ duy nhất: thông tin liên hệ thật của người thử nghiệm (SĐT phụ huynh thử) để trong `data/private/`. Thư mục này đã nằm trong `.gitignore`, không chia sẻ và không chép sang chỗ khác.
- Cấu trúc dữ liệu (các tab Google Sheets, quyền theo vai trò) được định nghĩa trong [data/schema.md](data/schema.md). Đổi cấu trúc thì sửa file đó trước.
- Không lưu Bot Token, API key hay thông tin đăng nhập Google vào file trong repo. Dùng biến môi trường hoặc file `.env` nằm ngoài phạm vi chia sẻ.
- Gói AI miễn phí có thể cho nhà cung cấp dùng dữ liệu, nên chỉ dùng với dữ liệu ẩn danh cho tới khi có ý kiến của Ban Giám hiệu.
- Bot **không được tự bịa số liệu**: chỉ đọc số từ Sheets. Mọi thao tác ghi đều phải được GVCN xác nhận. Phụ huynh chỉ thấy dữ liệu của con mình. Phân quyền phải được kiểm thử trước mỗi lần mở cho người dùng mới.
- Minh chứng nộp BTC phải là số liệu thật đo được, không ước đoán rồi trình bày như số đo.

## Cách làm việc

- Ưu tiên những gì kịp hạn 2/11. Tính năng ngoài 3 tính năng chính thì ghi vào STATUS.md mục "Để sau", không tự làm.
- Thay đổi phạm vi hoặc kiến trúc (vd. đổi cách nhập điểm, đổi nền tảng) phải được nhóm đồng ý. Đề xuất kèm lý do theo rubric, rồi ghi quyết định vào STATUS.md.
- Khi tài liệu trong `zalo-doc/` có thể đã cũ (Zalo Bot đang ở giai đoạn thử nghiệm), kiểm tra lại với nguồn gốc ghi ở đầu mỗi file.
