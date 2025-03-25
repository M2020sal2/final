import joi from "joi";
import { generalFields } from "../../middleware/validation";

// Validation Schema for Adding a Course
export const addCourseSchema = {
  body: joi
    .object({
      title: joi.string().trim().min(3).max(200).required(),
      subTitle: joi.string().trim().min(3).max(150).optional(),
      description: joi.string().trim().min(3).max(5000).allow(null, ""),
      price: joi.number().min(0).required(),
      access_type: joi.string().valid("free", "paid", "prime").required(),
      level: joi
        .string()
        .valid("beginner", "intermediate", "advanced")
        .required(),
      categoryId: generalFields._id.required(),
      requirements: joi
        .array()
        .items(joi.string().trim().min(2).max(150))
        .min(1)
        .max(20)
        .required(),
      learningPoints: joi
        .array()
        .items(joi.string().trim().min(2).max(150))
        .min(1)
        .max(20)
        .required(),
    })
    .required(),
};

// Validation Schema for Updating a Course
export const updateCourseSchema = {
  body: joi
    .object({
      title: joi.string().trim().min(3).max(200),
      description: joi.string().trim().min(3).max(5000).allow(null, ""),
      price: joi.number().min(0),
      access_type: joi.string().valid("free", "paid", "prime"),
      instructorId: generalFields._id,
    })
    .required(),
};

export const searchCoursesScheam = {
  query: joi
    .object({
      page: generalFields.page,
      size: generalFields.size,
      select: generalFields.select,
      search: generalFields.search,
    })
    .required(),
};

export const searchCoursesInstructorScheam = {
  query: joi
    .object({
      page: generalFields.page,
      size: generalFields.size,
      select: generalFields.select,
      search: generalFields.search,
      access_type: joi.string().valid("free", "paid", "prime").optional(),
    })
    .required(),
};

export const getCourseByIdSchema = {
  params: joi
    .object({
      id: generalFields._id.required(),
    })
    .required(),
};
