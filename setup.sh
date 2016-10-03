#!/bin/bash

reload_profile () {
	# Try all popular profile locations.
	. ~/.bash_profile >/dev/null 2>&1
	. ~/.zshrc >/dev/null 2>&1
	. ~/.profile >/dev/null 2>&1
	. ~/.bashrc >/dev/null 2>&1
	# Consume any potential error.
	echo $? >/dev/null
}

append_profile () {
  local DETECTED_PROFILE
  if [ -f "$HOME/.profile" ]; then
    DETECTED_PROFILE="$HOME/.profile"
  elif [ -f "$HOME/.bashrc" ]; then
    DETECTED_PROFILE="$HOME/.bashrc"
  elif [ -f "$HOME/.bash_profile" ]; then
    DETECTED_PROFILE="$HOME/.bash_profile"
  elif [ -f "$HOME/.zshrc" ]; then
    DETECTED_PROFILE="$HOME/.zshrc"
  fi
  
  if [ ! -z "$DETECTED_PROFILE" ]; then
    echo "$1" >> "$DETECTED_PROFILE"
  else
    printf 'Could not find existing profile.'
    exit 1
  fi
}

# Install NVM.
curl -o- -s https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
# Reload bash profile.
reload_profile

# Install Node with NVM.
NODE_VERSION="4.5.0"
(nvm install "${NODE_TEST_VERSION}" && nvm alias default "${NODE_TEST_VERSION}" && nvm use default) >/dev/null 2>&1
# List node version after installing.
node --version
# Print PATH after installing node.
echo $PATH
# List home files after installing node.
ls -al "$HOME"

# Install Meteor.
curl https://install.meteor.com/ | sh
# Add to Path if needed.
( which meteor ) || (
  METEOR_PATH="${HOME}/.meteor"
  # Add to Path if not already.
  (echo $PATH | grep "$METEOR_PATH") || append_profile "$METEOR_PATH"
)
