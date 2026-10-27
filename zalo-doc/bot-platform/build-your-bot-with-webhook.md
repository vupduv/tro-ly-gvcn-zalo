<!-- Nguồn: https://bot.zapps.me/docs/build-your-bot-with-webhook/ (tải ngày 2026-10-27) -->

# Hướng dẫn xây dựng Zalo Bot sử dụng cơ chế Webhook

Cập nhật lần cuối: 3/6/2026

Dưới đây là hướng dẫn xây dựng Zalo Bot sử dụng cơ chế Webhook dành cho người mới bắt đầu:

## Mục tiêu

-   Tạo một bot Zalo sử dụng cơ chế Webhook để nhận sự kiện từ người dùng.
-   Xử lý các sự kiện như nhận tin nhắn, gửi phản hồi, gửi ảnh,...
-   Hiện thực bằng NodeJS hoặc Python sử dụng các SDK có sẵn.

## Bước 1: Tạo Bot

Để tạo Zalo Bot, vui lòng làm theo hướng dẫn [tại đây](https://bot.zapps.me/docs/create-bot/). Sau khi tạo Bot, bạn sẽ có thông tin `Bot Token` để tích hợp API.

## Bước 2: Thiết lập Webhook

Bạn cần thiết lập Server với domain HTTPS để đăng ký Webhook nhận sự kiện. Bạn có thể dùng:

-   Ngrok (dành cho dev local): ngrok http 3000
-   Render, Railway, Vercel,... (có hỗ trợ HTTPS)

Sau đó sử dụng API [setWebhook](https://bot.zapps.me/docs/apis/setWebhook/) để thiết lập Webhook cho Zalo Bot của bạn.

## Bước 3: Lập trình Bot

Sử dụng Zalo Bot SDK theo code mẫu bên dưới để hiện thực logic cho Bot của bạn.

-   Python: Tham khảo thêm tài liệu tại [python-zalo-bot](https://pypi.org/project/python-zalo-bot/).
-   Nodejs: Tham khảo thêm tài liệu tại [node-zalo-bot](https://www.npmjs.com/package/node-zalo-bot).

**Python**

```python
from flask import Flask, request
from zalo_bot import Bot, Update
from zalo_bot.ext import Dispatcher, CommandHandler, MessageHandler, filters

TOKEN = 'YOUR_ZALO_BOT_TOKEN'
bot = Bot(token=TOKEN)

app = Flask(__name__)

# Cấu hình webhook 1 lần khi chạy lần đầu
@app.before_first_request
def setup_webhook():
    webhook_url = 'https://your-ngrok-or-domain/webhook'
    bot.set_webhook(url=webhook_url)

# Hàm xử lý /start
def start(update: Update, context):
    update.message.reply_text(f"Xin chào {update.effective_user.first_name}!")

# Hàm xử lý tin nhắn thường
def echo(update: Update, context):
    update.message.reply_text(f"Bạn vừa nói: {update.message.text}")

# Webhook endpoint
@app.route('/webhook', methods=['POST'])
def webhook():
    update = Update.de_json(request.get_json(force=True), bot)
    dispatcher.process_update(update)
    return 'ok'

# Gắn dispatcher và handler
from zalo_bot.ext import CallbackContext

dispatcher = Dispatcher(bot, None, workers=0)
dispatcher.add_handler(CommandHandler('start', start))
dispatcher.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

if __name__ == '__main__':
    app.run(port=8443)
```

**Nodejs**

```js
const express = require('express');
const bodyParser = require('body-parser');
const ZaloBot = require('node-zalo-bot');

const app = express();
app.use(bodyParser.json());

const TOKEN = 'YOUR_ZALO_BOT_TOKEN';
const WEBHOOK_URL = 'https://your-ngrok-or-domain/webhook';

const bot = new ZaloBot(TOKEN, { webHook: { port: 3000 } });
bot.setWebHook(`${WEBHOOK_URL}`);

// Bot xử lý khi có message gửi đến
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Chào bạn ${msg.from.display_name}, bạn vừa gửi: ${msg.text}`);
});

// Endpoint webhook (Zalo sẽ gửi POST request vào đây)
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body); // cần thiết để bot hoạt động
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('Bot đang chạy trên cổng 3000');
});
```
