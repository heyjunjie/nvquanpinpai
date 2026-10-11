# 独立部署

```sh
mkdir -p data
sudo chown -R 1000:1000 data
docker compose up -d --build
```

应用仅映射127.0.0.1:8787。现有宿主机Caddy可添加独立规则：

```caddyfile
example.com {
    reverse_proxy 127.0.0.1:8787
}
```

替换为自己的域名，DNS指向服务器；先验证完整代理配置再加载。不要替换其他站点配置。如果代理在容器内，127.0.0.1属于代理容器自身，需另建专用Docker网络连接应用并代理服务名8787端口。

代理必须正确传递外部HTTPS协议和真实地址。仅通过可信代理暴露应用，防止客户端伪造X-Forwarded-For。生产保留COOKIE_SECURE=true；本地HTTP调试不设置该变量。

首次启动在data/admin-credentials.json生成随机管理员信息，管理员本地读取并保护，不提交仓库。

## 持久化、备份和迁移

- data/feedback.sqlite：投稿、账户、会话、审核及永久累计访客。
- data/uploads：媒体。
- data/visitor-key：访客哈希密钥，恢复时必须同时保留。

重新部署不要删除data目录。备份应使用SQLite backup API，或仅停止本应用后复制完整data目录，不直接复制正在写入的SQLite文件。备份包含私人投稿和会话，应按敏感资料保护并另存到受保护的存储位置。

恢复时先停本应用，恢复完整data目录及1000:1000权限，再启动。更新前先备份，只更新本应用；回滚软件版本不要覆盖数据，核对版本迁移说明。

环境变量：PORT（8787）、DATA_DIR（./data）、MAX_STORAGE_MB（1024）、COOKIE_SECURE。磁盘剩余不足512MiB会拒绝新媒体。无需付费云存储。
