<!-- Nguồn: https://bot.zapps.me/docs/build-your-bot/ (tải ngày 2026-10-27) -->

# Hướng dẫn xây dựng Zalo Bot đơn giản với cơ chế Polling

Cập nhật lần cuối: 3/6/2026

Dưới đây là hướng dẫn xây dựng Zalo Bot cơ bản sử dụng chế độ Polling, phù hợp cho người mới bắt đầu và có thể dễ dàng chạy trên máy local.

## Bước 1: Hiểu sơ lược về Zalo Bot

Zalo Bot là một tài khoản tự động (bot) hoạt động trên nền tảng Zalo, cho phép tương tác với người dùng thông qua tin nhắn. Bot có thể giúp bạn:

-   Trả lời tin nhắn theo từ khóa, yêu cầu...
-   Gửi thông tin cảnh báo
-   Tự động phản hồi đơn hàng, hỗ trợ khách hàng, khảo sát, v.v.

## Bước 2: Tạo Bot

Để tạo Zalo Bot, vui lòng làm theo hướng dẫn [tại đây](https://bot.zapps.me/docs/create-bot/). Sau khi tạo Bot, bạn sẽ nhận được thông tin `Bot Token` để tiến hành tích hợp API.

## Bước 3: Lập trình Bot

Tham khảo code mẫu bên dưới để lập trình Bot đơn giản sử dụng cơ chế [getUpdates](https://bot.zapps.me/docs/apis/getUpdates/) và Zalo Bot SDK, phù hợp với môi trường **Development**, nhu cầu chạy thử nghiệm từ local trong quá trình tích hợp.

-   Python: Tham khảo thêm tài liệu tại [python-zalo-bot](https://pypi.org/project/python-zalo-bot/).
-   Nodejs: Tham khảo thêm tài liệu tại [node-zalo-bot](https://www.npmjs.com/package/node-zalo-bot).

**Python**

```python

from zalo_bot import Update
from zalo_bot.ext import ApplicationBuilder, CommandHandler, ContextTypes

# Hàm xử lý cho lệnh /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(f"Chào {update.effective_user.display_name}! Tôi là chatbot!")

# Hàm xử lý cho lệnh /echo
async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = " ".join(context.args)
    if message:
        await update.message.reply_text(f"Bạn vừa nói: {message}")
    else:
        await update.message.reply_text("Hãy nhập gì đó sau lệnh /echo")

if __name__ == "__main__":
    app = ApplicationBuilder().token("YOUR TOKEN HERE").build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("echo", echo))

    print("🤖 Bot đang chạy...")
    app.run_polling()
```

**Nodejs**

```js
const ZaloBot = require('node-zalo-bot');

const bot = new ZaloBot('YOUR TOKEN HERE', {
  polling: true
});

bot.onText(/\/start/, (msg, match) => {
  bot.sendMessage(msg.chat.id, `Chào ${msg.from.display_name}! Tôi là chatbot!`);
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  let message = match[1];
  if (message) {
    bot.sendMessage(msg.chat.id, `Bạn vừa nói: ${message}`);
  } else {
    bot.sendMessage(msg.chat.id, 'Hãy nhập gì đó sau lệnh /echo');
  }
});

bot.on('message', (msg) => {
  console.log('Bạn vừa nhận được tin nhắn mới', msg);
}); 
```
