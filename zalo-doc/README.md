# Tài liệu Zalo Bot – bản lưu cục bộ

Tải ngày 2026-10-27 từ https://bot.zapps.me/docs/ (bản build 0.2.0-34, ngày 2026-10-23), kèm doc OpenClaw cho kênh Zalo và README của các SDK. Mỗi file có dòng `<!-- Nguồn: ... -->` ở đầu ghi URL gốc.

## Mục lục

### `bot-platform/` – Zalo Bot Platform (doc chính thức)

| File | Nội dung |
| --- | --- |
| [index.md](bot-platform/index.md) | Giới thiệu nền tảng |
| [create-bot.md](bot-platform/create-bot.md) | Tạo bot qua OA "Zalo Bot Manager" → Zalo Bot Creator, nhận Bot Token |
| [authorize.md](bot-platform/authorize.md) | Xác thực bằng Bot Token |
| [call-api.md](bot-platform/call-api.md) | Định dạng URL `https://bot-api.zaloplatforms.com/bot<TOKEN>/<method>`, GET/POST, cấu trúc response |
| [build-your-bot.md](bot-platform/build-your-bot.md) | Bot đơn giản bằng Polling (Python/Node SDK) |
| [build-your-bot-with-webhook.md](bot-platform/build-your-bot-with-webhook.md) | Bot bằng Webhook (Express + ngrok) |
| [build-bot-interaction-with-group.md](bot-platform/build-bot-interaction-with-group.md) | Bot trong nhóm chat (đang thử nghiệm nội bộ) |
| [build-personal-assistant-with-open-claw.md](bot-platform/build-personal-assistant-with-open-claw.md) | My ClawBot + OpenClaw |
| [webhook.md](bot-platform/webhook.md) | Cấu trúc sự kiện webhook, các loại tin nhắn nhận được |
| [error-code.md](bot-platform/error-code.md) | Bảng mã lỗi |
| [terms.md](bot-platform/terms.md) | Điều khoản sử dụng (dài, chủ yếu pháp lý, có phần dữ liệu cá nhân) |
| `apis/` | Từng API: [getMe](bot-platform/apis/getMe.md), [getUpdates](bot-platform/apis/getUpdates.md), [setWebhook](bot-platform/apis/setWebhook.md), [deleteWebhook](bot-platform/apis/deleteWebhook.md), [getWebhookInfo](bot-platform/apis/getWebhookInfo.md), [testWebhook](bot-platform/apis/testWebhook.md), [sendMessage](bot-platform/apis/sendMessage.md), [sendPhoto](bot-platform/apis/sendPhoto.md), [sendSticker](bot-platform/apis/sendSticker.md), [sendVoice](bot-platform/apis/sendVoice.md), [sendChatAction](bot-platform/apis/sendChatAction.md) |

### `openclaw/` – doc OpenClaw liên quan Zalo (https://docs.openclaw.ai)

| File | Nội dung |
| --- | --- |
| [zalo.md](openclaw/zalo.md) | **Kênh Zalo có sẵn trong OpenClaw** (dùng Bot Token của Zalo Bot Creator): config, dmPolicy, allowFrom, polling/webhook, giới hạn |
| [zaloclawbot.md](openclaw/zaloclawbot.md) | Kênh Zalo ClawBot (plugin ngoài, đăng nhập QR) |
| [plugin-reference-zalo.md](openclaw/plugin-reference-zalo.md) | Tham chiếu plugin `@openclaw/zalo` |
| [pairing.md](openclaw/pairing.md) | Cơ chế duyệt người nhắn lần đầu (pairing code) |
| [channel-routing.md](openclaw/channel-routing.md) | Định tuyến tin nhắn → session/agent |
| [groups.md](openclaw/groups.md) | Hành vi trong nhóm chat, mention gating |

### `sdk/` – README thư viện

| File | Nội dung |
| --- | --- |
| [node-zalo-bot.md](sdk/node-zalo-bot.md) | SDK Node.js `node-zalo-bot` (v0.1.6) |
| [python-zalo-bot.md](sdk/python-zalo-bot.md) | SDK Python `python-zalo-bot` (v0.1.9) |
| [openclaw-zaloclawbot.md](sdk/openclaw-zaloclawbot.md), [openclaw-zaloclawbot-cli.md](sdk/openclaw-zaloclawbot-cli.md) | Plugin My ClawBot cho OpenClaw (v0.1.4) |

## Những điểm ảnh hưởng tới kế hoạch "Trợ lý GVCN"

1. **Không dùng được My ClawBot (`openclaw-zaloclawbot`) cho phụ huynh.** Đây là trợ lý *gắn với chủ sở hữu*: bot chỉ nói chuyện với người tạo, tin nhắn từ người khác bị chặn ở phía nền tảng ([zaloclawbot.md](openclaw/zaloclawbot.md), mục "How it works"). Muốn phụ huynh nhắn được thì phải tạo bot qua **Zalo Bot Creator** rồi dùng **kênh `zalo` có sẵn của OpenClaw** với Bot Token ([zalo.md](openclaw/zalo.md)).
2. **Bot không nhận được file Excel.** Webhook/getUpdates chỉ có các sự kiện `message.text`, `message.image`, `message.sticker`, `message.voice` và `message.unsupported` ([webhook.md](bot-platform/webhook.md)). Một file .xlsx gửi vào chat nhiều khả năng sẽ về dạng `unsupported`. Cần cách khác để nhập điểm, ví dụ GVCN dán file vào Google Sheets/Drive rồi nhắn link cho bot, hoặc chụp ảnh bảng điểm.
3. **Tài khoản thuộc "nhóm đối tượng đặc biệt" (có ghi cả trẻ em) sẽ không gửi được nội dung**: bot chỉ nhận `message.unsupported.received` ([webhook.md](bot-platform/webhook.md), phần cảnh báo). Nếu học sinh dưới tuổi tự nhắn bot thì bot không đọc được. Bot dành cho phụ huynh và GVCN thì không bị ảnh hưởng.
4. **Phân quyền theo phụ huynh:** OpenClaw mặc định `dmPolicy: "pairing"`. Người lạ nhắn lần đầu nhận một mã, chủ bot duyệt bằng `openclaw pairing approve zalo <CODE>` (mã hết hạn sau 1 giờ). `allowFrom` chỉ nhận Zalo user ID dạng số. Việc ánh xạ "user ID ↔ học sinh nào" vẫn phải tự làm, ví dụ lưu trong Sheets.
5. **Giới hạn tin nhắn:** mỗi tin `sendMessage` tối đa 2000 ký tự (OpenClaw tự cắt). Có hỗ trợ `parse_mode: markdown|html` để in đậm, tô màu, làm danh sách, phù hợp cho báo cáo ([sendMessage.md](bot-platform/apis/sendMessage.md)).
6. **Polling và webhook không chạy cùng lúc.** Bản demo chạy trên máy cá nhân thì dùng polling (mặc định, không cần URL public). Webhook cần HTTPS và secret dài 8–256 ký tự.
7. **Nhóm chat** đang ở giai đoạn thử nghiệm nội bộ. Trong nhóm, bot chỉ nhận tin khi được @mention hoặc khi có người reply tin của bot. Không nên dựa vào nhóm lớp cho bản demo ngày 2/11.
8. Lỗi 429 nghĩa là vượt quota API. Doc không công bố con số quota cụ thể.
