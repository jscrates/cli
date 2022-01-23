#!/bin/bash

ENTRY_POINT=jscrates.js
OUT_DIR=bin
JS_OUT_FILE=jscrates.cjs

npx esbuild $ENTRY_POINT --bundle --minify --platform=node --outfile=$OUT_DIR/$JS_OUT_FILE &&
npx pkg $OUT_DIR/$JS_OUT_FILE --out-path $OUT_DIR
