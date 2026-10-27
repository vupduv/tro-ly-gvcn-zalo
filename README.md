# Trợ lý GVCN trên Zalo

AI agent trên Zalo giúp **giáo viên chủ nhiệm (GVCN)** cập nhật hồ sơ học sinh bằng tin nhắn, và giúp **phụ huynh** tra cứu tình hình học tập của đúng con mình, mọi lúc. Dữ liệu nằm trong một file Google Sheets của lớp.

Đây là bài dự thi **AI Educamp 2026** (THPT FPT Hà Nội, chủ đề "Trường học số"). Kế hoạch dự thi: [plan/](plan/). Thể lệ và rubric: [info-request/](info-request/).

> **Trạng thái (27/10/2026): bring-up xong, đang thử nghiệm với dữ liệu giả.** Bot chạy được trên Zalo, phân quyền theo người gửi đã hoạt động. Nhật ký chi tiết, quyết định đã chốt và việc còn dở nằm trong [STATUS.md](STATUS.md). **Người tiếp nhận nên đọc STATUS.md trước.**

## Bot làm được gì

| Người dùng | Chức năng |
| --- | --- |
| Người lạ | Nhắn số điện thoại để liên kết tài khoản Zalo với hồ sơ học sinh (khớp với danh sách GVCN lập sẵn). Chưa liên kết thì không xem được gì |
| Phụ huynh | Hỏi bằng lời thường ("Hôm nay con có gì không?", "Điểm Toán của con thế nào?", "Sắp tới có sự kiện gì?"). Chỉ thấy dữ liệu của con mình |
| GVCN | Ghi điểm, hoạt động, sự kiện bằng một câu chat, **bắt buộc xác nhận ở tin nhắn sau** mới ghi. Xem tình hình lớp, lập báo cáo họp phụ huynh |

## Kiến trúc

```
Phụ huynh / GVCN (Zalo)
        │
        ▼
Zalo Bot Platform (Bot Creator, chế độ polling)
        │
        ▼
OpenClaw gateway (chạy trên máy Windows)
  ├─ kênh zalo (@openclaw/zalo)
  ├─ agent "main": model AI + quy tắc trong bot/workspace/AGENTS.md
  └─ plugin tro-ly-gvcn: 5 tool, mỗi tool lấy Zalo ID người gửi do OpenClaw cấp
        │  HTTPS + khoá bí mật
        ▼
Apps Script web app (gắn trong file Google Sheets)
  └─ KIỂM TRA QUYỀN theo Zalo ID, đọc/ghi các tab
        │
        ▼
Google Sheets của lớp (7 tab, xem data/schema.md)
```

Nguyên tắc bảo mật cốt lõi: **quyền được ép bằng code ở Apps Script**, không dựa vào lời dặn AI. Plugin gửi `zalo_id` lấy từ `ctx.requesterSenderId`, giá trị do OpenClaw cấp mà AI không sửa được. Apps Script quyết định người đó là `gvcn`, `phu_huynh` hay `chua_lien_ket` rồi chỉ trả dữ liệu đúng quyền. Agent bị khoá chỉ dùng được 5 tool của plugin: không chạy lệnh, không đọc file, không lên web.

## Thư mục

