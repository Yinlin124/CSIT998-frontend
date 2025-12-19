# CSIT998 - 前端

## 项目概述
这是一个基于 Next.js 的现代化前端项目，使用 TypeScript 和 Tailwind CSS 构建。项目包含了用户认证、仪表盘、练习、个人资料等功能模块。

## 项目结构

```
CSIT998-frontend/
├── app/                    # 应用主目录
│   ├── auth/               # 认证相关页面
│   │   ├── login/          # 登录页面
│   │   └── signup/         # 注册页面
│   ├── dashboard/          # 仪表盘页面
│   ├── library/            # 资源库页面(订阅功能)
│   ├── practice/           # 练习页面
│   ├── profile/            # 个人资料页面
│   ├── solver/             # 解题器页面
│   └── speak/              # 语音相关页面
├── components/             # 可复用组件
│   ├── ui/                 # UI 组件库
│   └── theme-provider.tsx  # 主题提供者
├── public/                 # 静态资源
└── styles/                 # 全局样式
```

## 环境要求

- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本 或 pnpm 8.0.0 或更高版本

## 安装依赖

```bash
# 使用 npm
npm install

# 或者使用 pnpm (推荐)
pnpm install
```

## 开发环境

### 启动开发服务器

```bash
npm run dev
# 或者
pnpm dev
```

开发服务器将在 [http://localhost:3000](http://localhost:3000) 启动。

## 功能页面说明

### 修改页面

1. **登录/注册页面**
   - 文件位置: `app/auth/login/page.tsx` 和 `app/auth/signup/page.tsx`
   - 修改认证逻辑和表单验证

2. **仪表盘**
   - 文件位置: `app/dashboard/page.tsx`
   - 修改主界面布局和功能组件

3. **练习页面**
   - 文件位置: `app/practice/page.tsx`
   - 修改练习题目和交互逻辑

4. **个人资料**
   - 文件位置: `app/profile/page.tsx`
   - 修改用户信息展示和编辑功能

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript 5
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI, shadcn/ui
- **状态管理**: React Hooks
- **表单处理**: React Hook Form
- **图标**: Lucide Icons
