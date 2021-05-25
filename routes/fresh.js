const express = require('express')
const { freshModel, UserModel } = require('../model/collections')
const router = express.Router()

const SUCCESS_STATUS = 1
const FAIL_STATUS = 0
const OTHER_STATUS = 2

router.get('/data', (req, res) => {
  const { studentNum } = req.query
  let search = studentNum ? {studentNum} : {}
  freshModel.find(search, (err, arr) => {
    if(err){
      console.log(err)
      res.send({status: FAIL_STATUS, errmsg: '查询失败'})
      return 
    }
    res.send({status: SUCCESS_STATUS, fresh: arr, errmsg: '查询成功'})
  })
})

router.post('/add', (req, res) => {
  const { stu } = req.body
  //校验
  const {studentNum} = stu
  UserModel.findOne({studentNum}, (err2, obj2) => {
    if(!obj2){
      res.send({
        status: FAIL_STATUS,
        errmsg: '您需要添加的成员还未注册过此微信小程序',
      })
    } else if(obj2.level != 3){
      res.send({
        status: FAIL_STATUS,
        errmsg: '不可以添加组内成员为报名学生',
      })
    } else {
      // 存入数据库
      let newStu = new freshModel({
        ...stu,
      })
      newStu.save((err) => {
        if(err){
          console.log('存入数据库失败', err)
          return
        }
        res.send({status: SUCCESS_STATUS, errmsg: '添加报名学生成功'})
      })
    }
  })
})

router.post('/delete', (req, res) => {
  const {operator, studentNum} = req.body
  //判断此用户是否有权限删除，只有权限等级是1才可以
  UserModel.findOne({studentNum: operator}, (err, obj) => {
    if(obj){
      if(obj.level == 1){
        freshModel.remove({studentNum}, (err, doc) => {
          res.send({
            status: SUCCESS_STATUS,
            errmsg: '删除成功',
            studentNum: studentNum
          })
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

router.post('/update', (req, res) => {
  const {operator, studentNum, freshInfo} = req.body
  //判断此用户是否有权限删除，只有权限等级是1才可以
  UserModel.findOne({studentNum: operator}, (err, obj) => {
    if(obj){
      if(obj.level == 1){
        freshModel.updateOne({studentNum: studentNum}, freshInfo, (err, docs) => {
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

module.exports = router