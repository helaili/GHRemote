ssh -tt -i $1 ec2-user@$2 << 'EOF'


echo '#!/bin/sh' | sudo tee /etc/init.d/disable-transparent-hugepages
echo '### BEGIN INIT INFO' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '# Provides:          disable-transparent-hugepages' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '# Required-Start:    $local_fs' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '# Required-Stop:' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '# X-Start-Before:    mongod mongodb-mms-automation-agent' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '# Default-Start:     2 3 4 5' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '# Default-Stop:      0 1 6' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '# Short-Description: Disable Linux transparent huge pages' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '# Description:       Disable Linux transparent huge pages, to improve' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '#                    database performance.' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '### END INIT INFO' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo ' ' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo 'case $1 in' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '  start)' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '    if [ -d /sys/kernel/mm/transparent_hugepage ]; then ' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '      thp_path=/sys/kernel/mm/transparent_hugepage' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '    elif [ -d /sys/kernel/mm/redhat_transparent_hugepage ]; then' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '      thp_path=/sys/kernel/mm/redhat_transparent_hugepage' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '    else' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '      return 0' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '    fi' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo ' ' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '    echo "never" > ${thp_path}/enabled' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '    echo "never" > ${thp_path}/defrag' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo ' ' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '    unset thp_path' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo '    ;;' | sudo tee -a /etc/init.d/disable-transparent-hugepages
echo 'esac' | sudo tee -a /etc/init.d/disable-transparent-hugepages

sudo chmod 755 /etc/init.d/disable-transparent-hugepages

sudo chkconfig --add disable-transparent-hugepages

echo '[mongodb-org-3.0]' | sudo tee /etc/yum.repos.d/mongodb-org-3.0.repo
echo 'name=MongoDB Repository' | sudo tee -a /etc/yum.repos.d/mongodb-org-3.0.repo
echo 'baseurl=https://repo.mongodb.org/yum/amazon/2013.03/mongodb-org/3.0/x86_64/' | sudo tee -a /etc/yum.repos.d/mongodb-org-3.0.repo
echo 'gpgcheck=0' | sudo tee -a /etc/yum.repos.d/mongodb-org-3.0.repo
echo 'enabled=1' | sudo tee -a /etc/yum.repos.d/mongodb-org-3.0.repo

sudo yum -y update

sudo yum install -y mongodb-org

sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8080

sudo yum install -y nodejs npm --enablerepo=epel

sudo yum install -y git

sudo npm install -g bower

sudo npm install -g grunt-cli

sudo gem install sass

sudo mkdir /var/log/ghremote

sudo chown ec2-user:ec2-user /var/log/ghremote

git clone https://github.com/helaili/GHRemote.git

cd GHRemote

npm install

EOF
