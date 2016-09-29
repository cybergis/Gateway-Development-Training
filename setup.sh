#!/bin/bash

# Add your code here.
sh meteor_setup.sh
export PATH=$PATH:$HOME/.meteor
meteor create helloworld --release 1.4.1
meteor create legacyapp --release 1.3.5

