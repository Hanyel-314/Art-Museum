# 故障排除指南 / Troubleshooting Guide

## 问题：页面加载不出来 / Issue: Page won't load

### 诊断步骤 / Diagnostic Steps

#### 1. 检查开发服务器 / Check Development Server

```bash
npm run dev
```

应该看到 / Should see:
```
VITE v5.4.21  ready in 224 ms
➜  Local:   http://localhost:5173/
```

#### 2. 测试 Three.js / Test Three.js

访问测试页面 / Visit test page:
```
http://localhost:5173/test.html
```

如果看到绿色旋转的立方体线框，说明 Three.js 工作正常。
If you see a rotating green wireframe cube, Three.js is working.

#### 3. 打开浏览器控制台 / Open Browser Console

**Chrome/Edge:**
- 按 F12 或 Ctrl+Shift+I (Windows/Linux)
- 按 Cmd+Option+I (Mac)

**Firefox:**
- 按 F12 或 Ctrl+Shift+K (Windows/Linux)
- 按 Cmd+Option+K (Mac)

**Safari:**
- 首先启用开发者菜单：偏好设置 → 高级 → 显示"开发"菜单
- 按 Cmd+Option+C

#### 4. 检查控制台输出 / Check Console Output

应该看到以下日志 / Should see these logs:
```
Initializing Art Museum...
DOM elements loaded
Scene created
Creating entrance scene...
Creating corridor scene...
Scenes created successfully
Event listeners attached
Animation loop started
Hiding loading screen
Museum ready!
```

如果卡在某一步，记下最后一条消息。
If it stops at a certain step, note the last message.

### 常见问题 / Common Issues

#### 问题 1: 白屏 / Blank Screen
**原因 / Cause:** JavaScript 错误
**解决方法 / Solution:**
1. 打开控制台查看红色错误信息
2. 刷新页面 (Ctrl+F5 或 Cmd+Shift+R 强制刷新)
3. 清除浏览器缓存

#### 问题 2: 卡在加载画面 / Stuck on Loading Screen
**原因 / Cause:** Three.js 初始化失败或图片加载慢
**解决方法 / Solution:**
1. 检查网络连接（图片从外部URL加载）
2. 打开控制台查看是否有 CORS 错误
3. 等待更长时间（首次加载需要下载图片）

#### 问题 3: 黑屏但没有错误 / Black Screen but No Errors
**原因 / Cause:** WebGL 不支持或被禁用
**解决方法 / Solution:**
1. 访问 https://get.webgl.org/ 测试 WebGL 支持
2. 更新显卡驱动
3. 在浏览器设置中启用硬件加速
   - Chrome: 设置 → 系统 → 使用硬件加速
   - Firefox: 首选项 → 常规 → 性能 → 使用推荐的性能设置

#### 问题 4: 图片无法显示 / Images Not Showing
**原因 / Cause:** CORS 政策或网络问题
**解决方法 / Solution:**
- 图片使用外部 URL（Wikimedia Commons）
- 需要互联网连接
- 某些网络可能阻止外部资源

### 浏览器兼容性 / Browser Compatibility

推荐浏览器 / Recommended:
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (需要 WebGL 2.0)

不支持 / Not Supported:
- ❌ IE 11 及更早版本
- ❌ 旧版移动浏览器

### 快速修复 / Quick Fixes

```bash
# 1. 重新安装依赖 / Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 2. 清除缓存并重启 / Clear cache and restart
npm run dev -- --force

# 3. 使用不同端口 / Use different port
npm run dev -- --port 3000
```

### 性能优化 / Performance Optimization

如果运行缓慢 / If running slowly:

1. **降低像素比 / Reduce Pixel Ratio**
   编辑 `main.js` 第 126 行：
   ```javascript
   renderer.setPixelRatio(1); // 而不是 window.devicePixelRatio
   ```

2. **禁用阴影 / Disable Shadows**
   编辑 `main.js` 第 129 行：
   ```javascript
   renderer.shadowMap.enabled = false;
   ```

3. **减少画质 / Reduce Quality**
   编辑 `main.js` 第 125 行：
   ```javascript
   antialias: false
   ```

### 调试模式 / Debug Mode

在控制台输入以下命令查看场景信息 / Enter in console:

```javascript
// 查看场景中的所有对象
console.log('Scene children:', scene.children);

// 查看相机位置
console.log('Camera position:', camera.position);

// 查看当前场景状态
console.log('Current scene:', currentScene);
```

### 获取帮助 / Getting Help

如果以上方法都不行 / If nothing works:

1. 截屏控制台错误信息 / Screenshot console errors
2. 记录浏览器类型和版本 / Note browser type and version
3. 记录操作系统 / Note operating system
4. 记录最后显示的控制台消息 / Note last console message

## 联系方式 / Contact

创建 Issue 并提供以上信息。
Create an issue with the above information.
