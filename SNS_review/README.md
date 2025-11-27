# YouTube Shorts動画情報管理システム

## 概要

YouTube Shortsの動画情報を取得し、視聴回数、いいね数、コメント数などのデータを管理するシステムです。

## 機能

- YouTube動画情報の取得と保存
- 動画統計データの時系列管理
- 動画情報の一覧表示
- 統計情報の表示と分析
- YouTube Shortsの検索機能
- 動画情報の自動更新

## セットアップ

### 1. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 2. YouTube APIキーの設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. YouTube Data API v3を有効化
3. APIキーを作成
4. `.env`ファイルを作成し、以下の内容を記述:

```
YOUTUBE_API_KEY=your_api_key_here
```

または、環境変数として設定:

```bash
export YOUTUBE_API_KEY=your_api_key_here
```

## 使用方法

### 動画を追加

```bash
python main.py add "https://youtube.com/watch?v=VIDEO_ID"
# または
python main.py add VIDEO_ID
```

### 動画一覧を表示

```bash
python main.py list
# 表示件数を指定
python main.py list -n 20
```

### 動画情報を更新

```bash
python main.py update VIDEO_ID
```

### すべての動画を更新

```bash
python main.py update-all
```

### 統計情報を表示

```bash
# 全体統計
python main.py stats

# 特定の動画の統計履歴
python main.py stats VIDEO_ID
```

### YouTube Shortsを検索

```bash
python main.py search "検索キーワード"
```

## データベース

SQLiteデータベース（`youtube_shorts.db`）に以下の情報が保存されます:

- 動画情報（タイトル、説明、チャンネル情報など）
- 動画統計（視聴回数、いいね数、コメント数）
- 統計履歴（時系列データ）
- チャンネル情報

## 注意事項

- YouTube Data API v3には使用制限があります（1日あたりのクォータ）
- APIキーは安全に管理してください
- 大量の動画を一度に更新する場合は、API制限に注意してください

