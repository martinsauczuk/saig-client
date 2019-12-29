import json
import os
import time
from datetime import datetime
from threading import Timer


class Observer(object):
	"""Checks periodically if new data in file objetivos.
	if new data sets ndataFlag to True, when read sets it to false.
	to read: Observer.getData

	"""
	def __init__(self):
		self.timeBetweenChecks 	= 10	# Tiempo entre intervalos del observer en segundos
		self.lastMod 			= 0
		self.lastRead 			= 0
		self.ndataFlag 			= False
		self.is_running 		= False
		self.fileName  			= ''

	def checkLastMod(self):
		return os.path.getmtime(self.fileName)


	def checkForNewData(self):
		print('Chequeando fecha de modificacion de objetivos.json', datetime.today() )
		self.stop()
		self.start()
		if self.checkLastMod()> self.lastMod :
			print('Archivo modificado recientemente: ', self.lastMod)
			with open(self.fileName) as fil:
				self.loadFile()
		# print(self.data)
	def getData(self):
		self.ndataFlag = False
		return self.data

	def start(self):
		# print('Starting observer', datetime.today() )
		if self.is_running:
			Warning("It's alredy running")
		else:
			self._timer = Timer(self.timeBetweenChecks,
								self.checkForNewData)
			self._timer.start()
			self.is_running = True
		
 		# print(self.data)
	def stop(self):
		self._timer.cancel()
		self.is_running = False

	def loadFile(self):
		with open(self.fileName) as fil:
			print('Cargando objetivos en memoria...')
			self.data = json.load(fil)
			self.lastMod 	= self.checkLastMod()
			self.ndataFlag 	= True
