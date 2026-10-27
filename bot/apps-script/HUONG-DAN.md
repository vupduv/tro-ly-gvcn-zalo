# Cài Apps Script cho file Google Sheets của lớp

Mỗi file Sheets chỉ làm một lần, mất khoảng 5 phút. Phải dùng **tài khoản Google sở hữu file Sheets**. Nên làm trên máy tính, trình duyệt Chrome.

## Bước 0. Có file Google Sheets của lớp

1. Vào https://drive.google.com, bấm **+ Mới → Tải tệp lên**, chọn file Excel của lớp (bản demo: `data/private/HoSo-12B1-demo.xlsx`).
2. Bấm đúp file vừa tải lên để mở, rồi chọn menu **Tệp → Lưu dưới dạng Google Trang tính**. Một tab mới mở ra: **đây là file sẽ dùng**. Kiểm tra có đủ 7 tab ở dưới cùng: `CauHinh`, `HocSinh`, `PhuHuynh`, `Diem`, `HoatDong`, `SuKien`, `NhatKy`.

## Bước 1. Dán mã

1. Trong file Google Trang tính, chọn menu **Tiện ích mở rộng → Apps Script**. Một tab mới mở trình soạn mã, có sẵn file `Mã.gs` (hoặc `Code.gs`) chứa vài dòng `function myFunction()`.
2. Bấm vào vùng mã, **Ctrl+A** rồi **Delete** để xoá hết.
3. Mở file [Code.gs](Code.gs) của dự án (trong VS Code), **Ctrl+A**, **Ctrl+C**, quay lại trình duyệt, **Ctrl+V**.
4. Bấm **Ctrl+S** (hoặc biểu tượng đĩa mềm) để lưu. Đổi tên dự án ở góc trên bên trái (đang là "Dự án không có tiêu đề") thành `Tro ly GVCN 12B1`.

## Bước 2. Triển khai thành ứng dụng web

1. Góc trên bên phải bấm nút xanh **Triển khai → Tùy chọn triển khai mới**.
2. Cạnh chữ "Chọn loại" bấm **biểu tượng bánh răng → Ứng dụng web**.
3. Điền:
   - **Mô tả**: `v1`
   - **Thực thi với tư cách**: **Tôi** (email của bạn)
   - **Người có quyền truy cập**: **Bất kỳ ai**
4. Bấm **Triển khai**.
5. Bấm **Cấp quyền truy cập**, chọn tài khoản Google của bạn.
   - Nếu hiện "Google chưa xác minh ứng dụng này": bấm **Nâng cao**, rồi **Đi tới Tro ly GVCN 12B1 (không an toàn)**. Đây là mã của chính bạn, chỉ truy cập file Sheets này.
   - Bấm **Cho phép**.
6. Màn hình "Đã triển khai" hiện **URL ứng dụng web** dạng `https://script.google.com/macros/s/AKfy…/exec`. Bấm **Sao chép**.

## Bước 3. Đưa URL cho bot

1. Mở file `.env` ở thư mục gốc dự án, tìm dòng `GVCN_APPS_SCRIPT_URL=`, dán URL vào ngay sau dấu `=` (không có dấu cách), lưu file.
2. Kiểm tra: dán URL vào trình duyệt. Thấy dòng `{"ok":true,"dich_vu":"Trợ lý GVCN",...}` là được.

Không cần nhập khoá bí mật: lần đầu bot gọi tới, Apps Script tự lưu khoá của bot và từ đó chỉ chấp nhận đúng khoá này.

## Khi sửa Code.gs sau này

Dán mã mới, lưu, rồi **Triển khai → Quản lý các bản triển khai → biểu tượng bút chì → Phiên bản: Phiên bản mới → Triển khai**. URL giữ nguyên, không phải sửa `.env`.
