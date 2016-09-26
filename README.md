# Stage 1 - Development Setup

## Goal

Understand how to setup the development environment for Meteor, what are the dependencies and how to use Meteor CLI tool.

## Submission

- Branch from `dev-env-setup` and name the new branch `"dev-env-setup__<name>"` where `<name>` is your name.
- Write your setup procedures in the file `setup.sh`.
- Create 2 Meteor apps at the root directory:
    - First one, using Meteor release `1.4.1`, named `"helloworld"`.
    - Second one, using Meteor release `1.3.5`, named `"legacyapp"`.
        - Make sure this app doesn't have the package `"autopublish"`.
- Create a Pull Request from your branch against `dev-env-setup`.

## Grading

- Branch exists and has good name.
- Pull Request exists and the Travis CI build passes. The build tests:
    - `setup.sh` installs necessary dependencies at their latest compatible versions.
    - Meteor app folders exist and each app has correct release version, packages and can be compiled.
