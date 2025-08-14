provider "aws" {
  region = "ap-northeast-1"
  default_tags {
    tags = {
      managed_by = "terraform"
      system     = local.system
      env        = var.env
    }
  }
}
