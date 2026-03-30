# Hướng dẫn tạo Jenkins Pipeline Job

## 📋 Giới thiệu

**Pipeline Job** là cách hiện đại và mạnh mẽ hơn **Freestyle Job** để định nghĩa CI/CD workflow. Pipeline được định nghĩa bằng code (Pipeline as Code) trong file `Jenkinsfile`.

### So sánh Freestyle vs Pipeline

| Feature | Freestyle Job | Pipeline Job |
|---------|---------------|--------------|
| Configuration | UI-based | Code-based (Jenkinsfile) |
| Version Control | ❌ Không | ✅ Có (trong Git) |
| Complex Workflows | ❌ Khó | ✅ Dễ dàng |
| Reusability | ❌ Hạn chế | ✅ Cao |
| Visualization | ❌ Cơ bản | ✅ Stage View đẹp |
| Parallel Execution | ❌ Không | ✅ Có |

## 🚀 Bước 1: Cài đặt Pipeline Plugin

Pipeline plugin thường được cài sẵn trong Jenkins. Nếu chưa có:

1. **Manage Jenkins** → **Manage Plugins**
2. Tab **Available**, tìm **Pipeline**
3. Cài đặt và restart Jenkins

## 📝 Bước 2: Tạo Pipeline Job

### 2.1. Tạo Job mới

1. Từ Jenkins Dashboard, click **New Item**
2. Nhập tên job: `react-app-pipeline`
3. Chọn **Pipeline** (không phải Freestyle!)
4. Click **OK**

### 2.2. General Configuration

- **Description**: `React application CI/CD pipeline`
- **Discard old builds**:
  - Days to keep builds: `7`
  - Max # of builds to keep: `10`
- **GitHub project** (nếu dùng GitHub):
  - Project url: URL của repository

### 2.3. Build Triggers

Chọn một hoặc nhiều triggers:

#### Option 1: Poll SCM
```
H/5 * * * *
```
Kiểm tra Git mỗi 5 phút

#### Option 2: GitHub hook trigger
- Check **GitHub hook trigger for GITScm polling**
- Cần cấu hình webhook trong GitHub

#### Option 3: Build periodically
```
H 2 * * *
```
Build mỗi ngày lúc 2 giờ sáng

### 2.4. Pipeline Configuration

Có 2 cách định nghĩa Pipeline:

#### **Option A: Pipeline script from SCM** (Khuyến nghị ⭐)

Đây là cách tốt nhất - Jenkinsfile được lưu trong Git repository.

1. **Definition**: Chọn **Pipeline script from SCM**
2. **SCM**: Chọn **Git**
3. **Repository URL**: Nhập URL của Git repository
4. **Credentials**: Thêm credentials nếu cần
5. **Branch Specifier**: `*/main` hoặc `*/master`
6. **Script Path**: `Jenkinsfile` (tên file trong repo)
7. Click **Save**

**Ưu điểm:**
- ✅ Jenkinsfile được version control
- ✅ Dễ review và collaborate
- ✅ Có history của changes
- ✅ Có thể rollback

#### **Option B: Pipeline script**

Viết Jenkinsfile trực tiếp trong Jenkins UI.

1. **Definition**: Chọn **Pipeline script**
2. **Script**: Copy paste Jenkinsfile content vào đây
3. Click **Save**

**Nhược điểm:**
- ❌ Không có version control
- ❌ Khó maintain
- ❌ Chỉ nên dùng để test

## 📄 Bước 3: Tạo Jenkinsfile

Tạo file `Jenkinsfile` trong root của repository:

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }
        
        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                sh 'npm test -- --coverage --watchAll=false'
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building application...'
                sh 'npm run build'
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                echo 'Archiving build artifacts...'
                archiveArtifacts artifacts: 'build/**/*', fingerprint: true
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
```

## ▶️ Bước 4: Chạy Pipeline

1. Click **Build Now**
2. Xem **Stage View** để theo dõi progress
3. Click vào từng stage để xem logs
4. Xem **Console Output** để xem full logs

## 📊 Stage View

Pipeline Job có **Stage View** rất trực quan:

```
[Checkout] → [Install] → [Test] → [Build] → [Archive]
   ✓           ✓          ✓         ✓          ✓
