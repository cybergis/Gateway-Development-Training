#!/bin/bash

# Install NVM.
curl -o- -s https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

# Install Node with NVM.
NODE_VERSION="4.5.0"
nvm install "${NODE_VERSION}"
nvm alias default "${NODE_VERSION}"
nvm use default

# List node version after installing.
printf 'Node: %s\n' $(node --version)

# Install Meteor.
curl https://install.meteor.com/ | sh
# Add to Path if needed.
( which meteor ) || {
  METEOR_PATH="$HOME/.meteor"
  # Add to Path if not already.
  (echo $PATH | grep "$METEOR_PATH") || {
    export PATH="$PATH:$METEOR_PATH"
    echo "export PATH=\"\$PATH:$METEOR_PATH\"" >> "$HOME/.bashrc"
  }
}
