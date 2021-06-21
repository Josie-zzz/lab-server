const mongoose = require('./db')

//定义schema，也就是定义一个表（集合）,_id是默认给的，可以禁用的
//所有用户表
const UserSchema = mongoose.Schema({
  studentNum: String,
  password: String,
  avaterUrl: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 3
  },
  groupInfo: Object,      //组内信息，这两个只有在添加成员的时候才需要添加
  jobInfo: Object         //就业信息
})

const UserModel = mongoose.model('Users', UserSchema, 'users')

//所有学生老师信息表
const SchoolSchema = mongoose.Schema({
  studentNum: String,
  name: String,
  department: String,
  subject: String,
  sex: Number,
  identity: Number,
})

const SchoolModel = mongoose.model('School', SchoolSchema, 'school')

//协会简介表
const BriefSchema = mongoose.Schema({
  _id: Number,
  brief: String,
  history: Array,
  group: Array,
  standard: Array,
}, { _id: false })

const BriefModel = mongoose.model('Brief', BriefSchema, 'brief')

//纳新表
const freshSchema = mongoose.Schema({
  studentNum: String,		
  name: String,
	status: Number,	
  goalGroup: Number
})

const freshModel = mongoose.model('Fresh', freshSchema, 'fresh')

//竞赛和成果
const compSchema = mongoose.Schema({
  _id: String,
  type: Number,
  title: String,
  txt: String,
  creator: String,
  createTime: String,
  modifiter: String,
  updTime: String,
  studentNum: String,
}, {_id: false})

const compModel = mongoose.model('Com', compSchema, 'competition')

module.exports = {
  UserModel,
  SchoolModel,
  BriefModel,
  freshModel,
  compModel
}
