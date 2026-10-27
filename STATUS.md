# STATUS – Trợ lý GVCN trên Zalo

Cập nhật: 2026-10-27

## Đang ở đâu

Giai đoạn 1 (27/10 – 2/11): dựng bot và thí điểm. **Còn 6 ngày tới hạn nộp 2/11.**

Đã có: kế hoạch ([plan/](plan/)), đề bài ([info-request/](info-request/)), bản lưu doc Zalo Bot + OpenClaw ([zalo-doc/](zalo-doc/)). Chưa có code hay dữ liệu mẫu.

**Bot test (27/10):** "Bot Củ Cải", `bot.RNHMCTeM`, id `4555421124073969564`, loại BASIC, `can_join_groups: true`. Token nằm trong `.env` (biến `ZALO_BOT_TOKEN`, đã thêm vào `.gitignore`). `getMe` trả về OK; chưa đặt webhook, nên dùng được ngay chế độ polling. Quản lý bot tại https://zalo.me/s/botcreator/

**Thử nhắn tin 2 chiều (27/10, [bot/scripts/echo-test.js](bot/scripts/echo-test.js)): THÀNH CÔNG.** 2 tài khoản nhắn 4 tin, bot trả lời đủ, mỗi lần dưới 0,5 giây. Ghi nhận thực tế:
- Tin gửi lúc **không có chương trình nào đang polling sẽ bị mất**, Zalo không giữ lại. Khi chạy thật, bot phải chạy liên tục 24/7 hoặc chuyển sang webhook.
- Payload của tin chữ: `event_name: message.text.received`, `message.message_type: CHAT_TEXT`, `message.chat.{id, chat_type: PRIVATE}`, `message.from.{id, display_name, is_bot}`, `message.text`. Trong chat 1-1 thì `chat.id` trùng `from.id`.
- **User ID là chuỗi hex 20 ký tự** (vd. dạng `3bfd…5619`), **không phải số**. Doc OpenClaw ghi `allowFrom` "chỉ nhận ID dạng số". Cần thử xem OpenClaw có chấp nhận ID dạng hex không.
- `display_name` là tên Zalo do người dùng tự đặt, không dùng được để xác định đó là phụ huynh của học sinh nào.
- **File .xlsx → `message.unsupported.received`** (đã xác nhận): payload chỉ có chat, from, message_id, date. Không có tên file, không có link tải.
- **Ảnh**: lần đầu về dạng `unsupported` (nhiều khả năng ảnh bị gửi dưới dạng file). Lần thử lại thì **nhận được**: `event_name: message.image.received`, `message_type: CHAT_PHOTO`, có `photo_url` (link tải ảnh trên zdn.vn) và `caption`. Kết luận: bot nhận được ảnh gửi theo cách thông thường. Nếu GVCN gửi ảnh mà bot báo `unsupported` thì cần hướng dẫn gửi lại dưới dạng ảnh.

## Lộ trình 7 ngày (theo kế hoạch)

- [ ] T3 27/10: chốt 5 việc trong "Cần chốt"; xin ý kiến BGH về dữ liệu điểm; bắt đầu đo số liệu "trước"
- [ ] T4 28/10: tạo Zalo Bot, cài OpenClaw; làm mẫu Google Sheets và file Excel mẫu (ẩn danh)
- [ ] T5 29/10: nhập điểm + cập nhật qua chat; thử 30 câu hỏi kiểu phụ huynh
- [ ] T6 30/10: phân quyền theo học sinh; mời 5–10 phụ huynh dùng thử
- [ ] T7–CN 31/10–1/11: demo báo cáo họp phụ huynh; thu phản hồi; quay video 3 phút; viết tóm tắt 250 từ
- [ ] T2 2/11: nộp vào Drive của BTC

## Cần chốt (từ kế hoạch)

- [ ] Tên chính thức của sản phẩm
- [ ] Lớp thí điểm và 5–10 phụ huynh tham gia
- [ ] Trường quản lý điểm trên hệ thống nào, có xuất Excel được không
- [ ] Nơi chạy bot, mô hình AI dùng, ai chi trả
- [ ] Phân công giữa Vân và Thủy

## Vấn đề mở (phát hiện khi đọc doc, 27/10)

