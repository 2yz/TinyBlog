TinyBlog
========

A simple Node.js blog system on LeanCloud.

- Use bootstrap

- Use LeanCloud(SaaS)  as database storage and web hosting.

- LeanCloud database service is consist of MongoDB, MySQL, HBase and Redis.

Demo: [https://tinyblog.avosapps.com/](https://tinyblog.avosapps.com/)

Source code: [https://github.com/Yezersky/TinyBlog](https://github.com/Yezersky/TinyBlog)


## Feature

- Show posts and comments.

- Message board.

- Ajax login.

- Cookie based session.

## Requuirement

Node.js

avoscloud-code ([setup guide](https://leancloud.cn/docs/cloud_code_commandline.html#安装和使用))

## Setup

1. Copy `/config/global.json.sample` to `/config/global.json`

2. Modify `/config/global.json` with your own application id and key.

3. Use `/install/database_sample.tar.gz` to initial the database. ([import guide](https://cn.avoscloud.com/docs/data_security.html#导入数据))

4. Upload the application to LeanCloud. ([deploy guide](https://cn.avoscloud.com/docs/cloud_code_commandline.html#部署))

## TODO

1. Add blog page.

2. Add post editor.

3. Add user managerment.

4. Add Gravatar.
