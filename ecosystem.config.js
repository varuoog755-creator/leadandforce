module.exports = {
    apps: [{
        name: 'backend-api',
        script: './backend/server.js',
        instances: 2,
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production'
        }
    }]
}
