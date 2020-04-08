'use strict'

const http      = require('http'),
      amqp      = require('amqplib/callback_api'),
      appConfig = require('../configuration');


var connect = function(callback){
    let rConfig = appConfig.rabbitMQ;
    amqp.connect(`amqp://${rConfig.username}:${rConfig.password}@${rConfig.host}:${rConfig.port}`, function(err, conn) {
        if (err) {
            console.error("[AMQP]", err.message);
            setTimeout(connect, 1000);
        }
        conn.on("error", function(err) {
            if (err.message !== "Connection closing") {
                console.error("[AMQP] conn error", err.message);
            }
        });
        console.log("[AMQP] connected");
        callback(conn);
    });
}

connect(function(conn){
    conn.createChannel(function(err,ch){
        if(err){
            console.log('[Rabbitmq]', err);
            return;
        }
        let q = 'task_queue';
        let msg = process.argv.slice(2).join(' ') || "Hello World!";
    
        ch.assertQueue(q, {durable: true});
        ch.sendToQueue(q, new Buffer(msg), {persistent: true});
        console.log(" [x] Sent '%s'", msg);
    });
    setTimeout(function() { conn.close(); process.exit(0) }, 500);
});
