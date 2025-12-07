# UIDP実装デモ: シンプルToDo

`simple-todo.uidp.yaml` と `SPEC.md` の情報のみから実装したReactアプリケーション。

## 起動方法

```bash
npm install
npm run dev
```

## 実装所感

### UIDPの良かった点

1. **状態設計が明確**
   - `globals` vs `state` の分離がそのままContext設計に直結
   - `persist: true` で永続化の意図が明確（実装はlocalStorageを選択）

2. **computedのクエリ形式が直感的**
   ```yaml
   remainingCount:
     count: todos
     where: not completed
   ```
   これが `todos.filter(t => !t.completed).length` に直接マッピングできた

3. **アクションのsteps記述が実装の設計図に**
   - `create`, `update`, `delete` の操作が明確
   - `position: beginning` で配列への追加位置まで指定

4. **画面遷移（flows）が理解しやすい**
   - `navigate(TodoDetail, { id: todo.id })` がそのままReact Routerの設計に

5. **UIの階層構造がそのままJSXに**
   - `Card > Stack > TextField` のような構造がコンポーネントツリーに直接対応

### 改善余地・気づき

1. **トークン参照の解決**
   - `tokens.spacing.lg` のような参照を実際の値に変換する仕組みが別途必要
   - 今回はMUIのspacingで代替

2. **バリデーションルールの表現**
   - `disabled: newTodoText is empty` は明確だが、複雑なバリデーションはどう表現する？

3. **イベントハンドラの`bubble: false`**
   - `e.stopPropagation()` に対応することは分かるが、実装者が意識しないと漏れる可能性

4. **型の厳密さ**
   - `datetime` 型がstring (ISO8601) として実装されたが、Date型との使い分けは？

### UIDPからの実装マッピング

| UIDP定義 | React実装 |
|---------|----------|
| `globals.todos` | `TodoContext` |
| `persist: true` | `localStorage` + `useEffect` |
| `state.newTodoText` | `useState('')` |
| `computed.remainingCount` | `useMemo(() => filter().length)` |
| `on:click: actions.xxx` | `onClick={handleXxx}` |
| `navigate(Screen, params)` | `useNavigate()` |
| `confirm: { title, message }` | MUI `Dialog` |
| `toast: success()` | MUI `Snackbar` + `Alert` |
| `match: isEditing` | 三項演算子 or `&&` |
| `each: todos as: todo` | `todos.map(todo => ...)` |

### 結論

UIDPは「画面仕様書」として十分に機能した。特に:

- **曖昧さの排除**: 状態管理、画面遷移、UIの構造が全て明文化されている
- **実装の指針**: YAMLの構造がそのまま実装のアーキテクチャになる
- **確認の容易さ**: 実装後にUIDPと照らし合わせて漏れを確認できる

AIによるコード生成の入力としても、自然言語より遥かに一貫した出力が期待できる。