1. **Nhập điểm bằng file Excel qua Zalo không làm được** (đã thử thật 27/10: file về dạng `unsupported`). **→ Đã chốt (a), xem mục Quyết định.** Các phương án:
   - (a) GVCN dán hoặc import Excel thẳng vào Google Sheets, bot chỉ đọc Sheets.
   - (b) GVCN nhắn link Sheets/Drive, bot tự đọc và chuyển dữ liệu.
   - (c) GVCN chụp ảnh bảng điểm, AI đọc ảnh. Rủi ro đọc sai số cao, bắt buộc phải xác nhận lại.
   - Kế hoạch và video phải sửa câu "gửi file Excel cho bot" cho đúng với phương án được chọn.
2. **Kế hoạch ghi "OpenClaw" nhưng cần ghi rõ là kênh `zalo` có sẵn + Bot Token**, không phải My ClawBot (chỉ trò chuyện với chủ sở hữu).
3. ~~Phân quyền phụ huynh~~ và 4. ~~Đọc/ghi Sheets~~: đã có hướng, xem "Kiến trúc dự kiến" bên dưới. Chi tiết và nguồn ở [research/openclaw-zalo-sheets.md](research/openclaw-zalo-sheets.md). Các giả định còn phải thử trên bản cài thật được liệt kê trong mục "Ngày 28/10".

## Kiến trúc đã dựng (27/10)

Zalo Bot (polling) → OpenClaw gateway → agent `main` (Gemini `gemini-3.5-flash`, dự phòng `2.5-flash`) → plugin [bot/plugin-tro-ly-gvcn](bot/plugin-tro-ly-gvcn/) (5 tool) → Apps Script web app [bot/apps-script/Code.gs](bot/apps-script/Code.gs) → Google Sheets ([data/schema.md](data/schema.md)).

- **Phân quyền ép bằng code ở Apps Script**, không dựa vào lời nhắc AI. Plugin lấy `ctx.requesterSenderId` (OpenClaw cấp, AI không sửa được) gửi kèm `SECRET`. Apps Script xác định vai trò `gvcn` / `phu_huynh` / `chua_lien_ket` theo Zalo ID rồi chỉ trả dữ liệu đúng quyền. Tool trả `null` nếu không có sender ID hoặc tin không đến từ kênh Zalo (đã test).
- **Một agent thay vì 2:** vì quyền đã ép theo người gửi ở Apps Script, không cần binding theo peer. GVCN cũng được nhận diện tự động: nhắn SĐT trùng `CauHinh.gvcn_sdt` thì Zalo ID được ghi vào `gvcn_zalo_id`, không phải sửa cấu hình OpenClaw.
- **Liên kết phụ huynh bằng SĐT:** GVCN điền sẵn tab `PhuHuynh`. Sai 3 lần thì khoá. SĐT đã gắn Zalo khác thì từ chối và báo GVCN. Liên kết thành công thì báo GVCN. Xác minh thêm ngày sinh của con là tuỳ chọn (`CauHinh.xac_minh_ngay_sinh`, mặc định `khong`).
- **Ghi 2 bước:** `gv_ghi` trả bản xem trước kèm mã (lưu cache 10 phút); xác nhận phải ở **lượt chat sau** (plugin chặn xác nhận trong cùng lượt; *cần kiểm khi chạy thật*: factory có được gọi lại mỗi lượt không).
- **Khoá quyền agent:** `tools.profile: minimal` + `agents.entries.main.tools.allow` = 5 tool của plugin. `session.dmScope: per-channel-peer`. `heartbeat.every: 0m`. Zalo `dmPolicy: open`, `groupPolicy: disabled`. Token lấy từ biến môi trường (SecretRef), không nằm trong `openclaw.json`. Cấu hình: [bot/openclaw-config.batch.json](bot/openclaw-config.batch.json).
- Workspace của bot: [bot/workspace/](bot/workspace/) (`AGENTS.md` = quy tắc hành xử theo vai trò; đã xoá `BOOTSTRAP.md`).
- Chạy bot: `.\bot\chay-bot.ps1` (nạp `.env` rồi chạy `openclaw gateway`).

## Cài đặt (27/10)

