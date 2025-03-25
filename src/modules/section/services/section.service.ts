import { PipelineStage, Types } from "mongoose";
import { Request, Response, NextFunction } from "express";
import courseModel from "../../../DB/models/courses.model";
import { CustomError } from "../../../utils/errorHandling";
import { sectionModel } from "../../../DB/models/videos.model";
import ApiPipeline from "../../../utils/apiFeacture";
const allowFieldsSection = [
  "title",
  "order",
  "courseId",
  "courseId.title",
  "courseId.instructorId",
  "courseId.thumbnail",
  "courseId.price",
];
export const addSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, courseId } = req.body;
    const user = req.user;

    const course = await courseModel.findById(courseId);

    if (!course) {
      return next(new CustomError("Course not found", 404));
    }

    if (course.instructorId.toString() !== user?._id.toString()) {
      return next(
        new CustomError("You are not allowed to add section to this course", 403)
      );
    }

    const lastSection = await sectionModel.findOne({ courseId }).sort({ order: -1 });
    const nextOrder = (lastSection?.order || 0) + 1;

    const section = await sectionModel.create({ title, courseId, order: nextOrder });

    await courseModel.updateOne(
      { _id: courseId },
      { $inc: { totalSections: 1 } }
    );

    return res.status(201).json({
      message: "Section created successfully",
      section,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sectionId } = req.params;
    const { title } = req.body;
    const user = req.user;

    const section = await sectionModel.findById(sectionId);
    if (!section) return next(new CustomError("Section not found", 404));

    const course = await courseModel.findById(section.courseId);
    if (!course) return next(new CustomError("Course not found", 404));

    if (course.instructorId.toString() !== user?._id.toString()) {
      return next(
        new CustomError("You are not allowed to update this section", 403)
      );
    }

    const updatedSection = await sectionModel.findByIdAndUpdate(
      sectionId,
      { title },
      { new: true }
    );

    return res.status(200).json({
      message: "Section updated successfully",
      section: updatedSection,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sectionId } = req.params;
    const user = req.user;

    const section = await sectionModel.findById(sectionId);
    if (!section) return next(new CustomError("Section not found", 404));

    const course = await courseModel.findById(section.courseId);
    if (!course) return next(new CustomError("Course not found", 404));

    if (course.instructorId.toString() !== user?._id.toString()) {
      return next(
        new CustomError("You are not allowed to delete this section", 403)
      );
    }

    await sectionModel.findByIdAndDelete(sectionId);

    await courseModel.updateOne(
      { _id: section.courseId },
      { $inc: { totalSections: -1 } }
    );

    return res.status(200).json({
      message: "Section deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const getSections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;

    const sections = await sectionModel.find({ courseId });

    if (!sections || sections.length === 0) {
      return next(new CustomError("No sections found for this course", 404));
    }

    sections.sort((a, b) => Number(a.order) - Number(b.order));

    return res.status(200).json({
      message: "Sections fetched successfully",
      sections,
    });
  } catch (error) {
    return next(error);
  }
};

export const reorderSections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { updatedSections } = req.body;
    const user = req.user;

    if (!updatedSections || !Array.isArray(updatedSections) || updatedSections.length === 0) {
      return next(new CustomError("Provide an array of sections.", 400));
    }

    const firstSection = await sectionModel.findById(updatedSections[0]._id);
    if (!firstSection) return next(new CustomError("Section not found", 404));

    const course = await courseModel.findById(firstSection.courseId);
    if (!course) return next(new CustomError("Course not found", 404));

    if (course.instructorId.toString() !== user?._id.toString()) {
      return next(
        new CustomError("You are not allowed to reorder these sections", 403)
      );
    }

    const updatedSectionsList = await Promise.all(
      updatedSections.map((section: { _id: string }, index: number) =>
        sectionModel.findByIdAndUpdate(section._id, { order: index + 1 }, { new: true })
      )
    );

    return res.status(200).json({
      message: "Sections reordered successfully.",
      sections: updatedSectionsList
    });
  } catch (error) {
    return next(error);
  }
};

export const searchSectionBycourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { courseId } = req.query;
  const { page, size, select, search, sort } = req.query;
  const pipeline: PipelineStage[] = new ApiPipeline()
    .matchId({
      Id: courseId as unknown as Types.ObjectId,
      field: "courseId",
    })
    .paginate(Number(page), Number(size))
    .lookUp({
      as: "videos",
      from: "video",
      localField: "_id",
      foreignField: "sectionId",
    })
    .projection({
      select: select as string,
      allowFields: allowFieldsSection,
      defaultFields: ["title", "order", "courseId"],
    })
    .build();

  const sections = await sectionModel.aggregate(pipeline);

  return res.status(200).json({
    message: "Sections fetched successfully",
    sections,
  });
};
