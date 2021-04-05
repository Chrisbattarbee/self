#!/usr/bin/env bash
set -ex
cd "$(dirname "${BASH_SOURCE[0]}" )"/../..

VERSION=$(git describe --tags --always --first-parent)
DEST=build/docker-self-magritte

rm -rf $DEST
mkdir -p $DEST/self-magritte/bin

cp ./scripts/self-magritte/Dockerfile $DEST/
cp ./self-magritte/build/self-magritte $DEST/self-magritte/bin/self-magritte
cp ./self-magritte/build/jefit_extractor.js $DEST/self-magritte/bin/jefit_extractor.js

cd $DEST
docker build -t "chrisbattarbee/self-magritte:$VERSION" .
docker tag "chrisbattarbee/self-magritte:$VERSION" "chrisbattarbee/self-magritte:latest"
docker push chrisbattarbee/self-magritte:latest