- [x] Node 24.22.1, OpenClaw **2026.10.7** (`npm i -g ... --allow-scripts=@google/genai,esbuild,koffi,protobufjs,openclaw`). Plugin chính thức `clawhub:@openclaw/zalo@2026.10.7`. Không dùng plugin Zalo cộng đồng.
- [x] `openclaw onboard --non-interactive` với Gemini. Khoá Gemini dạng `AQ.…` đã thử gọi được. Model mặc định của onboard (`gemini-4-argon`) không dùng được với khoá này nên đã đổi.
- [x] Plugin cài bằng `openclaw plugins install --link --force --accept-capabilities ./bot/plugin-tro-ly-gvcn`. Không được để `node_modules` trỏ ra ngoài thư mục plugin (bị chặn bởi bước quét an toàn), nên đã bỏ typebox và viết schema JSON thuần.
- [x] File Excel 7 tab có dữ liệu demo: `data/private/HoSo-12B1-demo.xlsx` (có SĐT thật).
- [x] `gvcn_ten` = Vân Thuỷ, `gvcn_sdt` điền trong `data/private/CauHinh.csv` (đã đưa vào xlsx). **Vướng:** SĐT GVCN trùng SĐT anh Vũ (PH em Củ Cải), một Zalo không giữ được 2 vai trò. Chờ nhóm chọn cách xử lý.
- [x] Apps Script đơn giản hoá: khoá SECRET tự lưu ở lần gọi đầu (không phải nhập tay); thông báo cho GVCN do plugin gửi (Apps Script không giữ token Zalo).
- [ ] **Đang chờ người dùng:** tải xlsx lên Drive và lưu thành Google Trang tính (connector Drive hết phiên), cài Apps Script theo [HUONG-DAN.md](bot/apps-script/HUONG-DAN.md), điền `GVCN_APPS_SCRIPT_URL` vào `.env`.
- [x] **Sửa lỗi 27/10:** bot báo "OpenClaw couldn't finish" vì `tools.profile: minimal` lọc trước nên `tools.allow` không còn tool nào. Đúng là: `agents.entries.main.tools = {profile:"minimal", alsoAllow:[5 tool], deny:["gateway","session_status"]}`. OpenClaw dùng "code-mode": tool được gọi qua `exec`/`wait` (log: `cataloged 6 tools behind exec/wait`). Đã kiểm: factory nhận `messageChannel=zalo`, `requesterSenderId` 20 ký tự.
- [x] Gateway chạy được. Tài khoản Bách Vũ liên kết thành phụ huynh em Lẩu.
- [x] Thêm HS06 Trái Đất + chị Hiền (084****286), HS07 Mặt Trăng + chị Thuỷ (094****786; Tiếng Anh đang giảm): dữ liệu ở `data/demo` (sinh nối tiếp, không đổi mã cũ) và `data/private/them-HS06-HS07/*.tsv` để dán vào Sheets.
- [x] 27/10: đổi GVCN sang cô Vân (036****025), nên Dinosaur không còn PH thử, anh Vũ (096****808) thành PH Củ Cải. **Đổi GVCN phải sửa `gvcn_sdt` VÀ xoá `gvcn_zalo_id`.** Bot giờ gọi `vai_tro_cua_toi` ở mọi tin nhắn (đổi vai trò trên Sheets có hiệu lực ngay). Kịch bản thử: [bot/KICH-BAN-THU.md](bot/KICH-BAN-THU.md).
- [x] 27/10 14:55: **hết hạn mức gói miễn phí `gemini-3.5-flash` sau khoảng 20 lần gọi** (mỗi tin nhắn 3–4 lần gọi). Lỗi 429 tiếng Anh lộ ra cho phụ huynh. Đọc lỗi 429: khoá thuộc dự án **FreeTier, 20 lần gọi/ngày/model**. Gói Google AI Pro không tăng hạn mức API. `3.5-flash` dùng chung hạn mức với `3.6-flash`. Hạn mức làm mới khoảng 15h (giờ VN). Tạm dùng `gemini-3.1-flash-lite`. Khoá này gọi `2.5-flash`/`2.5-flash-lite` bị 404. Bỏ Markdown vì Zalo hiện nguyên `**`. **Cần quyết:** chuyển sang gói trả phí (bật billing Gemini hoặc Claude API) trước khi mời phụ huynh thật (30/10).
- [x] 27/10: tìm model online miễn phí ([research/free-llm-providers.md](research/free-llm-providers.md)): **Mistral free (Experiment)** `mistral-large-latest` là lựa chọn 1, NVIDIA NIM (`kimi-k2.6`) là 2. Groq/OpenRouter-free/GitHub Models bị loại. Người dùng không muốn chạy model offline trên máy. Đã cài `clawhub:@openclaw/mistral-provider@2026.10.7`. Chờ người dùng điền `MISTRAL_API_KEY` (và `NVIDIA_API_KEY` để dự phòng) vào `.env`.
- [x] 27/10: Mistral free không cho dùng API, NVIDIA không gửi mã xác minh SĐT. Đề xuất: (1) Gemini + 300 USD dùng thử Google Cloud để lên Tier 1, (2) Cerebras free. **Đã giảm số lần gọi model:** `vai_tro_cua_toi` trả kèm hồ sơ con cho phụ huynh, nên mỗi câu hỏi thường chỉ còn 2 lần gọi.
- [x] 27/10: Gemini Cloud trial và Cerebras đều đòi thẻ, người dùng không có. Đo được mỗi lần gọi model tốn khoảng 8–11 nghìn token, nên Groq free (khoảng 200 nghìn token/ngày) không đủ. **Hướng miễn phí còn lại:** OpenRouter free (đăng nhập Google, không cần thẻ, 50 lần gọi/ngày) kết hợp các model Gemini free (20 lần gọi/ngày/model), tổng khoảng 45 tin nhắn/ngày: đủ để nhóm thử, KHÔNG đủ thí điểm với phụ huynh. **Cần quyết ngân sách nhỏ** cho tuần thí điểm (vd. nạp 10 USD OpenRouter một lần, mở 1.000 lần gọi/ngày cho model free).
- [x] 27/10 15:50: **chuyển sang Cerebras** (người dùng gắn thẻ, được tặng 5 USD). Model chính `cerebras/gpt-oss-120b`: hạn mức đúng bằng gói free (5 lần gọi/phút, 30 nghìn token/phút, 1 triệu token/ngày), nhiều khả năng **không trừ 5 USD**, cần kiểm lại trên trang billing. Dự phòng `cerebras/qwen-3.8-27b` (trừ credit, hạn mức cao), rồi `gemini-3.1-flash-lite`. Giá công khai (USD/1 triệu token, vào/ra): gpt-oss 0,35/0,75; qwen-3.8 0,99/1,49. Mỗi tin khoảng 20 nghìn token đầu vào, tức khoảng 0,007 USD (gpt-oss) hoặc 0,02 USD (qwen). **Cách cấu hình:** `openclaw onboard --non-interactive ... --auth-choice cerebras-api-key` (chỉ để nạp khoá), rồi `openclaw models set cerebras/gpt-oss-120b` + `openclaw models fallbacks add …`. `config set` không nhận model tự phát hiện, nên model đã bỏ khỏi file batch. Gateway chạy với `.env` đã nạp. Dừng gateway: `openclaw gateway stop --force`.
- [x] 27/10 16:00: bot "im lặng" vì phiên chat dài (38 tin) nên một lần gọi vượt **30 nghìn token/phút** của gpt-oss-120b; OpenClaw chờ 60 giây rồi thử lại (tối đa 10 lần, không cấu hình được) rồi mới chuyển dự phòng. Sửa: `session.resetByType.direct = idle 30 phút`, lưu trữ 3 phiên test (`openclaw sessions archive`). Nếu vẫn chậm khi nhiều người nhắn cùng lúc, cân nhắc đổi model chính sang `qwen-3.8-27b` (150 nghìn token/phút, có trừ credit).
- [x] 27/10 16:04: gpt-oss-120b free vẫn kẹt (lượt cũ thử lại 4/9, giữ hàng chờ của người dùng; trải nghiệm quá tệ). **Đổi model chính sang `cerebras/qwen-3.8-27b`** (trừ credit, khoảng 0,02 USD/tin), dự phòng gpt-oss-120b rồi gemini-3.1-flash-lite. Đã khởi động lại gateway.
- [x] 27/10 16:35: qwen chạy được (khai báo tay `models.providers.cerebras.models`), mỗi lần gọi khoảng 1,5–2 giây, nhưng người dùng thấy **khoảng 0,1 USD/lượt hỏi**. Mỗi lần gọi gửi khoảng 13 nghìn token, cộng thêm lần gọi phụ do "tool-search". Đã giảm: `tools.toolSearch: false`, `thinkingDefault: low`, `plugins.slots.memory: none` (bỏ bộ nhớ dài hạn, cũng tránh nhớ lẫn hội thoại giữa các phụ huynh). Log gateway: `bot/logs/gateway.log`. Đang nghiên cứu nguồn credit cho giáo dục/FPT: `research/api-credit-programs.md`.
- [x] 27/10: nghiên cứu nguồn API ([research/api-credit-programs.md](research/api-credit-programs.md)): không có chương trình giáo dục nào cấp credit API trong 1–3 ngày. Khả thi nhất: (1) **Z.ai API chính thức**, `glm-4.7-flash` giá 0 (có thể giới hạn 1 request đồng thời), `glm-5.3-flash` khoảng 0,01 USD/tin; (2) DeepSeek `deepseek-flash`, phải nạp trước; (3) FPT AI Marketplace/Token Factory, hợp "bản sắc FPT": hỏi BGH/IT xin voucher. WorkBuddy/ZCode là app lập trình, không làm nền cho bot được. Đã cài `clawhub:@openclaw/zai-provider@2026.10.7`, chờ `ZAI_API_KEY`.
- [x] 27/10 16:50: **chuyển sang Z.ai `glm-4.5-flash` (MIỄN PHÍ)**. Đo trực tiếp: 3–5 giây/lượt có gọi tool, đúng số liệu, ổn định 3/3 lần; thỉnh thoảng vẫn dùng `**`. `glm-4.7-flash` free bị quá tải (lỗi 1305, có lần 139 giây). `glm-5.3-flash` cần nạp tiền. Khai báo tay `models.providers.zai.models` (glm-4.5-flash không có trong catalog); auth bằng `onboard --auth-choice zai-global`. Dự phòng: cerebras qwen-3.8-27b (trả phí), gemini-3.1-flash-lite. **Rủi ro:** glm-4.5-flash đã có thông báo sắp ngừng, cần phương án dài hạn (FPT AI Marketplace / nạp tiền nhỏ).
- [ ] Chạy gateway, thử: liên kết 2 phụ huynh, tra cứu, Bánh Mì (không có PH), GVCN ghi điểm 2 bước, báo cáo họp PH, `openclaw doctor`.

