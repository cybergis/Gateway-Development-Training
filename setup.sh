#!/bin/bash

## Install NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
## Load NVM settings

source ~/.bashrc 

nvm install node latest
nvm use latest

## Install Meteor
## NOTE: This prompts for password which could make autonomous build fail?
curl https://install.meteor.com/ | sh
## In case we need to include local bin
export PATH="${PATH}:/usr/local/bin"

source ~/.bashrc

## Create Hello world app using release 1.4.1
#meteor create helloworld --release 1.4.1

## Create legacy app using release 1.3.5
#meteor create legacyapp --release 1.3.5



