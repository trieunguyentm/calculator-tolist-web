# Hướng dẫn tạo Jenkins Freestyle Job cho React App

## 📋 Yêu cầu

- Jenkins server đã cài đặt
- Node.js và npm đã cài đặt trên Jenkins server
- Git (nếu sử dụng source control)

## 🚀 Bước 1: Cài đặt Node.js Plugin

1. Vào **Manage Jenkins** → **Manage Plugins**
2. Tab **Available**, tìm **NodeJS Plugin**
3. Cài đặt plugin và restart Jenkins

## 🔧 Bước 2: Cấu hình Node.js

1. Vào **Manage Jenkins** → **Global Tool Configuration**
2. Tìm phần **NodeJS**
3. Click **Add NodeJS**
   - Name: `NodeJS` (hoặc tên bạn muốn)
   - Version: Chọn phiên bản Node.js (khuyến nghị 16.x hoặc 18.x)
   - Global npm packages: Có thể để trống
4. Click **Save**

## 📝 Bước 3: Tạo Freestyle Job

### 3.1. Tạo Job mới

1. Từ Jenkins Dashboard, click **New Item**
2. Nhập tên job: `react-app-build`
3. Chọn **Freestyle project**
4. Click **OK**

### 3.2. General Configuration

- **Description**: `React application build and test with Jenkins`
- **Discard old builds**: 
  - Days to keep builds: `7`
  - Max # of builds to keep: `10`

### 3.3. Source Code Management

#### Nếu dùng Git:

1. Chọn **Git**
2. **Repository URL**: URL của Git repository
3. **Credentials**: Thêm credentials nếu cần
4. **Branches to build**: `*/main` hoặc `*/master`

#### Nếu không dùng Git:

- Chọn **None**
- Bạn sẽ cần copy code vào workspace của Jenkins

### 3.4. Build Environment

1. Check **Provide Node & npm bin/ folder to PATH**
2. Chọn **NodeJS Installation**: `NodeJS` (tên bạn đã cấu hình ở Bước 2)
3. Check **Delete workspace before build starts** (tùy chọn, để clean build)

### 3.5. Build Steps

Click **Add build step** → **Execute shell**

#### Option 1: Sử dụng build script

```bash
#!/bin/bash

# Make script executable
chmod +x build.sh

# Run build script
./build.sh
```

#### Option 2: Chạy từng lệnh riêng

```bash
#!/bin/bash

echo "=========================================="
echo "Jenkins React Build Process"
echo "=========================================="

# Check versions
echo "Node version:"
node --version
echo "NPM version:"
npm --version

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Run tests
echo ""
echo "Running tests..."
npm test -- --coverage --watchAll=false

# Build application
echo ""
echo "Building application..."
npm run build

# Verify build
if [ -d "build" ]; then
    echo ""
    echo "Build successful! Build directory contents:"
    ls -lh build/
    echo "=========================================="
    exit 0
else
    echo "Build failed - build directory not found"
    exit 1
fi
```

### 3.6. Post-build Actions

#### Archive Artifacts

1. Click **Add post-build action** → **Archive the artifacts**
2. **Files to archive**: `build/**/*`
3. Check **Fingerprint artifacts**

#### Publish Test Results (Tùy chọn)

1. Click **Add post-build action** → **Publish JUnit test result report**
2. **Test report XMLs**: `coverage/junit.xml` (nếu có cấu hình)

#### Email Notification (Tùy chọn)

1. Click **Add post-build action** → **E-mail Notification**
2. **Recipients**: email của bạn
3. Check **Send e-mail for every unstable build**

## ▶️ Bước 4: Lưu và chạy Job

1. Click **Save** để lưu cấu hình
2. Click **Build Now** để chạy job lần đầu
3. Xem progress trong **Build History**
4. Click vào build number để xem chi tiết
5. Click **Console Output** để xem log

## 📊 Kiểm tra kết quả

### Build thành công:
- ✅ Status: **Blue/Green ball**
- ✅ Console output hiển thị "Build Successful!"
- ✅ Artifacts được lưu trong build artifacts
- ✅ Thư mục `build/` chứa static files

### Build thất bại:
- ❌ Status: **Red ball**
- ❌ Xem Console Output để tìm lỗi
- ❌ Kiểm tra dependencies, tests, hoặc build errors

## 🔄 Bước 5: Cấu hình Build Triggers (Tùy chọn)

### Build định kỳ:

1. Trong job configuration, tìm **Build Triggers**
2. Check **Build periodically**
3. Schedule (cron syntax):
   - `H/15 * * * *` - Mỗi 15 phút
   - `H 2 * * *` - Mỗi ngày lúc 2 giờ sáng
   - `H H * * 1-5` - Mỗi ngày trong tuần

### Poll SCM (Git):

1. Check **Poll SCM**
2. Schedule:
   - `H/5 * * * *` - Kiểm tra Git mỗi 5 phút
   - `H/15 * * * *` - Kiểm tra Git mỗi 15 phút

### GitHub Webhook:

1. Check **GitHub hook trigger for GITScm polling**
2. Cấu hình webhook trong GitHub repository settings

## 🐛 Troubleshooting

### Lỗi "node: command not found"

**Giải pháp:**
- Đảm bảo NodeJS Plugin đã được cài đặt
- Kiểm tra NodeJS đã được cấu hình trong Global Tool Configuration
- Check **Provide Node & npm bin/ folder to PATH** trong Build Environment

### Lỗi "npm install failed"

**Giải pháp:**
```bash
# Xóa node_modules và thử lại
rm -rf node_modules package-lock.json
npm install
```

### Tests fail

**Giải pháp:**
- Xem chi tiết lỗi trong Console Output
- Chạy tests local để debug: `npm test`
- Kiểm tra environment variables

### Build timeout

**Giải pháp:**
- Trong job configuration, check **Abort the build if it's stuck**
- Tăng timeout nếu cần

### Permission denied cho build.sh

**Giải pháp:**
```bash
chmod +x build.sh
```

## 📈 Best Practices

1. **Clean Workspace**: Enable "Delete workspace before build starts"
2. **Archive Artifacts**: Lưu build output để deploy sau
3. **Test Coverage**: Luôn chạy tests trước khi build
4. **Notifications**: Cấu hình email/Slack notifications
5. **Build History**: Giữ lại 7-10 builds gần nhất
6. **Environment Variables**: Sử dụng .env cho các config khác nhau

## 🎯 Các lệnh hữu ích

### Test local trước khi chạy Jenkins:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Run build script
chmod +x build.sh
./build.sh
```

### Xem build artifacts:

1. Vào build page
2. Click **Build Artifacts**
3. Download hoặc browse files

## 📚 Tài liệu thêm

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [NodeJS Plugin](https://plugins.jenkins.io/nodejs/)
- [React Testing](https://reactjs.org/docs/testing.html)

---

**Happy Building! 🚀**
