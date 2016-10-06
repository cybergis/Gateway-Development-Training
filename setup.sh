#!/bin/bash

# Add your code here.

#https://github.com/creationix/nvm
#To install or update nvm, you can use the install script using cURL:
#The script clones the nvm repository to ~/.nvm and adds the source line to your profile (~/.bash_profile, ~/.zshrc, ~/.profile, or ~/.bashrc).
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash

#You can customize the install source, directory, profile, and version using the NVM_SOURCE, NVM_DIR, PROFILE, and NODE_VERSION variables. Eg: curl ... | NVM_DIR=/usr/local/nvm bash for a global install.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

#in case...
#If the above doesn't fix the problem, open your .bash_profile and add the following line of code:
source ~/.bashrc

# Install and use Nodejs
nvm install node
nvm use node
nvm alias default node

#https://www.meteor.com/install
#Download and install meteor
curl https://install.meteor.com/ | sh


