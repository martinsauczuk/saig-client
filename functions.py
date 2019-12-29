#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Nov 12 15:07:17 2019

Utils!


@author: ulises
"""

import numpy as np
import json
#import serial
import cv2
import time
from Observer import Observer
# from glob import glob


def getMetaDataDict(lon,lat,timestamp,**kwargs):
	metadata = { 'geo':{} }
	metadata['geo']['coordinates'] = [lon,lat]
	metadata['geo']['type'] = 'Point'
	metadata['timestamp'] = timestamp
	for key, value in kwargs.items():
		metadata[key] = value
	return metadata



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

def calcDist(point,lat,lon):
	plon, plat = point['geo']['coordinates']
	"""Ellipsoidal Earth projected to a plane
	The FCC prescribes the following formulae for distances not exceeding 475 kilometres (295 mi):[2]"""
	deltaLat = lat-plat
	mlat = (lat-plat)/2
	deltaLon = lon-plon

	mlaR = np.deg2rad(mlat)
	k1 = 111.13209- 0.56605*np.cos(2*mlaR)  +  0.00012*np.cos(4*mlaR)
	k2 = 111.41513*np.cos(mlaR)  -  0.09455*np.cos(3*mlaR)  +   0.00012*np.cos(5*mlaR)
	dx = k2 *deltaLon  *1000 #from km to m
	dy = k1 *deltaLat  *1000
	return pow(dx**2 +dy**2,0.5)
