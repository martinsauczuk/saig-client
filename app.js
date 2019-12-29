const cron = require('node-cron');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const logger = require('./logger/logger');
const superagent = require('superagent');
const {spawn} = require('child_process');


/**
 * Parametros
 */
const directoryPath = path.join(__dirname, 'imagenes');
const extensionesImagen = ['.png', '.jpg', '.jpeg', '.gif'];
const objetivosPathFile  = path.join(__dirname, 'imagenes/objetivos.json');
const pythonAppPathFile  = path.join(__dirname, 'app.py');
const urlHealthCheck = 'http://localhost:3000'
// const urlHealthCheck = 'http://google.com';
const urlGetObjetivos = 'http://localhost:3000/objetivos';
const urlUpload = 'http://localhost:3000/upload';

var pythonApp = null;


/**
 * Iniciar python App
 * 
 */
function startPythonApp(){

  pythonApp = spawn('python3', ["-u", pythonAppPathFile]);

  // print output of script
  pythonApp.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  pythonApp.stderr.on('data', (data) => {
    console.log(data.toString());
    
  });
  pythonApp.on('close', () => {
    logger.error("Python app Closed");
  });

}
// const pythonApp = runScript()




/**
 * Cron para subida de archivos y actualizacion de objetivos.json
 */
cron.schedule('*/20 * * * * *', () => {

  logger.info('Cron running...');
  checkConection();

});

/**
 * Devuelve true si hay conexion
 */
function checkConection() {

  logger.info(`Chequeando conexion a ${urlHealthCheck}...`)
  superagent
    .get(urlHealthCheck)
    .end((err, res ) => {
      
      if(err) {
        logger.info(`Sin conexion con ${urlHealthCheck}`);

        startPythonApp();
        return
      }

      if (res.statusCode == 200) {
        logger.info('Unidad autonoma online, saig-server disponible');
        
        if(pythonApp) {
          pythonApp.kill();
          pythonApp = null;
        }
        
        scanUpload();
        getObjetivos();
      }
    });
}



/**
 * Obtener objetivos desde servidor y actualizar archivo
 */
function getObjetivos() {

  logger.info('Consultando a server objetivos (GET)');
  superagent
    .get(urlGetObjetivos)
    .set('accept', 'json')
    .end((err, res) => {

      if (err) {
        logger.error('Error en GET objetivos:', err)
        return;
      }
            
      let data = JSON.stringify(res.body);
      logger.info('Objetivos obtenidos ', data);

      fs.writeFile( objetivosPathFile, data, (err) => {
        
        if (err) {
          logger.error(`Error al escribir archivo: ${objetivosPathFile}`, err)
          return;
        }

        logger.info(`Archivo ${objetivosPathFile} guardado ok`);
      });

    });

}

/**
 * Funcion que lee el directorio. Lista los archivos y los envía
 * al server
 */
function scanUpload() {
  
  /**
  * Leer directorio de imagenes, listar archivos, filtar imagenes.
  */
  fs.readdir(directoryPath, function (err, files) {

    logger.info(`Leyendo ${directoryPath}...`)
    if (err) {
      return logger.error(`Unable to scan directory: ${err}`);
    }
    
    logger.info(`Encontrados: ${files.length} archivos. Lista: ${files}`);
    

    const imageFiles = files.filter( file =>  extensionesImagen.indexOf( path.extname(file).toLowerCase() ) >= 0);
    logger.info(`Archivos de imagen encontrados: ${imageFiles.length}. Lista: ${imageFiles}`);
    

    // imageFiles.forEach(filename => {
    //   upload(filename);

    // });
    imageFiles.reduce( (promise, file) => {
      
      return promise.then( () => uploadPromise(file) )
    
    }, Promise.resolve() );

  });
}


function logFilePromise(filename) {

  return new Promise((resolve, reject) => {
    console.log('filename', filename);
    
    setTimeout( resolve, 500);

  });
}

// 192.168.43.189
//-34.70656966666666  lon: -58.27903383333334


/**
 * Subir archivo
 */
