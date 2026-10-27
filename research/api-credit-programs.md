# Cơ hội xin credit / quyền truy cập LLM API nhanh (1-3 ngày)

Câu hỏi: tìm credit hoặc API rẻ/miễn phí cho bot OpenClaw (tool calling + tiếng Việt), ngoài các free tier đã có trong `free-llm-providers.md`. Ngày nghiên cứu: 2026-10-27.

Ghi chú độ tin cậy: công cụ tải trang hạn chế, nhiều mục chỉ xác nhận qua bài thứ ba (đánh dấu [phụ]). Mục nào ghi "chưa xác nhận" cần kiểm tra trên console trước khi dựa vào.

## Kết luận ngắn

Dùng được ngay hôm nay chỉ với Gmail (chưa xác nhận cần SĐT/thẻ hay không):
1. **Z.ai API chính thức, GLM-5.3-Flash** (KHÔNG miễn phí: 0,15 USD vào / 0,50 USD ra mỗi 1M token; cache 0,03). Một tin ~3 lượt x 15k token đầu vào ≈ 0,007-0,01 USD, rẻ hơn Cerebras ~10 lần. OpenClaw có sẵn provider `zai`, `zai/glm-5.3-flash`, 1M context.
2. **Z.ai miễn phí thật: GLM-4.7-Flash** (và GLM-4.5-Flash, đã có thông báo sắp ngừng [phụ]). Giá 0 trên trang giá chính thức. Hạn chế: nguồn phụ nói free chỉ 1 concurrency (chưa xác nhận từ docs chính thức), model cũ hơn.
3. **DeepSeek API** (`deepseek-flash`): 0,15 USD vào (cache miss), 0,003-0,006 (cache hit), 0,6-1,2 ra mỗi 1M token. Tool calling có, 1M context, 2500 concurrent. Rẻ nhất, nhưng KHÔNG thấy credit miễn phí trên docs chính thức; nguồn phụ nói phải nạp tiền (tối thiểu vài USD, cần thẻ/ví) trước khi key chạy.
4. **FPT Token Factory / AI Marketplace** (marketplace.fptcloud.com): đúng "bản sắc FPT". Tặng 1 USD cho tài khoản mới (nguồn: bài hướng dẫn chính thức của FPT Smart Cloud, có thể đã đổi). Có API tương thích OpenAI (`https://mkp-api.fptcloud.com`, key tạo ở "My API Keys"). Tool calling: docs không nói; danh mục model (repo fpt-corp/ai-marketplace) là Llama-3.3-70B, Qwen2.5, DeepSeek-R1, SaoLa3.1 (FPT) - có thể đã cập nhật. Cần hỏi FPT xin credit lớn hơn (xem dưới).

Chưa tìm thấy chương trình nào cấp credit API miễn phí cho giáo viên phổ thông Việt Nam trong 1-3 ngày. Các chương trình giáo dục chủ yếu cấp gói ứng dụng (chat), không phải API backend.

## Bảng chương trình

