
cd ~/nycueelab/frontend
npm run build

rm -r /usr/share/nginx/html/nycueelab/*
cp -r ~/nycueelab/frontend/dist/* /usr/share/nginx/html/nycueelab/
