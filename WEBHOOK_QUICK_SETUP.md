# GitHub Webhook - Quick Setup (5 phút)

## 🚀 Setup nhanh

### 1️⃣ Cài đặt GitHub Plugin (1 phút)

```
Jenkins → Manage Jenkins → Manage Plugins → Available
→ Search: "GitHub Plugin"
→ Install without restart
```

### 2️⃣ Cấu hình Jenkins Job (1 phút)

```
Job → Configure → Build Triggers
→ ☑ GitHub hook trigger for GITScm polling
→ Save
```

### 3️⃣ Lấy Jenkins Webhook URL (30 giây)

**Format:**
```
https://YOUR_JENKINS_URL/github-webhook/
```

**Ví dụ:**
```
https://jenkins.example.com/github-webhook/
https://abc123.ngrok.io/github-webhook/
```

**⚠️ Nếu Jenkins chạy local, dùng ngrok:**
```bash
ngrok http 8080
# Copy HTTPS URL: https://abc123.ngrok.io
# Webhook URL: https://abc123.ngrok.io/github-webhook/
```

### 4️⃣ Thêm Webhook vào GitHub (2 phút)

```
GitHub Repository → Settings → Webhooks → Add webhook

Payload URL: https://YOUR_JENKINS_URL/github-webhook/
Content type: application/json
Secret: (optional - để trống cho testing)
Events: ☑ Just the push event
Active: ☑

→ Add webhook
```

### 5️⃣ Test! (30 giây)

```bash
# Push code
echo "test webhook" >> README.md
git add README.md
git commit -m "Test webhook"
git push

# Check Jenkins → Should see new build!
```

---

## ✅ Checklist

- [ ] GitHub Plugin installed
- [ ] Build trigger enabled in job
- [ ] Jenkins URL accessible from internet
- [ ] Webhook added to GitHub
- [ ] Webhook shows green checkmark
- [ ] Test push triggers build

---

## 🐛 Lỗi thường gặp

### Webhook shows red X

**Fix:**
```
1. Check URL có /github-webhook/ ở cuối
2. Check Jenkins accessible: curl -I https://jenkins-url/github-webhook/
3. Check GitHub Plugin installed
```

### Build không trigger

**Fix:**
```
1. Job → Configure → Build Triggers
   → ☑ GitHub hook trigger for GITScm polling
2. Check repository URL match
3. Check branch match (*/main)
```

### Jenkins chạy local

**Fix:**
```bash
# Install ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Run
ngrok http 8080

# Use ngrok URL: https://abc123.ngrok.io/github-webhook/
```

---

## 📚 Chi tiết hơn?

Xem [`GITHUB_WEBHOOK_GUIDE.md`](GITHUB_WEBHOOK_GUIDE.md) để có:
- Hướng dẫn chi tiết từng bước
- Advanced configuration
- Security best practices
- Troubleshooting đầy đủ

---

**Done! Mỗi lần push code, Jenkins sẽ tự động build! 🎉**
