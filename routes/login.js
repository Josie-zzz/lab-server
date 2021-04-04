const express = require('express')
const request = require('request')
const router = express.Router()
const {UserModel} = require('../model/collections')

const REGISTER_SUCCESS = 1  //注册成功
const LOGINED = 2     //用户已存在，可登陆
const NO_REGISTER = 3  //未注册
const PASSWORD_ERR = 4     //密码错误
const LOGIN_SUCCESS = 5    //登陆成功

//记录数据库总数
let userCount = -1
UserModel.count((err, count) => {
  if(err){
    console.log('获取用户总数失败')
    return
  }
  userCount = count
})

router.post('/register', (req, res) => {
  const {studentNum} = req.body
  //注册先查询此用户id是否存在
  UserModel.count({studentNum}, (err, count) => {
    if(err){
      console.log('查询数据库出错')
      return
    }

    if(count == 0){
      // 存入数据库
      let id = ++userCount
      let user = new UserModel({
        _id: id,
        ...req.body,
      })
      user.save((err) => {
        if(err){
          console.log('存入数据库失败')
          return
        }
        //1注册成功，2已注册，登陆成功
        res.send({id, status: REGISTER_SUCCESS, errmsg: '注册成功'})
      })
    } else {
      res.send({ status: LOGINED, errmsg: '此用户已存在，请直接登陆'})
    }
  })
})

router.post('/doLogin', (req, res) => {
  const {studentNum, password} = req.body
  //先查询此用户是否存在
  UserModel.find({studentNum}, (err, arr) => {
    if(arr.length == 0){
      res.send({status: NO_REGISTER, errmsg: '此用户不存在，请先注册'})
      return
    }
    let obj = arr[0]
    if(obj.password !== password){
      res.send({status: PASSWORD_ERR, errmsg: '用户密码错误'})
    } else {
      res.send({status: LOGIN_SUCCESS, errmsg: '登陆成功', userInfo: obj})
    }
  })
})

module.exports = router