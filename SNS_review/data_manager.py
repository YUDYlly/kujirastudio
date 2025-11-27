"""
データベース管理モジュール
SQLiteを使用して動画情報を保存・管理
"""
import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Optional
import config


class DataManager:
    """データベース管理クラス"""
    
    def __init__(self, db_path: str = None):
        """
        初期化
        
        Args:
            db_path: データベースファイルのパス
        """
        self.db_path = db_path or config.DATABASE_PATH
        self.init_database()
    
    def init_database(self):
        """データベースとテーブルを初期化"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 動画情報テーブル
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                video_id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                channel_id TEXT,
                channel_title TEXT,
                published_at TEXT,
                duration INTEGER,
                view_count INTEGER,
                like_count INTEGER,
                comment_count INTEGER,
                thumbnail_url TEXT,
                tags TEXT,
                category_id TEXT,
                created_at TEXT,
                updated_at TEXT
            )
        ''')
        
        # 動画統計履歴テーブル（時系列データを保存）
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS video_statistics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id TEXT,
                view_count INTEGER,
                like_count INTEGER,
                comment_count INTEGER,
                recorded_at TEXT,
                FOREIGN KEY (video_id) REFERENCES videos (video_id)
            )
        ''')
        
        # チャンネル情報テーブル
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS channels (
                channel_id TEXT PRIMARY KEY,
                channel_title TEXT,
                subscriber_count INTEGER,
                video_count INTEGER,
                view_count INTEGER,
                created_at TEXT,
                updated_at TEXT
            )
        ''')
        
        # インデックスを作成
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_video_statistics_video_id 
            ON video_statistics(video_id)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_video_statistics_recorded_at 
            ON video_statistics(recorded_at)
        ''')
        
        conn.commit()
        conn.close()
    
    def save_video(self, video_info: Dict) -> bool:
        """
        動画情報を保存または更新
        
        Args:
            video_info: 動画情報の辞書
        
        Returns:
            成功した場合True
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            now = datetime.now().isoformat()
            
            # 既存の動画かチェック
            cursor.execute('SELECT video_id FROM videos WHERE video_id = ?', 
                         (video_info['video_id'],))
            exists = cursor.fetchone()
            
            if exists:
                # 更新
                cursor.execute('''
                    UPDATE videos SET
                        title = ?,
                        description = ?,
                        channel_id = ?,
                        channel_title = ?,
                        published_at = ?,
                        duration = ?,
                        view_count = ?,
                        like_count = ?,
                        comment_count = ?,
                        thumbnail_url = ?,
                        tags = ?,
                        category_id = ?,
                        updated_at = ?
                    WHERE video_id = ?
                ''', (
                    video_info.get('title', ''),
                    video_info.get('description', ''),
                    video_info.get('channel_id', ''),
                    video_info.get('channel_title', ''),
                    video_info.get('published_at', ''),
                    video_info.get('duration', 0),
                    video_info.get('view_count', 0),
                    video_info.get('like_count', 0),
                    video_info.get('comment_count', 0),
                    video_info.get('thumbnail_url', ''),
                    video_info.get('tags', ''),
                    video_info.get('category_id', ''),
                    now,
                    video_info['video_id']
                ))
            else:
                # 新規作成
                cursor.execute('''
                    INSERT INTO videos (
                        video_id, title, description, channel_id, channel_title,
                        published_at, duration, view_count, like_count,
                        comment_count, thumbnail_url, tags, category_id,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    video_info['video_id'],
                    video_info.get('title', ''),
                    video_info.get('description', ''),
                    video_info.get('channel_id', ''),
                    video_info.get('channel_title', ''),
                    video_info.get('published_at', ''),
                    video_info.get('duration', 0),
                    video_info.get('view_count', 0),
                    video_info.get('like_count', 0),
                    video_info.get('comment_count', 0),
                    video_info.get('thumbnail_url', ''),
                    video_info.get('tags', ''),
                    video_info.get('category_id', ''),
                    now,
                    now
                ))
            
            # 統計履歴を保存
            cursor.execute('''
                INSERT INTO video_statistics (
                    video_id, view_count, like_count, comment_count, recorded_at
                ) VALUES (?, ?, ?, ?, ?)
            ''', (
                video_info['video_id'],
                video_info.get('view_count', 0),
                video_info.get('like_count', 0),
                video_info.get('comment_count', 0),
                now
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"データベース保存エラー: {e}")
            return False
    
    def get_video(self, video_id: str) -> Optional[Dict]:
        """
        動画情報を取得
        
        Args:
            video_id: 動画ID
        
        Returns:
            動画情報の辞書。見つからない場合はNone
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM videos WHERE video_id = ?', (video_id,))
            row = cursor.fetchone()
            
            conn.close()
            
            if not row:
                return None
            
            columns = [description[0] for description in cursor.description]
            return dict(zip(columns, row))
            
        except Exception as e:
            print(f"データベース取得エラー: {e}")
            return None
    
    def get_all_videos(self, order_by: str = 'updated_at DESC') -> List[Dict]:
        """
        すべての動画情報を取得
        
        Args:
            order_by: ソート順（デフォルト: updated_at DESC）
        
        Returns:
            動画情報のリスト
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(f'SELECT * FROM videos ORDER BY {order_by}')
            rows = cursor.fetchall()
            
            conn.close()
            
            if not rows:
                return []
            
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
            
        except Exception as e:
            print(f"データベース取得エラー: {e}")
            return []
    
    def get_video_statistics_history(self, video_id: str, limit: int = 100) -> List[Dict]:
        """
        動画の統計履歴を取得
        
        Args:
            video_id: 動画ID
            limit: 取得件数
        
        Returns:
            統計履歴のリスト
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM video_statistics
                WHERE video_id = ?
                ORDER BY recorded_at DESC
                LIMIT ?
            ''', (video_id, limit))
            
            rows = cursor.fetchall()
            conn.close()
            
            if not rows:
                return []
            
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
            
        except Exception as e:
            print(f"統計履歴取得エラー: {e}")
            return []
    
    def save_channel(self, channel_info: Dict) -> bool:
        """
        チャンネル情報を保存または更新
        
        Args:
            channel_info: チャンネル情報の辞書
        
        Returns:
            成功した場合True
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            now = datetime.now().isoformat()
            
            cursor.execute('SELECT channel_id FROM channels WHERE channel_id = ?',
                         (channel_info['channel_id'],))
            exists = cursor.fetchone()
            
            if exists:
                cursor.execute('''
                    UPDATE channels SET
                        channel_title = ?,
                        subscriber_count = ?,
                        video_count = ?,
                        view_count = ?,
                        updated_at = ?
                    WHERE channel_id = ?
                ''', (
                    channel_info.get('channel_title', ''),
                    channel_info.get('subscriber_count', 0),
                    channel_info.get('video_count', 0),
                    channel_info.get('view_count', 0),
                    now,
                    channel_info['channel_id']
                ))
            else:
                cursor.execute('''
                    INSERT INTO channels (
                        channel_id, channel_title, subscriber_count,
                        video_count, view_count, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    channel_info['channel_id'],
                    channel_info.get('channel_title', ''),
                    channel_info.get('subscriber_count', 0),
                    channel_info.get('video_count', 0),
                    channel_info.get('view_count', 0),
                    now,
                    now
                ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"チャンネル情報保存エラー: {e}")
            return False
    
    def delete_video(self, video_id: str) -> bool:
        """
        動画情報を削除
        
        Args:
            video_id: 動画ID
        
        Returns:
            成功した場合True
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 統計履歴も削除
            cursor.execute('DELETE FROM video_statistics WHERE video_id = ?', (video_id,))
            cursor.execute('DELETE FROM videos WHERE video_id = ?', (video_id,))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"削除エラー: {e}")
            return False
    
    def get_statistics_summary(self) -> Dict:
        """
        統計サマリーを取得
        
        Returns:
            統計情報の辞書
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 総動画数
            cursor.execute('SELECT COUNT(*) FROM videos')
            total_videos = cursor.fetchone()[0]
            
            # 総視聴回数
            cursor.execute('SELECT SUM(view_count) FROM videos')
            total_views = cursor.fetchone()[0] or 0
            
            # 総いいね数
            cursor.execute('SELECT SUM(like_count) FROM videos')
            total_likes = cursor.fetchone()[0] or 0
            
            # 平均視聴回数
            avg_views = total_views / total_videos if total_videos > 0 else 0
            
            conn.close()
            
            return {
                'total_videos': total_videos,
                'total_views': total_views,
                'total_likes': total_likes,
                'average_views': avg_views
            }
            
        except Exception as e:
            print(f"統計サマリー取得エラー: {e}")
            return {}

