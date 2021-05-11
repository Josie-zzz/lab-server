const mongoose = require('./db')

//定义schema，也就是定义一个表（集合）,_id是默认给的，可以禁用的
//所有用户表
const UserSchema = mongoose.Schema({
  _id: Number,
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
}, { _id: false })

const UserModel = mongoose.model('Users', UserSchema, 'users')

//所有学生老师信息表
const SchoolSchema = mongoose.Schema({
  _id: Number,
  studentNum: String,
  name: String,
  department: String,
  subject: String,
  sex: Number,
  identity: Number,
}, { _id: false })

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
  _id: Number,		
  studentNum: String,		
  name: String,
	status: String,	
  goalGroup: String
}, { _id: false })

const freshModel = mongoose.model('Fresh', freshSchema, 'fresh')

module.exports = {
  UserModel,
  SchoolModel,
  BriefModel,
  freshModel
}
