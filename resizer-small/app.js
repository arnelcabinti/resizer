'use strict'

const amqp  = require('amqplib/callback_api'),
      AWS   = require('aws-sdk'),
      sharp = require('sharp');
    

// custom imports 
const appConfig = require('../configuration'),
      rConfig   = appConfig.rabbitMQ;

AWS.config.update({
    accessKeyId     : appConfig.aws.aws_access_key, 
    secretAccessKey : appConfig.aws.aws_secret_key,
    sslEnabled      : appConfig.aws.aws_ssl_enabled,
    region          : appConfig.aws.s3.region
});

const s3 = new AWS.S3();


function uploadToS3(base64data){
    s3.upload({
        Bucket : appConfig.aws.s3.bucket, 
        Key: 'asset/small/smallgolang.png',
        Body: base64data,
    },function (err,data) {
        if(err){
            console.log(err)
            return
        }
        console.log(data);
    });
}

amqp.connect(`amqp://${rConfig.username}:${rConfig.password}@${rConfig.host}:${rConfig.port}`, function(err, conn) {
    conn.createChannel(function(err, ch) {
        let q = 'task_queue';
        ch.assertQueue(q, {durable: true});
        ch.prefetch(1);
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function(msg) {
            let secs = msg.content.toString().split('.').length - 1,
                getParams = {
                   Bucket : appConfig.aws.s3.bucket, 
                   Key    : "asset/golang.png"
                }
           
            s3.getObject(getParams, function(err, data) {
                // Handle any error and exit
                if (err){
                    console.log(err.message);
                    return
                }
                console.log(data);
                sharp(data.Body)
                    .resize(320, 240)
                    .toBuffer()
                    .then(function(resBuff){
                        uploadToS3(resBuff);
                    })
                    .catch(function(err){
                        console.log('Sharp err', err);
                    });
                console.log(" [x] Received %s", "dasdasdasdsa");
                ch.ack(msg);
            });
        
        }, {noAck: false});
      });
});