```

- **Green**: Stage thành công
- **Red**: Stage thất bại
- **Gray**: Stage chưa chạy
- **Blue**: Stage đang chạy

## 🔄 Bước 5: Cấu hình nâng cao

### 5.1. Parallel Stages

Chạy nhiều stages đồng thời:

```groovy
stage('Parallel Tests') {
    parallel {
        stage('Unit Tests') {
            steps {
                sh 'npm run test:unit'
            }
        }
        stage('Integration Tests') {
            steps {
                sh 'npm run test:integration'
            }
        }
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
    }
}
```

### 5.2. Environment Variables

```groovy
pipeline {
    agent any
    
    environment {
        NODE_ENV = 'production'
        API_URL = 'https://api.example.com'
    }
    
    stages {
        // ...
    }
}
```

### 5.3. Parameters

Cho phép user nhập parameters khi build:

```groovy
pipeline {
    agent any
    
    parameters {
        string(name: 'BRANCH', defaultValue: 'main', description: 'Branch to build')
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'production'], description: 'Environment')
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run tests?')
    }
    
    stages {
        stage('Build') {
            steps {
                echo "Building branch: ${params.BRANCH}"
                echo "Environment: ${params.ENVIRONMENT}"
            }
        }
    }
}
```

### 5.4. Conditional Stages

Chạy stage theo điều kiện:

```groovy
stage('Deploy to Production') {
    when {
        branch 'main'
    }
    steps {
        echo 'Deploying to production...'
        sh './deploy.sh production'
    }
}
```

### 5.5. Input Step

Yêu cầu approval trước khi tiếp tục:

```groovy
stage('Deploy') {
    steps {
        input message: 'Deploy to production?', ok: 'Deploy'
        sh './deploy.sh'
    }
}
```

## 🔐 Bước 6: Credentials Management

### 6.1. Thêm Credentials

1. **Manage Jenkins** → **Manage Credentials**
2. Click **(global)** domain
3. **Add Credentials**
4. Chọn loại:
   - **Username with password**: Git, Docker Hub
   - **Secret text**: API keys
   - **SSH Username with private key**: SSH keys

### 6.2. Sử dụng Credentials trong Pipeline

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
        API_KEY = credentials('api-key-secret')
    }
    
    stages {
        stage('Docker Login') {
            steps {
                sh 'echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin'
            }
        }
    }
}
```

## 📧 Bước 7: Notifications

### 7.1. Email Notification

```groovy
post {
    failure {
        emailext (
            subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            body: "Check console output at ${env.BUILD_URL}",
            to: 'team@example.com'
        )
    }
}
```

### 7.2. Slack Notification

```groovy
post {
    success {
        slackSend (
            color: 'good',
            message: "Build Successful: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
        )
    }
    failure {
        slackSend (
            color: 'danger',
            message: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
        )
    }
}
```

## 🐛 Troubleshooting

### Pipeline syntax error

**Giải pháp:**
- Sử dụng **Pipeline Syntax** helper trong Jenkins
- Click **Pipeline Syntax** link trong job configuration
- Generate code snippets

### Stage fails silently

**Giải pháp:**
```groovy
steps {
    script {
        try {
            sh 'npm test'
        } catch (Exception e) {
            echo "Tests failed: ${e.message}"
            throw e
        }
    }
}
```

### Workspace issues

**Giải pháp:**
```groovy
post {
    always {
        cleanWs()  // Clean workspace after build
    }
}
```

## 📈 Best Practices

1. **✅ Luôn dùng Pipeline script from SCM**
   - Jenkinsfile trong Git repository
   - Version control và review

2. **✅ Chia nhỏ stages**
   - Mỗi stage làm 1 việc cụ thể
   - Dễ debug khi fail

3. **✅ Sử dụng post blocks**
   - Cleanup trong `always`
   - Notifications trong `success`/`failure`

4. **✅ Environment variables**
   - Không hardcode values
   - Dùng credentials cho sensitive data

5. **✅ Parallel execution**
   - Chạy tests song song
   - Giảm thời gian build

6. **✅ Meaningful stage names**
   - Tên stage rõ ràng
   - Dễ hiểu trong Stage View

7. **✅ Error handling**
   - Try-catch cho critical steps
   - Meaningful error messages

## 🎯 Pipeline vs Freestyle - Khi nào dùng gì?

### Dùng **Freestyle Job** khi:
- ❌ Workflow đơn giản (1-2 steps)
- ❌ Không cần version control
- ❌ Quick prototype/testing

### Dùng **Pipeline Job** khi:
- ✅ Workflow phức tạp (nhiều stages)
- ✅ Cần version control
- ✅ Cần parallel execution
- ✅ Production CI/CD
- ✅ Team collaboration

**Khuyến nghị:** Luôn dùng Pipeline cho production!

## 📚 Tài liệu thêm

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Pipeline Syntax Reference](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Pipeline Examples](https://www.jenkins.io/doc/pipeline/examples/)

---

**Next Steps:** Xem file `JENKINSFILE_GUIDE.md` để hiểu chi tiết về cấu trúc Jenkinsfile! 🚀
