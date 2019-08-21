---
title: Gitlab API 指北
date: 2019-08-20 4:51:01
categories: 咸鱼之路
---

前段时间为手上的项目做了一个自动化构建平台, 需求大致就是实现从 gitlab 中拿到新的代码, 并且也会对分支做一些增删改查的操作, 基本实现方法当然就是一系列 gitlab 开放的 API 能力. 本文会整理出来以方便大家学习使用.

## Docs
Gitlab 的接入文档写的还是很完善的, 基本上你全都看下来也花不了半天时间. Gitlab文档 [https://gitlab.com/help/api/README.md](https://gitlab.com/help/api/README.md)

## TL;TR
当然, 你可以选择跳过上面的文档, 这也是写这篇文章的目的. 你只需要了解两件事:

1. 所有 API 都需要权限, 需要在 `URL` 或`header`中加一个`private_token`字段. 你可以在个人资料里找到这个`private_token`值.

2. 请求URL格式为
```bash 
GET http://example.com/api/v3/projects?private_token=QVy1PB7sTxfy4pqfZM1U
```
或者
```bash
curl --header "PRIVATE-TOKEN: QVy1PB7sTxfy4pqfZM1U" "http://example.com/api/v3/projects"
```
阿里的 gitlab API 是 v3 版本. 也就是URL得是: `/api/v3/__`


然后就可以想要使用什么API就在上面的文档里查什么就行了. 比如查询用户的所有项目列表:
```
GET /projects
```

这个API支持以下参数:
* `archived`(optional) - 选填, 是否归档的项目
* `order_by`(optional) - 选填, 排序由 `id`,`name`,`path`,`created_at`,`updated_at`,`last_activity_atfields`. 默认`created_at`
* `sort`(optional) - 选填, 正序`asc`或者倒序`desc`. 默认倒序
* `search`(optional) - 根据搜索字段过滤列表

返回结果:
```json
[
  {
    "id": 4,
    "description": **null**,
    "default_branch": "master",
    "public": **false**,
    "visibility_level": 0,
    "ssh_url_to_repo": "git@example.com:diaspora/diaspora-client.git",
    "http_url_to_repo": "http://example.com/diaspora/diaspora-client.git",
    "web_url": "http://example.com/diaspora/diaspora-client",
    "tag_list": [
      "example",
      "disapora client"
    ],
    "owner": {
      "id": 3,
      "name": "Diaspora",
      "created_at": "2013-09-30T13: 46: 02Z"
    },
    "name": "Diaspora Client",
    "name_with_namespace": "Diaspora / Diaspora Client",
    "path": "diaspora-client",
    "path_with_namespace": "diaspora/diaspora-client",
    "issues_enabled": **true**,
    "open_issues_count": 1,
    "merge_requests_enabled": **true**,
    "builds_enabled": **true**,
    "wiki_enabled": **true**,
    "snippets_enabled": **false**,
    "created_at": "2013-09-30T13: 46: 02Z",
    "last_activity_at": "2013-09-30T13: 46: 02Z",
    "creator_id": 3,
    "namespace": {
      "created_at": "2013-09-30T13: 46: 02Z",
      "description": "",
      "id": 3,
      "name": "Diaspora",
      "owner_id": 1,
      "path": "diaspora",
      "updated_at": "2013-09-30T13: 46: 02Z"
    },
    "archived": **false**,
    "avatar_url": "http://example.com/uploads/project/avatar/4/uploads/avatar.png"
  },
  {
    "id": 6,
    "description": **null**,
    "default_branch": "master",
    "public": **false**,
    "visibility_level": 0,
    "ssh_url_to_repo": "git@example.com:brightbox/puppet.git",
    "http_url_to_repo": "http://example.com/brightbox/puppet.git",
    "web_url": "http://example.com/brightbox/puppet",
    "tag_list": [
      "example",
      "puppet"
    ],
    "owner": {
      "id": 4,
      "name": "Brightbox",
      "created_at": "2013-09-30T13:46:02Z"
    },
    "name": "Puppet",
    "name_with_namespace": "Brightbox / Puppet",
    "path": "puppet",
    "path_with_namespace": "brightbox/puppet",
    "issues_enabled": **true**,
    "open_issues_count": 1,
    "merge_requests_enabled": **true**,
    "builds_enabled": **true**,
    "wiki_enabled": **true**,
    "snippets_enabled": **false**,
    "created_at": "2013-09-30T13:46:02Z",
    "last_activity_at": "2013-09-30T13:46:02Z",
    "creator_id": 3,
    "namespace": {
      "created_at": "2013-09-30T13:46:02Z",
      "description": "",
      "id": 4,
      "name": "Brightbox",
      "owner_id": 1,
      "path": "brightbox",
      "updated_at": "2013-09-30T13:46:02Z"
    },
    "archived": **false**,
    "avatar_url": **null**
  }
]

```


## APIs
[APIs 文档](https://gitlab.com/help/api/api_resources.md)

## 第三方封装
### node-gitlab
[https://github.com/jdalrymple/node-gitlab](https://github.com/jdalrymple/node-gitlab) 
一个个写这些API请求是件很无聊的事, 所以也推荐直接使用封装好的库.

使用方法基本一目了然:
```js
import { Gitlab } from 'gitlab';

const api = new Gitlab({
  host: 'http://gitlab.alibaba-inc.com',
  token: 'XXXXXXX',
  version: 'v3',
});

api.GroupProjects.all(groupId).then((res) => {
  ...
});
```

> 友情提示:
> node-gitlab 的文档少得可怜, 可能作者觉得官方文档已经足够了, 建议直接看`/src/services`下的源码, 找同名的方法即可.