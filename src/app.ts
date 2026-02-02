import express from "express";
import cors from 'cors';
import { leadRouter } from "./routes/lead.route.js";


const app= express()

app.use(cors())


app.use(express.json())

app.use('/leads',leadRouter)

export default app;