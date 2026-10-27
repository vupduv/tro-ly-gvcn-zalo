<!-- Nguồn: https://bot.zapps.me/docs/apis/getMe/ (tải ngày 2026-10-27) -->

# getMe

Cập nhật lần cuối: 16/12/2025

Sử dụng phương thức này để kiểm tra `Bot Token`, nếu token hợp lệ sẽ trả về các thông tin cơ bản về Bot của bạn.

-   **URL**: `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/getMe`
-   **Method**: POST
-   **Response Type**: application/json

#### Sample code

**Nodejs**

```js
const axios = require('axios'); 

const entrypoint = `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/getMe`;
const response = await axios.post(entrypoint, {});
```

**cURL**

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot<BOT_TOKEN>/getMe" \
  -H "Content-Type: application/json"
```

### Parameters

Không yêu cầu tham số đi kèm.

### Sample response

```json
{
  "ok": true,
  "result": {
    "id": "1459232241454765289",
    "account_name": "bot.VDKyGxQvc",
    "account_type": "BASIC",
    "can_join_groups": false
  }
}
```
