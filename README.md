## Deploy to your VPS
```
git clone https://github.com/zilton7/html-to-prosemirror.git
npm install

npm install -g pm2
pm2 start server.js --name html-to-prosemirror
pm2 save
pm2 startup

// ngnix
server {
    server_name html-to-prosemirror.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

// reload ngnix
sudo systemctl reload nginx
```
