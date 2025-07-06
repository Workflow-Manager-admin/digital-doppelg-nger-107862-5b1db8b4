#!/bin/bash
cd /home/kavia/workspace/code-generation/digital-doppelg-nger-107862-5b1db8b4/internet_ego_mirror_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

