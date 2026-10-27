// Bot test tối giản: long polling getUpdates, in sự kiện nhận được và trả lời lại (echo).
// Dùng để kiểm tra token, lấy Zalo user ID và xem payload thật của từng loại tin nhắn.
// Chạy: node bot/scripts/echo-test.js [số phút, mặc định 10]   (đọc ZALO_BOT_TOKEN từ .env ở thư mục gốc)
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', '..', '.env');
for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const TOKEN = process.env.ZALO_BOT_TOKEN;
if (!TOKEN) throw new Error('Thiếu ZALO_BOT_TOKEN trong .env');

const API = `https://bot-api.zaloplatforms.com/bot${TOKEN}`;
const minutes = Number(process.argv[2] || 10);
const deadline = Date.now() + minutes * 60_000;

async function call(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

const log = (...a) => console.log(new Date().toISOString(), ...a);

async function main() {
  log(`Đang lắng nghe trong ${minutes} phút...`);
  while (Date.now() < deadline) {
    let data;
    try {
      data = await call('getUpdates', { timeout: '30' });
    } catch (e) {
      log('Lỗi mạng:', e.message);
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    if (!data.ok) {
      if (data.error_code !== 408) log('getUpdates lỗi:', JSON.stringify(data));
      continue;
    }
    const updates = Array.isArray(data.result) ? data.result : [data.result];
    for (const u of updates) {
      log('SỰ KIỆN:', JSON.stringify(u));
      const msg = u.message;
      if (!msg || !msg.chat) continue;
      const kind = u.event_name || 'unknown';
      const text = msg.text ? `Đã nhận tin: "${msg.text}"` : `Đã nhận sự kiện: ${kind}`;
      const sent = await call('sendMessage', { chat_id: msg.chat.id, text });
      log('Trả lời:', JSON.stringify(sent));
    }
  }
  log('Hết thời gian, dừng.');
}

main();
