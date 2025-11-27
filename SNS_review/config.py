"""
設定ファイル
YouTube Data API v3のAPIキーを設定します
"""
import os
from dotenv import load_dotenv

load_dotenv()

# YouTube Data API v3のAPIキー
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')

# データベースファイルのパス
DATABASE_PATH = 'youtube_shorts.db'

# API設定
YOUTUBE_API_SERVICE_NAME = 'youtube'
YOUTUBE_API_VERSION = 'v3'

