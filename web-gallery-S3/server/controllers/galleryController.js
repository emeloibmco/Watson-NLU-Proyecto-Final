var galleryController = function(title) {

    //Carga de modulos
    var AWS = require('ibm-cos-sdk');
    var util = require('util');
    const sleep = util.promisify(setTimeout);
    var multer = require('multer');
    var multerS3 = require('multer-s3');
    var ejs = require('ejs');
    var myBucket = 'bucketdemo';
    var status = '';
    const IBMCloudEnv = require("ibm-cloud-env");
    IBMCloudEnv.init();
    const s3function = require('./S3Functions');
    const request = require('request-promise');
    var datareq;

    //Credenciales del servicio de object storage
    var config = {
        endpoint: IBMCloudEnv.getString("cos_endpoint"),
        apiKeyId: IBMCloudEnv.getString("cos_api_key"),
        ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
        serviceInstanceId: IBMCloudEnv.getString("cos_service_instance_id"),
        credentials: new AWS.Credentials(IBMCloudEnv.getString("access_key_id"), IBMCloudEnv.getString("secret_access_key"), sessionToken = null),
        signatureVersion: 'v4'
    };

    var s3 = new AWS.S3(config);
    var imageUrlList = new Array();
    var imageUrlListRecycle = new Array();
    var imageName = new Array();
    var namedel = '';
    var nameproject = '';
    var fecha = new Date();

    var downGralleryImages = async function(req, res){
        console.log('Contenido del forulario '+req.body.name_asset);
        console.log('id del proyecto '+ req.params.id);
        var data = await s3.getSignedUrl('getObject',{Bucket: `project${req.params.id}`, Key: req.body.name_asset});
        console.log(data);
        res.json(`${data}`);
    }

   function uploadFile(req,res){
    s3function.s3uploadFile(description,req);
}

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: myBucket,
            key: function (req, file, cb) {
                cb(null, file.originalname);
            }
        })
    });

    var deleteDocTrash = async function(req, res){
        namedel = req.body.name_asset;
        id = req.params.id;
        id_asset = req.body.id_asset;
        console.log(req.body);
        console.log(req.params);
        await s3function.deleteItem('papelerademo',namedel);
        res.redirect('/gallery');
    }

    var restoreFile = async function(req, res){
        namedel = req.body.name_asset;
        id = req.params.id;
        id_asset = req.body.id_asset;
        console.log(req.body);
        console.log(req.params);
        await s3function.copyItem(`project${id}`,`trash${id}`,namedel);
        await s3function.deleteItem(`trash${id}`,namedel);
        await request.put({url:`http://localhost:4000/Assets/${id}`, form:{status: "true", id_asset: id_asset}}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('delete failed:', err);
        }
        console.log('Update successful!:', body);
        });
        res.redirect('/gallery');
    }

    var pruebafile = function(req, res, next){
        console.log('recibiendo file');
        s3function.uploadOnBucket('bucketdemo',req,res);
    }
    
    //Obtener los objetos del ICOS
    var getGalleryImages = function (req, res) {
        var params = {Bucket: myBucket};
        imageUrlList=[];
        s3.listObjects(params, function (err, data) {
            if(data) {
                var bucketContents = data.Contents;
                for (var i = 0; i < bucketContents.length; i++) {
                        console.log(bucketContents[i].Key);
                        var urlParams = {Bucket: myBucket, Key: bucketContents[i].Key};
                        var url = s3.getSignedUrl('getObject', urlParams);
                        imageUrlList[i] = url;  
                        imageName[i]=bucketContents[i].Key;        
                }
            }
            res.render('galleryView', {
                title: title,
                imageUrls: imageUrlList,
                imageNames: imageName
            });
        });
    };

    var GalleryRecycle = function (req, res) {
        console.log('Papelera de reciclaje ejecutandose');
        imageUrlListRecycle=[];
        s3.listObjects({Bucket: "papelerademo"}, function (err, data) {
            if(data) {
                var bucketContents = data.Contents;
                for (var i = 0; i < bucketContents.length; i++) {
                        var urlParams = {Bucket: "papelerademo", Key: bucketContents[i].Key};
                        var url = s3.getSignedUrl('getObject', urlParams);
                        imageUrlListRecycle[i] = url;  
                        imageName[i]=bucketContents[i].Key;
                        console.log(imageUrlListRecycle);     
                }
            }
            res.render('galleryRecycle', {
                title: title,
                imageUrls: imageUrlListRecycle,
                imageNames: imageName
            });
        });
    };

    var delGralleryImages =  async function(req, res){
        namedel = req.body.nameKey;
        id = req.params.id;
        id_asset = req.body.id_asset;
        console.log(req);
        console.log(req.params);
        await s3function.copyItem('papelerademo','bucketdemo',namedel);
        await s3function.deleteItem('bucketdemo',namedel);
        sleep(200);
        res.redirect('/gallery');
    }

    var delDocTrash = function(req, res){
        namedel = req.body.nameKey;
        console.log(namedel);
        s3function.deleteItem("papelerademo",namedel);
        res.redirect('/recyclebin');
    }

    var crearproyecto = async function(req,res){
        request.post({url:'http://localhost:4000/New-Project', form:{name_project: req.body.name_project, description: req.body.description}}).promise()
        .then(async function (body) {
            nameproject = body;
            console.log('El id del proyecto es' +nameproject)
            await s3function.createBucket('project'+nameproject);
            await s3function.createBucket('trash'+nameproject);
            //Crear registro del proyecto de la dB
            res.send("peticion realizada");
        })
        .catch(function (err) {
            // Request failed due to technical reasons...
        });
        //nameproject = req.body.name.toLowerCase();
        //nameproject = nameproject.replace(/ /g, '');
    }

    return {
        getGalleryImages: getGalleryImages,
        upload: upload,
        uploadFile, uploadFile,
        delGralleryImages, delGralleryImages,
        downGralleryImages, downGralleryImages,
        GalleryRecycle, GalleryRecycle,
        delDocTrash, delDocTrash,
        crearproyecto, crearproyecto,
        pruebafile, pruebafile,
        restoreFile, restoreFile,
        deleteDocTrash, deleteDocTrash


    };
};

module.exports = galleryController;
