const express = require('express')
const { freshModel, UserModel } = require('../model/collections')
const router = express.Router()

const SUCCESS_STATUS = 1
const FAIL_STATUS = 0
const OTHER_STATUS = 2

router.get('/all', (req, res) => {

  freshModel.find({}, (err, arr) => {
    if(err){
      console.log(err)
      res.send({status: FAIL_STATUS, errmsg: '查询失败'})
      return 
    }
    res.send({status: SUCCESS_STATUS, fresh: arr, errmsg: '查询成功'})
  })
})

router.get('/add', (req, res) => {
  const { operator, stu } = res.body
  UserModel.findOne({studentNum: operator}, (err, obj) => {
    if(obj){
      if(obj.level == 1){
        freshModel.countDocuments((err2, count) => {
          // 存入数据库
          let id = ++count
          let newStu = new freshModel({
            _id: id,
            ...stu,
          })
          newStu.save((err) => {
            if(err){
              console.log('存入数据库失败')
              return
            }
            res.send({id, status: SUCCESS_STATUS, errmsg: '添加报名学生成功'})
          })
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
            _id: studentNum
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
  const {operator, stu} = req.body
  //判断此用户是否有权限删除，只有权限等级是1才可以
  UserModel.findOne({studentNum: operator}, (err, obj) => {
    if(obj){
      if(obj.level == 1){
        let updateObj = {}
        if(stu.goalGroup){
          updateObj.goalGroup = stu.goalGroup
        }
        if(stu.status){
          updateObj.status = stu.status
        }
        freshModel.updateOne({studentNum: stu.studentNum}, updateObj, (err, docs) => {
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