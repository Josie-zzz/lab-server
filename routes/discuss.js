const express = require('express')
const router = express.Router()
const {DiscussModel} = require('../model/collections')

//记录数据库总数
let discussCount = -1
DiscussModel.countDocuments((err, count) => {
  if(err){
    console.log('获取讨论总数失败')
    return
  }
  discussCount = count
})



router.post('/', (req, res) => {
  let num = ++discussCount
  const discuss = new DiscussModel({
    _id: num,
    ...req.body,
  })
  discuss.save((err) => {
    if(err){
      console.log('存入数据库失败')
      return
    }
    res.send({
      _id: num,
      errmsg: 'success',
      errno: 0
    })
  })
})

module.exports = router