| Đường dẫn | Nội dung |
| --- | --- |
| [bot/plugin-tro-ly-gvcn/](bot/plugin-tro-ly-gvcn/) | Plugin OpenClaw: 5 tool `vai_tro_cua_toi`, `lien_ket_phu_huynh`, `tra_cuu_con`, `gv_xem_lop`, `gv_ghi` |
| [bot/apps-script/](bot/apps-script/) | `Code.gs` (cổng dữ liệu + phân quyền) và hướng dẫn cài vào Google Sheets |
| [bot/workspace/](bot/workspace/) | Workspace của agent OpenClaw: `AGENTS.md` (quy tắc hành xử theo vai trò), `SOUL.md`, `IDENTITY.md` |
| [bot/openclaw-config.batch.json](bot/openclaw-config.batch.json) | Cấu hình OpenClaw (bảo mật tool, phiên chat, kênh Zalo), áp bằng `openclaw config set --batch-file` |
| [bot/chay-bot.ps1](bot/chay-bot.ps1) | Script chạy bot: nạp `.env` rồi chạy `openclaw gateway` |
| [bot/KICH-BAN-THU.md](bot/KICH-BAN-THU.md) | Kịch bản thử (liên kết, tra cứu, vượt quyền, GVCN ghi điểm, báo cáo) |
| [bot/scripts/](bot/scripts/) | `gen-demo-data.js` (sinh dữ liệu giả), `echo-test.js` (bot thử Zalo tối giản, không AI) |
| [data/schema.md](data/schema.md) | Cấu trúc 7 tab Google Sheets và bảng quyền theo vai trò |
| [data/demo/](data/demo/) | Dữ liệu giả lớp 12B1 (7 học sinh) dạng CSV |
| [zalo-doc/](zalo-doc/) | Bản lưu tài liệu Zalo Bot Platform, kênh Zalo của OpenClaw và SDK. Đọc `zalo-doc/README.md` trước |
| [research/](research/) | Ghi chú nghiên cứu: OpenClaw + Sheets, model AI miễn phí, nguồn API |
| [STATUS.md](STATUS.md) | File trạng thái dự án: lịch sử, quyết định, việc còn dở |
| [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md), [.claude/agents/](.claude/agents/) | Hướng dẫn cho AI agent (Claude Code) làm việc trong repo này |

Không có trong repo (đã `.gitignore`): `.env` (khoá), `data/private/` (SĐT thật của phụ huynh thử nghiệm), `bot/logs/` (log có Zalo ID).

## Cài đặt từ đầu

Đã chạy được trên Windows 11 native (không cần WSL2, không cần Docker). Thời gian khoảng 30–45 phút.

### 1. Phần mềm

- Node.js **≥ 24.22.1** (OpenClaw 2026.10.7 yêu cầu): `winget upgrade --id OpenJS.NodeJS.LTS`
- Git for Windows
- OpenClaw, ghim phiên bản. Phải có `--allow-scripts` vì npm 11 chặn script cài đặt (trong đó có bước cài plugin đi kèm):

```bash
npm install -g openclaw@2026.10.7 --allow-scripts=@google/genai,esbuild,koffi,protobufjs,openclaw
openclaw plugins install "clawhub:@openclaw/zalo@2026.10.7"          # bản này không đóng gói sẵn plugin Zalo
openclaw plugins install "clawhub:@openclaw/zai-provider@2026.10.7"   # model Z.ai (GLM)
openclaw plugins install "clawhub:@openclaw/cerebras-provider@2026.10.7"  # tuỳ chọn, model dự phòng
```

Chỉ dùng plugin Zalo **chính thức** (`@openclaw/zalo`). Các plugin cộng đồng (zaloclaw, zalo-connect...) dùng tài khoản Zalo cá nhân qua đường không chính thức.

### 2. Tạo Zalo Bot

Trong app Zalo: tìm OA **Zalo Bot Manager**, chọn **Tạo bot**, đặt tên bắt đầu bằng "Bot". Token được gửi về qua tin nhắn. Xem [zalo-doc/bot-platform/create-bot.md](zalo-doc/bot-platform/create-bot.md).

### 3. Google Sheets + Apps Script

1. Tạo file Sheets với 7 tab theo [data/schema.md](data/schema.md). Có thể dựng nhanh từ dữ liệu giả trong `data/demo/`.
2. Điền tab `CauHinh`: `lop`, `nam_hoc`, `hoc_ky_hien_tai`, `gvcn_ten`, `gvcn_sdt`. Điền tab `PhuHuynh` (SĐT phụ huynh, để trống `zalo_id`).
3. Cài Apps Script và triển khai web app theo [bot/apps-script/HUONG-DAN.md](bot/apps-script/HUONG-DAN.md).
4. **Đặt chia sẻ file Sheets là "Bị hạn chế".** Nếu ai có link cũng sửa được thì họ có thể tự thêm mình vào danh sách phụ huynh.

### 4. File `.env`

```bash
cp .env.example .env    # rồi điền các giá trị
```

### 5. Cấu hình OpenClaw

