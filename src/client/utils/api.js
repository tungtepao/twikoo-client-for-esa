import { app } from '../view'

const isUrl = (s) => {
  return /^http(s)?:\/\//.test(s)
}

const call = async (tcb, event, data = {}) => {
  const _tcb = tcb || (app ? app.$tcb : null)
  const _envId = data.envId || app.$twikoo.envId
  const _funcName = data.funcName || app?.$twikoo.funcName || 'twikoo'
  if (_tcb) {
    try {
      return await _tcb.app.callFunction({
        name: _funcName,
        data: { event, ...data }
      })
    } catch (e) {
      // 向下兼容 0.1.x 版本云函数
      let oldFuncName
      switch (event) {
        case 'COMMENT_LIKE':
          oldFuncName = 'comment-like'
          break
        case 'COMMENT_GET':
          oldFuncName = 'comment-get'
          break
        case 'COMMENT_SUBMIT':
          oldFuncName = 'comment-submit'
          break
        case 'COUNTER_GET':
          oldFuncName = 'counter-get'
          break
      }
      if (oldFuncName) {
        return await _tcb.app.callFunction({
          name: oldFuncName,
          data: data
        })
      } else {
        throw new Error('请升级 Twikoo 云函数版本再试，如果仍无法解决，请删除并重新创建 Twikoo 云函数 - https://twikoo.js.org')
      }
    }
  } else if (isUrl(_envId)) {
    return await new Promise((resolve, reject) => {
      try {
        const accessToken = localStorage.getItem('twikoo-access-token')
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const result = JSON.parse(xhr.responseText)
              if (result.accessToken) {
                localStorage.setItem('twikoo-access-token', result.accessToken)
              }
              resolve({ result })
            } else {
              reject(xhr.status)
            }
          }
        }
        // 这里加一个判断，如果event=COMMENT_SUBMIT，则在_envId后面加一个/comment
        const url = event === 'COMMENT_SUBMIT_ESA' ? _envId + '/comments' : _envId
        console.log('测试ESA AI验证码的专属评论URL，看看提交评论的url',url)
        xhr.open('POST', url)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify({ event, accessToken, ...data }))
      } catch (e) {
        reject(e)
      }
    })
  } else {
    throw new Error('缺少 envId 配置 - https://twikoo.js.org')
  }
}

export {
  isUrl,
  call
}
