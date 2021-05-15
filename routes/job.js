const express = require('express')
const { UserModel, SchoolModel } = require('../model/collections')
const router = express.Router()

const SUCCESS_STATUS = 1
const FAIL_STATUS = 0
const OTHER_STATUS = 2

router.get('/all', (req, res) => {
  const {studentNum} = req.query
  //查询数据库判断此用户是否有权限，level为1才可以成员管理
  UserModel.find({studentNum}, (err, arr) => {
    if(arr.length == 0){
      res.send({
        status: OTHER_STATUS,
        errmsg: '当前用户有权限请求所有成员就业信息,但此时数据库中还没有其他成员',
      })
    }
    if(arr[0].level == 1){
      UserModel.find({level: 2}, (err, users) => {
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
              groupInfo: obj.groupInfo,
              jobInfo: obj.jobInfo || {}
            }
          })
          // console.log(newArr)
          res.send({
            status: SUCCESS_STATUS,
            errmsg: '当前用户没有权限请求所有成员就业信息',
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

router.post('/update', (req, res) => {
  const { jobInfo, studentNum } = req.body
  UserModel.updateOne({studentNum}, {jobInfo}, (err, docs) => {
    if(docs.ok){
      res.send({
        status: SUCCESS_STATUS,
        errmsg: '更新就业信息成功',
      })
    } else {
      res.send({
        status: FAIL_STATUS,
        errmsg: '更新就业信息成功',
      })
    }
  })
})

module.exports = router