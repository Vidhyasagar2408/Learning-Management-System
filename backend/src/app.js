const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { corsOptions } = require('./config/security');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const subjectRoutes = require('./modules/subjects/subject.routes');
const videoRoutes = require('./modules/videos/video.routes');
const progressRoutes = require('./modules/progress/progress.routes');
const healthRoutes = require('./modules/health/health.routes');

const app = express();
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);

app.use(errorHandler);

module.exports = { app };