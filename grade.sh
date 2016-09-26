#!/bin/bash

printf 'test-----------------------------------\n'

# Grading code will be added later.

CURL_VERSION=$(curl --version 2>&1)
CURL_VERSION_RC=$? # 0 when success, other values when error.

printf 'curl>>%s\n' $CURL_VERSION

NODE_VERSION=$(node --version 2>&1)
NODE_VERSION_RC=$? # 0 when success, other values when error.

printf 'node>>%s\n' $NODE_VERSION

NVM_VERSION=$(nvm --version 2>&1)
NVM_VERSION_RC=$? # 0 when success, other values when error.

printf 'nvm>>%s\n' $NVM_VERSION

exit 1
