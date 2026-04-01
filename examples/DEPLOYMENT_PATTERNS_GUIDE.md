# Deployment Patterns - Giải thích & So sánh

## 📋 Tổng quan 5 Patterns

| Pattern | Downtime | Rollback | Risk | Chi phí hạ tầng |
|---|---|---|---|---|
| Blue/Green | ❌ Zero | ✅ Tức thì | Thấp | Cao (2x servers) |
| Canary | ❌ Zero | ✅ Nhanh | Rất thấp | Trung bình |
| Rolling | ❌ Zero | ⚠️ Chậm | Trung bình | Thấp |
| A/B Testing | ❌ Zero | ✅ Nhanh | Thấp | Trung bình |
| Feature Toggle | ❌ Zero | ✅ Tức thì (flag off) | Rất thấp | Thấp |

---

## 1. 🔵🟢 Blue/Green Deployment

### Khái niệm

Duy trì **2 môi trường giống hệt nhau** chạy song song:
- **Blue** = môi trường đang chạy, đang nhận traffic thật (active)
- **Green** = môi trường mới, deploy version mới vào đây (inactive)

Khi Green sẵn sàng → **chuyển toàn bộ traffic** từ Blue sang Green trong một lần.
Blue lúc này trở thành inactive và giữ nguyên để rollback nếu cần.

### Luồng hoạt động

```
VERSION 1 đang chạy:
  [BLUE: v1] ←── 100% traffic ←── Users
  [GREEN: idle]

Deploy VERSION 2:
  [BLUE: v1]  ←── 100% traffic ←── Users (vẫn chạy bình thường)
  [GREEN: v2] ← deploy vào đây (không ảnh hưởng production)

Switch traffic:
  [BLUE: v1]  (standby, rollback nếu cần)
  [GREEN: v2] ←── 100% traffic ←── Users

Rollback (nếu cần):
  [BLUE: v1]  ←── 100% traffic ←── Users (switch lại)
  [GREEN: v2] (offline)
```

### Ưu điểm
- ✅ Zero downtime
- ✅ Rollback tức thì (chỉ cần switch DNS/load balancer)
- ✅ Test môi trường production thật trước khi go-live
- ✅ Deployment đơn giản, an toàn

### Nhược điểm
- ❌ Chi phí gấp đôi (2 môi trường đầy đủ)
- ❌ Database migrations phức tạp (2 app version cùng dùng 1 DB)
- ❌ Không phù hợp nếu tài nguyên hạn chế

### Khi nào dùng
- Production với yêu cầu zero downtime
- Hệ thống quan trọng, không chịu được downtime
- Cần rollback nhanh

---

## 2. 🐦 Canary Deployment

### Khái niệm

Deploy version mới **cho một phần nhỏ** người dùng/servers trước, rồi **tăng dần** tỷ lệ traffic sang version mới sau khi kiểm tra ổn định.

Tên gọi "Canary" xuất phát từ mỏ than — thợ mỏ dùng chim canary để phát hiện khí độc. Nếu chim chết → nguy hiểm. Tương tự, nếu version mới lỗi → chỉ ảnh hưởng nhóm nhỏ user.

### Luồng hoạt động

```
Bước 1: Deploy v2 cho 5% traffic
  [v1: 95%] ←─┐
  [v2:  5%] ←─┴── Users

Bước 2: Monitor — nếu OK, tăng lên 25%
  [v1: 75%] ←─┐
  [v2: 25%] ←─┴── Users

Bước 3: Tăng lên 50%
  [v1: 50%] ←─┐
  [v2: 50%] ←─┴── Users

Bước 4: Full rollout 100%
  [v2: 100%] ←── Users
  [v1: retired]

Rollback (nếu có lỗi ở bất kỳ bước nào):
  [v1: 100%] ←── Users
  [v2: removed]
```

### Ưu điểm
- ✅ Rủi ro rất thấp — lỗi chỉ ảnh hưởng nhóm nhỏ
- ✅ Có thể monitor thực tế trước full rollout
- ✅ Rollback nhanh
- ✅ Thu thập metrics thật từ production

### Nhược điểm
- ❌ Quá trình deploy kéo dài (nhiều bước)
- ❌ 2 version chạy song song → phức tạp khi có DB schema changes
- ❌ Cần hệ thống routing/load balancer hỗ trợ phân chia traffic

### Khi nào dùng
- Release lớn, nhiều thay đổi
- Cần validate performance dưới load thật
- Muốn giảm thiểu rủi ro tối đa

---

## 3. 🔄 Rolling Deployment

### Khái niệm

Update **từng server/instance một** trong cluster. Tại mỗi thời điểm, load balancer **không gửi traffic** đến server đang được update. Sau khi update xong và health check pass → mới đưa server đó vào lại rotation.

### Luồng hoạt động

```
Cluster 4 servers, deploy v2:

Bước 1: Update server 1
  [S1: updating...] ← không nhận traffic
  [S2: v1] ←─┐
  [S3: v1] ←─┤── Users
  [S4: v1] ←─┘

Bước 2: S1 xong, update S2
  [S1: v2] ←─┐
  [S2: updating...] ← không nhận traffic
  [S3: v1] ←─┤── Users
  [S4: v1] ←─┘

Bước 3: S2 xong, update S3...
  [S1: v2] ←─┐
  [S2: v2] ←─┤── Users
  [S3: updating...]
  [S4: v1] ←─┘

Bước 4: Hoàn thành
  [S1: v2] ←─┐
  [S2: v2] ←─┤── Users
  [S3: v2] ←─┤
  [S4: v2] ←─┘
```

