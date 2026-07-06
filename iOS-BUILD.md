# トラフィックおじさん iOSアプリ ビルド手順（Mac作業）

Windows側で「Capacitorラッパー」の下ごしらえは完了済みです。
ここからは **Mac + Xcode** での作業になります。上から順にコピペで進めてください。

- Bundle ID: `com.tmk4men.trafficojisan`
- アプリ表示名: `トラフィックおじさん`
- **初回リリースは広告なし**（AdMobのコードは入っているが、プラグインを入れていないので何も表示されません）。
- あとからAdMobを有効化できます（末尾の「AdMobを後から有効化する」参照）。

---

## 0. Macに必要なもの

- **Xcode**（App Storeから最新版）。初回起動でコンポーネントのインストールを済ませておく。
- **CocoaPods**：`sudo gem install cocoapods`（または `brew install cocoapods`）
- **Node.js 18以上**：`node -v` で確認（なければ https://nodejs.org からLTS）
- **Apple Developer Program**（課金済み）にサインインしたApple ID。Xcodeの
  `Xcode > Settings > Accounts` でApple IDを追加しておく。

---

## 1. プロジェクトをMacに持ってくる

GitHub経由がおすすめ（このリポジトリはすでにgit管理されています）：

```bash
git clone <このリポジトリのURL> traffic-ojisan
cd traffic-ojisan
```

※ USBやクラウドでフォルダごとコピーしてもOK。その場合 `node_modules` と `www` は
コピー不要です（次で作り直します）。

---

## 2. 依存インストール & Web資産の生成

```bash
npm install
npm run build:www      # index.html や画像・音・フォントを www/ にまとめる
```

`www/ を生成しました: 24 ファイル ...` と出ればOK。

---

## 3. iOSネイティブプロジェクトを作成

```bash
npx cap add ios        # ios/ フォルダを生成し、pod install まで自動実行
npx cap sync ios        # www/ の中身をアプリに同期
```

> 以後、`index.html` などを更新したら **`npm run sync`**（= build:www + cap sync）を
> 実行すれば変更がアプリに反映されます。

---

## 4. アプリアイコン & スプラッシュを生成（推奨）

App Storeには **1024×1024** のアイコンが必須です。現状の `icon-512.png` は512pxなので、
1024pxのアイコン画像を1枚用意してください（ドット絵なので512→1024の拡大でも可）。

```bash
# 1024pxのアイコンを assets/icon-only.png として置く（背景込みなら icon.png）
mkdir -p assets
# 例: icon-512.png を 1024 に拡大したものを assets/icon.png として保存

npx @capacitor/assets generate --ios
```

これで Xcode のアイコン枠・起動画面が自動生成されます。
（手動でやる場合は Xcode の `App/Assets.xcassets/AppIcon` に画像を入れてもOK）

---

## 5. Xcodeで開いて設定

```bash
npx cap open ios
```

Xcodeが開いたら、左の **App** ターゲットを選び：

1. **Signing & Capabilities**
   - Team: 自分のApple Developerチームを選択
   - Bundle Identifier: `com.tmk4men.trafficojisan`（合っているか確認）
   - 「Automatically manage signing」にチェック
2. **General**
   - Display Name: `トラフィックおじさん`
   - Version: `1.0` / Build: `1`
   - Deployment Target: iOS 14.0 以上でOK
   - Device Orientation: **Portrait のみ**にチェック（横向きは外す）
   - Supported Destinations: iPhone（iPadも出すなら追加）

---

## 6. 実機/シミュレータで動作確認

- 上部のデバイス選択で **シミュレータ or 接続したiPhone** を選び、▶（Run）。
- 確認ポイント：
  - タイトル画面・ゲームが起動する
  - ドット絵フォント（DotGothic16）が正しく表示される（同梱済み・オフラインでもOK）
  - BGM・効果音が鳴る
  - スコアのシェアボタン（iOSの共有シート or Xへ）
  - **広告が出ないこと**（初回リリース仕様どおり）

> 画面の上下（ノッチ・ホームバー）に食い込む場合は、`capacitor.config.json` の
> `ios.contentInset` を `"always"`（現状）/`"automatic"`/`"never"` で調整 →
> `npx cap sync ios` で反映。

---

## 7. App Storeへ提出

1. **App Store Connect**（https://appstoreconnect.apple.com）で新規Appを作成
   - プラットフォーム: iOS、Bundle ID: `com.tmk4men.trafficojisan`
   - 名前・サブタイトル・カテゴリ（ゲーム）・スクショ（実機/シミュレータで撮影）
2. **プライバシー**：初回は広告なし・データ収集なしなので
   「**データを収集していません（Data Not Collected）**」でOK。
   （localStorageはセーブデータで、外部送信していません）
3. **年齢レーティング**：内容に合わせて回答（暴力/課金なし等）。
4. Xcodeで **Product > Archive** → Organizerで **Distribute App** →
   App Store Connect にアップロード。
5. App Store Connectでビルドを選び、審査に提出。

---

## AdMobを後から有効化する（広告を出したくなったら）

index.htmlの広告コードは既に入っていて、**プラグイン未インストールなので今は無効**です。
有効化する手順：

1. **iOS用のAdMobを用意**（重要：現在のIDはAndroid用。iOSは別IDが必要）
   - AdMob管理画面で **iOS用アプリ** を新規登録し、**iOS用のバナー/インタースティシャル広告ユニット** を作成。
   - `index.html` の `AD_INTERSTITIAL_ID` / `AD_BANNER_ID` を、プラットフォームで
     出し分けるように変更（iOS時はiOS用IDを使う）。

2. **プラグイン導入**
   ```bash
   npm install @capacitor-community/admob
   npx cap sync ios
   ```

3. **Info.plist に追記**（`ios/App/App/Info.plist`）
   - `GADApplicationIdentifier` = AdMobの **iOSアプリID**（`ca-app-pub-xxxx~xxxx`）
   - `SKAdNetworkItems`（AdMob指定の広告ネットワークID一式）
   - トラッキング許可を出す場合：`NSUserTrackingUsageDescription`（説明文）

4. **ATT（トラッキング許可）**：`@capacitor-community/admob` の
   `requestTrackingAuthorization()` を初期化時に呼ぶ。
   → この場合、App Store Connectのプライバシー申告を「広告/トラッキングあり」に更新。

5. 実機で広告テストID（`AD_IS_TESTING = true`）で確認 → 問題なければ本番IDへ。

---

## 更新フロー（まとめ）

```bash
# ゲームを直したら
npm run sync        # build:www + cap sync ios
npx cap open ios    # Xcodeでビルド/Archive
```
