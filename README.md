# tfinicode
terraformの初期コードを生成するツール。

![tfinicode_demo](https://github.com/falcon-tech/tfinicode/blob/main/docs/gif/tfinicode_demo.gif)

初期コードを持ってくるだけなら、フォルダ毎コピーで良いが、Terrafromやproviderのバージョンをインフラ構築時の最新バージョンで固定するのに、毎度バージョンを更新するのが面倒なので、その面倒を解消することが主目的のツール。

初期コードのテンプレートがハードコートされているので、このツールをそのままパブリックに利用して貰うことは想定していない。
フォークするなりして、個人 or 組織のルールに従ってテンプレートをカスタマイズして貰うことを想定している。

## Install
```bash
npm i -g https://github.com/falcon-tech/tfinicode/archive/refs/tags/v0.0.1.tar.gz
```

## Usage
```bash
tfinicode
```

### Options
#### 初期コードを生成するパスの指定
デフォルトでは、カレントディレクトリに初期コードが生成される。

```bash
tfinicode -t <path>
```

#### 上書き
デフォルトでは、対象のパスに同じファイルが存在する場合、上書きは行われない。

```bash
tfinicode -f
```

### Note
#### テンプレート構成
```
/
├ .github
│ └ workflows
│    ├ ci.yml CI/CDワークフロー(CI)を定義。mainブランチへのプルリクエストで発火
│    └ cd.yml CI/CDワークフロー(CD)を定義。mainブランチへのプルリクエストのマージで発火
├ environments 各環境のルートモジュールを管理
│ ├ dev 開発環境のルートモジュール
│ │ ├ init 初期設定用(tfstate用のS3、tfactionで使用するOIDCロールなど)のtfを管理。このディレクトリのstateはローカル管理を想定しているので、push忘れに注意
│ │ ├ main 主となるtfを管理
│ │ │ ├ .terraform-version tfenvで使用するTerraformバージョンを定義
│ │ │ ├ backend.tf tfstateのbackendの設定を管理
│ │ │ ├ data.tf 各tfで共通で使用されるdataリソースを管理。各tf固有で使用されるdataリソースは各tfで管理する
│ │ │ ├ locals.tf 各tfで共通で使用されるlocal変数を管理。各tf固有で使用されるlocal変数は各tfで管理する
│ │ │ ├ main.tf 子モジュールの呼び出し、リソースを定義するtf。行数が一定数を超える場合は、機能単位(network.tfやservice.tfなど)で分割を想定。
│ │ │ ├ providers.tf 各プロバイダーの設定を管理
│ │ │ ├ terraform.tf Terraform、各プロバイダーのバージョンを管理
│ │ │ ├ terraform.tfvars variables.tfで定義したセンシティブな変数の値を定義。Gitにはpushしない
│ │ │ ├ tfaction.yaml CI/CD(tfaction)の対象ディレクトリとなるファイルに配置。このファイルがないディレクトリは、CI/CDの対象にならない
│ │ │ └ variables.tf variable変数を定義。環境間で差分のある変数(全てではない)、外部から値をインプットする必要がある変数、センシティブな変数をここで定義することを想定
│ │ └ .envrc direnvで読み込む環境変数(AWSアカウントIDなど)を定義
│ ├ stg 検証環境のルートモジュール
│ ├ prd 本番環境のルートモジュール
| └ .tflint.hcl tflintの設定ファイル(ルートモジュール用)
├ modules 子モジュールを管理
│ ├ sample サンプルモジュール
│ └ .tflint.hcl tflintの設定ファイル(子モジュール用)
├ .gitignore Gitにpushしないディレクトリ/ファイルを定義。Terraformで一般的にpushしないディレクトリ/ファイル + プロジェクト固有でpushしないディレクトリ/ファイルを記載。.envrcや.DS_Storeといった端末依存ファイルのignoreは「.git/info/exclude or ~/.config/git/ignore」で各々実施することを想定
├ .trivyignore trivyで無視する脆弱性を定義
├ aqua.yaml tfactionで使用するツールのバージョン管理
├ tfaction-root.yaml tfactionの設定ファイル
└ trivy.yaml trivyの設定ファイル
```

#### デフォルトバージョンの適用
ツール実行時、最新バージョン情報がインターネット上から取得されるが、ネットワークの問題や取得先のレート制限などで、情報を取得できないケースがある為、取得失敗時、フォールバックとして、以下のデフォルトバージョンが適用される。

```bash
> tfinicode
⚠️ https://api.github.com/repos/suzuki-shunsuke/tfaction/releases/latest からバージョン情報を取得できませんでした。デフォルトバージョン を設定します。
⚠️ https://api.github.com/repos/terraform-linters/tflint/releases/latest からバージョン情報を取得できませんでした。デフォルトバージョン を設定します。
⚠️ https://api.github.com/repos/int128/ghcp/releases/latest からバージョン情報を取得できませんでした。デフォルトバージョンを設定します。
⚠️ https://api.github.com/repos/terraform-docs/terraform-docs/releases/latest からバージョン情報を取得できませんでした。デフォルトバージョンを設定します。
⚠️ https://api.github.com/repos/hashicorp/terraform/releases/latest からバージョン情報を取得できませんでした。デフォルトバージョンを設定します。
⚠️ https://api.github.com/repos/aquaproj/aqua-installer/releases/latest からバージョン情報を取得できませんでした。デフォルトバージョンを設定します。
⚠️ https://api.github.com/repos/reviewdog/reviewdog/releases/latest からバージョン情報を取得できませんでした。デフォルトバージョンを設定します。
⚠️ https://api.github.com/repos/aquaproj/aqua-registry/releases/latest からバージョン情報を取得できませんでした。デフォルトバージョンを 設定します。
⚠️ https://api.github.com/repos/suzuki-shunsuke/github-comment/releases/latest からバージョン情報を取得できませんでした。デフォルトバー ジョンを設定します。
⚠️ https://api.github.com/repos/aquasecurity/trivy/releases/latest からバージョン情報を取得できませんでした。デフォルトバージョンを設定 します。
⚠️ https://api.github.com/repos/terraform-linters/tflint-ruleset-aws/releases/latest からバージョン情報を取得できませんでした。デフォル トバージョンを設定します。
⚠️ https://api.github.com/repos/aquaproj/aqua/releases/latest からバージョン情報を取得できませんでした。デフォルトバージョンを設定します

```

##### デフォルトバージョン

|Tool|Version|
|---|---|
|Terraform|[1.12.2](https://github.com/hashicorp/terraform/releases/tag/v1.12.2)|
|Terraform Provider for AWS|[6.8.0](https://registry.terraform.io/providers/hashicorp/aws/6.8.0/docs)|
|Terraform Module for AWS S3|[5.4.0](https://registry.terraform.io/modules/terraform-aws-modules/s3-bucket/aws/5.4.0)|
|Terraform Module for AWS IAM|[5.60.0](https://registry.terraform.io/modules/terraform-aws-modules/iam/aws/5.60.0)|
|tfaction|[1.19.1](https://github.com/suzuki-shunsuke/tfaction/releases/tag/v1.19.1)|
|Aqua|[2.53.9](https://github.com/aquaproj/aqua/releases/tag/v2.53.9)|
|Aqua Installer|[4.0.2](https://github.com/aquaproj/aqua-installer/releases/tag/v4.0.2)|
|Aqua Registry|[4.400.0](https://github.com/aquaproj/aqua-registry/releases/tag/v4.400.0)|
|TFLint|[0.58.1](https://github.com/terraform-linters/tflint/releases/tag/v0.58.1)|
|TFLint Ruleset for AWS|[0.42.0](https://github.com/terraform-linters/tflint-ruleset-aws/releases/tag/v0.42.0)|
|Trivy|[0.65.0](https://github.com/aquasecurity/trivy/releases/tag/v0.65.0)|
|Reviewdog|[0.20.3](https://github.com/reviewdog/reviewdog/releases/tag/v0.20.3)|
|Terraform Docs|[0.20.0](https://github.com/terraform-docs/terraform-docs/releases/tag/v0.20.0)|
|GitHub Comment|[6.3.4](https://github.com/suzuki-shunsuke/github-comment/releases/tag/v6.3.4)|
|GHCP|[1.15.0](https://github.com/int128/ghcp/releases/tag/v1.15.0)|

#### テンプレートを簡易的にカスタマイズする方法
カスタマイズしたテンプレートを組織内に配布するなどの場合には、フォークして貰う必要があるが、自分だけの為にテンプレートをカスタマイズしたいのであれば、本ツールをnpmでグローバルインストールした際に、ローカルに作成されるtfinicodeディレクトリの中身をイジれば、テンプレートを簡易的にカスタマイズすることが可能。

最新バージョンを設定するツールの追加に関してはソースコードに手を入れる必要があるが、作成するテンプレートファイルの追加削除、ディレクトリ構成の変更だけなら、templateディレクトリを直接編集するだけで良い。

```bash

❯ npm list tfinicode -g
/opt/homebrew/lib
└── tfinicode@0.0.1

❯ ll /opt/homebrew/lib/node_modules/tfinicode
total 32
drwxr-xr-x@ 10 hoge  admin   320  8 13 18:08 ./
drwxr-xr-x@  7 hoge  admin   224  8 13 18:08 ../
-rw-r--r--@  1 hoge  admin    22  8 13 18:08 .npmignore
drwxr-xr-x@  4 hoge  admin   128  8 13 18:08 dist/
drwxr-xr-x@  7 hoge  admin   224  8 13 18:08 node_modules/
-rw-r--r--@  1 hoge  admin  3945  8 13 18:08 package-lock.json
-rw-r--r--@  1 hoge  admin   550  8 13 18:08 package.json
drwxr-xr-x@  3 hoge  admin    96  8 13 18:08 src/
drwxr-xr-x@ 10 hoge  admin   320  8 13 18:08 templates/
-rw-r--r--@  1 hoge  admin   309  8 13 18:08 tsconfig.json
❯ ll /opt/homebrew/lib/node_modules/tfinicode/templates
total 40
drwxr-xr-x@ 10 hoge  admin   320  8 13 18:08 ./
drwxr-xr-x@ 10 hoge  admin   320  8 13 18:08 ../
drwxr-xr-x@  3 hoge  admin    96  8 13 18:08 .github/
-rw-r--r--@  1 hoge  admin   641  8 13 18:08 .npmignore
-rw-r--r--@  1 hoge  admin   231  8 13 18:08 .trivyignore
-rw-r--r--@  1 hoge  admin   479  8 13 18:08 aqua.yaml
drwxr-xr-x@  6 hoge  admin   192  8 13 18:08 environments/
drwxr-xr-x@  4 hoge  admin   128  8 13 18:08 modules/
-rw-r--r--@  1 hoge  admin  1049  8 13 18:08 tfaction-root.yaml
-rw-r--r--@  1 hoge  admin    22  8 13 18:08 trivy.yaml

```





