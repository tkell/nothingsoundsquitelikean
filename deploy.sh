echo "beginning rsync"
rsync -r --exclude 'deploy.sh' --exclude '.git' /home/thor/Code/nothingsoundsquitelikean/* tidepool@tide-pool.ca:/home/tidepool/www/nothingsoundsquitelikean
echo "rsync complete!"