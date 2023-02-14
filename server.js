import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import morgan from 'morgan'
import connectDB from './config/db.js'
import bodyParser from 'body-parser'
import cors from 'cors'
import cron from 'node-cron'
import mobileRoutes from './mobile/routes/mobileRoutes.js'
import adminRoutes from './admin/routes/adminRoutes.js'
import sellerRoutes from './seller/routes/sellerRoutes.js'
import handlebars from 'handlebars'
import * as fs from 'fs';
import { baseUrl, emailTempletsDir } from './config/constant.js'
import { commonSendMail, readHTMLFile, createEmailFile, adminEmail } from './config/mail.js'
const __dirname = path.resolve(path.dirname(''));
dotenv.config()
connectDB()
const app = express()
const router = express.Router()

app.use(cors())




if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
app.use(bodyParser.json());

app.use('/api', mobileRoutes)
/* app.use('/api/web', webRoutes)*/
app.use('/api/admin', adminRoutes) 
app.use('/api/seller', sellerRoutes) 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
})
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
const PORT = process.env.PORT || 5003

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
)

