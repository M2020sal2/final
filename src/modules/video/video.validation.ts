import joi from "joi";
import { generalFields } from "../../middleware/validation";
export const addvideoSchema = {
  body: joi
    .object({
      title: joi.string().required(),
      sectionId: generalFields._id.required(),
    })
    .required(),
};
