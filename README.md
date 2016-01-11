# health.mate

Coordinator: node server.js

ip addr = 10.0.2.216 port 8080

Mongodb: sudo mongod --rest --replSet replicaSet --smallfiles

ip addr = 10.0.2.17,18,19 port 27017

Worker: DEBUG=nightmare xvfb-run --server-args="-screen 0 1024x768x24" node worker.js

ip addr = 10.0.2.125,160 port 8080

Master: node server.js

ip addr = 10.0.2.45,132,133 port 8080

WebServer: npm start

dns = http://ec2-52-70-104-231.compute-1.amazonaws.com/ (removed dns to stop aws charging me)
