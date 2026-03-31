# Hướng dẫn cấu hình GitHub Webhook với Jenkins

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Yêu cầu](#yêu-cầu)
3. [Cài đặt Plugin](#cài-đặt-plugin)
4. [Cấu hình Jenkins](#cấu-hình-jenkins)
5. [Cấu hình GitHub Webhook](#cấu-hình-github-webhook)
6. [Testing Webhook](#testing-webhook)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Tổng quan

**GitHub Webhook** cho phép GitHub tự động trigger Jenkins build khi có event xảy ra (push, pull request, etc.) thay vì phải poll Git repository định kỳ.

### Lợi ích của Webhook

- ✅ **Real-time builds** - Build ngay khi có push
- ✅ **Tiết kiệm tài nguyên** - Không cần poll Git liên tục
- ✅ **Faster feedback** - Developer biết kết quả build ngay lập tức
- ✅ **Scalable** - Hoạt động tốt với nhiều repositories

### Cách hoạt động

```
Developer Push Code → GitHub → Webhook → Jenkins → Trigger Build
```

1. Developer push code lên GitHub
2. GitHub gửi HTTP POST request đến Jenkins webhook URL
3. Jenkins nhận request và trigger build job tương ứng
4. Build chạy và báo status về GitHub

---

## Yêu cầu

### 1. Jenkins phải có Public URL

Webhook cần Jenkins URL có thể access từ internet:

**✅ Valid URLs:**
```
https://jenkins.example.com
http://jenkins.example.com:8080
https://my-jenkins-server.ngrok.io
```

**❌ Invalid URLs:**
```
http://localhost:8080          # Không access được từ internet
http://192.168.1.100:8080      # Private IP
http://127.0.0.1:8080          # Loopback
```

### 2. Giải pháp nếu Jenkins chạy local

#### Option A: ngrok (Khuyến nghị cho testing)

```bash
# Install ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Authenticate (cần account ngrok)
ngrok config add-authtoken YOUR_NGROK_TOKEN

# Expose Jenkins
ngrok http 8080

# Output:
# Forwarding: https://abc123.ngrok.io -> http://localhost:8080
```

**Webhook URL sẽ là:**
```
https://abc123.ngrok.io/github-webhook/
```

#### Option B: Cloudflare Tunnel

```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:8080
```

#### Option C: Deploy Jenkins trên Cloud

- AWS EC2
- Google Cloud
- DigitalOcean
- Heroku

### 3. GitHub Repository

- Repository có thể là public hoặc private
- Bạn phải có **Admin access** để thêm webhook

---

## Cài đặt Plugin

### Bước 1: Truy cập Plugin Manager

```
Jenkins Dashboard → Manage Jenkins → Manage Plugins
```

### Bước 2: Install Required Plugins

Vào tab **Available**, search và install:

#### 1. GitHub Plugin

```
Name: GitHub Plugin
Description: Integrates Jenkins with GitHub
Features:
  - GitHub webhook support
  - GitHub status notifications
  - GitHub authentication
```

#### 2. GitHub Integration Plugin (Optional but recommended)

```
Name: GitHub Integration Plugin
Description: Enhanced GitHub integration
Features:
  - Better webhook handling
  - Branch source support
  - Pull request builder
```

### Bước 3: Restart Jenkins

```bash
# Option 1: Via UI
Manage Jenkins → Prepare for Shutdown → Restart

# Option 2: Via URL
http://your-jenkins/safeRestart

# Option 3: Via command (if running in Docker)
docker restart jenkins
```

### Bước 4: Verify Installation

```
Manage Jenkins → Manage Plugins → Installed
Search: "GitHub" → Should see installed plugins
```

---

## Cấu hình Jenkins

### Bước 1: Configure GitHub Server

#### 1.1. Truy cập System Configuration

```
Manage Jenkins → Configure System
```

#### 1.2. Scroll đến GitHub Section

```
GitHub → Add GitHub Server → GitHub Server
```

#### 1.3. Cấu hình GitHub Server

```
Name: GitHub
API URL: https://api.github.com (default cho GitHub.com)
        https://github.example.com/api/v3 (cho GitHub Enterprise)

Credentials: [Add credentials nếu cần]
  - Kind: Secret text
  - Secret: GitHub Personal Access Token
  - ID: github-webhook-token
  - Description: GitHub Webhook Token

☑ Manage hooks (check box này)

Test connection → Should show: "Credentials verified for user XXX"
```

#### 1.4. Save Configuration

Click **Save** ở cuối trang.

---

### Bước 2: Configure Jenkins Job

#### Option A: Freestyle Job

**1. Job Configuration:**
```
Job → Configure
```

**2. Source Code Management:**
```
☑ Git
Repository URL: https://github.com/username/repo.git
Credentials: [Select credentials nếu private repo]
Branch Specifier: */main (hoặc */master)
```

**3. Build Triggers:**
```
☑ GitHub hook trigger for GITScm polling

Giải thích:
- Jenkins sẽ lắng nghe webhook từ GitHub
- Khi nhận được webhook, Jenkins sẽ trigger build
```

**4. Save**

#### Option B: Pipeline Job

**Jenkinsfile:**
```groovy
pipeline {
    agent any
    
    triggers {
        // Trigger build khi nhận webhook từ GitHub
        githubPush()
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
    
    post {
        success {
            echo '✅ Build successful!'
        }
        failure {
            echo '❌ Build failed!'
        }
    }
}
```

**Job Configuration:**
```
Definition: Pipeline script from SCM
SCM: Git
Repository URL: https://github.com/username/repo.git
Credentials: [Select if private]
Branch: */main
Script Path: Jenkinsfile

Build Triggers:
☑ GitHub hook trigger for GITScm polling
```

---

## Cấu hình GitHub Webhook

### Bước 1: Truy cập Repository Settings

```
1. Vào GitHub repository của bạn
2. Click "Settings" (tab phải cùng)
3. Click "Webhooks" (menu trái)
4. Click "Add webhook"
```

### Bước 2: Configure Webhook

#### Payload URL

**Format:**
```
http://JENKINS_URL/github-webhook/
https://JENKINS_URL/github-webhook/
```

**Ví dụ:**
```
https://jenkins.example.com/github-webhook/
https://abc123.ngrok.io/github-webhook/
http://my-jenkins.com:8080/github-webhook/
```

**⚠️ QUAN TRỌNG:**
- URL phải kết thúc bằng `/github-webhook/`
- Có dấu `/` ở cuối
- Không có space
- Phải accessible từ internet

#### Content type

```
☑ application/json (khuyến nghị)
□ application/x-www-form-urlencoded
```

#### Secret (Optional but recommended)

```
Secret: your-webhook-secret-key

Dùng để verify webhook request từ GitHub
Jenkins sẽ validate signature
```

**Generate secret:**
```bash
# Generate random secret
openssl rand -hex 20
# Output: 3a5f8c9d2e1b4a6c8f0d9e7b3a5c8d1e2f4a6b8c
```

#### Which events would you like to trigger this webhook?

**Option 1: Just the push event (Khuyến nghị)**
```
☑ Just the push event
- Trigger khi có push code
- Đơn giản, phù hợp hầu hết use cases
```

**Option 2: Let me select individual events**
```
☑ Pushes - Push code
☑ Pull requests - PR created/updated
☑ Pull request reviews - PR reviewed
☑ Releases - Release created
☑ Branch or tag creation
☑ Branch or tag deletion
```

**Option 3: Send me everything**
```
☑ Send me everything
- Nhận tất cả events
- Có thể gây nhiều builds không cần thiết
```

#### Active

```
☑ Active (check để enable webhook)
```

### Bước 3: Add Webhook

```
Click "Add webhook"
```

GitHub sẽ:
1. Tạo webhook
2. Gửi test ping request đến Jenkins
3. Hiển thị status (✓ hoặc ✗)

### Bước 4: Verify Webhook

**Check webhook status:**
```
Webhooks → Click vào webhook vừa tạo
→ Recent Deliveries tab
→ Should see ping event with ✓ (green checkmark)
```

**Response:**
```
Status: 200 OK
Response body: (empty or success message)
```

---

## Testing Webhook

### Test 1: Manual Trigger

**Trong GitHub Webhook Settings:**
```
1. Click vào webhook
2. Tab "Recent Deliveries"
3. Click "Redeliver" trên ping event
4. Confirm
```

**Expected:**
- Status: 200 OK
- Jenkins không trigger build (ping event không trigger build)

### Test 2: Push Code

**Push thay đổi lên GitHub:**
```bash
# Make a change
echo "# Test webhook" >> README.md

# Commit
git add README.md
git commit -m "Test webhook trigger"

# Push
git push origin main
```

**Expected:**
1. GitHub gửi webhook request
2. Jenkins nhận request
3. Jenkins trigger build job
4. Build chạy

**Verify trong Jenkins:**
```
Jenkins Dashboard → Job → Build History
→ Should see new build triggered by "GitHub push by username"
```

**Verify trong GitHub:**
```
Repository → Settings → Webhooks → Click webhook
→ Recent Deliveries
→ Should see push event with 200 OK
```

### Test 3: Check Console Output

```
Jenkins → Job → Build #X → Console Output

Should see:
"Started by GitHub push by username"
"Obtained Jenkinsfile from git https://github.com/..."
```

---

## Webhook Payload Example

### Push Event Payload

GitHub gửi JSON payload như sau:

```json
{
  "ref": "refs/heads/main",
  "before": "abc123...",
  "after": "def456...",
  "repository": {
    "id": 123456,
    "name": "repo-name",
    "full_name": "username/repo-name",
    "private": false,
    "html_url": "https://github.com/username/repo-name",
    "clone_url": "https://github.com/username/repo-name.git"
  },
  "pusher": {
    "name": "username",
    "email": "user@example.com"
  },
  "commits": [
    {
      "id": "def456...",
      "message": "Test webhook trigger",
      "timestamp": "2024-03-31T08:00:00Z",
      "author": {
        "name": "User Name",
        "email": "user@example.com"
      },
      "added": [],
      "removed": [],
      "modified": ["README.md"]
    }
  ]
}
```

Jenkins nhận payload này và trigger build.

---

## Advanced Configuration

### 1. Webhook với Secret Validation

**Trong GitHub:**
```
Secret: my-secret-key-123
```

**Trong Jenkins Job (Pipeline):**
```groovy
pipeline {
    agent any
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('Validate Webhook') {
            steps {
                script {
                    // Jenkins tự động validate signature
                    echo "Webhook validated successfully"
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
    }
}
```

### 2. Branch-specific Webhooks

**Jenkinsfile:**
```groovy
pipeline {
    agent any
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('Build') {
            when {
                branch 'main'
            }
            steps {
                echo 'Building main branch...'
                sh 'npm run build'
            }
        }
        
        stage('Build Dev') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Building develop branch...'
                sh 'npm run build:dev'
            }
        }
    }
}
```

### 3. Multiple Webhooks

Có thể tạo nhiều webhooks cho các purposes khác nhau:

```
Webhook 1: Push events → Trigger CI build
Webhook 2: Pull request events → Trigger PR checks
Webhook 3: Release events → Trigger deployment
```

### 4. Webhook với Multibranch Pipeline

**Job Type:** Multibranch Pipeline

**Configuration:**
```
Branch Sources: GitHub
Repository URL: https://github.com/username/repo.git
Credentials: [Select]

Behaviors:
☑ Discover branches
☑ Discover pull requests from origin
☑ Discover pull requests from forks

Build Configuration:
Mode: by Jenkinsfile
Script Path: Jenkinsfile

Scan Multibranch Pipeline Triggers:
☑ Periodically if not otherwise run
  Interval: 1 day

☑ Scan by webhook (requires GitHub plugin)
```

**GitHub Webhook:**
```
Payload URL: https://jenkins.example.com/github-webhook/
Events: 
  ☑ Pushes
  ☑ Pull requests
  ☑ Branch or tag creation
  ☑ Branch or tag deletion
```

---

## Troubleshooting

### Issue 1: Webhook shows error (red X)

**Symptoms:**
```
Recent Deliveries → Red X
Response: 404 Not Found or 500 Internal Server Error
```

**Solutions:**

1. **Check URL format:**
   ```
   ✅ https://jenkins.example.com/github-webhook/
   ❌ https://jenkins.example.com/github-webhook
   ❌ https://jenkins.example.com/webhook
   ```

2. **Verify Jenkins is accessible:**
   ```bash
   curl -I https://jenkins.example.com/github-webhook/
   # Should return 200 or 302, not 404
   ```

3. **Check GitHub Plugin installed:**
   ```
   Manage Jenkins → Manage Plugins → Installed
   Search: "GitHub Plugin"
   ```

4. **Check Jenkins logs:**
   ```
   Manage Jenkins → System Log
   Look for webhook-related errors
   ```

---

### Issue 2: Webhook delivers but build not triggered

**Symptoms:**
```
Webhook: 200 OK (green checkmark)
Jenkins: No build triggered
```

**Solutions:**

1. **Check Build Triggers enabled:**
   ```
   Job → Configure → Build Triggers
   ☑ GitHub hook trigger for GITScm polling (must be checked)
   ```

2. **Check repository URL matches:**
   ```
   Job SCM URL: https://github.com/username/repo.git
   Webhook repo: https://github.com/username/repo.git
   Must match exactly!
   ```

3. **Check branch matches:**
   ```
   Job branch specifier: */main
   Push was to: main
   Must match!
   ```

4. **Check Jenkins logs:**
   ```bash
   # Docker
   docker logs jenkins
   
   # System
   tail -f /var/log/jenkins/jenkins.log
   
   # Look for:
   "Received POST from https://github.com/..."
   "Triggering build for job..."
   ```

---

### Issue 3: "403 Forbidden" or "401 Unauthorized"

**Symptoms:**
```
Response: 403 Forbidden
No valid crumb was included in the request
```

**Solutions:**

1. **Disable CSRF protection for webhook (not recommended for production):**
   ```
   Manage Jenkins → Configure Global Security
   CSRF Protection → Uncheck "Prevent Cross Site Request Forgery exploits"
   ```

2. **Or configure webhook with authentication:**
   ```
   Payload URL: https://username:api-token@jenkins.example.com/github-webhook/
   ```

3. **Or use GitHub Plugin authentication:**
   ```
   Manage Jenkins → Configure System → GitHub
   Add GitHub Server with credentials
   ```

---

### Issue 4: ngrok URL changes

**Problem:**
```
Free ngrok URLs change every restart
Webhook URL becomes invalid
```

**Solutions:**

1. **Use ngrok paid plan:**
   ```
   Reserved domain: jenkins.ngrok.io (permanent)
   ```

2. **Update webhook URL after restart:**
   ```bash
   # Start ngrok
   ngrok http 8080
   
   # Get new URL
   # Update GitHub webhook with new URL
   ```

3. **Use Cloudflare Tunnel (free permanent URL):**
   ```bash
   cloudflared tunnel create jenkins
   cloudflared tunnel route dns jenkins jenkins.yourdomain.com
   ```

---

### Issue 5: Too many builds triggered

**Problem:**
```
Every commit triggers multiple builds
```

**Solutions:**

1. **Check for duplicate webhooks:**
   ```
   GitHub → Settings → Webhooks
   Delete duplicate webhooks
   ```

2. **Disable polling:**
   ```
   Job → Configure → Build Triggers
   ☐ Poll SCM (uncheck if using webhook)
   ```

3. **Use branch filters:**
   ```groovy
   when {
       branch 'main'
   }
   ```

---

### Issue 6: Webhook timeout

**Symptoms:**
```
Response: 504 Gateway Timeout
Jenkins takes too long to respond
```

**Solutions:**

1. **Optimize Jenkins:**
   ```
   - Increase memory
   - Clean old builds
   - Reduce concurrent builds
   ```

2. **Use async webhook processing:**
   ```
   GitHub sends webhook → Jenkins queues build → Returns 200 immediately
   ```

---

## Debugging Webhooks

### 1. Check GitHub Webhook Deliveries

```
Repository → Settings → Webhooks → Click webhook
→ Recent Deliveries

For each delivery:
- Request: Headers, Payload
- Response: Status code, Headers, Body
- Redeliver: Test again
```

### 2. Check Jenkins Webhook Log

**Enable webhook logging:**
```
Manage Jenkins → System Log → Add new log recorder

Name: GitHub Webhook
Loggers:
  - com.cloudbees.jenkins.GitHubPushTrigger (ALL)
  - org.jenkinsci.plugins.github.webhook (ALL)

Save
```

**View logs:**
```
Manage Jenkins → System Log → GitHub Webhook
```

### 3. Test with curl

**Simulate webhook:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/main","repository":{"url":"https://github.com/username/repo"}}' \
  https://jenkins.example.com/github-webhook/
```

### 4. Use webhook.site for testing

```
1. Go to https://webhook.site
2. Copy unique URL
3. Add as GitHub webhook
4. Push code
5. See request details in webhook.site
6. Verify payload is correct
7. Then use real Jenkins URL
```

---

## Best Practices

### 1. ✅ Use HTTPS

```
✅ https://jenkins.example.com/github-webhook/
❌ http://jenkins.example.com/github-webhook/
```

### 2. ✅ Use Webhook Secret

```
Generate strong secret:
openssl rand -hex 32

Add to GitHub webhook
Jenkins validates signature automatically
```

### 3. ✅ Limit Webhook Events

```
☑ Just the push event (recommended)
□ Send me everything (too many requests)
```

### 4. ✅ Monitor Webhook Health

```
Regularly check:
- Recent Deliveries (should be green)
- Response times (should be < 5s)
- Failed deliveries (investigate immediately)
```

### 5. ✅ Use Branch Filters

```groovy
when {
    anyOf {
        branch 'main'
        branch 'develop'
        branch 'release/*'
    }
}
```

### 6. ✅ Implement Retry Logic

GitHub retries failed webhooks automatically:
- Retry after 1 minute
- Retry after 5 minutes
- Retry after 15 minutes

### 7. ✅ Document Webhook Configuration

```
Keep record of:
- Webhook URL
- Secret (in secure location)
- Events configured
- Jobs affected
```

### 8. ✅ Test Before Production

```
1. Test with feature branch
2. Verify build triggers correctly
3. Check logs
4. Then enable for main branch
```

---

## Security Considerations

### 1. Validate Webhook Signature

GitHub signs webhooks với secret:
```
X-Hub-Signature-256: sha256=...
```

Jenkins GitHub Plugin validates automatically.

### 2. Restrict Webhook Access

```
Jenkins Security:
- Enable authentication
- Use API tokens
- Restrict anonymous access
```

### 3. Use Firewall Rules

```bash
# Allow only GitHub IPs
# GitHub webhook IPs: https://api.github.com/meta

iptables -A INPUT -s 140.82.112.0/20 -p tcp --dport 8080 -j ACCEPT
iptables -A INPUT -s 143.55.64.0/20 -p tcp --dport 8080 -j ACCEPT
```

### 4. Monitor Webhook Activity

```
- Check Recent Deliveries regularly
- Alert on failed webhooks
- Log all webhook requests
```

---

## Example: Complete Setup

### 1. Jenkins Job (Jenkinsfile)

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "🔔 Triggered by GitHub webhook"
                checkout scm
                sh 'git log -1'
            }
        }
        
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying to production...'
                sh './deploy.sh'
            }
        }
    }
    
    post {
        success {
            echo '✅ Build successful - triggered by webhook'
        }
        failure {
            echo '❌ Build failed'
        }
    }
}
```

### 2. GitHub Webhook Configuration

```
Payload URL: https://jenkins.example.com/github-webhook/
Content type: application/json
Secret: [your-secret-key]
Events: Just the push event
Active: ✓
```

### 3. Test Flow

```bash
# 1. Make change
echo "test" >> README.md

# 2. Commit
git add README.md
git commit -m "Test webhook"

# 3. Push
git push origin main

# 4. GitHub sends webhook → Jenkins triggers build
# 5. Check Jenkins for new build
```

---

## 📚 Tài liệu tham khảo

- [GitHub Webhooks Documentation](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [Jenkins GitHub Plugin](https://plugins.jenkins.io/github/)
- [ngrok Documentation](https://ngrok.com/docs)

---

**Webhook setup hoàn tất! Bây giờ mỗi khi push code, Jenkins sẽ tự động build! 🚀**
