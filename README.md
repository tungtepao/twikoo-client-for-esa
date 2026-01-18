# twikoo-client-for-esa


用于在 ESA 中使用 Twikoo 评论系统，由于目前twikoo的评论刷新的逻辑是提交评论后全量刷新评论，但是由于KV存储时延的限制，会导致刷新不到最新评论的情况，特创建此版本，修改提交评论后的前端刷新逻辑，修改后端返回提交评论的全部信息，使用前端刷新。

原始README: [README_twikoo.md](README_twikoo.md)

## 主要功能

1. TkSubmit.vue

```javascript
        if (sendResult && sendResult.result && sendResult.result.id) {
          this.comment = ''
          this.errorMessage = ''
          // 修改原来父组件方法，改为前端更新评论列表
          this.$emit('comment-added', sendResult.result)
          this.saveDraft()
        } else {
          throw new Error(sendResult.result.message)
        }
```

2. TkComments.vue

```javascript
    onCommentAdded (newComment) {
      this.count++
      if (newComment.rid) {
        // 如果是回复评论，找到父评论并添加到回复列表
        const parentComment = this.comments.find(c => c.id === newComment.rid)
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = []
          }
          parentComment.replies.push(newComment)
        }
      } else {
        // 如果是顶级评论，直接添加到列表开头
        this.comments.unshift(newComment)
      }
      this.$nextTick(this.onCommentLoaded)
    }
```

### 本项目由阿里云ESA提供加速、计算和保护

![aliyun](esadocs/aliyun.png)