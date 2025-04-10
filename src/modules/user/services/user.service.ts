import { CustomError } from "./../../../utils/errorHandling";
import { NextFunction, Request, Response } from "express";
import { sanatizeUser } from "../../../utils/sanatize.data";
import userModel from "../../../DB/models/user.model";
import bcrypt, { compare } from "bcryptjs";
import { encrypt } from "../../../utils/crpto";

export const profile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    const user = req.user; 
    console.log("User object before sanitization:", user); 
    if (!user) {
      return next(new CustomError("user not found ERROR", 500));
    }
    
    return res.status(200).json({
      message: "user data fetched successfully",
      statusCode: 200,
      success: true,
      user: sanatizeUser(user),
    });
  } catch (error) {
    next(
      new CustomError(
        `Failed to fetch user profile: ${(error as Error).message}`,
        500
      )
    );
  }
};

export const instructors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const users = await userModel
      .find({ role: "instructor" })
      .select("-password -email")
      .populate("courses") 
      .lean();

    return res.status(200).json({
      message: "All instructors",
      status: "success",
      data: users,
    });
  } catch (error) {
    next(
      new CustomError(
        `Failed to fetch instructors: ${(error as Error).message}`,
        500
      )
    );
  }
};

export const getInstructorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const instructor = await userModel
      .findById(id)
      .select("-password -email")
      .populate({
        path: "courses",
        populate: {
          path: "categoryId",
        },
      })
      .lean();

    if (!instructor) {
      return next(new CustomError("Instructor not found", 404));
    }

    return res.status(200).json({
      message: "Instructor fetched successfully",
      statusCode: 200,
      success: true,
      instructor,
    });
  } catch (error) {
    return next(new CustomError(`Failed to fetch course: ${(error as Error).message}`, 500));
  }
};

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      next(new CustomError("No file uploaded", 400));
      return;
    }

    // const imagePath = req.file.path;
    const imagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;


    const userId = req.user?._id;
    if (!userId) {
      next(new CustomError("Unauthorized", 401));
      return;
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { avatar: imagePath },
      { new: true }
    );

    if (!user) {
      next(new CustomError("User not found", 404));
      return;
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      statusCode: 200,
      success: true,
      user: sanatizeUser(user)
    });
  } catch (error) {
    next(
      new CustomError(
        `Failed to add image: ${(error as Error).message}`,
        500
      )
    );
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return next(new CustomError("Unauthorized", 401));
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    const isMatch = await bcrypt.compare(currentPassword, String(user.password)
  );
    if (!isMatch) {
      return next(new CustomError("Current password is incorrect", 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
      statusCode: 200,
      success: true,
    });
  } catch (error) {
    next(
      new CustomError(
        `Failed to change password: ${(error as Error).message}`,
        500
      )
    );
  }
};

export const userProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = req.user;

    if (!user?._id) {
      return next(new CustomError("Unauthorized", 401));
    }

    const encryptedPhone = phone ? encrypt(phone, String(process.env.SECRETKEY_CRYPTO)) : undefined;

    const updateData: any = { firstName, lastName };
    if (encryptedPhone) updateData.phone = encryptedPhone;

    const updateUser = await userModel.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    );

    if (!updateUser) {
      return next(new CustomError("User not found during update", 404));
    }

    res.status(200).json({
      message: "User data updated successfully",
      statusCode: 200,
      success: true,
      user: sanatizeUser(updateUser),
    });
  } catch (error) {
    next(
      new CustomError(
        `Failed to update user profile: ${(error as Error).message}`,
        500
      )
    );
  }
};

export const instructorData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, phone, jobTitle } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return next(new CustomError("Unauthorized", 401));
    }

    const updateUser = await userModel.findByIdAndUpdate(
      userId,
      { firstName, lastName, phone, jobTitle },
      { new: true }
    );

    if (!updateUser) {
      return next(new CustomError("User not found during update", 404));
    }

     res.status(200).json({
      message: "User data updated successfully",
      statusCode: 200,
      success: true,
      user: sanatizeUser(updateUser),
    });
  } catch (error) {
    next(
      new CustomError(
        `Failed to update user profile: ${(error as Error).message}`,
        500
      )
    );
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return next(new CustomError("Unauthorized", 401));
    } 

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ status: "Something went wrong during db action" });
    } 
    
    if (user.role === "admin") {
      return res.status(403).json({ status: "Failed", message: "Admin accounts cannot be deleted" });
    }

    await userModel.findByIdAndDelete(userId);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ status: "success", data: "Account deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: "Failed", error: err });
  }
}

export const checkPass = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    const { password } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return next(new CustomError("Unauthorized", 401));
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ status: "Something went wrong during db action" });
    }

    const chkPassword: boolean = await compare(
      password,
      String(user.password)
    );

    if (!chkPassword) {
      return next(new CustomError("Invalid Password", 404));
    }

    return res.status(200).json({
      message: "Password is correct",
      success: true,
      statusCode: 200,
    });
  } catch (err) {
    return next(new CustomError(`Error checking password: ${(err as Error).message}`, 500));
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | any> => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logout successful",
      success: true,
      statusCode: 200,
    });
  } catch (err) {
    return next(new CustomError(`Logout failed: ${(err as Error).message}`, 500));
  }
};