## Quyết định đã chốt

- **27/10 – Nhập điểm theo phương án (a) cho bản demo:** GVCN mở hoặc dán file Excel thẳng vào Google Sheets, bot chỉ đọc từ Sheets. Cập nhật lẻ (vd. "Lan được 9 điểm miệng") vẫn làm qua chat và có bước xác nhận. Lý do: Zalo Bot không nhận file (đã thử); (a) ít phải lập trình nhất và kịp hạn 2/11. Phương án (b) (nhắn link Sheets) và (c) (chụp ảnh bảng điểm, bot nhận được ảnh) để sau 2/11. **Việc kéo theo:** đã sửa `plan/*.md` (27/10). Còn phải sửa: sơ đồ trong file .docx (ô GVCN ghi "Gửi Excel"), kịch bản video và bản tóm tắt.

- **27/10 – Đăng ký phụ huynh: GVCN duyệt từng tài khoản (đợt thí điểm).** Phụ huynh nhắn bot, GVCN xác nhận tài khoản đó là phụ huynh của em nào, rồi lưu cặp Zalo user ID ↔ mã học sinh trong Sheets. Chưa được duyệt thì bot không trả dữ liệu nào. Lý do: chỉ 5–10 phụ huynh, an toàn hơn phát mã, và đây là câu BGH và giám khảo sẽ hỏi đầu tiên. Cách nhắn mã học sinh để sau, khi mở rộng. Cách làm (27/10, sau góp ý): GVCN điền sẵn danh sách SĐT phụ huynh, phụ huynh tự liên kết bằng cách nhắn SĐT. Không có hàng chờ duyệt (xem "Kiến trúc dự kiến").

