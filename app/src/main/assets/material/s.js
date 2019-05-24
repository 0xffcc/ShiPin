var express = require('express');
var fs =require('fs');
var multer = require('multer');
var path = require('path');
var schedule = require("node-schedule");
var md5=require('md5-node');
var ipaddress = getIPAdress();//ip地址
var port = 8093;
var app = express();
var imgUrl="";
var data;
var bodyParser = require('body-parser');//解析,用req.body获取post参数
var date_;
var mysql  = require('mysql');  
var oss_url;
const request = require('request')
var config={     
  host     : '192.168.1.145',       
  user     : 'chr123',              
  password : 'chr123456',       
  port: '3306',                   
}

//oss
var Minio = require('minio')
// Instantiate the minio client with the endpoint
// and access keys as shown below.
var minioClient = new Minio.Client({
    endPoint: 'play.minio.io',
    port: 9000,
    useSSL: true,
    accessKey: 'Q3AM3UQ867SPQQA43P2F',
    secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG'
});


function timestampToTime(timestamp) {
  var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
  var D = date.getDate() + ' ';
  var h = date.getHours() + ':';
  var m = date.getMinutes() + ':';
  var s = date.getSeconds();
  // return Y+M+D+h+m+s;
  return Y+M+D;
}


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();    
});


//静态资源后缀限制
app.use(function(req,res,next){
    var static= /^(\/res|\/uploads)/g;//设置指定文件目录
   // var suffix=/(\.jpg|\.gif|\.jpeg|\.png|\.js|\.css)$/g;//后缀格式指定
    var suffix=/$/g;
    if(static.test(req.path)&&!suffix.test(req.path)){
        console.log('请求非法后缀');
        return res.end('请求非法');
    }else{
        next();
    }
});

//设置静态资源文件访问
app.use('/res',express.static(path.join(__dirname,'res')));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

let server = app.listen(port, function () {
    if (ipaddress) {
        console.log('please open ' + ipaddress + ':' + port + ' in browser');
    } else {
        console.log('no networking, please open ' + ipaddress + ':' + port + ' in browser');
    }
});



var upload = multer({
    limits:{
        //限制文件大小
        // 10kb
        // fileSize: 10*1000,
        fileSize: 100000000*1000,
        //限制文件数量
        files: 1
    },
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if(!!file){
                cb(null, './uploads/img');
            }
           
        },
        filename: function (req, file, cb) {
            console.log(req.method)
            // if(req.method=="GET"){
            //   console.log(req.query)
            // }else if(req.method=="POST"){
            //   console.log(req.body)
            // }
            if(!!file){
                date_=new Date().getTime()+'-';
                // var changedName = date_+file.originalname;
                var changedName =file.originalname;
                console.log(changedName)
                imgUrl=changedName;
                if(file.originalname=='' || !file.originalname || file.originalname=="undefined" || file.originalname==undefined){
                    imgUrl='';
                    return false;
                }
                // var changedName =index+file.originalname;
               
              cb(null, changedName);
              // Using fPutObject API upload your file to the bucket europetrip.
              
          
          //  var file = './uploads/img/'+changedName

          //       var metaData = {
          //         'Content-Type': 'application/octet-stream',
          //         'X-Amz-Meta-Testing': 1234,
          //         'example': 5678
          //     }
          
          //验证存储桶是否存在。
          // minioClient.bucketExists('hrgg', function(err) {
          //       if (err) {
          //          if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
          //          return console.log(err)
          //       }
          //       // if err is null it indicates that the bucket exists.
          //       console.log('桶存在')
          //       minioClient.fPutObject('hrgg', changedName, file, metaData, function(err, etag) {
          //         if (err) return console.log(err)
          //         console.log('文件上传成功')
          //       });
          // })
          
          
          // presigned url for 'getObject' method.
          // expires in a day.
          // minioClient.presignedUrl('GET', 'hrgg', changedName, 7*24*60*60, function(err, presignedUrl) {
          //       if (err) return console.log(err)
          //       console.log(presignedUrl)
          //       oss_url=presignedUrl;
          // })

          
               
            }
        }
    }),
    fileFilter: function(req, file, cb){
        // if(file.mimetype == 'image/png'){
        if(file.mimetype){
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
});
var singleUpload = upload.single('singleFile');


// 视频
var upload2 = multer({
    limits:{
        //限制文件大小
        // 10kb
        // fileSize: 10*1000,
        fileSize: 100000000*1000,
        //限制文件数量
        files: 1
    },
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if(!!file){
                cb(null, './uploads/video');
            }
           
        },
        filename: function (req, file, cb) {
            console.log(req.method)
            // if(req.method=="GET"){
            //   console.log(req.query)
            // }else if(req.method=="POST"){
            //   console.log(req.body)
            // }
            if(!!file){
                date_=new Date().getTime()+'-';
                // var changedName = date_+file.originalname;
                var changedName =file.originalname;
                console.log(changedName)
                imgUrl=changedName;
                if(file.originalname=='' || !file.originalname || file.originalname=="undefined" || file.originalname==undefined){
                    imgUrl='';
                    return false;
                }
                // var changedName =index+file.originalname;
                cb(null, changedName);

          //       var file = './uploads/video/'+changedName

          //       var metaData = {
          //         'Content-Type': 'application/octet-stream',
          //         'X-Amz-Meta-Testing': 1234,
          //         'example': 5678
          //     }
          
          // //验证存储桶是否存在。
          // minioClient.bucketExists('hrgg', function(err) {
          //       if (err) {
          //          if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
          //          return console.log(err)
          //       }
          //       // if err is null it indicates that the bucket exists.
          //       console.log('桶存在')
          //       minioClient.fPutObject('hrgg', changedName, file, metaData, function(err, etag) {
          //         if (err) return console.log(err)
          //         console.log('文件上传成功')
          //       });
          // })
          
          
          // // presigned url for 'getObject' method.
          // // expires in a day.
          // minioClient.presignedUrl('GET', 'hrgg', changedName, 7*24*60*60, function(err, presignedUrl) {
          //       if (err) return console.log(err)
          //       console.log(presignedUrl)
          //       oss_url=presignedUrl;
          // })
            }
        }
    }),
    fileFilter: function(req, file, cb){
        // if(file.mimetype == 'image/png'){
        if(file.mimetype){
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
});
var singleUpload2 = upload2.single('singleFile');
app.get('/', function (req, res) {
    // res.sendFile(path.resolve(__dirname, './sj/index.html'));
    res.writeHead(200,{'Content-Type':'text/html'})
	// 如果url=‘/’ ,读取指定文件下的html文件，渲染到页面。
	fs.readFile('./demo2.html','utf-8',function(err,data){
	if(err){
	throw err ;
	}
	res.end(data);
	});
});
// 删除数据
app.get('/delData', function (req, res) {

    var connection = mysql.createConnection({     
        host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port,                   
        database: req.query.database  
      }); 
       
      connection.connect();
       
      var delSql = 'DELETE FROM '+req.query.table+' where id='+req.query.id;
      console.log(delSql)
      //删
      connection.query(delSql,function (err, result) {
              if(err){
                console.log('[DELETE ERROR] - ',err.message);
                return;
              }        
       
             console.log('--------------------------DELETE----------------------------');
             console.log('DELETE affectedRows',result.affectedRows);
             console.log('-----------------------------------------------------------------\n\n');  
      });
     


        if(req.query.vip_cz && req.query.vip_cz!="undefined"){
            var sql='alter table member_list drop viptype'+req.query.id;
            console.log(sql)
            connection.query(sql,function (err, result) {
          if(err){
            console.log('[alter ERROR] - ',err.message);
            return;
          }

          });
        
        var sql2='alter table member_list drop viptype_expirtime'+req.query.id;
       
        connection.query(sql2,function (err, result) {
          if(err){
            console.log('[alter ERROR] - ',err.message);
            return;
          }

          });
        }else{
          var again="update "+req.query.table+" set id=id-1 where id>"+req.query.id;
          connection.query(again,function (err, result) {
            if(err){
              console.log('[DELETE ERROR] - ',err.message);
              return;
            }
            console.log("重新排序")
            });
        }
       
      connection.end();
      res.json(data)

})

// 新增视频数据
app.post('/addData', function (req, res) {
    singleUpload(req,res,(err)=>{
        if(req.body.vedio=="undefined"){
            req.body.vedio="";
        }
      if(req.body.title=="undefined"){
        res.json(data)
      }else{
        console.log(req.body)
        var connection = mysql.createConnection({     
            host     : config.host,       
            user     : config.user,              
            password : config.password,       
            port: config.port,                   
            database: 'test' 
          }); 
          connection.connect();
           console.log(req.body.id)

          if(imgUrl!=""){
              var changedName2=imgUrl;
              var file = './uploads/img/'+changedName2

                  var metaData2 = {
                    'Content-Type': 'application/octet-stream',
                    'X-Amz-Meta-Testing': 1234,
                    'example': 5678
                }
            
            //验证存储桶是否存在。
            minioClient.bucketExists('hrgg', function(err) {
                  if (err) {
                    if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
                    return console.log(err)
                  }
                  // if err is null it indicates that the bucket exists.
                  console.log('桶存在')
                  minioClient.fPutObject('hrgg', changedName2, file, metaData2, function(err, etag) {
                    if (err) return console.log(err)
                    console.log('文件上传成功')
                  });
            })
          }
           
        var  addSql = 'INSERT INTO Sino(isLink,title,user,img,text,dates,vedio,limitTime,type,weight,id) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
        var  addSqlParams = [parseInt(req.body.isLink),req.body.title,req.body.user,imgUrl,req.body.text,new Date().getTime(),req.body.vedio,req.body.limitTime,req.body.type,req.body.weight,parseInt(req.body.id)+1];
        //增
        connection.query(addSql,addSqlParams,function (err, result) {
                if(err){
                console.log('[INSERT ERROR] - ',err.message);
                return;
                }        
        
                console.log('--------------------------INSERT----------------------------');
                //console.log('INSERT ID:',result.insertId);        
                console.log('INSERT ID:',result);        
                console.log('-----------------------------------------------------------------\n\n');  
                imgUrl='';
               
        });
        var again="update Sino set id=id+1 where id>"+req.body.id+1;
        connection.query(again,function (err, result) {
          if(err){
            console.log('[DELETE ERROR] - ',err.message);
            return;
          }
          console.log("重新排序")
          });
          connection.end();
        }
       
        res.json(data)
      
      
      
    })
});

