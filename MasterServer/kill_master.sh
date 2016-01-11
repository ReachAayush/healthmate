date +%s.%N | tee -a master_failure_times.txt
kill -9 $(lsof -i:8080 -t)
