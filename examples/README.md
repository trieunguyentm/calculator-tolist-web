# Jenkinsfile Examples

Thư mục này chứa các ví dụ Jenkinsfile cho các use cases khác nhau.

## 📁 Danh sách Examples

### 1. `Jenkinsfile.basic`
**Jenkinsfile cơ bản nhất** cho React application.

**Bao gồm:**
- ✅ Checkout code
- ✅ Install dependencies
- ✅ Run tests
- ✅ Build application
- ✅ Archive artifacts
- ✅ Basic post actions

**Phù hợp cho:**
- Người mới bắt đầu
- Dự án đơn giản
- Quick prototype

**Sử dụng:**
```bash
cp examples/Jenkinsfile.basic Jenkinsfile
```

---

### 2. `Jenkinsfile.advanced`
**Jenkinsfile nâng cao** với nhiều features.

**Bao gồm:**
- ✅ Parameters (user input)
- ✅ Environment variables
- ✅ Parallel stages (lint + security audit)
- ✅ Conditional deployment
- ✅ Code quality checks
- ✅ Coverage reports
- ✅ Notifications (Slack, Email)
- ✅ Multiple environments (dev, staging, production)

**Phù hợp cho:**
- Production applications
- Team projects
- Complex workflows

**Sử dụng:**
```bash
cp examples/Jenkinsfile.advanced Jenkinsfile
```

---

### 3. `Jenkinsfile.multibranch`
**Multi-branch Pipeline** - Tự động xử lý các branches khác nhau.

**Bao gồm:**
- ✅ Branch-specific deployments
- ✅ Feature branches → Dev
- ✅ Develop branch → Staging
- ✅ Main branch → Production
- ✅ Tag-based releases
- ✅ Dynamic environment configuration

**Phù hợp cho:**
- Git Flow workflow
- Multiple environments
- Team collaboration

**Sử dụng:**
```bash
cp examples/Jenkinsfile.multibranch Jenkinsfile
```

**Cấu hình Jenkins:**
1. Tạo **Multibranch Pipeline** job (không phải Pipeline thường)
2. Configure branch sources (Git)
3. Jenkins sẽ tự động discover và build tất cả branches

---

### 4. `Jenkinsfile.docker`
**Docker build và push** to registry.

**Bao gồm:**
- ✅ Build Docker image
- ✅ Test inside container
- ✅ Security scan
- ✅ Push to Docker Hub/Registry
- ✅ Deploy container
- ✅ Docker cleanup

**Phù hợp cho:**
- Containerized applications
- Microservices
- Cloud deployments

**Yêu cầu:**
- Docker installed trên Jenkins server
- Docker Hub credentials trong Jenkins

**Sử dụng:**
```bash
cp examples/Jenkinsfile.docker Jenkinsfile
```

---

### 5. `Jenkinsfile.parallel`
**Parallel execution** - Chạy nhiều tasks đồng thời.

**Bao gồm:**
- ✅ Parallel tests (unit, integration, e2e)
- ✅ Parallel quality checks (lint, type-check, audit)
- ✅ Parallel deployments (multiple servers)
- ✅ Parallel notifications
- ✅ Faster build times

**Phù hợp cho:**
- Large test suites
- Multiple deployment targets
- Time-sensitive builds

**Lợi ích:**
- ⚡ Giảm thời gian build 50-70%
- ⚡ Chạy tests song song
- ⚡ Deploy đồng thời nhiều servers

**Sử dụng:**
```bash
cp examples/Jenkinsfile.parallel Jenkinsfile
```

---

## 🚀 Cách sử dụng

### Option 1: Copy trực tiếp

```bash
# Copy example vào root directory
cp examples/Jenkinsfile.basic Jenkinsfile

# Commit vào Git
git add Jenkinsfile
git commit -m "Add Jenkinsfile"
git push
```

### Option 2: Customize

```bash
# Copy và edit
cp examples/Jenkinsfile.advanced Jenkinsfile
nano Jenkinsfile

# Sửa theo nhu cầu:
# - Đổi tên tools
# - Thêm/bớt stages
# - Cấu hình credentials
# - Thêm notifications
```

### Option 3: Mix and match

Kết hợp nhiều examples:

```groovy
pipeline {
    // Lấy structure từ Jenkinsfile.basic
    agent any
    
    // Thêm parameters từ Jenkinsfile.advanced
    parameters {
        choice(name: 'ENV', choices: ['dev', 'prod'])
    }
    
    // Thêm parallel từ Jenkinsfile.parallel
    stages {
        stage('Tests') {
            parallel {
                stage('Unit') { steps { sh 'npm run test:unit' } }
                stage('E2E') { steps { sh 'npm run test:e2e' } }
            }
        }
    }
}
```

---

## 📊 So sánh Examples

| Feature | Basic | Advanced | Multibranch | Docker | Parallel |
|---------|-------|----------|-------------|--------|----------|
| **Độ phức tạp** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Parameters** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Parallel** | ❌ | ✅ | ❌ | ❌ | ✅✅✅ |
| **Multi-env** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Docker** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Notifications** | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Build time** | ~5 min | ~7 min | ~5 min | ~8 min | ~3 min |

---

## 🎯 Chọn Example nào?

### Bắt đầu với `Jenkinsfile.basic` nếu:
- ✅ Bạn mới học Jenkins
- ✅ Dự án đơn giản
- ✅ Chỉ cần basic CI/CD

### Nâng cấp lên `Jenkinsfile.advanced` khi:
- ✅ Cần multiple environments
- ✅ Cần parameters
- ✅ Cần notifications
- ✅ Production-ready

### Dùng `Jenkinsfile.multibranch` khi:
- ✅ Team có nhiều developers
- ✅ Dùng Git Flow
- ✅ Cần auto-deploy branches

### Dùng `Jenkinsfile.docker` khi:
- ✅ Application chạy trong container
- ✅ Deploy lên Kubernetes/Docker Swarm
- ✅ Microservices architecture

### Dùng `Jenkinsfile.parallel` khi:
- ✅ Test suite lớn (>5 phút)
- ✅ Cần giảm build time
- ✅ Deploy nhiều servers

---

## 🔧 Customization Tips

### 1. Đổi tên NodeJS tool

```groovy
tools {
    nodejs 'NodeJS'  // ← Đổi thành tên trong Jenkins config
}
```

### 2. Thêm credentials

```groovy
environment {
    MY_SECRET = credentials('my-secret-id')  // ← ID trong Jenkins Credentials
}
```

### 3. Thêm stage mới

```groovy
stage('My New Stage') {
    steps {
        echo 'Doing something...'
        sh 'my-command'
    }
}
```

### 4. Conditional stage

```groovy
stage('Deploy') {
    when {
        branch 'main'  // Chỉ chạy trên main branch
    }
    steps {
        sh './deploy.sh'
    }
}
```

---

## 📚 Tài liệu thêm

- [JENKINS_PIPELINE_SETUP.md](../JENKINS_PIPELINE_SETUP.md) - Hướng dẫn setup Pipeline Job
- [JENKINSFILE_GUIDE.md](../JENKINSFILE_GUIDE.md) - Chi tiết về cấu trúc Jenkinsfile
- [README.md](../README.md) - Tổng quan dự án

---

## 🤝 Contributing

Có ý tưởng cho example mới? Tạo pull request!

**Ví dụ cần thêm:**
- Jenkinsfile với Kubernetes deployment
- Jenkinsfile với AWS deployment
- Jenkinsfile với monitoring integration
- Jenkinsfile với automated rollback

---

**Happy Building! 🚀**
