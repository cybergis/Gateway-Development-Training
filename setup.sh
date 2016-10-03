#!/bin/bash

# Add your code here.

# Download and install NVM
curl https://raw.githubusercontent.com/creationix/nvm/v0.25.0/install.sh | bash

source ~/.profile

# Install and use Nodejs
nvm install node
nvm use node
nvm alias default node

# Download and install meteor
curl https://install.meteor.com/ | sh


