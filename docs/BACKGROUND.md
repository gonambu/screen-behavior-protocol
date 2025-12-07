# UIDP 背景ドキュメント

このドキュメントでは、UIDPが生まれた背景、解決しようとしている課題、および競合との比較について記述します。

---

## 課題認識

### AIコード生成時代のUI設計

2024年以降、AIによるコード生成が実用レベルに達し、開発ワークフローが変化しています。

```
従来:  要件 → 設計 → 実装(人間) → テスト → リリース
現在:  要件 → ??? → 実装(AI+人間) → テスト → リリース
```

「???」の部分、つまり**AIへの入力として適切な設計ドキュメント**が不在です。

### 既存手法の限界

#### 1. デザインカンプ（Figma等）

```
強み: 視覚的に美しい、デザイナーが使いやすい
弱み: 状態遷移、条件分岐、データフローを表現できない
      「ローディング中はSpinnerを表示」が伝わらない
```

#### 2. 自然言語の仕様書

```
強み: 柔軟に何でも書ける
弱み: 曖昧、解釈が分かれる、網羅性の担保が難しい
      「ボタンをクリックしたら保存する」→ どこに？エラー時は？
```

#### 3. 実装コード

```
強み: 完全で曖昧さがない
弱み: 詳細すぎる、設計意図が埋もれる
      「なぜこの実装なのか」が読み取れない
```

### 必要なもの

1. **人間が読み書きできる**（レビュー可能）
2. **AIが確実に解釈できる**（構造化されている）
3. **UI特有の概念をカバーする**（状態、条件分岐、遷移、バリデーション）
4. **フレームワーク非依存**（React/Vue/Flutter等で使える）

---

## 競合調査

### 1. 学術・標準化の取り組み

#### UIML (User Interface Markup Language)

