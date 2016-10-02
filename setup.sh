#!/bin/bash

# Add your code here.
curl https://install.meteor.com/ | bash

# add meteor bin to path
export PATH=$HOME/.meteor/meteor:$PATH
echo "export PATH=\$HOME/.meteor/meteor:\$PATH" >> $HOME/.bashrc

# install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
export NVM_DIR=$HOME/.nvm
[ -s "$NVM_DIR/nvm.sh" ] && . $NVM_DIR/nvm.sh
echo "export NVM_DIR=$HOME/.nvm" >> $HOME/.bashrc
echo "[ -s $NVM_DIR/nvm.sh ] && . $NVM_DIR/nvm.sh"  >> $HOME/.bashrc

# install nodejs
nvm install node


