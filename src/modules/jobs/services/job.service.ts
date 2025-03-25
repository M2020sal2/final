import { Request, Response, NextFunction } from "express";
import jobModel from "../../../DB/models/job.model";
import { CustomError } from "../../../utils/errorHandling";

  export const addJob = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { title } = req.body;

      const jobTitle = await jobModel.findOne({ title: { $regex: new RegExp(`^${title}$`, "i") } }).select("title");
        if (jobTitle) return next(new CustomError("Job Title is Already Exist", 404));
  
      const newJob = new jobModel({ title });
      const savedJob = await newJob.save();
  
      return res.status(201).json({
        message: "Job added successfully",
        statusCode: 201,
        success: true,
        category: savedJob,
      });
    } catch (error) {
      return next(new CustomError(`Failed to add job: ${(error as Error).message}`, 500));
    }
  };
  
  export const getAllJobs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const courses = await jobModel.find().lean();
  
      return res.status(200).json({
        message: "Jobs fetched successfully",
        statusCode: 200,
        success: true,
        courses,
      });
    } catch (error) {
      return next(new CustomError(`Failed to fetch jobs: ${(error as Error).message}`, 500));
    }
  };

  export const updateJob = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { title } = req.body;
      const { jobId } = req.params;
  
      if (!jobId) {
        return next(new CustomError("Job ID is required", 400));
      }
  
      const existingJob = await jobModel.findOne({ 
        title: { $regex: new RegExp(`^${title}$`, "i") } 
      });
  
      if (existingJob && existingJob._id.toString() !== jobId) {
        return next(new CustomError("Job Title already exists", 404));
      }
  
      const updatedJob = await jobModel.findByIdAndUpdate(
        jobId,
        { title },
        { new: true }
      );
  
      if (!updatedJob) {
        return next(new CustomError("Job not found", 404));
      }
  
      return res.status(200).json({
        message: "Job updated successfully",
        statusCode: 200,
        success: true,
        job: updatedJob,
      });
    } catch (error) {
      return next(new CustomError(`Failed to update job: ${(error as Error).message}`, 500));
    }
  };

  export const deleteJob = async ( 
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { jobId } = req.params;
  
      if (!jobId) {
        return next(new CustomError("Job ID is required", 400));
      }
  
      const deletedJob = await jobModel.findByIdAndDelete(jobId);
  
      if (!deletedJob) {
        return next(new CustomError("Job not found", 404));
      }
  
      return res.status(200).json({
        message: "Job deleted successfully",
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      return next(new CustomError(`Failed to delete job: ${(error as Error).message}`, 500));
    }
  };
  
  
