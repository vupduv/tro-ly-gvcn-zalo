# Câu hỏi: model LLM miễn phí (tool calling, tiếng Việt, ctx >= 16k, 200-600 req/ngày) thay Gemini free tier cho OpenClaw 2026.10.7
Ngày nghiên cứu: 2026-10-27

## Kết luận ngắn

1. **Groq free: LOẠI.** gpt-oss-120b/20b, qwen3.8-27b chỉ 30 RPM, 1.000 RPD, **8K TPM, 200K TPD**. System prompt + tool schema của OpenClaw thường vài nghìn token/lượt, nên 8K TPM dễ bị 413/429 và 200K TPD chỉ đủ khoảng 20-50 lượt/ngày. Llama 3.3 70B và 3.1 8B sắp bị Groq tắt (16/8/2026 theo docs OpenClaw).
2. **Hạng 1: Mistral (gói Experiment/free)** - `mistral/mistral-large-latest` (dự phòng `mistral/mistral-small-latest`). Giới hạn nới nhất trong các gói free (số liệu nguồn phụ: ~1 req/s, ~500K TPM, ~1 tỷ token/tháng mỗi model), tool calling là điểm mạnh của Mistral, ctx 262k, tiếng Việt khá. Đổi lại: gói free có thể dùng dữ liệu để cải thiện model, nhưng có công tắc opt-out trong Admin Console (nguồn chính thức).
3. **Hạng 2: NVIDIA NIM (build.nvidia.com)** - `nvidia/moonshotai/kimi-k2.6` hoặc `nvidia/deepseek-ai/deepseek-v4-pro`. Miễn phí, ~40 RPM (cộng đồng báo cáo, không phải cam kết), không thấy trần ngày được công bố. Tool calling tốt (Kimi/DeepSeek). Điểm yếu: endpoint "trial", có thể chậm/hàng đợi, NVIDIA log và khuyên không gửi dữ liệu nhạy cảm.
4. **Hạng 3: Cerebras** - `cerebras/gpt-oss-120b`. Rất nhanh, tool calling ổn, chính sách không giữ prompt tốt nhất. Nhưng free trial chỉ **5 RPM, 1M token/ngày** (TPD) -> với ~5-8k token/lượt chỉ ~120-200 lượt/ngày, không đủ 600. Dùng làm fallback.
5. OpenRouter `:free`: 20 RPM, **50 req/ngày** khi chưa nạp, **1.000 req/ngày** khi đã nạp >= 10 USD (một lần). Danh sách model free thay đổi liên tục, một số báo lỗi "No endpoints found that support tool use". Dùng được nếu chấp nhận nạp 10 USD, nhưng kém ổn định hơn Mistral/NVIDIA.
6. GitHub Models: **đã ngừng hoàn toàn từ 30/7/2026** (docs.github.com) -> loại.
7. Cloudflare Workers AI: 10.000 Neurons/ngày. gpt-oss-120b ~31.8k Neurons/M token input, ~68k/M output -> chỉ ~200-300k token/ngày, không đủ. Bù lại cam kết không train trên dữ liệu khách. Loại cho nhu cầu này.

## Bảng so sánh

| Nhà cung cấp | Giới hạn free | Tool calling | Đủ 200-600 req/ngày? | Dữ liệu |
|---|---|---|---|---|
| Groq | gpt-oss-120b/20b, qwen3.8-27b: 30 RPM, 1K RPD, 8K TPM, 200K TPD (bảng docs là "Developer plan base"; trang free không tách riêng, xem /settings/limits) | Có | Không (TPD/TPM) | Mặc định không giữ inference data, có ZDR (nguồn phụ) |
| OpenRouter :free | 20 RPM; 50 RPD (<10 credit) / 1.000 RPD (>=10 credit) | Tùy model; OpenClaw tự bỏ tools nếu model không khai báo `tools` | Chỉ khi nạp 10 USD, sát trần | Tùy upstream; có provider train trên prompt free. Có thể đặt `provider.data_collection: "deny"` nhưng sẽ loại bớt model free |
| Cerebras | Free trial: 5 RPM, 30K uncached TPM, 90K total TPM, 1M TPD (gpt-oss-120b, qwen-3.8-27b) | Có | Không (~120-200 req) | Privacy policy: không giữ input/output cho inference; chưa có cam kết "không train" rõ ràng |
| Mistral Experiment | ~1 RPS/model, ~500K TPM, ~1B token/tháng (nguồn phụ; xem Admin Console) | Có, mạnh | Có | Free có thể dùng để cải thiện model; opt-out: Admin Console > Privacy > "Anonymous improvement data" (chưa xác nhận opt-out có mất quyền free không) |
| NVIDIA NIM | ~40 RPM (cộng đồng), không công bố trần ngày; trang dashboard hiển thị giới hạn thật | Có (Kimi K2.6, GLM 5.2, DeepSeek V4 Pro, Nemotron) | Có, rủi ro độ trễ | Free endpoint bị log; không nên gửi dữ liệu nhạy cảm (nguồn phụ) |
| GitHub Models | Đã đóng 30/7/2026 | - | Không | - |
| Cloudflare Workers AI | 10K Neurons/ngày (reset 00:00 UTC) | Có (tùy model) | Không | Cam kết không train (nguồn phụ) |

