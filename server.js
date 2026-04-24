const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cvRouter = require('./routes/routers')
const adminRouter = require('./routes/adminRouters')
const databaseConnect = require('./config/databaseConnect')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

// Trust proxy (important for Vercel / HTTPS) , Alhamdulillah
app.set("trust proxy", 1);

app.use(cors({
  origin: [
    "http://localhost:5173", // local frontend , if i comment this line then no issue will in deployee
    "https://profilegen-cv-maker-frontend.vercel.app" // deployed frontend
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use("/uploads", express.static("uploads"));
app.use('/', cvRouter);
app.use('/admin', adminRouter);

app.post('/test-body', (req, res) => {
  console.log('req.body:', req.body);
  res.json({ body: req.body });
});


// making connection with the server port by the env file 
const port = process.env.PORT || 3000;

// making connection with database 
databaseConnect();


app.use(errorHandler);

app.listen(port,()=>{
    console.log("Server running on port: ",port);
})
