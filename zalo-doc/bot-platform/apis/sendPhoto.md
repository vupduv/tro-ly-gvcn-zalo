<!-- Nguồn: https://bot.zapps.me/docs/apis/sendPhoto/ (tải ngày 2026-10-27) -->

# sendPhoto

Cập nhật lần cuối: 16/12/2025

API cho phép Bot của bạn gửi tin nhắn hình ảnh đến người dùng hoặc các cuộc trò chuyện.

-   **URL**: `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/sendPhoto`
-   **Method**: POST
-   **Response Type**: application/json

#### Sample code

**Nodejs**

```js
const axios = require('axios'); 

const entrypoint = `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/sendPhoto`;
const response = await axios.post(entrypoint, { chat_id: 'abc.xyz', caption: 'My photo', photo: 'https://placehold.co/600x400'});
```

**cURL**

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot<BOT_TOKEN>/sendPhoto" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "abc.xyz",
    "caption": "My photo",
    "photo": "https://placehold.co/600x400"
  }'
```

### Parameters

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `chat_id` | String | true | ID của người nhận hoặc cuộc trò chuyện |
| `photo` | String | true | Đường dẫn hình ảnh sẽ được gửi |
| `caption` | String | false | Nội dung văn bản của tin nhắn sẽ được gửi kèm, với độ dài từ 1 đến 2000 ký tự |

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
