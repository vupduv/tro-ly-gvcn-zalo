<!-- Nguồn: https://bot.zapps.me/docs/apis/getWebhookInfo/ (tải ngày 2026-10-27) -->

# getWebhookInfo

Cập nhật lần cuối: 16/12/2025

API cho phép lấy trạng thái cấu hình hiện tại của webhook

-   **URL**: `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/getWebhookInfo`
-   **Method**: POST
-   **Response Type**: application/json

#### Sample code

**Nodejs**

```js
const axios = require('axios'); 

const entrypoint = `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/getWebhookInfo`;
const response = await axios.post(entrypoint, {});
```

**cURL**

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot<BOT_TOKEN>/getWebhookInfo" \
  -H "Content-Type: application/json"
```

### Parameters

Không yêu cầu tham số đi kèm.

### Sample response

```json
{
  "ok": true,
  "result": {
    "url": "https://your-webhookurl.com",
    "updated_at": 1749633372026
  }
}
```
