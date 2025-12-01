resource "aws_ecs_cluster" "this" {
  name = "${var.project}-cluster"
}

resource "aws_iam_role" "exec" {
  name = "${var.project}-ecs-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "exec_policy" {
  role       = aws_iam_role.exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "task" {
  name = "${var.project}-ecs-task"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "task_secrets" {
  role       = aws_iam_role.task.name
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
}

resource "aws_iam_role_policy_attachment" "task_sqs" {
  role       = aws_iam_role.task.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
}

resource "aws_iam_role_policy_attachment" "task_s3" {
  role       = aws_iam_role.task.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "task_rds" {
  role       = aws_iam_role.task.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

resource "aws_security_group" "service" {
  name        = "${var.project}-ecs-sg"
  description = "Allow e-file traffic"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_task_definition" "mef" {
  family                   = "${var.project}-mef"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.exec.arn
  task_role_arn            = aws_iam_role.task.arn
  depends_on               = [aws_cloudwatch_log_group.ecs]

  container_definitions = jsonencode([
    {
      name      = "mef-transmitter"
      image     = var.ecr_image
      essential = true
      environment = [
        { name = "AWS_REGION", value = var.region },
        { name = "SQS_URL", value = aws_sqs_queue.efile.id },
        { name = "S3_BUCKET", value = aws_s3_bucket.taxsuite.bucket },
        # inject the full Postgres URL via SSM or Secrets Manager in production
        { name = "PG_URL", value = module.db.db_instance_address },
        { name = "IRS_URL", value = var.irs_url }
      ]
      secrets = [
        { name = "MTLS_CERT_BASE64", valueFrom = aws_secretsmanager_secret.mtls_cert.arn },
        { name = "MTLS_KEY_BASE64",  valueFrom = aws_secretsmanager_secret.mtls_key.arn },
        { name = "MTLS_CA_BASE64",   valueFrom = aws_secretsmanager_secret.mtls_ca.arn },
        { name = "DOCUSIGN_SECRET",  valueFrom = aws_secretsmanager_secret.docusign.arn }
      ]
      portMappings = [{ containerPort = 8080 }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.project}"
          awslogs-region        = var.region
          awslogs-stream-prefix = "mef"
        }
      }
    }
  ])
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project}"
  retention_in_days = 30
}

resource "aws_ecs_service" "mef" {
  name            = "${var.project}-mef"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.mef.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.service.id]
    assign_public_ip = false
  }
}
