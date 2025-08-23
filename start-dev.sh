#!/bin/bash
cd /Users/kr/fntp-nutrition-system
export NODE_ENV=development
npm run dev 2>&1 | tee dev-server.log &
echo "Server starting... Check dev-server.log for output"
sleep 5
tail -20 dev-server.log
