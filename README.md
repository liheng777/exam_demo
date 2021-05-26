开发框架2.0使用说明：https://docs.bk.tencent.com/blueapps/USAGE.html
删除文件中原有的node_modules文件；

yarn install
npm run serve
但是程序启动的时候出现错误，显示：not found ./cptable in node_modules/xlsx-style/dist/cpexcel.js
这个不是程序的问题，而是，在该文件目录下面，有段程序写错了，

在该js文件里，第807行，var cpt = require(’./cpt’ + ‘able’);有误，改成var cpt = cptable;就可以正确启动程序了，至于为什么这样改，不知道，网上查的

这个是前段vue中的Excel文件导出时用到的，
