# OpenClaw + Zalo + Google Sheets: allowFrom hex, định danh người gửi, định tuyến, Sheets, cài Windows

Câu hỏi: 5 câu về kênh zalo của OpenClaw (ID hex, danh tính người gửi, bindings theo người gửi, đọc/ghi Sheets, cài trên Windows + model rẻ). Ngày nghiên cứu: 2026-10-27.

## Kết luận ngắn

1. **allowFrom/pairing nhận ID hex ở runtime.** Mã nguồn `extensions/zalo/src/group-access.ts`: `normalizeZaloAllowEntry` chỉ `trim`, bỏ tiền tố `zalo:`/`zl:`, `toLowerCase`. Nó không bắt buộc là số. Chỉ wizard `setup-allow-from.ts` có `/^\d+$/` nên sẽ từ chối ID hex. Cách vượt: sửa thẳng `openclaw.json` (hoặc `openclaw config set`), hoặc dùng pairing (ID người gửi do hệ thống ghi, không qua wizard). Câu "numeric" trong zalo.md là lời mô tả của wizard, không phải ràng buộc runtime (suy luận từ code, cần test thật). Lưu ý `.toLowerCase()`: nếu ID hex có chữ hoa thì vẫn khớp vì cả hai phía được normalize (suy luận).
2. **Danh tính người gửi do host cấp, không phải model tự khai.** `monitor.ts`: `senderId = from.id`, `senderName = from.display_name ?? from.name`; ngữ cảnh inbound có `sender: {id, name}` và `from: "zalo:<senderId>"`. Với plugin tool, `OpenClawPluginToolContext.requesterSenderId` được ghi chú trong mã nguồn là "Trusted sender id from inbound context (runtime-provided, not tool args)", kèm `senderIsOwner`, `messageChannel`, `agentId`, `sessionKey`. Session tách theo người: đặt `session.dmScope: "per-channel-peer"` (mặc định `main` gộp mọi DM vào một session).
3. **Có thể định tuyến theo người gửi sang agent khác.** `bindings[].match.peer = {kind:"direct", id:"<zalo id>"}` ưu tiên cao nhất, rồi fallback `{channel:"zalo", accountId:"*"}`. Mỗi agent có `tools.allow/deny` + `sandbox` riêng. Nhưng: binding theo từng ID phụ huynh không mở rộng được (mỗi phụ huynh một dòng). Cách đơn giản hơn: chỉ GVCN có binding riêng sang agent "gvcn" (ghi được); mọi người khác (phụ huynh) rơi vào agent mặc định "phuhuynh" (chỉ có tool `tra_cuu_con`). Mapping phụ huynh -> học sinh nằm trong tool, không nằm trong binding.
4. **Đề xuất: viết 1 plugin tool nhỏ (Node/TypeScript) gọi Google Sheets API bằng service account.** Tool lấy `requesterSenderId` từ tool context, tra bảng ánh xạ `zalo_id -> mã học sinh` (tab "PhuHuynh" trong Sheets), chỉ trả đúng dòng. Ép ở tầng code, không dựa vào prompt. Skill `gog` (clawhub) chỉ là hướng dẫn cho agent chạy CLI nên không ép được quyền theo người, và các trang mirror có dấu hiệu mã độc, tránh.
5. **Windows**: cài native PowerShell được (`iwr -useb https://openclaw.ai/install.ps1 | iex`), WSL2 là tùy chọn "tương thích Linux nhất", không bắt buộc. Cần Node >= 24.22.1 (kiểm tra lại máy). Model: Gemini API key (`openclaw onboard --auth-choice gemini-api-key`); gói free của Google dùng dữ liệu để cải thiện sản phẩm và có người đọc, không đưa dữ liệu học sinh thật vào.

## Chi tiết

### 1. ID hex trong allowFrom

