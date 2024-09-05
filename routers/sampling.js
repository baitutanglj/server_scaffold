const express = require('express')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const shortid = require('shortid');
const sd = require('silly-datetime');
const mkdirsSync = require('../public/javascripts/mkdirs')
const workerProcess = require('../public/javascripts/process')

router.get('/',function(req, res){
    var params = req.query
    console.log('params:'+JSON.stringify(params));
    var text = `运行完成，相关参数为:
        scaffold_smi:${params.scaffold_smi},
        decorator_type:${params.decorator_type},
        batch_size:${params.batch_size},
        num_randomized:${params.num_randomized},
        num_decorations:${params.num_decorations},
        ifOwnModel:${params.ifOwnModel}`

    if(params.ifOwnModel=='true'){
        var modelPath = params.modelPath
        extname = path.extname(params.modelPath)//.pt
        const modelname = path.basename(params.modelPath,extname)// OoDlbiSod_model.trained.22
        const basepath = path.dirname(params.modelPath)// /mnt/software/Website/Web_result/scaffold/20210323
        var dir = path.join(basepath,modelname+'_sampling')// /mnt/software/Website/Web_result/scaffold/20210323/OoDlbiSod_model.trained.22_sampling
        mkdirsSync(dir)
        var resultPath = path.join(dir,modelname+'_generated.csv')
        text = `${text},
         modelName:${path.basename(params.modelPath)},
         resultPath:${resultPath}`
        console.log(text);
    }else {
        var modelPath = `${process.cwd()}/models/scaffold/${params.selected_model}`
        const modelname = path.basename(params.selected_model,'.pt')
        const day = sd.format(new Date(),'YYYYMMDD')
        var dir = path.join("/mnt/software/Website/Web_result/scaffold",day,shortid.generate()+modelname+'_sampling')
        mkdirsSync(dir)
        var resultPath = `${dir}/${modelname}_generated.csv`
        text = `${text},
        modelName:${params.selected_model},
        resultPath:${resultPath}`
        console.log(text);
    }

    fs.writeFile(path.join(dir,'scaffold.smi'), params.scaffold_smi,err => {
        if (err){
            console.log(err);
        }
    });
    console.log("scaffold_smi data is saved.");

    var pid = workerProcess(`bash sampling.sh ${modelPath}\
    ${path.join(dir,'scaffold.smi')} ${params.decorator_type} ${params.batch_size}\
    ${params.num_randomized} ${params.num_decorations} ${resultPath}`,
        params.email,'Scaffold-Decorator sampling',text)

    res.send({pid:pid})
    // res.send({form:JSON.stringify(params)});

})
module.exports = router