- **概要**: XMLベースのUI記述言語。OASIS標準（2008年）
- **特徴**: デバイス非依存のUI記述を目指す
- **状態**: 標準化済みだが、実用ツールチェーンがほぼ存在しない
- **URL**: [UIML Wikipedia](https://en.wikipedia.org/wiki/UIML)

```xml
<!-- UIMLの例 -->
<uiml>
  <interface>
    <structure>
      <part id="top" class="VBox">
        <part id="hello" class="String"/>
        <part id="button1" class="Button"/>
      </part>
    </structure>
  </interface>
</uiml>
```

#### MARIA XML

- **概要**: 抽象UI→具象UIの多段階変換モデル
- **特徴**: 学術的に完成度が高い
- **状態**: W3Cに提出されたが、実用ツールは限定的
- **URL**: [MARIA XML Wikipedia](https://en.wikipedia.org/wiki/MARIA_XML)

**評価**: 学術的には優れているが、実務で使うにはツールチェーンが不足。

---

### 2. Server-Driven UI (SDUI) フレームワーク

#### DivKit (Yandex)

- **概要**: オープンソースのSDUIフレームワーク
- **特徴**: iOS/Android/Web対応、本番運用実績豊富
- **用途**: アプリ更新なしでUIを変更する
- **URL**: [github.com/divkit/divkit](https://github.com/divkit/divkit)

```json
{
  "type": "container",
  "items": [
    {
      "type": "text",
      "text": "Hello, World!"
    }
  ]
}
```

#### PhonePe LiquidUI

- **概要**: PhonePeの内製SDUIフレームワーク
- **特徴**: ワークフロー+UI定義
- **URL**: [PhonePe Tech Blog](https://tech.phonepe.com/introducing-liquidui-phonepes-server-driven-ui-framework/)

**評価**: 最も近い競合。ただし目的が「ランタイム実行」であり、「設計ドキュメント」としての可読性は重視していない。

---

### 3. フォーム特化ソリューション

#### JSON Forms

- **概要**: JSON Schema → フォームUI生成
- **特徴**: データスキーマからUIを自動生成
- **URL**: [jsonforms.io](https://jsonforms.io/)

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" }
  }
}
```

#### React JSON Schema Form (RJSF)

- **概要**: JSON Schema + UI Schemaでフォーム生成
- **特徴**: uiSchemaでウィジェットをカスタマイズ
- **URL**: [rjsf-team.github.io](https://rjsf-team.github.io/react-jsonschema-form/)

**評価**: フォームに限定。画面全体のレイアウトや遷移は扱わない。

---

### 4. デザイントークン標準

#### W3C Design Tokens

- **概要**: デザインの基本値（色、間隔等）の標準フォーマット
- **状態**: 2025年10月に安定版リリース
- **URL**: [designtokens.org](https://www.designtokens.org/)

```json
{
  "colors": {
    "primary": {
      "$value": "#1976d2",
      "$type": "color"
    }
  }
}
```

#### Tokens Studio

- **概要**: Figma連携のデザイントークン管理
- **URL**: [tokens.studio](https://tokens.studio/)

**評価**: スタイル値の標準。UIの構造・振る舞いは範囲外。UIDPと補完関係にある。

---

### 5. デザインツール連携

#### Figma API / JSON

- **概要**: デザインファイルの構造をJSON出力
- **特徴**: 見た目の構造は取れる
- **限界**: 振る舞い・遷移・状態管理の情報はない

#### Design-to-JSON Plugins

- **概要**: Figmaから構造化JSONを出力
- **限界**: 静的な構造のみ

**評価**: 見た目の入力としては有用だが、振る舞いは別途定義が必要。

---

## ポジショニング

```
                  構造のみ ─────────────────── 振る舞い含む
                       │
    Figma JSON         │
    Design Tokens      │
                       │
  ─────────────────────┼─────────────────────
  実行可能             │             ドキュメント
  (ランタイム)          │             (設計記述)
                       │
    DivKit             │          ★ UIDP
    JSON Forms         │          UIML/MARIA
    LiquidUI           │
                       │
```

### UIDPの独自ポジション

| 観点 | UIDP | DivKit | JSON Forms | Figma |
|------|------|--------|------------|-------|
| 目的 | 設計ドキュメント | ランタイム実行 | フォーム生成 | ビジュアルデザイン |
| 可読性 | 高（YAML） | 中（JSON） | 中 | 高 |
| 振る舞い | ○ | ○ | △（フォームのみ） | × |
| 状態管理 | ○ | ○ | △ | × |
| 画面遷移 | ○ | △ | × | × |
| AI親和性 | 高 | 中 | 中 | 低 |

---

## UIDPが選ばれる理由

### 1. 設計ドキュメントとして使える

DivKitはランタイム実行を目的としているため、人間が読んで「設計意図」を理解するには適していません。UIDPは**人間が読み書きすることを第一に設計**しています。

### 2. 画面全体をカバーする

JSON Formsはフォームに特化しています。UIDPは**画面全体の構造、状態、遷移**を一体で記述できます。

### 3. AIフレンドリー

Figmaは視覚的ですが、AIが「条件分岐」「状態遷移」を理解するには不向きです。UIDPは**AIが確実に解釈できる構造化テキスト**です。

### 4. フレームワーク非依存

特定のフレームワークに依存せず、**マッピングで任意のフレームワークに変換**できます。

---

## 参考文献

### 学術

- Abrams, M., et al. (1999). UIML: An Appliance-Independent XML User Interface Language. *Computer Networks*.
- Paternò, F., et al. (2009). MARIA: A universal, declarative, multiple abstraction level language for service-oriented applications. *ACM TOCHI*.

### 業界

- [Server-Driven UI Basics - Apollo GraphQL](https://www.apollographql.com/docs/graphos/schema-design/guides/sdui/basics)
- [Design Tokens and how a W3C specification will help going forward](https://backlight.dev/blog/design-tokens)

### ツール

- [DivKit GitHub](https://github.com/divkit/divkit)
- [JSON Forms](https://jsonforms.io/)
- [W3C Design Tokens](https://www.designtokens.org/)
- [Tokens Studio](https://tokens.studio/)
