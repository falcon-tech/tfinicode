#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const nunjucks_1 = __importDefault(require("nunjucks"));
// デフォルトバージョンを定義
const defaultVersions = {
    terraform: "1.12.2",
    terraform_minor: "1.12",
    provider_aws: "6.8.0",
    module_aws_s3: "5.4.0",
    module_aws_iam: "5.60.0",
    tfaction: "1.19.1",
    aqua: "2.53.9",
    aqua_installer: "4.0.2",
    aqua_registry: "4.400.0",
    tflint: "0.58.1",
    tflint_ruleset_aws: "0.42.0",
    trivy: "0.65.0",
    reviewdog: "0.20.3",
    terraform_docs: "0.20.0",
    github_comment: "6.3.4",
    ghcp: "1.15.0",
};
// バージョン情報取得先のURLを定義
const urls = {
    terraform: "https://api.github.com/repos/hashicorp/terraform/releases/latest",
    provider_aws: "https://registry.terraform.io/v1/providers/hashicorp/aws",
    module_aws_s3: "https://registry.terraform.io/v1/modules/terraform-aws-modules/s3-bucket/aws",
    module_aws_iam: "https://registry.terraform.io/v1/modules/terraform-aws-modules/iam/aws",
    tfaction: "https://api.github.com/repos/suzuki-shunsuke/tfaction/releases/latest",
    aqua: "https://api.github.com/repos/aquaproj/aqua/releases/latest",
    aqua_installer: "https://api.github.com/repos/aquaproj/aqua-installer/releases/latest",
    aqua_registry: "https://api.github.com/repos/aquaproj/aqua-registry/releases/latest",
    tflint: "https://api.github.com/repos/terraform-linters/tflint/releases/latest",
    tflint_ruleset_aws: "https://api.github.com/repos/terraform-linters/tflint-ruleset-aws/releases/latest",
    trivy: "https://api.github.com/repos/aquasecurity/trivy/releases/latest",
    reviewdog: "https://api.github.com/repos/reviewdog/reviewdog/releases/latest",
    terraform_docs: "https://api.github.com/repos/terraform-docs/terraform-docs/releases/latest",
    github_comment: "https://api.github.com/repos/suzuki-shunsuke/github-comment/releases/latest",
    ghcp: "https://api.github.com/repos/int128/ghcp/releases/latest",
};
/**
 * テンプレートレンダリング関数
 * @param templatePath レンダリングするテンプレートが保存されているディレクトリのルートパス
 * @param variables レンダリングするテンプレートに渡す変数
 */
async function renderTemplate(templatePath, variables) {
    try {
        // テンプレートディレクトリ配下のディレクトリ、ファイル一覧を取得
        const entries = await fs_1.promises.readdir(templatePath);
        // テンプレートディレクトリ配下のディレクトリ、ファイル一覧をループ処理
        for (const entry of entries) {
            // パスの結合
            const entryPath = path_1.default.join(templatePath, entry);
            // 対象パスの属性を取得
            const entryStats = await fs_1.promises.stat(entryPath);
            // 対象パスがディレクトリの場合、関数を再帰呼び出し
            if (entryStats.isDirectory()) {
                renderTemplate(entryPath, variables);
                // 対象パスがファイルの場合、テンプレートをレンダリング
            }
            else {
                fs_1.promises.writeFile(entryPath, nunjucks_1.default.render(entryPath, variables));
            }
        }
    }
    catch (error) {
        console.error(error);
    }
}
/**
 * バージョン情報取得関数
 */
