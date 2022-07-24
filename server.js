import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./config/MongoDb.js";
import ImportData from "./Dataimport.js";
import productRoute from "./routes/ProductRoutes.js";
import { errorHandler, notFound } from "./middleware/Errors.js";
import userRouter from "./routes/UserRoutes.js";
import orderRouter from "./routes/OrderRoute.js";
import surveyRoute from "./routes/SurveyRoutes.js";


dotenv.config();
connectDatabase();
const app = express();
app.use(express.json());

//Api
app.use("/api/import",ImportData);
app.use("/api/services",productRoute);
app.use("/api/users",userRouter);
app.use("/api/orders",orderRouter);
app.use("/api/survey",surveyRoute);

//Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1000;

app.listen(PORT, console.log(`server running in port ${PORT}`),);