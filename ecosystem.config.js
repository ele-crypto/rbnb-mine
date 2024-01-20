module.exports = {
  apps: [
    {
      name: 'rbnb-mine',
      script: './index.js',
      instances: 2,
      args: [
        '0 10', 
        '10 20'
      ],
      exec_mode: 'cluster'
    },
  ],
}