- Doc zalo.md: "`channels.zalo.allowFrom` accepts numeric Zalo user IDs (no username lookup). `open` requires `"*"`."
- `monitor.ts`: nạp `allowFrom: normalizeStringEntries(account.config.allowFrom)` (chuỗi), identity `key: "zalo-user-id"`, `normalize: normalizeZaloAllowEntry`, `subject.stableId = senderId`. Không thấy ép kiểu số trong đoạn này.
- `group-access.ts`: `ZALO_ALLOW_FROM_PREFIX_RE = /^(zalo|zl):/i`; `normalizeZaloAllowEntry = value.trim().replace(RE,"").trim().toLowerCase()`.
- `setup-allow-from.ts` (wizard): `if (!/^\d+$/.test(raw))` trả lỗi `wizard.zalo.allowFromNumeric`. Chỉ áp dụng cho nhập qua wizard; các entry có sẵn không bị kiểm tra.
- `config-schema.ts`: `allowFrom: AllowFromListSchema` (định nghĩa nằm trong `openclaw/plugin-sdk/channel-config-schema`, chưa đọc được). Chưa xác nhận schema có regex hay không. CẦN THỬ: ghi một ID hex vào allowFrom rồi chạy `openclaw doctor` / khởi động gateway xem có báo lỗi validate.
- Pairing: bot gửi lại "Your Zalo user id: <senderId>" kèm mã; `openclaw pairing approve zalo <CODE>` ghi ID vào SQLite `~/.openclaw/state/openclaw.sqlite` (`channel_pairing_allow_entries`), không đi qua regex số. Pairing là đường chắc chắn nhất cho GVCN. Mã hết hạn sau 1 giờ, tối đa 3 yêu cầu chờ mỗi account.
- Phương án dự phòng nếu hex bị từ chối: `dmPolicy: "open"` + `allowFrom: ["*"]`, rồi kiểm soát ở tầng tool (tool phụ huynh chỉ trả dữ liệu theo mapping; người lạ không có mapping thì không nhận gì; agent mặc định không có tool ghi). Rủi ro: ai cũng tiêu token model của bạn; cần agent mặc định thật tối giản.

### 2. Danh tính người gửi và session

- Payload Zalo `from.id`, `from.display_name` -> `sender.id`, `sender.name` trong envelope; nhãn envelope là display name hoặc `user:<id>`.
- Tool context (nguồn: `src/plugins/tool-types.ts`, đọc qua bản tóm tắt của công cụ fetch, không phải nguyên văn): `requesterSenderId`, `senderIsOwner` là "trusted ... runtime-provided, not tool args". Docs chính thức tool-plugins.md KHÔNG liệt kê `requesterSenderId` (chỉ nêu `senderIsOwner`, `sandboxed`, `assertInvocationCurrent`...). Vì vậy phải kiểm tra trên bản OpenClaw thực tế cài ngày mai (`openclaw plugins inspect`, hoặc log ctx trong factory). Nếu thiếu `requesterSenderId` ở bản đó thì có phương án B: hook `before_tool_call` hoặc đọc `sessionKey` (dạng `agent:<id>:zalo:direct:<senderId>` khi `per-channel-peer`; dạng chính xác chưa kiểm chứng).
- Factory `contextVersion: 2` có `assertInvocationCurrent()`; nên gọi ngay trước khi trả dữ liệu/ghi.
- Session key: mặc định DM -> `agent:<agentId>:main` (gộp tất cả). `session.dmScope: "per-channel-peer"` để tách mỗi người một context (access-control doc). Nếu mỗi nhóm người có agent riêng, vẫn nên bật `per-channel-peer` vì nhiều phụ huynh cùng một agent "phuhuynh" sẽ dùng chung session nếu không bật, làm lộ lịch sử chat giữa các phụ huynh (rủi ro lớn).
- Doc bảo mật: OpenClaw "is not a hostile multi-tenant security boundary"; cô lập session là ranh giới ngữ cảnh chứ không phải ranh giới quản trị. Chấp nhận được cho demo vì dữ liệu nhạy cảm được ép ở tool.

### 3. Định tuyến + giới hạn tool

Ví dụ (cú pháp theo docs multi-agent hiện tại, cần đối chiếu `openclaw config schema` trên máy):

```json5
{
  session: { dmScope: "per-channel-peer" },
  agents: {
    ownership: "explicit",
    entries: {
      gvcn: {
        workspace: "~/.openclaw/workspace-gvcn",
        tools: { allow: ["sheets_doc", "sheets_ghi"], deny: ["exec","process","write","edit","apply_patch","browser","read"] },
      },
      phuhuynh: {
        workspace: "~/.openclaw/workspace-phuhuynh",
        sandbox: { mode: "all", scope: "agent", workspaceAccess: "none" },
        tools: { allow: ["tra_cuu_con"], deny: ["exec","process","write","edit","apply_patch","browser","read","gateway","cron","sessions_send","sessions_spawn"] },
      },
    },
  },
  bindings: [
    { agentId: "gvcn", match: { channel: "zalo", peer: { kind: "direct", id: "<HEX_ZALO_ID_GVCN>" } } },
    { agentId: "phuhuynh", match: { channel: "zalo", accountId: "*" } },
  ],
  channels: { zalo: { enabled: true, accounts: { default: { botToken: "...", dmPolicy: "pairing" } } } },
}
```

