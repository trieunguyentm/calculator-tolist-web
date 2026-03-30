# Hướng dẫn chi tiết về Jenkinsfile

## 📋 Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Cấu trúc cơ bản](#cấu-trúc-cơ-bản)
3. [Các thành phần chính](#các-thành-phần-chính)
4. [Declarative vs Scripted Pipeline](#declarative-vs-scripted-pipeline)
5. [Ví dụ thực tế](#ví-dụ-thực-tế)
6. [Best Practices](#best-practices)

---

## Giới thiệu

**Jenkinsfile** là file text chứa định nghĩa của Jenkins Pipeline. File này được commit vào source control repository cùng với code của dự án.

### Lợi ích của Jenkinsfile

- ✅ **Version Control**: Pipeline được version control như code
- ✅ **Code Review**: Có thể review pipeline changes
- ✅ **Reusability**: Dễ dàng copy và reuse
- ✅ **Collaboration**: Team cùng maintain pipeline
- ✅ **History**: Có history của tất cả changes

---

## Cấu trúc cơ bản

### Template tối thiểu

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }
    }
}
```

### Template đầy đủ

```groovy
pipeline {
    // 1. Agent: Nơi chạy pipeline
    agent any
    
    // 2. Tools: Các tools cần thiết
    tools {
        nodejs 'NodeJS'
        maven 'Maven'
    }
    
    // 3. Environment: Biến môi trường
    environment {
        NODE_ENV = 'production'
        API_KEY = credentials('api-key')
    }
    
    // 4. Parameters: Input parameters
    parameters {
        string(name: 'BRANCH', defaultValue: 'main')
        choice(name: 'ENV', choices: ['dev', 'prod'])
    }
    
    // 5. Triggers: Khi nào chạy pipeline
    triggers {
        pollSCM('H/5 * * * *')
        cron('H 2 * * *')
    }
    
    // 6. Options: Cấu hình pipeline
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }
    
    // 7. Stages: Các bước thực thi
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
    
    // 8. Post: Actions sau khi pipeline kết thúc
    post {
        always {
            echo 'Pipeline finished'
        }
        success {
            echo 'Pipeline succeeded'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}
```

---

## Các thành phần chính

### 1. Agent

Định nghĩa **nơi** pipeline sẽ chạy.

```groovy
// Chạy trên bất kỳ agent nào
agent any

// Chạy trên agent có label cụ thể
agent {
    label 'linux'
}

// Chạy trong Docker container
agent {
    docker {
        image 'node:18-alpine'
        args '-v /tmp:/tmp'
    }
}

// Không dùng agent global (định nghĩa trong từng stage)
agent none
```

**Ví dụ agent trong stage:**

```groovy
pipeline {
    agent none
    
    stages {
        stage('Build') {
            agent {
                docker 'node:18'
            }
            steps {
                sh 'npm install'
            }
        }
        
        stage('Test') {
            agent {
                docker 'node:18'
            }
            steps {
                sh 'npm test'
            }
        }
    }
}
```

### 2. Tools

Tự động cài đặt và thêm tools vào PATH.

```groovy
tools {
    // NodeJS (cần NodeJS plugin)
    nodejs 'NodeJS-18'
    
    // Maven (cần Maven plugin)
    maven 'Maven-3.8'
    
    // JDK
    jdk 'JDK-11'
    
    // Gradle
    gradle 'Gradle-7'
}
```

**Lưu ý:** Tên tool phải match với tên trong **Global Tool Configuration**.

### 3. Environment

Định nghĩa biến môi trường.

```groovy
environment {
    // Biến thường
    NODE_ENV = 'production'
    BUILD_VERSION = '1.0.0'
    
    // Credentials (từ Jenkins Credentials)
    API_KEY = credentials('api-key-id')
    DOCKER_CREDS = credentials('docker-hub')
    
    // Sử dụng biến Jenkins built-in
    BUILD_INFO = "${env.JOB_NAME}-${env.BUILD_NUMBER}"
}
```

**Sử dụng trong steps:**

```groovy
steps {
    echo "Node environment: ${NODE_ENV}"
    sh "echo Build version: ${BUILD_VERSION}"
    
    // Credentials tự động có _USR và _PSW
    sh 'echo $DOCKER_CREDS_USR'
    sh 'echo $DOCKER_CREDS_PSW'
}
```

### 4. Parameters

Cho phép user nhập giá trị khi trigger build.

```groovy
parameters {
    // String parameter
    string(
        name: 'BRANCH_NAME',
        defaultValue: 'main',
        description: 'Branch to build'
    )
    
    // Choice parameter
    choice(
        name: 'ENVIRONMENT',
        choices: ['dev', 'staging', 'production'],
        description: 'Deployment environment'
    )
    
    // Boolean parameter
    booleanParam(
        name: 'RUN_TESTS',
        defaultValue: true,
        description: 'Run tests?'
    )
    
    // Text parameter (multi-line)
    text(
        name: 'RELEASE_NOTES',
        defaultValue: '',
        description: 'Release notes'
    )
}
```

**Sử dụng parameters:**

```groovy
stages {
    stage('Build') {
        steps {
            echo "Building branch: ${params.BRANCH_NAME}"
            echo "Environment: ${params.ENVIRONMENT}"
            
            script {
                if (params.RUN_TESTS) {
                    sh 'npm test'
                }
            }
        }
    }
}
```

### 5. Triggers

Tự động trigger builds.

```groovy
triggers {
    // Poll SCM mỗi 5 phút
    pollSCM('H/5 * * * *')
    
    // Cron schedule (mỗi ngày lúc 2 giờ sáng)
    cron('H 2 * * *')
    
    // Upstream projects
    upstream(
        upstreamProjects: 'job1,job2',
        threshold: hudson.model.Result.SUCCESS
    )
}
```

**Cron syntax:**

```
MINUTE HOUR DAY MONTH DAYOFWEEK

Ví dụ:
H/15 * * * *     - Mỗi 15 phút
H 2 * * *        - Mỗi ngày lúc 2 giờ sáng
H 2 * * 1-5      - Thứ 2-6 lúc 2 giờ sáng
H H * * 0        - Chủ nhật
```

### 6. Options

Cấu hình behavior của pipeline.

```groovy
options {
    // Giữ 10 builds gần nhất
    buildDiscarder(logRotator(
        numToKeepStr: '10',
        daysToKeepStr: '30'
    ))
    
    // Timeout cho toàn bộ pipeline
    timeout(time: 1, unit: 'HOURS')
    
    // Thêm timestamps vào console output
    timestamps()
    
    // Không cho phép concurrent builds
    disableConcurrentBuilds()
    
    // Retry khi fail
    retry(3)
    
    // Skip default checkout
    skipDefaultCheckout()
    
    // Disable resume
    disableResume()
}
```

### 7. Stages và Steps

**Stages** là các phase chính, **Steps** là các actions cụ thể.

```groovy
stages {
    // Stage đơn giản
    stage('Build') {
        steps {
            echo 'Building...'
            sh 'npm install'
            sh 'npm run build'
        }
    }
    
    // Stage với environment riêng
    stage('Test') {
        environment {
            TEST_ENV = 'test'
        }
        steps {
            sh 'npm test'
        }
    }
    
    // Stage với agent riêng
    stage('Deploy') {
        agent {
            label 'production'
        }
        steps {
            sh './deploy.sh'
        }
    }
    
    // Stage với when condition
    stage('Deploy to Prod') {
        when {
            branch 'main'
        }
        steps {
            sh './deploy-prod.sh'
        }
    }
}
```

### 8. Steps phổ biến

```groovy
steps {
    // Echo message
    echo 'Hello World'
    
    // Shell command (Linux/Mac)
    sh 'npm install'
    sh '''
        echo "Multi-line"
        npm test
        npm run build
    '''
    
    // Batch command (Windows)
    bat 'npm install'
    
    // Checkout code
    checkout scm
    
    // Archive artifacts
    archiveArtifacts artifacts: 'build/**/*', fingerprint: true
    
    // Publish test results
    junit 'test-results/**/*.xml'
    
    // Stash/Unstash files (giữa các agents)
    stash name: 'build', includes: 'build/**'
    unstash 'build'
    
    // Script block (Groovy code)
    script {
        def version = sh(returnStdout: true, script: 'cat package.json | grep version').trim()
        echo "Version: ${version}"
    }
    
    // Retry
    retry(3) {
        sh 'npm test'
    }
    
    // Timeout
    timeout(time: 5, unit: 'MINUTES') {
        sh 'npm test'
    }
    
    // Input (user approval)
    input message: 'Deploy to production?', ok: 'Deploy'
    
    // Clean workspace
    cleanWs()
}
```

### 9. When Conditions

Chạy stage theo điều kiện.

```groovy
stage('Deploy') {
    when {
        // Chỉ chạy trên branch main
        branch 'main'
    }
    steps {
        sh './deploy.sh'
    }
}

stage('Deploy to Prod') {
    when {
        // Nhiều điều kiện (AND)
        allOf {
            branch 'main'
            environment name: 'DEPLOY', value: 'true'
        }
    }
    steps {
        sh './deploy-prod.sh'
    }
}

stage('Notify') {
    when {
        // Một trong các điều kiện (OR)
        anyOf {
            branch 'main'
            branch 'develop'
        }
    }
    steps {
        echo 'Sending notification'
    }
}

stage('Rollback') {
    when {
        // NOT condition
        not {
            branch 'main'
        }
    }
    steps {
        echo 'Rollback'
    }
}

stage('Tag') {
    when {
        // Tag pattern
        tag pattern: "v\\d+\\.\\d+\\.\\d+", comparator: "REGEXP"
    }
    steps {
        echo 'Creating release'
    }
}

stage('Manual Deploy') {
    when {
        // Triggered manually
        triggeredBy 'UserIdCause'
    }
    steps {
        sh './deploy.sh'
    }
}
```

### 10. Parallel Stages

Chạy nhiều stages đồng thời.

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
        
        stage('E2E Tests') {
            steps {
                sh 'npm run test:e2e'
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

**Parallel với failFast:**

```groovy
stage('Parallel Tests') {
    failFast true  // Stop tất cả nếu 1 stage fail
    parallel {
        stage('Test 1') {
            steps {
                sh 'npm run test:1'
            }
        }
        stage('Test 2') {
            steps {
                sh 'npm run test:2'
            }
        }
    }
}
```

### 11. Post Actions

Actions chạy sau khi pipeline hoặc stage kết thúc.

```groovy
post {
    // Luôn chạy
    always {
        echo 'Pipeline finished'
        cleanWs()
    }
    
    // Chỉ khi success
    success {
        echo 'Pipeline succeeded!'
        slackSend color: 'good', message: 'Build succeeded'
    }
    
    // Chỉ khi failure
    failure {
        echo 'Pipeline failed!'
        emailext subject: 'Build Failed', body: 'Check logs', to: 'team@example.com'
    }
    
    // Khi unstable (tests fail nhưng build success)
    unstable {
        echo 'Pipeline unstable'
    }
    
    // Khi status thay đổi (success -> failure hoặc ngược lại)
    changed {
        echo 'Pipeline status changed'
    }
    
    // Khi fixed (từ failure -> success)
    fixed {
        echo 'Pipeline fixed!'
    }
    
    // Khi regression (từ success -> failure)
    regression {
        echo 'Pipeline regressed!'
    }
    
    // Khi aborted
    aborted {
        echo 'Pipeline aborted'
    }
    
    // Cleanup (giống always nhưng chạy sau cùng)
    cleanup {
        echo 'Final cleanup'
    }
}
```

**Post trong stage:**

```groovy
stage('Test') {
    steps {
        sh 'npm test'
    }
    post {
        always {
            junit 'test-results/**/*.xml'
        }
        failure {
            echo 'Tests failed'
        }
    }
}
```

---

## Declarative vs Scripted Pipeline

### Declarative Pipeline (Khuyến nghị ⭐)

**Cú pháp đơn giản, dễ đọc, structured.**

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }
    }
}
```

**Ưu điểm:**
- ✅ Cú pháp đơn giản, dễ học
- ✅ Validation tốt hơn
- ✅ Blue Ocean UI support tốt
- ✅ Restart from stage
- ✅ Khuyến nghị cho beginners

### Scripted Pipeline

**Groovy code thuần, flexible hơn.**

```groovy
node {
    stage('Build') {
        echo 'Building...'
    }
}
```

**Ưu điểm:**
- ✅ Flexible hơn
- ✅ Có thể viết complex logic
- ✅ Phù hợp cho advanced use cases

**Nhược điểm:**
- ❌ Khó đọc hơn
- ❌ Dễ lỗi hơn
- ❌ Khó maintain

**Khuyến nghị:** Dùng **Declarative Pipeline** cho hầu hết cases!

---

## Ví dụ thực tế

### 1. React App CI/CD Pipeline

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-18'
    }
    
    environment {
        NODE_ENV = 'production'
        DEPLOY_SERVER = credentials('deploy-server')
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
                sh 'npm ci'  // Faster than npm install
            }
        }
        
        stage('Parallel Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit -- --coverage'
                    }
                }
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building application...'
                sh 'npm run build'
            }
        }
        
        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'build/**/*', fingerprint: true
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to staging...'
                sh './deploy.sh staging'
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                echo 'Deploying to production...'
                sh './deploy.sh production'
            }
        }
    }
    
    post {
        always {
            junit 'test-results/**/*.xml'
            publishHTML([
                reportDir: 'coverage',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
        }
        success {
            slackSend color: 'good', message: "Build ${env.BUILD_NUMBER} succeeded"
        }
        failure {
            slackSend color: 'danger', message: "Build ${env.BUILD_NUMBER} failed"
        }
        cleanup {
            cleanWs()
        }
    }
}
```

### 2. Multi-branch Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                echo "Building branch: ${env.BRANCH_NAME}"
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        echo 'Deploying to production'
                        sh './deploy.sh production'
                    } else if (env.BRANCH_NAME == 'develop') {
                        echo 'Deploying to staging'
                        sh './deploy.sh staging'
                    } else if (env.BRANCH_NAME.startsWith('feature/')) {
                        echo 'Deploying to dev'
                        sh './deploy.sh dev'
                    } else {
                        echo 'No deployment for this branch'
                    }
                }
            }
        }
    }
}
```

### 3. Docker Build Pipeline

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'myapp'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDS = credentials('docker-hub-credentials')
    }
    
    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }
        
        stage('Test Image') {
            steps {
                script {
                    docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").inside {
                        sh 'npm test'
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-hub-credentials') {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push('latest')
                    }
                }
            }
        }
    }
}
```

---

## Best Practices

### 1. ✅ Cấu trúc rõ ràng

```groovy
// ❌ Bad
pipeline {
    agent any
    stages {
        stage('Build and Test') {
            steps {
                sh 'npm install && npm test && npm run build'
            }
        }
    }
}

