echo "beginning rsync"
rsync -r --exclude 'deploy.sh' --exclude '.git' --exclude 'node_modules' --exclude 'my.conf.js' --exclude 'npm-debug.log' /home/thor/Code/nothingsoundsquitelikean/* tidepool@tide-pool.ca:/home/tidepool/www/nothingsoundsquitelikean
echo "rsync complete!"