- **27/10 – Bot truy cập Sheets qua Apps Script web app** (không dùng service account). Lý do: trường khác chỉ cần sao chép file Sheets mẫu và bấm Triển khai, không phải vào Google Cloud, nên cộng điểm tiêu chí nhân rộng (20%).

- **27/10 – `sample-input/` (file xuất từ hệ thống trường, tuần 19–25/10, lớp 11B2) chứa DỮ LIỆU THẬT** (họ tên, mã HS, vắng, nhận xét GV, email GV). Đã đưa vào `.gitignore`, không đưa lên GitHub. File cho biết **định dạng xuất thật** của trường: tab "Tiết học" (lớp, môn, GV, ngày, tiết, điểm danh, nhận xét lớp, syllabus) và tab "Nhận xét học sinh" (mã HS, họ tên, nhận xét gộp theo tiết). Dùng làm mẫu khi viết bộ nhập dữ liệu thật, chỉ xem trên máy.

## Để sau (ngoài phạm vi 2/11)

Đăng ký phụ huynh bằng mã học sinh (khi mở rộng ra nhiều lớp).

Nhập điểm qua link Sheets (b) hoặc ảnh chụp bảng điểm (c).
Cảnh báo sớm khi điểm tụt, nề nếp, ngoại khoá, nhắc lịch, nhóm chat lớp, máy chủ riêng của trường.
