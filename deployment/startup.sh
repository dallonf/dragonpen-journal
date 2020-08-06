# must be run as root
cd $(dirname $0)
mkdir -p /var/log/dallonf
sudo -u ec2-user docker-compose -f ./docker-compose.yaml logs -f > /var/log/dallonf/journal.log &
sudo -u ec2-user sh ./run.sh