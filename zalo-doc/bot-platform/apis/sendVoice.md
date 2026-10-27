<!-- Nguồn: https://bot.zapps.me/docs/apis/sendVoice/ (tải ngày 2026-10-27) -->

# sendVoice

Cập nhật lần cuối: 15/6/2026

API cho phép Bot của bạn gửi tin nhắn thoại đến người dùng trong cuộc trò chuyện 1-1. API này hiện **không hỗ trợ gửi vào nhóm**.

-   **URL**: `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/sendVoice`
-   **Method**: POST
-   **Response Type**: application/json

#### Sample code

**Nodejs**

```js
const axios = require('axios'); 

const entrypoint = `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/sendVoice`;
const response = await axios.post(entrypoint, { chat_id: 'abc.xyz', voice_url: 'https://example.com/audio.aac'});
```

**cURL**

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot<BOT_TOKEN>/sendVoice" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "abc.xyz",
    "voice_url": "https://example.com/audio.aac"
  }'
```

### Parameters

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `chat_id` | String | true | ID của người nhận. Chỉ hỗ trợ trò chuyện 1-1, không hỗ trợ ID nhóm |
| `voice_url` | String | true | Đường dẫn tới tệp âm thanh sẽ được gửi. Bắt buộc là đường dẫn hợp lệ có phần mở rộng `.aac` |

> Lưu ý
> 
> Tin nhắn thoại chỉ gồm tệp âm thanh, không kèm chú thích (caption). Định dạng tệp được hỗ trợ hiện tại là `.aac`.

> Giới hạn
> 
> API `sendVoice` chỉ hỗ trợ gửi trong cuộc trò chuyện 1-1 với người dùng. Hiện tại **không hỗ trợ gửi tin nhắn thoại vào nhóm** — nếu truyền vào `chat_id` của nhóm, yêu cầu có thể trả về thành công nhưng tin nhắn sẽ không được gửi tới nhóm.

### Sample response

```json
{
  "ok": true,
  "result": {
    "message_id": "82599fa32f56d00e8941",
    "date": 1749632637199
  }
}
```
