const express = require("express");
const app = express();
const ejs = require('ejs');
const fs = require('fs');
const multer = require("multer");
// import Tesseract from 'tesseract.js';
const { TesseractWorker } =require('tesseract.js');
const worker = new TesseractWorker();


app.set("view engine", 'ejs');
app.use(express.static(__dirname + '/public'));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage });


app.get('/', (req, res) => {

    res.render('index');
});

app.post('/upload', (req, res, next) => {

    // const file = req.file

    // if (!file) {
    //     const error = new Error('Please upload a file')
    //     error.httpStatusCode = 400
    //     return next(error)
    // }
    upload.single('file')(req, res, err => {
        fs.readFile('./uploads/' + req.file.originalname, (err, data) => {
            if (err) return console.log("err with file" + req.file.originalname, err);

            // console.log(data);

            worker
                .recognize(data,'eng',  {
                    'tessjs_create_pdf': '1',
                  })
                .progress((p) => {
                    console.log('progress', p);
                    // request.pipe(p.progress.toFixed(2));

                })
                .then((result) => {
                    // console.log(text);
                //    res.send(result.text);
                res.redirect('/download');
                })
                .finally(()=> worker.terminate());
        });
    });
    // res.send(file)
    // res.send("aaaaaaaaaaaaa");

});
// app.post('/upload',(req,res)=>{
//     consoe
//  res.send("sssssssss");
// });

app.get('/download',(req,res)=>{
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
    
});

var port = 5000 || process.env.port;
app.listen(port, () => console.log("app is runing on " + port)
)