# Dashboard SBP Implementation

`dashboard.sbp.yaml` を React + MUI で実装したサンプルです。

## 技術スタック

- React 18 + TypeScript
- Material-UI (MUI) v5
- React Router v6
- Vite

## 起動方法

```bash
npm install
npm run dev
```

## 画面構成

| 画面 | ルート | 説明 |
|------|--------|------|
| Dashboard | `/dashboard` | タブ付きダッシュボード（概要/売上/ユーザー） |
| DataManagement | `/data` | データのCRUD操作 |
| Settings | `/settings` | 通知・表示設定 |

## SBP → React 対応表

| SBP | React |
|-----|-------|
| `state.xxx` | `useState` |
| `computed.xxx` | `useMemo` |
| `on:click` | `onClick` |
| `navigate(Screen)` | `useNavigate()` |
| `Drawer variant: persistent` | `<Drawer variant="persistent">` |
