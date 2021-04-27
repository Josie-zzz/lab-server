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
          UserModel.countDocuments((err2, count) => {
            // 存入数据库
            let id = ++count
            let user = new UserModel({
              _id: id,
              ...req.body,
            })
            user.save((err) => {
              if(err){
                console.log('存入数据库失败')
                return
              }
              res.send({id, status: REGISTER_SUCCESS, errmsg: '注册成功，即将跳转小程序', level: 3, studentNum, avaterUrl: ''})
            })
          })
        } else {
          res.send({ status: TO_LOGIN, errmsg: '此用户已存在，请点击登陆'})
        }
      })
    }
  })
})

//请求用户信息
router.get('/info', (req,res, next) => {
  const { studentNum } = req.query
  console.log(studentNum)
  SchoolModel.find({studentNum}, (err, arr) => {
    console.log(err, arr[0])
    if(arr[0]){
      res.send({status: 1, errmsg: '查找信息成功', userInfo: arr[0]})
    } else {
      res.send({status: 0, errmsg: '没找到此用户数据'})
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

router.post('/updateUser', (req, res) => {
  const {studentNum, password, avaterUrl} = req.body
  //需要更新的数据
  let obj = {}
  password && (obj.password = password)
  avaterUrl && (obj.avaterUrl = avaterUrl)
  UserModel.updateOne({studentNum}, obj, (err, docs) => {
    if(docs.ok){
      res.send({status: 1, errmsg: '修改成功'})
    } else {
      res.send({status: 0, errmsg: '此次没有修改'})
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
      SchoolModel.find({}, async (err, arr2) => {
        //查询用户表的级别
        await arr2.forEach( async (v) => {
          await UserModel.find({studentNum: v.studentNum}, (err, arr3) => {
            if(arr3[0]){
              Object.assign(v, {level: arr3[0].level})
            }
          })
        })
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