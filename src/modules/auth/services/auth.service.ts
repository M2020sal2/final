import { Request, Response, NextFunction } from "express";
import userModel from "../../../DB/models/user.model";
import { CustomError } from "../../../utils/errorHandling";
import bcrypt, { compare } from "bcryptjs";
import { sanatizeUser } from "../../../utils/sanatize.data";
import { TokenService } from "../../../utils/tokens";
import { TokenConfigration, SALT_ROUND } from "../../../config/env";
import emailQueue from "../../../utils/email.Queue";
import { v4 as uuidv4 } from "uuid";
import { cokkiesOptions } from "../../../utils/cookies";
import fs from 'fs';
import path from 'path';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  const { firstName, lastName, email, password, role } = req.body;

  const chkemail = await userModel.findOne({ email }).select("email");
  if (chkemail) return next(new CustomError("Email is Already Exist", 404));

  const hashpassword = await bcrypt.hash(password, Number(SALT_ROUND));

  const result = new userModel({
    firstName,
    lastName,
    email,
    password: hashpassword,
    role
  });

  const response = await result.save();
  if (!response) return next(new CustomError("Something went wrong!", 500));

  const token = new TokenService(
    String(TokenConfigration.ACCESS_TOKEN_SECRET),
    String(TokenConfigration.ACCESS_EXPIRE)
  ).generateToken({
    userId: response._id,
    role: response.role,
  });
  const link = `${req.protocol}://${req.headers.host}/api/v1/auth/confirm/email/${token}`;

  const emailTemplatePath = path.join(__dirname, "./emailTemplates/email.html");
  let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
  emailTemplate = emailTemplate.replace("{{link}}", link);

  await emailQueue.add(
    {
      to: response.email,
      subject: "Verify your email",
      text: "Welcome to Mentora! 🎉",
      html: emailTemplate,
      message: "Mentora",
    },
    { attempts: 1, backoff: 5000, removeOnComplete: true, removeOnFail: true }
  );

  return res.status(201).json({
    message: "Please check your email for verification",
    success: true,
    statusCode: 201,
    user: sanatizeUser(response),
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  const { email, password } = req.body;

  const findUser = await userModel
    .findOne({ email })
    .select("firstName lastName email password role avatar isConfirmed")
    .lean();

  if (!findUser) return next(new CustomError("Invalid Email or Password", 404));

  const chkPassword: boolean = await compare(
    password,
    String(findUser.password)
  );

  if (!chkPassword)
    return next(new CustomError("Invalid Email or Password", 404));

  if (findUser.isConfirmed == false) {
    return next(new CustomError("Please confirm your Email", 400));
  }
  // access Token
  const accessToken = new TokenService(
    String(TokenConfigration.ACCESS_TOKEN_SECRET),
    String(TokenConfigration.ACCESS_EXPIRE)
  ).generateToken({
    userId: findUser._id,
    role: findUser.role,
  });

  // Refresh Token
  const refreshToken = new TokenService(
    String(TokenConfigration.REFRESH_TOKEN_SECRET),
    String(TokenConfigration.REFRESH_EXPIRE)
  ).generateToken({
    userId: findUser._id,
    role: findUser.role,
  });

  res.cookie(
    "accessToken",
    `${process.env.ACCESS_TOKEN_START_WITH}${accessToken}`,
    cokkiesOptions(3600000)
  );

  res.cookie("refreshToken", refreshToken, cokkiesOptions(7 * 24 * 3600000));
  return res.status(200).json({
    message: "Login successful",
    success: true,
    statusCode: 200,
    user: sanatizeUser(findUser),
  });
};

export const confirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    const { userId } = new TokenService(
      String(TokenConfigration.ACCESS_TOKEN_SECRET)
    ).verifyToken(token);

    if (!userId) {
      return res.sendFile(
        path.join(__dirname, "./emailTemplates/email-failed.html")
      );
    }

    const user = await userModel.findById(userId).select("isConfirmed");

    if (!user) {
      return res.sendFile(
        path.join(__dirname, "./emailTemplates/email-failed.html")
      );
    }

    // If the email is already confirmed
    if (user.isConfirmed) {
      return res.redirect("http://localhost:5173/login"); 
    }

    const updateUser = await userModel
      .findByIdAndUpdate(
        userId,
        { $set: { isConfirmed: true } },
        { new: true }
      )
      .select("firstName lastName email isConfirmed role")
      .lean();

    if (!updateUser) {
      return res.sendFile(
        path.join(__dirname, "./emailTemplates/email-failed.html")
      );
    }

    return res.sendFile(
      path.join(__dirname, "./emailTemplates/email-success.html")
    );
  } catch (error: any) {
    res.status(500).json({
      message: "catch error",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const sendCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new CustomError("Email is required", 400));
    }

    const user = await userModel.findOne({ email }).select("email");

    if (!user) {
      return next(new CustomError("You have to register first", 404));
    }

    const generateOTP = () => {
      const uuid = uuidv4().replace(/\D/g, "").slice(0, 8);
      return uuid;
    };

    const OTPCode = generateOTP();

    await userModel.findByIdAndUpdate(user._id, { code: OTPCode });

    const emailTemplatePath = path.join(__dirname, "./emailTemplates/email-code.html");
    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
    emailTemplate = emailTemplate.replace(/{{code}}/g, OTPCode);

    await emailQueue.add(
      {
        to: user.email,
        subject: "Password Reset Request",
        text: "Here is your password reset code",
        html: emailTemplate,
        message: "Mentora",
      },
      { attempts: 1, backoff: 5000, removeOnComplete: true, removeOnFail: true }
    );

    return res.status(200).json({
      message: "Please check your email for a message with your code",
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    return next(new CustomError(`Failed to send code: ${(error as Error).message}`, 500));
  }
};

export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, code, password } = req.body;

    if (!code || code === null || code === undefined) {
      return next(new CustomError("Code is required and cannot be null", 400));
    }

    const user = await userModel.findOne({ email, code });

    if (!user) {
      return next(new CustomError("Email or code is not valid", 400));
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(SALT_ROUND)
    );

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { 
        $unset: { code: "" },
        password: hashedPassword 
      },
      { new: true }
    );
    

    if (!updatedUser) {
      return next(new CustomError("Failed to update password", 500));
    }

    res.status(200).json({
      message: "Password changed successfully",
      success: true,
      statusCode: 200,
      user: updatedUser,
    });
  } catch (error) {
    return next(new CustomError(`Failed to reset password: ${(error as Error).message}`, 500));
  }
};


