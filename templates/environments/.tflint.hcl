plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

plugin "aws" {
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
  version = "{{ tflint_ruleset_version_aws }}"
  enabled = true
  deep_check = true
}