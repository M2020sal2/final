import joi from "joi";
import { generalFields } from "../../middleware/validation";

export const addsectionSchema = {
  body: joi
    .object({
      title: joi.string().trim().min(3).max(100).required(),
      courseId: generalFields._id.required(),
      order: joi.number().min(0).max(100).optional(),
    })
    .required(),
};

export const searchSectionSchema = {
  query: joi
    .object({
      search: joi.string().trim().min(3).max(100).required(),
      page: generalFields.page,
      size: generalFields.size,
      select: generalFields.select,
      sort: generalFields.sort,
      courseId: generalFields._id.required(),
    })
    .required(),
};
