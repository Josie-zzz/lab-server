const express = require('express')
// const request = require('request')
const router = express.Router()
const { UserModel, SchoolModel } = require('../model/collections')

//注册
const REGISTER_ERR = 1		//用户非本校学生或老师，不可以注册
const TO_LOGIN = 2     //用户已存在，请点击登陆
const REGISTER_SUCCESS = 3  //注册成功,信息表存在此用户并且没有注册

//登陆
const LOGIN_ERR = 1			   //用户非本校学生或老师，不可以登陆
const NO_REGISTER = 2 		 //用户还没注册
const PASSWORD_ERR = 3     //密码错误
const LOGIN_SUCCESS = 4    //登陆成功

//用户注册
router.post('/register', (req, res) => {
  const {studentNum} = req.body
  //查询此id在学校信息表中是否存在
  SchoolModel.find({studentNum}, (err, arr) => {
    if(!arr[0]){
      res.send({status: REGISTER_ERR, errmsg: '非本校学生或老师，不可以注册'})
    } else {
      //查询此id是否在用户表中存在
      UserModel.find({studentNum}, (err, arr2) => {
        if(!arr2[0]){
          // 存入数据库
          let user = new UserModel({
            ...req.body,
          })
          user.save((err) => {
            if(err){
              console.log('存入数据库失败')
              return
            }
            res.send({status: REGISTER_SUCCESS, errmsg: '注册成功，即将跳转小程序', level: 3, studentNum, avaterUrl: ''})
          })
        } else {
          res.send({ status: TO_LOGIN, errmsg: '此用户已存在，请点击登陆'})
        }
      })
    }
  })
})


//用户登录
router.post('/doLogin', (req, res) => {
  const {studentNum, password} = req.body
  //查询此id在学校信息表中是否存在
  SchoolModel.find({studentNum}, (err, arr) => {
    if(!arr[0]){
      res.send({status: LOGIN_ERR, errmsg: '非本校学生或老师，不可以登陆'})
    } else {
      //查询此id是否在用户表中存在
      UserModel.find({studentNum}, (err, arr2) => {
        if(!arr2[0]){
          res.send({status: NO_REGISTER, errmsg: '此用户不存在，请先注册'})
          return
        }
        let obj = arr2[0]
        if(obj.password !== password){
          res.send({status: PASSWORD_ERR, errmsg: '用户密码错误，请重新输入'})
        } else {
          res.send({status: LOGIN_SUCCESS, errmsg: '登陆成功，即将跳转小程序', level: obj.level, studentNum: obj.studentNum, avaterUrl: obj.avaterUrl})
        }
      })
    }
  })
})

module.exports = router