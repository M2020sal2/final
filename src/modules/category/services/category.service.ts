import { Request, Response, NextFunction } from "express";
import categoryModel from "../../../DB/models/category.model";
import { CustomError } from "../../../utils/errorHandling";

  export const addCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { title } = req.body;
      if (!title || !req.file) {
        return next(new CustomError("Missing required fields", 400));
      }
  
      const thumbnail = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  
      const newCategory = new categoryModel({ title, thumbnail });
      const savedCategory = await newCategory.save();
  
      return res.status(201).json({
        message: "Category added successfully",
        statusCode: 201,
        success: true,
        category: savedCategory,
      });
    } catch (error) {
      return next(new CustomError(`Failed to add category: ${(error as Error).message}`, 500));
    }
  };

  export const getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const courses = await categoryModel.find().lean();
  
      return res.status(200).json({
        message: "Categories fetched successfully",
        statusCode: 200,
        success: true,
        courses,
      });
    } catch (error) {
      return next(new CustomError(`Failed to fetch categories: ${(error as Error).message}`, 500));
    }
  };

  export const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { title } = req.body;
      const { categoryId } = req.params;
  
      if (!categoryId) {
        return next(new CustomError("Category ID is required", 400));
      }
  
      const updateData: any = { title };
      
      if (req.file) {
        updateData.thumbnail = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      }
  
      const updatedCategory = await categoryModel.findByIdAndUpdate(categoryId, updateData, { new: true });
  
      if (!updatedCategory) {
        return next(new CustomError("Category not found", 404));
      }
  
      return res.status(200).json({
        message: "Category updated successfully",
        statusCode: 200,
        success: true,
        category: updatedCategory,
      });
    } catch (error) {
      return next(new CustomError(`Failed to update category: ${(error as Error).message}`, 500));
    }
  };
  
  export const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { categoryId } = req.params;
  
      if (!categoryId) {
        return next(new CustomError("Category ID is required", 400));
      }
  
      const deletedCategory = await categoryModel.findByIdAndDelete(categoryId);
  
      if (!deletedCategory) {
        return next(new CustomError("Category not found", 404));
      }
  
      return res.status(200).json({
        message: "Category deleted successfully",
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      return next(new CustomError(`Failed to delete category: ${(error as Error).message}`, 500));
    }
  };
  








