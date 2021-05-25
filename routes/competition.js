const express = require('express')
const { compModel } = require('../model/collections')
const router = express.Router()

const SUCCESS_STATUS = 1
const FAIL_STATUS = 0
const OTHER_STATUS = 2

router.get('/data', (req, res) => {
  const { studentNum, _id } = req.query
  let search = {}
  if(studentNum){
    search = {studentNum}
  } else if(_id){
    search = {_id}
  }
  compModel.find(search, (err, arr) => {
    if(err){
      console.log(err)
      res.send({status: FAIL_STATUS, errmsg: '查询失败'})
      return 
    }
    res.send({status: SUCCESS_STATUS, comp: arr, errmsg: '查询成功'})
  })

})

router.post('/add', (req, res) => {
  const { comp } = req.body
  let newComp = new compModel({
    _id: comp.createTime,
    ...comp,
  })
  newComp.save((err) => {
    if(err){
      console.log('存入数据库失败', err)
      return
    }
    res.send({status: SUCCESS_STATUS, errmsg: '添加成功'})
  })
})

router.post('/delete', (req, res) => {
})

module.exports = router