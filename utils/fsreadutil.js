function readToBuffer(filePath) {

    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'base64', (err, dataB64)=>{
            const imageBuffer = Buffer.from(dataB64, 'base64');
            console.log(dataB64.length, imageBuffer.length)
            if (err) {
                return reject(err)
            }
            
            return resolve(imageBuffer)
        })
    })
        
}


module.exports = readToBuffer;

