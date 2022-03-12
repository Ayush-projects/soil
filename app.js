const express = require('express');
const path = require('path');
const app = express();
const multer = require('multer');
const uuid = require('uuid');
const fs = require('fs');
const {spawn} = require("child_process");
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"));



app.get("/", (req,res)=>{
  res.render("index")
})


app.get("/processing/:id", (req,res)=>{
  res.render("processing" ,{imageName: req.params.id})
})

app.get('/loading1/:imgname', (req,res)=>{
  let imgName = req.params.imgname
  res.render("loading1" ,{imgName})
})

app.get('/loading2/:imgname', (req,res)=>{
  let imgName = req.params.imgname
  res.render("loading2" ,{imgName})
})


app.post('/profile', function (req, res, next) {
    const storage = multer.diskStorage({
  
  destination: function (req, file, cb) {
    cb(null, __dirname+'/uploads')
  },

  filename: function (req, file, cb) {


    //console.log(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }

})





//const upload = multer({ storage: storage}).array("avatar",2); // name of the file.. you can also set array and its size here
// you can validate your files here
const upload = multer({ storage: storage, limits: {fileSize : 10 * 1024 * 1024},
  fileFilter: (req, file, cb) =>{
    if(file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg'){
      cb(null, true);
    }else{
      cb(null, false);
      const err = new Error();
      err.name = "ExtensionError";
      err.message = 'Only .png, .jpg, jpeg format allowed';
      return cb(err);
    }
  }

}).single("avatar");



upload(req, res, function (err) {
// console.log("hasnain",req.file);
  if (err) {
   console.log("err",err);
   res.json({err});
   return
  }
    //console.log("file uploaded")
    
    const filename = req.file.filename;
    const new_file_name = uuid.v4();
    fs.rename(__dirname + "/uploads/"  + filename,  __dirname + "/uploads/" + new_file_name + ".jpg", (err)=>{
      if(err)
      console.log(err)
      else
     {
      let pre_process_process = spawn("python", ["CLAHE.py",  __dirname + "/uploads/" +new_file_name  + ".jpg"])

      pre_process_process.on('error', ()=>{
        if(error)
        console.log(error);
      })
       
      pre_process_process.on('exit', ()=>{
       // console.log("Process exit")
      })
      pre_process_process.on('close', ()=>{
        res.status(200).json({code: 200, redirect: new_file_name});
      })
      pre_process_process.stdout.on('data', (data)=>{
        console.log(data.toString())
      })

        




    
     }

    } )




  
  

})

  })
  

 app.get("/getPreprocessedImage/:image", (req,res)=>{
      let file_name = req.params.image;
      res.sendFile(__dirname + "/uploads/" + "pre_"+ file_name +".jpg")
 }) 


 app.get("/colorPalette/:id", (req,res)=>{
         let imageName = req.params.id;
       
        let pythonProcess = spawn("python", ["Colorpalette.py",  __dirname + "/uploads/pre_" + imageName  + ".jpg"])
         let outputdata = ""

        pythonProcess.on("close", (app)=>{
             fs.writeFile(__dirname + "/uploads/colorPD_" + imageName +".txt", outputdata, (error, data)=>{
               if(error)
               {   console.log(error)
                res.json({message: error})
               }
              
               else
               {
                 res.json({redirect: "colorspace/" + imageName})
               }

             })
        })
        pythonProcess.on("error", (err)=>{
          console.log(error)
        })
        pythonProcess.stdout.on("data", (data)=>{
           outputdata += data.toString()
        })
 })

 
 app.get("/colorSpace/:id", (req,res)=>{
  let imageName = req.params.id;

 let pythonProcess = spawn("python", ["ColorSpace.py",  __dirname + "/uploads/pre_" + imageName  + ".jpg"])
  let outputdata = ""

 pythonProcess.on("close", (app)=>{
      fs.writeFile(__dirname + "/uploads/colorSD_" + imageName +".txt", outputdata, (error, data)=>{
        if(error)
        {   console.log(error)
         res.json({message: error})
        }
       
        else
        {
          res.json({redirect: "colorspace/" + imageName})
        }

      })
 })
 pythonProcess.on("error", (err)=>{
   console.log(error)
 })
 pythonProcess.stdout.on("data", (data)=>{
    outputdata += data.toString()
 })
})


 app.get("/api/:type/:fileName", (req,res)=>{


  let type = req.params.type;
  let fileName = req.params.fileName
      switch(type)
    {   
      case "file":
        res.sendFile(__dirname + "/uploads/" + fileName + ".jpg")
        break;
      case "pre":
        res.sendFile(__dirname +"/uploads/" + "pre_"+fileName +".jpg")
        break;
        case "colorp":
        res.sendFile(__dirname +"/uploads/" + "colorP_pre_"+fileName + ".jpg")
        break;
        case "colorpd":
          fs.readFile(__dirname + "/uploads/" + "colorPD_" + fileName + ".txt", (error, data)=>{
            if(error)
            res.json({message: error})
            else
            res.json({message: data.toString()}) 
          })
         break;
         case "colorsrgb":
          res.sendFile(__dirname +"/uploads/" + "colorSRGB_pre_"+fileName + ".jpg")
          break;
          case "colorslab":
            res.sendFile(__dirname +"/uploads/" + "colorSLAB_pre_"+fileName + ".jpg")
            break;
            case "colorshsv":
              res.sendFile(__dirname +"/uploads/" + "colorSHSV_pre_"+fileName + ".jpg")
              break;
              case "colorsxyz":
                res.sendFile(__dirname +"/uploads/" + "colorSXYZ_pre_"+fileName + ".jpg")
                break;
                 case "colorsd":
                  fs.readFile(__dirname + "/uploads/" + "colorSD_" + fileName + ".txt", (error, data)=>{
                    if(error)
                    res.json({message: error})
                    else
                    res.json({message: data.toString()}) 
                  })

                 break;
                
        

        
           

   }
 })


 app.get("/display/:id", (req,res)=>{
   let imageName = req.params.id;
   res.render("display", {imageName})
 })
 

app.get("/color") 


const PORT = process.env.PORT || 3000 ;
app.listen(PORT,e => console.log(`server is listening at http://localhost:${PORT}`));