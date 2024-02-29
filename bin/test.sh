#!/usr/bin/env bash

root=$(pwd)

# Global variables
USAGE="$(basename "$0") [-h] [-oc] [-k] [-w ${ALL_CONFIGS:1}]

where:
    -oc, --only-containers: Only start docker containers
    -sc, --stop-containers: Stop docker containers
    -k, --keep            : Keep Jest runing after the completion of the tests suites
    -c                    : Run tests with coverage
    -h, --help            : Show this help text
    --[a1] [a2]...        : Pass additional arguments to test script"
KEEP=0
FORCE_STOP_JEST='--forceExit'
ONLY_CONTAINERS=0
COMMAND_ARGS=''

function moveToTestDir {
  cd ${root}/tests
}

function moveToRootDir {
  cd ${root}
}

# Obtain options
while [ "$1" != "" ]; do
  case $1 in
    -oc | --only-containers )  ONLY_CONTAINERS=1
                          ;;
    -sc | --stop-containers )  STOP_CONTAINERS=1
                          ;;
    -k | --keep )         KEEP=1
                          ;;
    -c)                   shift
                          COMMAND_ARGS="${COMMAND_ARGS} --coverage"
                          ;;
    -h | --help )         echo "$USAGE"
                          exit
                          ;;
    --)                   shift
                          while [ "$1" != "" ]; do
                            COMMAND_ARGS="${COMMAND_ARGS} -- $1"
                            shift
                          done
                          ;;
    * )                   echo "$USAGE"
                          exit 1
  esac
  shift
done

# STOP_CONTAINERS is a final option
if [ "$STOP_CONTAINERS" -eq 1 ]; then
  echo 'Stopping Docker containers'
  moveToTestDir
  docker compose down
  exit 0
fi

# ONLY_CONTAINERS must be 1 and STOP must be 0
if [ $ONLY_CONTAINERS -eq 1 ] && [ "$STOP" -eq 1 ]; then
  echo 'Invalid options - when using option -oc, option -ns must be used as well'
  echo "$USAGE"
  exit 1
fi

echo 'Starting Docker containers'
moveToTestDir
docker compose up -d

if [ $ONLY_CONTAINERS -eq 1 ]; then
  exit 0
fi

# Run tests
echo 'Running tests'
moveToRootDir

if [ $KEEP -eq 0 ]; then
  FORCE_STOP_JEST=''
fi

yarn jest "$COMMAND_ARGS" $FORCE_STOP_JEST

if [ $KEEP -eq 0 ]; then
  # Stop Docker containers
  echo 'Stopping docker containers'
  moveToTestDir
  docker compose down
fi
