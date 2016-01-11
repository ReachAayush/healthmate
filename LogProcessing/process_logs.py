from datetime import datetime

w1_file = open('logs/worker1.log')
w2_file = open('logs/worker2.log')
m_file = open('logs/master.log')
fe_file = open('logs/front_end.log')

w1_logs = [[] for i in xrange(0,20)]
w2_logs = [[] for i in xrange(0,20)]
m_logs = [[] for i in xrange(0,20)]
fe_logs = [[] for i in xrange(0,20)]

def sort_logs_by_reqid(log, file):
	for line in file:
		req_id = int(line.split()[5].split('=')[1])
		log[req_id] += [line]

# type is either w/ failover (1) or w/o failover (0) or w/ failover + scale (2)
def calc_times_by_reqid(req_id, type):
	w1 = w1_logs[req_id]
	w2 = w2_logs[req_id]
	m = m_logs[req_id]
	fe = fe_logs[req_id]
	descriptions = []
	if (type == 0):
		descriptions = ["fe to m", "m to w1", "w1 received from m", 
						"w1 finished", "m received from w1"]
		times = []

		print fe
		# Front end sends requests to master
		fe_to_m = fe[0].split()[1].replace(']','')
		print ("fe to m: %s" % fe_to_m)
		times += [fe_to_m]

		# Master recieves request from front end and sends to w1
		m_to_w1 = m[0].split()[1].replace(']','')
		print ("m to w1: %s" % m_to_w1)
		times += [m_to_w1]

		# w1 recieves request from master
		w1_rec = w1[0].split()[1].replace(']','')
		print ("w1 rec: %s" % w1_rec)
		times += [w1_rec]

		# w1 finishes scraping
		w1_done = w1[1].split()[1].replace(']','')
		print ("w1 done: %s" % w1_done)
		times += [w1_done]

		#master receives response from w1
		m_rec = m[1].split()[1].replace(']','')
		w1_status = m[1].split()[7]
		print ("m rec, %s: %s" % (w1_status,m_rec))
		times += [m_rec]

		return times
	elif (type == 1):
		descriptions = ["fe to m", "m to w1", "w1 received from m", 
						"w1 crashes...", "m detects w1 crash", "m to w2", 
						"w2 received from m", "w2 finished", "m recieved from w2"]
		times = []

		print fe
		# Front end sends requests to master
		fe_to_m = fe[0].split()[1].replace(']','')
		print ("fe to m: %s" % fe_to_m)
		times += [fe_to_m]

		# Master recieves request from front end and sends to w1
		m_to_w1 = m[0].split()[1].replace(']','')
		print ("m to w1: %s" % m_to_w1)
		times += [m_to_w1]

		print w1
		# w1 recieves request from master
		w1_rec = w1[0].split()[1].replace(']','')
		print ("w1 rec: %s" % w1_rec)
		times += [w1_rec]

		# w1 finishes scraping
		print ("w1 crashes ahhh...")
		times += ["crash time unknown"]

		# master detects w1 crash
		m_rec = m[1].split()[1].replace(']','')
		w1_status = m[1].split()[7]
		print ("m rec, %s: %s" % (w1_status,m_rec))
		times += [m_rec]

		# master sends to w2
		m_to_w2 = m[2].split()[1].replace(']','')
		print ("m to w2: %s" % m_to_w2)
		times += [m_to_w2]

		# w2 receives request from master
		w2_rec = w2[0].split()[1].replace(']','')
		print ("w2 rec: %s" % w2_rec)
		times += [w2_rec]

		# w2 finishes scraping
		w2_done = w2[1].split()[1].replace(']','')
		print ("w2 done: %s" % w2_done)
		times += [w2_done]

		# master recieves response from w2
		m_done = m[3].split()[1].replace(']','')
		print ("m receives from w2: %s" % m_done)
		times += [m_done]

		return times
	elif (type == 2):
		descriptions = ["fe to m", "m to w", "w received from m", 
						"w finished", "m received from w"]
		times = []

		print fe
		# Front end sends requests to master
		fe_to_m = fe[0].split()[1].replace(']','')
		print ("fe to m: %s" % fe_to_m)
		times += [fe_to_m]

		# Master recieves request from front end and sends to w1 or w2
		m_to_w = m[0].split()[1].replace(']','')
		print ("m to w: %s" % m_to_w)
		times += [m_to_w]

		# Determine which worker received it (1 or 2)
		w_id = m[0].split()[6][6]
		print ("req_id=%s +++++++ w_id=%s" % (req_id,w_id))

		worker = []
		if (w_id == '1'):
			worker = w1
		elif (w_id == '2'):
			worker = w2	

		# w recieves request from master
		w_rec = worker[0].split()[1].replace(']','')
		print ("w rec: %s" % w_rec)
		times += [w_rec]

		# w finishes scraping
		w_done = worker[1].split()[1].replace(']','')
		print ("w done: %s" % w_done)
		times += [w_done]

		#master receives response from w
		m_rec = m[1].split()[1].replace(']','')
		w_status = m[1].split()[7]
		print ("m rec, %s: %s" % (w_status,m_rec))
		times += [m_rec]

		return times

def calc_avg_times(times):
	avgs = [0 for i in xrange(0,len(times[0]))]
	for t in times:
		first_time = datetime.strptime(t[0],'%H:%M:%S.%f')
		for i in xrange(1,len(t)):
			current_time = datetime.strptime(t[i],'%H:%M:%S.%f')
			diff = (current_time - first_time).total_seconds() * 1000.0
			avgs[i] += diff
	for j in xrange(0,len(avgs)):
		avgs[j] = avgs[j] / len(times)
	return avgs

sort_logs_by_reqid(w1_logs, w1_file)
sort_logs_by_reqid(w2_logs, w2_file)
sort_logs_by_reqid(m_logs, m_file)
sort_logs_by_reqid(fe_logs, fe_file)

times = []
for i in xrange(0,20):
	times += [calc_times_by_reqid(i,2)]

print "avg times:"
print times

f = open('result.csv','w')
f.write("fe to m, m to w, w received from m, w finished, m received from w\n")
for t in times:
	for i in xrange(0,len(t)):
		f.write(t[i])
		if (i != len(t) - 1):
			f.write(', ')
		else:
			f.write('\n')
f.close()

#print calc_avg_times(times)
