// Plugin OpenClaw "Trợ lý GVCN": các tool đọc/ghi hồ sơ học sinh qua Apps Script web app.
//
// Bảo mật: ID người gửi lấy từ ctx.requesterSenderId (OpenClaw cấp, AI không sửa được) và gửi
// sang Apps Script; Apps Script quyết định quyền (phụ huynh chỉ thấy con mình, chỉ GVCN được ghi).
// Tool chỉ được tạo trong lượt chat Zalo có sender ID; mọi trường hợp khác trả null (fail closed).
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

// JSON Schema tối giản (thay cho typebox, để plugin không cần dependency ngoài)
const Type = {
  Object: (properties, opts = {}) => ({
    type: "object",
    properties,
    required: Object.keys(properties).filter((k) => !properties[k][OPTIONAL]),
    ...opts,
  }),
  Optional: (schema) => ({ ...schema, [OPTIONAL]: true }),
  String: (opts = {}) => ({ type: "string", ...opts }),
  Number: (opts = {}) => ({ type: "number", ...opts }),
  Literal: (v) => ({ const: v }),
  Union: (anyOf) => ({ enum: anyOf.map((x) => x.const) }),
};
const OPTIONAL = Symbol("optional");

// Mã xác nhận ghi -> lượt chat đã tạo ra nó. Không cho xác nhận ngay trong cùng lượt,
// để AI buộc phải hỏi GVCN và chờ GVCN trả lời ở tin nhắn sau.
const pendingByCode = new Map();

