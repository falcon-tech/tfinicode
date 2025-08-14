terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= {{ provider_version_aws }}"
    }
  }
  required_version = ">= {{ terraform_version_minor }}"
}
