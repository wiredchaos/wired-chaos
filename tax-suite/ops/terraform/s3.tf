resource "aws_s3_bucket" "taxsuite" {
  bucket = "${var.project}-store"
}

output "s3_bucket" {
  value = aws_s3_bucket.taxsuite.bucket
}
