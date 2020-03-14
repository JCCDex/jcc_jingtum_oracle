/**
 * @description :: Admin（管理员表）
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 * 管理员表存储的是管理员和检测员，包括：
 * 超级管理员、普通管理员（政府监管部门管理员、组织机构管理员）、检测员（组织机构检测员、巡检员）
 * 注：检测员A可以查看二维码的全部内容，检测员B只能查看二维码的部分内容
*/
module.exports = {
    schema: true,
    attributes: {
      userId:       { type: 'string', maxLength: 32, unique: true, required: true },  // 管理员ID
      password:     { type: 'string', maxLength: 64 },                                // 登录密码
      salt:         { type: 'string', required: true, protect: true, maxLength: 64},  //加密盐
      userName:     { type: 'string', maxLength: 32, required: true },                // 管理员真实姓名
      phone:        { type: 'string', maxLength: 16, required: true },                // 手机号
      identity:     { type: 'string',  required: true },                // 身份证号(通过salt加密存储)
      registerArea: { type: 'string', maxLength: 64, defaultsTo: '' },                // 户籍所在地
      createdBy:    { type: 'string', maxLength: 32, required: true },                // 创建者ID（对应userId字段）
  
      unitName:     { type: 'string', maxLength: 64, required: true},// 工作单位名称
      unitAreaId:   { type: 'number', defaultsTo: 0 },                                // 工作单位所在地区id（关联行政区划表id）
      unitArea:     { type: 'string', maxLength: 128, defaultsTo: '' },               // 工作单位所在地区（省市区街道）
      unitAddress:  { type: 'string', maxLength: 128, defaultsTo: '' },               // 工作单位详细地址
  
      abodeAreaId:  { type: 'number', defaultsTo: 0 },                                // 居住地所在地区id
      abodeArea:    { type: 'string', maxLength: 64, defaultsTo: '' },                // 居住地所在地区
      abode:        { type: 'string', maxLength: 128, defaultsTo: '' },               // 居住地详细地址
  
      role:         { type: 'number', defaultsTo: 4 },                                // 角色, 1:超级管理员 2:普通管理员 3:检测员A 4:检测员B
      remark:       { type: 'string', maxLength: 256, defaultsTo: '' }                // 备注
    }
  };