- Peer binding thắng channel-wide; đặt binding cụ thể trước. "A binding that omits accountId matches only the default account"; dùng `accountId:"*"` cho fallback.
- Chưa kiểm chứng: `peer.id` của kênh zalo có đúng là `from.id` hex (chat.id == from.id trong 1-1, theo test thật nên khả thi) và có bị normalize (lowercase, tiền tố) khi so khớp binding.
- Chưa kiểm chứng: cách allowlist tool do plugin đăng ký (tên tool trong `tools.allow`, có thể cần `plugins.allow`). Doc tool-permissions không nói. Thử thật.
- Sandbox `mode: all` cần Docker; trên Windows demo nên bỏ sandbox (`mode: "off"`) và dựa vào `tools.deny` + tool allowlist. `tools.allow` là danh sách chặt: chỉ tool đó được dùng (chưa kiểm chứng ngữ nghĩa allow+deny kết hợp; nguồn nói chưa rõ).
- Cách phòng thủ thêm: GVCN cũng đặt vào `commands.ownerAllowFrom`, vì `senderIsOwner` có thể dùng làm lớp kiểm tra thứ hai cho tool ghi.

### 4. Google Sheets: thiết kế khả thi trong 2-3 ngày

Phương án chọn: **plugin tool tự viết + service account** (Sheets API v4, thư viện `googleapis` hoặc `fetch` thuần với JWT).

- Bước 1 (30 phút): Google Cloud project, bật Sheets API, tạo service account, tải JSON key (để ngoài repo, `tokenFile` kiểu đường dẫn trong config plugin), chia sẻ Sheet cho email service account (quyền Editor).
- Bước 2: Sheet có các tab: `HocSinh` (mã HS, họ tên, lớp...), `Diem`, `NhanXet`/`ChuyenCan`, `PhuHuynh` (zalo_id hex, mã HS, quan hệ). Tab `PhuHuynh` do GVCN quản (GVCN gửi lệnh "liên kết" hoặc dán tay).
- Bước 3: plugin `trogiup-gvcn` đăng ký 3 tool bằng factory `contextVersion: 2`:
  - `tra_cuu_con` (agent phuhuynh): tham số tùy chọn `mon`/`ky`; không nhận mã HS. Trong `create(ctx)`: `ctx.requesterSenderId` -> tra `PhuHuynh` -> lấy danh sách mã HS (nhiều con -> trả cho từng con hoặc cho chọn theo số thứ tự); đọc `Diem` rồi lọc đúng mã HS; trả JSON/Text. Không có mapping -> trả "chưa liên kết, báo GVCN". Gọi `assertInvocationCurrent()` trước khi trả.
  - `sheets_doc` (agent gvcn): đọc bất kỳ tab theo bộ lọc (lớp, HS).
  - `sheets_ghi` (agent gvcn): ghi lẻ qua hai bước: lần gọi 1 trả bản xem trước + token xác nhận; lần 2 `xac_nhan: true` mới ghi. Kiểm `ctx.senderIsOwner === true` hoặc `requesterSenderId` thuộc danh sách GVCN trong config plugin. Ghi log mọi thay đổi vào tab `NhatKy`.
- Vì phụ huynh không bao giờ gọi được `sheets_doc`/`sheets_ghi` (tool không nằm trong allowlist của agent `phuhuynh` và còn bị tự chặn theo người gửi), nên dù prompt injection thành công cũng không đọc được dữ liệu con người khác.
- Khoảng 150-250 dòng TypeScript. Đóng gói: `openclaw.plugin.json` (`contracts.tools: [...]`), `package.json` với `openclaw.extensions: ["./dist/index.js"]`, `typebox` trong dependencies; cài `openclaw plugins install ./trogiup-gvcn`, `openclaw plugins reload <id>`.
- Phương án nhanh hơn nếu plugin SDK gây vướng: script CLI (`node tra-cuu.mjs`) gọi qua tool `exec`. KHÔNG khuyên: `exec` yêu cầu agent tự truyền sender ID (model có thể bịa), chỉ chấp nhận cho GVCN, không cho phụ huynh.
- MCP server cũng là lựa chọn (cấu hình `mcp.servers` có `command/args`), nhưng doc không nêu cách giới hạn MCP theo agent và MCP không nhận sender ID tin cậy, nên không dùng cho phụ huynh.
- Skill `gog` (clawhub, `clawhub install gog`): CLI Google Workspace (OAuth hoặc service account tùy mô tả, mâu thuẫn giữa các nguồn). Là chỉ dẫn cho agent chạy lệnh, không ép quyền theo người gửi, có nhiều trang mirror (getclawkit.com) yêu cầu tải binary/mật khẩu zip đáng ngờ. Chỉ dùng cho GVCN nếu muốn thử nhanh, đọc mã trước khi cài.
- Hạn mức Sheets API: 300 read/phút/project, đủ cho demo (kiến thức chung, chưa kiểm lại).

