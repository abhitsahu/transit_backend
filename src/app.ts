import express from 'express';
import session from 'express-session';
import cors from "cors"
import passport from './utils/passport';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/user/userRoutes';
import { setupSwagger } from "./swagger";
import errorHandler from './middlewares/errorHandler'; // Import the error handler
import { limiter } from './middlewares/rateLimiter';
import cabRoutes from './routes/cab/cabRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_APP_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_APP_URL);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});


// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser()); // Add cookie-parser middleware

// swagger ui
setupSwagger(app);

app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//integrated rate limiting
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cab', cabRoutes)

app.get('/', (req, res) => {
  res.send('hello Transit');
})

// Error handling middleware
app.use(errorHandler); // Use the error handler after all routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at ${process.env.BACKEND_URL}/api-docs`);
});
