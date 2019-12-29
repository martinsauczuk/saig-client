# -----------------------------
# Prueba de conectividad de GPS
# -----------------------------

import serial
import time

puertoGps 	= '/dev/rfcomm0'	# Bluetooth Moto e
velGps 		= 19200
print('Intentando conexion...')
try: #intento realizar la com
	print('gps')
	gps = serial.Serial(puertoGps, velGps)
except:#si no existe la variable y no puedo realizar la com hay un problema
	serial.SerialException("no se pudo abrir y no esta abierto")
print('1gps in waiting...', gps)

def conver2Float(val):
	try:
		return float(val)
	except:
		return val


def getInHH(val,hemis):
	ll = conver2Float(val)
	s = -1 if hemis =='S' or hemis =='W' else 1 #defino signo 
	ll = (np.floor(ll/100)+(ll%100)/60)*s
	return ll

while gps.inWaiting():
	print('gps in waiting...')
	aux = gps.readline().rstrip().decode("utf-8").split(',')
	print(aux)
	# if 'GGA' in aux[0] and aux[1]!='' :
	# 	lastGpsTime = time.time()
	# 	lat,lon = map(getInHH,(aux[2],aux[4]),(aux[3],aux[5]))

	# 	[hdop,alt,h] = [ conver2Float(aux[i])  for i in [8,9,11] ]

	# 	kval ={'lat':lat,'lon':lon,'alt':alt,'h':h,'hdop':hdop,
	# 				  'tgps':lastGpsTime,'tmaq':time.time()}

	# 	for key,val in kval.items():
	# 		dictGps[key] = val
	# 		# return True

	# 	if 'GGA' in aux[0] and aux[1]=='' : #mocking
	# 		lastGpsTime = time.time()

	# 		lat,lon = map(getInHH,('3433.26','5855.8'),('S','W'))
	# 		aux[8] = '1.1'

	# 		aux[9] = '10'
	# 		aux[10] = '10'
	# 		[hdop,alt,h] = [ conver2Float(aux[i])  for i in [8,9,11] ]

	# 		kval ={'lat':lat,'lon':lon,'alt':alt,'h':h,'hdop':hdop,
	# 				  'tgps':lastGpsTime,'tmaq':time.time()}

	# 		for key,val in kval.items():
	# 			dictGps[key] = val
	# 		# return True

	# 	if 'RMC' in aux[0]:
	# 		aux[7] = '1.1'
	# 		vel = conver2Float(aux[7])*1.852
	# 		dictGps['vgps'] = vel
	# 	# return False