### 5. Cài đặt Windows và model

- Docs install: "Node 24.22.1 or later, or 26.12.1 or later. Node 26 recommended. The installer adds Node if missing." Máy đã có Node 24: kiểm `node -v` có >= 24.22.1.
- Native PowerShell: `iwr -useb https://openclaw.ai/install.ps1 | iex`, rồi `openclaw onboard --install-daemon` (hoặc `-NoOnboard` rồi onboard sau), `openclaw --version`, `openclaw doctor`, `openclaw gateway status`. Gateway thành Scheduled Task (có thể cần terminal Admin); chế độ không service: `openclaw gateway run`. Hoặc `npm install -g openclaw@latest` (npm mới có thể cần `--allow-scripts=openclaw`).
- Windows lưu ý: cần Git for Windows trên PATH (cho workspace mới); exec ưu tiên PowerShell 7. WSL2 là tùy chọn, không bắt buộc cho demo.
- Zalo: bundled plugin, không cần cài thêm; đặt `ZALO_BOT_TOKEN` hoặc `channels.zalo.accounts.default.botToken`; `openclaw channels status --probe`. Kênh dùng long-polling nên không cần URL công khai (máy phải bật liên tục).
- Gemini: `openclaw onboard --auth-choice gemini-api-key` (hoặc env `GEMINI_API_KEY`); model ref `google/<model-id>`; doc liệt kê mặc định `google/gemini-4-argon`, `google/gemini-3.8-flash`, alias `gemini-flash-lite`. Kiểm `openclaw models list --provider google`. Free tier: theo ai.google.dev/gemini-api/terms, Google dùng nội dung để cải thiện sản phẩm và con người có thể đọc; "Do not submit sensitive, confidential, or personal information to the Unpaid Services". Gói trả phí thì không dùng prompt để train. Cho demo: dùng dữ liệu giả/ẩn danh với gói free; nếu dùng dữ liệu thật thì bật billing.
- OpenRouter/Groq: chưa tra điều khoản trong lần nghiên cứu này (chưa kiểm chứng). Cần xem trang giá + chính sách dữ liệu riêng nếu chọn; các model free trên OpenRouter thường do nhà cung cấp phía sau có thể log/train (kiến thức chung, chưa xác minh). Với tool-calling ổn định, chọn model có function calling tốt.

## Điểm cần thử thực tế (ngày 28/10)

1. Ghi ID hex vào `allowFrom` -> gateway có nhận không (xem `doctor`/log); thử pairing với ID hex.
2. `requesterSenderId` có mặt trong tool context ở bản cài thật không; giá trị đúng bằng `from.id` hex, định dạng có tiền tố `zalo:` không.
3. `bindings` với `peer.kind:"direct"` + id hex cho kênh zalo có khớp; kiểm agent được chọn qua `openclaw logs --follow`.
4. Cú pháp config (`agents.entries`, `tools.allow` với tên tool plugin) đúng với bản đã cài (`openclaw config schema`, `openclaw doctor`).
5. `session.dmScope: "per-channel-peer"` có tách session giữa hai phụ huynh.
6. Gateway chạy ổn định như Scheduled Task; token model free có đủ rate limit.
7. Windows: có cần Docker nếu muốn sandbox; mặc định bỏ sandbox.

## Phân loại độ chắc chắn

- Đã đọc trực tiếp (qua công cụ fetch tóm tắt, không phải đọc raw nguyên văn): docs openclaw (zalo, pairing, channel-routing, multi-agent, security, tool-permissions, tool-plugins, install, platforms/windows, providers/google), mã nguồn `extensions/zalo/src/{monitor,group-access,setup-allow-from,config-schema}.ts`, `src/plugins/tool-types.ts`.
- Suy luận / chưa kiểm chứng: hex qua schema `AllowFromListSchema`, khớp peer binding, allowlist tool plugin, dạng sessionKey, giới hạn Sheets API, điều khoản OpenRouter/Groq, thiết kế plugin cụ thể.

## Nguồn

