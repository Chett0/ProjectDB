import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index';
import { globalErrorHandler } from './utils/middlewares/errors.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

const app = express();

app.use(cors({
	origin: 'http://localhost:4200',
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1', routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(globalErrorHandler);

export default app;
