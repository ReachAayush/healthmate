date +%s.%N | tee -a worker_failure_times.txt
kill -9 $(lsof -i:8080 -t)
