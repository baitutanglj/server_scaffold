const express = require('express')
const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const router = express.Router()
const mkdirsSync = require('../public/javascripts/mkdirs')
const workerProcess = require('../public/javascripts/process')

router.get('/',function(req, res){
    // res.header("Access-Control-Allow-Origin","http://localhost:8002")
    var params = req.query
    // console.log('params:'+JSON.stringify(params));
    extname = path.extname(params.dataPath)//.smi
    const dataname = path.basename(params.dataPath,extname)// WUtEwd7uO_chembl.validation
    const basepath = path.dirname(params.dataPath)// /mnt/software/Scaffold_result/20210315
    const dir = path.join(basepath,dataname+'_train')// /mnt/software/Scaffold_result/20210315/WUtEwd7uO_chembl.validation_train
    mkdirsSync(dir)
    // const step =  Math.ceil(params.epochs/params.save_every_n_epochs)*params.save_every_n_epochs
    const resultPath = path.join(dir,'models','model.trained.'+params.epochs+'.pt')///mnt/software/Website/Web_result/scaffold/20210315/WUtEwd7uO_chembl.validation_train/models/model.trained.100.pt
    // console.log(resultPath);
    try {
        fs.writeFileSync(path.join(dir,'conditions.json'), params.filterJson);
        console.log("JSON data is saved.");
    } catch (error) {
        console.log(error);
    }
    var text = `运行完成，相关参数为:
         dataName:${path.basename(params.dataPath)},
         max_cuts:${params.max_cuts},
         slice_type:${params.slice_type},
         decorator_type:${params.decorator_type},
         num_files:${params.num_files},
         embedding_size:${params.embedding_size},
         max_sequence_length:${params.max_sequence_length},
         dropout:${params.dropout},
         epochs:${params.epochs},
         save_every_n_epochs:${params.save_every_n_epochs},
         batch_szie:${params.batch_size}
         resultPath:${resultPath}`
    console.log(text);
    var pid = workerProcess(`bash train.sh ${params.dataPath}\
    ${params.max_cuts} ${params.slice_type} ${params.decorator_type}\
    ${params.num_files} ${params.embedding_size} ${params.max_sequence_length}\
    ${params.dropout} ${params.epochs} ${params.save_every_n_epochs}\
    ${params.batch_size} ${path.join(dir,'conditions.json')}\
    ${resultPath}`,
        params.email,'Scaffold-Decorator training',text)

    res.send({pid:pid})
    // res.send({form:params});

})
module.exports = router