```bash
# (a) Onboard lần đầu: workspace trỏ vào repo, gateway chỉ nghe localhost, nạp khoá model
openclaw onboard --non-interactive --accept-risk --mode local \
  --auth-choice zai-global --zai-api-key "$ZAI_API_KEY" \
  --workspace "<đường-dẫn-repo>/bot/workspace" --gateway-bind loopback \
  --skip-channels --skip-daemon --skip-skills --skip-search --skip-ui --skip-hooks
#     Thêm khoá Cerebras/Gemini: chạy lại với --auth-choice cerebras-api-key --cerebras-api-key ...

# (b) Plugin của dự án (phải --force vì là nguồn local, --accept-capabilities để đồng ý quyền)
openclaw plugins install --link --force --accept-capabilities ./bot/plugin-tro-ly-gvcn

# (c) Cấu hình bảo mật, phiên chat, kênh Zalo
openclaw config set --batch-file ./bot/openclaw-config.batch.json --replace

# (d) Model: glm-4.5-flash không có trong catalog nên phải khai báo tay rồi mới set được
openclaw config set models.providers.zai.models '[{"id":"glm-4.5-flash","name":"GLM 4.5 Flash","contextWindow":131072,"reasoning":true,"cost":{"input":0,"output":0,"cacheRead":0,"cacheWrite":0}}]' --strict-json --replace
openclaw models set zai/glm-4.5-flash
openclaw models fallbacks add cerebras/qwen-3.8-27b        # tuỳ chọn
```

Chạy các lệnh trên trong shell **đã nạp `.env`** (`set -a; . ./.env; set +a` trong bash), vì token Zalo được tham chiếu từ biến môi trường.

Sau đó xoá `bot/workspace/BOOTSTRAP.md` nếu OpenClaw tạo ra. File này chứa "nghi thức làm quen" (hỏi tên, chọn emoji), không dùng cho bot phụ huynh.

### 6. Chạy

```powershell
.\bot\chay-bot.ps1        # Ctrl+C để dừng
```

Kiểm tra: `openclaw channels status --probe` phải thấy `Zalo default ... running, connected`. Nhắn bot trên Zalo, rồi làm theo [bot/KICH-BAN-THU.md](bot/KICH-BAN-THU.md).

## Vận hành

| Việc | Cách làm |
| --- | --- |
| Xem log | `bot/logs/gateway.log` (nếu chạy với chuyển hướng log) hoặc `openclaw logs --follow` |
| Dừng hẳn gateway | `openclaw gateway stop --force`. Tắt cửa sổ shell không đủ, tiến trình node vẫn chạy |
| Sửa plugin | Sửa `bot/plugin-tro-ly-gvcn/index.js`, rồi `openclaw plugins reload tro-ly-gvcn` |
| Sửa quy tắc bot | Sửa `bot/workspace/AGENTS.md`, có hiệu lực từ tin nhắn sau |
| Sửa Apps Script | Dán mã mới, rồi **Triển khai → Quản lý → Phiên bản mới**. URL giữ nguyên |
| Đổi GVCN | Tab `CauHinh`: sửa `gvcn_sdt` **và xoá trống** `gvcn_zalo_id`. GVCN mới nhắn SĐT cho bot |
| Thêm phụ huynh | Thêm dòng vào tab `PhuHuynh` (SĐT dạng chữ, giữ số 0 đầu). Phụ huynh nhắn SĐT cho bot |
| Gỡ liên kết sai | Tab `PhuHuynh`: xoá `zalo_id`, đặt `trang_thai` = `cho_lien_ket` (hoặc `khoa` để chặn) |
| Xoá lịch sử chat bị kẹt | `openclaw sessions --json` lấy key, rồi `openclaw sessions delete <key> --yes`. `archive` **không** làm phiên ngắn lại |
| Số liệu minh chứng | Tab `NhatKy`: mọi lượt liên kết, tra cứu, ghi. `gv_xem_lop` trả sẵn thống kê |

## Những điều đã biết (đọc trước khi sửa)

**Zalo Bot Platform**
- Bot **không nhận được file** (Excel về dạng `message.unsupported.received`). Vì vậy GVCN dán điểm cả lớp thẳng vào Sheets. Ảnh gửi bình thường thì nhận được (`message.image.received`).
- Tin nhắn gửi lúc bot không chạy (polling) **bị mất**, Zalo không giữ lại. Muốn chạy 24/7 thì cần máy chủ và webhook.
- User ID là **chuỗi hex 20 ký tự**, không phải số. Bot API **không cung cấp SĐT** người nhắn, nên phụ huynh phải tự nhắn SĐT.
- Zalo hiển thị văn bản thuần: `**đậm**` hiện nguyên dấu sao.

