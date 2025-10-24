
cd ~/nycu-eelab/frontend
npm run build

rm -r /usr/share/nginx/html/nycueelab/*
cp -r ~/nycu-eelab/frontend/dist/* /usr/share/nginx/html/nycueelab/
