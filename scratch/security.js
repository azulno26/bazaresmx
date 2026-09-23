"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
var crypto_1 = __importDefault(require("crypto"));
function generateToken(id, type, exp) {
    var secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret';
    var payload = "".concat(id, ":").concat(type, ":").concat(exp);
    var signature = crypto_1.default.createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return Buffer.from("".concat(payload, ":").concat(signature)).toString('base64url');
}
function verifyToken(tokenStr) {
    try {
        var secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret';
        var decoded = Buffer.from(tokenStr, 'base64url').toString('utf8');
        var parts = decoded.split(':');
        if (parts.length !== 4)
            return null;
        var id = parts[0], type = parts[1], expStr = parts[2], signature = parts[3];
        var exp = parseInt(expStr, 10);
        // Verify signature
        var payload = "".concat(id, ":").concat(type, ":").concat(expStr);
        var expectedSignature = crypto_1.default.createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        if (signature === expectedSignature) {
            if (type !== 'bazar' && type !== 'expositor')
                return null;
            return { id: id, type: type, exp: exp };
        }
    }
    catch (e) {
        return null;
    }
    return null;
}
