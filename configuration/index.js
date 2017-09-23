'use strict'

const config = {
    rabbitMQ        : {
        host     : '127.0.0.1',
        port     :  5672,
        username : '',
        password : ''
    },
    aws         : {
        aws_access_key : "",
        aws_secret_key : "",
        s3             : {
            bucket         : "",
            ssl_enabled    :  false, // disable ssl when uploading in aws,
            asset_dir      : 'asset',
            sse            : 'AES256',
            storage_class  : 'STANDARD_IA',
            acl            : "private-read",
            region         : "ap-southeast-1"
        },
        aws_ssl_enabled    : false,
    }
}

module.exports = config;