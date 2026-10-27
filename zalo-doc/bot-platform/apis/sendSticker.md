<!-- Nguồn: https://bot.zapps.me/docs/apis/sendSticker/ (tải ngày 2026-10-27) -->

# sendSticker

Cập nhật lần cuối: 16/12/2025

API cho phép Bot của bạn gửi tin nhắn Sticker đến người dùng hoặc các cuộc trò chuyện.

-   **URL**: `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/sendSticker`
-   **Method**: POST
-   **Response Type**: application/json

#### Sample code

**Nodejs**

```js
const axios = require('axios'); 

const entrypoint = `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/sendSticker`;
const response = await axios.post(entrypoint, { chat_id: 'abc.xyz', sticker: '0e078a2fb66a5f34067b'});
```

**cURL**

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot<BOT_TOKEN>/sendPhoto" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "abc.xyz",
    "sticker": "0e078a2fb66a5f34067b"
  }'
```

### Parameters

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `chat_id` | String | true | ID của người nhận hoặc cuộc trò chuyện |
| `sticker` | String | true | Truyền vào stricker lấy từ nguồn: [https://stickers.zaloapp.com/](https://stickers.zaloapp.com/). Vui lòng xem video hướng dẫn tại đây: [https://vimeo.com/649330161](https://vimeo.com/649330161) |

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
