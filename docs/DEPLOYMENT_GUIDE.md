# 生产 Docker 部署指南

本指南用于把当前 Next.js + Prisma + PostgreSQL 项目部署到 Ubuntu 服务器。部署配置不会把 `.env.production`、Dataoke 密钥、`pid`、`signRan` 或完整请求 URL 写入镜像或仓库。

## 1. 服务器准备

建议使用 Ubuntu 22.04 或 24.04。

需要安装：

- Docker Engine
- Docker Compose plugin

腾讯云安全组建议先开放：

- `22`：SSH
- `80`：HTTP，供 Nginx 反代访问
- `443`：HTTPS，后续配置证书时使用

PostgreSQL 的 `5432` 不需要对公网开放。

## 2. 上传代码

方式一：在服务器上克隆仓库。

```bash
git clone <your-repo-url> taoke-site
cd taoke-site
```

方式二：从本地打包后通过 `scp` 上传到服务器。

```bash
scp -r ./taoke-site user@server-ip:/path/to/taoke-site
```

上传前请确认没有把 `.env`、`.env.local`、`.env.production` 一起上传到公开仓库。

## 3. 创建生产环境变量

```bash
cp .env.production.example .env.production
```

然后手动编辑 `.env.production`，填写生产数据库密码、站点域名和 Dataoke 配置。

注意：

- `DATAOKE_ENABLE_REAL_API` 生产默认保持 `false`。
- 真实 `DATAOKE_APP_SECRET`、`DATAOKE_PID` 只写入服务器本地 `.env.production`。
- 不要提交 `.env.production`。
- `DATABASE_URL` 中的主机名应使用 Compose 服务名 `postgres`。

## 4. 启动服务

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Compose 会启动：

- `postgres`：PostgreSQL 16，数据保存在 Docker volume。
- `app`：Next.js standalone 服务，只在 Docker 内部网络暴露 `3000`。
- `nginx`：反向代理到 `app:3000`，对外开放 `80`。

## 5. 执行 Prisma migration

生产环境不要使用 `prisma migrate dev`。

当前运行镜像采用 Next.js standalone 输出，不包含完整开发依赖。建议在服务器上执行：

```bash
docker compose -f docker-compose.prod.yml exec app npx prisma@6.19.0 migrate deploy
```

如果后续调整镜像，让运行容器包含项目完整依赖，也可以改用：

```bash
docker compose -f docker-compose.prod.yml exec app pnpm prisma migrate deploy
```

## 6. 查看日志

```bash
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f postgres
docker compose -f docker-compose.prod.yml logs -f nginx
```

## 7. 验证

在服务器上验证 Next.js 容器：

```bash
docker compose -f docker-compose.prod.yml exec app wget -qO- http://127.0.0.1:3000/
```

通过 Nginx 验证：

```bash
curl http://localhost/
```

安全组开放 `80` 后，可以在浏览器访问：

```text
http://服务器IP/
```

## 8. 后续配置 Nginx 和 HTTPS

建议顺序：

1. 先用服务器 IP 验证 Docker Compose、PostgreSQL、Next.js 和 Nginx 能正常工作。
2. 再把域名解析到服务器 IP。
3. 把 `deploy/nginx/default.conf` 中的 `server_name _;` 改为正式域名。
4. 配置 HTTPS 证书，例如使用云厂商证书或 Certbot。
5. 将 `NEXT_PUBLIC_SITE_URL` 改为正式 `https://` 域名。

前台页面仍然只读取本地数据库，不直接请求 Dataoke API。后台同步或转链如需真实请求，应由管理员确认后再将 `DATAOKE_ENABLE_REAL_API` 临时或受控设置为 `true`。
