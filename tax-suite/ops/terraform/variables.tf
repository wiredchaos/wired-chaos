variable "project" {
  type = string
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "ecr_image" {
  type = string
}

variable "irs_url" {
  type = string
}
