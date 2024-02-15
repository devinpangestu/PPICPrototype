import multer from "multer";

const storage = multer.memoryStorage(); // Use memory storage for file buffer
const upload = multer({ storage });

export default upload;
