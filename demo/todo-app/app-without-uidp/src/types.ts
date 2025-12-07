// 図から読み取れる情報で型を定義
// 詳細画面に「作成日」「更新日」があるのでそれも含める

export interface Todo {
  id: string;
  text: string;
  description: string;  // 図に「詳細（任意）」とあるが、?を付けるかは判断が分かれる
  completed: boolean;
  createdAt: Date;      // string vs Date の判断が必要
  updatedAt: Date;
}
