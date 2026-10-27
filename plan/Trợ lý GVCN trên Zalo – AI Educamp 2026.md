# Trợ lý GVCN trên Zalo – Kế hoạch dự thi AI Educamp 2026

Oct 26, 2026

**Một sản phẩm, hai nhóm đối tượng cùng hưởng lợi:** giáo viên chủ nhiệm bớt việc lặp lại, phụ huynh biết con mình học hành ra sao ngay trên Zalo.&#32;

Kế hoạch nộp: Nov 2, 2026.

## Vì sao đáng làm

Sản phẩm phục vụ hai nhóm đối tượng cùng lúc là giáo viên chủ nhiệm và phụ huynh học sinh, và cả hai đều có lý do để dùng ngay từ ngày đầu.

**Giáo viên chủ nhiệm được gì**

- **Dữ liệu riêng của lớp mình:** GVCN có kho dữ liệu của chính lớp mình, tách biệt, không chồng chéo với hệ thống dữ liệu của trường.
- **Tự thêm, tự tuỳ biến:** ngoài điểm, GVCN thêm được hoạt động của lớp, kế hoạch sự kiện mới của trường và lớp.
- **Dùng lại file điểm có sẵn:** GVCN mở hoặc dán file Excel điểm vào bảng Google Sheets của lớp, bot đọc ngay từ đó và trả lời theo hồ sơ từng em, không phải nhập lại từng điểm.
- **Nói chuyện bằng ngôn ngữ tự nhiên:** cả GVCN và phụ huynh đều nhắn với agent như nhắn tin bình thường, ví dụ GVCN nhắn "Lan hôm nay được 9 điểm 15ph kiểm tra miệng", phụ huynh hỏi "Hôm nay con tôi có biến gì không?", không cần lệnh hay menu.
- **Bớt trả lời lặp lại:** không phải trả lời đi trả lời lại cùng một câu hỏi của nhiều phụ huynh, kể cả ngoài giờ.
- **Họp phụ huynh nhẹ nhàng:** có sẵn số liệu cả lớp và từng em, không mất buổi tối ngồi tổng hợp.

**Phụ huynh được gì, và vì sao trải nghiệm tốt**

- **Không phải cài gì mới:** dùng ngay Zalo, ứng dụng phụ huynh vẫn mở mỗi ngày.
- **Hỏi lúc nào cũng được:** 10 giờ tối vẫn có câu trả lời, không ngại làm phiền cô giáo.
- **Thông tin mới và cụ thể:** biết con được điểm gì, tham gia hoạt động gì trong tuần, lớp sắp có sự kiện gì, không phải đợi đến buổi họp cuối kỳ.
- **Riêng tư:** chỉ thấy thông tin của con mình, không bị đem ra so sánh trong nhóm lớp.
- **Dễ như nhắn tin:** hỏi bằng lời bình thường như "Hôm nay con tôi có biến gì không?", không cần học cách dùng, không có menu phức tạp.

**Nhà trường được gì:** hồ sơ học sinh được số hoá đúng tinh thần Trường học số, và phụ huynh cảm nhận rõ một ngôi trường hiện đại, sát sao với con họ.

## Sản phẩm

Một AI agent trên Zalo giữ hồ sơ số của từng học sinh; trước 2/11 chỉ cần làm tốt 3 tính năng.

1. **GVCN cập nhật:** điểm cả lớp thì dán file Excel vào Google Sheets; điểm lẻ, hoạt động lớp, kế hoạch sự kiện thì nhắn một câu cho bot, bot hỏi lại xác nhận rồi mới ghi.
2. **Phụ huynh tra cứu:** hỏi bằng lời thường, bot trả lời từ dữ liệu mới nhất của đúng con mình.
3. **Báo cáo họp phụ huynh:** GVCN nhắn một câu, bot tổng hợp cả lớp và từng em (bản demo).

&#91;embedded content: cách Trợ lý GVCN hoạt động · 5 thành phần\]

