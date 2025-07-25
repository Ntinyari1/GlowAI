import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes, registerErrorHandler } from "./routes.js";
// import { log } from "./vite";
function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [server] ${message}`);
}

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Set a permissive Content Security Policy for development (must be after CORS!)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "font-src 'self' https://fonts.gstatic.com https://cdn.mathpix.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.mathpix.com",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.mathpix.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "img-src 'self' data: https://*",
      "connect-src 'self'"
    ].join('; ')
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'public' directory
import path from 'path';
app.use(express.static(path.join(process.cwd(), 'public')));

app.use((req, res, next) => {
  const start = Date.now();
  const { path } = req;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(app);
  registerErrorHandler(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    // Do not throw the error after sending the response
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // await setupVite(app, app); // Disabled for production build
  } else {
    // serveStatic(app); // Disabled for production build
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  app.listen(port, '127.0.0.1', () => {
    log(`serving on http://127.0.0.1:${port}`);
  });
})();