export default definePluginEntry({
  id: "tro-ly-gvcn",
  name: "Trợ lý GVCN",
  description: "Tra cứu và cập nhật hồ sơ học sinh (Google Sheets) qua Zalo, có phân quyền theo người gửi",
  register(api) {
    const cfg = api.pluginConfig || {};
    const url = cfg.appsScriptUrl || process.env.GVCN_APPS_SCRIPT_URL;
    const secret = cfg.secret || process.env.GVCN_APPS_SCRIPT_SECRET;

    async function goi(action, zaloId, params) {
      if (!url || !secret) return { ok: false, loi: "Plugin chưa được cấu hình appsScriptUrl/secret" };
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret, action, zalo_id: zaloId, params }),
          redirect: "follow",
          signal: AbortSignal.timeout(30000),
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          api.logger.warn?.(`[tro-ly-gvcn] Apps Script trả về không phải JSON (HTTP ${res.status})`);
          return { ok: false, loi: "Máy chủ dữ liệu trả lời không hợp lệ, thử lại sau." };
        }
        if (Array.isArray(data.thong_bao_gvcn)) {
          await guiThongBao(data.thong_bao_gvcn);
          delete data.thong_bao_gvcn;
        }
        return data;
      } catch (err) {
        api.logger.warn?.(`[tro-ly-gvcn] Lỗi gọi Apps Script: ${err?.message || err}`);
        return { ok: false, loi: "Không kết nối được máy chủ dữ liệu, thử lại sau." };
      }
    }

    // Báo tin cho GVCN (vd. có phụ huynh vừa liên kết) bằng Zalo Bot API; lỗi gửi không làm hỏng thao tác chính.
    async function guiThongBao(list) {
      const token = process.env.ZALO_BOT_TOKEN;
      if (!token) return;
      for (const m of list) {
        try {
          await fetch(`https://bot-api.zaloplatforms.com/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: m.chat_id, text: m.text }),
            signal: AbortSignal.timeout(15000),
          });
        } catch (err) {
          api.logger.warn?.(`[tro-ly-gvcn] Không gửi được thông báo GVCN: ${err?.message || err}`);
        }
      }
    }

    const ketQua = (obj) => ({ content: [{ type: "text", text: JSON.stringify(obj) }], details: obj });

    const tool = (name, description, parameters, run) =>
      api.registerTool(
        (ctx) => {
          const zaloId = ctx?.requesterSenderId;
          if (!zaloId || ctx?.messageChannel !== "zalo") return null;
          const turn = Symbol(name);
          return {
            name,
            description,
            parameters,
            async execute(_id, params) {
              return ketQua(await run(String(zaloId).toLowerCase(), params || {}, turn));
            },
          };
        },
        { name },
      );

    tool(
      "vai_tro_cua_toi",
      "Gọi đầu tiên ở mọi tin nhắn. Cho biết người đang nhắn là ai: 'gvcn', 'phu_huynh' hay 'chua_lien_ket'. Với phụ huynh, trả kèm luôn hồ sơ đầy đủ của con (điểm, tổng hợp theo môn, hoạt động, sự kiện) trong 'ho_so', nên thường không cần gọi thêm tra_cuu_con.",
      Type.Object({}),
      // Gộp 2 bước (vai trò + hồ sơ con) vào 1 lượt gọi model để tiết kiệm hạn mức model.
      async (zaloId) => {
        const vt = await goi("vai_tro", zaloId, {});
        if (vt?.ok && vt.vai_tro === "phu_huynh") {
          const hs = await goi("tra_cuu_con", zaloId, {});
          if (hs?.ok) return { ...vt, ho_so: hs.ho_so, su_kien: hs.su_kien };
        }
        return vt;
      },
    );

    tool(
      "lien_ket_phu_huynh",
      "Liên kết tài khoản Zalo của người đang nhắn với hồ sơ học sinh, bằng số điện thoại phụ huynh đã đăng ký với GVCN. Chỉ dùng khi vai trò là 'chua_lien_ket' và người dùng đã cung cấp số điện thoại.",
      Type.Object({
        so_dien_thoai: Type.String({ description: "Số điện thoại người dùng vừa nhắn, giữ nguyên như họ gõ" }),
        ngay_sinh_con: Type.Optional(Type.String({ description: "Ngày sinh của con (DD/MM/YYYY), chỉ khi hệ thống yêu cầu xác minh" })),
      }),
      (zaloId, p) => goi("lien_ket", zaloId, p),
    );

    tool(
      "tra_cuu_con",
      "Phụ huynh tra cứu hồ sơ của con mình: điểm học kỳ hiện tại (kèm tổng hợp theo môn), hoạt động, khen/nhắc nhở, vắng, và sự kiện sắp tới của lớp/trường. Hệ thống tự giới hạn chỉ trả dữ liệu của con người đang nhắn.",
      Type.Object({
        ma_hs: Type.Optional(Type.String({ description: "Mã học sinh, chỉ cần khi phụ huynh có nhiều con trong lớp" })),
        chu_de: Type.Optional(Type.String({ description: "Tóm tắt ngắn câu hỏi của phụ huynh, để ghi nhật ký" })),
      }),
      (zaloId, p) => goi("tra_cuu_con", zaloId, p),
    );

    tool(
      "gv_xem_lop",
      "Chỉ cho GVCN: xem hồ sơ cả lớp hoặc một em (điểm, tổng hợp theo môn, hoạt động, tình trạng liên kết phụ huynh), sự kiện và thống kê sử dụng. Dùng để trả lời GVCN và lập báo cáo họp phụ huynh.",
      Type.Object({
        ma_hs: Type.Optional(Type.String({ description: "Mã học sinh, bỏ trống để xem cả lớp" })),
        tu_ngay: Type.Optional(Type.String({ description: "Chỉ lấy điểm/hoạt động từ ngày này (YYYY-MM-DD)" })),
      }),
      (zaloId, p) => goi("gv_xem_lop", zaloId, p),
    );

    tool(
      "gv_ghi",
      "Chỉ cho GVCN: ghi điểm, hoạt động hoặc sự kiện. Bắt buộc 2 bước: (1) gọi KHÔNG có ma_xac_nhan để nhận bản xem trước, đọc lại cho GVCN và hỏi 'Cô xác nhận ghi không?'; (2) chỉ khi GVCN trả lời đồng ý ở tin nhắn sau mới gọi lại với ma_xac_nhan. Không được tự xác nhận.",
      Type.Object({
        bang: Type.Union([Type.Literal("Diem"), Type.Literal("HoatDong"), Type.Literal("SuKien")]),
        du_lieu: Type.Object(
          {
            ma_hs: Type.Optional(Type.String()),
            ho_ten: Type.Optional(Type.String({ description: "Tên học sinh nếu không biết mã" })),
            mon: Type.Optional(Type.String()),
            loai: Type.Optional(Type.String({ description: "Diem: TX/GK/CK. HoatDong: khen/nhac_nho/hoat_dong/vang" })),
            hinh_thuc: Type.Optional(Type.String({ description: "Miệng, 15 phút, Thực hành, Dự án..." })),
            diem: Type.Optional(Type.Number()),
            ngay: Type.Optional(Type.String({ description: "YYYY-MM-DD hoặc DD/MM/YYYY, bỏ trống = hôm nay" })),
            nhan_xet: Type.Optional(Type.String()),
            noi_dung: Type.Optional(Type.String()),
            tieu_de: Type.Optional(Type.String()),
            gio: Type.Optional(Type.String()),
            mo_ta: Type.Optional(Type.String()),
            pham_vi: Type.Optional(Type.String({ description: "SuKien: lop hoặc truong" })),
          },
          { additionalProperties: false },
        ),
        ma_xac_nhan: Type.Optional(Type.String({ description: "Mã từ bản xem trước, chỉ gửi sau khi GVCN đã đồng ý" })),
      }),
      async (zaloId, p, turn) => {
        if (p.ma_xac_nhan && pendingByCode.get(p.ma_xac_nhan) === turn) {
          return { ok: false, loi: "Chưa được xác nhận: phải đọc bản xem trước cho GVCN và chờ GVCN trả lời đồng ý ở tin nhắn tiếp theo." };
        }
        const r = await goi("gv_ghi", zaloId, p);
        if (r?.ok && r.ma_xac_nhan) pendingByCode.set(r.ma_xac_nhan, turn);
        if (r?.ok && r.da_ghi) pendingByCode.delete(p.ma_xac_nhan);
        return r;
      },
    );
  },
});