async function getVersions() {
    async function fetchVersions(url) {
        // バージョン情報の取得が成功したら、バージョンを返却する
        try {
            const response = await fetch(url);
            const data = await response.json();
            let version;
            // fetch先がGitHubの場合
            if (url.match(/^https:\/\/api\.github\.com/)) {
                version =
                    data.tag_name?.replace(/^v/, "") || data.name?.replace(/^v/, ""); // tag_name or nameの値を取得し、先頭のvを削除
                // fetch先がTerraform Registryの場合
            }
            else if (url.match(/^https:\/\/registry\.terraform\.io/)) {
                version = data.version?.replace(/^v/, ""); // versionの値を取得し、先頭のvを削除
                // 想定されないfetch先の場合
            }
            else {
                throw new Error("Invalid URL");
            }
            // 取得したバージョンが想定されないフォーマットの場合
            if (!version || !version.match(/^\d+\.\d+\.\d+/)) {
                throw new Error("Invalid version format");
            }
            return version;
            // バージョン情報の取得が失敗したら、nullを返却する
        }
        catch (error) {
            //console.error(`Error fetching version from ${url}:`, error);
            console.warn(`⚠️ ${url} からバージョン情報を取得できませんでした。デフォルトバージョンを設定します。`);
            // エラーが発生した場合、nullを返却
            return null;
        }
    }
    // fetchVersionsを非同期(並列)で　実行する為の変数を定義(分割代入)
    const [terraformVersion, providerVersionAws, moduleVersionS3, moduleVersionIam, tfactionVersion, aquaVersion, aquaInstallerVersion, aquaRegistryVersion, tflintVersion, tflintRulesetAwsVersion, trivyVersion, reviewdogVersion, terraformDocsVersion, githubCommentVersion, ghcpVersion,] = await Promise.all([
        fetchVersions(urls.terraform),
        fetchVersions(urls.provider_aws),
        fetchVersions(urls.module_aws_s3),
        fetchVersions(urls.module_aws_iam),
        fetchVersions(urls.tfaction),
        fetchVersions(urls.aqua),
        fetchVersions(urls.aqua_installer),
        fetchVersions(urls.aqua_registry),
        fetchVersions(urls.tflint),
        fetchVersions(urls.tflint_ruleset_aws),
        fetchVersions(urls.trivy),
        fetchVersions(urls.reviewdog),
        fetchVersions(urls.terraform_docs),
        fetchVersions(urls.github_comment),
        fetchVersions(urls.ghcp),
    ]);
    // getVersions関数で返却するバージョン一覧を定義。fetchVersions関数でnullが返却された場合は、デフォルトバージョンを返却する。
    const versions = {
        terraform_version: terraformVersion || defaultVersions.terraform,
        terraform_version_minor: terraformVersion?.split(".").slice(0, 2).join(".") ||
            defaultVersions.terraform_minor,
        provider_version_aws: providerVersionAws || defaultVersions.provider_aws,
        module_version_aws_s3: moduleVersionS3 || defaultVersions.module_aws_s3,
        module_version_aws_iam: moduleVersionIam || defaultVersions.module_aws_iam,
        tfaction_version: tfactionVersion || defaultVersions.tfaction,
        aqua_version: aquaVersion || defaultVersions.aqua,
        aqua_installer_version: aquaInstallerVersion || defaultVersions.aqua_installer,
        aqua_registry_version: aquaRegistryVersion || defaultVersions.aqua_registry,
        tflint_version: tflintVersion || defaultVersions.tflint,
        tflint_ruleset_version_aws: tflintRulesetAwsVersion || defaultVersions.tflint_ruleset_aws,
        trivy_version: trivyVersion || defaultVersions.trivy,
        reviewdog_version: reviewdogVersion || defaultVersions.reviewdog,
        terraform_docs_version: terraformDocsVersion || defaultVersions.terraform_docs,
        github_comment_version: githubCommentVersion || defaultVersions.github_comment,
        ghcp_version: ghcpVersion || defaultVersions.ghcp,
    };
    return versions;
}
// Commandクラスのインスタンスを生成
const program = new commander_1.Command();
// コマンドの定義
program
    .name("tfinicode")
    .version("0.0.1")
    .description("Terraform Initial Code Generator")
    .option("-t, --target <path>", "The target path to generate the code. default: current directory")
    .option("-f, --force", "Force overwrite existing files")
    .action(async (options) => {
    // --targetで指定されたパスをテンプレートのコピー先に設定。--targetが指定されない場合はカレントディレクトリがコピー先になる
    const targetPath = options.target || process.cwd();
    // テンプレートが保存されているディレクトリのパスを設定。 固定値
    const templatePath = path_1.default.join(__dirname, "../templates");
    // バージョン情報を取得
    const versions = await getVersions();
    // テンプレートをターゲットパスにコピー
    await fs_1.promises.cp(templatePath, targetPath, {
        // --forceが指定されている場合はtrue。--forceが指定されていない場合はfalse
        force: options.force || false,
        recursive: true,
    });
    // *note: 本ツールを`npm install`した時、テンプレートの`.gitignore`が`.npmignore`に変換されてしまうnpmの仕様があるので、テンプレート上は`.npmignore`を用意し、テンプレートレンダリング前に`.npmignore`を`.gitignore`に変換する
    await fs_1.promises.rename(path_1.default.join(targetPath, ".npmignore"), path_1.default.join(targetPath, ".gitignore"));
    // コピーしたテンプレートをレンダリング
    renderTemplate(targetPath, versions);
});
// 引数の解析
program.parse(process.argv);
//# sourceMappingURL=index.js.map