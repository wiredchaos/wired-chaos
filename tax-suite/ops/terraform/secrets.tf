resource "aws_secretsmanager_secret" "mtls_cert" {
  name = "${var.project}/mtls_cert"
}

resource "aws_secretsmanager_secret" "mtls_key" {
  name = "${var.project}/mtls_key"
}

resource "aws_secretsmanager_secret" "mtls_ca" {
  name = "${var.project}/mtls_ca"
}

resource "aws_secretsmanager_secret" "docusign" {
  name = "${var.project}/docusign_secret"
}