// 查数据
app.get('/data', function (req, res) {

console.log(req.query)
    var connection = mysql.createConnection({     
        host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port, 
        // database: 'test'                 
        database: req.query.dataDase 
      }); 
      connection.connect();
       
    //   var  sql = 'SELECT * FROM Sino';
      var  sql = 'SELECT * FROM '+req.query.table;
      //查
      connection.query(sql,function (err, result) {
              if(err){
              console.log('[SELECT ERROR] - ',err.message);
              return;
              }
          data=result;
          console.log('--------------------------SELECT----------------------------');
          // console.log(result);
          console.log('------------------------------------------------------------\n\n');  
        //   data=JSON.stringify(data)
        // console.log(data[0].img)
          connection.end();
          console.log("关闭")
              if(req.query.table=="type_list"){
                var arr=[];
                for(var i=0;i<data.length;i++){
                  if(data[i]){
                    (function(i){
                      minioClient.presignedUrl('GET', 'hrgg', data[i].img, 1*24*60*60, function(err, presignedUrl) {
                        if (err) return console.log(err)
                        // console.log(presignedUrl)
                        if(data[i].isLink==0){
                          data[i].img=presignedUrl;
                        }else{
                          
                        }
                        
                        arr.push(1);
                        if(arr.length==data.length){
                          // console.log(data)
                          res.json(data)
                        }
                      })
                    })(i);  
                  }
                }
                
              }else if(req.query.table=="Sino"){
                var arr2=[];
                var arr3=[];
                for(var i=0;i<data.length;i++){
                  if(data[i]){
                    (function(i){
                      minioClient.presignedUrl('GET', 'hrgg', data[i].img, 1*24*60*60, function(err, presignedUrl) {
                        // if (err) return console.log(err)
                        // console.log(presignedUrl)
                        
                          data[i].img=presignedUrl;
                        
                        // console.log(arr.push(presignedUrl))
                        // data[i].img=presignedUrl;
                        // console.log(arr)
                        arr2.push(1);
                        if(arr2.length==data.length && arr3.length==data.length){
                          res.json(data)
                        }
                      })
                    })(i);  


                    (function(i){
                      minioClient.presignedUrl('GET', 'hrgg', data[i].vedio, 1*24*60*60, function(err, presignedUrl) {
                        // if (err) return console.log(err)
                        // console.log(presignedUrl)
                        if(data[i].isLink==0){
                          data[i].vedio=presignedUrl;
                        }else{
                          
                        }
                        // console.log(arr.push(presignedUrl))
                        // data[i].img=presignedUrl;
                        // console.log(arr)
                        arr3.push(1);
                        if(arr3.length==data.length && arr3.length==data.length){
                          res.json(data)
                        }
                      })
                    })(i);  
                }
              }

              }else if(req.query.table=="bumber"){
                var arr4=[];
                for(var i=0;i<data.length;i++){
                  if(data[i]){
                    (function(i){
                      minioClient.presignedUrl('GET', 'hrgg', data[i].imgaddr, 1*24*60*60, function(err, presignedUrl) {
                        // if (err) return console.log(err)
                        if(data[i].isLink==0){
                          data[i].imgaddr=presignedUrl;
                        }else{
                          
                        }
                        
                        // console.log(arr.push(presignedUrl))
                        // data[i].img=presignedUrl;
                        // console.log(arr)
                        arr4.push(1);
                        if(arr4.length==data.length){
                          res.json(data)
                        }
                      })
                    })(i);  
                }
              }
              }else if(req.query.table=="logo"){
                // console.log(data)
                var arr5=[];
                for(var i=0;i<data.length;i++){
                  if(data[i]){
                    (function(i){
                      minioClient.presignedUrl('GET', 'hrgg', data[i].imgaddr, 1*24*60*60, function(err, presignedUrl) {
                        if(data[i].isLink==0){
                          data[i].imgaddr=presignedUrl;
                        }else{
                          
                        }
                        arr5.push(1);
                        if(arr5.length==data.length){
                          res.json(data)
                        }
                      })
                    })(i);  
                }
              }
              }else if(req.query.table=="advert"){
                var arr6=[];
                var arr7=[];
                for(var i=0;i<data.length;i++){
                  if(data[i]){
                    (function(i){
                      minioClient.presignedUrl('GET', 'hrgg', data[i].background, 1*24*60*60, function(err, presignedUrl) {
                        // if (err) return console.log(err)
                        if(data[i].isLink1==0){
                          data[i].background=presignedUrl;
                        }else{
                          
                        }
                        arr6.push(1);
                        if(arr6.length==data.length && arr7.length==data.length){
                          res.json(data)
                        }
                      })
                    })(i);  
                }
              }

                for(var i=0;i<data.length;i++){
                  if(data[i]){
                  (function(i){
                    minioClient.presignedUrl('GET', 'hrgg', data[i].code, 1*24*60*60, function(err, presignedUrl) {
                      // if (err) return console.log(err)
                      if(data[i].isLink2==0){
                        data[i].code=presignedUrl;
                      }else{
                        
                      }
                      arr7.push(1);
                      if(arr7.length==data.length && arr6.length==data.length){
                        res.json(data)
                      }
                    })
                  })(i);  
              }
            }
              }else{
                res.json(data)
              }
              
              

          
      });  
});

// 登陆
app.get('/login', function (req, res) {

  console.log(req.query)
      var connection = mysql.createConnection({     
          host     : config.host,       
          user     : config.user,              
          password : config.password,       
          port: config.port, 
          // database: 'test'                 
          database:"sino" 
        }); 
        connection.connect();
        var data2=[];
         
      //   var  sql = 'SELECT * FROM Sino';
        // var  sql = "select Account,Password from member_list where Account = '"+req.query.userName+"' and Password = '"+req.query.passWord+"'";
        var  sql = 'select * from '+req.query.login+' where Account = "'+req.query.userName+' "and Password = "'+req.query.passWord+'"';
        console.log(sql)
        //查
        connection.query(sql,function (err, result) {
                if(err){
                console.log('[SELECT ERROR] - ',err.message);
                return;
                }
                data2=result;
            console.log('--------------------------SELECT----------------------------');
            console.log(data2);
            console.log('------------------------------------------------------------\n\n');  
          //   data=JSON.stringify(data)
           
            // console.log(data2)

            var modSql = 'UPDATE member_list SET LastTime = ? ,  LastIP = ? WHERE Account = ?';
        // "UPDATE Person SET Address = 'Zhongshan 23', City = 'Nanjing 'WHERE LastName = 'Wilson'"
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
  
        var modSqlParams = [timestampToTime(timestamp),getIp(req),req.query.userName];
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });

        connection.end();
        res.json(data2)
           
        });  

        
  });

// 播放视频
app.get('/playVideo', function (req, res) {

  console.log(req.query)
      var connection = mysql.createConnection({     
          host     : config.host,       
          user     : config.user,              
          password : config.password,       
          port: config.port, 
          // database: 'test'                 
          database:"test" 
        }); 
        connection.connect();
         
      //   var  sql = 'SELECT * FROM Sino';
        var  sql = "select * from Sino where id="+req.query.id;
        //查
        connection.query(sql,function (err, result) {
                if(err){
                console.log('[SELECT ERROR] - ',err.message);
                return;
                }
            data=result;
            console.log('--------------------------SELECT----------------------------');
            console.log(result);
            console.log('------------------------------------------------------------\n\n');  

            minioClient.presignedUrl('GET', 'hrgg', data[0].vedio, 1*24*60*60, function(err, presignedUrl) {
              if (err) return console.log(err)
              // console.log(presignedUrl)
              data[0].vedio=presignedUrl;
              connection.end();
              console.log("关闭")
              res.json(data)
            })
        });  
  });



