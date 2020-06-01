const fs = require('fs')

const {NODE_ENV} = process.env

switch(NODE_ENV) {
    case "production":
    case "development":
        require('./app');
        break;
    default:
        console.log('NODE_ENV is required but was not specified.');
}