Công cụ: Zalo Bot chính thức, OpenClaw (AI agent mã nguồn mở), Google Sheets làm kho dữ liệu, Claude hỗ trợ vibe coding. Sau cuộc thi có thể mở rộng sang cảnh báo sớm khi điểm tụt, nề nếp, hoạt động ngoại khoá và nhắc lịch.

## Vì sao có cửa thắng

Sản phẩm khớp với 3 tiêu chí nặng nhất của rubric, chiếm 75% tổng điểm.

- **Tác động thực tế (30%):** thí điểm với phụ huynh thật ngay tuần này, đo thời gian GVCN tiết kiệm được trước và sau.
- **Trường học số và bản sắc (25%):** số hoá hồ sơ học sinh theo đúng cách đánh giá của THPT FPT Hà Nội, và đưa trải nghiệm số đến tận phụ huynh.
- **Nhân rộng (20%):** trường nào trong hệ thống cũng liên lạc với phụ huynh qua Zalo; chỉ cần mẫu Sheets chung và một bot riêng.
- **Điểm khác biệt:** sản phẩm không chỉ giúp nội bộ trường mà phục vụ trực tiếp phụ huynh, nên tác động dễ thấy và dễ kể trong video 3 phút.

Số liệu sẽ thu để chứng minh: thời gian GVCN trả lời phụ huynh mỗi tuần, thời gian chuẩn bị một buổi họp phụ huynh, số lượt phụ huynh tra cứu và mức hài lòng của phụ huynh.

## Lộ trình 7 ngày

Tuần này chỉ cần một bot chạy được và vài phụ huynh dùng thật; phần còn lại hoàn thiện dần đến 16/11.

&#91;embedded content: lộ trình · 3 giai đoạn, 3 mốc\]

- [ ] Thứ Ba 27/10: chốt các việc ở mục cuối; xin ý kiến Ban Giám hiệu về dùng dữ liệu điểm; bắt đầu đo số liệu "trước"
- [ ] Thứ Tư 28/10: tạo Zalo Bot, cài OpenClaw; làm mẫu Google Sheets hồ sơ học sinh và file Excel mẫu đã ẩn danh
- [ ] Thứ Năm 29/10: bot đọc điểm từ Google Sheets (dán từ Excel) và cập nhật qua chat; thử 30 câu hỏi kiểu phụ huynh
- [ ] Thứ Sáu 30/10: làm phân quyền theo đúng học sinh; mời 5–10 phụ huynh dùng thử
- [ ] Thứ Bảy, Chủ Nhật 31/10–1/11: làm demo báo cáo họp phụ huynh; thu phản hồi, quay video 3 phút, viết tóm tắt 250 từ
- [ ] Thứ Hai 2/11: nộp bài vào thư mục Drive của Ban tổ chức

## Phân công

Vân và Thủy cùng làm cả kỹ thuật lẫn dữ liệu, không tách riêng mảng của ai.

- Mỗi ngày cùng chia việc theo danh sách ở phần Lộ trình; ai xong trước nhận việc tiếp theo.
- Một người làm, người kia kiểm tra lại, nhất là phân quyền, dữ liệu nhập và câu trả lời của bot.
- Cuối ngày cùng thử bot 15 phút, một người vào vai GVCN, một người vào vai phụ huynh.

## Chi phí

Thí điểm tuần này gần như 0 đồng; chạy thật cho một lớp ước tính khoảng 150–250 nghìn đồng mỗi tháng.

| Khoản | Thí điểm (đến 2/11) | Chạy thật (một lớp) |
| --- | --- | --- |
| OpenClaw | Miễn phí, mã nguồn mở | Miễn phí |
| Zalo Bot | Không tốn phí (khác Zalo OA) | Không tốn phí |
| Mô hình AI | Gói miễn phí: Gemini (khoảng 1.000 lượt/ngày), Groq (14.400 lượt/ngày), OpenRouter | Mô hình giá rẻ trả phí, vài USD/tháng |
| Máy chạy bot | Máy tính có sẵn | Oracle Cloud gói miễn phí, hoặc VPS từ khoảng 6,99 USD/tháng |

