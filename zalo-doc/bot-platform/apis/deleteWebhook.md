<!-- Nguồn: https://bot.zapps.me/docs/apis/deleteWebhook/ (tải ngày 2026-10-27) -->

# deleteWebhook

Cập nhật lần cuối: 16/12/2025

Sử dụng phương thức này để gỡ bỏ thiết lập webhook nếu bạn quyết định chuyển lại sang `getUpdates`. Phương thức này sẽ trả về **True** khi xử lý thành công.

-   **URL**: `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/deleteWebhook`
-   **Method**: POST
-   **Response Type**: application/json

#### Sample code

**Nodejs**

```js
const axios = require('axios'); 

const entrypoint = `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/deleteWebhook`;
const response = await axios.post(entrypoint, {});
```

**cURL**

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot<BOT_TOKEN>/deleteWebhook" \
  -H "Content-Type: application/json"
```

### Parameters

Không yêu cầu tham số đi kèm.

### Sample response

```json
{
 "ok": true,
 "result": {
   "url": "",
   "updated_at": 1749538250568
  }
}
```
