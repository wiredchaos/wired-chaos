module "db" {
  source  = "terraform-aws-modules/rds/aws"
  identifier = "${var.project}-pg"
  engine = "postgres"
  engine_version = "15"
  instance_class = "db.t4g.micro"
  allocated_storage = 20
  db_name = "taxsuite"
  username = "svc_user"
  password = var.db_password
  publicly_accessible = false
  vpc_security_group_ids = [module.vpc.default_security_group_id]
  subnet_ids = module.vpc.private_subnets
}

output "pg_url" {
  value     = "postgres://svc_user:${var.db_password}@${module.db.db_instance_endpoint}/taxsuite"
  sensitive = true
}
