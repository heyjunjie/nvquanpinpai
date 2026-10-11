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

## 精确版本发布

在目标服务器将指定 Git 提交解压到独立目录，从该目录执行：

```sh
RELEASE_SHA=<完整40位提交SHA> APP_HOME=/opt/brand-watch EDGE_NETWORK=fanzone_default sh deploy/release.sh
```

脚本先构建不可变版本镜像并运行隔离测试，再停止本应用备份完整 data 目录，保留旧容器，然后切换新容器。现有代理、其他站点与其域名配置不修改。既有公开证据 ZIP 通过只读挂载保留，不打包进开源代码。`/api/version`、镜像 revision 标签、active-release.txt 与 release-manifest.txt 用于核对源码、镜像及备份。只有健康检查确认版本一致才记录发布完成。

本次数据库迁移仅新增结构字段和索引，保留原文、账号、媒体和访客密钥；内容公开不自动标为事实已核实。历史来源冲突保留为待核。旧软件回滚须先检查迁移兼容性，不能用旧备份覆盖上线后的新投稿。

## 隔离恢复演练

```sh
BACKUP_FILE=/opt/brand-watch/backups/<时间>/data.tar.gz IMAGE=brand-watch:<提交SHA> sh deploy/restore-check.sh
```

演练只解压到新建隔离目录，不覆盖生产 data，检查 SQLite 完整性、记录／账号／访客数和访客密钥指纹。进一步验收应比对备份与恢复副本的全部媒体指纹，并用独立应用容器检查恢复后的读取与登录。备份和恢复副本包含私人资料，权限设为700，不发布到仓库。

需要切回保留的旧容器时先停止新容器，将新容器改名保留，再将 release-manifest.txt 中的 previous_container 改名为 brand-watch 并启动；保持当前 data 挂载。任何数据恢复均先备份当前数据、确认新投稿处理方式，再停应用恢复完整目录，保留访客密钥与上传文件，最后核对账号、计数及附件。不要删除旧容器或备份直至验收完成。
