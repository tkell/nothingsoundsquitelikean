echo "beginning rsync"
rsync -r --exclude 'deploy.sh' '.git' 'node_modules' 'my.conf.js' 'npm-debug.log' /home/thor/Code/nothingsoundsquitelikean/* tidepool@tide-pool.ca:/home/tidepool/www/nothingsoundsquitelikean
echo "rsync complete!"