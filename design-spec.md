# 记账小程序 - 卡通风格设计规范 (Cartoon UI Kit)

## 1. 全局色彩体系 (Color Palette)

色彩体系要求饱和度≥70%、明度≥60%，整体呈现活泼、跳跃的卡通调性。

| 颜色名称 | 变量名 | HEX色值 (亮色) | HEX色值 (暗色) | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **主色 (Primary)** | `--color-primary` | `#FF6B6B` | `#E55353` | 用于重要按钮、强调文字，活泼珊瑚红 |
| **辅色 (Secondary)**| `--color-secondary`| `#FFE66D` | `#E5CF55` | 用于次级按钮、模块背景，明亮黄 |
| **强调色 (Accent)** | `--color-accent` | `#4ECDC4` | `#3BB5AC` | 用于图标、特殊模块背景，清新青色 |
| **警示色 (Danger)** | `--color-danger` | `#EF476F` | `#D13F61` | 录音中、错误提示 |
| **成功色 (Success)**| `--color-success` | `#06D6A0` | `#05B588` | 收入统计等正向数据 |
| **背景色 (Bg)** | `--color-bg` | `#F7F9FC` | `#1A1C23` | 全局基础背景色 |
| **卡片底色 (Card)** | `--color-card-bg` | `#FFFFFF` | `#2D3142` | 卡片及前台元素背景色 |
| **主文本 (Text)** | `--color-text-main`| `#2D3142` | `#F7F9FC` | 用于漫画风粗描边及核心文字 |
| **次文本 (Sub-Text)**| `--color-text-sub` | `#9094A6` | `#A0A5B5` | 用于辅助说明文本 |

## 2. 圆角与边框规范 (Radii & Borders)

- **卡片 (Card)**: 32rpx (`--radius-card`)
- **按钮 (Button)**: 24rpx (`--radius-btn`)
- **头像/圆形 (Avatar)**: 50% (`--radius-avatar`)
- **边框描边**: 4rpx solid `#2D3142` (暗黑模式为 `#0F1115`)，营造漫画线稿感。

## 3. 阴影规范 (Shadows)

为营造立体卡通质感，废弃传统弥散阴影，改用**硬边缘的位移阴影**：
- **漫画硬阴影**: `6rpx 8rpx 0px rgba(45, 49, 66, 1)` (`--shadow-cartoon`)
- **柔和辅助阴影**: `0 8rpx 24rpx rgba(0, 0, 0, 0.12)` (`--shadow-soft`)
- **高光描边**: `inset 0 4rpx 0px rgba(255, 255, 255, 0.6)` (`--highlight-inner`)

## 4. 字体规范 (Typography)

优先加载系统内置及免费商用卡通字体：
`font-family: 'ZCOOL KuaiLe', 'Source Han Sans Heavy', 'Comic Sans MS', 'Fredoka One', 'PingFang SC', sans-serif;`
- 大标题: 36rpx (18px)，字重 900
- 按钮/卡片标题: 32rpx (16px)，字重 900
- 正文: 28rpx (14px)，字重 bold
- 辅助/标签: 24rpx (12px)，字重 bold
- 行高: 1.5 - 1.8

## 5. 交互动画规范 (Animations)

所有可点击元素（卡片、按钮、图标）需挂载 `.bounce-click` 类。
- **动效**: 弹性缩放动画
- **Transform**: `scale(1) -> scale(0.95) -> scale(1)`
- **Duration**: `150ms`
- **Timing Function**: `cubic-bezier(0.68, -0.55, 0.27, 1.55)` (提供回弹果冻感)
- **性能优化**: 强制开启 `will-change: transform`

---

## 附件：样式变量映射表 (SCSS & CSS)

```scss
// SCSS 变量映射示例 (用于外部编译系统)
$cartoon-primary: #FF6B6B;
$cartoon-secondary: #FFE66D;
$cartoon-accent: #4ECDC4;
$cartoon-text-main: #2D3142;
$cartoon-border: 4rpx solid $cartoon-text-main;
$cartoon-shadow: 6rpx 8rpx 0px $cartoon-text-main;
```
