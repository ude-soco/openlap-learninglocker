## Get started with Learning Locker in Windows

Please follow the steps below to install a Learning Locker instance in Windows.

- Install [Node 8.9.0 using NVM](https://github.com/coreybutler/nvm-windows), [MongoDB](https://www.mongodb.com/try/download/community), and [Redis for Windows](https://github.com/tporadowski/redis/releases)

- Install yarn and PM2. PM2 is a tool to manage the node process. Install PM2 and pm2-logrotate module

  ```
  npm install -g yarn pm2@4.3.0 node-gyp
  ```

  ```
  pm2 install pm2-logrotate
  ```

  ```
  pm2 set pm2-logrotate:compress true
  ```

- Install [Visual Studio Community 2017](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=Community&rel=15). Make sure to install the package `Desktop development with C++`

- Set `VCINSTALLER` system variable to `C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\VC`. [Read more](https://stackoverflow.com/questions/57541402/node-gyp-configure-got-gyp-err-find-vs/70799513#70799513)

- Open PowerShell in admin mode and type the following commands

  ```
  npm --vs2015 install --global windows-build-tools
  ```

  ```
  npm config set msvs_version 2017 --global
  ```

  ```
  npm config set msbuild_path "C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\MSBuild\15.0\Bin\MSBuild.exe"
  ```

- Go to `learning-locker` folder and install the requirements

  ```
  yarn install --ignore-engines
  ```

- Build all the services in learning locker

  ```
  yarn build-all
  ```

- Run the required migrations

  ```
  yarn migrate
  ```

- Go to `xapi-service` folder and install the requirements

  ```
  yarn install --ignore-engines
  ```

- Build all the services in xapi service
  ```
  yarn build
  ```

### Running the server

- Go to `learning-locker` folder and run the following command

  ```
  pm2 start pm2/all.json
  ```

- Go to `xapi-service` folder and run the following command

  ```
  pm2 start pm2/xapi.json
  ```

- Go to `learning-locker` folder and create an site admin
  ```
  node cli/dist/server createSiteAdmin admin@mail.com soco 1234qweR
  ```

### PM2 commands

- Check the status

  ```
  pm2 status
  ```

- Restart pm2

  ```
  pm2 restart
  ```

- Stop the PM2 server
  ```
  pm2 kill all
  ```