### Ưu điểm
- ✅ Zero downtime
- ✅ Tiết kiệm tài nguyên (không cần 2x servers như Blue/Green)
- ✅ Phù hợp với Kubernetes (built-in rolling update)

### Nhược điểm
- ❌ 2 version chạy song song trong quá trình deploy → API compatibility issues
- ❌ Rollback phức tạp hơn (phải re-deploy lại từng server)
- ❌ Nếu lỗi phát hiện muộn, đã update nhiều server

### Khi nào dùng
- Kubernetes workloads (strategy: RollingUpdate mặc định)
- Microservices với nhiều instances
- Khi tài nguyên hạn chế

---

## 4. 🧪 A/B Testing

### Khái niệm

Chạy **2 version song song**, mỗi version phục vụ **một nhóm user khác nhau** dựa trên điều kiện (địa lý, thiết bị, user segment...). Mục đích **thu thập dữ liệu** để quyết định version nào tốt hơn, không phải để deploy dần.

### Luồng hoạt động

```
Users được phân nhóm theo điều kiện:

[Version A] ←── Users nhóm A (50%) — ví dụ: user mới
     ↓ Collect metrics
[Version B] ←── Users nhóm B (50%) — ví dụ: user cũ

So sánh kết quả:
  - Conversion rate
  - Click-through rate
  - Bounce rate
  - Performance metrics

→ Chọn version thắng → Full rollout
```

### Khác biệt so với Canary

| | Canary | A/B Testing |
|---|---|---|
| Mục đích | Giảm rủi ro deploy | So sánh, thu thập data |
| Traffic split | Tăng dần (5→25→50→100%) | Cố định (50/50) |
| Thời gian | Ngắn (hours/days) | Dài (days/weeks) |
| Quyết định | Có lỗi không? | Version nào tốt hơn? |

### Ưu điểm
- ✅ Quyết định dựa trên data thực tế
- ✅ Giảm thiểu rủi ro khi thay đổi UX/features
- ✅ Test nhiều hypothesis song song

### Nhược điểm
- ❌ Cần hệ thống phân tích (analytics) phức tạp
- ❌ Cần sample size đủ lớn để có kết quả có ý nghĩa thống kê
- ❌ Maintain 2 code path song song

### Khi nào dùng
- Thay đổi UI/UX
- New feature validation
- Pricing experiments
- Marketing campaigns

---

## 5. 🎚️ Feature Toggle (Feature Flag)

### Khái niệm

Deploy code với **tính năng mới bị ẩn** (disabled). Khi muốn bật tính năng → thay đổi config/flag, **không cần deploy lại**. Chỉ user có flag được bật mới thấy tính năng mới.

### Luồng hoạt động

```
Deploy code mới (feature hidden):
  if (featureFlag.isEnabled("new-checkout")) {
      showNewCheckout();        // Feature mới — disabled
  } else {
      showOldCheckout();        // Feature cũ — hiển thị cho tất cả
  }

Bật flag cho internal users:
  - QA team: ON
  - Developers: ON
  - Public: OFF

Bật flag cho beta users:
  - Beta users: ON
  - General public: OFF

Full rollout:
  - Everyone: ON
```

### Ưu điểm
- ✅ Deploy và release là 2 sự kiện riêng biệt
- ✅ Rollback tức thì — chỉ cần tắt flag
- ✅ Không cần deploy lại khi bật/tắt feature
- ✅ Hỗ trợ trunk-based development
- ✅ Test trong production với nhóm chọn lọc

### Nhược điểm
- ❌ Code phức tạp hơn (nhiều if/else)
- ❌ Technical debt nếu không cleanup flag cũ
- ❌ Cần hệ thống quản lý flags (LaunchDarkly, etc.)

### Khi nào dùng
- Feature lớn, phát triển nhiều sprint
- A/B testing kết hợp với toggle
- Kill switch cho tính năng rủi ro
- Gradual rollout theo user segment

---

## 📊 Bảng so sánh chi tiết

```
┌──────────────┬──────────┬──────────┬─────────┬──────────┬──────────────┐
│   Pattern    │ Downtime │ Rollback │  Risk   │ Infra    │ Complexity   │
├──────────────┼──────────┼──────────┼─────────┼──────────┼──────────────┤
│ Blue/Green   │ Zero     │ Instant  │ Low     │ 2x cost  │ Medium       │
│ Canary       │ Zero     │ Fast     │ Minimal │ +10-20%  │ High         │
│ Rolling      │ Zero     │ Slow     │ Medium  │ Normal   │ Low          │
│ A/B Testing  │ Zero     │ Fast     │ Low     │ +50%     │ Very High    │
│ Feature Flag │ Zero     │ Instant  │ Minimal │ Normal   │ Medium       │
└──────────────┴──────────┴──────────┴─────────┴──────────┴──────────────┘
```

---

## Jenkinsfile Examples

| Pattern | File |
|---|---|
| Blue/Green | [`Jenkinsfile.blue-green`](Jenkinsfile.blue-green) |
| Canary | [`Jenkinsfile.canary`](Jenkinsfile.canary) |
| Rolling | [`Jenkinsfile.rolling`](Jenkinsfile.rolling) |
| A/B Testing | [`Jenkinsfile.ab-testing`](Jenkinsfile.ab-testing) |
| Feature Toggle | [`Jenkinsfile.feature-toggle`](Jenkinsfile.feature-toggle) |
