# ADR 0002: メモ状態、競合検出、自動保存、ユーザー設定の基盤

- 状態: Accepted / Implemented
- 決定日: 2026-08-10
- 対象: お気に入り、アーカイブ、ゴミ箱、自動保存、プロフィール、テーマ
- 詳細仕様: [`../features/memo-lifecycle-autosave-settings.md`](../features/memo-lifecycle-autosave-settings.md)

## Context

決定時点の`memos`は作成・読取・更新・即時DELETEに対応するが、アクティブ、アーカイブ、ゴミ箱を区別する状態を持たなかった。画面上にはお気に入り、アーカイブ、ゴミ箱、設定の導線があるものの、実データやルートへ接続されていなかった。

編集は明示保存だけであり、複数タブから同じメモを編集した場合は後から保存した内容が先の更新を上書きできた。テーマはCSSの`prefers-color-scheme`だけに追従し、ユーザーがサイト内で選択・保存できなかった。サイドバーのプロフィールもサンプル値だった。

本決定は2026-08-10に、バージョン管理されたSupabaseマイグレーション、アプリケーション実装、Jestテスト、実ブラウザ検証を伴って適用された。

既存のowner ID、RLS、列権限、security-invoker関数、URLを正本とする検索契約を維持しつつ、データ損失を防ぐ加算的な設計が必要である。

## Decision

### 1. ライフサイクルは`memos`のnullable日時列で表現する

- `favorited_at`、`archived_at`、`trashed_at`を`memos`へ追加する。
- booleanではなく日時を使い、状態の有無と各ビューの安定した既定順を同じ列で表現する。
- アクティブは`archived_at is null and trashed_at is null`とする。
- ゴミ箱移動時は`archived_at`をnullにし、復元先を常にアクティブへ統一する。
- お気に入り日時はアーカイブ／ゴミ箱でも保持するが、お気に入り一覧はアクティブだけを返す。
- 状態操作だけでは本文の`updated_at`を変えない。

### 2. 完全削除はゴミ箱内へDB境界で限定する

- 既存DELETE RLSを、所有者一致に加えて`trashed_at is not null`を要求する形へ変更する。
- 通常の削除操作はUPDATEによるゴミ箱移動へ置き換える。
- ゴミ箱外のDELETEは、古い画面、改ざんしたリクエスト、直接APIのいずれでも拒否する。
- ゴミ箱の自動削除は初期版へ含めず、ユーザーの明示操作だけで完全削除する。

### 3. 自動保存の競合検出に単調増加`revision`を使う

- `memos.revision bigint not null default 1`を追加する。
- 内容、カテゴリ、タグの保存要求は`expected_revision`を持ち、DB上の値と一致した場合だけ更新する。
- 成功時にrevisionを1増やし、メモ本体とタグ差し替えを同一DB関数内で完了する。
- ライフサイクル操作はrevisionを増やさないが、ゴミ箱メモの内容保存は拒否する。
- 競合時はlast-write-winsや自動マージをせず、ユーザーへ再読込を求める。

### 4. 状態ビューと並び順はURLと統合検索関数で扱う

- `/memos?view=favorites|archive|trash`を正規URLとし、既定のアクティブビューでは`view`を省略できる。
- ビュー、本文、カテゴリ、タグ、ページ、並び順はサーバーで検証する。
- 既存デプロイとの互換性を保つため、状態条件を追加した検索は`search_memos_v2`として追加する。
- ORDER BYは許可済みキーからSQL内で選択し、ユーザー入力をSQL断片として連結しない。

### 5. 表示名とテーマはowner限定`profiles`へ保存する

- `profiles.owner_id`を`auth.users(id)`参照の主キーとする。
- `display_name`と`theme`だけを保持し、Authが正本であるメールアドレスは複製しない。
- themeは`system / light / dark`へCHECK制約で限定する。
- 行は初回設定保存時にupsertし、全既存ユーザーへのバックフィルを要求しない。
- RLSと列権限で、自分のプロフィールのSELECT／INSERT／UPDATEだけを許可する。

