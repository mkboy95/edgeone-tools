# EdgeOne Pages 部署指南

本项目已适配 [腾讯云 EdgeOne Pages](https://edgeone.ai)，可以免费部署静态网站和 Edge Functions。

## 与 Cloudflare Workers 的区别

| 特性 | Cloudflare Workers | EdgeOne Pages |
|------|-------------------|---------------|
| 计算平台 | Workers | Edge Functions |
| KV 存储 | Cloudflare KV | EdgeKV |
| 免费额度 | 10万次/天 | 100万次/月 |
| 静态托管 | Pages | Pages |

## 部署步骤

### 1. 注册 EdgeOne 账号

访问 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone) 注册账号。

### 2. 创建 EdgeKV 命名空间

在 EdgeOne 控制台中：
1. 进入 **边缘函数 > EdgeKV**
2. 创建一个命名空间：
   - `TOOLS_KV` - 用于存储所有工具数据（包括访问统计和 P2P 文件传输）

### 3. 创建 Pages 项目

1. 进入 **Pages**
2. 点击 **创建项目**
3. 选择代码仓库或上传代码
4. 构建配置：
   - 构建命令：`npm run build`
   - 输出目录：`dist`

### 4. 配置环境变量

在 Pages 项目的设置中，添加 EdgeKV 绑定：
- `TOOLS_KV` → 绑定到 TOOLS_KV 命名空间

### 5. 部署

点击部署按钮，等待构建完成。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（前端）
npm run dev

# 构建项目
npm run build
```

注意：EdgeOne 目前没有本地模拟器，API 功能需要部署后才能测试。

## 项目结构

```
├── edgeone/              # EdgeOne Edge Functions
│   ├── index.ts          # 入口文件
│   ├── app.ts            # Hono 应用
│   ├── types.ts          # 类型定义
│   ├── middleware/       # 中间件
│   └── routes/           # 路由
├── src/                  # 前端源代码
├── dist/                 # 构建输出
└── edgeone.config.js     # EdgeOne 配置
```

## 注意事项

1. **EdgeKV 与 Cloudflare KV 的区别**：
   - API 基本相同（get/put/delete/list）
   - EdgeKV 的 list 返回格式略有不同（`list_complete` vs `list_complete`）

2. **免费额度**：
   - EdgeOne Edge Functions：100万次调用/月
   - EdgeKV 读取：1000万次/月
   - EdgeKV 写入：100万次/月

3. **平台特定代码**：
   - 入口文件：`edgeone/index.ts`
   - 类型定义：`edgeone/types.ts`
   - 路由逻辑与 Cloudflare Workers 版本相同

## 故障排除

### Edge Function 未生效
- 检查 `edgeone.config.js` 中的路由配置
- 确保 Edge Function 文件路径正确

### KV 存储错误
- 确认 EdgeKV 命名空间已创建
- 检查环境变量绑定是否正确

### 构建失败
- 确保 Node.js 版本 >= 18
- 检查 `dist` 目录是否正确生成
