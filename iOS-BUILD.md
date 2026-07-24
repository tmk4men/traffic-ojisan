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

## 4. アプリアイコンを反映（1024pxは生成済み）

App Store必須の **1024×1024アイコン**は `assets/icon.png` として**すでに用意済み**です
（`icon-512.png` からドット感を保って自動生成済み・透過なし）。
下のコマンド1発で、Xcodeの全アイコンサイズに反映されます：

```bash
npm run icons        # = capacitor-assets generate --ios
```

> アイコンを差し替えたい場合：新しい元画像を用意して `assets/icon.png`（1024px・透過なし）を
> 置き換え → `npm run icons` を再実行。
> `icon-512.png` を更新した場合は `npm run icon:make` で1024版を作り直せます。

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

## 再提出（リジェクト対応後の再ビルド）

一度Macで `ios/` を作成済みなら、`npx cap add ios` は**不要**。修正を反映して
ビルド番号を上げるだけです。

```bash
cd traffic-ojisan
git pull                # Windows側の修正(文字拡大など)を取得
npm run sync            # build:www + cap sync ios（index.htmlの変更をアプリへ反映）
npx cap open ios        # Xcodeを開く
```

Xcodeで：

1. **General > Build を 1 つ上げる**（`1` → `2`）。Version は `1.0` のままでOK。
   ※ 再提出は必ず Build 番号を上げないとアップロードできません。
2. iPad系シミュレータ（**iPad Air**）で ▶ Run して、文字が読みやすいか確認。
3. **Product > Archive** → Organizer → **Distribute App** → App Store Connect へアップロード。
4. App Store Connect でその新ビルドを選び、審査に再提出。

**今回のリジェクト対応メモ（2026-07-07 分）**

- Guideline 1.5（Support URL 404）→ **対応済み**。GitHub Pages の Jekyll ビルドが
  失敗して support.html / privacy.html が 404 になっていたのが原因。`.nojekyll` を
  追加して解消済み。以下が 200 で開くことを確認済み：
  - https://tmk4men.github.io/traffic-ojisan/support.html
  - https://tmk4men.github.io/traffic-ojisan/privacy.html
  App Store Connect の Support URL は上記 support.html を指定すればOK。
- Guideline 4（文字が読みにくい）→ **対応済み**。`index.html` の CSS と
  キャンバス描画の文字を全体的に拡大（最小 10〜12px → 13〜14px、ゲーム内 9〜15px → 12〜17px）。
  → Mac で `git pull → npm run sync` すればこの修正がアプリに入ります。

再提出時の Review Notes（英語推奨）例：

```
We fixed the Support URL, which now opens correctly with contact information
(https://tmk4men.github.io/traffic-ojisan/support.html).
We also improved text readability across the app by increasing font sizes and
contrast, verified on an iPad Air simulator. Thank you for the re-review.
```

---

## AdMob（iOS：インタースティシャルのみ・有効化済み 2026-07-22）

**iOSはゲームオーバーのたびに全画面広告（インタースティシャル）を1回表示**します。バナーは
iOS用ユニット未作成のため出しません（Androidはバナー＋3プレイに1回のまま）。

### 使っているID（`index.html` 内・プラットフォームで自動切替）
| 項目 | 値 |
|---|---|
| iOS App ID（Info.plistへ） | `ca-app-pub-2783540275927131~1106969584` |
| iOS インタースティシャル | `ca-app-pub-2783540275927131/3242178330` |
| Android インタースティシャル（変更なし） | `ca-app-pub-5634961953346923/3802007614` |
| Android バナー（変更なし） | `ca-app-pub-5634961953346923/6727286956` |

### Web側（このリポジトリ・済み）
- `index.html`：`AD_IS_IOS` 判定を追加し、iOSは専用IDでゲームオーバーのたびに表示、バナー無し。
- `package.json`：`@capacitor-community/admob ^8.0.0` を依存に追加済み。

### Mac側でやること
```bash
git pull                 # 上記のWeb変更を取得
npm install              # @capacitor-community/admob が入る
npm run sync             # build:www + npx cap sync ios（プラグインをiOSに反映）
npx cap open ios         # Xcode
```

**Info.plist に追記**（`ios/App/App/Info.plist` の一番外側 `<dict>` 内）
— ⚠️ **`GADApplicationIdentifier` は必須。無いと起動した瞬間にクラッシュする**（2026-07-24のリジェクト原因）:
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-2783540275927131~1106969584</string>
<key>SKAdNetworkItems</key>
<array>
  <dict><key>SKAdNetworkIdentifier</key><string>cstr6suwn9.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>4fzdc2evr5.skadnetwork</string></dict>
