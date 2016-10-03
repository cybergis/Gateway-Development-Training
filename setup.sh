#!/bin/bash

# Add your code here.
sh meteor_setup.sh
export PATH=$PATH:$HOME/.meteor

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
export NVM_DIR=$HOME/.nvm
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm install node
nvm use node

