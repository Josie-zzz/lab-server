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

//记录数据库总数
let userCount = -1
UserModel.count((err, count) => {
  if(err){
    console.log('获取用户总数失败')
    return
  }
  userCount = count
})

//用户注册
router.post('/register', (req, res) => {
  const {studentNum} = req.body
  //查询此id在学校信息表中是否存在
  SchoolModel.count({studentNum}, (err, count) => {
    if(count == 0){
      res.send({status: REGISTER_ERR, errmsg: '非本校学生或老师，不可以注册'})
    } else {
      //查询此id是否在用户表中存在
      UserModel.count({studentNum}, (err, count) => {
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
            res.send({id, status: REGISTER_SUCCESS, errmsg: '注册成功，即将跳转小程序'})
          })
        } else {
          res.send({ status: TO_LOGIN, errmsg: '此用户已存在，请点击登陆'})
        }
      })
    }
  })
})

//请求用户信息
router.get('/info', (req,res) => {
  const { studentNum } = req.query
  SchoolModel.find({studentNum}, (err, arr) => {
    if(arr[0]){
      res.send({status: 1, errmsg: '查找信息成功', userInfo: arr[0]})
    }
    res.send({status: 0, errmsg: '没找到此用户数据'})
  })
})

//用户登录
router.post('/doLogin', (req, res) => {
  const {studentNum, password} = req.body
  //查询此id在学校信息表中是否存在
  SchoolModel.count({studentNum}, (err, count) => {
    if(count == 0){
      res.send({status: LOGIN_ERR, errmsg: '非本校学生或老师，不可以登陆'})
    } else {
      //查询此id是否在用户表中存在
      UserModel.find({studentNum}, (err, arr) => {
        if(arr.length == 0){
          res.send({status: NO_REGISTER, errmsg: '此用户不存在，请先注册'})
          return
        }
        let obj = arr[0]
        if(obj.password !== password){
          res.send({status: PASSWORD_ERR, errmsg: '用户密码错误，请重新输入'})
        } else {
          res.send({status: LOGIN_SUCCESS, errmsg: '登陆成功，即将跳转小程序'})
        }
      })
    }
  })
})

//成员管理，status 1（!0） 就是有权限请求到数据，0 就是没有权限请求到数据
router.get('/member', (req, res) => {
  const {studentNum} = req.query
  // console.log(studentNum)
  //查询数据库判断此用户是否有权限，level为1才可以成员管理
  UserModel.find({studentNum}, (err, arr) => {
    if(arr.length == 0){
      res.send({
        status: 2,
        errmsg: '当前用户有权限请求所有用户信息,但此时数据库中还没有其他成员',
        users: arr
      })
    }
    if(arr[0].level == 1){
      //拥有成员管理权限
      UserModel.find({}, (err, arr2) => {
        res.send({
          status: 1,
          errmsg: '当前用户有权限请求所有用户信息',
          users: arr2
        })
      })
    } else {
      res.send({
        status: 0,
        errmsg: '当前用户没有权限请求所有用户信息',
      })
    }
  })
})

module.exports = router