import { secret } from "../config/authConfig"
import * as jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token,
        secret,
        (err, decoded) => {
            if (err) {
                let msg:String = err?.message || "Unauthorized";
                return res.status(401).send({
                    message: msg,
                });
            }
            req.userId = decoded.id;
            next();
        });
};

export default verifyToken;