## Cú pháp OpenClaw (từ docs local .../openclaw/docs/providers/)

- Mistral: plugin `@openclaw/mistral-provider`; env `MISTRAL_API_KEY`; `--auth-choice mistral-api-key`; catalog: `mistral/mistral-large-latest` (default, ctx 262k, out 16k), `mistral/mistral-medium-3-5`, `mistral/mistral-small-latest`.
- NVIDIA: env `NVIDIA_API_KEY`; `--auth-choice nvidia-api-key`; refs có hai tầng "nvidia/": `nvidia/moonshotai/kimi-k2.6` (262k), `nvidia/deepseek-ai/deepseek-v4-pro` (262k), `nvidia/z-ai/glm-5.2` (202k), `nvidia/nvidia/nemotron-3-super-120b-a12b`. Model chậm có thể cần `timeoutSeconds` (xem docs).
- Cerebras: plugin `@openclaw/cerebras-provider`; `--auth-choice cerebras-api-key`; `cerebras/gpt-oss-120b`, `cerebras/gemma-4-31b` (default, preview).
- Groq: plugin `@openclaw/groq-provider`; `groq/openai/gpt-oss-120b`.
- OpenRouter: `--auth-choice openrouter-api-key`; ref `openrouter/<provider>/<model>:free`, ví dụ `openrouter/openai/gpt-oss-120b:free` (CHƯA kiểm chứng còn tồn tại). `openrouter/free` là router tự chọn model free có hỗ trợ tools (theo docs OpenRouter, chưa thử).

### Lệnh chuyển sang Mistral (khuyến nghị 1)

```bash
openclaw plugins install @openclaw/mistral-provider
export MISTRAL_API_KEY=...        # tạo tại console.mistral.ai (cần xác minh số điện thoại)
openclaw onboard --auth-choice mistral-api-key
openclaw models set mistral/mistral-large-latest
openclaw models list --provider mistral
```
Fallback gợi ý (config): `agents.defaults.model: { primary: "mistral/mistral-large-latest", fallbacks: ["nvidia/moonshotai/kimi-k2.6", "cerebras/gpt-oss-120b"] }` (tên khóa `fallbacks` cần đối chiếu docs concepts/model-providers, chưa kiểm tra).
Sau khi tạo key: vào Admin Console > Privacy, quyết định bật/tắt "Anonymous improvement data" (dữ liệu giả nên có thể giữ nguyên, ghi nhận trong STATUS).

## Điểm chưa chắc chắn

- Trang rate-limit của Groq không hiển thị riêng bảng Free; số liệu lấy từ bảng "base" + nguồn phụ khớp nhau. Mistral và NVIDIA không có trang giới hạn chính thức công khai, số liệu là từ nguồn phụ; cần xem Admin Console / dashboard sau khi có key.
- Chưa test thực tế tiếng Việt + tool calling của từng model; nên chạy 10-20 tin nhắn mẫu trước khi chốt.
- Danh sách OpenRouter :free không tra được từ nguồn chính thức (API/trang models không trả được qua công cụ tải trang).
- Việc opt-out training của Mistral có làm mất quyền dùng free hay không chưa xác nhận.
- Mistral có thể yêu cầu xác minh SĐT; NVIDIA/Mistral có thể thay đổi giới hạn bất kỳ lúc nào.

## Nguồn

Chính thức:
- https://console.groq.com/docs/rate-limits
- https://openrouter.ai/docs/api-reference/limits
- https://inference-docs.cerebras.ai/support/rate-limits
- https://docs.github.com/en/github-models/prototyping-with-ai-models (Models đã retire)
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training
- https://forums.developer.nvidia.com/t/nvidia-nim-faq/300317 (qua tìm kiếm)
- Docs OpenClaw local: C:/Users/vupdu/AppData/Roaming/npm/node_modules/openclaw/docs/providers/{groq,openrouter,cerebras,nvidia,mistral}.md

Nguồn phụ (blog/tổng hợp):
- https://aireiter.com/blog/best-free-ai-api
- https://benchlm.ai/free-tier/groq
- https://mintlify.com/cheahjs/free-llm-api-resources/providers/free/mistral-plateforme
- https://freellm.net/providers/nvidia-nim
- https://decodethefuture.org/?p=3676
- https://www.developersdigest.tech/models/data-retention/cerebras
- https://openrouter.ai/docs/guides/routing/routers/free-router.md
