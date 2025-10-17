# ベースイメージ (Node.jsのバージョンは適宜変更してください)
FROM node:20-slim 

# 作業ディレクトリを設定
WORKDIR /app

# package.json と yarn.lock をコピー
COPY package.json yarn.lock ./

# 依存関係をインストール
RUN yarn install

# 🚀 Firebase CLIのインストールを追加
# -g フラグでグローバルにインストールします。
RUN yarn global add firebase-tools 
# または npm を使用する場合:
# RUN npm install -g firebase-tools

# その他のファイルをコピー
COPY . .

# コンテナ起動時に実行するコマンド (例: Next.jsアプリの起動)
# CMD ["yarn", "start"]