**OpenClaw 2026.10.7**
- Tool cần biết người gửi phải đăng ký **dạng factory** `api.registerTool((ctx) => tool)`. `ctx.requesterSenderId` chỉ có trong factory, không có trong `execute`.
- Quyền tool: `profile: "minimal"` lọc **trước** `allow`. Vì vậy phải dùng `alsoAllow` cho tool của plugin. Đặt `allow` thì agent không còn tool nào và báo "No callable tools remain".
- `tools.toolSearch: false`: nếu để mặc định, tool bị giấu sau bước "tìm tool" và tốn thêm một lượt gọi model mỗi tin.
- Mỗi lượt gọi model gửi khoảng 10–13 nghìn token (lời nhắc hệ thống + tool + lịch sử). Vì vậy gói miễn phí tính theo token/phút (Groq, Cerebras gpt-oss 30k TPM) bị nghẽn. Khi vượt hạn mức, OpenClaw thử lại cùng model tối đa 10 lần (không cấu hình được) rồi mới chuyển sang dự phòng, nên người dùng phải chờ nhiều phút.
- Model không có trong catalog phải khai báo tay ở `models.providers.<id>.models`, nếu không runtime báo "Unknown model". `config set` không nhận model chỉ có từ discovery, nên dùng `openclaw models set`.
- Quét an toàn khi cài plugin chặn `node_modules` trỏ ra ngoài thư mục plugin. Plugin dự án vì vậy không dùng dependency ngoài (schema JSON viết tay thay cho typebox).

**Google Sheets / Apps Script**
- File dùng định dạng Việt Nam: dán `6.75` thì thành chữ (Apps Script vẫn đọc đúng). SĐT phải để dạng chữ để giữ số 0 đầu.
- Gọi web app bằng `curl -X POST -L` bị lỗi 411 sau khi Google chuyển hướng. `fetch` của Node thì không bị.

**Model AI** (chi tiết: [research/](research/), STATUS.md)
- Đang dùng **Z.ai `glm-4.5-flash` (miễn phí)**, 3–5 giây/lượt, gọi tool tốt. Z.ai đã thông báo model này **sắp ngừng**.
- Gemini free: chỉ 20 lần gọi/ngày/model. Gói Google AI Pro không tăng hạn mức API.
- Phương án dài hạn cần ngân sách nhỏ (FPT AI Marketplace, nạp vài USD Z.ai/DeepSeek/OpenRouter). Gói miễn phí có thể dùng dữ liệu để huấn luyện, nên **chỉ dùng dữ liệu giả** cho tới khi chuyển gói trả phí và có ý kiến của BGH.

## Việc tiếp theo (ưu tiên)

1. Chọn nguồn model ổn định cho tuần thí điểm với phụ huynh thật (xem STATUS.md, mục ngân sách).
2. Chạy hết [bot/KICH-BAN-THU.md](bot/KICH-BAN-THU.md), sửa câu trả lời sai. Lọc bỏ Markdown ở tầng plugin nếu model vẫn chèn `**`.
3. Lỗi model (429, quá tải) đang hiện nguyên văn tiếng Anh cho phụ huynh, cần thay bằng câu thân thiện.
4. Chạy 24/7: máy chủ (VPS / máy của trường) + webhook thay cho polling.
5. Mở rộng sau thi: nhập điểm qua link Sheets hoặc ảnh chụp, cảnh báo sớm khi điểm tụt, nhiều lớp.

## Đóng góp

Góp ý qua Issues / Pull Request. Khi sửa:
- Không commit khoá, SĐT, Zalo ID hay dữ liệu học sinh thật. Dữ liệu mẫu phải là dữ liệu giả.
- Mọi thay đổi về quyền phải nằm ở Apps Script (`Code.gs`) hoặc plugin, không chỉ ở lời dặn trong `AGENTS.md`.
- Cập nhật [STATUS.md](STATUS.md) khi chốt quyết định hoặc phát hiện điều mới.
