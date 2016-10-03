#!/bin/bash

# Add your code here.
curl https://install.meteor.com/ | sh
export PATH=$PATH:$HOME/.meteor
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
export NVM_DIR=$HOME/.nvm
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install node
nvm alias default node



#meteor create helloworld --release 1.4.1
#meteor create legacyapp --release 1.3.5
