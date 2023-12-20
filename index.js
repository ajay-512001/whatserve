const qrCode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia, Buttons, List } = require('whatsapp-web.js');
const express = require('express')
const app = express()
const cors = require('cors');
const axios = require('axios');
const { exec } = require('child_process');
require('dotenv').config();
var QRCode = require('qrcode');


var server;
let qrcodeimagebasse64;
let isDisconnect = true;

const port = process.env.PORT || 9698;
const api_secret_key = process.env.API_SECRET_KEY;
const maxLengthNumber = process.env.MAX_LENGTH_NUMBER || 9;

// get session if already scanned.
const client = new Client({
    authStrategy: new LocalAuth()
});

// client will iniitialize.
client.initialize();

// if session not available than generate qr code.
client.on('qr', async (qr) => {
  console.log('QR Code generated. Scan it with the WhatsApp app.');
  server = app.listen(port, ()=> {
    console.log(`Node API app is running on port ${port}`)
  });
  qrCodeString = qr;
  qrCode.generate(qr, {small: true});
  generateQR(qr);
});



const generateQR = async (qr) => {
  try {
    qrcodeimagebasse64 = await QRCode.toDataURL(qr);
    //console.log(qrcodeimagebasse64);
  } catch (err) {
    console.error(err)
  }
}

// as soon as we scanned and if is authenticate than start api node server.
client.on('ready', () => {
  if(server != undefined && typeof server != undefined){
    server.close(() => console.log(`Server closed!`))
  }
  qrcodeimagebasse64 = "";
  isDisconnect = false;
  console.log('Client is ready!');
  server = app.listen(port, ()=> {
    console.log(`Node API app is running on port ${port}`)
  });
});


client.on("message", message => {
//client.sendMessage(message.from , "This is Automated messaging service. If any query than please contact to *castrolprotect.id@joinparrot.com*.");
if(message.body === "restart9698" && message.from === '918591855531@c.us'){
  restartTerminal(message.from,message._data.notifyName);  
}

if(message.body === "Kill9698" && message.from === '918591855531@c.us'){
  killterminal();
}
})


const killterminal = () => {
  exec('taskkill /F /IM node.exe', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
    }else{
      console.log(`Terminal closed: ${stdout}`);
    }
});
};


const restartTerminal = (from,notifyName) => {
  //const filePath = 'C:/Users/ajayk/OneDrive/Desktop/PocWhat/index.js';
  const filePath = 'index.js';
  const fileContent = `//service was restarted by ${from} with Notify Name ${notifyName}.`;

  const command =  `@echo ${fileContent} >> ${filePath} 2> nul`;
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error('Error saving file:', err);
    } else {
      console.log('File saved successfully:', filePath);
    }
  }); 
};


client.on("disconnected", (reason) => {
  console.log('Reason:', reason);
  isDisconnect = true;
});

client.on("auth_failure", (message) => {
  console.log('Reason:', message);
});

process.on('exit', (code) => {
  console.log(`Process exited with code ${code}`);
  from = "crashed";
  notifyName = "crashed";
  console.log(isDisconnect);
  if(!isDisconnect){
    restartTerminal(from,notifyName);
  }
});

//////////////////////// api section //////////////////////

// cors defined 
// const corsOptions ={
//   origin:'*', 
//   credentials:true,            //access-control-allow-credentials:true
//   optionSuccessStatus:200
// }
// app.use(cors(corsOptions));
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" )
//     next();
//   });

// app will use express.json defined

app.use(express.json())
app.use(express.urlencoded({extended: false}))

// function for authentication

const authentication = (req,res,next) =>{
  const apikey = req.header('x-api-key');

  if(!apikey || apikey != api_secret_key){
    return res.status(401).json({message:"Unauthorized"})
  }else if(isDisconnect){
    console.log(isDisconnect)
    return res.status(606).json({message:"client is disconnect"})
  }else{ 
    next();
  }
}
// actual api

// api for send text

app.post('/sendTextMsg', authentication ,async(req, res) => {debugger
    if(req.body != undefined && req.body != null){
      if(req.body.number != null && req.body.number != undefined && req.body.number != ""){
        req.body.number = req.body.number.replaceAll('+','');
      }
    }
    console.log(req.body)
    try {
      if(req.body != undefined && req.body != null){
        if(req.body.number != null && req.body.number != undefined && req.body.number != "" && req.body.number.length >= maxLengthNumber && req.body.msg != null && req.body.msg != undefined && req.body.msg != ""){
          req.body.number = req.body.number + "@c.us";
          client.sendMessage(req.body.number, req.body.msg);
          res.status(200).json({data:req.body , isComplete : true , description: "success"});
        }else if((req.body.number == null || req.body.number == undefined || req.body.number == "" || req.body.number.length < maxLengthNumber) && (req.body.msg != "" && req.body.msg != undefined && req.body.msg != null)){
          if(req.body.number != null && req.body.number != undefined && req.body.number != "" && req.body.number.length < maxLengthNumber){
            res.status(320).json({data:req.body , isComplete : false , description: "The given number's length is invalid."});
          }
          else{
            res.status(300).json({data:req.body , isComplete : false , description: "The given number is invalid."});
          }
        }else if((req.body.msg == null || req.body.msg == undefined || req.body.msg == "") && (req.body.number != null && req.body.number != undefined && req.body.number != "" && req.body.number.length >= maxLengthNumber)){
          res.status(400).json({data:req.body , isComplete : false , description: "The given message is invalid."});
        }
        else{
          res.status(440).json({data:req.body , isComplete : false , description: "The given number and message are invalid."});
        }
      }
      else{
        res.status(420).json({data:req.body , isComplete : false , description: "number and msg not available."});
      }
  } catch (error) {
      res.status(500).json({message: error.message})
  }
})


