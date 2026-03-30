# 🚀 Jenkins React App - Freestyle Job Testing

Dự án React đầy đủ để thử nghiệm với Jenkins Freestyle Job, bao gồm Calculator và Todo List.

## 📋 Mô tả

Đây là một ứng dụng React hoàn chỉnh với:
- ✨ Calculator component với đầy đủ chức năng
- 📝 Todo List component với CRUD operations
- ✅ Unit tests với React Testing Library
- 🔨 Build scripts cho Jenkins
- 📦 Production build configuration

## 🗂️ Cấu trúc dự án

```
jenkins-lab/
├── public/
│   ├── index.html              # HTML template
│   └── robots.txt              # SEO robots file
├── src/
│   ├── components/
│   │   ├── Calculator.js       # Calculator component
│   │   ├── Calculator.css      # Calculator styles
│   │   ├── Calculator.test.js  # Calculator tests
│   │   ├── TodoList.js         # Todo List component
│   │   ├── TodoList.css        # Todo List styles
│   │   └── TodoList.test.js    # Todo List tests
│   ├── App.js                  # Main App component
│   ├── App.css                 # App styles
│   ├── App.test.js             # App tests
│   ├── index.js                # Entry point
│   ├── index.css               # Global styles
│   └── setupTests.js           # Test configuration
├── build.sh                    # Build script cho Jenkins
├── package.json                # Dependencies và scripts
├── Jenkinsfile                 # Pipeline configuration (bonus)
├── JENKINS_FREESTYLE_SETUP.md  # Hướng dẫn chi tiết
└── README.md                   # File này
```

## 🎨 Features

### Calculator
- ➕ Cộng, trừ, nhân, chia
- 🔢 Nhập số thập phân
- 🔄 Clear và reset
- 📱 Giao diện đẹp, responsive

### Todo List
- ➕ Thêm task mới
- ✅ Đánh dấu hoàn thành
- 🗑️ Xóa task
- 📊 Hiển thị thống kê
- 💾 State management với React hooks

## 🚀 Chạy local

### 1. Cài đặt dependencies:

```bash
npm install
```

### 2. Chạy development server:

```bash
npm start
```

