import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const publicKey = fs.existsSync("/etc/secrets/public.key")
  ? fs.readFileSync("/etc/secrets/public.key", "utf8")
  : fs.readFileSync(
    path.join(process.cwd(), "src/keys", "public.key"),
    "utf8"
  );

export const verifyToken = (req, res, next) => {
  try {
    console.log("--verifyToken--");
    
    let token = req.cookies.sso_token;

    // If no token in cookies, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    });

    req.user = decoded; // store user data in request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
