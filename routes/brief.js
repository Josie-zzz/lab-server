const express = require('express')
const { BriefModel } = require('../model/collections')
const router = express.Router()

router.get('/', (req, res) => {

  BriefModel.find({}, (err, arr) => {
    if(arr[0]){
      res.send({status: 1, brief: arr[0]})
    }
  })
})

module.exports = router