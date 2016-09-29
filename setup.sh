curl https://install.meteor.com/ | sed 's/\/usr\/local/$HOME/g' | sh
meteor create helloworld --release 1.4.1
meteor create legacyapp --release 1.3.5
