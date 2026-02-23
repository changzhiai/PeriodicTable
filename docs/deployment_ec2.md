# Deploying Periodic Table to AWS EC2 (Git + PM2 + Nginx)

This guide assumes you have an AWS EC2 instance running (Ubuntu is recommended) and you have SSH access to it.

## Prerequisites
-   An EC2 instance launched and running.
-   SSH Key (`.pem` file) to access the instance.
-   **Node.js & npm** installed on the server.
-   **PM2** installed globally (`npm install pm2 -g`).
-   The domain `periodictable.travel-tracker.org` pointing to your EC2 instance's Public IP.

---

## Step 1: Get Code & Build (Run on EC2)
1.  **SSH into your server:**
    ```bash
    ssh -i /path/to/your-key.pem ubuntu@your-ec2-ip
    ```

2.  **Install Node.js (if not installed):**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

3.  **Clone the Repository:**
    ```bash
    cd ~
    git clone https://github.com/changzhiai/PeriodicTable.git
    cd PeriodicTable
    ```

4.  **Install Dependencies & Build:**
    ```bash
    npm install
    npm run build
    ```

---

## Step 2: Start Application with PM2
Since this is a Vite app, we can run the preview server or serve the build.

1.  **Start PM2:**
    Using the `ecosystem.config.cjs` included in the repo:
    ```bash
    pm2 start ecosystem.config.cjs
    ```
    *(Or manually: `pm2 start npm --name "periodic-table" -- run preview`)*

2.  **Save PM2 List:**
    Ensure it restarts on reboot:
    ```bash
    pm2 save
    pm2 startup
    ```

---

## Step 3: Configure Nginx as Reverse Proxy
Instead of serving files directly, Nginx will forward requests to the running app (default port 4173 for `vite preview`, or 3004 if configured).

1.  **Edit Nginx Config:**
    ```bash
    sudo nano /etc/nginx/sites-available/periodictable
    ```

2.  **Paste Configuration:**
    ```nginx
    server {
        listen 80;
        server_name periodictable.travel-tracker.org;

        location / {
            proxy_pass http://localhost:3004; # Port defined in ecosystem.config.cjs
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            
            # Support for Clean URLs and SPA routing
            # 1. Try the exact URI
            # 2. Try adding .html (e.g. /privacy -> /privacy.html)
            # 3. Try it as a directory
            # 4. Fallback to index.html for React routing
            try_files $uri $uri.html $uri/ /index.html;
        }
    }
    ```

3.  **Enable Site & Restart Nginx:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/periodictable /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

## Step 4: Setup SSL (Certbot)
```bash
sudo certbot --nginx -d periodictable.travel-tracker.org
```

---

## Updating the App
```bash
cd ~/periodic-table
git pull
npm install
npm run build
pm2 restart periodic-table
```

---

## Troubleshooting: Build Fails due to Memory (Killed)

If `npm run build` fails with "Killed" or causes the server to crash, it is likely running out of memory.

### 1. Enable Swap Space (Recommended)
This uses your disk as temporary memory to prevent crashes.

```bash
# Create a 1GB swap file
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Limit Node Memory Usage
If swap isn't enough, constrain Node.js memory usage so it triggers garbage collection more frequently instead of crashing.

```bash
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build
```
