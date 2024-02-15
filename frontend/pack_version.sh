#!/bin/bash

if [ -z $1 ]; then
    printf 'Failed to pack version, Please set "version" as $1 with format {MAJOR}.{MINOR}.{PATCH}\n'
    exit
fi

rm -rf ./dist
rm -rf "bkp-approval-web$1.zip"
rsync -av --progress . ./dist --exclude /dist --exclude /node_modules --exclude /.git --exclude /pack_version.sh --exclude /build --exclude /*.zip

cd dist

zip -r "bkp-approval-web$1.zip" .

mv "bkp-approval-web$1.zip" ..

cd ..
