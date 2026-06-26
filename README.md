# Learning Locker + xAPI Service

This repository bundles two services:

- **`learning-locker/`** — the Learning Locker LRS (UI, API, Worker, Scheduler)
- **`xapi-service/`** — the xAPI statement endpoint (the LRS ingest API)

The recommended way to run everything is with **Docker Compose**, which also
provisions the required **MongoDB** and **Redis**. A manual (non-Docker) install
is documented at the end for reference.

---

## Run with Docker (recommended)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker
  Engine + Compose v2). Allocate at least **4 GB** of memory to Docker for the
  first build.

That's it — Node, MongoDB and Redis all run inside containers, so you do **not**
need them installed on your host.

### Start everything

From the repository root:

```bash
docker compose up -d --build
```

The first run builds both images (Learning Locker is an older Node 10 stack, so
the initial build takes several minutes) and then starts the full stack. On
first boot the Learning Locker container automatically:

1. waits for MongoDB to be reachable,
2. runs the database migrations, and
3. seeds a site admin (see [Default credentials](#default-credentials)).

Check status and logs:

```bash
docker compose ps
docker compose logs -f learning-locker
```

### Services and ports

| Service                | URL / Address                       | Notes                                   |
| ---------------------- | ----------------------------------- | --------------------------------------- |
| Learning Locker **UI** | http://localhost:3000               | Web interface                           |
| Learning Locker **API**| http://localhost:8080               | Internal API (proxied by the UI)        |
| **xAPI** service       | http://localhost:8081               | LRS endpoint, e.g. `/data/xAPI/about`   |
| **MongoDB**            | `mongodb://localhost:27018`         | Published on **27018** (not the default 27017) |
| **Redis**              | internal only                       | Used for queues / caching               |

> Inside the Docker network the apps reach Mongo on `mongo:27017`; only the
> host-published port is remapped to **27018**.

### Default credentials

The bootstrap site admin is seeded on first boot:

| Field        | Value                          |
| ------------ | ------------------------------ |
| Email        | `learninglocker@uni-due.de`    |
| Password     | `password123`                  |
| Organisation | `UDE`                          |

These are defined in [`docker-compose.yml`](docker-compose.yml) under the
`learning-locker` service (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASS` /
`SEED_ADMIN_ORG`). Change them there **before the first `up`**, or reset the
data (see below) to re-seed.

> ⚠️ `password123` and the placeholder `APP_SECRET` in
> [`learning-locker/.env`](learning-locker/.env) are fine for local development
> only. Change both before exposing this anywhere.

### Connect the xAPI service

After logging in to the UI:

1. Select the **`UDE`** organisation.
2. Open **Settings → Stores** and add a new store (the defaults are fine).
3. Open the **Clients** tab → **New xAPI store client**.
4. Use that client's **Basic Auth** credentials to send xAPI statements to the
   xAPI service at `http://localhost:8081`.

### Common commands

```bash
docker compose up -d              # start (after images are built)
docker compose up -d --build      # rebuild images and start
docker compose ps                 # container status
docker compose logs -f <service>  # follow logs (learning-locker | xapi-service | mongo | redis)
docker compose restart            # restart containers (keeps data)
docker compose down               # stop and remove containers (KEEPS data volumes)
docker compose down -v            # stop and DELETE all data volumes (resets the DB + re-seeds admin)
```

### Resetting the database / admin

Data is stored in named Docker volumes, so it survives `down`/`up`. To wipe
everything (Mongo data, Redis, uploaded files, and the one-time admin seed
marker) and start fresh:

```bash
docker compose down -v
docker compose up -d
```

### Note on removed cloud dependencies

Learning Locker 2.x pulled in a native `grpc` addon (via Google Cloud Pub/Sub
and `pkgcloud`) whose prebuilt binaries are no longer hosted and which no longer
compiles on a modern toolchain. Because this setup uses **Redis** for queues and
**local** file storage, those unused Google Cloud / pkgcloud dependencies were
removed and their provider modules stubbed. The disabled providers
(`QUEUE_PROVIDER=PUBSUB`, `FS_REPO=google|amazon|rackspace`) throw a clear error
if selected; `local`/`azure` storage and `REDIS` queues are unaffected.

---

## Manual install (without Docker)

<details>
<summary>Windows / native setup (legacy reference)</summary>

Please follow the steps below to install a Learning Locker instance natively.
You will need **MongoDB** and **Redis** running and reachable, and Node managed
via NVM.

- Install [Node 10 using NVM](https://github.com/coreybutler/nvm-windows),
  [MongoDB](https://www.mongodb.com/try/download/community), and
  [Redis for Windows](https://github.com/tporadowski/redis/releases)

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

- Install [Visual Studio Community 2017](https://aka.ms/vs/15/release/vs_community.exe). Make sure to install the package `Desktop development with C++`

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

- Go to `learning-locker` folder

  - Make a copy of `example.env` file and rename it to `.env` (point `MONGODB_PATH` / `REDIS_URL` at your local services)

  - Install the yarn packages

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

  - Create a site admin

    ```
    node cli/dist/server createSiteAdmin learninglocker@uni-due.de UDE password123
    ```

- Go to `xapi-service` folder

  - Make a copy of `example.env` file and rename it to `.env`

  - Install the yarn packages

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

### Accessing the learning locker server

- Go to `http://localhost:3000` to access the learning locker server
- Login using the admin credentials created in the previous step
- Select the organization `UDE`. Click on settings and select `Stores` tab. Add a new store and leave the default values
- Click on the `Clients` tab and open the `New xAPI store client` panel. Use the Basic Auth credentials to access the xapi service (required to communicate with the xapi service from any other application)

### PM2 commands

- Check the status

  ```
  pm2 status
  ```

- Restart pm2

  ```
  pm2 restart all
  ```

- Stop the PM2 server

  ```
  pm2 kill
  ```

</details>
