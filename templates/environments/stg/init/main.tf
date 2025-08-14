data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

module "s3_bucket_tfstate" {
  # Module source
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "{{ module_version_aws_s3 }}"
  # Module arguments
  bucket = "${local.system}-${var.env}-s3-tfstate"
  versioning = {
    enabled = true
  }
  lifecycle_rule = [
    {
      id                                     = "abort_incomplete_multipart"
      enabled                                = true
      abort_incomplete_multipart_upload_days = 7
    }
  ]
  tags = {
    Name = "${local.system}-${var.env}-s3-tfstate"
  }
}

module "iam_github_oidc_provider" {
  # Module source
  source  = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-provider"
  version = "{{ module_version_aws_iam }}"
}

module "iam_assumable_role_oidc_github_infra" {
  # Module source
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "{{ module_version_aws_iam }}"
  # Module arguments
  create_role                    = true
  role_name                      = "OIDCGitHubInfraRole"
  provider_url                   = "https://token.actions.githubusercontent.com"
  oidc_fully_qualified_audiences = ["sts.amazonaws.com"]
  oidc_subjects_with_wildcards   = ["repo:${local.github_organization}/${local.repository}:*"]
  role_policy_arns               = ["arn:aws:iam::aws:policy/AdministratorAccess"]
  tags = {
    Name = "OIDCGitHubInfraRole"
  }
}