// api for send multimedia

app.post('/sendMultimedia',authentication, async(req, res) => {
  if(req.body != undefined && req.body != null){
    if(req.body.number != null && req.body.number != undefined && req.body.number != ""){
      req.body.number = req.body.number.replaceAll('+','');
    }
    if(req.body.caption == null || req.body.caption == undefined || req.body.caption == ""){
      req.body.caption = "This is your Policy Document and it is valid till 1 month from date of policy purchase."
    }
  }
  console.log(req.body);
  try {
    if(req.body != undefined && req.body != null){
      if(req.body.number != null && req.body.number != undefined && req.body.number != "" && req.body.number.length >= maxLengthNumber && req.body.file_path != null && req.body.file_path != undefined && req.body.file_path != ""){
        req.body.number = req.body.number + "@c.us";
        const media = await MessageMedia.fromUrl(req.body.file_path);
        const response = await axios.get(req.body.file_path, { responseType: 'arraybuffer' });
        if(response.data!= undefined && response.data != null){
          const pdfBase64 = Buffer.from(response.data).toString('base64');
          const fileSize = response.data.byteLength;
          if(pdfBase64 != null && pdfBase64 != undefined){
            media.data = pdfBase64;
          }
          if(fileSize != undefined && fileSize != null){
            media.filesize = fileSize;
          }
        }
        //const media = await MessageMedia.fromFilePath(req.body.file_path);
        client.sendMessage(req.body.number, media, {caption:req.body.caption});
        res.status(200).json({data:req.body , isComplete : true , description: "success"});
      }else if((req.body.number == null || req.body.number == undefined || req.body.number == "" || req.body.number.length < maxLengthNumber) && (req.body.file_path != "" && req.body.file_path != undefined && req.body.file_path != null)){
        if(req.body.number != null && req.body.number != undefined && req.body.number != "" && req.body.number.length < maxLengthNumber){
          res.status(320).json({data:req.body , isComplete : false , description: "The given number's length is invalid."});
        }
        else{
          res.status(300).json({data:req.body , isComplete : false , description: "The given number is invalid."});
        }
      }else if((req.body.file_path == null || req.body.file_path == undefined || req.body.file_path == "") && (req.body.number != null && req.body.number != undefined && req.body.number != "" && req.body.number.length >= maxLengthNumber)){
        res.status(400).json({data:req.body , isComplete : false , description: "The Document link is not given."});
      }
      else{
        res.status(440).json({data:req.body , isComplete : false , description: "The given number and documnent link are invalid."});
      }
  }
  else{
    res.status(420).json({data:req.body , isComplete : false , description: "Number and Documnent link not available."});
  }
}
catch (error) {
    res.status(500).json({message: error.message})
}
})

//////////////////////// beta mode api /////////////////

app.get('/genQR', (req,res) => {
  if(qrcodeimagebasse64 != undefined && qrcodeimagebasse64 != null && qrcodeimagebasse64 !=""){
    res.status(200).json({data: qrcodeimagebasse64, isComplete : true , description: "success"});
  }else{
    res.status(300).json({data: qrcodeimagebasse64, isComplete : true , description: "Clien is already reaady or it is already authenticated."});
  }
})

app.get('/restartService' ,async(req, res) => {
  const filePath = 'C:/Users/ajayk/OneDrive/Desktop/PocWhat/index.js';
  const fileContent = '//service was restarted by API ';

  const command =  `@echo ${fileContent} >> ${filePath} 2> nul`;
  exec(command, (err, stdout, stderr) => {
    if (err) {
      res.status(440).json({data: err, isComplete : true , description: "success"});
      console.error('Error saving file:', err);
    } else {
      res.status(200).json({data: {fileContent,filePath}, isComplete : true , description: "success"});
      //console.log('File saved successfully:', filePath);
    }
  }); 
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// app.get('/getstatus', authentication , (req,res) => { 
//   let state = client.getState();
//   state.then((result) => {
//     let status11 = result;
//     res.status(200).json({data:status11 , isComplete : true , description: "success"});
//   });
// })

// app.get('/whastSend', (req, res) => {
//   client.sendMessage("916353642971@c.us", 'hi this is test msg from api');
//   res.send('Hello Blog, My name is Devtamin');
// })

// app.get('/genQR', (req,res) => { 
//   client.on('qr', async (qr) => {
//     res.send(qr);
// });
// })

//const media = MessageMedia.fromFilePath('C:/Users/ajayk/OneDrive/Desktop/next-js-ebook.pdf');

// const productsList = new List(
//     "Here's our list of products at 50% off",
//     "View all products",
//     [
//       {
//         title: "Products list",
//         footer:"fselect",
//         rows: [
//           { id: "apple", title: "Apple" },
//           { id: "mango", title: "Mango" },
//           { id: "banana", title: "Banana" },
//         ],
//       },
//     ],
//     "Please select a product"
//   );

  // let button = new Buttons('Button body', [{ body: 'bt1' }, { body: 'bt2' }, { body: 'bt3' }], 'title', 'footer');
  // let sections = [{ title: 'sectionTitle', rows: [{ title: 'ListItem1', description: 'desc' }, { title: 'ListItem2' }] }];
  // let list = new List('List body', 'btnText', sections, 'Title', 'footer');




// client.on("message", message => {
//     console.log(message);
//     // client.sendMessage(message.from, productsList);
//     // client.sendMessage(message.from, button);
//     // client.sendMessage(message.from, list);
//     if(message.type === 'list_response'){
//         message.reply(`You've selected ${message.body}`);
//     }
//     client.sendMessage(message.from, 'hi this is test msg');
//     client.sendMessage(message.from,media);
// });
//service was restarted by API  
