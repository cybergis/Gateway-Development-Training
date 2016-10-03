#!/bin/bash
curl https://install.meteor.com/ | bash

export PATH="$HOME/.meteor/meteor:$PATH"

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . $NVM_DIR/nvm.sh

nvm install node
nvm alias default node
