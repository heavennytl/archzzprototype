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
- Today’s Free 展示完整免费池（演示口径：500 个 SketchUp＋500 个 3ds Max），每日随机排序，跨类型共可免费解锁 3 个
- Free 模型不进入 Cart：额度内直接解锁，额度用完后确认并进入单模型 Checkout
- Buy once、Pro、Max、Cart 和模拟 Checkout
- 登录后恢复收藏、加购、领取和购买动作
- My Assets、Favorites、Plan & Unlocks
- Guest、新用户、Legacy、Pro、Max、Pro/Max + Legacy 及续费处理中的独立演示状态
- Pending 订单继续支付时锁定原支付渠道，不重新选择权益或产生新订单

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
