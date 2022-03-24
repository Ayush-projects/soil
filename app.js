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






app.get("/clear", (req,res)=>{
  let directory = "uploads"
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
  
    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      
      });
    }
  });
  res.send("Deleted")
})


 app.get("/colorPalette/:id", (req,res)=>{
     
         let imageName = req.params.id;
         
        let pythonProcess = spawn("python", ["Colorpalette.py",  __dirname + "/uploads/pre_" + imageName  + ".jpg"])
         let outputdata = ""

        pythonProcess.on("close", (data_d)=>{
             fs.writeFile(__dirname + "/uploads/colorPD_" + imageName +".txt", outputdata, (error, data)=>{
               if(error)
               {  console.log(error)
                res.json({message: error})
               }
              
               else
               {
                 res.json({redirect: "colorspace/" + imageName})
               }

             })
        })
        pythonProcess.on("error", (error)=>{
          console.log("Hello World")
        })
        pythonProcess.stdout.on("data", (data)=>{
           outputdata += data.toString()
        })
 })

 
 app.get("/colorSpace/:id", (req,res)=>{
   try{
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
}
catch(err)
{
  console.log(err)
}
})


 app.get("/api/:type/:fileName", (req,res)=>{


  let type = req.params.type;
  let fileName = req.params.fileName
      switch(type)
    {   
      case "file":
       return res.sendFile(__dirname + "/uploads/" + fileName + ".jpg")
        break;
      case "pre":
        return res.sendFile(__dirname +"/uploads/" + "pre_"+fileName +".jpg")
        break;
        case "colorp":
        return res.sendFile(__dirname +"/uploads/" + "colorP_pre_"+fileName + ".jpg")
        break;
        case "colorpd":
          fs.readFile(__dirname + "/uploads/" + "colorPD_" + fileName + ".txt", (error, data)=>{
            if(error)
            res.json({message: error})
            else
            res.json({message: data.toString()}) 
          })
         break;
         case "colortd":
          fs.readFile(__dirname + "/uploads/" + "colorTD_" + fileName + ".txt", (error, data)=>{
            if(error)
            res.json({message: error})
            else
            res.json({message: data.toString()}) 
          })
         break;
         case "colorsrgb":
         return res.sendFile(__dirname +"/uploads/" + "colorSRGB_pre_"+fileName + ".jpg")
        break;
          case "colorslab":
            return res.sendFile(__dirname +"/uploads/" + "colorSLAB_pre_"+fileName + ".jpg")
            break;
            case "colorshsv":
             return  res.sendFile(__dirname +"/uploads/" + "colorSHSV_pre_"+fileName + ".jpg")
              break;
              case "colorsxyz":
               return res.sendFile(__dirname +"/uploads/" + "colorSXYZ_pre_"+fileName + ".jpg")
                break;
                 case "colorsd":
                  fs.readFile(__dirname + "/uploads/" + "colorSD_" + fileName + ".txt", (error, data)=>{
                    if(error)
                    res.json({message: error})
                    else
                    return res.json({message: data.toString()}) 
                  })
                  break;
                  case "colorph":
                    fs.readFile(__dirname + "/uploads/" + "colorPHD_" + fileName + ".txt", (error, data)=>{
                      if(error)
                      res.json({message: error})
                      else
                      return res.json({message: data.toString()}) 
                    })
                    break;
                  case "colort":
               return res.sendFile(__dirname +"/uploads/" + "colorT_pre_"+fileName + ".jpg")
                break;

                
                
        

        
           

   }
 })


 app.get("/display/:id", (req,res)=>{
   let imageName = req.params.id;
   res.render("display", {imageName})
 })


 app.get("/ph/:id", (req,res)=>{
  let imageName = req.params.id;

 let pythonProcess = spawn("python", ["ph.py",  __dirname + "/uploads/pre_" + imageName  + ".jpg"])
  let outputdata = ""

 pythonProcess.on("close", (app)=>{
      fs.writeFile(__dirname + "/uploads/colorPHD_" + imageName +".txt", outputdata, (error, data)=>{
        if(error)
        {   console.log(error)
         res.json({message: error})
        }
       
        else
        {
          res.json({redirect: "ph/" + imageName})
        }

      })
 })
 pythonProcess.on("error", (err)=>{
   console.log(err)
 })
 pythonProcess.stdout.on("data", (data)=>{
    outputdata += data.toString()
 })
})
app.get("/texture/:id", (req,res)=>{
  let imageName = req.params.id;

 let pythonProcess = spawn("python", ["texture.py",  __dirname + "/uploads/pre_" + imageName  + ".jpg"])
  let outputdata = ""

 pythonProcess.on("close", (app)=>{
      fs.writeFile(__dirname + "/uploads/colorTD_" + imageName +".txt", outputdata, (error, data)=>{
        if(error)
        {   console.log(error)
         res.json({message: error})
        }
       
        else
        {
          res.json({redirect: "texture/" + imageName})
        }

      })
 })
 pythonProcess.on("error", (err)=>{
   console.log(err)
 })
 pythonProcess.stdout.on("data", (data)=>{
    outputdata += data.toString()
 })
})
 

 app.get('/loading3/:imgname', (req,res)=>{
  let imgName = req.params.imgname
  res.render("loading3" ,{imgName})
})
app.get('/loading4/:imgname', (req,res)=>{
  let imgName = req.params.imgname
  res.render("loading4" ,{imgName})
})
app.get("/output/:imgName", (req,res)=>{
  let imgName = req.params.imgName
  res.render("output", {imgName})
})


app.get("/delete/:img", (req,res)=>{
       let img = req.params.img;
       fs.unlink(__dirname + "/uploads/" + img + ".jpg", (err)=>{

       })
       fs.unlink(__dirname + "/uploads/pre_" + img + ".jpg", (err)=>{

      })
      fs.unlink(__dirname + "/uploads/colorP_pre_" + img + ".jpg", (err)=>{

      })
      fs.unlink(__dirname + "/uploads/colorPD_" + img + ".txt", (err)=>{
        // console.log(err)
      })
      fs.unlink(__dirname + "/uploads/colorPHD_" + img + ".txt", (err)=>{
        // console.log(err)
      })
      fs.unlink(__dirname + "/uploads/colorSD_" + img + ".txt", (err)=>{
        // console.log(err)
      })
      fs.unlink(__dirname + "/uploads/colorSHSV_pre_" + img + ".jpg", (err)=>{

      })
      fs.unlink(__dirname + "/uploads/colorSLAB_pre_" + img + ".jpg", (err)=>{

      })
      fs.unlink(__dirname + "/uploads/colorSRGB_pre_" + img + ".jpg", (err)=>{

      })
      fs.unlink(__dirname + "/uploads/colorSXYZ_pre_" + img + ".jpg", (err)=>{

      })
      fs.unlink(__dirname + "/uploads/colorT_pre_" + img + ".jpg", (err)=>{

      })
      fs.unlink(__dirname + "/uploads/colorTD_" + img + ".txt", (err)=>{
  //  console.log(err)
      })
      res.json({message: "Done"})

})
const PORT = process.env.PORT || 3000 ;
app.listen(PORT,e => console.log(`server is listening at http://localhost:${PORT}`));