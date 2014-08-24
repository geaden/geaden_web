#!/bin/bash
export PORT=9000
export API_PORT=7000
dev_appserver.py --clear_datastore --port $PORT --api_port $API_PORT app.yaml
