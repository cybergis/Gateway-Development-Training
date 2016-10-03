#!/bin/bash

# Add your code here.
touch ~/.bash_profile
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
echo "export NVM_DIR=$HOME/.nvm" >> ~/.bashrc
echo "[ -s $NVM_DIR/nvm.sh ] && . $NVM_DIR/nvm.sh" >> ~/.bashrc
source ~/.bashrc
source "$NVM_DIR/nvm.sh"
nvm install 0.10.13
nvm use 0.10.13
curl https://install.meteor.com/ | sh

