
# Librerias
import serial
import numpy as np
import time
import cv2
import json
from glob import glob

from Observer import Observer
from functions import ( getMetaDataDict , conver2Float, getInHH, calcDist)

# ---------------------------
# Configuraciones
# ---------------------------
# Rutas
outputDir		 	= 'imagenes/'
objetivosPathFile 	= 'imagenes/objetivos.json'

# Camara
capDispositivo 		= 1

# Configuracion GPS
gpsPort 	= '/dev/ttyACM0'    # GPS diferencial
# puertoGps = '/dev/rfcomm0'	# Bluetooth Moto e
gpsBaudrate = 19200

# Observer
# Tiempo entre intervalos del observer en segundos
timeBetweenChecks = 10


# ---------------------------
# Configuracion de camara
# ---------------------------
cap = cv2.VideoCapture(capDispositivo)

if (not cap.isOpened()):
	print("Error al abrir dispositivo", capDispositivo)
	
print("video capture abierto")
cap.set(cv2.CAP_PROP_BUFFERSIZE,1)


# ---------------------------
# Start GPS
# ---------------------------
# TODO: Revisar try exept
# try: #me fijo que no exista la variable del puerto
	# gps
# except:
	# try: #intento realizar la com
print('conectando GPS...')
gps = serial.Serial(gpsPort, gpsBaudrate)
	# except:#si no existe la variable y no puedo realizar la com hay un problema
		# serial.SerialException("no se pudo abrir y no esta abierto")

# ---------------------------
# Inicializacion de Observer
# --------------------------
PointList = None
observer = Observer()
observer.fileName = objetivosPathFile
observer.timeBetweenChecks = timeBetweenChecks	
observer.loadFile()

# Comenzar observer (opcional)
observer.start()

dictGps = {'lat':[], 'lon':[],'alt':[], 'tgps':[],'vgps':[], 'h':[], 'hdop':[],'tmaq':[],'dist':[]}

def checkForGpsMeas(gps):
	while gps.inWaiting():
		aux = gps.readline().rstrip().decode("utf-8").split(',')
		print(aux)
		if 'GGA' in aux[0] and aux[1]!='' :
			lastGpsTime = time.time()
			print('lastGpsTime: ', lastGpsTime)
			lat,lon = map(getInHH,(aux[2],aux[4]),(aux[3],aux[5]))
			print('GPS lat: ', lat, ' lon:', lon)
			[hdop,alt,h] = [ conver2Float(aux[i])  for i in [8,9,11] ]

			kval ={'lat':lat,'lon':lon,'alt':alt,'h':h,'hdop':hdop,
					  'tgps':lastGpsTime,'tmaq':time.time()}

			for key,val in kval.items():
				dictGps[key] = val

			return True
		if 'RMC' in aux[0]:
			aux[7] = '1.1'
			vel = conver2Float(aux[7])*1.852
			dictGps['vgps'] = vel
		return False

#
# Chequear que punto es el que esta mas cerca y dentro del rango
#
def checkIfPointInRange():
	global PointList
	distanceThresh = 100 #en metros
	nDist=1e6

	distanceThreshFoto = 10 # foto

	if observer.ndataFlag:
		PointList = observer.getData()
	if PointList is None:
		return False, None
	else:
		for point in PointList:
			distance = calcDist(point,dictGps['lat'],dictGps['lon']) # distancia calculada
			print('Distancia a objetivo: ', point['_id'], ' ', distance, ' metros')
			if distance < distanceThresh:
				if distance<nDist:
					nDist = distance # guarda dist actual
					npoint = point
		if nDist < distanceThreshFoto:
			return True, npoint
		else:
			return False, None


#
#
#  
def getPL():
	return PointList

# 
# 
# 
def getdictGps():
	return dictGps


# 
# 
# 
def takePhoto(point, cap):
	# if not mock:
	ret,frame = cap.read()#leo 2 veces porque el buffer es tamaño 1
	ret,frame = cap.read()
	if not ret:
		Exception('No Se pudo Capturar Imagen,saliendo...')
	# else:
		# q = np.random.randn(500,500,3)
		# frame = 255/2 * (q+q.transpose(1,0,2))
	tiempo = '-'.join([str(a) for a in time.localtime()[0:6]])

	fotosNames = glob(outputDir +point['_id']+'*.png')
	if len(fotosNames)>0:
		fotosNames.sort()
		lastPhotoIdx = int(fotosNames[-1].split('.')[0].split('-')[-1])

	else:
		lastPhotoIdx = -1
	idx = '-{:03d}'.format(lastPhotoIdx+1)
	# print('idx:', idx)
	lat = dictGps['lat']
	lon = dictGps['lon']
	metadata = getMetaDataDict(lon,lat,tiempo,**{'_id':point['_id']})

	# Archivo de imagen
	fileImage = outputDir+point['_id']+ idx+ '.png'
	
	# Archivo de metadata
	fileMetadata = outputDir+point['_id']+ idx+ '.json'
	print('Imagen generada:',fileImage )

	cv2.imwrite( fileImage , frame)
	with open( fileMetadata, 'w') as file:
		file.write(json.dumps(metadata))
		print('Archivo de metadata generado:',fileMetadata)


# --------------------------
# Chequeo de puntos
# --------------------------
i=1
while(True):
	if checkForGpsMeas(gps):
		i+=1
		print(i,sep=',')
		pointInRange,point = checkIfPointInRange()
		PointList = getPL()
		if pointInRange:
			print('Objetivo in range:', point['_id'])
			takePhoto(point, cap)
