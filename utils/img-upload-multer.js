// Function to handle file upload
async function uploadImage(formData, destination) {
    return new Promise(async (resolve, reject)=>{
    try {
      const multer = require('multer');
      const { customAlphabet } = await import('nanoid');
  
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, destination); // Destination folder passed as parameter
        },
        filename: function (req, file, cb) {
          let filename;
          if (file.originalname==="order.png") {
            const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
            const uniqueFilename = nanoid(); // Generate unique filename using nanoid
            const fileExtension = file.originalname.split('.').pop(); // Get file extension
            filename = uniqueFilename + '.' + fileExtension; // Unique filename with original file extension
          } else {
            filename = file.originalname;
          }
          cb(null, filename);
        }
      });
  
      const upload = multer({ storage: storage }).single('image');
  
      upload(formData, null, function (err) {
        if (err) {
          reject(err); // Reject if upload fails
        } else {
          resolve(formData.file.filename); // Resolve with the filename after successful upload
        }
      });
    } catch (error) {
      reject(error); // Reject if import fails
    }
}
    );
  }
  
  module.exports = uploadImage;
  