//单个文件上传
app.post('/upload/single',(req,res)=>{
    console.log(req.method)
    singleUpload(req,res,(err)=>{
        console.log(req.body)
        var connection = mysql.createConnection({     
            host     : config.host,       
            user     : config.user,              
            password : config.password,       
            port: config.port,                
            database: 'test' 
          }); 
           
          connection.connect();
        //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
        //   console.log(modSql)
        if(!imgUrl || imgUrl=="" || imgUrl=="undefined"){
            
        }else{
          var changedName2=imgUrl;
            var file = './uploads/img/'+changedName2

                var metaData2 = {
                  'Content-Type': 'application/octet-stream',
                  'X-Amz-Meta-Testing': 1234,
                  'example': 5678
              }
          
          //验证存储桶是否存在。
          minioClient.bucketExists('hrgg', function(err) {
                if (err) {
                   if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
                   return console.log(err)
                }
                // if err is null it indicates that the bucket exists.
                console.log('桶存在')
                minioClient.fPutObject('hrgg', changedName2, file, metaData2, function(err, etag) {
                  if (err) return console.log(err)
                  console.log('文件上传成功')
                });
          })


            var modSql = 'UPDATE Sino SET img = ?  WHERE Id = ?';
            var modSqlParams = [imgUrl,parseInt(req.body.index)];
            console.log(parseInt(req.body.index)+1);
            //改
            connection.query(modSql,modSqlParams,function (err, result) {
            if(err){
                    console.log('[UPDATE ERROR] - ',err.message);
                    return;
            }        
            console.log('--------------------------UPDATE----------------------------');
            console.log('UPDATE affectedRows',result.affectedRows);
            console.log('-----------------------------------------------------------------\n\n');
            });
            // imgUrl='';
            
            connection.end();
        }
          
              // var modSqlParams = [oss_url,parseInt(req.body.index)+1];
           

          if(!!err){
            console.log(err.message)
            res.json({
                code: '2000',
                type:'single',
                originalname: '',
                msg: err.message
            })
            return;
        }
        if(!!req.file){
           
            res.json({
                code: '0000',
                type:'single',
                originalname: req.file.originalname,
                msg: '返回'
            })
        } else {
            
            res.json({
                code: '1000',
                type:'single',
                originalname: '',
                msg: '返回'
            })
        }

       
    });
})

