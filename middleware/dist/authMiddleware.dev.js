"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.admin = exports.protect = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _expressAsyncHandler = _interopRequireDefault(require("express-async-handler"));

var _adminUserModel = _interopRequireDefault(require("../admin/models/adminUserModel.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var protect = (0, _expressAsyncHandler["default"])(function _callee(req, res, next) {
  var token, decoded;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))) {
            _context.next = 15;
            break;
          }

          _context.prev = 1;
          token = req.headers.authorization.split(' ')[1];
          decoded = _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET);
          _context.next = 6;
          return regeneratorRuntime.awrap(_adminUserModel["default"].findById(decoded.id).select('-password'));

        case 6:
          req.user = _context.sent;
          next();
          _context.next = 15;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](1);
          console.error(_context.t0);
          res.status(401);
          throw new Error('Not authorized, token failed');

        case 15:
          if (token) {
            _context.next = 18;
            break;
          }

          res.status(401);
          throw new Error('Not authorized, no token');

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 10]]);
});
exports.protect = protect;

var admin = function admin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

exports.admin = admin;