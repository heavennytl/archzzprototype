# ARCHZZ 模型发现与交易交互原型

依据当前产品 PRD 重新构建的前端交互原型，用于产品、UI、开发与商业规则评审。账号、订单、支付和下载均为本地模拟，不会产生真实交易。

## 本地运行

要求 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

打开 `http://localhost:3000/`。

## 原型范围

- 高密度模型首页与核心搜索入口
- SketchUp Models、3ds Max Models、Today’s Free 和 Pricing
- 搜索结果、筛选、排序和固定推荐表达
- 商品卡、商品详情、专业参数和 Quality checked 状态
- 每日 20 个 SketchUp＋20 个 3ds Max 免费模型，跨类型选择 3 个
- Buy once、Pro、Max、Cart 和模拟 Checkout
- 登录后恢复收藏、加购、领取和购买动作
- My Assets、Favorites、Plan & Unlocks
- Guest、Basic、Pro 演示状态和响应式布局

## 设计参考素材

- `design-references/brand/`：品牌字标方案与预览图
- `design-references/homepage-concepts/`：首页视觉方向稿

这些文件仅用于设计回溯，不参与应用运行；线上使用的图片和图标统一放在 `public/`。

## 校验

```bash
npm run lint
npm run build
```

当前模型图片使用远程演示素材，正式产品应接入 ArchZZ 真实商品图片与图片优化链路。
