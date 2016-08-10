#! /bin/bash
#gulp
sudo rm -r $GOPATH/src/github.com/icsnju/apt-mesos/static
cp -r ./dist $GOPATH/src/github.com/icsnju/apt-mesos
mv $GOPATH/src/github.com/icsnju/apt-mesos/dist $GOPATH/src/github.com/icsnju/apt-mesos/static
