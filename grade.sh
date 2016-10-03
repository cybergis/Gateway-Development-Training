#!/bin/bash

strip_version_prefix () {
	echo "$1" | sed -e "s/^$2//"
}

# Check prerequisites.
CURL_VERSION=$(curl --version 2>&1)
CURL_VERSION_RC=$? # 0 when success, other values when error.
if [[ $CURL_VERSION_RC != 0 ]]; then
	printf 'Unable to detect curl. Unable to proceed.\n'
	exit 1
fi

# This function relies on node and npm/compare-versions.
compare_version () {
	printf 'console.log(require("compare-versions")("%s", "%s"))' "$1" "$2" | node
}

# Verify node version. 4.4.7 for Meteor 1.4.x.
(
	NODE_VERSION=$(node --version 2>&1) # returns 'v#.#.#'.
	NODE_VERSION_RC=$? # 0 when success, other values when error.
	if [[ $NODE_VERSION_RC != 0 ]]; then
		printf 'Unable to detect Node.\n'
		exit 1
	fi
	# Strip the preceding 'v'.
	NODE_VERSION=$(strip_version_prefix "$NODE_VERSION" 'v')

	# Install the package needed by compare_version.
	npm install compare-versions >/dev/null 2>&1

	# Verify node version.
	MINIMUM_NODE_VERSION="4.4.7"
	if [[ $(compare_version "${NODE_VERSION}" "${MINIMUM_NODE_VERSION}") == -1 ]]; then
		printf 'Minimum node version "%s" not met. Detected version "%s".\n' "$MINIMUM_NODE_VERSION" "$NODE_VERSION"
		exit 1
	fi
) || exit $?

# Install node for the test.
# Use nvm to install node.
NVM_VERSION=$(nvm --version 2>&1) # returns `#.#.#`.
NVM_VERSION_RC=$? # 0 when success, other values when error.
if [[ $NVM_VERSION_RC != 0 ]]; then
	# Install NVM.
	curl -o- -s https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash >/dev/null
	export NVM_DIR="$HOME/.nvm"
	[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
fi
NODE_TEST_VERSION="4.5.0"
(nvm install "${NODE_TEST_VERSION}" && nvm alias default "${NODE_TEST_VERSION}" && nvm use default) >/dev/null 2>&1
# Install the package again just to make sure it's available.
npm install compare-versions >/dev/null 2>&1

# Verify meteor CLI installation.
(
	METEOR_VERSION=$(meteor --version 2>&1) # returns 'Meteor #.#.#'.
	METEOR_VERSION_RC=$? # 0 when success, other values when error.
	if [[ $METEOR_VERSION_RC != 0 ]]; then
		printf 'Unable to detect Meteor CLI tool.\n'
		exit 1
	fi
) || exit $?

# Verify that app folders exist.
APP_NAMES=( "helloworld" "legacyapp" )
APP_RELEASES=( "1.4.1" "1.3.5" )
APP_EXCLUDE_PKGS=( "" "autopublish" )

for i in "${!APP_NAMES[@]}"
do
	NAME="${APP_NAMES[$i]}"
	EXPECT_RELEASE="${APP_RELEASES[$i]}"
	EXCLUDE_PKG="${APP_EXCLUDE_PKGS[$i]}"
	
	# Verify app exists.
	if [ ! -d "$NAME" ]; then
		printf 'Unable to find app folder "%s".\n' "$NAME"
		exit 1
	fi
	
	(
		cd "$NAME"
		# Use `meteor list` to test if the folder is a Meteor app.
		METEOR_LIST=$(meteor list 2>&1)
		METEOR_LIST_RC=$? # 0 when success, other values when error.
		if [[ $METEOR_LIST_RC != 0 ]]; then
			printf 'App folder "%s" does not contain a valid Meteor app.\n' "$NAME"
			exit 1
		fi
		
		# Verify release.
		METEOR_RELEASE=$(meteor --version 2>&1) # returns 'Meteor #.#.#\r'.
		# Strip the trailing line break.
		METEOR_RELEASE=$(echo $METEOR_RELEASE | tr -d '\r')
		# Strip the preceding 'Meteor '.
		METEOR_RELEASE=$(strip_version_prefix "$METEOR_RELEASE" 'Meteor ')
		if [[ $METEOR_RELEASE != $EXPECT_RELEASE ]]; then
			printf 'App folder "%s" is using Meteor release "%s". Expecting "%s".' "$NAME" "$METEOR_RELEASE" "$EXPECT_RELEASE"
			exit 1
		fi
		
		# Look for packages that should not exist.
		if [[ $EXCLUDE_PKG != '' ]]; then
			PACKAGE_GREP=$(echo "$METEOR_LIST" | grep "$EXCLUDE_PKG")
			PACKAGE_GREP_RC=$? # 0 when package found, other values when not found.
			if [[ $PACKAGE_GREP_RC == 0 ]]; then
				printf 'App folder "%s" contains unwanted package "%s".' "$NAME" "$EXCLUDE_PKG"
				exit 1
			fi
		fi
		
		# Test building.
		METEOR_BUILD=$(meteor build .build 2>&1)
		METEOR_BUILD_RC=$? # 0 when success, other values when error.
		if [[ $METEOR_BUILD_RC != 0 ]]; then
			printf 'App folder "%s" contains an error that prevented building the app.' "$NAME"
			exit 1
		fi
	) || exit $?
done

echo 'Congratulations! All tests have passed!'