</array>
```
> `SKAdNetworkItems` はGoogleの完全なリストを推奨（無くても広告は出るが、計測のため入れておくと良い）。
> ATT（トラッキング許可ダイアログ）は今回は出さない設定＝IDFA無しの非パーソナライズ広告で配信されます。
> 出す場合は `NSUserTrackingUsageDescription` を追加し、初期化時に `requestTrackingAuthorization()` を呼ぶ。

**Xcodeで**: General > Build を +1（前回提出済みなら次の番号）→ Product > Archive → Distribute。

> ⚠️ **App Store Connect のプライバシー申告を「データを収集しない」→「広告のためのデータ収集あり」へ更新必須。**
> ⚠️ 自分で本番広告をタップしない（無効トラフィック）。実機確認は `AD_IS_TESTING = true` に一時変更するか、テストデバイス登録して行う。

---

## 起動クラッシュ対応（2026-07-24 リジェクト：Guideline 2.1(a)）

> 症状：審査機（iPhone 17 Pro Max / iOS 26.5.2）で **起動した瞬間に落ちる**。
> 前回通った版との差分は「AdMob有効化」だけ ＝ **AdMobの設定漏れが原因**。

### 原因（ほぼ確定）

Google Mobile Ads SDK は、アプリ起動時に `Info.plist` の
**`GADApplicationIdentifier` を読みに行き、無い／書式が違うとその場で例外を投げてアプリを落とす**。

```
*** Terminating app due to uncaught exception 'GADInvalidInitializationException',
reason: 'The Google Mobile Ads SDK was initialized without an application ID.'
```

- JS側の `try/catch`（`adMob.init()`）では**防げない**。ネイティブ側の即死。
- `initialize()` を呼ぶ前、**アプリ起動と同時**に落ちるので「起動クラッシュ」に見える。
- よくあるミス：`~` のApp IDではなく `/` の**広告ユニットID**を書いてしまう（これも同じ例外）。

### Macでの確認と修正

```bash
cd traffic-ojisan
git pull

# 1) いま入っているか確認（何も出なければ = 抜けている＝これが原因）
/usr/libexec/PlistBuddy -c "Print :GADApplicationIdentifier" ios/App/App/Info.plist

# 2) 無ければ追加（値は「~」区切りのApp ID。ユニットIDの「/」ではない）
/usr/libexec/PlistBuddy -c "Add :GADApplicationIdentifier string ca-app-pub-2783540275927131~1106969584" ios/App/App/Info.plist

# 3) もう一度Printして、値が正しく出ることを確認
/usr/libexec/PlistBuddy -c "Print :GADApplicationIdentifier" ios/App/App/Info.plist
```

Xcodeで直接編集する場合：`ios/App/App/Info.plist` を開き、一番外側の `<dict>` 内に

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-2783540275927131~1106969584</string>
```

> AdMob管理画面 > アプリ > アプリ設定 の「アプリID」と**1文字ずつ**照合すること。
> `~1106969584` の前の数字（パブリッシャーID `2783540275927131`）が
> インタースティシャルID `ca-app-pub-2783540275927131/3242178330` と**同じ**であることも確認。

### 提出前に必ずやる検証（これを飛ばすと同じリジェクトを繰り返す）

1. **Releaseビルドで起動確認**
   `Product > Scheme > Edit Scheme > Run > Build Configuration` を **Release** にして ▶ Run。
   タイトル画面が出て、1プレイしてゲームオーバー→全画面広告が出れば成功。
   （確認が終わったら Debug に戻す）
2. **Archiveした中身のInfo.plistを確認**
   `Product > Archive` → Organizer で該当アーカイブを右クリック → `Show in Finder` →
   右クリック `パッケージの内容を表示` → `Products/Applications/App.app/Info.plist` を開き、
   `GADApplicationIdentifier` が入っていることを確認。
   （`ios/App/App/Info.plist` に書いてもビルドに反映されていない、という事故を防ぐ）
3. **TestFlightで実機起動**：アップロード後、審査に出す前に自分のiPhoneでTestFlight版を起動する。
4. **iPadでも起動確認**：提出先に iPad を含めている場合は、iPad Air シミュレータでも
   Releaseビルドで起動〜ゲームオーバー（広告表示）まで通す。
   Appleの指摘どおり「配信対象の全デバイスで動くこと」が条件。

### crashログの読み方（シンボリケーションは今回ほぼ不要）

App Store Connect から落とした `.ips` / `.crash` をテキストエディタで開き、`GAD` で検索する。
`Application Specific Information` か `Last Exception Backtrace` に

```
GADInvalidInitializationException ... initialized without an application ID
```

が入っていれば設定漏れで確定（アドレス行を読む必要はない）。
別の例外名が出た場合のみ、Xcode Organizer にドラッグしてシンボリケーションして調べる。

### それでも落ちる場合の切り分け

- App Store Connectの拒否メッセージに添付された **crashログ**を Xcode Organizer か
  テキストで開き、`Last Exception Backtrace` の上から5行を見る。
  `GAD...` が出ていれば上記の設定漏れ。別のシンボルなら原因は別。
- **どうしても間に合わない場合の退避策**：広告を丸ごと外して再提出する。
  JS側のフラグでは回避できない（SDKがリンクされている限り落ちる）ので、**プラグインごと外す**：
  ```bash
  npm uninstall @capacitor-community/admob
  npm run sync            # Podfileからも消える
  ```
  → Xcodeで Build を上げて Archive。広告は次の版で入れ直す。
  （その場合 App Store Connect のプライバシー申告も「データを収集しない」に戻す）

### 再提出時の Review Notes 例

```
The previous build crashed on launch because the Google Mobile Ads SDK was
missing its GADApplicationIdentifier entry in Info.plist. We have added the
correct application ID and verified the app launches and runs on a physical
device using a Release build and TestFlight. Thank you for the re-review.
```

---

## 更新フロー（まとめ）

```bash
# ゲームを直したら
npm run sync        # build:www + cap sync ios
npx cap open ios    # Xcodeでビルド/Archive
```
