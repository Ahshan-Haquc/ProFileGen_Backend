const mongoose = require('mongoose');
const databaseConnect=async ()=>{
    await mongoose
    .connect(process.env.MONGO_ATLAS_URI_CONNECTION_STRING || 'mongodb://localhost:27017/CVgenerator', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    .then(()=>(console.log("Database connected with cloud")))
    .catch((err)=>(console.log("Not conneted with database.")));
}
module.exports=databaseConnect;