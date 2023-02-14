import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import Seller from '../models/sellerModel.js'

const protect = asyncHandler(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.admin = await subAdmin.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      res.status(401)
      throw new Error('Not authorized, token failed')
    }
  }
  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

const admin = (req, res, next) => {
  console.log(req.admin)
  if (req.admin && req.admin.isActive) {
    next()
  } else {
    res.status(401)
    throw new Error('Not authorized as an admin')
  }
}

const userProduct = asyncHandler(async (req, res, next) => {

  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      res.status(401).json({ "message": "Not authorized, token failed" })
    }
  }
  if (!token) {
    res.status(401).json({ "message": "Not authorized, no token" })
  }
})

const sellerprotect = asyncHandler(async (req, res, next) => {

  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await Seller.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      res.status(401).json({ "message": "Not authorized, token failed" })
    }
  }
  if (!token) {
    res.status(401).json({ "message": "Not authorized, no token" })
  }
})

export {
  protect,
  admin,
  userProduct,
  sellerprotect
} 