//视频编辑
app.get('/edit',(req,res)=>{
    console.log(req.method)
    console.log(req.query)
    var connection = mysql.createConnection({     
      host     : config.host,       
      user     : config.user,              
      password : config.password,       
      port: config.port,                  
        database: 'test' 
      }); 
       var limitTime=parseInt(req.query.limitTime);
       if(limitTime==NaN || limitTime=="NaN" || !limitTime){
           limitTime=0;
       }
      connection.connect();
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            console.log(req.query.isLink)
            var modSql = 'UPDATE Sino SET title = ?,isLink = ?,user = ?,text = ?,dates = ?,limitTime=?,vedio=?,weight=? WHERE Id = ?';
            var modSqlParams = [req.query.title,parseInt(req.query.isLink),req.query.user,req.query.text,new Date().getTime(),limitTime,req.query.vedio,req.query.weight,parseInt(req.query.index)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();


   
        res.json({
            code: '0000',
            type:'single',
            msg: '返回'
        })
    

});



//视频上传
app.post('/upload/video',(req,res)=>{
    console.log(req.method)
    singleUpload2(req,res,(err)=>{
        console.log(req.body)
        var connection = mysql.createConnection({     
          host     : config.host,       
          user     : config.user,              
          password : config.password,       
          port: config.port,                  
            database: 'test' 
          }); 
          connection.connect();
         
        if(!req.file || req.file=="" || req.file=="undefined"){
            console.log("d")
        }else{
            console.log("视频地址:"+imgUrl)
            var modSql = 'UPDATE Sino SET vedio = ?,isLink = ? WHERE Id = ?';
            var modSqlParams = [imgUrl,0,parseInt(req.body.index)+1];
            //改
            connection.query(modSql,modSqlParams,function (err, result) {
            if(err){
                    console.log('[UPDATE ERROR] - ',err.message);
                    return;
            }        
            console.log('--------------------------UPDATE----------------------------');
            console.log('UPDATE affectedRows',result.affectedRows);
            console.log('-----------------------------------------------------------------\n\n');
            });
            var changedName2=imgUrl;
            var file = './uploads/video/'+changedName2

                var metaData2 = {
                  'Content-Type': 'application/octet-stream',
                  'X-Amz-Meta-Testing': 1234,
                  'example': 5678
              }
          
          //验证存储桶是否存在。
          minioClient.bucketExists('hrgg', function(err) {
                if (err) {
                   if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
                   return console.log(err)
                }
                // if err is null it indicates that the bucket exists.
                console.log('桶存在')
                minioClient.fPutObject('hrgg', changedName2, file, metaData2, function(err, etag) {
                  if (err) return console.log(err)
                  console.log('文件上传成功')
                });
          })
          
          
          // presigned url for 'getObject' method.
          // expires in a day.
          // minioClient.presignedUrl('GET', 'hrgg', changedName, 1*24*60*60, function(err, presignedUrl) {
          //       if (err) return console.log(err)
          //       console.log(presignedUrl)
          //       oss_url=presignedUrl;
          // })


            // imgUrl='';
        }
        connection.end();
            res.json({
                code: '1000',
                type:'single',
                originalname: '',
                msg: '返回'
            })
    });
})

//类型上传
app.post('/upload/type',(req,res)=>{
    singleUpload(req,res,(err)=>{
      if(req.body.title=="undefined"){
        res.json(data)
      }else{
        var connection = mysql.createConnection({     
          host     : config.host,       
          user     : config.user,              
          password : config.password,       
          port: config.port,                   
            database: 'sino' 
          }); 
          connection.connect();
          var jsId;


          if(imgUrl!=""){
              var changedName2=imgUrl;
              var file = './uploads/img/'+changedName2

                  var metaData2 = {
                    'Content-Type': 'application/octet-stream',
                    'X-Amz-Meta-Testing': 1234,
                    'example': 5678
                }
            
            //验证存储桶是否存在。
            minioClient.bucketExists('hrgg', function(err) {
                  if (err) {
                    if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
                    return console.log(err)
                  }
                  console.log('桶存在')
                  minioClient.fPutObject('hrgg', changedName2, file, metaData2, function(err, etag) {
                    if (err) return console.log(err)
                    console.log('文件上传成功')
                  });
            })
          }
          

          
        var  addSql = 'INSERT INTO type_list(isLink,img,type,vip,viptype,vipmoney,showd) VALUES(?,?,?,?,?,?,?)';
        var  addSqlParams = [0,imgUrl,req.body.type,0,1,30,0];
        //增
        connection.query(addSql,addSqlParams,function (err, result) {
                if(err){
                console.log('[INSERT ERROR] - ',err.message);
                return;
                }        
        
                console.log('--------------------------INSERT----------------------------');
                //console.log('INSERT ID:',result.insertId);        
                jsId=result.insertId;
                console.log('INSERT ID:',result.insertId);        
                console.log('-----------------------------------------------------------------\n\n');  
                imgUrl='';
               
        
        // var again="update type_list set id=id+1 where id>"+jsId;
        // connection.query(again,function (err, result) {
        //   if(err){
        //     console.log('[DELETE ERROR] - ',err.message);
        //     return;
        //   }
        //   console.log("重新排序")
        //   });
        

        var sql='alter table member_list add viptype'+jsId+' VARCHAR(500)'
        console.log(sql)
        connection.query(sql,function (err, result) {
          if(err){
            console.log('[alter ERROR] - ',err.message);
            return;
          }

          });
        
        var sql2='alter table member_list add viptype_expirtime'+jsId+' VARCHAR(500)'
       
        connection.query(sql2,function (err, result) {
          if(err){
            console.log('[alter ERROR] - ',err.message);
            return;
          }

          });
        
        connection.end();
        res.json(data)
      });
      } 
      
    })
})

//banner上传
app.post('/upload/banner',(req,res)=>{
    singleUpload(req,res,(err)=>{
      if(req.body.title=="undefined"){
        res.json(data)
      }else{
        var connection = mysql.createConnection({     
          host     : config.host,       
          user     : config.user,              
          password : config.password,       
          port: config.port,                  
            database: 'sino' 
          }); 
          connection.connect();

          if(imgUrl!=""){
            var changedName2=imgUrl;
            var file = './uploads/img/'+changedName2

                var metaData2 = {
                  'Content-Type': 'application/octet-stream',
                  'X-Amz-Meta-Testing': 1234,
                  'example': 5678
              }
          
          //验证存储桶是否存在。
          minioClient.bucketExists('hrgg', function(err) {
                if (err) {
                  if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
                  return console.log(err)
                }
                console.log('桶存在')
                minioClient.fPutObject('hrgg', changedName2, file, metaData2, function(err, etag) {
                  if (err) return console.log(err)
                  console.log('文件上传成功')
                });
          })
        }

        var  addSql = 'INSERT INTO bumber(isLink,imgaddr,title,id,link) VALUES(?,?,?,?,?)';
        var  addSqlParams = [0,imgUrl,req.body.title,req.body.index,req.body.link];
        //增
        connection.query(addSql,addSqlParams,function (err, result) {
                if(err){
                console.log('[INSERT ERROR] - ',err.message);
                return;
                }        
        
                console.log('--------------------------INSERT----------------------------');
                //console.log('INSERT ID:',result.insertId);        
                console.log('INSERT ID:',result);        
                console.log('-----------------------------------------------------------------\n\n');  
                imgUrl='';
               
        });
        var again="update bumber set id=id+1 where id>"+req.body.index;
        connection.query(again,function (err, result) {
          if(err){
            console.log('[DELETE ERROR] - ',err.message);
            return;
          }
          console.log("重新排序")
          });
        }
        connection.end();
        res.json(data)
      
      
      
    })
})

//类型编辑
app.get('/type/edit',(req,res)=>{
    console.log(req.method)
    console.log(req.query)
    var connection = mysql.createConnection({     
      host     : config.host,       
      user     : config.user,              
      password : config.password,       
      port: config.port,                  
        database: 'sino' 
      }); 
       var limitTime=parseInt(req.query.limitTime);
       if(limitTime==NaN || limitTime=="NaN" || !limitTime){
           limitTime=0;
       }
      connection.connect();
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSql = 'UPDATE type_list SET img = ?,isLink = ?,type = ?  WHERE Id = ?';
            var modSqlParams = [req.query.img,parseInt(req.query.isLink),req.query.type,parseInt(req.query.id)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();


   
        res.json({
            code: '0000',
            type:'single',
            msg: '返回'
        })
    

});

//banner编辑
app.get('/banner/edit',(req,res)=>{
    console.log(req.method)
    console.log(req.query)
    var connection = mysql.createConnection({     
      host     : config.host,       
      user     : config.user,              
      password : config.password,       
      port: config.port,             
        database: 'sino' 
      }); 
      connection.connect();
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSql = 'UPDATE bumber SET isLink= ?, imgaddr = ?,link = ?,title=? WHERE Id = ?';
            var modSqlParams = [parseInt(req.query.isLink),req.query.imgaddr,req.query.link,req.query.title,parseInt(req.query.id)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();


   
        res.json({
            code: '0000',
            type:'single',
            msg: '返回'
        })
    

});
//推送消息编辑
app.get('/message/edit',(req,res)=>{
    console.log(req.method)
    console.log(req.query)
    var connection = mysql.createConnection({     
      host     : config.host,       
      user     : config.user,              
      password : config.password,       
      port: config.port,                  
        database: 'sino' 
      }); 
      connection.connect();
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSql = 'UPDATE message_push SET title = ?,time_interval = ?,text= ? ,linkaddr= ? WHERE Id = ?';
            var modSqlParams = [req.query.title,req.query.time_interval,req.query.text,req.query.linkaddr,parseInt(req.query.id)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();


   
        res.json({
            code: '0000',
            type:'single',
            msg: '返回'
        })
    

});

//消息推送添加
app.get('/upload/message',(req,res)=>{
        var connection = mysql.createConnection({     
          host     : config.host,       
          user     : config.user,              
          password : config.password,       
          port: config.port,                   
            database: 'sino' 
          }); 
          connection.connect();
          console.log(req.query)
        var  addSql = 'INSERT INTO message_push(title,text,time_interval,linkaddr,type,id) VALUES(?,?,?,?,?,?)';
        var  addSqlParams = [req.query.title,req.query.text,req.query.time_interval,req.query.linkaddr,req.query.type,parseInt(req.query.id)];
        //增
        connection.query(addSql,addSqlParams,function (err, result) {
                if(err){
                console.log('[INSERT ERROR] - ',err.message);
                return;
                }        
        
                console.log('--------------------------INSERT----------------------------');
                //console.log('INSERT ID:',result.insertId);        
                console.log('INSERT ID:',result);        
                console.log('-----------------------------------------------------------------\n\n');  
                imgUrl='';
               
        });
        var again="update message_push set id=id+1 where id>"+req.query.id;
        connection.query(again,function (err, result) {
          if(err){
            console.log('[DELETE ERROR] - ',err.message);
            return;
          }
          console.log("重新排序")
          });
        
        connection.end();
        res.json(data);
})

//logo编辑
app.get('/logo/edit',(req,res)=>{
    console.log(req.method)
    console.log(req.query)
    var connection = mysql.createConnection({     
      host     : config.host,       
      user     : config.user,              
      password : config.password,       
      port: config.port,             
        database: 'sino' 
      }); 
      connection.connect();
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSql = 'UPDATE logo SET isLink = ?, imgaddr = ?,title=? WHERE Id = ?';
            var modSqlParams = [1,req.query.imgaddr,req.query.title,parseInt(req.query.id)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();


   
        res.json({
            code: '0000',
            type:'single',
            msg: '返回'
        })
    

});

//logo 编辑上传
app.post('/logo/up',(req,res)=>{
  singleUpload(req,res,(err)=>{
    var connection = mysql.createConnection({     
        host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port,                  
      database: 'sino' 
    }); 
    console.log(req.file)

    if(imgUrl!=""){
      var changedName2=imgUrl;
      var file = './uploads/img/'+changedName2

          var metaData2 = {
            'Content-Type': 'application/octet-stream',
            'X-Amz-Meta-Testing': 1234,
            'example': 5678
        }
    
    //验证存储桶是否存在。
    minioClient.bucketExists('hrgg', function(err) {
          if (err) {
            if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
            return console.log(err)
          }
          console.log('桶存在')
          minioClient.fPutObject('hrgg', changedName2, file, metaData2, function(err, etag) {
            if (err) return console.log(err)
            console.log('文件上传成功')
          });
    })
  }
    
      connection.connect();
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSql = 'UPDATE logo SET isLink = ?, imgaddr = ? WHERE Id = ?';
            var modSqlParams = [0,imgUrl,parseInt(req.body.index)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();
      res.json(data)
    
    
  })
})

//banner 编辑上传
app.post('/banner/up',(req,res)=>{
  singleUpload(req,res,(err)=>{
    var connection = mysql.createConnection({     
        host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port,                  
      database: 'sino' 
    }); 
    console.log(req.file)
    
      connection.connect();

      if(imgUrl!=""){
        var changedName2=imgUrl;
        var file = './uploads/img/'+changedName2

            var metaData2 = {
              'Content-Type': 'application/octet-stream',
              'X-Amz-Meta-Testing': 1234,
              'example': 5678
          }
      
      //验证存储桶是否存在。
      minioClient.bucketExists('hrgg', function(err) {
            if (err) {
              if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
              return console.log(err)
            }
            console.log('桶存在')
            minioClient.fPutObject('hrgg', changedName2, file, metaData2, function(err, etag) {
              if (err) return console.log(err)
              console.log('文件上传成功')
            });
      })
    }
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSql = 'UPDATE bumber SET isLink=?, imgaddr = ? WHERE Id = ?';
            var modSqlParams = [0,imgUrl,parseInt(req.body.index)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();
      res.json(data)
    
    
  })
})


//类型图片 编辑上传
app.post('/type/up',(req,res)=>{
  singleUpload(req,res,(err)=>{
    var connection = mysql.createConnection({     
      host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port,               
      database: 'sino' 
    }); 
    console.log(req.file)
    
      connection.connect();

      if(imgUrl!=""){
        var changedName2=imgUrl;
        var file = './uploads/img/'+changedName2

            var metaData2 = {
              'Content-Type': 'application/octet-stream',
              'X-Amz-Meta-Testing': 1234,
              'example': 5678
          }
      
      //验证存储桶是否存在。
      minioClient.bucketExists('hrgg', function(err) {
            if (err) {
              if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
              return console.log(err)
            }
            console.log('桶存在')
            minioClient.fPutObject('hrgg', changedName2, file, metaData2, function(err, etag) {
              if (err) return console.log(err)
              console.log('文件上传成功')
            });
      })
    }
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSql = 'UPDATE type_list SET img = ?,isLink=? WHERE Id = ?';
            var modSqlParams = [imgUrl,0,parseInt(req.body.index)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();
      res.json(data)
    
    
  })
})

//支付回调文件上传
app.post('/zhifu/backfile',(req,res)=>{
  singleUpload2(req,res,(err)=>{
    var connection = mysql.createConnection({     
      host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port,               
      database: 'sino' 
    }); 
    console.log(req.body.id)
      connection.connect();
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSqlg = 'UPDATE pay_manage SET file_path = ? where id = ?';
            var modSqlParamsg = ['http://'+ipaddress+':'+port+'/uploads/video/'+imgUrl,parseInt(req.body.id)];
            console.log(modSqlParamsg)
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改 
        connection.query(modSqlg,modSqlParamsg,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log("数据库= ")
        console.log('UPDATE affectedRows',result.affectedRows);
        
        });
        connection.end();
      res.json(req.body)
    
    
  })
})


//支付管理添加
app.get('/upload/zhifu',(req,res)=>{
  var connection = mysql.createConnection({     
    host     : config.host,       
    user     : config.user,              
    password : config.password,       
    port: config.port,                  
      database: 'sino' 
    }); 
    connection.connect();
    console.log(req.query)
  var  addSql = 'INSERT INTO pay_manage(paychannel,payaddr,valid,id,com_key,priv_key,type) VALUES(?,?,?,?,?,?,?)';
  var  addSqlParams = [req.query.paychannel,req.query.payaddr,req.query.valid,parseInt(req.query.id),req.query.com_key,req.query.priv_key,req.query.type];
  //增
  connection.query(addSql,addSqlParams,function (err, result) {
          if(err){
          console.log('[INSERT ERROR] - ',err.message);
          return;
          }        
  
          console.log('--------------------------INSERT----------------------------');
          //console.log('INSERT ID:',result.insertId);        
          console.log('INSERT ID:',result);        
          console.log('-----------------------------------------------------------------\n\n');  
          imgUrl='';
         
  });
  var again="update pay_manage set id=id+1 where id>"+req.query.id;
  connection.query(again,function (err, result) {
    if(err){
      console.log('[DELETE ERROR] - ',err.message);
      return;
    }
    console.log("重新排序")
    });
  
  connection.end();
  res.json(data);
})

//支付管理编辑
app.get('/zhifu/up',(req,res)=>{
    var connection = mysql.createConnection({     
      host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port,               
        database: 'sino' 
    }); 
    console.log(req.file)
    
      connection.connect();
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSql = 'UPDATE pay_manage SET paychannel = ? ,com_key=?,priv_key=?,file_path=?, payaddr = ? ,type=? WHERE Id = ?';
            var modSqlParams = [req.query.paychannel,req.query.com_key,req.query.priv_key,req.query.file_path,req.query.payaddr,req.query.type,parseInt(req.query.id)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();
      res.json(data)
})

//vip类型管理编辑_编辑
app.get('/vipType/edit',(req,res)=>{
  var connection = mysql.createConnection({     
    host     : config.host,       
      user     : config.user,              
      password : config.password,       
      port: config.port,               
      database: 'sino' 
  }); 
  
    connection.connect();
  //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
          
          var modSql = 'UPDATE type_list SET viptype = ? , vipmoney = ?  WHERE Id = ?';
          var modSqlParams = [req.query.viptype,parseInt(req.query.vipmoney),parseInt(req.query.id)];
      
    
        // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
      console.log("执行数据库");
      //改
      connection.query(modSql,modSqlParams,function (err, result) {
      if(err){
              console.log('[UPDATE ERROR] - ',err.message);
              return;
      }        
      console.log('--------------------------UPDATE----------------------------');
      console.log('UPDATE affectedRows',result.affectedRows);
      console.log('-----------------------------------------------------------------\n\n');
      });
      connection.end();
    res.json(data)
})

//vip类型管理编辑_新增
app.get('/vipType/editAdd',(req,res)=>{
  var connection = mysql.createConnection({     
    host     : config.host,       
      user     : config.user,              
      password : config.password,       
      port: config.port,               
      database: 'sino' 
  }); 
  var show=1;
  console.log(req.query)
    connection.connect();
  //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
          
          var modSql = 'UPDATE type_list SET viptype = ? , vipmoney = ? , showd = ?  WHERE Id = ?';
          var modSqlParams = [req.query.viptype,parseInt(req.query.vipmoney),show,parseInt(req.query.id)];
          console.log('UPDATE type_list SET viptype = '+req.query.viptype+' , vipmoney = '+req.query.vipmoney+' , showd = '+show+', WHERE Id = '+parseInt(req.query.id))
          console.log(modSqlParams)
      
    
        // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
      console.log("执行数据库");
      //改
      connection.query(modSql,modSqlParams,function (err, result) {
      if(err){
              console.log('[UPDATE ERROR] - ',err.message);
              return;
      }        
      console.log('--------------------------UPDATE----------------------------');
      console.log('UPDATE affectedRows',result.affectedRows);
      console.log('-----------------------------------------------------------------\n\n');
      });
      connection.end();
    res.json(data)
})

//vip类型管理编辑_删除
app.get('/vipType/del_',(req,res)=>{
  var connection = mysql.createConnection({     
    host     : config.host,       
      user     : config.user,              
      password : config.password,       
      port: config.port,               
      database: 'sino' 
  }); 
  var show=0;
  console.log(req.query)
    connection.connect();
  //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
          
          var modSql = 'UPDATE type_list SET showd = ? WHERE Id = ?';
          var modSqlParams = [show,parseInt(req.query.id)];
      
    
        // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
      console.log("执行数据库");
      //改
      connection.query(modSql,modSqlParams,function (err, result) {
      if(err){
              console.log('[UPDATE ERROR] - ',err.message);
              return;
      }        
      console.log('--------------------------UPDATE----------------------------');
      console.log('UPDATE affectedRows',result.affectedRows);
      console.log('-----------------------------------------------------------------\n\n');
      });
      connection.end();
    res.json(data)
})

//用户管理编辑
app.get('/user/edit',(req,res)=>{
  var connection = mysql.createConnection({     
        host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port,                   
        database: 'sino' 
  }); 
  var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
  
    connection.connect();
  //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
          console.log(timestampToTime(timestamp));
          var modSql = 'UPDATE member_list SET LastTime = ?, Password = ? , Account = ?  WHERE UserID = ?';
          var modSqlParams = [timestampToTime(timestamp),req.query.Password,req.query.Account,parseInt(req.query.UserID)];
      
    
        // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
      console.log("执行数据库");
      //改
      connection.query(modSql,modSqlParams,function (err, result) {
      if(err){
              console.log('[UPDATE ERROR] - ',err.message);
              return;
      }        
      console.log('--------------------------UPDATE----------------------------');
      console.log('UPDATE affectedRows',result.affectedRows);
      console.log('-----------------------------------------------------------------\n\n');
      });
      connection.end();
    res.json(data)
})

//用户新增
app.get('/user/add',(req,res)=>{
  var connection = mysql.createConnection({     
        host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port,                   
        database: 'sino' 
  }); 
  var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000;
    console.log(req.query)
    connection.connect();
  //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
          console.log(timestampToTime(timestamp));
          var  addSql = 'INSERT INTO member_list(channel,Account,Password,RegisterTime,VipType,LastTime,LastIP) VALUES(?,?,?,?,?,?,?)';
          var  addSqlParams = [req.query.qudao,req.query.useName,req.query.passWord,timestampToTime(timestamp),2,timestampToTime(timestamp),getIp(req)];
          //增
          connection.query(addSql,addSqlParams,function (err, result) {
                  if(err){
                  console.log('[INSERT ERROR] - ',err.message);
                  return;
                  }        
          
                  console.log('--------------------------INSERT----------------------------');
                  //console.log('INSERT ID:',result.insertId);        
                  console.log('INSERT ID:',result);        
                  console.log('-----------------------------------------------------------------\n\n');  
                  imgUrl='';
                 
          });

        // 统计
        var  sql3 = 'SELECT * FROM home_statistics';
        //查
        connection.query(sql3,function (err, result) {
                if(err){
                console.log('[SELECT ERROR] - ',err.message);
                return;
                }
            var s_bc=result;

            s_bc=s_bc[s_bc.length-1];
            console.log(s_bc)
            var modSql2 = 'UPDATE home_statistics SET usr_number = ?  WHERE id = ?';
            var modSqlParams2 = [s_bc.usr_number+1,parseInt(s_bc.id)];
              // console.log(modSql)

            connection.query(modSql2,modSqlParams2,function (err, result) {
              if(err){
              console.log('[UPDATE ERROR] - ',err.message);
              return;
              }        

              console.log('--------------------------UPDATE----------------------------');     
            
        });
          connection.end();
          res.json(data);
      })
})

// 删除用户数据
app.get('/delData_user', function (req, res) {

  var connection = mysql.createConnection({     
      host     : config.host,       
      user     : config.user,              
      password : config.password,       
      port: config.port,                   
      database: req.query.database  
    }); 
     
    connection.connect();
     
    var delSql = 'DELETE FROM '+req.query.table+' where UserID='+req.query.id;
    console.log(delSql)
    //删
    connection.query(delSql,function (err, result) {
            if(err){
              console.log('[DELETE ERROR] - ',err.message);
              return;
            }        
     
           console.log('--------------------------DELETE----------------------------');
           console.log('DELETE affectedRows',result.affectedRows);
           console.log('-----------------------------------------------------------------\n\n');  
    });
     
    connection.end();
    res.json(data)

})

// 用户支付
app.get('/userPay', function (req, res) {

  var connection = mysql.createConnection({     
      host     : config.host,       
      user     : config.user,              
      password : config.password,       
      port: config.port,                   
      database: "sino"  
    }); 
     console.log(req.query);
    connection.connect();
    var  sql = 'SELECT viptype_expirtime'+req.query.id+' FROM member_list where UserID='+parseInt(req.query.UserID);
    var date_pay;
    var new_time
    //查
    connection.query(sql,function (err, result) {
            if(err){
            console.log('ERROR');
            return;
            }
        console.log('--------------------------SELECT----------------------------');
        date_pay=result[0];
        var key='viptype_expirtime'+req.query.id;
            now_time=Date.parse(new Date());
            // now_time=now_time/ 1000;
            new_time = Date.parse(date_pay[key]);
            new_time = (new_time / 1000)-(now_time/ 1000);
            console.log(new_time);
            if(new_time==null || !new_time || new_time<=0){
              new_time=0;
            }
        console.log('------------------------------------------------------------\n\n');  
      //   data=JSON.stringify(data)
  

     var date__; 
     if(req.query.viptype==1){
        date__=86400*365+new_time;
     }else if(req.query.viptype==2){
        date__=86400*90+new_time;
     }else if(req.query.viptype==3){
        date__=86400*30+new_time;
     }
     var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
    // var delSql = 'DELETE FROM '+req.query.table+' where UserID='+req.query.id;
    var modSql = 'UPDATE member_list SET viptype'+req.query.id+' = ?, viptype_expirtime'+req.query.id+' = ?, VipType = ? WHERE UserID = ?';
    var modSqlParams = [req.query.viptype,timestampToTime(timestamp+date__),1,parseInt(req.query.UserID)];
      // console.log(modSql)
    //删
    connection.query(modSql,modSqlParams,function (err, result) {
      if(err){
      console.log('[UPDATE ERROR] - ',err.message);
      return;
      }        

      console.log('--------------------------UPDATE----------------------------');     
     
});

//生成订单
var  addSql2 = 'INSERT INTO order_list (channel,OrderNumber,UserAccount,RechargeTime,VipType,Money,ExpireTime,PayChannel,PayAddr,status) VALUES(?,?,?,?,?,?,?,?,?,?)';
var  addSqlParams2 = [req.query.qudao,randomString(15),req.query.userName,timestampToTime(timestamp),req.query.jiemu,req.query.vipmoney,timestampToTime(timestamp+date__),req.query.type_,req.query.type_,0];
console.log(1234342345)
//增
connection.query(addSql2,addSqlParams2,function (err, result) {
        if(err){
        console.log('[INSERT ERROR] - ',err.message);
        return;
        }        

        console.log('--------------------------INSERT----------------------------');
        //console.log('INSERT ID:',result.insertId);        
        console.log('INSERT ID:',result);        
        console.log('-----------------------------------------------------------------\n\n');  
});


 })

 


// 统计
var  sql3 = 'SELECT * FROM home_statistics';
//查
connection.query(sql3,function (err, result) {
        if(err){
        console.log('[SELECT ERROR] - ',err.message);
        return;
        }
    var s_bc=result;

    s_bc=s_bc[s_bc.length-1];
    console.log(s_bc)
    var modSql2 = 'UPDATE home_statistics SET money = ?  WHERE id = ?';
    var modSqlParams2 = [parseInt(req.query.vipmoney)+s_bc.money,parseInt(s_bc.id)];
      // console.log(modSql)

    connection.query(modSql2,modSqlParams2,function (err, result) {
      if(err){
      console.log('[UPDATE ERROR] - ',err.message);
      return;
      }        

      console.log('--------------------------UPDATE----------------------------');     
     
});
connection.end();
});  

     
  
    res.json(data)

})



//推广编辑
app.get('/tuiGuang/edit',(req,res)=>{
  console.log(req.method)
  console.log(req.query)
  var connection = mysql.createConnection({     
    host     : config.host,       
    user     : config.user,              
    password : config.password,       
    port: config.port,             
      database: 'sino' 
    }); 
    connection.connect();
  //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
          
          var modSql = 'UPDATE advert SET isLink1 = ?,isLink2 = ?, text = ?,background = ?,code = ?, download = ? WHERE Id = ?';
          var modSqlParams = [parseInt(req.query.isLink1),parseInt(req.query.isLink2),req.query.text,req.query.background,req.query.code,req.query.download,parseInt(req.query.id)];
      
    
        // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
      console.log("执行数据库");
      //改
      connection.query(modSql,modSqlParams,function (err, result) {
      if(err){
              console.log('[UPDATE ERROR] - ',err.message);
              return;
      }        
      console.log('--------------------------UPDATE----------------------------');
      console.log('UPDATE affectedRows',result.affectedRows);
      console.log('-----------------------------------------------------------------\n\n');
      });
      connection.end();


 
      res.json({
          code: '0000',
          type:'single',
          msg: '返回'
      })
  

});

//推广图片 编辑上传
app.post('/tuiGuang2/up',(req,res)=>{
  singleUpload(req,res,(err)=>{
    var connection = mysql.createConnection({     
      host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port,               
      database: 'sino' 
    }); 
    console.log(req.file)
    if(imgUrl!=""){
      var changedName2=imgUrl;
      var file = './uploads/img/'+changedName2

          var metaData2 = {
            'Content-Type': 'application/octet-stream',
            'X-Amz-Meta-Testing': 1234,
            'example': 5678
        }
    
    //验证存储桶是否存在。
    minioClient.bucketExists('hrgg', function(err) {
          if (err) {
            if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
            return console.log(err)
          }
          console.log('桶存在')
          minioClient.fPutObject('hrgg', changedName2, file, metaData2, function(err, etag) {
            if (err) return console.log(err)
            console.log('文件上传成功')
          });
    })
  }
      connection.connect();
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSql = 'UPDATE advert SET background = ?,isLink1= ? WHERE Id = ?';
            var modSqlParams = [imgUrl,0,parseInt(req.body.index)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();
      res.json(data)
    
    
  })
})

//推广二维吗上传
app.post('/tuiGuang2/code',(req,res)=>{
  singleUpload(req,res,(err)=>{
    var connection = mysql.createConnection({     
      host     : config.host,       
        user     : config.user,              
        password : config.password,       
        port: config.port,               
      database: 'sino' 
    }); 
    console.log(req.file)
    if(imgUrl!=""){
      var changedName2=imgUrl;
      var file = './uploads/img/'+changedName2

          var metaData2 = {
            'Content-Type': 'application/octet-stream',
            'X-Amz-Meta-Testing': 1234,
            'example': 5678
        }
    
    //验证存储桶是否存在。
    minioClient.bucketExists('hrgg', function(err) {
          if (err) {
            if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
            return console.log(err)
          }
          console.log('桶存在')
          minioClient.fPutObject('hrgg', changedName2, file, metaData2, function(err, etag) {
            if (err) return console.log(err)
            console.log('文件上传成功')
          });
    })
  }
      connection.connect();
    //   var modSql = 'UPDATE tab1 SET img='+ipaddress +':'+ port+'/uploads'+req.file.originalname+' ? WHERE Id ='+req.body.index+1;
            
            var modSql = 'UPDATE advert SET code = ?,isLink2= ? WHERE Id = ?';
            var modSqlParams = [imgUrl,0,parseInt(req.body.index)];
        
      
          // var modSqlParams = ['http://'+ipaddress+':'+port+'/uploads/'+imgUrl,parseInt(req.body.index)+1];
        console.log("执行数据库");
        //改
        connection.query(modSql,modSqlParams,function (err, result) {
        if(err){
                console.log('[UPDATE ERROR] - ',err.message);
                return;
        }        
        console.log('--------------------------UPDATE----------------------------');
        console.log('UPDATE affectedRows',result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
        });
        connection.end();
      res.json(data)
    
    
  })
})


// 首页数据
app.get('/index/data', function (req, res) {
      var connection = mysql.createConnection({     
          host     : config.host,       
          user     : config.user,              
          password : config.password,       
          port: config.port, 
          // database: 'test'                 
          database: "sino" 
        }); 
        connection.connect();
         
      //   var  sql = 'SELECT * FROM Sino';
        var  sql = 'SELECT * FROM home_statistics';
        //查
        connection.query(sql,function (err, result) {
                if(err){
                console.log('[SELECT ERROR] - ',err.message);
                return;
                }


                var data=result;
                var  sql2 = 'SELECT * FROM order_list';
                var all_channel=[];
                //查
                connection.query(sql2,function (err, result2) {
                        if(err){
                        console.log('[SELECT ERROR] - ',err.message);
                        return;
                        }


                        var  sql3 = 'SELECT * FROM member_list';
                        //查
                        connection.query(sql3,function (err, result3) {
                                if(err){
                                console.log('[SELECT ERROR] - ',err.message);
                                return;
                                }
                                // console.log(result3)
                                
                                // console.log(result2)
                                var allMoney=0;
                                for(var i=0;i<result2.length;i++){
                                  if(result2[i].status==1){
                                    allMoney+=result2[i].Money;
                                  }else{
                                    
                                  }
                                 
                                  // let _that = result2[i];
                                  
                                  
                                  all_channel.push(result2[i].channel)
                                  
                                    
                                  
                                }
                                all_channel=unique1(all_channel);
                                var backData={};
                                backData.channel_obj=[];
                                for(var i=0;i<all_channel.length;i++){
                                  backData.channel_obj.push({
                                    name:all_channel[i],
                                    money:function(){
                                      var money=0;
                                      for(var o=0;o<result2.length;o++){
                                        if(result2[o].channel==all_channel[i] && result2[o].status==1){
                                          money+=result2[o].Money;
                                          // console.log(money)
                                        }
                                        
                                      }
                                      return money;
                                    }(),
                                    user:function(){
                                      var qdUser=0;
                                      for(var o=0;o<result3.length;o++){
                                        if(result3[o].channel==all_channel[i]){
                                          qdUser++;
                                          // console.log(money)
                                        }
                                        
                                      }
                                      return qdUser;
                                    }(),
                                    todayUser:function(){
                                      var User=0;
                                      var now_time = Date.parse(new Date());
                                      now_time = now_time / 1000;
                                      for(var o=0;o<result3.length;o++){
                                        if(result3[o].channel==all_channel[i] && result3[o].RegisterTime==timestampToTime(now_time)){
                                          User++;
                                          // console.log(money)
                                        }
                                        
                                      }
                                      return User;
                                    }(),
                                    yesterdayUser:function(){
                                      var User=0;
                                      var now_time = Date.parse(new Date());
                                      now_time = now_time / 1000;
                                      for(var o=0;o<result3.length;o++){
                                        if(result3[o].channel==all_channel[i] && result3[o].RegisterTime==timestampToTime(now_time-86400)){
                                          User++;
                                          // console.log(money)
                                        }
                                        
                                      }
                                      return User;
                                    }(),
                                    todayMoney:function(){
                                      var money=0;
                                      for(var o=0;o<result2.length;o++){
                                        var now_time = Date.parse(new Date());
                                        now_time = now_time / 1000;
                                        if(result2[o].channel==all_channel[i] && result2[o].RechargeTime==timestampToTime(now_time) && result2[o].status==1){
                                          money+=result2[o].Money;
                                          // console.log(money)
                                        }
                                        
                                      }
                                      return money;
                                    }(),
                                    sevenMoney:function(){
                                      var senvenDay=[];
                                      var now_time = Date.parse(new Date());
                                          now_time = now_time / 1000;
                                      for(var m=0;m<7;m++){
                                        var money=0;
                                        for(var o=0;o<result2.length;o++){
                                          if(result2[o].channel==all_channel[i] && result2[o].RechargeTime==timestampToTime(now_time-(m*86400)) && result2[o].status==1){
                                            money+=result2[o].Money;
                                            // console.log(money)
                                          }
                                          
                                        }
                                        senvenDay.push(money);
                                      }
                                      
                                      return senvenDay;
                                    }(),
                                    sevenUser:function(){
                                      var senvenDay=[];
                                      var now_time = Date.parse(new Date());
                                      now_time = now_time / 1000;
                                      for(var m=0;m<7;m++){
                                        var User=0;
                                        for(var o=0;o<result3.length;o++){
                                          if(result3[o].channel==all_channel[i] && result3[o].RegisterTime==timestampToTime(now_time-(m*86400))){
                                            User++;
                                            // console.log(money)
                                          }
                                        }
                                        senvenDay.push(User);
                                      }
                                      return senvenDay;
                                    }(),
                                    ssMoney:function(){
                                      var senvenDay=[];
                                      var now_time = Date.parse(new Date());
                                          now_time = now_time / 1000;
                                      for(var m=0;m<30;m++){
                                        var money=0;
                                        for(var o=0;o<result2.length;o++){
                                          if(result2[o].channel==all_channel[i] && result2[o].RechargeTime==timestampToTime(now_time-(m*86400)) && result2[o].status==1){
                                            money+=result2[o].Money;
                                            // console.log(money)
                                          }
                                          
                                        }
                                        senvenDay.push(money);
                                      }
                                      
                                      return senvenDay;
                                    }(),
                                    ssUser:function(){
                                      var senvenDay=[];
                                      var now_time = Date.parse(new Date());
                                      now_time = now_time / 1000;
                                      for(var m=0;m<30;m++){
                                        var User=0;
                                        for(var o=0;o<result3.length;o++){
                                          if(result3[o].channel==all_channel[i] && result3[o].RegisterTime==timestampToTime(now_time-(m*86400))){
                                            User++;
                                            // console.log(money)
                                          }
                                        }
                                        senvenDay.push(User);
                                      }
                                      return senvenDay;
                                    }(),
                                    jsMoney:function(){
                                      var senvenDay=[];
                                      var now_time = Date.parse(new Date());
                                          now_time = now_time / 1000;
                                      for(var m=0;m<90;m++){
                                        var money=0;
                                        for(var o=0;o<result2.length;o++){
                                          if(result2[o].channel==all_channel[i] && result2[o].RechargeTime==timestampToTime(now_time-(m*86400)) && result2[o].status==1){
                                            money+=result2[o].Money;
                                            // console.log(money)
                                          }
                                          
                                        }
                                        senvenDay.push(money);
                                      }
                                      
                                      return senvenDay;
                                    }(),
                                    jsUser:function(){
                                      var senvenDay=[];
                                      var now_time = Date.parse(new Date());
                                      now_time = now_time / 1000;
                                      for(var m=0;m<90;m++){
                                        var User=0;
                                        for(var o=0;o<result3.length;o++){
                                          if(result3[o].channel==all_channel[i] && result3[o].RegisterTime==timestampToTime(now_time-(m*86400))){
                                            User++;
                                            // console.log(money)
                                          }
                                        }
                                        senvenDay.push(User);
                                      }
                                      return senvenDay;
                                    }(),
                                    yesterdayMoney:function(){
                                      var money=0;
                                      for(var o=0;o<result2.length;o++){
                                        var now_time = Date.parse(new Date());
                                        now_time = now_time / 1000;
                                        if(result2[o].channel==all_channel[i] && result2[o].RechargeTime==timestampToTime(now_time-86400) && result2[o].status==1){
                                          money+=result2[o].Money;
                                          // console.log(money)
                                        }
                                        
                                      }
                                      return money;
                                    }(),

                                  })
                                  
                                }
                                var allUser=0;
                                for(var i=0;i<data.length;i++){
                                  allUser+=data[i].usr_number;
                                }
                                // console.log(all_channel);
                                
                                backData.yesterday=data[data.length-2];
                                backData.today=data[data.length-1];
                                backData.allMoney=allMoney;
                                backData.allUser=allUser;
                                backData.other_channelUser=result3.length-allUser;
                                backData.sevenDay=sliceArr = data.slice(-7);
                                backData.monthDay=sliceArr = data.slice(-30);
                                backData.three_monthDay=sliceArr = data.slice(-90);
                                connection.end();
                                res.json(backData);
                        })
                       

                      })
                      

            console.log('--------------------------SELECT----------------------------');
            console.log(data);
            console.log('------------------------------------------------------------\n\n');  
            
    })
})

app.get('/api', function(req, res){
  
//  微信
  // console.log(sign);
  if(req.query.zfqd==1){
    var sign='bill_body='+req.query.bill_body+'&bill_title='+req.query.bill_title+'&mchno=10019627&nonce_str='+req.query.nonce_str+'&pay_type=3&price='+(req.query.vipmoney)*100+'&UserID='+req.query.UserID+'&key=a0899bbadf8c2adaa0389719d1707580';
    sign=md5(sign).toUpperCase(); 
    var payOBJ=JSON.stringify({
      "UserID":req.query.UserID,
      'mchno':'10019627',
      'pay_type':'3',
      'price':(parseInt(req.query.vipmoney))*100,
      'bill_title':req.query.bill_title,
      'bill_body':req.query.bill_body,
      "linkId":null,
      'nonce_str':req.query.nonce_str,
      'sign':sign,
  })
  // 支付宝
  }else if(req.query.zfqd==2){
    if(req.query.num==1){
      console.log("支付渠道1")
        var sign='bill_body='+req.query.bill_body+'&bill_title='+req.query.bill_title+'&mchno=10019627&nonce_str='+req.query.nonce_str+'&pay_type=4&price='+(req.query.vipmoney)*100+'&UserID='+req.query.UserID+'&key=a0899bbadf8c2adaa0389719d1707580';
        var mchno="10019627";
      }else if(req.query.num==2){
      console.log("支付渠道2")
      var sign='bill_body='+req.query.bill_body+'&bill_title='+req.query.bill_title+'&mchno=10742248&nonce_str='+req.query.nonce_str+'&pay_type=4&price='+(req.query.vipmoney)*100+'&UserID='+req.query.UserID+'&key=99148c12ad8b784da53a99e62658a835';
      var mchno="10742248";
    }
    sign=md5(sign).toUpperCase(); 
    var payOBJ=JSON.stringify({
      "UserID":req.query.UserID,
      'mchno':mchno,
      'pay_type':'4',
      'price':(parseInt(req.query.vipmoney))*100,
      'bill_title':req.query.bill_title,
      'bill_body':req.query.bill_body,
      "linkId":null,
      'nonce_str':req.query.nonce_str,
      'sign':sign,
  })
}request({
       url:'http://api.wage2020.cn/api/wypay/createOrder',
       method:'POST',
       headers:{
          'Content-Type': null,
       },
       body: payOBJ
   },function (error, response, body) {
                  if (!error&&response.statusCode == 200) {
                      console.log(body);
                      var connection = mysql.createConnection({     
                        host     : config.host,       
                        user     : config.user,              
                        password : config.password,       
                        port: config.port,                   
                        database: "sino"  
                      }); 
                      connection.connect();
                       
                       var timestamp = Date.parse(new Date());
                          timestamp = timestamp / 1000;
                  // 生成订单
                    
                    body=JSON.parse(body);
                    console.log(body);
                   
                      new_time=0;
                    
                    var date__; 
                    if(req.query.viptype==1){
                        date__=86400*365+new_time;
                    }else if(req.query.viptype==2){
                        date__=86400*90+new_time;
                    }else if(req.query.viptype==3){
                        date__=86400*30+new_time;
                    }
                  if(body.order){
                    console.log(req.query)
                    var  addSql2 = 'INSERT INTO order_list (channel,OrderNumber,UserAccount,RechargeTime,VipType,Money,ExpireTime,PayChannel,PayAddr,status,vipid,userid,viptime) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)';
                    var  addSqlParams2 = [req.query.qudao,body.order.bill_no,req.query.userName,timestampToTime(timestamp),req.query.jiemu,req.query.vipmoney,timestampToTime(timestamp+date__),req.query.type_,req.query.type_,0,req.query.id,req.query.UserID,req.query.viptype];
                    console.log(1234342345)
                    //增
                    connection.query(addSql2,addSqlParams2,function (err, result) {
                            if(err){
                            console.log('[INSERT ERROR] - ',err.message);
                            return;
                            }        
                    
                            console.log('--------------------------INSERT----------------------------');
                            //console.log('INSERT ID:',result.insertId);        
                            console.log('INSERT ID:',result);        
                            console.log('-----------------------------------------------------------------\n\n');  
  
                             res.send(body)
                             connection.end();
                    });
                  }else{
                    res.send(body)
                  }
                  
                  
                 
         
                  }else{
                    console.log(req);
                  }
                  
                 
              })
              
     
});
// post请求需要
app.use(bodyParser.urlencoded({ extended: false }));  
app.get('/payBack', function (req, res) {
  
  var mainData;
  var connection = mysql.createConnection({     
    host     : config.host,       
    user     : config.user,              
    password : config.password,       
    port: config.port,                   
    database: "sino"  
  }); 
   console.log(req.query);
   console.log("哈哈哈哈")
  connection.connect();
  var  sql = 'SELECT * FROM order_list';
  var date_pay;
  var new_time
  var mainData;
  var order_;
  //查
  connection.query(sql,function (err, result) {
    mainData=result;
    
    
  // console.log(result)
   var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000;
    if(req.query.feeResult=="0"){
      console.log("支付")
      for(var i=0;i<mainData.length;i++){
        if(mainData[i].OrderNumber==req.query.bill_no && mainData[i].status!=1){
          // if(mainData[i].OrderNumber==req.query.bill_no){
          order_=mainData[i]
  
          var  sql2 = 'SELECT * FROM member_list where UserID = '+mainData[i].userid;
          console.log(sql2)
          // var  sql2 = 'SELECT * FROM member_list where UserID='+1;
          connection.query(sql2,function (err, result8) {
            console.log(sql2)
            date_pay=result8[0];
            console.log(order_);
          // console.log(order_);
          // console.log()
          var key='viptype_expirtime'+order_.vipid;
          now_time=Date.parse(new Date());
          now_time=now_time/ 1000;
          if(date_pay[key]){
            new_time = Date.parse(date_pay[key]);
            new_time=(new_time/1000)-now_time;
            if(new_time==null || !new_time || new_time<=0 || new_time==NaN){
              new_time=0;
            }
          }else{
            new_time=0;
          }
         console.log(new_time);
          
          
          var date__; 
          
               
          if(order_.viptime==1){
             date__=86400*365+new_time;
          }else if(order_.viptime==2){
             date__=86400*90+new_time;
          }else if(order_.viptime==3){
             date__=86400*30+new_time;
          }
          console.log("date:"+date__)
         var now_time2=Date.parse(new Date());
          now_time2=now_time2/ 1000;
  
  console.log(order_.viptime)
          var modSql = 'UPDATE order_list SET status = ? WHERE OrderNumber = ?';
          var modSqlParams = [1,order_.OrderNumber];
  
          connection.query(modSql,modSqlParams,function (err, result2) {
           
            console.log("订单修改");
  
            console.log(order_.vipid);
          
            var modSql3 = 'UPDATE member_list SET viptype'+order_.vipid+' = ?, viptype_expirtime'+order_.vipid+' = ?, VipType = ? WHERE UserID = ?';
            // console.log(modSql3)
            // console.log(order_.viptime)
            var modSqlParams3 = [order_.viptime,timestampToTime(date__+now_time2),1,parseInt(order_.userid)];
  
            connection.query(modSql3,modSqlParams3,function (err, result3) {
              console.log("会员修改");
              // 统计
              var  sql3 = 'SELECT * FROM home_statistics';
              //查
              connection.query(sql3,function (err, result4) {
                      if(err){
                      console.log('[SELECT ERROR] - ',err.message);
                      return;
                      }
                  var s_bc=result4;
  
                  s_bc=s_bc[s_bc.length-1];
                  console.log(s_bc)
                  var modSql2 = 'UPDATE home_statistics SET money = ?  WHERE id = ?';
                  var modSqlParams2 = [parseInt(req.query.bill_fee)*0.01+s_bc.money,parseInt(s_bc.id)];
                    // console.log(modSql)
  
                  connection.query(modSql2,modSqlParams2,function (err, result) {
                    if(err){
                    console.log('[UPDATE ERROR] - ',err.message);
                    return;
                    }        
  
                    console.log('--------------------------UPDATE----------------------------');     
                  
              });
            connection.end();
                res.json({
                  code: '成功',
              });
          })
        })
          
        });
      });
        
        }
      }
    }

  // var delSql = 'DELETE FROM '+req.query.table+' where UserID='+req.query.id;
  
  

//生成订单

  })

})


let multerUpload = upload.array('multerFile');
//多个文件上传
app.post('/upload/multer', (req,res)=>{
    multerUpload(req,res,(err)=>{
        if(!!err){
            res.json({
                code: '2000',
                type:'multer',
                fileList:[],
                msg: err.message
            });
        }
        let fileList = [];
        req.files.map((elem)=>{
            fileList.push({
                originalname: elem.originalname
            })
        });
        res.json({
            code: '0000',
            type:'multer',
            fileList:fileList,
            msg:''
        });
    });
});
/**
 * 获取本机IP
 * @return {[string]} [IP地址]
 */


var getIp = function(req) {
  var ip = req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress || '';
  if(ip.split(',').length>0){
      ip = ip.split(',')[0];
      ip=ip.replace('::ffff:', '')
  }
  return ip;
};

function getIPAdress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}



// 每天凌晨执行任务
var rule = new schedule.RecurrenceRule();
 
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
 
rule.hour = 0;
 
rule.minute = 01;
 
var j = schedule.scheduleJob(rule, function(){
//  代码捎候
　　console.log("执行任务");


var connection = mysql.createConnection({     
  host     : config.host,       
  user     : config.user,              
  password : config.password,       
  port: config.port, 
  // database: 'test'                 
  database: 'sino' 
}); 
connection.connect();

//   var  sql = 'SELECT * FROM Sino';
var  sql = 'SELECT * FROM member_list';
//查
connection.query(sql,function (err, result) {
        if(err){
        console.log('[SELECT ERROR] - ',err.message);
        return;
        }
    data=result;
    console.log('--------------------------SELECT----------------------------');
    console.log(result);
    console.log('------------------------------------------------------------\n\n');  
  //   data=JSON.stringify(data)
  // console.log(data[0].img)
    connection.end();
    console.log("关闭")



  for (let i = 0; i < data.length; i++) {
    let _that = data[i];
    _that['vipList'] = [];
    for (let key in _that) {
        
        if (key.indexOf('viptype_expirtime') >= 0 && _that[key]) {
            // arr_[i]=[];

            // vip类型
            let typeNum = key.replace('viptype_expirtime', '');

            // 组合然后push进vipList
            let _obj = {
                ['viptype']: parseInt(_that['viptype' + typeNum]),
                ['viptype_expirtime']: _that[key],
                ["num"]: parseInt(typeNum),
                ['UserID']:data[i].UserID
            }
            _that['vipList'].push(_obj)

        }
    }
    var more = _that['vipList'];
    console.log(more)
      for(var j=0;j<more.length;j++){
          var late_time = Date.parse(new Date());
          late_time = late_time / 1000;
          var vip_time = Date.parse(more[j].viptype_expirtime);
          vip_time = vip_time / 1000;
          // 计算vip过期时间
          js_time=vip_time-late_time;
         
         
          if(js_time<=0){
            js_time=null;

            // 如果时间过期执行代码修改数据库
            (function(j,js_time){
              var connection = mysql.createConnection({     
                host     : config.host,       
                user     : config.user,              
                password : config.password,       
                port: config.port, 
                // database: 'test'                 
                database: 'sino' 
              }); 
              connection.connect();


              var modSql = 'UPDATE member_list SET viptype_expirtime'+more[j].num+' = ?,viptype'+more[j].num+'= ? WHERE UserID = ?';
              console.log(modSql)
              var modSqlParams = [js_time,js_time,parseInt(more[j].UserID)];
              connection.query(modSql,modSqlParams,function (err, result) {
                if(err){
                        console.log('[UPDATE ERROR] - ',err.message);
                        return;
                }        
                console.log('--------------------------UPDATE----------------------------');
                console.log('UPDATE affectedRows',result.affectedRows);
                console.log('-----------------------------------------------------------------\n\n');
                connection.end();
                });

            })(j,js_time);  
          }else{
           
          }
          console.log(js_time)
    
      console.log("执行数据库");
      // 改

     
      
      // connection.end();

    }      
    }


  
     
    
})
 
});

// 随机生成订单
function randomString(len) {
  　　len = len || 32;
  　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz012345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  　　var maxPos = $chars.length;
  　　var pwd = '';
  　　for (i = 0; i < len; i++) {
  　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  　　}
  　　return pwd;
  }
// 去重
  function unique1(arr){
    var hash=[];
    for (var i = 0; i < arr.length; i++) {
       if(hash.indexOf(arr[i])==-1){
        hash.push(arr[i]);
       }
    }
    return hash;
  }

 
  var rule2 = new schedule.RecurrenceRule();
 
rule2.dayOfWeek = [0, new schedule.Range(1, 6)];
 
rule2.hour = 0;
 
rule2.minute = 0;
 


var ss = schedule.scheduleJob(rule2, function(){
//  代码捎候
// 　　console.log("执行任务");
// 0:01添加当天的数据
var connection = mysql.createConnection({     
  host     : config.host,       
  user     : config.user,              
  password : config.password,       
  port: config.port, 
  // database: 'test'                 
  database: 'sino' 
}); 
connection.connect();

var timestamp2 = Date.parse(new Date());
timestamp2 = timestamp2 / 1000;
var  addSql2 = 'INSERT INTO home_statistics (s_date,money,usr_number) VALUES(?,?,?)';

var  addSqlParams2 = [timestampToTime(timestamp2),0,0];

connection.query(addSql2,addSqlParams2,function (err, result) {
  if(err){
          console.log('[UPDATE ERROR] - ',err.message);
          return;
  }        
  console.log('--------------------------UPDATE----------------------------');
  console.log('UPDATE affectedRows',result.affectedRows);
  console.log('-----------------------------------------------------------------\n\n');
  connection.end();
  });


})