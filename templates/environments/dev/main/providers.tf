provider "aws" {
  region = "ap-northeast-1"
  default_tags {
    tags = {
      system = local.system
      env    = var.env
    }
  }
}

provider "aws" {
  alias  = "use1"
  region = "us-east-1"
  default_tags {
    tags = {
      system = local.system
      env    = var.env
    }
  }
}
