/**
 * 简单模拟web环境，仅解决到调用层面，测试方法到方法调用。
 * 以及模拟人眼看到的情况，用于测试
 */
var Vue = require('vue');

// 放到global，模拟环境

global.Vue = Vue