Mở [http://localhost:3000](http://localhost:3000) để xem app.

### 3. Chạy tests:

```bash
npm test
```

### 4. Build production:

```bash
npm run build
```

### 5. Chạy build script (giống Jenkins):

```bash
chmod +x build.sh
./build.sh
```

## 🔧 Cấu hình Jenkins Jobs

### Option 1: Freestyle Job (Cơ bản)

**Quick Start (5 phút):**

1. **Tạo Job:**
   - Jenkins Dashboard → New Item
   - Tên: `react-app-build`
   - Type: **Freestyle project**

2. **Build Environment:**
   - Check **Provide Node & npm bin/ folder to PATH**
   - NodeJS Installation: Chọn NodeJS version

3. **Build Steps:**
   - Add build step → Execute shell
   - Script:
     ```bash
     chmod +x build.sh
     ./build.sh
     ```

4. **Post-build Actions:**
   - Archive artifacts: `build/**/*`

5. **Save và Build Now**

**Hướng dẫn chi tiết:** [`JENKINS_FREESTYLE_SETUP.md`](JENKINS_FREESTYLE_SETUP.md)

---

### Option 2: Pipeline Job (Khuyến nghị ⭐)

**Quick Start (5 phút):**

1. **Tạo Job:**
   - Jenkins Dashboard → New Item
   - Tên: `react-app-pipeline`
   - Type: **Pipeline**

2. **Pipeline Configuration:**
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: URL của repository
   - Script Path: `Jenkinsfile`

3. **Tạo Jenkinsfile:**
   ```bash
   cp examples/Jenkinsfile.basic Jenkinsfile
   git add Jenkinsfile
   git commit -m "Add Jenkinsfile"
   git push
   ```

4. **Save và Build Now**

**Hướng dẫn chi tiết:**
- [`JENKINS_PIPELINE_SETUP.md`](JENKINS_PIPELINE_SETUP.md) - Setup Pipeline Job
- [`JENKINSFILE_GUIDE.md`](JENKINSFILE_GUIDE.md) - Cấu trúc Jenkinsfile
- [`examples/`](examples/) - 5+ Jenkinsfile examples

## ✅ Test Coverage

Dự án bao gồm **15+ unit tests**:

### App.test.js (4 tests)
- ✓ Renders app header
- ✓ Renders tab buttons
- ✓ Switches between tabs
- ✓ Renders footer

### Calculator.test.js (5 tests)
- ✓ Renders calculator display
- ✓ Displays digit when clicked
- ✓ Performs addition
- ✓ Performs subtraction
- ✓ Clears display

### TodoList.test.js (6 tests)
- ✓ Renders todo list header
- ✓ Renders default todos
- ✓ Adds new todo
- ✓ Toggles todo completion
- ✓ Deletes todo
- ✓ Displays todo stats

## 📊 Jenkins Build Process

Khi chạy Jenkins job, quá trình build sẽ:

1. ✅ Check Node.js và npm version
2. ✅ Install dependencies (`npm install`)
3. ✅ Run tests với coverage (`npm test`)
4. ✅ Build production (`npm run build`)
5. ✅ Verify build output
6. ✅ Archive artifacts

**Thời gian build:** ~2-5 phút (tùy server)

## 🎯 Kết quả mong đợi

### Build thành công:
```
==========================================
Jenkins React Build Process
==========================================
Node version: v18.x.x
NPM version: 9.x.x

Installing dependencies...
✓ Dependencies installed

Running tests...
✓ 15 tests passed
✓ Coverage: Statements 90%+

Building application...
✓ Build created successfully

Build directory contents:
- index.html
- static/js/main.*.js
- static/css/main.*.css

==========================================
Build Successful!
==========================================
```

## 🐛 Troubleshooting

### Node.js không tìm thấy:
```bash
# Kiểm tra Node.js đã cài đặt
node --version
npm --version
```

### Dependencies install fail:
```bash
# Xóa và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Tests fail:
```bash
# Chạy tests với verbose output
npm test -- --verbose
```

### Build script không chạy:
```bash
chmod +x build.sh
```

## 📦 Dependencies

### Production:
- **react**: ^18.2.0
- **react-dom**: ^18.2.0
- **react-scripts**: 5.0.1

### Development:
- **@testing-library/react**: ^13.4.0
- **@testing-library/jest-dom**: ^5.16.5
- **@testing-library/user-event**: ^14.4.3

## 🔐 Environment Variables

Không cần environment variables cho dự án cơ bản này. Nếu cần, tạo file `.env`:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENV=production
```

## 📈 CI/CD Pipeline

Dự án này có thể mở rộng thành full CI/CD pipeline:

1. **Build** → Compile và test code
2. **Test** → Run unit tests và integration tests
3. **Deploy** → Deploy lên server (Netlify, Vercel, AWS, etc.)
4. **Monitor** → Track performance và errors

## 🎓 Mục đích học tập

Dự án này giúp bạn:

1. ✓ Hiểu cách tạo và cấu hình Jenkins Freestyle Job
2. ✓ Tích hợp Node.js với Jenkins
3. ✓ Chạy tests tự động trong CI/CD
4. ✓ Build và archive artifacts
5. ✓ Debug build failures
6. ✓ Best practices cho React testing

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [React Testing Library](https://testing-library.com/react)
- [Create React App](https://create-react-app.dev/)

## 🤝 Contributing

Dự án này dành cho mục đích học tập. Bạn có thể:
- Thêm components mới
- Viết thêm tests
- Cải thiện UI/UX
- Tối ưu build process

## 📝 Notes

- Dự án sử dụng Create React App làm base
- Tests chạy trong jsdom environment
- Build output được optimize cho production
- Tất cả components đều có tests coverage

---

**Happy Testing with Jenkins! 🚀**

Made with ❤️ for Jenkins learning
