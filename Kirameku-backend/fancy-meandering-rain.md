# 数据库重新设计

## Context
现有后端数据表字段太少、关系不完整（Category/Tag 表存在但没被 Post 引用），需要根据博客前端实际需求重新设计全部数据表，并输出 DATABASE.md 文档。

## 设计方案

### 1. User（用户/管理员）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| username | str UNIQUE | 登录用户名 |
| hashed_password | str | bcrypt 加密密码 |
| nickname | str | 显示昵称 |
| avatar | str | 头像 URL |
| email | str | 邮箱 |
| bio | str | 个人简介 |
| is_admin | bool | 是否管理员 |
| created_at | datetime | 注册时间 |
| updated_at | datetime | 更新时间 |

### 2. Post（文章）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| title | str | 标题 |
| slug | str UNIQUE | URL 别名 |
| description | str | 摘要（对齐前端字段名） |
| content | str | 正文（Markdown） |
| cover | str | 封面图 URL |
| category_id | int FK→Category | 所属分类 |
| status | str | draft/published/archived |
| is_pinned | bool | 是否置顶 |
| views | int DEFAULT 0 | 浏览量 |
| likes | int DEFAULT 0 | 点赞数 |
| word_count | int DEFAULT 0 | 字数 |
| reading_time | int DEFAULT 0 | 预计阅读时间（分钟） |
| published_at | datetime | 发布时间 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 3. Category（分类）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| name | str UNIQUE | 分类名 |
| slug | str UNIQUE | URL 别名 |
| description | str | 描述 |
| sort | int DEFAULT 0 | 排序 |
| post_count | int DEFAULT 0 | 文章计数（冗余加速） |
| created_at | datetime | 创建时间 |

### 4. Tag（标签）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| name | str UNIQUE | 标签名 |
| slug | str UNIQUE | URL 别名 |
| post_count | int DEFAULT 0 | 文章计数 |

### 5. PostTag（文章-标签 多对多中间表）
| 字段 | 类型 | 说明 |
|------|------|------|
| post_id | int FK→Post | 文章 ID |
| tag_id | int FK→Tag | 标签 ID |
| PRIMARY KEY | (post_id, tag_id) | 联合主键 |

### 6. Comment（文章评论 — 访客对文章的评论）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| post_id | int FK→Post | 所属文章 |
| parent_id | int FK→Comment NULL | 父评论 ID（支持回复） |
| nickname | str | 评论者昵称 |
| email | str | 邮箱（不公开） |
| website | str | 评论者网站（可选） |
| content | str | 评论内容 |
| avatar | str | 头像（gravatar 或默认） |
| ip | str | IP 地址（防刷） |
| status | str | pending/approved/rejected |
| created_at | datetime | 评论时间 |

### 7. Message（留言板 — 独立于文章评论）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| nickname | str | 留言者昵称 |
| email | str | 邮箱 |
| website | str | 网站（可选） |
| content | str | 留言内容 |
| avatar | str | 头像 |
| ip | str | IP 地址 |
| status | str | pending/approved/rejected |
| likes | int DEFAULT 0 | 点赞数 |
| created_at | datetime | 留言时间 |

### 8. Chatter（说说/微语 — 博主发布的心情短文）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| content | str | 正文（Markdown） |
| images | str | 图片 URL 列表（JSON 数组） |
| likes | int DEFAULT 0 | 点赞数 |
| comments_count | int DEFAULT 0 | 评论数 |
| status | str | draft/published |
| created_at | datetime | 发布时间 |
| updated_at | datetime | 更新时间 |

### 9. ChatterComment（说说评论）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| chatter_id | int FK→Chatter | 所属说说 |
| parent_id | int FK→ChatterComment NULL | 父评论 |
| nickname | str | 评论者昵称 |
| email | str | 邮箱 |
| content | str | 评论内容 |
| avatar | str | 头像 |
| ip | str | IP 地址 |
| status | str | pending/approved/rejected |
| created_at | datetime | 评论时间 |

### 10. Album（相册）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| title | str | 相册标题 |
| description | str | 描述 |
| cover | str | 封面图 URL |
| photo_count | int DEFAULT 0 | 照片计数 |
| sort | int DEFAULT 0 | 排序 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 11. Photo（照片）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| album_id | int FK→Album | 所属相册 |
| url | str | 图片 URL |
| caption | str | 图片说明 |
| sort | int DEFAULT 0 | 排序 |
| created_at | datetime | 上传时间 |

### 12. Project（项目展示）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| name | str | 项目名 |
| slug | str UNIQUE | URL 别名 |
| description | str | 简短描述 |
| long_description | str | 详细介绍（Markdown） |
| cover_image | str | 封面图 |
| tech_stack | str | 技术栈（JSON 数组） |
| link_github | str | GitHub 地址 |
| link_gitee | str | Gitee 地址 |
| link_live | str | 在线演示地址 |
| link_docs | str | 文档地址 |
| status | str | active/archived/developing |
| status_label | str | 状态标签（维护中/开发中/已上线） |
| is_featured | bool | 是否推荐 |
| sort | int DEFAULT 0 | 排序 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 13. FriendLink（友情链接）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| name | str | 站点名称 |
| url | str | 站点地址 |
| avatar | str | 头像/Logo |
| description | str | 简介 |
| sort | int DEFAULT 0 | 排序 |
| is_approved | bool | 是否已审核 |
| created_at | datetime | 申请时间 |

### 14. SiteConfig（站点配置 — key-value 存储）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增 |
| key | str UNIQUE | 配置键名 |
| value | str | 配置值（JSON 字符串） |
| description | str | 配置说明 |
| updated_at | datetime | 更新时间 |

## ER 关系图
```
User (独立)
Post ──┬── Category (多对一)
       ├── PostTag ── Tag (多对多)
       └── Comment (一对多, 自引用)
Chatter ── ChatterComment (一对多)
Album ── Photo (一对多)
Project (独立)
FriendLink (独立)
Message (独立)
SiteConfig (独立)
```

## 前端字段映射
| 前端字段 | 后端字段 | 转换 |
|----------|----------|------|
| post.description | post.description | 直接对应 |
| post.date | post.published_at | 格式化为 YYYY-MM-DD |
| post.tags | PostTag→Tag.name | 查询时组装为数组 |
| post.category | Category.name | FK 查询 |
| chatter.date | chatter.created_at | 格式化 |
| chatter.description | chatter.content | 直接使用 |

## 实施步骤
1. 新建 `Kirameku-backend/DATABASE.md` — 完整表设计文档
2. 重写 `app/models/` — 所有 model 文件
3. 重写 `app/schemas/` — 所有 schema 文件
4. 补全 `app/api/` — 所有路由（chatter, comment, message, album, project, friend, site_config）
5. 补全 `app/services/` — 所有服务层
6. 重写 `app/main.py` — 注册所有新路由