| Chương trình | Điều kiện | Cần thẻ? | Thời gian duyệt | Credit | Dùng cho bot được không | Link |
|---|---|---|---|---|---|---|
| Z.ai GLM-4.7-Flash / 4.5-Flash (API) | Tài khoản z.ai | Nguồn phụ: không [phụ]; SĐT chưa rõ | Ngay | Miễn phí (0 USD) | Có (OpenAI-compatible, tool calling theo dòng GLM). Rủi ro: 1 concurrency [phụ], 4.5-Flash sắp ngừng | https://docs.z.ai/guides/overview/pricing |
| Z.ai GLM-5.3-Flash (API) | Tài khoản z.ai, nạp tiền | Có thể cần để nạp | Ngay | Trả phí, rất rẻ | Có; OpenClaw `zai-global` / `zai/glm-5.3-flash` | https://docs.z.ai/guides/overview/pricing |
| OpenRouter `z-ai/glm-5.3-flash:free` | Tài khoản OpenRouter | Không | Ngay | Free, giới hạn 20 RPM / 50 RPD (xem file free-llm-providers) | Hạn chế do 50 req/ngày | https://openrouter.ai/z-ai/glm-5.3-flash:free |
| DeepSeek API | Email/Google/SĐT [phụ] | Cần nạp tiền để dùng [phụ] | Ngay | Không thấy free credit chính thức ("granted balance" có nhắc nhưng không nêu số) | Có, tool calling OK, rẻ nhất | https://api-docs.deepseek.com/quick_start/pricing |
| FPT Token Factory (AI Marketplace) | Tài khoản marketplace.fptcloud.com | Chưa rõ | Ngay (1 USD); credit lớn: hỏi nội bộ | 1 USD tặng (có thể đã đổi) | Có API OpenAI-compatible; tool calling chưa xác nhận | https://marketplace.fptcloud.com , https://docs.fptcloud.com/docs/fpt-ai-factory/services/serverless-inference/overview/ |
| FPT AI Factory Serverless Inference | Tài khoản FPT Cloud, nạp ví tổ chức | Chưa rõ | Ngay | Không nêu free; trả theo token, lỗi 402 khi hết ví | Có `/v1/chat/completions` | https://docs.fptcloud.com/docs/fpt-ai-factory/services/serverless-inference/quickstart/ |
| GitHub Education - Teacher (Copilot Pro) | Giáo viên được xác minh | Không | Vài ngày | Gói Copilot Pro (không phải API); từ 20/4/2026 đăng ký mới Copilot tạm dừng | Không (là gói IDE) | https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-teachers-and-os-maintainers |
| GitHub Models (API miễn phí theo PAT) | Tài khoản GitHub | Không | Ngay | Free có giới hạn ~50-150 req/ngày, 8k token vào [phụ] | Không (quá nhỏ cho 15-25k token/lượt) | https://docs.github.com/en/billing/concepts/product-billing/github-models |
| Anthropic AI for Science / External Researcher Access | Nhà nghiên cứu học thuật/phi lợi nhuận, đề tài khoa học/an toàn AI | Không | Xét hàng tháng | Đến 20.000 USD, 6 tháng | Không phù hợp (chỉ nghiên cứu) | https://www.anthropic.com/news/ai-for-science-program |
| Claude for Teachers (từ 14/7/2026) | Giáo viên K-12 Mỹ, xác minh | Không | Không rõ | Gói ~20 USD/tháng, không phải API | Không (Mỹ, không phải API) | https://edsurge.com/news/anthropic-introduces-claude-for-teachers |
| Google Gemini for Education | Workspace for Education do trường quản trị | Không | Do IT trường | Giáo viên dùng app, không phải credit API; sinh viên VN được Google AI Plus 1 năm | Không | https://edu.google.com/intl/ALL_us/ai/gemini-for-education/ |
| Azure for Students | Sinh viên đại học | Không | Ngay | 100 USD / 12 tháng | Không (giáo viên THPT không đủ điều kiện; giáo dục chưa xác nhận credit cho giáo viên) | https://learn.microsoft.com/azure/education-hub/faq |
| OpenAI / AWS Educate | Chưa tra được nguồn chính thức | - | - | - | Chưa xác nhận | - |
| Viettel AI / VNPT AI / Zalo AI | Không tìm được tài liệu API LLM OpenAI-compatible công khai | - | - | Viettel từng nói miễn phí giai đoạn phát triển (bài cũ, không rõ ngày) | Chưa xác nhận; Viettel có VT-Super-120B (6/2026), chưa rõ có API | https://en.cand.com.vn/tech-science/Made-in-Vietnam-Artificial-Intelligence-platform-launched-i579097 |
| Tencent WorkBuddy / CodeBuddy | App lập trình | - | - | Model free nằm trong app | KHÔNG: không có API cho bên thứ ba; chỉ nhận endpoint OpenAI-compatible của bên khác để app gọi | https://www.workbuddy.ai/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model |

## Z.ai / GLM chi tiết

