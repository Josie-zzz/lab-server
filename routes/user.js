const express = require('express')
// const request = require('request')
const router = express.Router()
const { UserModel, SchoolModel } = require('../model/collections')

const SUCCESS_STATUS = 1
const FAIL_STATUS = 0
const OTHER_STATUS = 2

//请求用户信息
router.get('/info', (req,res, next) => {
  const { studentNum } = req.query
  console.log(studentNum)
  SchoolModel.find({studentNum}, (err, arr) => {
    console.log(err, arr[0])
    if(arr[0]){
      res.send({status: SUCCESS_STATUS, errmsg: '查找信息成功', userInfo: arr[0]})
    } else {
      res.send({status: FAIL_STATUS, errmsg: '没找到此用户数据'})
    }
    
  })
})
//更新登陆者信息（修改头像和密码）
router.post('/updateUser', (req, res) => {
  const {studentNum, password, avaterUrl} = req.body
  //需要更新的数据
  let obj = {}
  password && (obj.password = password)
  avaterUrl && (obj.avaterUrl = avaterUrl)
  UserModel.updateOne({studentNum}, obj, (err, docs) => {
    if(docs.ok){
      res.send({status: SUCCESS_STATUS, errmsg: '修改成功'})
    } else {
      res.send({status: FAIL_STATUS, errmsg: '此次没有修改'})
    }
  })
})

//成员管理，status 1（!0） 就是有权限请求到数据，0 就是没有权限请求到数据
router.get('/member', (req, res) => {
  const {studentNum} = req.query
  //查询数据库判断此用户是否有权限，level为1才可以成员管理
  UserModel.find({studentNum}, (err, arr) => {
    if(arr.length == 0){
      res.send({
        status: OTHER_STATUS,
        errmsg: '当前用户有权限请求所有用户信息,但此时数据库中还没有其他成员',
      })
    }
    if(arr[0].level == 1){
      UserModel.where('level').ne(3).exec((err, users) => {
        if(err){
          res.send({
            status: FAIL_STATUS,
            errmsg: '暂时还没有成员哦',
          })
          console.log(err)
          return 
        }
        let arr = []
        users.forEach(v => {
          let num = v.studentNum
          if(num != studentNum){
            arr.push({studentNum: num})
          }
        })
       
        SchoolModel.where('studentNum').or(arr).exec((err, infoArr) => {
          // console.log(infoArr)
          let newArr = infoArr.map(v => {
            let obj = users.find(val => val.studentNum == v.studentNum)
            return {
              ...v._doc,
              level: obj.level,
              groupInfo: obj.groupInfo
            }
          })
          // console.log(newArr)
          res.send({
            status: SUCCESS_STATUS,
            errmsg: '当前用户有权限请求所有用户信息',
            users: newArr
          })
        })
      })
      
    } else {
      res.send({
        status: FAIL_STATUS,
        errmsg: '当前用户没有权限请求所有用户信息',
      })
    }
  })
})
//删除成员
router.post('/deleteMember', (req, res) => {
  const {operator, studentNum} = req.body
  //判断此用户是否有权限删除，只有权限等级是1才可以
  UserModel.findOne({studentNum: operator}, (err, obj) => {
    if(obj){
      if(obj.level == 1){
        UserModel.updateOne({studentNum}, {level: 3,  groupInfo: null, jobInfo: null}, (err3, docs) => {
          if(docs.ok){
            res.send({status: SUCCESS_STATUS, errmsg: '删除成功'})
          } else {
            res.send({status: FAIL_STATUS, errmsg: '删除失败'})
          }
        })
      } else {
        res.send({
          status: FAIL_STATUS,
          errmsg: '您的权限级别不支持删除操作',
        })
      }
    }
  })
})

//添加成员
router.post('/addMember', (req, res) => {
  const { operator, user, groupInfo = {}, jobInfo = {} } = req.body
  UserModel.findOne({studentNum: operator}, (err, obj) => {
    if(obj){
      if(obj.level == 1){
        UserModel.findOne({studentNum: user}, (err2, obj2) => {
          if(obj2){
            if(obj2.level == 3){
              UserModel.updateOne({studentNum: user}, {level: 2, groupInfo, jobInfo}, (err3, docs) => {
                if(docs.ok){
                  res.send({
                    status: SUCCESS_STATUS,
                    errmsg: '添加成员成功',
                  })
                } else {
                  res.send({
                    status: FAIL_STATUS,
                    errmsg: '添加成员失败',
                  })
                }
              })
            } else {
              res.send({
                status: OTHER_STATUS,
                errmsg: '此成员已存在',
              })
            }
          } else {
            res.send({
              status: FAIL_STATUS,
              errmsg: '您需要添加的成员还未注册过此微信小程序',
            })
          }
        })
      } else {
        res.send({
          status: FAIL_STATUS,
          errmsg: '您的权限级别不支持添加操作',
        })
      }
    }
  })
})

//更新权限值
router.post('/updateLevel', (req, res) => {
  const { operator, studentNum, level } = req.body
  UserModel.findOne({studentNum: operator}, (err, obj) => {
    //检查level是否合法
    if(![1, 2, 3].includes(level)){
      res.send({status: FAIL_STATUS, errmsg: '不存在此权限等级'})
      return
    }
    if(obj){
      if(obj.level == 1){
        UserModel.updateOne({studentNum}, { level }, (err2, docs) => {
          if(docs.ok){
            res.send({status: SUCCESS_STATUS, errmsg: '修改成功'})
          } else {
            res.send({status: FAIL_STATUS, errmsg: '此次没有修改'})
          }
        })
      } else {
        res.send({
          status: FAIL_STATUS,
          errmsg: '您的权限级别不支持修改成员等级操作',
        })
      }
    }
  })
})

router.get('/studentInfo', (req, res) => {
  const {studentNum} = req.query
  SchoolModel.findOne({studentNum}, (err, stu) => {
    if(stu){
      res.send({status: SUCCESS_STATUS, errmsg: '搜索成功', stu})
    } else {
      res.send({status: FAIL_STATUS, errmsg: '搜索失败，不存在此人', stu})
    }
  })
})

module.exports = router