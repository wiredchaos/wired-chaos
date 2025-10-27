resource "aws_sqs_queue" "efile" {
  name                       = "${var.project}-efile-queue"
  visibility_timeout_seconds = 120
}

output "sqs_url" {
  value = aws_sqs_queue.efile.id
}
