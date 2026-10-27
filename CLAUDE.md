@AGENTS.md

## Riêng cho Claude Code

### Subagent của dự án (`.claude/agents/`)

Main context giữ vai trò điều phối: đọc [STATUS.md](STATUS.md), quyết định bước tiếp theo, giao việc cho subagent (câu hỏi cụ thể + bằng chứng đã có), tổng hợp kết quả, cập nhật STATUS.md. Không tự đọc nguyên các file doc hay log lớn.

| Agent | Dùng khi |
| --- | --- |
| `zalo-doc-reader` | Cần tra cứu API Zalo Bot, webhook, giới hạn, cấu hình kênh Zalo của OpenClaw. Agent chỉ đọc trong `zalo-doc/`, trả lời kèm trích dẫn file:dòng |
| `web-researcher` | Cần thông tin chưa có trong `zalo-doc/`: OpenClaw (skill, tool, cấu hình model), Google Sheets API, giá và hạn mức của mô hình AI... Kết quả lưu vào `research/` |
| `log-reader` | Bot lỗi hoặc không trả lời: đọc log gateway OpenClaw hoặc log script, trả về đoạn log liên quan kèm timestamp và giả thuyết nguyên nhân |
| `rubric-reviewer` | Chấm thử bản tóm tắt, kịch bản video, hướng dẫn nhân rộng hoặc kế hoạch theo rubric cuộc thi, chỉ ra chỗ còn thiếu để lên mức điểm cao hơn |

Các file nhỏ đọc thẳng ở main context: STATUS.md, AGENTS.md, file .md trong `plan/`, `zalo-doc/README.md`.

### File trạng thái

[STATUS.md](STATUS.md) là trạng thái dự án, đọc ở đầu mỗi phiên và cập nhật sau mỗi quyết định hoặc phát hiện quan trọng. Giữ file dưới khoảng 200 dòng. Phân tích chi tiết thì tách sang `research/` hoặc `evidence/` rồi để link lại.
