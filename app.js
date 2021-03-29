const express = require('express')
const request = require('request')
const app = express()
const appId = 'wxe1f14c2fcbea5306'
const appSecret = '00d6a2fa4ea3cf8d6121434b089e195e'

//登陆
app.get('/login', (req, res) => {
  let {code} = req.query
  if(!code){
    console.log('code不存在')
    return
  }
  //请求微信小程序后端
  request(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`, 
  (err, r, body) => {
    //获得session_key和openid
    let obj = JSON.parse(body)
    res.send(obj)
  })
})

app.listen(3009)