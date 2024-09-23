- Npm i
- npm i -g pm2
- pm2 start api-rosarial.json

entrar no sites avalibles cria um host nginx /etc/nginx/sites-available
depois>
ln -s /etc/nginx/sites-available/apirosarial /etc/nginx/sites-enabled/

> criar um apontanmento cloudflare
> sudo certbot --nginx --email contato@rdsinfor.com
