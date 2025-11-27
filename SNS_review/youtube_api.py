"""
YouTube Data API v3を使用して動画情報を取得するモジュール
"""
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import config
from typing import Dict, Optional, List


class YouTubeAPI:
    """YouTube Data API v3のラッパークラス"""
    
    def __init__(self, api_key: str = None):
        """
        初期化
        
        Args:
            api_key: YouTube Data API v3のAPIキー
        """
        self.api_key = api_key or config.YOUTUBE_API_KEY
        if not self.api_key:
            raise ValueError("YouTube APIキーが設定されていません。config.pyまたは環境変数YOUTUBE_API_KEYを設定してください。")
        
        self.youtube = build(
            config.YOUTUBE_API_SERVICE_NAME,
            config.YOUTUBE_API_VERSION,
            developerKey=self.api_key
        )
    
    def get_video_info(self, video_id: str) -> Optional[Dict]:
        """
        動画IDから動画情報を取得
        
        Args:
            video_id: YouTube動画ID（URLから取得可能）
        
        Returns:
            動画情報の辞書。エラーの場合はNone
        """
        try:
            # 動画の基本情報を取得
            request = self.youtube.videos().list(
                part='snippet,statistics,contentDetails',
                id=video_id
            )
            response = request.execute()
            
            if not response.get('items'):
                print(f"動画ID {video_id} が見つかりませんでした。")
                return None
            
            item = response['items'][0]
            snippet = item['snippet']
            statistics = item['statistics']
            content_details = item['contentDetails']
            
            # 動画の長さを秒に変換
            duration = self._parse_duration(content_details.get('duration', 'PT0S'))
            
            # 動画情報を整理
            video_info = {
                'video_id': video_id,
                'title': snippet.get('title', ''),
                'description': snippet.get('description', ''),
                'channel_id': snippet.get('channelId', ''),
                'channel_title': snippet.get('channelTitle', ''),
                'published_at': snippet.get('publishedAt', ''),
                'duration': duration,
                'view_count': int(statistics.get('viewCount', 0)),
                'like_count': int(statistics.get('likeCount', 0)),
                'comment_count': int(statistics.get('commentCount', 0)),
                'thumbnail_url': snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
                'tags': ','.join(snippet.get('tags', [])),
                'category_id': snippet.get('categoryId', ''),
            }
            
            return video_info
            
        except HttpError as e:
            print(f"APIエラーが発生しました: {e}")
            return None
        except Exception as e:
            print(f"エラーが発生しました: {e}")
            return None
    
    def get_channel_info(self, channel_id: str) -> Optional[Dict]:
        """
        チャンネルIDからチャンネル情報を取得
        
        Args:
            channel_id: YouTubeチャンネルID
        
        Returns:
            チャンネル情報の辞書。エラーの場合はNone
        """
        try:
            request = self.youtube.channels().list(
                part='snippet,statistics',
                id=channel_id
            )
            response = request.execute()
            
            if not response.get('items'):
                return None
            
            item = response['items'][0]
            snippet = item['snippet']
            statistics = item['statistics']
            
            channel_info = {
                'channel_id': channel_id,
                'channel_title': snippet.get('title', ''),
                'subscriber_count': int(statistics.get('subscriberCount', 0)),
                'video_count': int(statistics.get('videoCount', 0)),
                'view_count': int(statistics.get('viewCount', 0)),
            }
            
            return channel_info
            
        except HttpError as e:
            print(f"APIエラーが発生しました: {e}")
            return None
        except Exception as e:
            print(f"エラーが発生しました: {e}")
            return None
    
    def search_shorts(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        YouTube Shortsを検索
        
        Args:
            query: 検索クエリ
            max_results: 最大取得件数
        
        Returns:
            動画情報のリスト
        """
        try:
            request = self.youtube.search().list(
                part='snippet',
                q=query,
                type='video',
                maxResults=max_results,
                videoDuration='short',  # Shorts動画のみ
                order='viewCount'  # 視聴回数順
            )
            response = request.execute()
            
            videos = []
            for item in response.get('items', []):
                video_id = item['id']['videoId']
                video_info = self.get_video_info(video_id)
                if video_info:
                    videos.append(video_info)
            
            return videos
            
        except HttpError as e:
            print(f"APIエラーが発生しました: {e}")
            return []
        except Exception as e:
            print(f"エラーが発生しました: {e}")
            return []
    
    def _parse_duration(self, duration: str) -> int:
        """
        ISO 8601形式の動画の長さを秒に変換
        
        Args:
            duration: ISO 8601形式の時間（例: PT1M30S）
        
        Returns:
            秒数
        """
        import re
        
        # PT1M30S形式をパース
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration)
        
        if not match:
            return 0
        
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        
        return hours * 3600 + minutes * 60 + seconds
    
    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """
        YouTube URLから動画IDを抽出
        
        Args:
            url: YouTube動画URL
        
        Returns:
            動画ID。抽出できない場合はNone
        """
        import re
        
        # 様々なYouTube URL形式に対応
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        # URLでない場合は、そのままIDとして扱う
        if len(url) == 11 and url.replace('-', '').replace('_', '').isalnum():
            return url
        
        return None

