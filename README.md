# Mining rbnb in Ubuntu 20.04

On your Ubuntu 20.04 server, you must install the necessary dependencies before you start mining rbnb automatically.

## Initial installation on server

Once done, install 2 packages:
- Node.js: [https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04).

```bash
sudo apt update
sudo apt install nodejs
node -v
```

If output v10.19.0
Install update node js 

```text
sudo apt install npm
cd ~
curl -sL https://deb.nodesource.com/setup_16.x -o /tmp/nodesource_setup.sh
nano /tmp/nodesource_setup.sh
sudo bash /tmp/nodesource_setup.sh
sudo apt install nodejs
node -v

# Output v16.19.0
```

- Git:[https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-20-04).

```bash
git --version
# If output git version 2.x.x finish

```

## Download code and install dependency

Then clone the repo :  

```bash
# code in boton green or here
git clone https://github.com/ele-crypto/rbnb-mine.git
```

And install dependencies :

```bash
# Go to cloned folder path
cd rbnb-mine

# code in boton green or here
npm install
```

## Generate new wallets for mining

This will create a csv with lots of wallets for you.
This way, you have burner wallets so no risk !
Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

```bash
# To generate lots of wallets use the command line
npm run gen-wallet
```

## Deploy code 
To start the process, execute the following command, the mining process is maintained while you keep the terminal and/or ssh window open.

```bash
# To start the process
npm run start
```

## Deploy code with PM2 (keep)
To start the process, run the following command, the mining process, despite closing the current windows, creates a cluster on the server and manages the processes, it is only stopped when the server is stopped or restarted.

```bash
# To start the process
npm run pm2-start
```

Note: For pm2 it was configured to run on 4 CPUs, if your vps or server has less capacity configure the ecosystem.config.js file in the instance parameter. And then rerun the process or change it before starting the process. [Documentation PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) 

```bash
[By ele] 🚀
```
