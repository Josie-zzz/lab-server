const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const login = require('./routes/login')
const user = require('./routes/user')
const brief = require('./routes/brief')
const fresh = require('./routes/fresh')
const job = require('./routes/job')

//配置中间件，此中间件的作用是对post请求的请求体进行解析
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//登陆
app.use('/login', login)
//讨论
app.use('/user', user)
//简介等
app.use('/brief', brief)
//纳新
app.use('/fresh', fresh)
//就业
app.use('/job', job)

app.listen(3009)