- Giảm tần suất "heartbeat" của OpenClaw để tránh tốn phí âm thầm.
- Gói miễn phí có thể cho nhà cung cấp dùng dữ liệu, nên chỉ dùng với dữ liệu ẩn danh. Khi đưa điểm thật vào, chuyển sang gói trả phí có điều khoản bảo mật tốt hơn.
- Chi phí thấp là điểm cộng cho tiêu chí nhân rộng: trường nào trong hệ thống cũng đủ sức triển khai.

Nguồn: [Fast.io](https://fast.io/resources/openclaw-pricing/), [Haimaker](https://haimaker.ai/blog/openclaw-api-costs-pricing/), [Findstack](https://findstack.com/resources/cheapest-vps-for-openclaw), [Vietnix](https://vietnix.vn/openclaw-zalo/).

## Rủi ro đã tính trước

Những rủi ro lớn nhất đều đã có phương án, không rủi ro nào chặn được kế hoạch.

| Rủi ro | Phương án |
| --- | --- |
| Phụ huynh xem nhầm dữ liệu học sinh khác | Mỗi tài khoản Zalo chỉ gắn với đúng con mình; kiểm thử phân quyền trước khi mở |
| AI ghi hoặc trả lời sai điểm | Bot chỉ đọc số từ bảng; mọi lần ghi đều có GVCN xác nhận |
| Dữ liệu điểm đi qua dịch vụ bên ngoài | Xin ý kiến Ban Giám hiệu; tuần đầu dùng dữ liệu ẩn danh hoặc đã được phụ huynh đồng ý |
| Zalo Bot còn ở trạng thái thử nghiệm | Chỉ dùng tin nhắn riêng 1-1; quay video demo sớm làm bản dự phòng |
| Zalo Bot không nhận file (đã thử: file Excel bị báo "chưa hỗ trợ") | Điểm cả lớp dán vào Google Sheets; bot chỉ đọc Sheets |
| Tin nhắn gửi lúc bot tắt bị mất (đã thử) | Trong thí điểm giữ máy chạy bot liên tục trong khung giờ đã báo phụ huynh; khi chạy thật đưa lên máy chủ 24/7 |
| Wifi nội bộ trường chặn mạng ngoài | Dùng wifi cá nhân hoặc 4G khi thí điểm và demo |

## Định hướng lâu dài

Nếu thí điểm thành công, đề xuất trường FPT School đầu tư một máy chủ riêng chạy bot cho toàn bộ giáo viên chủ nhiệm.

- **Một máy, phục vụ mọi lớp:** mỗi GVCN có bot riêng, dữ liệu từng lớp tách biệt, chạy liên tục 24/7.
- **Dữ liệu nằm trong trường:** nhà trường tự quản lý máy và dữ liệu, chủ động bảo mật, dễ được Ban Giám hiệu và phụ huynh tin tưởng.
- **Đầu tư một lần, dùng nhiều năm:** không cần mỗi giáo viên tự thuê máy; phần mô hình AI trả theo mức dùng thực tế. Nếu máy đủ mạnh, có thể chạy mô hình AI ngay trên máy để dữ liệu không ra ngoài.
- **Mô hình mẫu cho cả hệ thống:** các trường FPT khác chỉ cần làm theo để triển khai.

Lộ trình đề xuất:

1. Đến 16/11: thí điểm một lớp, chứng minh hiệu quả.
2. Học kỳ 2: mở rộng ra vài lớp, vẫn dùng dịch vụ thuê theo tháng.
3. Năm học tiếp theo: trường đầu tư máy riêng cho toàn bộ GVCN.

## Cần chốt trong buổi họp

Năm việc này chốt xong là bắt tay làm được ngay ngày mai.

- [ ] Tên chính thức của sản phẩm
- [ ] Lớp thí điểm và 5–10 phụ huynh tham gia
- [ ] Trường quản lý điểm trên hệ thống nào, có xuất Excel được không
- [ ] Nơi chạy bot, mô hình AI và ai chi trả phí sử dụng
- [ ] Vân và Thủy thống nhất phân công
