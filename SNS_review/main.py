"""
YouTube Shorts動画情報管理システム
メインアプリケーション
"""
import argparse
import sys
from datetime import datetime
from youtube_api import YouTubeAPI
from data_manager import DataManager


class YouTubeShortsManager:
    """YouTube Shorts管理クラス"""
    
    def __init__(self):
        """初期化"""
        try:
            self.api = YouTubeAPI()
            self.db = DataManager()
        except ValueError as e:
            print(f"初期化エラー: {e}")
            print("\n使用方法:")
            print("1. .envファイルを作成し、YOUTUBE_API_KEYを設定する")
            print("2. または環境変数YOUTUBE_API_KEYを設定する")
            sys.exit(1)
    
    def add_video(self, video_url_or_id: str):
        """
        動画を追加
        
        Args:
            video_url_or_id: YouTube動画URLまたは動画ID
        """
        print(f"\n動画情報を取得中: {video_url_or_id}")
        
        # URLから動画IDを抽出
        video_id = YouTubeAPI.extract_video_id(video_url_or_id)
        if not video_id:
            print("エラー: 有効なYouTube動画IDまたはURLを入力してください。")
            return
        
        # 動画情報を取得
        video_info = self.api.get_video_info(video_id)
        if not video_info:
            print("エラー: 動画情報の取得に失敗しました。")
            return
        
        # データベースに保存
        if self.db.save_video(video_info):
            print(f"\n✓ 動画を追加しました: {video_info['title']}")
            print(f"  視聴回数: {video_info['view_count']:,}")
            print(f"  いいね数: {video_info['like_count']:,}")
            print(f"  コメント数: {video_info['comment_count']:,}")
        else:
            print("エラー: データベースへの保存に失敗しました。")
    
    def update_video(self, video_id: str):
        """
        動画情報を更新
        
        Args:
            video_id: 動画ID
        """
        print(f"\n動画情報を更新中: {video_id}")
        
        video_info = self.api.get_video_info(video_id)
        if not video_info:
            print("エラー: 動画情報の取得に失敗しました。")
            return
        
        # 更新前の情報を取得
        old_video = self.db.get_video(video_id)
        old_view_count = old_video.get('view_count', 0) if old_video else 0
        
        if self.db.save_video(video_info):
            print(f"\n✓ 動画情報を更新しました: {video_info['title']}")
            view_growth = video_info['view_count'] - old_view_count
            print(f"  視聴回数: {video_info['view_count']:,} ({view_growth:+,})")
        else:
            print("エラー: データベースの更新に失敗しました。")
    
    def update_all_videos(self):
        """すべての動画情報を更新"""
        videos = self.db.get_all_videos()
        
        if not videos:
            print("更新する動画がありません。")
            return
        
        print(f"\n{len(videos)}件の動画を更新中...")
        
        for i, video in enumerate(videos, 1):
            print(f"\n[{i}/{len(videos)}] {video['title']}")
            self.update_video(video['video_id'])
    
    def list_videos(self, limit: int = 10):
        """
        動画一覧を表示
        
        Args:
            limit: 表示件数
        """
        videos = self.db.get_all_videos()
        
        if not videos:
            print("\n動画が登録されていません。")
            return
        
        print(f"\n登録動画一覧 ({len(videos)}件):")
        print("=" * 80)
        
        for i, video in enumerate(videos[:limit], 1):
            print(f"\n{i}. {video['title']}")
            print(f"   動画ID: {video['video_id']}")
            print(f"   チャンネル: {video['channel_title']}")
            print(f"   視聴回数: {video['view_count']:,}")
            print(f"   いいね数: {video['like_count']:,}")
            print(f"   コメント数: {video['comment_count']:,}")
            print(f"   更新日時: {video['updated_at']}")
        
        if len(videos) > limit:
            print(f"\n... 他 {len(videos) - limit}件")
    
    def show_statistics(self, video_id: str = None):
        """
        統計情報を表示
        
        Args:
            video_id: 動画ID（指定した場合はその動画の統計履歴を表示）
        """
        if video_id:
            # 特定の動画の統計履歴
            history = self.db.get_video_statistics_history(video_id)
            video = self.db.get_video(video_id)
            
            if not video:
                print(f"動画ID {video_id} が見つかりません。")
                return
            
            print(f"\n動画統計履歴: {video['title']}")
            print("=" * 80)
            
            if not history:
                print("統計履歴がありません。")
                return
            
            print(f"{'日時':<20} {'視聴回数':>12} {'いいね数':>10} {'コメント数':>10}")
            print("-" * 80)
            
            for stat in reversed(history):  # 古い順に表示
                date = datetime.fromisoformat(stat['recorded_at']).strftime('%Y-%m-%d %H:%M:%S')
                print(f"{date:<20} {stat['view_count']:>12,} {stat['like_count']:>10,} {stat['comment_count']:>10,}")
            
            # 成長率を計算
            if len(history) >= 2:
                old_stat = history[-1]
                new_stat = history[0]
                
                view_growth = new_stat['view_count'] - old_stat['view_count']
                like_growth = new_stat['like_count'] - old_stat['like_count']
                comment_growth = new_stat['comment_count'] - old_stat['comment_count']
                
                print("\n成長:")
                print(f"  視聴回数: {view_growth:+,}")
                print(f"  いいね数: {like_growth:+,}")
                print(f"  コメント数: {comment_growth:+,}")
        else:
            # 全体統計
            summary = self.db.get_statistics_summary()
            
            print("\n全体統計:")
            print("=" * 80)
            print(f"登録動画数: {summary.get('total_videos', 0):,}件")
            print(f"総視聴回数: {summary.get('total_views', 0):,}回")
            print(f"総いいね数: {summary.get('total_likes', 0):,}件")
            print(f"平均視聴回数: {summary.get('average_views', 0):,.0f}回")
    
    def search_shorts(self, query: str, max_results: int = 10):
        """
        YouTube Shortsを検索して表示
        
        Args:
            query: 検索クエリ
            max_results: 最大取得件数
        """
        print(f"\n'{query}' で検索中...")
        
        videos = self.api.search_shorts(query, max_results)
        
        if not videos:
            print("検索結果が見つかりませんでした。")
            return
        
        print(f"\n検索結果 ({len(videos)}件):")
        print("=" * 80)
        
        for i, video in enumerate(videos, 1):
            print(f"\n{i}. {video['title']}")
            print(f"   動画ID: {video['video_id']}")
            print(f"   チャンネル: {video['channel_title']}")
            print(f"   視聴回数: {video['view_count']:,}")
            print(f"   いいね数: {video['like_count']:,}")
            print(f"   URL: https://youtube.com/watch?v={video['video_id']}")


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(
        description='YouTube Shorts動画情報管理システム',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
使用例:
  # 動画を追加
  python main.py add "https://youtube.com/watch?v=VIDEO_ID"
  
  # 動画一覧を表示
  python main.py list
  
  # 動画情報を更新
  python main.py update VIDEO_ID
  
  # すべての動画を更新
  python main.py update-all
  
  # 統計情報を表示
  python main.py stats
  
  # 特定の動画の統計履歴を表示
  python main.py stats VIDEO_ID
  
  # YouTube Shortsを検索
  python main.py search "検索キーワード"
        '''
    )
    
    subparsers = parser.add_subparsers(dest='command', help='コマンド')
    
    # addコマンド
    add_parser = subparsers.add_parser('add', help='動画を追加')
    add_parser.add_argument('video_url_or_id', help='YouTube動画URLまたは動画ID')
    
    # listコマンド
    list_parser = subparsers.add_parser('list', help='動画一覧を表示')
    list_parser.add_argument('-n', '--limit', type=int, default=10, help='表示件数')
    
    # updateコマンド
    update_parser = subparsers.add_parser('update', help='動画情報を更新')
    update_parser.add_argument('video_id', help='動画ID')
    
    # update-allコマンド
    subparsers.add_parser('update-all', help='すべての動画情報を更新')
    
    # statsコマンド
    stats_parser = subparsers.add_parser('stats', help='統計情報を表示')
    stats_parser.add_argument('video_id', nargs='?', help='動画ID（省略時は全体統計）')
    
    # searchコマンド
    search_parser = subparsers.add_parser('search', help='YouTube Shortsを検索')
    search_parser.add_argument('query', help='検索クエリ')
    search_parser.add_argument('-n', '--max-results', type=int, default=10, help='最大取得件数')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    manager = YouTubeShortsManager()
    
    if args.command == 'add':
        manager.add_video(args.video_url_or_id)
    elif args.command == 'list':
        manager.list_videos(args.limit)
    elif args.command == 'update':
        manager.update_video(args.video_id)
    elif args.command == 'update-all':
        manager.update_all_videos()
    elif args.command == 'stats':
        manager.show_statistics(args.video_id)
    elif args.command == 'search':
        manager.search_shorts(args.query, args.max_results)


if __name__ == '__main__':
    main()