- Docs OpenClaw cục bộ (`openclaw/docs/providers/zai.md`): provider `zai`, cài `openclaw plugins install @openclaw/zai-provider`, key `ZAI_API_KEY`.
- Auth choice: `zai-api-key` (tự dò endpoint), `zai-global` (https://api.z.ai/api/paas/v4, mặc định glm-5.2), `zai-cn`, `zai-coding-global`, `zai-coding-cn`. Cú pháp model: `zai/glm-5.3-flash`, `zai/glm-5.2`, `zai/glm-5-turbo`. Với `glm-4.7-flash` có thể phải khai báo tay (catalog liệt kê glm-5.x; id `glm-4.7` được dùng làm template).
- GLM-5.3 (không Flash) hiện là model Coding Plan, endpoint `/api/coding/paas/v4`; GLM-5.3-Flash nằm trong bảng giá API chung (0,15/0,50 USD). Key dùng cho coding endpoint khác key API chung. Gói Coding Plan không dùng làm backend bot thương mại; docs Z.ai nói công cụ đa dụng như OpenClaw chạy theo best-effort, giờ cao điểm (~14-18h Singapore) dễ 429/1305.
- "glm 5.3 flash free": tin đồn có cơ sở một phần. OpenRouter có biến thể `:free`, nhưng API chính thức Z.ai tính tiền GLM-5.3-Flash. Bản free chính thức là 4.7-Flash / 4.5-Flash.
- Thinking: GLM-5.3 không tắt hẳn được reasoning (off thành low), dễ tốn token đầu ra. GLM-5.2 tắt được.
- Điều khoản dữ liệu: chưa đọc được. Server ở Singapore/Trung Quốc; nên ẩn danh hoá tên học sinh trước khi gửi.

## DeepSeek chi tiết

- Model hiện tại: `deepseek-flash` (V4.1-Flash) và `deepseek-v4-pro`. Tên cũ `deepseek-v4-flash` vẫn chạy. Giá giảm một nửa giờ thấp điểm (peak: 01-04h và 06-10h UTC, T2-T6).
- Ước tính: 20k token vào x 3 lượt, cache miss ≈ 0,009 USD, ra thêm ~0,002 USD; với cache hit còn thấp hơn nhiều. Tức ~0,01 USD/tin hoặc ít hơn. 5 USD nạp đủ ~500+ tin.
- Chưa xác nhận: số credit tặng, bắt buộc SĐT, phương thức thanh toán chấp nhận ở VN.

## FPT: cách xin kênh nội bộ

Không tìm thấy trang công khai về credit cho nhân viên/trường thành viên. Gợi ý (suy luận, chưa kiểm chứng):
1. Email trường FPT Education đăng ký marketplace.fptcloud.com, nhận 1 USD, thử Qwen/Llama/SaoLa với tool calling.
2. Nhắn ban giám hiệu/phòng CNTT hoặc đầu mối Educamp: xin voucher/credit FPT AI Factory (FPT Smart Cloud, FPT Token Factory ra mắt chính thức 17/10/2026 tại FPT Transform). Lý do: bài thi dùng hạ tầng FPT, thí điểm 1 lớp, vài trăm tin/tuần, tổng nhu cầu < 20 USD.
3. Hỏi trực tiếp support/sales trên marketplace.fptcloud.com xin "credit dùng thử cho dự án giáo dục nội bộ".
4. Ban tổ chức AI Educamp có thể có quỹ credit: hỏi luôn.

## Điểm chưa chắc chắn

- Z.ai: giới hạn concurrency/RPM của model free, yêu cầu SĐT/thẻ, điều khoản dữ liệu, tool calling của 4.7-Flash.
- DeepSeek: có tặng credit không, cách nạp tiền ở VN.
- FPT: credit hiện tại, model hiện có, tool calling, danh mục model mới (Token Factory), tên miền gateway.
- Microsoft educator credit, OpenAI/AWS Educate, Viettel/VNPT: chưa tra được nguồn chính thức.

## Nguồn

Chính thức:
- https://docs.z.ai/guides/overview/pricing
- C:/Users/vupdu/AppData/Roaming/npm/node_modules/openclaw/docs/providers/zai.md
- https://api-docs.deepseek.com/quick_start/pricing
- https://api-docs.deepseek.com/quick_start/rate_limit
- https://fptcloud.com/en/integrating-fpt-ai-marketplace-api-key-into-cursor-ide-for-accelerated-code-generation/
- https://github.com/fpt-corp/ai-marketplace/
- https://docs.fptcloud.com/docs/fpt-ai-factory/services/serverless-inference/faq/
- https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-teachers-and-os-maintainers
- https://www.anthropic.com/news/ai-for-science-program
- https://learn.microsoft.com/azure/education-hub/faq

Phụ (bài thứ ba, cần kiểm lại):
- https://blogs.novita.ai/glm-free-api/
- https://toolnavs.com/en/article/1100-zai-released-glm-47-flash-weights-and-api-free-tier-1-concurrency-and-launched-f
- https://openrouter.ai/z-ai/glm-5.3-flash:free
- https://developer.puter.com/tutorials/how-to-get-deepseek-api-key/
- https://vnreview.vn/threads/fpt-ra-mat-3-vu-khi-ai-moi-cho-doanh-nghiep-viet.93400/
- https://edsurge.com/news/anthropic-introduces-claude-for-teachers
- https://docs.apiyi.com/en/scenarios/chat/workbuddy
