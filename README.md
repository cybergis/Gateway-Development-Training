# Stage 1 - Development Setup

## Goal

Understand how to setup the development environment for Meteor, what are the dependencies and how to use [Meteor CLI tool](http://docs.meteor.com/commandline.html).

## Submission

- Branch from `dev-env-setup` and name the new branch `"dev-env-setup__<name>"` where `<name>` is your name.
- Write your setup procedures in the file `setup.sh`.
    - We use a barebone Travis CI container to grade your submission. This `setup.sh` should contain necessary commands that install dependencies needed.
        - Assume the testing environment provides `curl` and GNU C++ compiler. But you can't use `sudo`.
        - If your OS has the dependencies but Travis CI doesn’t have, your submission will fail miserably. And you get an F until you figure out how to let Travis CI install everything needed.
    - The command you put in the `setup.sh` should be OS-agnostic: don’t put `apt-get install nodejs` there.
        - Hint: Meteor uses NodeJS
        - Hint: there is this [Node Version Manager](https://github.com/creationix/nvm) which can install multiple NodeJS versions without `sudo`.
- Create 2 Meteor apps at the root directory:
    - First one, using Meteor release `1.4.1`, named `"helloworld"`.
    - Second one, using Meteor release `1.3.5`, named `"legacyapp"`.
        - Make sure this app doesn't have the package `"autopublish"`.
- Create a Pull Request from your branch against `dev-env-setup`.

## Grading

***Your first submissions will always fail since the grading script is not up yet. Don’t worry. All the submissions will be re-evaluated once the grading script is up.***

- Branch exists and has good name.
- Pull Request exists and the Travis CI build passes. The build tests:
    - `setup.sh` installs necessary dependencies at their latest compatible versions.
    - Meteor app folders exist and each app has correct release version, packages and can be compiled.