### 6. 初期テーマはサーバーHTMLで確定する

- 認証済みレイアウトはプロフィールと既存シェルデータを並列取得する。
- `light`または`dark`は`<html data-theme>`へ設定し、初回描画後のテーマ反転を避ける。
- `system`または未認証時は明示属性を付けず、`prefers-color-scheme`へ追従する。
- localStorageだけを正本にせず、別端末でも同じ設定を再現する。

### 7. 未実装操作は表示しない

- 通知、グリッド切替、プラン表示など本仕様外の操作は、実装までボタンとして表示しない。
- クイックメモは既存の`/memos/new`へ接続し、アカウント操作は`/settings`へ接続する。
- 操作可能に見えるUIと実際の振る舞いを一致させることを機能実装の一部とする。

## Consequences

### Positive

- nullable列の追加だけで既存メモをアクティブとして維持できる。
- 誤削除を復元でき、完全削除の安全条件をDBでも保証できる。
- 日時列を状態別の既定順と監査に利用できる。
- 複数タブの黙った上書きをrevisionで防げる。
- RLS、owner ID、security-invokerという既存のセキュリティモデルを維持できる。
- テーマが初回描画から安定し、端末間で同期する。
- 画面上のプレースホルダー操作が減り、ユーザーの期待と実装が一致する。

### Negative

- 検索関数、一覧モデル、詳細、編集、ナビゲーションのすべてに状態条件が増える。
- 自動保存はdebounce、in-flight制御、競合、離脱ガードという複数の非同期状態を持つ。
- シェルでプロフィールを取得するDB往復が増える。
- ゴミ箱外DELETEを禁止すると、移行中の旧クライアントでは削除が安全に失敗する。
- 初期版では競合内容の自動マージや履歴復元を提供しない。

## Rejected alternatives

### 状態を単一enum列で持つ

アクティブ／アーカイブ／ゴミ箱は表現できるが、お気に入りは独立した直交状態であり、状態変更日時も別列が必要になる。単一enumへ組み合わせを増やすと不正状態と遷移分岐が増えるため採用しない。

### boolean列だけを使う

状態の有無は表現できるが、アーカイブ順、ゴミ箱移動順、お気に入り登録順のために追加日時が必要になる。日時列だけで両方を表現する。

### ライフサイクル履歴テーブルを最初から作る

監査履歴には有効だが、個人メモMVPの復元要件に対して書き込み・取得・RLSが過剰になる。完全な履歴要件が承認された時点で再評価する。

### last-write-winsで自動保存する

実装は短いが、複数タブや遅い応答で新しい内容を黙って失う。個人メモでもデータ損失の影響が大きいため採用しない。

### 更新日時を楽観ロックに使う

時刻精度、状態更新との意味の混在、比較の扱いが不明瞭になる。単調増加整数のrevisionを専用に持つ。

### テーマをlocalStorageだけへ保存する

別端末へ同期できず、SSRの初期HTMLと値がずれてテーマが点滅しやすい。認証ユーザーはDBを正本とする。

### `auth.users.raw_user_meta_data`へアプリ設定を保存する

アプリのRLS、列制約、更新権限、将来拡張を公開テーブルほど明確に管理しにくい。owner限定profilesを採用する。

### 既存`search_memos`を即時置換する

DB適用とアプリデプロイの間で関数シグネチャがずれる可能性がある。v2を加算し、切替確認後に旧関数を廃止する。

## Review triggers

次のいずれかが起きた場合、このADRを再検討する。

- メモの状態変更履歴や任意時点復元がMustになる。
- ゴミ箱の保持期限と自動削除が必要になる。
- 共同編集やリアルタイム同期によりrevisionだけでは競合を表現できなくなる。
- 自動保存のDB負荷が目標を超え、ローカルファースト同期が必要になる。
- プロフィール画像、課金、チーム権限によりprofilesの責務が拡大する。
- 状態ビュー追加後の検索p95が500msを継続して超える。

## References

- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: Column Level Security](https://supabase.com/docs/guides/database/postgres/column-level-security)
- [Supabase: Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data)
- [PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
