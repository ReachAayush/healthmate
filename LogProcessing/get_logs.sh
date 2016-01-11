scp -i Biometer.pem ec2-user@52.70.104.231:~/biometer/FrontEnd/logs/front_end.log logs/front_end.log
scp -i Biometer.pem ec2-user@52.70.73.26:logs/master.log logs/master.log
scp -i Biometer.pem ec2-user@52.70.73.26:logs/worker1.log logs/worker1.log
scp -i Biometer.pem ec2-user@52.70.73.26:logs/worker2.log logs/worker2.log
scp -i Biometer.pem ec2-user@52.70.73.26:logs/worker_failure_times.txt logs/worker_failure_times.txt
