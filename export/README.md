

## 导出各端独立运行时

chameleon.config.js是导出各端store的配置，在执行脚本时需保证cml版本在`0.3.3-alpha.6`以上。

1. 在根目录执行`npm run export ${platform}`
2. 生成的包在`export/package/${platform}`目录下
3. 修改package.json中的版本然后发布