// ✅ Good
pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                sh 'npm install'
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
    }
}
```

### 2. ✅ Sử dụng environment variables

```groovy
// ❌ Bad - Hardcoded values
steps {
    sh 'docker build -t myapp:1.0.0 .'
    sh 'docker push myregistry.com/myapp:1.0.0'
}

// ✅ Good - Use variables
environment {
    IMAGE_NAME = 'myapp'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    REGISTRY = 'myregistry.com'
}
steps {
    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
    sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
}
```

### 3. ✅ Error handling

```groovy
// ✅ Good
steps {
    script {
        try {
            sh 'npm test'
        } catch (Exception e) {
            echo "Tests failed: ${e.message}"
            currentBuild.result = 'UNSTABLE'
        }
    }
}
```

### 4. ✅ Cleanup

```groovy
// ✅ Good
post {
    always {
        cleanWs()  // Clean workspace
        sh 'docker system prune -f'  // Clean Docker
    }
}
```

### 5. ✅ Parallel execution

```groovy
// ✅ Good - Save time
stage('Tests') {
    parallel {
        stage('Unit') { steps { sh 'npm run test:unit' } }
        stage('Integration') { steps { sh 'npm run test:integration' } }
        stage('E2E') { steps { sh 'npm run test:e2e' } }
    }
}
```

### 6. ✅ Meaningful names

```groovy
// ❌ Bad
stage('Stage 1') { }
stage('Stage 2') { }

// ✅ Good
stage('Install Dependencies') { }
stage('Run Unit Tests') { }
stage('Build Production Bundle') { }
```

### 7. ✅ Use credentials properly

```groovy
// ❌ Bad
sh 'docker login -u myuser -p mypassword'

// ✅ Good
withCredentials([usernamePassword(
    credentialsId: 'docker-hub',
    usernameVariable: 'USER',
    passwordVariable: 'PASS'
)]) {
    sh 'echo $PASS | docker login -u $USER --password-stdin'
}
```

---

## 📚 Tài liệu tham khảo

- [Pipeline Syntax Reference](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Pipeline Steps Reference](https://www.jenkins.io/doc/pipeline/steps/)
- [Pipeline Examples](https://www.jenkins.io/doc/pipeline/examples/)
- [Best Practices](https://www.jenkins.io/doc/book/pipeline/pipeline-best-practices/)

---

**Next:** Xem các ví dụ Jenkinsfile trong thư mục `examples/` 🚀
