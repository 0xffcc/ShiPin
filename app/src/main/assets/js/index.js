var AWS = require('aws-sdk');

var s3  = new AWS.S3({
          accessKeyId: 'AUXNO25EN3ZVTU2XSX1L' ,
          secretAccessKey: 'bzB+Jh3YbIskqSCc0VGIkwYFe3G6hiKkdOCGUq2N' ,
          endpoint: 'http://185.82.216.254' ,
          s3ForcePathStyle: true,
          signatureVersion: 'v4'
});

// putObject操作

var params = {Bucket: 'testbucket', Key: 'testobject', Body: 'Hello from MinIO!!'};

s3.putObject(params, function(err, data) {
      if (err)
       console.log(err)
      else   
       console.log("Successfully uploaded data to testbucket/testobject");
});

// getObject操作

var params = {Bucket: 'testbucket', Key: 'testobject'};

var file = require('fs').createWriteStream('/tmp/mykey');

s3.getObject(params).
on('httpData', function(chunk) { file.write(chunk); }).
on('httpDone', function() { file.end(); }).
send();