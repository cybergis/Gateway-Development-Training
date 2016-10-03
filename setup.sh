#!/bin/bash

# Add your code here.
if [ -f meteor_setup.sh ]
then
  sh meteor_setup.sh
else
  curl https://install.meteor.com/ | sh
fi

export PATH=$PATH:$HOME/.meteor

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
export NVM_DIR=$HOME/.nvm
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm install node
nvm use node

