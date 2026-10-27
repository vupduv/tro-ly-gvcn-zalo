<!-- Nguồn: https://bot.zapps.me/docs/apis/testWebhook/ (tải ngày 2026-10-27) -->

# testWebhook

Cập nhật lần cuối: 7/9/2026

API cho phép kiểm tra ngay lập tức Webhook URL hiện tại của Bot có nhận được request từ Zalo hay không, giúp bạn tự chẩn đoán lỗi mà không cần liên hệ hỗ trợ.

-   **URL**: `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/testWebhook`
-   **Method**: POST
-   **Response Type**: application/json

> mẹo
> 
> Nên gọi API này sau khi [setWebhook](https://bot.zapps.me/docs/apis/setWebhook/) hoặc bất cứ khi nào nghi ngờ Bot không nhận được sự kiện, trước khi liên hệ hỗ trợ.

#### Sample code

**Nodejs**

```js
const axios = require('axios'); 

const entrypoint = `https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/testWebhook`;
const response = await axios.post(entrypoint, {});
```

**cURL**

```bash
curl -X POST "https://bot-api.zaloplatforms.com/bot<BOT_TOKEN>/testWebhook" \
  -H "Content-Type: application/json"
```

### Parameters

Không yêu cầu tham số đi kèm.

### Sample response

Khi Webhook URL của bạn phản hồi thành công:

```json
{
  "ok": true,
  "result": {
    "ok": true,
    "url": "https://your-webhookurl.com",
    "outcome": "webhook.ok",
    "hint": "Your endpoint responded successfully."
  }
}
```

Khi Webhook URL của bạn từ chối request (ví dụ WAF/CDN chặn với mã 403):

```json
{
  "ok": true,
  "result": {
    "ok": false,
    "url": "https://your-webhookurl.com",
    "outcome": "webhook.http.403",
    "hint": "Your server or CDN rejected the request with 403. Check WAF / Cloudflare rules, any IP allowlist, and that the User-Agent \"Java/<version>\" is permitted."
  }
}
```

> ghi chú
> 
> Trường `ok` ở ngoài cùng cho biết yêu cầu gọi API có thành công hay không. Trường `result.ok` mới cho biết Webhook URL của bạn có phản hồi hợp lệ (2xx) hay không — đây là trường bạn cần kiểm tra để biết Webhook đã hoạt động đúng chưa.

#### Result

| Trường | Kiểu dữ liệu | Mô tả |
| --- | --- | --- |
| `ok` | Boolean | `true` nếu Webhook URL phản hồi mã 2xx. |
| `url` | String | Webhook URL hiện đang được kiểm tra. |
| `outcome` | String | Mã phân loại kết quả, xem bảng bên dưới. |
| `hint` | String | Gợi ý cách xử lý, tương ứng với `outcome`. |

#### Outcome

| `outcome` | Ý nghĩa |
| --- | --- |
| `webhook.ok` | Webhook URL phản hồi thành công (2xx). |
| `webhook.http.403` | Webhook URL từ chối request với mã 403. Thường do WAF/CDN, IP allowlist, hoặc chặn theo `User-Agent`. |
| `webhook.http.404` | Webhook URL trả về 404. Endpoint chưa được deploy hoặc không nhận method POST. |
| `webhook.http.5xx` | Server của bạn gặp lỗi khi xử lý request. |
| `webhook.http.other` | Server trả về mã khác không phải 2xx (ví dụ redirect 3xx — Zalo Bot Platform không tự động theo redirect, vui lòng đăng ký URL cuối cùng). |
| `webhook.err.tls` | Lỗi bắt tay TLS. Chuỗi chứng chỉ (certificate chain) không đầy đủ, hết hạn, hoặc do CA nội bộ cấp. |
| `webhook.err.unreachable` | Không nhận được phản hồi nào từ Webhook URL. Nguyên nhân có thể là hostname không phân giải được, không kết nối được từ hệ thống Zalo Bot Platform, endpoint phản hồi quá chậm, hoặc URL không trỏ tới một địa chỉ được phép (xem [setWebhook](https://bot.zapps.me/docs/apis/setWebhook/)). Hãy kiểm tra hostname và firewall, trả về 2xx ngay rồi xử lý logic bất đồng bộ; nếu đang phát triển ở local thì dùng tunnel (ví dụ ngrok) và đăng ký URL công khai. |

> cảnh báo
> 
> Để tránh làm quá tải Webhook URL của bạn, API này bị giới hạn số lần gọi mỗi ngày cho mỗi Bot. Khi vượt quá giới hạn, response sẽ trả về `"ok": false` kèm `"errorCode": 426`.