- https://docs.openclaw.ai/channels/zalo (bản đã lưu: zalo-doc/openclaw/zalo.md)
- https://docs.openclaw.ai/channels/pairing (đã lưu)
- https://docs.openclaw.ai/channels/channel-routing (đã lưu)
- https://docs.openclaw.ai/concepts/multi-agent
- https://docs.openclaw.ai/gateway/security
- https://docs.openclaw.ai/gateway/security/access-control
- https://docs.openclaw.ai/gateway/security/tool-permissions
- https://docs.openclaw.ai/plugins/tool-plugins
- https://docs.openclaw.ai/tools/skills
- https://docs.openclaw.ai/cli/mcp
- https://docs.openclaw.ai/install
- https://docs.openclaw.ai/platforms/windows
- https://docs.openclaw.ai/providers/google
- https://ai.google.dev/gemini-api/terms
- https://github.com/openclaw/openclaw/blob/main/extensions/zalo/src/monitor.ts
- https://github.com/openclaw/openclaw/blob/main/extensions/zalo/src/group-access.ts
- https://github.com/openclaw/openclaw/blob/main/extensions/zalo/src/setup-allow-from.ts
- https://github.com/openclaw/openclaw/blob/main/extensions/zalo/src/config-schema.ts
- https://github.com/openclaw/openclaw/blob/main/src/plugins/tool-types.ts
- Nguồn phụ (blog/mirror, độ tin cậy thấp): https://llmbase.ai/openclaw/gog/ , https://apidog.com/blog/top-25-awesome-openclaw-skills/ ; các trang getclawkit.com có dấu hiệu độc hại, không dùng.

---

## Kiểm chứng trên mã nguồn đã cài (27/10, OpenClaw 2026.10.7 + @openclaw/zalo 2026.10.7)

Đọc trực tiếp code trên máy. Đường dẫn tính từ `%APPDATA%/npm/node_modules/openclaw/`, trừ khi ghi `zalo/` (= `~/.openclaw/extensions/zalo/dist/.setup/`).

1. **ID hex dùng được** cho `allowFrom` và cho kiểm tra người nhắn lúc chạy. `normalizeZaloAllowEntry` chỉ trim, bỏ tiền tố `zalo:`/`zl:` rồi lowercase (`zalo/group-access-*.mjs:4-5`). Schema nhận `string | number`. Riêng phần **người phê duyệt** (approver cho exec/permission) bắt buộc ID dạng số (`zalo/channel-*.mjs:79-81`), nên phụ huynh không bao giờ phê duyệt được gì. Điều đó không ảnh hưởng thiết kế. Doc `zalo.md` ghi "numeric" là chưa cập nhật so với code.
2. **ID người gửi do hệ thống cấp:** `senderId = from.id`, dạng hex thuần không tiền tố → `SenderId` → `requesterSenderId` (`dispatch-from-config-*.mjs:2892/2918`). Riêng `From` có dạng `zalo:<id>`.
3. **Peer để định tuyến** của DM là `chat.id`, không phải `from.id`. Test 27/10 cho thấy trong chat 1-1 hai giá trị này trùng nhau.
4. **Đăng ký tool:** phải dùng dạng **factory** `api.registerTool((ctx) => tool)`. `ctx.requesterSenderId`, `ctx.messageChannel`, `ctx.senderIsOwner` chỉ có trong factory, `execute(toolCallId, params, signal, onUpdate)` thì **không có**. `defineToolPlugin` dạng đơn giản không có sender ID, nên không dùng. Fail-closed: thiếu `requesterSenderId` hoặc `messageChannel !== "zalo"` thì factory trả `null`. Manifest phải khai tool trong `contracts.tools`. Doc mẫu: `docs/plugins/building-plugins.md:287-312`. Tạo khung bằng `openclaw plugins init`.
5. **Config:**
   - Agent khai ở `agents.entries.<id>` (không phải `agents.list[]`).
   - `session.dmScope: "per-channel-peer"`.
   - `bindings[].match.peer: {kind:"direct", id}` được ưu tiên trước; `accountId:"*"` áp cho mọi tài khoản.
   - Quyền tool theo agent: `agents.entries.<id>.tools: {allow | alsoAllow, deny, profile, toolsBySender}`. Deny thắng. Không đặt `allow` và `alsoAllow` cùng một cấp. Allow một tool chưa được nạp thì lượt chạy báo lỗi.
   - Cách an toàn nhất cho agent phụ huynh: `tools: { allow: ["tra_cuu_con", "lien_ket_phu_huynh"] }`, các tool khác đều bị chặn, kể cả `group:runtime`/`fs`/`web`/`ui`.
   - Có thêm `toolsBySender` (khoá `"id:<senderId>"`), có thể dùng thay binding nếu muốn một agent duy nhất.
