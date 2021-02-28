#!/usr/bin/env bash
set -ex
cd "$(dirname "${BASH_SOURCE[0]}" )"/..

VERSION=$(git describe --tags --always --first-parent)
DEST=build/docker

rm -rf $DEST
mkdir -p $DEST/self-server/var/conf

cp ./scripts/Dockerfile $DEST/
tar -xf "./recipe-example-server/build/distributions/self-server-*.tar" -C $DEST/self-server --strip-components=1
cp ./self-server/var/conf/recipes.yml $DEST/self-server/var/conf

cd $DEST
docker build -t "cbattarbee/self-server:$VERSION" .
docker tag "cbattarbee/self-server:$VERSION" "cbattarbee/self-server:latest"