function uploadPromise(imageFile) {

  return new Promise( (resolve, reject) => {
    const pathImagen =  `${directoryPath}/${imageFile}`;
    const objetivoId = imageFile.split('-')[0];
    const pathMetadata = `${directoryPath}/${path.basename(pathImagen, path.extname(pathImagen))}.json`;

    logger.info(`Buscando archivo con metadata: ${pathMetadata}`);
    // try {
    //   if (fs.existsSync(pathMetadata)) {
    //     logger.info(`Archivo encontrado: ${pathMetadata}`);
    //   } else {
    //     logger.info(`Archivo NO encontrado: ${pathMetadata}`);
    //     return;
    //   }
    // } catch (err) {
    //   logger.error(`Error al buscar archivo ${pathMetadata}, error: ${err}`);
    //   return;
    // }
    
    logger.info('Preparando form...');
    logger.info('SAIG upload imagen file:' + pathImagen);
    logger.info('SAIG upload metadata file:' + pathMetadata);
    logger.info('SAIG upload objetivoId:', objetivoId );

    const form = new FormData();
    form.append('vehiculoId', '4of984o2209r498eru' );
    // form.append('metadata', fs.createReadStream(pathImagen));
    // form.append('metadata', 'info no clasificada');
    form.append('imagen', fs.createReadStream(pathImagen));
    // form.append('objetivoId', objetivoId);
    form.append('objetivoId', '5df261cc246a3409ee605981');
    form.submit(urlUpload, (err, res ) => {
  
      if (err) {
        logger.error('error', err);
        return null
      }

      logger.info(`Respuesta server ${res.statusCode} ${res.statusMessage}`);
        
      // res.setEncoding('utf8');
      // res.on('data', (chunk) => console.log('Response body: ', chunk ));

      if (res.statusCode == 200) {
        logger.info(`objetivoId: ${objetivoId} upload OK`);

        fs.unlink(pathImagen, (err) => {
          if (err) {
            logger.error(`Error al eliminar archivo ${pathImagen}. Error: ${err}`);
          }
          resolve();
        });
        // fs.unlink(pathMetadata, (err) => {
        //   if (err) {
        //     logger.error(`Error al eliminar archivo ${pathMetadata}. Error: ${err}`);
        //   }
        // });
      }
    });
  });
}


/**
 * Subir archivo
 */
function upload(imageFile) {

  const pathImagen =  `${directoryPath}/${imageFile}`;
  const objetivoId = imageFile.split('-')[0];
  const pathMetadata = `${directoryPath}/${path.basename(pathImagen, path.extname(pathImagen))}.json`;

  // const pathMetadata = pathImagen;

  logger.info(`Buscando archivo con metadata: ${pathMetadata}`);
  // try {
  //   if (fs.existsSync(pathMetadata)) {
  //     logger.info(`Archivo encontrado: ${pathMetadata}`);
  //   } else {
  //     logger.info(`Archivo NO encontrado: ${pathMetadata}`);
  //     return;
  //   }
  // } catch (err) {
  //   logger.error(`Error al buscar archivo ${pathMetadata}, error: ${err}`);
  //   return;
  // }
  
    logger.info('Preparando form...');
    logger.info('SAIG upload imagen file:' + pathImagen);
    logger.info('SAIG upload metadata file:' + pathMetadata);
    logger.info('SAIG upload objetivoId:', objetivoId );

    const form = new FormData();
    form.append('vehiculoId', '4of984o2209r498eru' );
    // form.append('metadata', fs.createReadStream(pathImagen));
    // form.append('metadata', 'info no clasificada');
    form.append('imagen', fs.createReadStream(pathImagen));
    // form.append('objetivoId', objetivoId);
    form.append('objetivoId', '5df261cc246a3409ee605981');
    form.submit('http://localhost:3000/upload', function (err, res ) {
 
      if (err) {
        console.log('error', err);
        return null
      }

      console.log('Respuesta statusCode: ', res.statusCode);
      console.log('Respuesta statusMessage: ', res.statusMessage );
      
      // res.setEncoding('utf8');
      // res.on('data', (chunk) => console.log('Response body: ', chunk ));

      if (res.statusCode == 200) {

        logger.info(`objetivoId: ${objetivoId} upload OK`);

        fs.unlink(pathImagen, (err) => {
          if (err) {
            logger.error(`Error al eliminar archivo ${pathImagen}. Error: ${err}`);
          }
        });

        // fs.unlink(pathMetadata, (err) => {
        //   if (err) {
        //     logger.error(`Error al eliminar archivo ${pathMetadata}. Error: ${err}`);
        //   }
        // });
      }

    });
}