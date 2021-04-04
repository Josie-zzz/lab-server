//连接数据库
const mongoose = require('mongoose')
//中间参数我也不知道是啥，反正写了没有警告信息了
mongoose.connect('mongodb://127.0.0.1:27017/lab', { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if(err){
    console.log('数据库连接失败！！')
    return
  }

  console.log('数据库连接成功！！')
})

module.exports = mongoose
